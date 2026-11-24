#!/usr/bin/env node
// Optional infrastructure checks. Skills remain the runtime workflow.
import assert from 'node:assert/strict';
import { spawn, execFile } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { once } from 'node:events';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createBobConfig } from './bob-config.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const args = process.argv.slice(2);
let browser = false;
let serve = false;
let entry;
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--browser') browser = true;
  else if (args[i] === '--serve') serve = true;
  else if (args[i] === '--server-entry' && args[i + 1]) entry = path.resolve(args[++i]);
  else if (args[i] === '--help') {
    console.log('Usage: node scripts/smoke-browser.mjs [--browser | --serve] [--server-entry /path/to/cached/mcp/bin.js]\nDefault: MCP handshake/tools only. --browser opens local fixtures in isolated Chrome.\n--serve keeps local fixtures available for manual host checks until Ctrl+C.');
    process.exit(0);
  } else throw new Error(`Unknown argument: ${args[i]}`);
}
if (serve && browser) throw new Error('Choose --serve or --browser.');

async function fixtures() {
  const pages = new Map(await Promise.all(['application', 'reference'].map(async name => [
    `/${name}`, await readFile(path.join(root, `tests/fixtures/${name}.html`)),
  ])));
  const server = createServer((request, response) => {
    if (pages.has(request.url)) {
      response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      response.end(pages.get(request.url));
    } else if (request.url === '/api/failure') {
      response.writeHead(500, { 'Content-Type': 'application/json' });
      response.end('{"error":"FIXTURE_API_FAILURE"}');
    } else { response.writeHead(request.url === '/favicon.ico' ? 204 : 404); response.end(); }
  });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const origin = `http://127.0.0.1:${server.address().port}`;
  console.log(`Local fixtures: ${origin}/application and ${origin}/reference`);
  return { server, origin };
}

function client(command, commandArgs, env) {
  const child = spawn(command, commandArgs, { cwd: root, env: { ...process.env, ...env }, stdio: ['pipe', 'pipe', 'pipe'] });
  const pending = new Map();
  let nextId = 0;
  let buffer = '';
  let stderr = '';
  let failure;
  function fail(error) {
    failure = error;
    for (const { reject, timer } of pending.values()) { clearTimeout(timer); reject(error); }
    pending.clear();
  }
  child.stderr.on('data', chunk => { stderr = (stderr + chunk).slice(-4000); });
  child.on('error', fail);
  child.on('exit', code => fail(new Error(`MCP exited (${code}). ${stderr}`)));
  child.stdin.on('error', fail);
  child.stdout.on('data', chunk => {
    buffer += chunk;
    while (buffer.includes('\n')) {
      const end = buffer.indexOf('\n');
      const line = buffer.slice(0, end); buffer = buffer.slice(end + 1);
      let message; try { message = JSON.parse(line); } catch { continue; }
      const request = pending.get(message.id);
      if (!request) continue;
      pending.delete(message.id); clearTimeout(request.timer);
      if (message.error) request.reject(new Error(JSON.stringify(message.error)));
      else request.resolve(message.result);
    }
  });
  return {
    notify(method) { child.stdin.write(JSON.stringify({ jsonrpc: '2.0', method }) + '\n'); },
    request(method, params = {}) {
      if (failure) return Promise.reject(failure);
      const id = ++nextId;
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => { pending.delete(id); reject(new Error(`Timed out: ${method}. ${stderr}`)); }, 40000);
        pending.set(id, { resolve, reject, timer });
        child.stdin.write(JSON.stringify({ jsonrpc: '2.0', id, method, params }) + '\n');
      });
    },
    async close() {
      fail(new Error('Smoke client closed'));
      if (child.exitCode !== null || child.signalCode !== null || !child.pid) return;
      if (process.platform === 'win32') {
        await new Promise(resolve => execFile('taskkill', ['/pid', String(child.pid), '/t', '/f'], () => resolve()));
      } else {
        const exited = once(child, 'exit').catch(() => {});
        child.stdin.end();
        const timer = setTimeout(() => child.kill('SIGTERM'), 2000);
        await exited; clearTimeout(timer);
      }
    },
  };
}

const text = result => result.content?.filter(item => item.type === 'text').map(item => item.text).join('\n') ?? '';
function evaluated(result) {
  const match = text(result).match(/```(?:json)?\s*([\s\S]*?)```/);
  if (!match) throw new Error(`No JSON evaluation result: ${text(result)}`);
  return JSON.parse(match[1]);
}

async function main() {
  if (serve) {
    const { server } = await fixtures();
    console.log('Serving until Ctrl+C. The API fixture intentionally returns 500.');
    const stop = () => { server.closeAllConnections(); server.close(); };
    process.once('SIGINT', stop); process.once('SIGTERM', stop);
    await once(server, 'close');
    return;
  }
  const source = JSON.parse(await readFile(path.join(root, 'mcp.json'))).mcpServers['frontend-debugger-browser'];
  const launch = createBobConfig(source, root).mcpServers['frontend-debugger-browser'];
  const mcp = client(entry ? process.execPath : launch.command, entry ? [entry, ...source.args.slice(2)] : launch.args, launch.env);
  let local;
  try {
    await mcp.request('initialize', { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'frontend-debugger-smoke', version: '1.0.0' } });
    mcp.notify('notifications/initialized');
    const { tools } = await mcp.request('tools/list');
    const required = ['new_page', 'select_page', 'list_pages', 'take_snapshot', 'take_screenshot', 'evaluate_script', 'get_css_styles', 'list_console_messages', 'list_network_requests', 'get_network_request'];
    for (const name of required) assert.ok(tools.some(tool => tool.name === name), `Missing tool: ${name}`);
    console.log(`MCP handshake passed; ${required.length} required tools available.`);
    if (!browser) return;
    local = await fixtures();
    async function call(name, arguments_ = {}, pageId) {
      const schema = tools.find(tool => tool.name === name).inputSchema;
      if (pageId !== undefined) {
        await mcp.request('tools/call', { name: 'select_page', arguments: { pageId } });
        if (schema.properties?.pageId) arguments_ = { ...arguments_, pageId };
      }
      const result = await mcp.request('tools/call', { name, arguments: arguments_ });
      if (result.isError) throw new Error(`${name}: ${text(result)}`);
      return result;
    }
    async function open(route) {
      const url = `${local.origin}/${route}`;
      await call('new_page', { url });
      const pages = text(await call('list_pages'));
      const row = pages.split('\n').find(line => /^\d+:/.test(line) && line.includes(url));
      assert.ok(row, `Page ID unavailable for ${url}`);
      return Number(row.match(/^\d+/)[0]);
    }
    const app = await open('application');
    const reference = await open('reference');
    const measure = 'async () => { await document.fonts.ready; const s = getComputedStyle(document.querySelector("#headline")); return { title: document.title, size: parseFloat(s.fontSize), color: s.color, padding: parseFloat(getComputedStyle(document.querySelector("#card")).paddingTop) }; }';
    const expected = evaluated(await call('evaluate_script', { function: measure }, reference));
    const actual = evaluated(await call('evaluate_script', { function: measure }, app));
    assert.equal(expected.title, 'Debugger design reference fixture');
    assert.equal(actual.title, 'Debugger application fixture');
    assert.equal(expected.size, 32); assert.equal(actual.size, 28);
    assert.equal(actual.size - expected.size, -4);
    assert.equal(actual.color, expected.color); assert.equal(expected.padding, 24); assert.equal(actual.padding, expected.padding);
    assert.match(text(await call('take_snapshot', {}, app)), /Example application/);
    for (const pageId of [reference, app]) {
      const capture = await call('take_screenshot', {}, pageId);
      assert.ok(capture.content?.some(item => item.type === 'image'), 'Missing screenshot image');
    }
    await call('evaluate_script', { function: '() => { document.querySelector("#crash").click(); return true; }' }, app);
    await call('evaluate_script', { function: 'async () => { document.querySelector("#api").click(); const end = Date.now() + 5000; while (document.querySelector("#status").textContent === "Ready" && Date.now() < end) await new Promise(r => setTimeout(r, 50)); return document.querySelector("#status").textContent; }' }, app);
    assert.match(text(await call('list_console_messages', {}, app)), /FIXTURE_JS_DEFECT/);
    const network = text(await call('list_network_requests', {}, app));
    assert.ok(network.split('\n').some(line => line.includes('/api/failure') && line.includes('500')), 'Missing captured 500 response');
    console.log('Browser smoke passed: separate target IDs, snapshot, paired screenshots, 32px vs 28px mismatch, equivalent colors, 24px padding, JS exception and API 500.');
    console.log('This checks tool infrastructure, not AI-host behavior or Figma authentication.');
  } finally {
    await mcp.close();
    if (local) { local.server.closeAllConnections(); await new Promise(resolve => local.server.close(resolve)); }
  }
}

main().catch(error => { console.error(error.message); process.exitCode = 1; });

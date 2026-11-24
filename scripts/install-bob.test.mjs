import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { cp, mkdtemp, mkdir, readFile, readdir, realpath, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { createBobConfig } from './bob-config.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const installer = path.join(root, 'scripts/install-bob.mjs');

async function fixture(t) {
  const temp = await mkdtemp(path.join(tmpdir(), 'bob-install-'));
  t.after(() => rm(temp, { recursive: true, force: true }));
  const workspace = path.join(temp, 'app with spaces & symbols');
  await mkdir(workspace);
  return { workspace, destination: path.join(workspace, '.bob/plugins/frontend-debugger-ai') };
}

test('packages shared skills and preserves unrelated settings; update backs up managed files', async t => {
  const { workspace, destination } = await fixture(t);
  await mkdir(path.join(workspace, '.bob'));
  const settings = path.join(workspace, '.bob/mcp.json');
  await writeFile(settings, '{"mcpServers":{"existing":{}}}\n');
  execFileSync(process.execPath, [installer, '--workspace', workspace]);
  const config = JSON.parse(await readFile(path.join(destination, 'mcp.json')));
  const source = JSON.parse(await readFile(path.join(root, 'mcp.json')));
  const server = config.mcpServers['frontend-debugger-browser'];
  assert.equal(server.cwd, await realpath(destination));
  assert.equal(server.type, undefined);
  const shared = source.mcpServers['frontend-debugger-browser'];
  assert.equal(server.command, process.platform === 'win32' ? 'cmd.exe' : shared.command);
  assert.deepEqual(server.args, process.platform === 'win32' ? ['/d', '/c', shared.command, ...shared.args] : shared.args);
  assert.deepEqual(server.env, source.mcpServers['frontend-debugger-browser'].env);
  assert.deepEqual(server.alwaysAllow, []);
  for (const relative of [
    'skills/debug-frontend-defect/SKILL.md',
    'skills/debug-frontend-defect/investigation-template.md',
    'skills/debug-frontend-defect/report-template.md',
    'skills/validate-design/SKILL.md',
    'skills/validate-design/measurement-rules.md',
    'skills/validate-design/comparison-specification.md',
    'skills/validate-design/report-template.md',
    'skills/shared/browser-session.md',
  ]) {
    assert.deepEqual(await readFile(path.join(destination, relative)), await readFile(path.join(root, relative)));
  }
  await writeFile(path.join(destination, 'mcp.json'), 'local customization');
  await writeFile(path.join(destination, 'notes.txt'), 'keep');
  assert.notEqual(spawnSync(process.execPath, [installer, '--workspace', workspace]).status, 0);
  execFileSync(process.execPath, [installer, '--workspace', workspace, '--update']);
  const backups = await readdir(path.join(workspace, '.bob/plugin-backups'));
  assert.equal(backups.length, 1);
  assert.equal(await readFile(path.join(workspace, '.bob/plugin-backups', backups[0], 'mcp.json'), 'utf8'), 'local customization');
  assert.equal(await readFile(path.join(destination, 'notes.txt'), 'utf8'), 'keep');
  assert.equal(await readFile(settings, 'utf8'), '{"mcpServers":{"existing":{}}}\n');
});

test('discovers additional skills and nested binary assets without an installer change', async t => {
  const { workspace, destination } = await fixture(t);
  const source = path.join(path.dirname(workspace), 'source');
  await mkdir(source);
  await cp(path.join(root, 'scripts'), path.join(source, 'scripts'), { recursive: true });
  await cp(path.join(root, 'skills'), path.join(source, 'skills'), { recursive: true });
  await cp(path.join(root, 'mcp.json'), path.join(source, 'mcp.json'));
  const extra = path.join(source, 'skills/additional-workflow');
  await mkdir(path.join(extra, 'assets/nested'), { recursive: true });
  const binary = Buffer.from([0, 255, 128, 13, 10]);
  await writeFile(path.join(extra, 'SKILL.md'), '---\nname: additional-workflow\ndescription: Temporary packaging fixture\n---\n');
  await writeFile(path.join(extra, 'assets/nested/sample.bin'), binary);
  execFileSync(process.execPath, [path.join(source, 'scripts/install-bob.mjs'), '--workspace', workspace]);
  assert.deepEqual(await readFile(path.join(destination, 'skills/additional-workflow/assets/nested/sample.bin')), binary);
  assert.deepEqual(await readFile(path.join(destination, 'skills/additional-workflow/SKILL.md')), await readFile(path.join(extra, 'SKILL.md')));
});

test('rejects ambiguous arguments and unmanaged installations', async t => {
  const { workspace, destination } = await fixture(t);
  assert.notEqual(spawnSync(process.execPath, [installer, '--global', '--workspace', workspace]).status, 0);
  await mkdir(destination, { recursive: true });
  await writeFile(path.join(destination, 'mcp.json'), 'untouched');
  assert.notEqual(spawnSync(process.execPath, [installer, '--workspace', workspace, '--update']).status, 0);
  assert.equal(await readFile(path.join(destination, 'mcp.json'), 'utf8'), 'untouched');
});

test('rejects symlinked skill directories (Windows junctions) without writing through them', async t => {
  const { workspace, destination } = await fixture(t);
  execFileSync(process.execPath, [installer, '--workspace', workspace]);
  const outside = path.join(workspace, 'outside');
  await mkdir(outside);
  await writeFile(path.join(outside, 'SKILL.md'), 'untouched');
  const skill = path.join(destination, 'skills/debug-frontend-defect');
  await rm(skill, { recursive: true });
  await symlink(outside, skill, process.platform === 'win32' ? 'junction' : 'dir');
  assert.notEqual(spawnSync(process.execPath, [installer, '--workspace', workspace, '--update']).status, 0);
  assert.equal(await readFile(path.join(outside, 'SKILL.md'), 'utf8'), 'untouched');
});

test('Windows command wrapper launches the installed npx shim', { skip: process.platform !== 'win32' }, () => {
  const server = createBobConfig({ command: 'npx', args: ['--version'], env: {} }, process.cwd()).mcpServers['frontend-debugger-browser'];
  const output = execFileSync(server.command, server.args, { cwd: server.cwd, encoding: 'utf8', timeout: 15000 });
  assert.match(output.trim(), /^\d+\.\d+\.\d+/);
});

test('Windows config wraps npx and preserves native paths and pinned flags through JSON', async () => {
  const source = JSON.parse(await readFile(path.join(root, 'mcp.json')));
  const shared = source.mcpServers['frontend-debugger-browser'];
  const destination = String.raw`C:\Users\Test User\Projects\Parts & Catalog\.bob\plugins\frontend-debugger-ai`;
  const config = JSON.parse(JSON.stringify(createBobConfig(shared, destination, 'win32')));
  const server = config.mcpServers['frontend-debugger-browser'];
  assert.equal(server.command, 'cmd.exe');
  assert.deepEqual(server.args, ['/d', '/c', 'npx', ...shared.args]);
  assert.equal(server.cwd, destination);
  assert.deepEqual(server.env, shared.env);
  assert.deepEqual(server.alwaysAllow, []);
  for (const platform of ['darwin', 'linux']) {
    const unix = createBobConfig(shared, '/tmp/app with spaces', platform).mcpServers['frontend-debugger-browser'];
    assert.equal(unix.command, 'npx');
    assert.deepEqual(unix.args, shared.args);
  }
});

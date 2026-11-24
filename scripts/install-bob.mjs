#!/usr/bin/env node
import { cp, lstat, mkdir, readFile, readdir, realpath, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createBobConfig } from './bob-config.mjs';

const usage = `Usage:
  node scripts/install-bob.mjs --global
  node scripts/install-bob.mjs --workspace /absolute/path/to/workspace

Use --global for reuse across applications; --workspace only limits plugin discovery.
The investigation URL selects the target application; source is optional.
Add --update to refresh an installation created by this installer.
Existing managed files are backed up before an update. Requires Node.js 22.12+ or Node 24+.`;
const marker = '.frontend-debugger-ai-install.json';
const pluginName = 'frontend-debugger-ai';

async function exists(file) {
  try { return await lstat(file); }
  catch (error) { if (error.code === 'ENOENT') return null; throw error; }
}

// Do not follow symlinks into a different installation or settings directory.
async function rejectSymlinks(target) {
  for (let current = target; ; current = path.dirname(current)) {
    const stat = await exists(current);
    if (stat?.isSymbolicLink()) throw new Error(`Refusing symbolic link: ${current}`);
    if (current === path.dirname(current)) break;
  }
}

// Package every shared skill and its references/assets, preserving relative links.
async function collectFiles(directory, prefix, files) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const source = path.join(directory, entry.name);
    const relative = path.join(prefix, entry.name);
    if (entry.isSymbolicLink()) throw new Error(`Refusing symbolic link in plugin source: ${source}`);
    if (entry.isDirectory()) await collectFiles(source, relative, files);
    else if (entry.isFile()) files.set(relative, await readFile(source));
    else throw new Error(`Unsupported plugin source file: ${source}`);
  }
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0 || args.includes('--help')) { console.log(usage); return; }
  let workspace;
  let global = false;
  let update = false;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--global' && !global) global = true;
    else if (args[i] === '--update' && !update) update = true;
    else if (args[i] === '--workspace' && workspace === undefined && args[i + 1] && !args[i + 1].startsWith('--')) workspace = args[++i];
    else throw new Error(`Invalid argument: ${args[i]}\n${usage}`);
  }
  if (global === (workspace !== undefined)) throw new Error(`Choose exactly one installation scope.\n${usage}`);
  const base = await realpath(global ? homedir() : path.resolve(workspace));
  if (!(await lstat(base)).isDirectory()) throw new Error('Installation scope must be an existing directory.');
  const destination = path.join(base, '.bob', 'plugins', pluginName);
  await rejectSymlinks(destination);
  const sourceRoot = fileURLToPath(new URL('../', import.meta.url));
  const sourceConfig = JSON.parse(await readFile(path.join(sourceRoot, 'mcp.json'), 'utf8'));
  const server = sourceConfig.mcpServers['frontend-debugger-browser'];
  // Bob documents command/args/cwd/env for stdio, without a type field.
  const config = createBobConfig(server, destination);
  const files = new Map([['mcp.json', `${JSON.stringify(config, null, 2)}\n`]]);
  await collectFiles(path.join(sourceRoot, 'skills'), 'skills', files);
  if (![...files.keys()].some(file => path.basename(file) === 'SKILL.md')) throw new Error('No skills found in plugin source.');
  const installed = await exists(destination);
  if (installed) {
    if (!installed.isDirectory()) throw new Error(`Not a directory: ${destination}`);
    if (!update) throw new Error(`Installation already exists: ${destination}. Use --update to refresh it.`);
    await rejectSymlinks(path.join(destination, marker));
    const metadata = JSON.parse(await readFile(path.join(destination, marker), 'utf8'));
    if (metadata.installer !== pluginName) throw new Error('Refusing to update an unmanaged installation.');
  }
  for (const file of [...files.keys(), marker]) await rejectSymlinks(path.join(destination, file));
  if (installed) {
    const backup = path.join(base, '.bob', 'plugin-backups', `${pluginName}-${Date.now()}`);
    await rejectSymlinks(backup);
    await mkdir(path.dirname(backup), { recursive: true });
    await cp(destination, backup, { recursive: true, errorOnExist: true, force: false });
    console.log(`Backup: ${backup}`);
  }
  for (const [file, content] of files) {
    await mkdir(path.dirname(path.join(destination, file)), { recursive: true });
    await writeFile(path.join(destination, file), content);
  }
  await writeFile(path.join(destination, marker), `${JSON.stringify({ installer: pluginName, source: sourceRoot }, null, 2)}\n`);
  console.log(`Installed: ${destination}\nReload Bob and check Skills and MCP settings. Browser runtime validation is still required.`);
}

main().catch(error => { console.error(error.message); process.exitCode = 1; });

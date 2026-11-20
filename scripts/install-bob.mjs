#!/usr/bin/env node
import { cp, lstat, mkdir, readFile, realpath, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createBobConfig } from './bob-config.mjs';

const usage = `Usage:
  node scripts/install-bob.mjs --workspace /absolute/path/to/application
  node scripts/install-bob.mjs --global

Add --update to refresh an installation created by this installer.
Existing managed files are backed up before an update. Requires Node.js 22+.`;
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
  const skillName = 'debug-frontend-defect';
  const skillFiles = ['SKILL.md', 'investigation-template.md', 'report-template.md'];
  const files = new Map([['mcp.json', `${JSON.stringify(config, null, 2)}\n`]]);
  for (const file of skillFiles) {
    files.set(path.join('skills', skillName, file), await readFile(path.join(sourceRoot, 'skills', skillName, file)));
  }
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

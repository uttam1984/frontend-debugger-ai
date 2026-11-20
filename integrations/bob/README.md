# IBM Bob installation (experimental)

This adapter packages the shared debugging skill for IBM Bob IDE versions that support plugin directories with bundled MCP configurations. Bob runtime compatibility has not yet been verified. Bob Shell is not validated by this adapter.

## Install

Install Node.js 22+ (Node 24+ for Parts Catalog), npm/npx and Google Chrome on the machine running Bob's MCP process. From this checkout, choose one scope:

```sh
# Available in one application workspace; the workspace must already exist.
node scripts/install-bob.mjs --workspace "/absolute/path/to/application"

# Or available in all workspaces for the current user.
node scripts/install-bob.mjs --global
```

### Windows PC (PowerShell or Command Prompt)

Install native Windows Node.js 22+ with npm, Chrome and a Bob IDE version supporting bundled plugins. Reopen Bob after installing Node so its process inherits the updated PATH. From the plugin checkout, run:

```powershell
node --version
npm.cmd --version
node .\scripts\install-bob.mjs --workspace "C:\Projects\Parts Catalog"
```

For all workspaces, use `node .\scripts\install-bob.mjs --global`. Global installation uses Node's Windows home directory (normally `C:\Users\<user>`) and creates `.bob\plugins\frontend-debugger-ai` beneath it. To update, append `--update` to the same command. Quote paths containing spaces. No Bash or PowerShell script execution-policy change is required.

On Windows, generated MCP configuration launches `cmd.exe /d /c npx ...`: `npx` is a Windows command shim, and `/d` disables cmd AutoRun commands. The absolute plugin path is passed as `cwd`, not interpolated into a shell command, including when it contains spaces or `&`. JSON serialization escapes Windows backslashes automatically. macOS/Linux keep the direct `npx` launch. Reinstall on each operating system rather than copying generated configuration between machines.

Use native Windows Node with native Windows Bob. WSL, containers and remote MCP hosts need their own Chrome/network setup and are not covered by the native Windows instructions. If MCP fails to start, inspect Bob's MCP output and check `where.exe node`, `where.exe npx.cmd`, and `where.exe cmd.exe`. Then follow the same Skills/MCP and browser smoke checks below.

The installer writes the plugin to `<workspace>/.bob/plugins/frontend-debugger-ai/` or `~/.bob/plugins/frontend-debugger-ai/`, with update backups under the corresponding `.bob/plugin-backups/` directory. It copies the shared skill and both templates, generates `mcp.json` from the root Copilot configuration, and records an installer marker. The generated stdio configuration uses Bob's documented fields and an absolute `cwd` pointing at the installed plugin, rather than relying on `${PLUGIN_ROOT}` expansion. It retains the pinned server version, isolation and privacy flags. No tools are automatically approved.

No separate Bob manifest is generated: the adapter uses Bob's documented plugin directory discovery. The root `plugin.json` and `mcp.json` remain the Copilot entry points. Existing `.bob/mcp.json`, global settings and unrelated plugins are untouched. Avoid registering another server with the same name in project/global MCP settings, where it may conflict with this plugin.

Reload Bob, open the application workspace, enable the plugin if necessary and confirm:

1. **Skills:** `debug-frontend-defect` is available with its supporting templates.
2. **MCP:** `frontend-debugger-browser` connects and exposes browser tools. Enable Use MCP Servers and approve startup/tool requests as needed.
3. **Smoke check:** supply a local/test URL and ask Bob to open it, report the title, and list console/network entries. The first browser tool should launch an isolated Chrome session. Log in manually if required, following the skill's page scope rules.

Then ask:

> Use debug-frontend-defect to investigate [supplied URL]. Steps: [steps]. Expected: [result]. Actual: [failure]. Inspect browser evidence and trace it into this repository. Keep source files unchanged and distinguish confirmed findings from hypotheses.

Before treating support as verified, investigate one known JavaScript/state defect, one API failure and one CSS visibility defect. Check reproduction, source attribution, evidence coverage and diagnosis-only behavior. An empty console is not proof that the page is defect-free. Read-only behavior is a skill instruction, not a browser sandbox.

## Update and remove

Rerun the same installation command with `--update` after changing the shared skill or root MCP settings. Only installations bearing this installer's marker can be updated. Updates back up the plugin under `.bob/plugin-backups/frontend-debugger-ai-<timestamp>` outside the discovery directory, overwrite managed files and preserve other files. Local edits to managed files must be reapplied deliberately. The installer refuses symlinked installation paths.

To remove the adapter, remove only the installed `frontend-debugger-ai` directory, plus any backups you no longer need, then reload Bob. If the installed plugin is moved, reinstall it at the new location because `cwd` is absolute. Generated installations are machine-specific; share this repository and installation command rather than committing generated absolute paths.

If discovery fails, check that your Bob IDE version supports plugin-bundled skills and MCP. If MCP startup fails, check the MCP output, Node/npx PATH, npm registry/proxy access and Chrome installation. An older Bob version may require an upgrade. Runtime debugging must take place in Bob; successful installer checks alone do not verify browser connectivity.

## References

- [Bob plugin and MCP discovery changelog](https://bob.ibm.com/docs/ide/changelog)
- [Bob MCP configuration fields](https://bob.ibm.com/docs/ide/configuration/mcp/mcp-in-bob)
- [Bob skills and supporting files](https://bob.ibm.com/docs/ide/features/skills)

## Local installer checks

Run `node --test scripts/install-bob.test.mjs` from this checkout. These checks use temporary workspaces and cover packaging, shared configuration, preservation of settings, update backups, conflicting arguments, unmanaged installations and symlink refusal. They do not start Bob, download the MCP package or launch Chrome.

The GitHub Actions workflow `.github/workflows/bob-installer.yml` runs the installer checks on Windows, macOS and Linux with Node 22 and 24. Windows additionally checks that the generated command wrapper can launch `npx --version`. Windows path/configuration generation is also tested on other hosts. A green installer run does not establish Bob/Chrome runtime compatibility; complete the manual smoke check on the Windows PC before calling support verified.

Windows launcher reference: [Chrome DevTools MCP troubleshooting](https://github.com/ChromeDevTools/chrome-devtools-mcp/blob/main/docs/troubleshooting.md).

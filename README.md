# SMART Debugger AI

An AI-assisted frontend debugging plugin for Copilot in VS Code and Copilot CLI, with experimental IBM Bob IDE installation support. It investigates UI behavior, JavaScript errors, DOM/CSS and network failures on a user-supplied page, then traces evidence into application source. When the user explicitly supplies an AEM author URL and a published URL, it can also perform a read-only configuration-to-live comparison. It combines one debugging skill with the existing Chrome DevTools MCP server. The host assistant provides the AI reasoning over browser evidence and repository code.

```text
Copilot / Bob → debug-frontend-defect skill → Chrome DevTools MCP
       → DOM/CSS + console + network → repository trace → diagnosis
```

## Requirements

- Copilot in a VS Code version supporting Agent Plugins 1.0, Copilot CLI with plugin support, or IBM Bob IDE with plugin-bundled skills and MCP support.
- Node.js LTS and npm/npx on the host's PATH. Use Node 24+ for Parts Catalog.
- Installed Google Chrome and access to the application's local/test URL.
- Access to the relevant repository. Authentication in the separate test browser if required.

No plugin build or `npm install` is needed. On first MCP startup, `npx` downloads the pinned `chrome-devtools-mcp@1.10.1` package and dependencies. It runs from the plugin directory so a target repository's private npm registry configuration is not inherited. Network/proxy access and host MCP permissions are needed. The default configuration starts a visible Chrome window with an isolated temporary profile when the first browser tool is used. It does not inspect your normal Chrome window or reuse its login. Login manually in the tool's test browser if needed.

## VS Code setup

Merge these entries into your user `settings.json` using **Preferences: Open User Settings (JSON)**:

```json
{
  "chat.plugins.enabled": true,
  "chat.pluginLocations": {
    "/Users/uttambhattcharjee/developments/Agentic-&-Python/defect-debugger": true
  }
}
```

Reload VS Code, open the application repository, and use Copilot Chat with browser, terminal and source-reading tools available. Confirm the `debug-frontend-defect` skill and `frontend-debugger-browser` MCP server appear in the respective skill/tool lists. Start/approve the MCP server through the host if required. Creating this directory does not register it in your user settings automatically. The plugin identifier is `frontend-debugger-ai`; the checkout directory remains `defect-debugger`.

## Copilot CLI setup

```sh
copilot plugin install "/Users/uttambhattcharjee/developments/Agentic-&-Python/defect-debugger"
copilot plugin list
cd /Users/uttambhattcharjee/developments/WebDev/parts-catalog
copilot
```

Use `/skills list` to confirm discovery. Reinstall the local plugin after editing it because the CLI caches installed plugins.

## IBM Bob IDE setup (experimental)

From this checkout, install the shared skill and generated Bob MCP configuration into an existing application workspace:

```sh
node scripts/install-bob.mjs --workspace "/absolute/path/to/application"
```

On Windows PowerShell or Command Prompt, use:

```powershell
node .\scripts\install-bob.mjs --workspace "C:\Projects\Parts Catalog"
```

The installer detects Windows and configures `cmd.exe /d /c npx` automatically. Use native Windows Node/npm and Chrome; see the [Windows setup instructions](integrations/bob/README.md#windows-pc-powershell-or-command-prompt).

Use `--global` instead of `--workspace` for a user-wide installation. Node.js 22+ is required for the installer. Reload Bob and confirm `debug-frontend-defect` in Skills and `frontend-debugger-browser` in MCP settings. Existing Bob settings remain untouched. Add `--update` to refresh a managed installation; the installer backs it up first.

See [Bob setup, verification and removal](integrations/bob/README.md). Support remains experimental until skill discovery, MCP connection and known-defect investigations have passed in Bob. The installer generates Bob configuration from the shared root `mcp.json`; no duplicate skill or server-argument list is maintained.

## First investigation

Start your application's dev server using its documented command and open the repository. Parts Catalog has tenant-specific start scripts; use the actual URL/port printed by the server rather than assuming one. Then ask your assistant:

> Use debug-frontend-defect to investigate this issue at [actual URL]. Tenant: LH; market: DE; language: English. Steps: [exact interactions and test inputs]. Expected: [observable behavior]. Actual: [failure]. Reproduce it in the test browser, inspect the DOM/CSS, console and relevant network requests, and trace the evidence into this repository. Keep source files unchanged. Report confirmed findings, hypotheses, relevant files and the next action.

The skill uses [an investigation specification](skills/debug-frontend-defect/investigation-template.md) and produces [an evidence-based report](skills/debug-frontend-defect/report-template.md). It does not require configuration files inside Parts Catalog. Reports can stay in chat; ask for a sanitized Markdown report if you want a saved artifact.

The default workflow is diagnosis. A later request can authorize a fix, regression tests, browser verification and an Azure DevOps draft PR. PR publishing additionally needs Git push access and authenticated Azure DevOps tooling. Creating the plugin does not fix an application or create an application PR.

## AEM author-to-published validation

To compare MST configuration with the published portal, explicitly supply both direct URLs and keep the work read-only. The AEM author and published URLs are the only pages in scope; log in to the isolated AEM browser session manually if required.

> Use debug-frontend-defect to validate the AEM configuration against the published MST portal. Published URL: [published URL]. AEM author URL: [author URL]. Component/path: [component or path, if known]. Compare title, rich text, images and alt text, CTA labels/destinations, visibility, order and placement for [component]. Tenant: [tenant]; market/language: [market/language]; viewport: [viewport]. Do not edit, save, publish, activate or deactivate AEM content. Report matches and mismatches, classify each as configuration/content, publish/cache/rollout, frontend rendering, API/integration, environment/personalization or unresolved, and state the smallest next action.

A difference between authoring and live output is not automatically an AEM content defect. Publish status, cache/CDN, targeting, locale fallback and frontend transformations may be contributing factors; the report records the evidence and any remaining uncertainty.

## Browser configuration

`mcp.json` uses a pinned package version for reproducibility. Update it deliberately after testing compatibility. Tool schemas may differ between versions; the skill asks the assistant to discover the available tools.

The configuration opts out of server usage statistics and CrUX performance lookups and enables network header redaction. Request/response bodies, screenshots and URLs can still contain sensitive data; use a test session and save only sanitized evidence. The server remains capable of browser interactions; diagnosis-only is a skill instruction, not a technical read-only sandbox.

If you specifically need an existing debuggable test browser, replace `--isolated` with a supported browser connection option such as `--browser-url=http://127.0.0.1:9222`. Consult the upstream connection guide; this does not attach to an arbitrary normal browser automatically. Keep the endpoint local and use a dedicated test profile. Default isolated mode is the simplest starting point.

## Troubleshooting and verification

- **Skill missing:** check plugin path, supported host version, plugin enablement and enterprise policy.
- **MCP startup fails:** inspect host MCP output; verify Node/npx PATH, package registry/proxy access and Chrome availability.
- **Login missing:** authenticate manually in the isolated browser; its session is separate and temporary.
- **Server running but no browser:** the first browser tool launches Chrome; startup alone does not.
- **Local site unavailable:** confirm the dev server URL and whether the tools run locally, in a container or remotely. `localhost` refers to the browser host.
- **Exact source unclear:** obtain the deployed revision/source maps; do not treat a candidate file as proven.

For a smoke check, ask your assistant to open a supplied local/test URL, return its page title and list console/network entries. An empty error list is a valid result, not proof that the defect is absent. For a diagnosis pilot, use one known JS/state defect, one API failure and one CSS visibility defect; compare attribution against the known causes. Record accuracy and investigation time before expanding automation.

## Sources

- [Copilot plugin layout and CLI installation](https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/plugins-creating)
- [VS Code agent plugins and local registration](https://code.visualstudio.com/docs/agent-customization/agent-plugins)
- [Chrome DevTools MCP](https://github.com/ChromeDevTools/chrome-devtools-mcp)
- [Browser tool reference](https://github.com/ChromeDevTools/chrome-devtools-mcp/blob/main/docs/tool-reference.md)
- [Browser connection guide](https://github.com/ChromeDevTools/chrome-devtools-mcp/blob/main/docs/advanced-usage.md)

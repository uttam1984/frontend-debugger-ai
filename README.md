# SMART Debugger AI

An AI-assisted frontend debugging plugin for Copilot in VS Code and Copilot CLI, with experimental IBM Bob IDE installation support. It investigates UI behavior, JavaScript errors, DOM/CSS and network failures on a user-supplied web application URL. It works with public websites, deployed applications and local applications; matching source code is optional and enables deeper source attribution. When the user explicitly supplies an AEM author URL and a published URL, it can also perform a read-only configuration-to-live comparison. It shares defect-diagnosis and design-validation skills across hosts, using Chrome DevTools MCP for application evidence and optional Figma access for design specifications. The host assistant provides the AI reasoning over browser evidence and repository code.

```text
Copilot / Bob → debug-frontend-defect or validate-design skill
       → Chrome DevTools MCP → application evidence
       → Figma browser/read provider → design evidence (when requested)
       → diagnosis or measured comparison report
```

## Requirements

- Copilot in a VS Code version supporting Agent Plugins 1.0, Copilot CLI with plugin support, or IBM Bob IDE with plugin-bundled skills and MCP support.
- Node.js 22.12+ (or Node 24+) and npm/npx on the host's PATH; use a version supported by the pinned MCP server and the application if running it locally.
- Installed Google Chrome and access to the supplied public, test or local application URL.
- Authentication in the separate test browser if required. Matching application source is optional for diagnosis and required for source changes.

No plugin build or `npm install` is needed. On first MCP startup, `npx` downloads the pinned `chrome-devtools-mcp@1.10.1` package and dependencies. It runs from the plugin directory so a target repository's private npm registry configuration is not inherited. Network/proxy access and host MCP permissions are needed. The default configuration starts a visible Chrome window with an isolated temporary profile when the first browser tool is used. It does not inspect your normal Chrome window or reuse its login. Login manually in the tool's test browser if needed.

## VS Code setup

Merge these entries into your user `settings.json` using **Preferences: Open User Settings (JSON)**:

```json
{
  "chat.plugins.enabled": true,
  "chat.pluginLocations": {
    "/absolute/path/to/defect-debugger": true
  }
}
```

Reload VS Code and use Copilot Chat with browser tools available. Open matching application source when you want source tracing; browser-only diagnosis does not require it. Confirm the `debug-frontend-defect` and `validate-design` skills and `frontend-debugger-browser` MCP server appear in the respective skill/tool lists. Start/approve the MCP server through the host if required. Creating this directory does not register it in your user settings automatically. The plugin identifier is `frontend-debugger-ai`; the checkout directory remains `defect-debugger`.

## Copilot CLI setup

```sh
copilot plugin install "/absolute/path/to/defect-debugger"
copilot plugin list
copilot
```

Use `/skills list` to confirm discovery. Reinstall the local plugin after editing it because the CLI caches installed plugins.

## IBM Bob IDE setup (experimental)

Install once for the current user to investigate different web applications without copying the plugin into each repository. From this checkout, run:

```sh
node scripts/install-bob.mjs --global
```

On Windows PowerShell or Command Prompt, use:

```powershell
node .\scripts\install-bob.mjs --global
```

The installer detects Windows and configures `cmd.exe /d /c npx` automatically. Use native Windows Node/npm and Chrome; see the [Windows setup instructions](integrations/bob/README.md#windows-pc-powershell-or-command-prompt).

This installs under your home directory at `.bob/plugins/frontend-debugger-ai/`. The URL in each investigation selects the target application; installation is not tied to an application repository. An optional `--workspace "/path/to/workspace"` installation restricts discovery to that workspace, not which application URLs can be investigated. Avoid keeping both scopes installed with the same skill/server name. Node.js 22.12+ (or Node 24+) is required for the installer. Reload Bob and confirm `debug-frontend-defect` and `validate-design` in Skills and `frontend-debugger-browser` in MCP settings. Existing Bob settings remain untouched. Add `--update` to refresh a managed installation; the installer backs it up first.

See [Bob setup, verification and removal](integrations/bob/README.md). Support remains experimental until skill discovery, MCP connection and known-defect investigations have passed in Bob. The installer generates Bob configuration from the shared root `mcp.json`; no duplicate skill or server-argument list is maintained.

## First investigation

Supply the exact application URL, reproduction steps and expected/actual behavior. A public or deployed site does not need a local server or source checkout. For a local application, start its server using its own documented instructions and use the actual URL/port printed by that server.

Browser-only example:

> Use debug-frontend-defect to investigate [exact application URL]. Steps: [interactions and test inputs]. Expected: [observable behavior]. Actual: [failure]. Inspect DOM/CSS, console and relevant network requests. No matching source repository is available; continue with browser evidence and state the limits of source attribution. Keep files unchanged and report confirmed findings, hypotheses and the next action.

For source tracing, also identify the matching application repository:

> Use debug-frontend-defect at [exact application URL]. Matching application source: [checkout path]. Steps: [steps]. Expected: [behavior]. Actual: [failure]. Reproduce it, correlate browser evidence with this source and state deployment/revision confidence. Keep source files unchanged.

The skill uses [an investigation specification](skills/debug-frontend-defect/investigation-template.md) and produces [an evidence-based report](skills/debug-frontend-defect/report-template.md). It does not require application-specific configuration files. Tenant, locale, framework and deployment details are collected only when relevant. Reports can stay in chat; ask for a sanitized Markdown report if you want a saved artifact.

The default workflow is diagnosis. A later request can authorize a fix, regression tests, browser verification and a draft PR on the application's hosting provider. PR publishing additionally needs Git push access and authenticated tooling for that provider. Creating the plugin does not fix an application or create an application PR.

## Website-to-Figma design validation

Supply the developed URL and the Figma prototype/frame URL, the intended viewport/state and the components to compare:

> Use validate-design. Application: [developed URL]. Reference: [Figma frame/prototype URL]. Compare typography, colors, spacing, dimensions and alignment for [components] at [viewport/state]. Use available browser/Figma read tools. Report expected and actual measurements, differences, tolerances, screenshots and coverage gaps. Keep application source and Figma unchanged.

The two URLs are separate comparison targets. The skill maps rendered elements to design components, stabilizes the capture conditions and uses [measurement rules](skills/validate-design/measurement-rules.md) and a [comparison report](skills/validate-design/report-template.md). Application source is optional. Additional journey/login destinations are allowed when explicitly included in the investigation scope; unexpected destinations outside that scope require authorization.

A browser-readable Figma inspect UI can provide specifications. A prototype screenshot alone cannot establish exact hidden typography/padding values. Use an existing read-capable Figma provider when available, or report those properties as unmeasurable. See [Figma access and host compatibility](integrations/figma/README.md). Figma remote access depends on its approved client catalog; Bob support is not implied by MCP support alone.

## Shared architecture

- `skills/debug-frontend-defect/`: browser diagnosis, optional matching-source tracing and AEM comparison.
- `skills/validate-design/`: design comparison specification, measurement rules and report.
- `skills/shared/browser-session.md`: shared target roles, tabs, approved journeys and evidence ownership.
- Root manifest/MCP configuration and Bob adapter: host setup. The optional installer copies the entire shared skill tree, including supporting references and assets.

## Verification

Run `node --test scripts/install-bob.test.mjs` for installation/packaging checks. Run `node scripts/smoke-browser.mjs` for MCP initialization/tool discovery. Add `--browser` for an isolated Chrome check against local fixtures, or `--serve` to keep the local fixtures available for manual host testing. These optional checks use Node; the skills drive investigations.

Follow [host acceptance cases](tests/acceptance.md) to verify actual Copilot/Bob behavior, design comparison and Figma access. Infrastructure smoke checks do not establish AI-host behavior or successful Figma authentication. Windows launch and host checks still need execution on Windows.

## AEM author-to-published validation

This optional mode applies only to applications using AEM. To compare author configuration with the published page, explicitly supply both direct URLs and keep the work read-only. The AEM author and published URLs are the only pages in scope; log in to the isolated AEM browser session manually if required.

> Use debug-frontend-defect to validate the AEM configuration against the published page. Published URL: [published URL]. AEM author URL: [author URL]. Component/path: [component or path, if known]. Compare title, rich text, images and alt text, CTA labels/destinations, visibility, order and placement for [component]. Tenant: [tenant]; market/language: [market/language]; viewport: [viewport]. Do not edit, save, publish, activate or deactivate AEM content. Report matches and mismatches, classify each as configuration/content, publish/cache/rollout, frontend rendering, API/integration, environment/personalization or unresolved, and state the smallest next action.

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

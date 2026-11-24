# Figma design evidence

The `validate-design` skill can compare a website against a supplied Figma reference through browser inspection or an existing read-capable Figma provider. This plugin does not automatically install/connect a Figma server or request account access. It does not edit Figma.

## Browser route

Supply both the developed URL and the Figma prototype/frame URL. Log into the separate test browser manually when needed, with authentication routes covered by the declared scope. If the inspect/design UI exposes typography, layout and style values, the skill can compare those measurements. A prototype viewer screenshot alone only supports visual observations; exact hidden properties remain unmeasurable.

## Optional Figma provider

Use the Figma integration supported by your actual host, version and organization. Figma's remote endpoint is `https://mcp.figma.com/mcp` and requires account sign-in. Figma currently limits remote connections to clients in its MCP catalog; generic MCP support in Bob does not establish that Bob is eligible. Confirm current client support before attempting remote setup. See [official remote setup](https://developers.figma.com/docs/figma-mcp-server/remote-server-installation/).

For an eligible host, add the provider through its MCP settings using the official Figma instructions and authenticate through the host. Do not put tokens in this repository. If using Figma desktop, follow the [official desktop server setup](https://developers.figma.com/docs/figma-mcp-server/local-server-installation/) and verify that the chosen host can connect; this plugin has not verified that route in Bob either. Browser inspection remains available when a provider cannot connect.

Confirm read tools for the selected frame/node are available: design context, metadata, variable/style definitions and screenshots where supported. Tool names and access depend on the provider; the skill discovers schemas rather than assuming a fixed prefix. See [official tool descriptions](https://developers.figma.com/docs/figma-mcp-server/tools-and-prompts/). Some providers also expose write tools; design validation uses only read operations.

Reference extraction and application measurement are separate. The browser measures the live application; Figma supplies expected design evidence. A generated code snippet is not proof of actual deployed behavior. Record unavailable metadata and provider/access limitations explicitly in the comparison report.

## Example

> Use validate-design. Application: [developed URL]. Reference: [Figma frame/prototype URL]. Compare [components] at viewport 1440 × 900, [locale/state]. Check typography, color, dimensions, alignment and spacing. Use available browser/Figma read tools. Report expected/actual measurements, tolerances, evidence and coverage gaps. Keep application source and Figma unchanged.

Use a design/frame link in addition to the prototype when the prototype cannot expose the needed specifications. Scope additional frames, breakpoints and states explicitly. No application repository is required.

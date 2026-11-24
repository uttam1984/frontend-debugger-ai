---
name: validate-design
description: Compare a developed web application with supplied Figma frames or a prototype, measure typography, color, layout and spacing, and report matches, mismatches and coverage gaps. Use for design QA against a reference; matching application source is optional.
---

# Validate a website against its design

Compare rendered application elements with a supplied design reference. Diagnose and report by default; do not edit source, application data or Figma content. A design mismatch does not establish its implementation root cause. Use [comparison-specification.md](comparison-specification.md) to define the run and [report-template.md](report-template.md) for results. Read [browser-session.md](../shared/browser-session.md) before using browser tools.

## Identify the comparison and available evidence

Establish the application URL, Figma URL/frame/node, viewport and component state. The two supplied URLs are separate authorized targets for this comparison. A prototype identifies a flow/state; do not assume its presentation URL exposes the underlying design specification. Ask for a file/frame link only if needed to resolve a specific measurement or ambiguous state, and continue the accessible comparison.

Use the existing browser MCP provider for the application. Read the Figma reference through either the browser's accessible design/inspect UI or an available read-capable Figma provider. Discover its actual tool schemas. Read only the supplied file/nodes and components needed for those nodes; broader files or frames require comparison scope. Do not install/connect a provider or change account permissions without a request covering setup.

When available, Figma design context, variable/style definitions, node metadata and frame screenshots can supply expected values. See [Figma read tool documentation](https://developers.figma.com/docs/figma-mcp-server/tools-and-prompts/). Browser inspection is sufficient when it exposes the required values. Do not measure the Figma viewer toolbar/DOM as if it were the designed component. A prototype screenshot supports visual observations; it does not establish exact font family, token value or CSS padding. Mark inaccessible properties unmeasurable and identify the missing access. Do not infer hidden metadata from appearance or generated code alone when its relationship to the node is unclear.

Matching application source is optional. If present, establish that it belongs to the supplied application before using it to explain a mismatch. Never use the plugin checkout as application source. For causal debugging, use the defect workflow separately after recording the design finding.

## Map elements and stabilize conditions

Inventory visible design components and rendered application elements in the agreed frame/state. Map using component purpose, text, hierarchy, relative geometry and available node metadata; DOM tags and Figma layers need not correspond one-to-one. Assign a stable comparison ID and record the Figma node, application selector/accessibility identity and mapping confidence. Prefer component/text identities over fragile DOM indices. Pseudo-elements, images, SVG text and shadow DOM may need specific measurements; record inaccessible boundaries.

Resolve ambiguous mappings before claiming a discrepancy. Distinguish an element missing from the rendered page from one that could not be mapped. Record extra application elements and design elements absent from the application separately. Inventory first so unmatched or omitted elements remain visible in coverage, even when the comparison is sampled or stopped early. Never claim every HTML element or responsive state was validated from one frame.

Match viewport width/height in CSS pixels, zoom, state, locale and representative content. Record DPR/browser and frame dimensions. Wait within a recorded bound for `document.fonts.ready`, required images, relevant loading and layout stability. A font-loading failure is evidence, not permission to silently accept the fallback. Keep animated/dynamic regions separate; don't mutate or disable them without scope. Do not compare a desktop frame to a mobile viewport or assume Figma coordinates equal viewport pixels in a scaled screenshot.

## Measure and classify

Follow [measurement-rules.md](measurement-rules.md). Read computed styles, bounding rectangles and relevant parent/sibling geometry from the application with discovered tools such as CSS inspection and read-only page evaluation. Do not rely on accessibility snapshots alone for styles or dimensions. Capture matched application/design crops at the same state. Keep console/network observations scoped to the application when explaining failed fonts/assets or rendering; reference-viewer errors are not application failures.

For each element/property, record raw and normalized expected/actual values, provenance, delta, tolerance, confidence and evidence IDs. Use match, mismatch, unmatched or unmeasurable. Capture missing and extra elements as presence mismatches only when the mapping and state establish absence/presence. An unavailable value is never a match. Recheck measured discrepancies after readiness before reporting them as confirmed; do not infer exact numerical differences from screenshots.

Group findings by component while retaining individual property rows. Rank severity by user impact, not arbitrary pixel magnitude. Report responsive state and interaction coverage explicitly. When specifications are inaccessible, provide the available visual review and precise missing inputs rather than a fabricated numerical audit.

## Deliver

Produce the comparison report in chat, or save sanitized artifacts only to a requested location or host-approved temporary directory. Include coverage counts, expected/actual measurements, reference/node/element identities, screenshots, limitations, proposed corrections and verification conditions. Separate visual observations from measured specification mismatches. Do not give a global pass if any in-scope element/property is unmatched or unmeasurable. Stop when the agreed scope is covered or a precise evidence/access blocker is identified; report partial coverage.

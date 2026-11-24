# Design comparison specification

Keep this record in chat or a requested artifact. Unknown values stay unknown.

- **Application target:** exact supplied URL, page ID, environment, login state and optional matching source/revision.
- **Design target:** supplied Figma prototype/design URL, file/frame/node IDs, version when available, page ID/provider and access level. Record how a prototype state maps to the design frame.
- **Additional targets/journey:** explicitly approved navigation, login destinations, routes/origins and excluded actions. Follow [browser-session.md](../shared/browser-session.md).
- **Comparison scope:** frames/components, visible elements, properties and states/breakpoints; complete inventory or explicitly named sample.
- **Conditions:** viewport in CSS px, zoom, DPR, browser, locale, content/data, theme and component states.
- **Readiness:** bounded font/image/loading/layout checks and actual observation interval; unstable areas.
- **Expected specifications:** provenance for each property: Figma node metadata/inspect value, variable/style, design context, or visual reference only.
- **Rules:** property tolerances and normalizations from [measurement-rules.md](measurement-rules.md), with user/design-system overrides. State assumptions before classifying results.
- **Element inventory:** comparison ID, design node, application identity, matched/missing/extra/ambiguous state and mapping confidence.
- **Evidence location:** chat or requested/temporary sanitized artifacts.
- **Completion:** all in-scope inventory/properties accounted for, or partial result with explicit unmatched/unmeasurable checks and next required input. Source access is not required to compare a rendered page.

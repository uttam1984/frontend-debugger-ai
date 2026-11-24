# Design validation: <application and frame>

**Outcome:** compared scope, main finding and complete / partial / blocked coverage. A complete comparison can contain mismatches; completeness is not a pass.

## Targets and conditions

Record application URL/page ID, reference URL/file/frame/node/version and provider, approved journey/authentication targets, viewport, DPR, zoom, state, browser, locale/content, readiness interval and known instability. State whether source was available; it is optional.

## Coverage

List mapped, missing, extra and ambiguous elements and the agreed inventory/sample. Show total planned property checks and counts for match, mismatch, unmatched and unmeasurable. Show measurement coverage independently of the match rate. List excluded breakpoints/states/properties. A global pass requires all in-scope checks to be measured and matched.

## Findings

| ID / element / design node | Property | Expected (source) | Actual (measurement) | Delta / rule | Result / confidence | Severity / evidence |
| --- | --- | --- | --- | --- | --- | --- |
| Comparison identity | Property and units | Value and provenance, or unknown | Value and method, or unknown | Difference and stated tolerance | Match / mismatch / unmatched / unmeasurable | User impact and paired capture IDs |

Retain raw/normalized values when normalization changes representation. Group repeated properties by component without losing individual results. Record observation versus inference. Separate screenshot-based visual concerns from numerical specification findings. Show missing/extra components with presence evidence; do not invent absent property values.

## Evidence and related runtime signals

Link sanitized paired design/application screenshots and measurement excerpts with target IDs, capture times and states. Link relevant application console/network signals if they explain fonts/assets or rendering. Reference-viewer errors belong to the reference evidence, not application defects.

## Corrections and verification

For each actionable discrepancy, state the smallest proposed correction and how to recheck the same property/frame/state. Identify suspected implementation cause only when supported by browser or matching source evidence. Changes are proposals unless explicitly requested and applied.

## Limitations and next input

List unavailable Figma specifications, unresolved element mapping, missing fonts, dynamic content, inaccessible shadow roots, unknown frame version or untested states. Name the exact access/frame/measurement needed to resolve each gap.

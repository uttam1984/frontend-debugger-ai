# Host acceptance checks

Run these cases separately in Copilot and Bob on the intended operating system. Record host/OS/Node/Chrome/plugin versions, case result, evidence and date. These are acceptance cases to execute, not claims of verified behavior. Installer CI does not run an AI host or authenticate to Figma.

## Browser infrastructure smoke check

From the checkout run `node scripts/smoke-browser.mjs` to check MCP initialization and required tool discovery. Add `--browser` to launch isolated Chrome and serve only the local fixture pages on a temporary loopback port. It checks tab targeting, snapshots, paired screenshots, computed typography, console capture and a 500 response. This is a tools check, not a skill-behavior evaluation. It does not open external websites or Figma.

To serve the fixtures for manual host checks, run `node scripts/smoke-browser.mjs --serve`, then use the printed application/reference URLs in your host. Press Ctrl+C when finished. For a persistent static server, the HTML/typography/JS cases also work independently; use your own known failing API environment for the service case.

## Behavioral cases

| Case / input | Acceptance evidence |
| --- | --- |
| Browser-only diagnosis: supplied application URL, known JS error, no matching checkout | Reproduces the failure, records the exception and supported mechanism; does not attribute it to plugin source or demand a repository before investigating. |
| API failure: supplied URL and action producing a known 500 | Records the request/status and visible state. Distinguishes service response failure from an unverified internal backend cause. |
| Source-assisted diagnosis: known CSS/JS defect plus matching checkout | Cites relevant code with revision confidence and a distinguishing observation. Leaves unrelated files unchanged. |
| Two targets: application fixture plus reference fixture, request heading size/color/card padding comparison | Opens separate tabs with role/page IDs, reports heading 32px expected vs 28px actual (−4px mismatch at ±0.5px tolerance), equivalent `#0050a4`/`rgb(0,80,164)` as match, and 24px padding as match. Clearly labels the HTML fixture as a reference, not Figma metadata. |
| Real Figma frame plus developed URL, readable specifications | Maps the intended frame/state to application elements. Includes expected/actual values, node/element IDs, tolerances, paired captures and coverage. No edits to Figma or application source. |
| Figma prototype without inspect metadata or read provider | Gives a visual/partial result; exact typography and spacing that cannot be established stay unmeasurable. Does not infer exact values from screenshot appearance. |
| Missing/extra/ambiguous elements | Reports presence mismatches only for confirmed absence/extra content; keeps ambiguous mapping unmatched. Coverage includes these gaps instead of claiming every element passed. |
| Desktop/mobile or missing-font difference | Aligns viewport/state before comparing, waits within the recorded readiness bound, and reports font/viewport limitations instead of treating incompatible measurements as reliable matches. |
| Authorized journey/login | Uses already approved routes without asking for permission again. Stops at an unexpected destination outside scope and records the URL. Authentication stays manual. |
| Mixed application/reference console errors | Attributes evidence to the correct page. Figma viewer/reference errors do not become application defects. |

Retain a small sanitized sample report per host. Do not mark overall host support verified until relevant cases have actually passed; record unexecuted cases as pending.

# Defect investigation: <issue>

**Finding:** one sentence describing the supported cause or remaining blocker.

**Status:** confirmed / likely / unresolved. Explain why.

## Reproduction

Record investigation mode (browser-only or browser plus source), URL/environment, browser/viewport, login state, exact steps, expected result and actual result. Include tenant/market/language and deployed/local revision match when applicable. State whether matching application source is available; do not treat the plugin checkout as application source. State whether reproduction succeeded. Omit sensitive URL parameters and test data.

Record the role-to-page-ID registry, supplied URLs, approved route/origin and authentication boundaries, redirects and scope extensions. Identify interactions blocked by the declared scope. Keep evidence from separate targets distinct.

For AEM validation, record the supplied published URL and AEM author URL, their page IDs, the component/content path, compared fields, author login state and known publish/cache/targeting context. Confirm that the work was read-only and list any comparison that could not be performed.

## Capture coverage

Record the provisional defect category, selected primary evidence and supporting checks, including any change in focus and why. State whether the task was a focused diagnosis or full console/network audit.

Record the observed interactions and capture interval, including any bounded wait for delayed events. For each evidence category, distinguish baseline checks from detailed analysis, state whether all available result pages in the relevant interval were retrieved, and explain deeper checks skipped or unavailable. For example: network payload analysis was unnecessary because hit-testing showed an overlay intercepted the click before a request was initiated. Record filters, preservation and retention limits. Summarize distinct relevant errors and repeated occurrences with representative IDs. Separate initial-load errors from interaction-triggered errors. If a requested error was absent, describe the reviewed coverage; do not equate absence in the capture with absence of a defect.

## Evidence and causal chain

Link the before/after DOM/accessibility snapshots and screenshots, with capture times, viewport, page ID and reproduction steps. Include relevant inline snapshot excerpts when no file was saved. Identify any unavailable pre-failure state, unsupported screenshot tool or omitted sensitive capture.

| Evidence | Observation | Supports or contradicts |
| --- | --- | --- |
| Before/after snapshots and screenshots | Relevant state or layout change and capture times | Hypothesis |
| Console message ID and safe stack | Exception and location | Hypothesis |
| Request ID, safe endpoint, status and timing | Relevant payload/response fields | Hypothesis |
| Repository file/symbol | Matching code path and revision confidence | Hypothesis |
| Focused experiment | What changed and the result | Hypothesis |

Include the evidence types relevant to the defect; do not invent console or network findings to fill unused rows. Explain omitted analysis in Capture coverage.

Describe how the initial failure leads to the visible symptom. Link sanitized artifacts and repository files where available. Avoid copying full request bodies or credentials. Separate observations from inferences.

## AEM author-to-published comparison

Include this section only when AEM validation was requested. For each component/field, show the author configuration, published rendering, result and supported classification. Do not include sensitive authoring data.

| Component / field | AEM author value | Published value | Result and classification |
| --- | --- | --- | --- |
| Component path or name | Sanitized configured value | Rendered value or state | Match / mismatch: configuration, publish/cache, frontend, API/integration, environment/personalization, or unresolved |

Link matched author/live snapshots. A visible difference alone does not prove that author configuration is wrong; explain the evidence for or against publish state, caching, locale fallback, targeting, frontend transformation and integration behavior.

## Root-cause validation

Describe the trigger -> failing operation -> state/rendering change -> symptom, identifying the specific failed condition and, when source is available, the relevant file/symbol/line with deployment-match confidence. For browser-only investigations, cite captured browser evidence and loaded-script locations when available; mark original source attribution as unavailable rather than inventing file references. Distinguish the observed browser mechanism from any underlying cause that remains unverified.

Record the leading hypothesis, strongest plausible alternative, distinguishing observation/experiment, predicted outcome and actual outcome. Explain which evidence supports the conclusion and what remains unresolved. An error list or screenshot alone is insufficient for a confirmed root cause.

## Ownership and alternatives

State the observed failure layer and supported ownership. For an AEM comparison, distinguish content/configuration ownership from publish/cache, frontend, API/integration and personalization/environment ownership. For a service boundary failure, include a safe correlation ID if available and the backend evidence still needed. List plausible alternatives tested or not yet excluded.

## Next action and verification

Describe the smallest proposed fix or missing diagnostic input. Give observable acceptance checks. If a fix was requested and applied, include exact tests/builds, browser recheck results, and PR link if requested and created. Otherwise identify the patch as a proposal.

## Limitations

Record missing source maps, unknown deployment revision, unobserved earlier requests, inaccessible shadow DOM, unavailable logs, login differences or incomplete reproduction that materially affects the conclusion.

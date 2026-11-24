# Investigation specification

Use this lightweight SDD record to define the defect and success criteria. Unknown fields may remain unknown initially; do not invent values. Maintain it in the conversation or a requested report file.

- **Issue:** identifier and concise symptom.
- **Investigation mode:** browser-only, or browser plus matching application source.
- **Repository (optional):** matching application checkout path, revision and evidence that it belongs to the supplied URL; otherwise record unavailable. Never substitute the plugin checkout or an unrelated workspace.
- **URL/environment:** local, test or deployed environment; known build revision.
- **Browser targets/journey:** each supplied URL, role and page ID; approved route/origin and login boundaries, observed redirects and excluded actions. Follow [browser-session.md](../shared/browser-session.md). For AEM comparison record author/published targets; for Figma design comparison use [validate-design](../validate-design/SKILL.md). Unexpected destinations outside declared scope need authorization.
- **AEM comparison:** use only for an explicitly requested author-to-published validation. Record AEM component/content path and fields to compare, expected live values, author/publish login state, known activation/publish time, cache context and personalization/targeting context. Read-only; AEM edits, saves and publication actions are excluded.
- **Context:** login state, viewport and browser; tenant, market, language, portal and stack only when applicable.
- **Expected behavior:** observable outcome.
- **Actual behavior:** observable failure.
- **Reproduction steps:** ordered interactions and test inputs.
- **Investigation focus:** provisional defect category, primary evidence needed, supporting console/network/DOM checks and unknowns; revise as evidence emerges. State whether a focused diagnosis or full console/network audit was requested.
- **Scope:** diagnosis only, or requested fix/PR; actions excluded from reproduction.
- **Evidence location:** requested location or temporary directory; sanitized artifacts only.
- **Snapshot evidence:** before/after DOM/accessibility snapshots and screenshots; capture times, viewport and reproduction-step labels; for AEM validation, matched author/live captures for each compared component; record unavailable or unsafe captures.
- **Acceptance criteria:** how reproduction, causal attribution and any later fix will be verified using evidence appropriate to the defect; explain omitted checks and unresolved evidence gaps.

Example prompt:

> Use debug-frontend-defect at [exact application URL]. Clicking Search leaves the spinner visible instead of showing results. Reproduce using [steps], inspect DOM/CSS, console and related API requests, and report the supported mechanism. If matching application source is available, trace the evidence into it. Otherwise continue with browser evidence and state source attribution limits. Keep files unchanged and distinguish confirmed findings from hypotheses.

Investigation is complete when the symptom is reproduced and a supported causal explanation is reported, or a precise reproduction/evidence blocker is identified with the next useful action. A screenshot alone is not a root cause.

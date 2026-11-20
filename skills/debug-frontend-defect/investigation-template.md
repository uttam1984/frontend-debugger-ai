# Investigation specification

Use this lightweight SDD record to define the defect and success criteria. Unknown fields may remain unknown initially; do not invent values. Maintain it in the conversation or a requested report file.

- **Issue:** identifier and concise symptom.
- **Repository:** checkout path and revision.
- **URL/environment:** local, test or deployed environment; known build revision.
- **Page boundary:** exact URL supplied in chat and target page ID; or, for explicitly requested AEM validation, the supplied published URL and supplied AEM author URL with one target page ID each. Any redirects and scope extensions require authorization. Other routes and independent endpoint tests are excluded by default.
- **AEM comparison:** use only for an explicitly requested author-to-published validation. Record AEM component/content path and fields to compare, expected live values, author/publish login state, known activation/publish time, cache context and personalization/targeting context. Read-only; AEM edits, saves and publication actions are excluded.
- **Context:** tenant, market, language, portal, login state, viewport and browser.
- **Expected behavior:** observable outcome.
- **Actual behavior:** observable failure.
- **Reproduction steps:** ordered interactions and test inputs.
- **Investigation focus:** provisional defect category, primary evidence needed, supporting console/network/DOM checks and unknowns; revise as evidence emerges. State whether a focused diagnosis or full console/network audit was requested.
- **Scope:** diagnosis only, or requested fix/PR; actions excluded from reproduction.
- **Evidence location:** requested location or temporary directory; sanitized artifacts only.
- **Snapshot evidence:** before/after DOM/accessibility snapshots and screenshots; capture times, viewport and reproduction-step labels; for AEM validation, matched author/live captures for each compared component; record unavailable or unsafe captures.
- **Acceptance criteria:** how reproduction, causal attribution and any later fix will be verified using evidence appropriate to the defect; explain omitted checks and unresolved evidence gaps.

Example prompt:

> Use debug-frontend-defect in Parts Catalog. At the supplied local URL, tenant LH, market DE, English, clicking Search leaves the spinner visible instead of showing results. Reproduce using the supplied test journey, inspect DOM/CSS, console and related API requests, and trace the failure into the repository. Keep source files unchanged and distinguish confirmed findings from hypotheses.

Investigation is complete when the symptom is reproduced and a supported causal explanation is reported, or a precise reproduction/evidence blocker is identified with the next useful action. A screenshot alone is not a root cause.

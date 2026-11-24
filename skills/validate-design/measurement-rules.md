# Measurement and comparison rules

Use user-supplied or design-system tolerances first. Otherwise disclose these defaults before reporting: geometry and spacing ±1 CSS px; numeric typography sizes/line heights/letter spacing ±0.5 CSS px; font weight and resolved font family exact; normalized specified color values exact. These are configurable QA defaults, not accessibility or brand standards. Do not loosen them after seeing a mismatch to manufacture a pass.

## Normalization

| Area | Required handling |
| --- | --- |
| Typography | Read family stack, declared weight, size, line height and letter spacing. Normalize rem/em/percent only with the measured root/parent context. For variable fonts record relevant axes. A computed font-family stack alone does not prove the rendered face; verify font loading/rendered-font evidence when available, otherwise mark actual face unmeasurable. `normal` line-height is not an exact pixel measurement without additional font/layout evidence. |
| Color | Retain original color space and alpha. Normalize equivalent hex/rgb representations to the same RGBA/sRGB values where conversion is supported. Compare alpha as well as channels. Do not compare hex strings against rgb strings directly. Gradients, images, blending, inherited opacity and wide-gamut colors need their own context; unknown conversions are unmeasurable, not rounded into equality. Specified color comparison differs from perceived composited color. |
| Size and layout | Use CSS px and unrounded bounding rectangles; record box sizing, borders, transforms and scroll/container coordinate origin. Compare element positions relative to the mapped container; raw page or Figma canvas coordinates may differ. Do not divide CSS geometry by DPR. A screenshot's pixels may require both DPR and viewer-scale conversion. |
| Spacing | Record computed padding/margins and layout gaps separately from measured visual distances. Account for margin collapse, borders, flex/grid distribution and text line boxes. Figma auto-layout gap is not automatically CSS margin. Compare the rendered relationship and any explicit specification separately. |
| Borders and effects | Record border width/style/color, each corner radius and individual shadow layers. Normalize compatible units; avoid declaring gradients, shadows or radii equal solely from overall screenshot similarity. |
| Assets and content | Compare intended image/icon, aspect ratio, crop/object fit, visible text and states. Absence of design metadata limits exact asset identity. Localized or dynamic content must match the stated scenario or be marked as an intentional variance/unmeasurable comparison. |

Do not round before comparing. For numeric values, store signed delta = actual − expected, units and absolute tolerance; a match has `abs(delta) <= tolerance`. Font family/weight and categorical properties use the declared matching rule, not a numerical pixel tolerance. For color, state whether checking specified values or composited appearance; visual approximation cannot establish an exact color match.

## Evidence record

Each property record contains: comparison ID, role/page ID, Figma file/node and version if known, app element identity, state/viewport, property, raw expected and actual, normalized expected and actual, units, provenance, delta, tolerance/matching rule, result, confidence and artifact/request/message IDs. Missing data must remain null/unknown; never fill it with a guessed value.

- **Match:** both values are available, comparable and within the declared rule.
- **Mismatch:** reliable comparable evidence exceeds the rule, or a confirmed missing/extra element violates the scoped design.
- **Unmatched:** design/app identity cannot be resolved. Show the unmapped side and ambiguity.
- **Unmeasurable:** identity is known but specification or actual measurement is unavailable/unstable/incompatible.

Report an element inventory count separately from property-check counts. For planned property checks, show match + mismatch + unmatched + unmeasurable = total, and count missing/extra elements separately without counting their unavailable properties as passes. Coverage is measured comparable checks / planned checks, not a pass percentage. A partial or visual-only review cannot become a full specification pass.

# Status — 2026-05-17-selected-cell-tint

**State:** first round produced — awaiting review. Not graduated.

## What ran

An interactive colour study, generated directly by Claude Code at Jonas's
request. One page — [`index.html`](index.html) — exploring the active cell as
a darker tint of its own cage colour. Served locally for review (launch.json
config `selected-cell-tint`, port 7582).

| Variant | Direction |
|---------|-----------|
| Reference — current | Cyan surface + brand ring (shipping today) |
| Soft tint | Gentle darker cage tint, dark same-hue ink + ring |
| Deep tint | Stronger darker cage tint, darkest same-hue ink |
| Dark cell, light ink | Deep cage tint, light ink |

## Review notes

_(to be filled on review — which variant.)_

## Next

When a variant is picked it graduates per `specs/design-workflow.md` §5:
the OKLCH transforms become `--cell-selected-*` tokens (light + dark) in
`src/index.css` + `specs/design-tokens.md`, `Cell.tsx` uses them for the
selected cell's background / ring / value ink, and this file is updated to
`graduated → commit <sha>`.

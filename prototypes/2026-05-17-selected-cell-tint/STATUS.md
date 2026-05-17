# Status — 2026-05-17-selected-cell-tint

**State:** **Soft tint graduated** into the Solve screen (2026-05-17).
The other variants are kept as the visual record.

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

## Graduation

The **Soft tint** variant was picked and reproduced in `src/`:

- `src/index.css` — `.cell-selected` / `.cell-selected-ink` rules derive the
  background, ring (`--cell-sel-ring`), and value ink from `--cell-fill` via
  OKLCH, with a dark-mode `@media` override (cages are already dark, so it
  lifts lighter there).
- `src/components/Cell.tsx` — the selected cell takes those classes; the
  ring layer reads `--cell-sel-ring`.
- `specs/design-tokens.md` §2a documents the treatment.

The other variants stay above as the visual record.

# Status — 2026-05-17-solving-shapes

**State:** **variant 11 graduated** into the Solve screen (2026-05-17).
Variants 01–10 remain as the visual record of the exploration.

## What ran

Eleven Solving-screen shape variants, generated directly by Claude Code
(not the Open Design loop) at Jonas's request. All eleven live on a
single page — [`index.html`](index.html) — each rendered at both a 5×5
and an 8×8 grid, with a sticky 01–11 nav.

| # | Anchor | Direction |
|---|--------|-----------|
| 01 | [`#v01`](index.html#v01) | Baseline — ships-today reference |
| 02 | [`#v02`](index.html#v02) | Soft & rounded |
| 03 | [`#v03`](index.html#v03) | Sharp & precise |
| 04 | [`#v04`](index.html#v04) | Board-forward |
| 05 | [`#v05`](index.html#v05) | Keypad-first layout |
| 06 | [`#v06`](index.html#v06) | Big circular keypad |
| 07 | [`#v07`](index.html#v07) | Compact & dense |
| 08 | [`#v08`](index.html#v08) | Card-framed |
| 09 | [`#v09`](index.html#v09) | Full-bleed grid |
| 10 | [`#v10`](index.html#v10) | Inset grid (~10px) |
| 11 | [`#v11`](index.html#v11) | Refined candidate — round keys, Undo in toolbar, gray active, content-width board |

## Graduation

Variant 11 was accepted and reproduced in `src/`:

- `src/screens/SolvingScreen.tsx` — stack reordered to grid → keypad →
  toolbar → hint; Undo moved into the toolbar as a round button.
- `src/components/Keypad.tsx` — circular number keys, no Undo.
- `src/components/Board.tsx` + `Cell.tsx` — the board grows to the full
  content width; cells are square and size-responsive, value font in
  `cqw`; the selected cell takes the selection surface + brand ring and
  its value renders in `--text-cell-selected` (the darker blue).
- New tokens `--surface-active`, `--surface-pressed`, `--text-on-pressed`,
  `--text-cell-selected` in `src/index.css` + `specs/design-tokens.md`;
  the pressed state is the `:active` feedback on `.solve-tool` / `.solve-key`.

Variants 01–10 are kept as the permanent visual record.

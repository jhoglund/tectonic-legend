# Brief — Selected cell, cage-tinted treatment

**Session:** 2026-05-17-selected-cell-tint
**Surface:** the active (selected) cell on the board
**Produced by:** Claude Code directly (not the Open Design loop) — at Jonas's request.

## What this round explores

The active cell ships today as a fixed cyan surface (`surface-cell-selected`)
with a brand-teal ring — a treatment unrelated to the cell's cage. This study
explores making the active cell a **darker tint of its own cage colour**: the
background, the value ink, and the ring all drawn from the cage's hue.

One interactive page (`index.html`); tap a cell to toggle it selected. One
cell per cage is pre-selected so all five cage colours show at once.

## The variants

| Name | Idea |
|------|------|
| Reference — current | The shipping treatment (cyan surface + brand ring) — for comparison. |
| Soft tint | A gentle darker tint of the cage; dark same-hue ring and ink. |
| Deep tint | A stronger darker tint — more present on the board; darkest same-hue ink. |
| Dark cell, light ink | A deep cage tint; the value flips to light for contrast. |

Each is expressed as an OKLCH transform of the cell's cage fill
(`oklch(from var(--cell-fill) …)`) — lightness down, chroma up — so the
treatment re-derives per cage automatically. The exact transforms are in the
`spec` line under each board.

## Constraints honoured

- **Token-faithful** — cage fills, inner borders, and player ink come from
  `src/index.css`; the cage-tint colours are computed from `--cell-fill`.

## Not in scope / caveats

- **Light-mode only.** In light mode "a darker tint" of an already-light cage
  is unambiguous. In dark mode the cages are already dark, so the OKLCH
  lightness targets need separate tuning — deferred to graduation.
- Illustrative board (real cages, placeholder digits); not a solvable puzzle.
- The ring geometry (inset/outset, frame, corners) is already solved in the
  app — this study is only about the *colour* of the selected cell.

## Next

Pick a variant; graduation re-derives the chosen OKLCH transforms as
`--cell-selected-*` tokens (light + dark) in `src/index.css` +
`specs/design-tokens.md`, and `Cell.tsx` uses them for the selected cell's
background, ring, and value ink.

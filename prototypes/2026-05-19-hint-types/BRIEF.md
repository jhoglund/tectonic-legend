# Brief — Hint types, copy & design review

**Session:** 2026-05-19-hint-types
**Surface:** the hint area on the Solve screen — every tip type the engine surfaces
**Produced by:** Claude Code directly (not the Open Design loop) — at Jonas's request.

## What this round explores

The hint engine can surface eight different tip types. Their copy and card
design have grown piecemeal. This prototype puts all eight on one interactive
screen so the wording and the visual treatment can be reviewed and nailed in
one pass.

One interactive page (`index.html`): a fixed 5×5 board with a coordinate
gutter, a tab per tip type, and the hint card / contradiction stepper below.

## The eight tip types

| Tab | Engine type | UI |
|-----|-------------|----|
| Naked single | `naked_single` | Simple card |
| Hidden single | `hidden_single` | Simple card |
| Forced move | `domination` | Simple card |
| Pair elimination | `pair_elimination` | Simple card |
| Contradiction | `contradiction` | Stepper — 8 steps, ‹ › nav, dot track |
| Candidates | `candidates` | Simple card |
| Reveal | `reveal` | Simple card |
| Check | `check` | Simple card |

## Interactive

- Tabs switch the tip type — the board highlight and the hint area update.
- The contradiction chain steps with ‹ › or the dot track; the board shows the
  assumption / deductions / contradiction building up.
- Cell references — "A3", "B4" — render as tappable monospace tokens. Tapping
  one marks that cell on the board (brand outline). This is the
  reference-tapping behaviour shipping today, here for review.

## What to give feedback on

- **Copy** — the wording of every tip. The text mirrors what the engine emits
  today (mixed "cage" everywhere; the simple cards still say "This cell"
  rather than naming the cell). All of it is a starting point to rewrite.
- **Design** — the card, the brand badge, the contradiction stepper (step
  counter, nav, dot track), the cell-reference token treatment, and how the
  board highlight reads against each card.

## Constraints honoured

- **Token-faithful** — surfaces, cage fills, hint-chain role colours, radii
  and fonts are mirrored from `src/index.css`.

## Not in scope / caveats

- **Light-mode only.**
- Illustrative board — one fixed example, not a solvable puzzle. The eight
  tips reuse it; each is a plausible example, not a proven deduction.
- The keypad and toolbar are omitted — this round is only the hint area.

## Next

Jonas reviews, gives copy + design feedback per tip; a refinement pass folds
the agreed wording and treatment back into `src/engine/hints.ts`,
`ContradictionStepper.tsx`, `HintText.tsx` and the Solve screen.

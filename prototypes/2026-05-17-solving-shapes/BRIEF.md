# Brief — Solving screen, shape exploration

**Session:** 2026-05-17-solving-shapes
**Surface:** the Solving screen (`src/screens/SolvingScreen.tsx`)
**Produced by:** Claude Code directly (not the Open Design loop) — at Jonas's request.

## What this round explores

Eight design directions for the Solving screen, varying:

- **Grid / cell size** — how large the board cells are at 5×5 and 8×8.
- **Corner radius** — board container, toolbar buttons, keypad keys, cards.
- **Number-key (keypad) shape & size** — square vs circular, small vs large.
- **Toolbar-button shape & size** — the Notes / Hint / Validate / Clear bar.
- **Layout order** — the current board → toolbar → keypad order vs. a
  **keypad-first** layout (number keys directly under the grid, the
  toolbar below them).

Every variant is rendered at **both** a 5×5 and an 8×8 grid so the
layout can be judged coping with the small and the large board.

## The 8 variants

| # | Name | Idea |
|---|------|------|
| 01 | Baseline | The screen as it ships today — the reference point. |
| 02 | Soft & rounded | Generous radius everywhere; pill buttons; the friendliest read. |
| 03 | Sharp & precise | Minimal radius; crisp, engineered, logic-serious. |
| 04 | Board-forward | Large cells; compact toolbar + keypad so the board is the hero. |
| 05 | Keypad-first layout | Keypad directly under the board, toolbar below — baseline sizing otherwise. |
| 06 | Big circular keypad | Large circular keys under the board; compact pill toolbar; keypad-first. |
| 07 | Compact & dense | Smaller cells/keys, slim toolbar, tight gaps — fits a small phone. |
| 08 | Card-framed | Board, toolbar, and keypad each in their own elevated card. |

## Constraints honoured

- **Token-faithful** — every colour, font, shadow, and the cage-fill /
  inner-border system come straight from `src/index.css`
  (`specs/design-tokens.md`). Light + dark both included.
- The board uses the real cage graph-colouring and border model
  (thick cage edges, thin inner edges, container draws the frame).
- The chrome (nav bar, status row, hint card, toolbar, keypad) mirrors
  the shipping screen's structure.

## Not in scope / caveats

- **The boards are illustrative, not solvable puzzles.** Cage shapes
  and sizes are real and contiguous; the digits are placeholder fill so
  the screen reads as mid-solve. This round is about shape, not logic.
- No interaction — these are static layout studies.
- Hint-chain / contradiction-stepper states are not shown (a single
  resolved hint card stands in for the hint area).

## How they were generated

`build.mjs` in this folder emits all 8 variant files + `index.html`
from one shared renderer and a per-variant config table. Re-run with
`node prototypes/2026-05-17-solving-shapes/build.mjs`. It is kept for
provenance and so a refined round is a config edit, not a rewrite.

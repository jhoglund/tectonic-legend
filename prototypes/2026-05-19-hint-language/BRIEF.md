# Brief — Hint visual language, all types aligned

**Session:** 2026-05-19-hint-language
**Surface:** the Solve screen — every hint type the engine surfaces
**Produced by:** Claude Code directly (not the Open Design loop) — at Jonas's request.

## What this round explores

The `2026-05-19-forced-move-causes` study landed a **value-set chip** for a
constrained region of empty cells. Jonas asked to align every other hint type
to the same visual language. This page puts all eight hint types on one
interactive screen, each drawn from one shared set of elements:

- **Candidate-note grid** (ADR-0015) — a single cell's reasoning: values
  struck, the survivor in green; or, for Candidates, just the open values.
- **Value-set chip** — a region of empty cells constrained to a known set,
  drawn as a horizontal blue pill (never the 3-column note grid). Small
  regions show it in every cell; larger regions show it once.
- **Rings** — green for a concluded cell, blue for evidence, amber for a cell
  under work, red for a clash.
- **Role colours** in steppers — assumption amber, deduction blue,
  contradiction red, conclusion green.

One interactive page (`index.html`): a fixed 5×5 board (one cage layout for
every tab — cage P a 4-cell L, cage Q a 2-cell pair), a tab per hint type,
and the hint card / stepper below.

## The eight hint types

| Tab | Engine type | What it shows |
|-----|-------------|---------------|
| Naked single | `naked_single` | Target note grid; placed causes ringed blue; an empty cause region as a value-set chip |
| Hidden single | `hidden_single` | The single home for a value — green ring + green value |
| Forced move | `domination` | Target note grid; the dominating L-cage as a value-set chip |
| Pair elimination | `pair_elimination` | Stepper — the locked pair as a chip; the affected cell loses values |
| Contradiction | `contradiction` | Stepper — assumption → deductions → clash → conclusion, ringed by role |
| Candidates | `candidates` | A plain note grid of the still-open values |
| Reveal | `reveal` | A given answer — green ring + green value |
| Check | `check` | Wrong entries on a red wash with a red ring |

## Interactive

- Tabs switch the hint type — board and hint card update together.
- The Pair elimination and Contradiction steppers walk with ‹ › or the dots.
- Cell references in the copy ("C2", "B4") are tappable monospace tokens;
  tapping one marks that cell.

## What to give feedback on

- **Consistency** — does one visual language hold across all eight types?
- The note grid vs the value-set chip — is the single-cell / region split
  clear?
- Copy of each hint card and the two walkthroughs.

## Constraints honoured

- **Token-faithful** — surfaces, cage fills, hint-chain role colours, radii
  and fonts mirrored from `src/index.css`.

## Not in scope / caveats

- **Light-mode only.**
- Illustrative board — one fixed cage layout, not a solvable puzzle. Each tab
  is a plausible example, not a proven deduction.
- The keypad and toolbar are omitted — this round is only board + hint area.
- The value-set chip's exact treatment (every cell / once / tap-to-reveal) is
  reviewed separately in `2026-05-19-forced-move-causes`; here it uses the
  size-based default (every cell for ≤2, once for larger).

## Next

Jonas reviews; a refinement pass folds the agreed language back into
`src/engine/hints.ts`, `Cell.tsx`, `Board.tsx` and the stepper components.

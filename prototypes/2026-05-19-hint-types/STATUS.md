# Status — 2026-05-19-hint-types

**State:** **Captured — awaiting review.**

## What ran

An interactive review screen, generated directly by Claude Code at Jonas's
request. One page — [`index.html`](index.html) — showing all eight hint tip
types on a fixed 5×5 board with a coordinate gutter. Served locally for
review (launch.json config `hint-types`, port 7583).

| Tab | UI |
|-----|----|
| Naked single, Hidden single, Forced move, Pair elimination | Simple card |
| Contradiction | 8-step stepper with ‹ › nav + dot track |
| Candidates, Reveal, Check | Simple card |

Cell references are tappable monospace tokens; tapping marks the cell.

## Purpose

Review and nail the **copy** of every tip and the **design** of the hint card,
the badge, the contradiction stepper and the cell-reference token — in one
place rather than reverse-engineering each from a live solve.

## Next

Jonas reviews and gives per-tip feedback. A refinement pass then folds the
agreed copy + treatment into the engine and hint UI components.

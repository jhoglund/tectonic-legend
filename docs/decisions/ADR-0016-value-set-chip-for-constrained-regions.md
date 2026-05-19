# ADR-0016: Value-set chip for a hint's constrained region

**Date:** 2026-05-19
**Status:** Accepted
**Source:** Extends [ADR-0015](ADR-0015-notes-as-hint-visual-language.md) — candidate notes as the hint visual language. Prototyped in `prototypes/2026-05-19-forced-move-causes/` and `prototypes/2026-05-19-hint-language/`.

## Context

ADR-0015 made the candidate-note grid the shared language for deductive hints: the target cell shows its candidates, struck down to the survivor. That covers reasoning *about one cell*.

But a hint often leans on a *region of still-empty cells*. The Forced move (cage domination) is the clearest case: the dominated cell can't be 1..N because an adjacent N-cell cage holds the whole set 1..N. The cage is empty — there is no value to show — yet the player needs to see *what that region holds* to follow the deduction. On the board today the cage is just blank cells; the reasoning is invisible.

A region's value-set can't be drawn as a candidate-note grid: notes are a single cell's pencil marks, and repeating a 3-column grid across every cage cell reads as the player's own marks and crowds a 4-cell L cage.

## Decision

Draw a hint's constrained region as a **value-set chip** — a distinct element alongside the candidate-note grid.

- A `Hint` carries `regions: { cells, set }[]` — regions of empty cells that collectively hold a known value-set. The Forced move (`domination`) emits its dominating cage; `set` is `1..cageSize`.
- The chip is a **single horizontal row of digits on a tinted blue pill** — deliberately unlike the 3-column note grid, so "this region holds these values" never reads as pencil marks.
- The region's cells are ringed in the deduction blue (`cell-deduction`) — the same evidence colour used by the contradiction stepper.
- The chip is drawn **once** for a region larger than two cells (on the cell nearest the target), and in **every cell** of a one- or two-cell region. This keeps a 4-cell L cage from repeating the same set four times.
- New tokens `hint-region-fill` / `hint-region-line` (design-tokens §4); the digit ink is `cell-deduction`.

## Consequences

- **Enables:** the Forced move's reasoning is now on the board — the player sees the dominating cage and the set it holds, not just a blank region. The chip is a reusable element: any future hint that leans on a constrained empty region (locked pairs, naked subsets) can emit a `regions` entry and get the same treatment.
- **Costs:** `Cell.tsx` grows a third content mode (chip) beside value and note grid, and a third ring (blue evidence) beside selection and hint rings; `Board.tsx` routes the region and picks the chip-bearing cell. Two new tokens.
- **Implies:** only the `domination` hint emits `regions` for now — pair elimination keeps its existing notes-stepper (ADR-0015). Extending the chip to the pair-elimination cause region is a deliberate follow-up, not part of this change.

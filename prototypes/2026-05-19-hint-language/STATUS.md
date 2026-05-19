# Status — 2026-05-19-hint-language

**State:** **Awaiting review.** Built 2026-05-19.

## What it is

One interactive page — [`index.html`](index.html) — putting all eight hint
types on a single shared visual language: the candidate-note grid (ADR-0015)
for single-cell reasoning, the value-set chip for a constrained region of
empty cells, and a consistent ring palette (green concluded, blue evidence,
amber under-work, red clash).

A tab per hint type — Naked single, Hidden single, Forced move, Pair
elimination, Contradiction, Candidates, Reveal, Check — over one fixed 5×5
cage layout. Pair elimination and Contradiction are steppers.

Served locally (launch.json config `hint-language`, port 7586).

## Why

Follows the `2026-05-19-forced-move-causes` value-set chip study — Jonas asked
to align the same language across every hint type.

## Next

Jonas reviews; the refinement pass folds the agreed language into
`src/engine/hints.ts`, `Cell.tsx`, `Board.tsx` and the stepper components.

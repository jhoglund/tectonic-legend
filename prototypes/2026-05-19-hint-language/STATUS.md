# Status — 2026-05-19-hint-language

**State:** **Graduated** (2026-05-19) — confirmed the shared language; the
value-set chip shipped in `src/`.

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

## Graduation

This study confirmed that all eight hint types already share one visual
language — the candidate-note grid (ADR-0015), role-coloured rings and
steppers were shipped; only the **value-set chip** was new. The chip
shipped for the Forced move (`domination`) hint — commit `c6235b4`,
[ADR-0016](../../docs/decisions/ADR-0016-value-set-chip-for-constrained-regions.md).
The size-based chip-placement rule (every cell ≤2, once otherwise) was
taken from here. Extending the chip to the pair-elimination cause
region is a noted follow-up, not part of this graduation.

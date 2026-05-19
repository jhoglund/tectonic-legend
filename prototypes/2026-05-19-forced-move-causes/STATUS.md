# Status — 2026-05-19-forced-move-causes

**State:** **Graduated** (2026-05-19) — the value-set chip shipped in `src/`.

## What it is

One interactive page — [`index.html`](index.html) — exploring how to preview
the **value-set of a constrained empty region** in a Forced move hint.

A scenario toggle compares a **2-cell pair** (`{1,2}`) against a crowded
**4-cell L cage** (`{1,2,3,4}`). Four treatment tabs:

- **Plain (today)** — region ringed but blank.
- **Set in every cell** — value-set chip in every region cell.
- **Set shown once** — chip on one region cell only; the rest ringed.
- **Tap to reveal** — dashed cell-refs in the hint text reveal each cell's chip.

The preview is a blue value-set chip — a horizontal digit row on a pill,
deliberately unlike the 3-column pencil-mark note grid.

Served locally (launch.json config `forced-move-causes`, port 7585).

## Graduation

The value-set chip shipped for the Forced move (`domination`) hint —
commit `c6235b4`, [ADR-0016](../../docs/decisions/ADR-0016-value-set-chip-for-constrained-regions.md).
Of the four treatments here, the implementation took the size-based
default the `2026-05-19-hint-language` study settled on: the chip in
every cell of a one/two-cell region, once (on the cell nearest the
target) for a larger one. Tap-to-reveal was not graduated.

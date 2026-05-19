# Status — 2026-05-19-forced-move-causes

**State:** **Awaiting review.** Built 2026-05-19.

## What it is

One interactive page — [`index.html`](index.html) — exploring how to show the
**cause cells** of a Forced move hint: the cells that already hold the values
struck off the target.

Four tabs on a fixed 5×5 board (target B4, causes B3 / C3 / A4 / A5):

- **Plain (today)** — baseline, target notes only.
- **Cause rings** — cause cells ringed blue, matching struck digit turns blue.
- **Cause tags** — rings plus a `−N` tag naming the value each cause knocks out.
- **Stepped** — walk the deduction one cause at a time.

Served locally (launch.json config `forced-move-causes`, port 7585).

## Next

Jonas reviews and picks a treatment; the refinement pass folds it into
`Cell.tsx` / `Board.tsx` and the `domination` path of `src/engine/hints.ts`.

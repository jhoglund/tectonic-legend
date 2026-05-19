# Brief — Forced move, previewing a constrained region

**Session:** 2026-05-19-forced-move-causes
**Surface:** the Solve screen — the Forced move hint and its board
**Produced by:** Claude Code directly (not the Open Design loop) — at Jonas's request.

## The problem

A Forced move draws candidate notes in the target cell: 1–4 struck, 5 left
in green (ADR-0015). But the deduction usually leans on cells that are still
**empty**. We can't show a value there — yet we often know the **value-set**
a region of empty cells must hold between them:

- A **2-cell pair** (e.g. B3 + C3) constrained to `{1, 2}`.
- A **4-cell L-shaped cage** constrained to `{1, 2, 3, 4}`.

The board never previews that set today, so the player sees *that* a value is
blocked, not *why*. The 2-cell case is easy — only two numbers. The 4-cell L
risks being crowded, and whatever we draw must **not** read as the player's
own pencil-mark notes.

## What this round explores

Ways to preview a constrained empty region's value-set. One interactive page
(`index.html`): a 5×5 board, a tab per treatment, and a scenario toggle so
each treatment can be judged on **both** region sizes.

The preview is a **value-set chip** — a single horizontal row of digits on a
faint blue pill, deliberately unlike the 3-column note grid.

## Scenarios (toggle)

| Scenario | Region | Set |
|----------|--------|-----|
| 2-cell pair | B3 + C3 (empty) | `{1, 2}` |
| 4-cell L cage | C2 + C3 + C4 + B4 (empty) | `{1, 2, 3, 4}` |

## Treatments (tabs)

| Tab | Treatment |
|-----|-----------|
| Plain (today) | Region ringed but blank — the gap as it stands |
| Set in every cell | The chip in every region cell — roomy for a pair, crowded for the L |
| Set shown once | The chip on one region cell (nearest the target); the rest just ringed |
| Tap to reveal | Region ringed and blank; dashed cell-refs in the hint text reveal each cell's chip on tap |

## Interactive

- Tabs switch the treatment; the toggle switches scenario.
- Cell references in the hint copy are tappable. In **Tap to reveal**, refs
  that name a region cell are dashed — tapping one lights that cell and shows
  its value-set chip.

## What to give feedback on

- **Which treatment** previews the set clearly without crowding — especially
  for the 4-cell L.
- Whether the chip reads as distinct from pencil-mark notes.
- Copy of the hint card.

## Constraints honoured

- **Token-faithful** — surfaces, cage fills, hint-chain role colours, radii
  and fonts mirrored from `src/index.css`. The set chip uses a blue clearly
  apart from the cage-tinted note ink.

## Not in scope / caveats

- **Light-mode only.**
- Illustrative boards — fixed examples, not solvable puzzles.
- The keypad and toolbar are omitted — this round is only board + hint area.

## Next

Jonas picks a treatment; a refinement pass folds it into `Cell.tsx` /
`Board.tsx` and the `domination` / pair-elimination paths of
`src/engine/hints.ts`, so a Forced move hint can carry the constrained
value-set of its cause region.

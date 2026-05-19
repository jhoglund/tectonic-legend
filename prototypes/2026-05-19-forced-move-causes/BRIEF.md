# Brief — Forced move, showing the cause cells

**Session:** 2026-05-19-forced-move-causes
**Surface:** the Solve screen — the Forced move hint and its board
**Produced by:** Claude Code directly (not the Open Design loop) — at Jonas's request.

## The problem

A Forced move hint draws candidate notes in the target cell: 1–4 struck,
5 left in green (ADR-0015). It reads as "1, 2, 3 and 4 are blocked" — but
the board never says **where** those values already sit. The player can see
*that* a value is ruled out, not *why*.

Jonas's note: for the Forced move on B4, it would help to show the 1 and 2
in B3 and C3 (and the rest) so it's clear those cells are the cause of 1 and
2 being struck for B4.

## What this round explores

Ways to surface the **cause cells** — the cells that block each value — next
to the target. One interactive page (`index.html`): a fixed 5×5 board with a
coordinate gutter, the Forced move hint card, and a tab per design option.

The example: **B4** is the target. Its neighbours **B3 / C3** hold 1 / 2;
its cage-mates **A4 / A5** hold 3 / 4 — so B4 is forced to 5.

## The tabs

| Tab | Treatment |
|-----|-----------|
| Plain (today) | Baseline — target notes only, no cause cells marked |
| Cause rings | Each cause cell ringed blue; the matching struck digit in B4 turns blue |
| Cause tags | Same rings, plus a `−N` tag in each cause naming the value it knocks out |
| Stepped | Walk the deduction one cause at a time, striking values in sync |

## Interactive

- Tabs switch the treatment — board and hint card update together.
- The Stepped tab steps with ‹ › or the dot track.
- Cell references in the copy ("B3", "C3", …) are tappable monospace tokens;
  tapping marks that cell.

## What to give feedback on

- **Which treatment** reads clearest without crowding the board.
- Whether the blue colour-link (struck digit ↔ ringed cell) lands, or whether
  the `−N` tag / the thread is needed to make the link explicit.
- Copy of the hint card and the stepped walkthrough.

## Constraints honoured

- **Token-faithful** — surfaces, cage fills, hint-chain role colours, radii
  and fonts mirrored from `src/index.css`. Cause cells use the deduction blue.

## Not in scope / caveats

- **Light-mode only.**
- Illustrative board — one fixed example, not a solvable puzzle.
- The keypad and toolbar are omitted — this round is only board + hint area.

## Next

Jonas picks a treatment; a refinement pass folds it into `Cell.tsx` /
`Board.tsx` and the Forced move (`domination`) path of `src/engine/hints.ts`,
so the hint carries its cause cells alongside the candidate notes.

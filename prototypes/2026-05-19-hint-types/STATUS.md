# Status — 2026-05-19-hint-types

**State:** **Graduated** into the hint engine and Solve screen (2026-05-19).

## What ran

An interactive review screen, generated directly by Claude Code at Jonas's
request. One page — [`index.html`](index.html) — showing all eight hint tip
types on a fixed 5×5 board with a coordinate gutter. Served locally
(launch.json config `hint-types`, port 7583).

It established **candidate notes as the shared visual language for deductive
hints** ([ADR-0015](../../docs/decisions/ADR-0015-notes-as-hint-visual-language.md)):
the target cell shows its candidate grid, values crossed off with a reason,
the answer in green; pair elimination walks it step by step.

## Graduation

Reproduced in `src/` over three commits:

- **`6ef79f3`** — the engine emits a per-hint `notes` script; `Cell.tsx` draws
  it. Naked single, forced move, candidates, hidden single.
- **`9af61af`** — pair elimination becomes a candidate-notes stepper
  (`findDeductiveHint` emits a stepped script; new `NotesStepper`).
- **`2a186e4`** — the note-tint study (spun off as `2026-05-19-note-tint`)
  graduated the cage-tinted note ink.

The Contradiction stepper was left as it was; Reveal and Check keep their text
cards. The board is illustrative — not a solvable puzzle — so the prototype
stays as the visual record.

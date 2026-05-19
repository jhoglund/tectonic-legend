# Status — 2026-05-19-note-tint

**State:** **"Tint · light" graduated** into the board (2026-05-19).
The other variants are kept as the visual record.

## What ran

A focused colour study, generated directly by Claude Code at Jonas's request,
spun off the `hint-types` pair-elimination review. One page —
[`index.html`](index.html) — drawing the candidate notes as a tint of their
own cage colour instead of flat grey. Served locally (launch.json config
`note-tint`, port 7584).

| Variant | Note ink |
|---------|----------|
| Tint · soft | `oklch(from cage · l 0.56 · c ×1.8)` |
| **Tint · light** | **`oklch(from cage · l 0.66 · c ×1.5)` — picked** |
| Tint · deep | `oklch(from cage · l 0.47 · c ×2.1)` |
| Reference · flat grey | `var(--text-secondary)` — the treatment before |

## Graduation

The **Tint · light** variant was picked and reproduced in `src/`:

- `src/index.css` — `--cage-N-note` (×5) derive the note ink from each cage
  fill via OKLCH (`l 0.66` light / `l 0.70` dark, `c ×1.5`); `.cage-N`
  exposes it per cell as `--cell-note`.
- `src/components/Cell.tsx` — pencil-mark notes use `--cell-note` instead of
  the flat `text-slate-400`.
- `specs/design-tokens.md` §2 documents `cage-N-note` / `cell-note`.

The `hint-types` prototype's pair-elimination notes-stepper was updated to
the same tint. The other variants stay above as the visual record.

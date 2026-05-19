# Brief — Candidate notes, cage-tint study

**Session:** 2026-05-19-note-tint
**Surface:** the pencil-mark candidate notes inside a cell
**Produced by:** Claude Code directly — at Jonas's request, off the hint-types review.

## What this round explores

Candidate notes ship as a flat grey. This study draws them instead as a
**tint of their own cage colour** — a softer, lighter ink that belongs to
the cell. Came out of reviewing the pair-elimination notes-stepper in the
`hint-types` prototype.

One interactive page (`index.html`): a 5×5 board, one notes cell per cage so
every cage tint is visible; each carries notes 1–5 with 2 and 5 struck out.
Each tab is one treatment.

## The variants

| Tab | Note ink |
|-----|----------|
| Tint · soft | `oklch(from cage · l 0.56 · c ×1.8)` — medium cage tint |
| Tint · light | `oklch(from cage · l 0.66 · c ×1.5)` — lighter, gentler |
| Tint · deep | `oklch(from cage · l 0.47 · c ×2.1)` — deeper, near the player ink |
| Reference · flat grey | `var(--text-secondary)` — the treatment today |

Each tint is an OKLCH transform of `--cell-fill`, so it re-derives per cage.
Struck-out notes keep the same ink plus a line-through.

## Constraints honoured

- **Token-faithful** — cage fills and the player ink come from `src/index.css`;
  the note tints are computed from `--cell-fill`.

## Not in scope

- Light-mode only — dark-mode lightness targets tune at graduation.
- The survivor/answer note (green) is settled elsewhere — not varied here.

## Next

Jonas picks a variant. Graduation derives it as a `--cell-note` token
(light + dark) in `src/index.css` + `specs/design-tokens.md`, feeds `Cell.tsx`'s
note rendering, and updates the `hint-types` pair-elimination notes-stepper.

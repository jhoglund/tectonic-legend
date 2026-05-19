# Status — 2026-05-19-note-tint

**State:** **Captured — awaiting review.**

## What ran

A focused colour study, generated directly by Claude Code at Jonas's request,
spun off the `hint-types` pair-elimination review. One page —
[`index.html`](index.html) — drawing the candidate notes as a tint of their
own cage colour instead of flat grey. Served locally for review (launch.json
config `note-tint`, port 7584).

| Variant | Note ink |
|---------|----------|
| Tint · soft | `oklch(from cage · l 0.56 · c ×1.8)` |
| Tint · light | `oklch(from cage · l 0.66 · c ×1.5)` |
| Tint · deep | `oklch(from cage · l 0.47 · c ×2.1)` |
| Reference · flat grey | `var(--text-secondary)` — today |

One notes cell per cage so every cage tint is visible at once.

## Next

Jonas picks a variant. Graduation derives a `--cell-note` token and feeds
`Cell.tsx`'s note rendering, plus the `hint-types` notes-stepper.

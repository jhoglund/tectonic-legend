# Brief — State animations

**Session:** 2026-05-17-state-animations
**Surface:** transitions for state changes on the Solving screen
**Produced by:** Claude Code directly (not the Open Design loop) — at Jonas's request.

## What this round explores

Gentle motion for the moments a control or cell *changes state*. The
brief is deliberately small — "don't overdo it." A single interactive
page (`index.html`); tap any sample to play it.

Three examples, each with a few variations:

1. **Button state change** — a button toggling its active (toggle-on)
   state and showing the pressed state. Variants: no transition / fast
   (120ms) / base (200ms) on the background, border, and colour.
2. **Number enters a cell** — a placed number grows into place as its
   colour settles. Variants: *Grow* (scale 0.6→1 + fade, 120ms),
   *Grow + ink settle* (scale 0.7→1, brand→ink, 200ms), *Soft*
   (scale 0.92→1 + fade, 200ms).
3. **Active-cell ring** — the brand ring easing in on selection.
   Variants: *Fade in* (box-shadow, 120ms), *Scale in* (ring scales
   1.14→1 + fade, 160ms).

## Constraints honoured

- **Token-faithful** — colours, fonts, cage fills, and the control
  tokens (`surface-active`, `surface-pressed`, `text-cell-selected`)
  come from `src/index.css`. Light + dark both work.
- **Motion tokens** — durations are the categorical tokens from
  design-tokens §10: `motion-fast` 120ms / `motion-base` 200ms,
  `ease-out`. **No overshoot, no springs** — per the brand voice.
- Honours `prefers-reduced-motion` (durations collapse to ~0).

## Not in scope

- This is an isolated motion study — not wired into the app.
- The error/validate flash, hint-chain cascade, and stage-up reveal
  have their own motion already / are out of this round.

## Next

Pick a variant per example; the graduation reproduces the chosen
transitions in `src/components/Cell.tsx`, the `.solve-*` control
classes in `src/index.css`, and updates `STATUS.md` to graduated.

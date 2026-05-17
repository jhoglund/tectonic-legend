# Status — 2026-05-17-state-animations

**State:** **graduated** into the Solve screen (2026-05-17). The other
variants are kept as the visual record of the exploration.

## What ran

An interactive motion study, generated directly by Claude Code at
Jonas's request. One page — [`index.html`](index.html) — with three
examples, each offering a few variations. Served locally for review
(launch.json config `state-animations`, port 7581).

| # | Example | Variants |
|---|---------|----------|
| 1 | Button state change | No transition / Fast 120ms / Base 200ms |
| 2 | Number enters a cell | Grow / Grow + ink settle / Soft |
| 3 | Active-cell ring | Fade in / Scale in |

## Graduation

Picked and reproduced in `src/`:

| # | Example | Chosen variant |
|---|---------|----------------|
| 1 | Button state change | **Base** — 200ms ease-out |
| 2 | Number enters a cell | **Grow + ink settle** — scale 0.7→1, brand→ink, 200ms |
| 3 | Active-cell ring | **Fade in** — 120ms ease-out |

- `src/index.css` — `.solve-tool` / `.solve-undo` / `.solve-key` gain a
  `motion-base` colour transition; `@keyframes cell-value-enter` and
  `cell-ring-in`; plus a `prefers-reduced-motion` guard.
- `src/components/Cell.tsx` — a player-entered value runs
  `cell-value-enter` (keyed by value so each entry replays); the
  selection ring became a child layer that fades in via `cell-ring-in`;
  the cell's state transitions run at `motion-fast`.

The unused variants stay above as the visual record.

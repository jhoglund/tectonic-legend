# Status — 2026-05-17-state-animations

**State:** first round produced — awaiting review. Not graduated.

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

## Review notes

_(to be filled on review — which variant per example.)_

## Next

When a variant is picked per example, it graduates per
`specs/design-workflow.md` §5: reproduce the transitions in
`src/components/Cell.tsx` and the `.solve-tool` / `.solve-key` classes
in `src/index.css`, confirm the motion tokens cover the durations
used, and update this file to `graduated → commit <sha>`.

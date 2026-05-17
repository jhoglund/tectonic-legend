# Status — 2026-05-17-solving-shapes

**State:** first round produced — awaiting review. Not graduated.

## What ran

Eleven Solving-screen shape variants, generated directly by Claude Code
(not the Open Design loop) at Jonas's request. All eleven live on a
single page — [`index.html`](index.html) — each rendered at both a 5×5
and an 8×8 grid, with a sticky 01–11 nav.

| # | Anchor | Direction |
|---|--------|-----------|
| 01 | [`#v01`](index.html#v01) | Baseline — ships-today reference |
| 02 | [`#v02`](index.html#v02) | Soft & rounded |
| 03 | [`#v03`](index.html#v03) | Sharp & precise |
| 04 | [`#v04`](index.html#v04) | Board-forward |
| 05 | [`#v05`](index.html#v05) | Keypad-first layout |
| 06 | [`#v06`](index.html#v06) | Big circular keypad |
| 07 | [`#v07`](index.html#v07) | Compact & dense |
| 08 | [`#v08`](index.html#v08) | Card-framed |
| 09 | [`#v09`](index.html#v09) | Full-bleed grid |
| 10 | [`#v10`](index.html#v10) | Inset grid (~10px) |
| 11 | [`#v11`](index.html#v11) | Refined candidate — round keys, Undo in toolbar, gray active, content-width board |

## Review notes

_(to be filled on review — which direction, or which axes to carry
into a refined round.)_

## Next

If a direction is picked, it graduates per `specs/design-workflow.md`
§5: reproduce the decisions in `src/screens/SolvingScreen.tsx` (and
`Keypad.tsx` / the toolbar / `Board.tsx`), add any new tokens to both
`src/index.css` and `specs/design-tokens.md`, and update this file to
`graduated → commit <sha>`. If a refined round is wanted, it is a
config edit in `build.mjs` copied to a `-v2` session folder.

# Status — 2026-05-17-solving-shapes

**State:** first round produced — awaiting review. Not graduated.

## What ran

Eight Solving-screen shape variants, generated directly by Claude Code
(not the Open Design loop) at Jonas's request. Each variant renders at
both a 5×5 and an 8×8 grid.

| # | Folder | Direction |
|---|--------|-----------|
| 01 | [`01-baseline/`](01-baseline/index.html) | Ships-today reference |
| 02 | [`02-soft/`](02-soft/index.html) | Soft & rounded |
| 03 | [`03-sharp/`](03-sharp/index.html) | Sharp & precise |
| 04 | [`04-big-board/`](04-big-board/index.html) | Board-forward |
| 05 | [`05-keypad-first/`](05-keypad-first/index.html) | Keypad-first layout |
| 06 | [`06-big-keypad/`](06-big-keypad/index.html) | Big circular keypad |
| 07 | [`07-compact/`](07-compact/index.html) | Compact & dense |
| 08 | [`08-card-framed/`](08-card-framed/index.html) | Card-framed |

Side-by-side: [`index.html`](index.html).

## Review notes

_(to be filled on review — which direction, or which axes to carry
into a refined round.)_

## Next

If a direction is picked, it graduates per `specs/design-workflow.md`
§5: reproduce the decisions in `src/screens/SolvingScreen.tsx` (and
`Keypad.tsx` / the toolbar), add any new tokens to both `src/index.css`
and `specs/design-tokens.md`, and update this file to
`graduated → commit <sha>`. If a refined round is wanted, it is a
config edit in `build.mjs` copied to a `-v2` session folder.

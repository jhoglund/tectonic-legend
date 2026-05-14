# Status — swarm-2026-05-14

**State:** prepared, awaiting 8 Open Design runs
**Started:** 2026-05-14
**Skill:** `@frontend-skill` (all variants)

## Per-variant state

| # | Slug | State |
|---|------|-------|
| 01 | `01-ios-native` | prepared |
| 02 | `02-material-cross-platform` | prepared |
| 03 | `03-gesture-first` | prepared |
| 04 | `04-conversational` | prepared |
| 05 | `05-console-power-user` | prepared |
| 06 | `06-editorial` | prepared |
| 07 | `07-game-progression` | prepared |
| 08 | `08-daily-ritual` | prepared |

State machine per variant: `prepared → running → produced → reviewed → graduated` or `prepared → running → produced → rejected`.

## After each variant produces output

Update its row above. Variant's own `STATUS.md` (inside its folder) carries the detail.

## After review

When Jonas has reviewed N variants (need not be all 8), update this file with:
- `Chosen direction:` — which variant or hybrid
- `Rationale:` — 2–4 sentences
- `Graduated commit:` — the commit on main that ports the chosen direction into `src/`
- `Rejected variants:` — and what they taught us (often the most useful)

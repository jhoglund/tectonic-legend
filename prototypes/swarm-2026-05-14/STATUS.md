# Status — swarm-2026-05-14

**State:** all 8 variants produced — awaiting review
**Started:** 2026-05-14
**Produced:** 2026-05-14 (same day, via Agent-tool subagents in this Claude Code session — not via Open Design's CLI-spawn path, which is blocked from inside a Claude Code session)
**Skill (intended):** `@frontend-skill` (Open Design)

## Per-variant state

| # | Slug | State | Notes from the agent that produced it |
|---|------|-------|---------------------------------------|
| 01 | `01-ios-native` | produced | Apple HIG taken literally — bottom tabs, large titles, sheets, inset-grouped lists. Open Q on solving-screen density. |
| 02 | `02-material-cross-platform` | produced | Material 3 vocabulary, restrained palette, peek bottom sheet for the stepper. Open Q on whether Practice should be a bottom-nav peer. |
| 03 | `03-gesture-first` | produced | No tab bar, no FAB. Gesture annotations in corners so a static reviewer can read the model. Open Q on top-corner pull-down affordance discoverability. |
| 04 | `04-conversational` | produced | Hint engine as conversational presence across every screen. Pending status detail. |
| 05 | `05-console-power-user` | produced | Linear-density variant. Pending status detail. |
| 06 | `06-editorial` | produced | Magazine-paced. Pull-quote stage-up. Open Q on whether "Continue" is the right verb on stage-up (vs. "Back to today"). |
| 07 | `07-game-progression` | produced | Journey-forward with a quiet topographic path graphic on Home. Pending status detail. |
| 08 | `08-daily-ritual` | produced | Daily puzzle as Home anchor. Pending status detail. |

## How to review

Open [`index.html`](index.html) in a browser for the grid of all 8 variants. Click a variant to open its 8-screen reviewer. Each variant's reviewer has a sticky nav for switching between Auth / Onboarding / Home / New Game / Solving / Solved / Stats / Stage-up.

To open from CLI:
```bash
open prototypes/swarm-2026-05-14/index.html
```

Or import the swarm folder into Open Design as a project to use its Design Files panel as the reviewer.

## After review

Update this file with:
- `Chosen direction:` — which variant or hybrid
- `Rationale:` — 2–4 sentences
- `Graduated commit:` — the commit on main that ports the chosen direction into `src/`
- `Rejected variants:` — and what they taught us (often the most useful)

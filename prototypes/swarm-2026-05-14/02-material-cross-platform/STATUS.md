# Variant 02 — Material 3 / cross-platform

**Angle.** Apply Material 3's interaction playbook to the same product the iOS variant covers, so the team can read the contrast: how does the puzzle / journey feel under Material's tonal-surface + motion vocabulary, and what would Phase 4's Android port need to inherit or fight against?

**Design direction picked.** Modern Minimal, dialed to Material's restraint end. Tonal surfaces in `brand-100`, low elevation (0–1dp on most surfaces, 2dp on the FAB, a single 4dp-ish lift on the Solved app bar to mark the celebration moment), 24px line icons, M3 type rhythm (centered top app bar, no large title).

## Interaction decisions

- **Bottom navigation bar with three destinations** (Home / Practice / Stats). Practice gets promoted from a Home subsection to a peer destination because Material expects 3–5 stable destinations, and the puzzle/journey product has exactly that many natural roots once Auth and Onboarding are behind the user. Settings lives in the Home app-bar trailing icon, not the nav bar.
- **FAB drives New game** from Home as an extended FAB, anchored bottom-right above the nav bar. It is not present on Solving, Solved, Stats, or Stage-up — Material's rule that FAB == primary, contextual action.
- **Bottom sheet for difficulty picker** (`04-new-game.html`). Modal sheet with a scrim, drag grip, segmented size selector, Material list rows with leading state icons (filled circle for chosen, triangle/lock for tiered). **Commits on tap** — no separate Confirm step — which matches Material's "list-as-choice" pattern and avoids iOS's `Cancel / Save` dance.
- **Contradiction stepper as a peek bottom sheet** docked to the bottom edge during solving. Stays at peek height by default so the board remains the visual hero; the four hint-chain colors (amber / blue / red / emerald) live on the cells as outline rings + a tiny step-number tag, and the sheet only owns the textual narration, dots progress, prev/next, and the Apply primary.
- **Stage-up rendered as a Material full-screen dialog** with a top app bar (close + "Stage up" eyebrow), a tonal progress card (five pips, current one ringed), the heading + body, two confirmation rows, and a filled `Continue` button. This is Material's recommended pattern for important commits — heavier than a regular dialog, quieter than a marketing splash.
- **Solved screen uses a `brand-600` filled top app bar** that hands off to a summary card *floating* over the seam (Material's "lifted result" composition). This is the only place high-contrast brand fill appears, and it stops where the card begins — the rest of the screen returns to neutral surfaces. No confetti, no spring.

## What I deliberately did NOT do

- No ripple flourishes, no Material You dynamic color, no accent-color drift. The brand stays cool blue-green; tonal cards use `brand-100` and stay quiet.
- No iOS sheet detents — only the M3 peek/expand pattern.
- No heavy shadows. Everything below the FAB sits at 0dp or 1dp.

## Open questions

- **Practice as a top-level destination is a real bet.** It came out of needing a third nav destination to honor Material's "3–5 destinations" rule; the iOS variant treats Practice as a Home subsection. Worth deciding before Android lands: do we believe Practice deserves peer status to Home and Stats, or is it actually a sub-mode and the third nav destination should be Library / History / Profile instead?

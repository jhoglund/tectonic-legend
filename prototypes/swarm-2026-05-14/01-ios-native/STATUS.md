# Variant 01 — iOS-native · Status

## Angle
Apple HIG playbook. Every interaction borrows from system-native iOS conventions: a bottom tab bar (Today / Practice / Stats / Settings), large titles that double as the screen identity, sheet-presented modals with grabbers, inset-grouped lists for settings-like surfaces, segmented controls for the grid-size picker, and a UIKit-style nav bar (back chevron at left, title centred, overflow at right) on the solving and post-solve flows.

## Design direction picked
**Modern Minimal**, leaning on iOS's own modern-minimal evolution (iOS 15+ large titles, translucent tab bars, inset-grouped lists). White / `#f2f2f7` surface stacks, hairline separators (`rgba(60,60,67,.18)`), and a single brand-600 accent that only shows up on tab selection, CTAs, and hint chips. Type sits on the Inter scale exactly as specified — `34/40` for large titles (used in place of `text-display` because that's the HIG-canonical size), then heading 24, subheading 18, body 16, small 14, caption 12.

## Key interaction-model decisions
1. **Auth as a large-detent sheet.** Following the brief, "Continue with Apple" is the primary brand-coloured CTA, with Google and email as quieter `secondary` buttons beneath. The grabber is visible, but only the "Create account" link toggles into sign-up — there is no separate screen.
2. **New game is a medium-detent sheet over Home**, not a pushed screen. Difficulty is an inset-grouped list with a checkmark on the active row and a lock glyph + `5 / 8` brand pill on locked rows — the unlock currency surfaces inline, not via a separate paywall-style screen.
3. **Solving has no tab bar** (immersive mode, HIG-canonical), a compact status row (time · filled · hints left) in tabular-mono digits, and the contradiction stepper is a compact card *below* the board with a 4-segment track in amber → blue → red → emerald, so all four hint-chain colours are visible at once. The cells themselves carry the assumption / deduction / contradiction / conclusion rings, with a tiny top-left tag indicating the candidate under test.
4. **Stage-up overrides the swipe-to-dismiss default**, per the brief's "this moment matters" instruction. No grabber, no drag affordance — only the Continue button dismisses it. The stage progression dots act as a single tasteful "moment" without ever resembling a level-up celebration.
5. **Stats uses three inset-grouped sections** exactly as HIG prescribes (Solve performance · Technique mastery · Streak). Streaks are a Linear-style heatmap with a quiet caption — "Miss a day and your streak quietly resets. Nothing else changes." — to honour the brand voice constraint that streaks must never be punished.

## Open question
The brief says nav between Home and Solving is via push (variant 01 uses iOS's standard nav stack), which means tapping "Start daily" pushes the solving screen and hides the tab bar — but the contradiction stepper currently competes with the keypad for vertical space at 390 × 844. Should I (A) make the stepper a sheet that rises only when a contradiction hint fires (more HIG-correct, but hides the chain colours by default), (B) keep it permanently visible as it is now and shrink the keypad row, or (C) collapse the technique chip into the nav bar to reclaim a row of height?

## Second-round expansion · batch 1 — solving states · 2026-05-15
Added 7 alternate states of the solving screen: fresh, cell-selected, notes-mode, conflict, basic-hint, pause, abandon-confirm. Board geometry constant across all 7. Reviewer nav updated.

## Second-round expansion · batch 2 — paywall + settings · 2026-05-15
Added 4 surfaces: Hard-tap paywall, contradiction-hint paywall, Settings root, and Settings → Account detail. Free-tier states rendered (upgrade affordance is the most prominent thing in both Settings surfaces). Annual is the default highlighted pricing per ADR-0008.

## Second-round expansion · batch 3 — tutorial + mastery · 2026-05-15
Added 3 surfaces expressing the differentiator: the guided tutorial overlay
(Newcomer-stage walkthrough), the mid-solve mastery-crossed chip moment, and
the post-solve summary variant where a technique crossed mastery. Hint-chain
colors held in reserve; mastery uses brand-600 only.

## Second-round expansion · batch 4 — re-entry, share, practice · 2026-05-15
Added 3 surfaces closing out the PRD §8 list: the warm re-entry card
(no broken-streak punishment), the iOS-native share sheet over the
Solved screen (Tier-0 viral artifact), and the Practice tab destination
distinct from the New Game sheet. With this batch the iOS-native variant
covers every surface in the PRD §8 list plus the solving-state set,
paywalls, settings, tutorial, and mastery moments.

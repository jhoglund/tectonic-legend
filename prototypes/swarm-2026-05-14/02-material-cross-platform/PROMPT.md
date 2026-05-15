# Variant 02 — Material 3 / cross-platform

**Angle.** Material 3 playbook. The contrast read against variant 01 — if iOS-native is the default choice, this variant tests whether Material's interaction model fits the product better or worse, and what we'd need to change if we ship on Android later (Phase 4 of the launch plan).

**Hypothesis being tested.** Material 3 leans into tonal surfaces, motion choreography, and explicit feedback. Does the puzzle / journey product feel *better* under that lens, or does Material's expressiveness fight the brand voice (*quiet, focused, adult*)?

---

## Interaction principles for this variant

- **Navigation rail** on the left (tablet/landscape) or **bottom navigation bar** (mobile portrait, default for this variant). 3–5 destinations.
- **FAB** (Floating Action Button) for the primary action on Home: "Start today's puzzle" or "New game".
- **Tonal surfaces** — use `surface-elevated` and the `brand-100` tone for cards, but **only at low elevations**. Don't go neon. Treat tonal as a way to *quiet* hierarchy, not amp it.
- **Material motion** — emphasized easing for important transitions (stage-up, paywall presentation), standard easing for the rest.
- **Material icons** (line, 24px). Filled state for the active nav destination.
- **Top app bar** with a centered title (rather than large-title HIG style). May be collapsible on scroll.
- **Snackbars** for transient feedback ("Hint used", "Saved to library") — not toasts.

---

## Screen-by-screen interpretation

1. **Auth.** Full-page screen (no sheet). "Continue with Google" as primary in `brand-600` filled button. Apple/email below as outlined buttons. Material's recommended weighting.
2. **Onboarding.** Three-page pager with a horizontal page indicator. CTA is a `brand-600` filled FAB-style button at the bottom-right. Each page introduces one Tectonic rule.
3. **Home.** Top app bar with centered "Tectonic" title and a settings icon. Scrolling content: a hero "Daily" tonal card (`brand-100` background, brand-600 type), a "Resume" card if applicable, a horizontal scroll of stage progress chips. **FAB** bottom-right: "New game".
4. **New game.** Bottom sheet (modal, scrim) sliding up from below. Material list of difficulties with leading icons (lock for locked, target for unlocked). Selection commits on tap, no separate Confirm step.
5. **Solving.** Top app bar minimized to just a back arrow and puzzle title. Board centered. Below: Material chip group for tool toggle (Notes / Hint / Clear). Contradiction stepper appears as a *bottom sheet* in `peek` state, expandable.
6. **Solved.** A celebration top app bar (`brand-600` background, white text — high elevation but tonally restrained). Below: a vertical list of result rows in Material list-item style. Share via Material `OutlinedButton` row.
7. **Stats.** A series of tonal cards stacked vertically. Each section in its own card with `brand-100` accent stripe on the leading edge. Mastery chips in `Assist Chip` style.
8. **Stage-up.** Material *full-screen dialog* (not a regular dialog — this is Material's pattern for important moments). Top app bar with close icon. Content: stage indicator + heading + 1–2 line body + "Continue" filled button at the bottom.

---

## What this variant should NOT do

- Don't go ripple-heavy. Material's expressive end conflicts with our brand voice.
- Don't use bright accent colors outside the token system to "make it feel Material" — Material works fine with our cool blue-green.
- Don't use Material's stronger elevations (4dp+) for everything. Keep most surfaces flat (0dp) or low (1dp).
- Don't borrow iOS sheet detents — Material uses bottom sheets differently.

---

## Output reminder

8 HTML screens + `index.html` + `STATUS.md`. Render in a 390×844 portrait viewport (same as the iOS variant for direct comparison).

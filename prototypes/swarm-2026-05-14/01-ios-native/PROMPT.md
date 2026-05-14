# Variant 01 — iOS-native

**Angle.** Apple HIG playbook. If we shipped this as a native-feeling iOS app, every interaction would follow Apple's defaults. The player should feel like the app was made *for* iOS, not ported to it.

**Hypothesis being tested.** Familiarity is frictionless. Players already know how to use iOS apps; meeting them in their muscle memory removes a learning curve and lets the journey (the actual differentiator) carry the load.

---

## Interaction principles for this variant

- **Tab bar** at the bottom — 3 or 4 tabs (Home / Practice / Stats / Settings). Standard SF Symbols icons.
- **Large titles** at the top of every primary screen — they collapse on scroll, per HIG.
- **Sheets** for modal interruptions (paywall, stage-up, new game picker). Detents at `medium` and `large` where appropriate.
- **System gestures** — swipe-from-edge to go back, pull-to-refresh on stats, long-press for contextual actions.
- **SF Symbols** as the icon set (described in the prototype as semantic names since real symbols aren't licensable to render in HTML — render close-equivalent line icons, but design *as if* using SF Symbols).
- **Native-feeling typography** — though we use Inter (not SF Pro), apply the same hierarchy as iOS does. Large titles weighty (600), body (400), captions tabular.
- **Native motion** — `motion-base` (200ms ease-out) and `motion-slow` for sheet presentation. No custom curves.

---

## Screen-by-screen interpretation

1. **Auth.** Sheet-presented at first launch (`large` detent). Single screen with "Continue with Apple" as the primary CTA in `brand-600` (Apple recommends this; Sign in with Apple at top); "Continue with Google" and "Continue with Email" as secondary text links beneath. Below: 2-line privacy footnote.
2. **Onboarding.** Three-page page-control sequence (the dot indicator under the content). Each page is a tutorial step. CTA pinned to bottom: "Continue" → "Continue" → "Begin".
3. **Home.** Large title "Today" (or "Tectonic"). Scrollable list of cards: today's daily puzzle (hero, full-width), "Resume" if in progress, current stage chip, "Practice" cell linking to the difficulty picker.
4. **New game.** Sheet presented from Home or Practice tab. Difficulty list as a grouped `UITableView`-style list: Easy / Medium / Hard / Expert. Locked rows show a small lock glyph + the technique name needed.
5. **Solving.** No tab bar visible (immersive). Top: nav bar with back chevron + puzzle title. Board fills the middle. Below the board: a compact toolbar (notes toggle, hint, clear). When a contradiction hint fires, a `UISheetPresentationController`-style sheet rises with the step-through.
6. **Solved.** Inline summary view that pushes onto the solving navstack. Top: "Solved in 2:14" as a large title. Below: technique-mastery chips, share button in a system-style row with the SF action icon. "Next puzzle" CTA pinned to bottom.
7. **Stats.** Grouped lists (HIG `Insets Grouped` style). Three sections, each with a header. Solve performance section uses HIG-style detail rows; mastery section uses chip rows; streaks at the bottom.
8. **Stage-up.** Modal sheet presented at `medium` detent, undismissable via swipe (rare HIG override; force tap-to-dismiss because this moment matters). Single page. Brand-600 chip at top ("Advanced"), heading, 1–2 line body, "Continue" CTA at the bottom.

---

## What this variant should NOT do

- Don't invent novel interaction patterns. The point of this variant is to follow conventions.
- Don't borrow Material 3 surfaces (FABs, tonal cards, ripple effects).
- Don't make the AI/hint engine a "chat partner" — that's variant 04's job. Here, hints are a system feature you summon via a button.
- Don't strip nav chrome to be minimal — that's variant 03.

---

## Output reminder

8 HTML screens + `index.html` + `STATUS.md`. Stick to the tokens in `BRIEF.md` §4. Render in a 390×844 (iPhone 15) viewport.

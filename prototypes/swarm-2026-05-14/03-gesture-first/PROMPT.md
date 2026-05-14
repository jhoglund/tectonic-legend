# Variant 03 — Gesture-first / chrome-less

**Angle.** Almost no visible UI. Swipes drive navigation, long-presses act, edge gestures provide global commands. The puzzle is the surface; everything else is summoned.

**Hypothesis being tested.** Once a player knows the gestures (a one-time onboarding cost), the app gets out of the way entirely. Tectonic players are puzzle-people — they tolerate higher learning curves for cleaner surfaces. Reference brands: Things 3, Mela, Bear, Twitter (pre-X) gesture nav.

---

## Interaction principles for this variant

- **No tab bar.** No persistent bottom nav. The home screen IS the nav.
- **Swipe right** from any deep screen returns home. **Swipe left** advances to the next puzzle / next step.
- **Long-press** opens contextual actions (e.g., long-press a cell to mark a candidate; long-press a hint to see *why* it fired).
- **Edge gestures** for global actions: swipe down from the top-left = stats; swipe down from the top-right = settings; pull-down from the center = command sheet.
- **Animations carry meaning.** Swiping back home isn't an instant cut — the puzzle scales down into a card in the home grid. Spatial continuity matters.
- **Visible affordances are minimal but never zero.** A subtle dot or chevron hint at gestures. The first time a gesture is needed and the player hasn't done it, a 2-second non-blocking ghost-pointer animation shows the gesture.

---

## Screen-by-screen interpretation

1. **Auth.** Fullscreen, two big options stacked vertically with generous padding: "Sign in" or "Continue as guest". Swipe up to switch between sign-in and sign-up modes. No back button (swipe back).
2. **Onboarding.** A single scrollable screen — tutorial puzzles are *inline*, scrolled into focus one at a time. No "Continue" button; the page advances as you scroll. The first tutorial puzzle is interactive within the scroll position.
3. **Home.** A vertical stack of cards: the daily puzzle is the largest at the top, "Resume" beneath it, stage progress beneath that. **No FAB, no tabs.** Pull down to access stats, swipe right from the home card to start a new game.
4. **New game.** Reveals as a horizontal swipe from Home (left to right). Difficulty options stacked as fullscreen pages — swipe through them to browse, tap to start. Locked difficulties show a soft scrim and the unlocking technique.
5. **Solving.** The board fills the entire screen. **No visible toolbar.** Tap a cell to select; tap a number on the floating row that appears (auto-summoned at the bottom edge when a cell is selected). Long-press the cell to toggle notes mode. Two-finger swipe down to reveal the hint affordance. Swipe right from any edge to abandon (with a confirm sheet).
6. **Solved.** The puzzle morphs in place — solved cells "settle" into a calm grid view. The solve time materializes above it. Swipe up to reveal the share artifact; swipe left for the next puzzle.
7. **Stats.** Reached by pulling down from the top-center of Home. Vertical column of rows, no cards or chrome. Mastery chips inline with their numbers. Pull up to dismiss.
8. **Stage-up.** Triggered automatically post-solve when mastery threshold is crossed. The current screen *zooms out* and a soft full-screen layer fades in: stage name, 1-line body, no button. Swipe in any direction to dismiss.

---

## What this variant should NOT do

- Don't add visible nav chrome "just in case". The hypothesis is the absence of it.
- Don't surface every available action — most should be discoverable through gesture. Use the first-time ghost-pointer for teaching, not a permanent UI.
- Don't make critical actions gestural-only with no fallback — destructive actions (abandon puzzle) need a confirm sheet.
- Don't use Material or HIG conventions; the point is to *not* be either of those.

---

## Output reminder

8 HTML screens + `index.html` + `STATUS.md`. Render in a 390×844 viewport. Where gestures are essential, annotate them with a small label (e.g., "← swipe right") in the prototype so the reviewer understands without trying to swipe a static HTML page.

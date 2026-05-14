# Variant 07 — Game-progression / journey-forward

**Angle.** Lean hard into the differentiator. The journey from Newcomer → Master is *visible everywhere*. Stages, mastery, and unlocks aren't surfaced on a single stats screen — they're the structural metaphor of the entire app. A map-like progression view is the home. But: stay disciplined; this is *not* Duolingo. No confetti, no streak fire, no XP popups.

**Hypothesis being tested.** If the journey is the moat, maybe it should be the structural skeleton of the product, not a feature folded into Stats. Reference points (good): Streaks app, Apple Fitness "Move/Exercise/Stand" rings, certain serious chess-progression apps. Reference points (bad): Duolingo, Candy Crush map.

---

## Interaction principles for this variant

- **A map / path metaphor** on Home — but quiet. A vertical or diagonal "path" of stage nodes with the player's current position marked. Cleaner than a Candy Crush map; closer to a topographic line drawing.
- **Stage indicator omnipresent** — at the top of every screen, a thin chip or progress sliver shows current stage and progress to next. Always visible, never loud.
- **Mastery progress as ambient feedback** — when a technique fires during solving, a faint progress arc fills slightly. The player feels progress accumulating without seeing numbers.
- **Earned reveals.** New screens / features feel like they appear *as you advance*, not "unlock with a tap on a locked option". A locked screen doesn't exist; the screen *appears* when the player crosses a threshold.
- **Stage-up moments are *the* peak experience** — they earn more visual weight here than in any other variant. Still no confetti, but a clear "ceremony" feeling.

---

## Screen-by-screen interpretation

1. **Auth.** A pre-journey doorway. Single screen with a quiet visual hint that something begins after entry — a single brand-600 line stretching off the bottom of the screen, hinting at the path. Auth options below.
2. **Onboarding.** Framed as "Stage 0 — Newcomer". A vertical sequence of 3 tutorial puzzles laid out as nodes on a path. Each tutorial advances the player visually toward the first stage node ("Beginner") at the bottom. Tapping a node opens that tutorial.
3. **Home.** **A map.** The journey is rendered as a vertical path with 5 nodes — Newcomer, Beginner, Confident, Advanced, Master. The player's avatar (a simple brand-600 dot) sits at their current position. Today's daily puzzle is rendered as a side-quest node off the current stage. "Resume" appears as a small return-to-progress affordance.
4. **New game.** A scoped view of the current stage node: which difficulties are available here, which are visible-but-not-yet-reached. Locked difficulties show the path forward, not a paywall-style "PAY to unlock".
5. **Solving.** Board is central. The stage chip at the top quietly fills as techniques fire during the solve — a real-time progress sliver behind the board's top edge. Mastery feedback is ambient, not in-your-face.
6. **Solved.** The summary frames as a step on the journey: "+3 to Hidden Single mastery", "8 more solves to next stage", the path metaphor reappears as a small inset showing the player's position. Share button is the same as everywhere; "Continue the path" is the next CTA.
7. **Stats.** Less of a dashboard, more of a *biography*. The journey is the spine: a vertical timeline of stage transitions ("Reached Beginner on 2026-05-01", "Reached Confident on 2026-05-12"), with mastery chips between transitions as moments. Solve performance is a sub-section, not the lead.
8. **Stage-up.** **The peak.** Full screen. The path graphic from Home animates: the player's dot moves from one node to the next. A single line of type appears: "Advanced." A second line: "Hard puzzles are unlocked." Continue button at the bottom. The visual transition is the celebration; the text is just labeling it.

---

## What this variant should NOT do

- Don't render the map as a cartoon. No characters, no level numbers in roundels, no XP bars. The path is a topographic line, not a game world.
- Don't celebrate via animation overload. The journey is felt through *quiet consistency*, not through bursts.
- Don't surface mastery as a number to the player. Chips and arcs only.
- Don't crowd the Home map with side affordances. Daily puzzle and Resume are the only side-elements; everything else lives on its own screen.

---

## Output reminder

8 HTML screens + `index.html` + `STATUS.md`. Render in 390×844. The path graphic on Home is the variant's signature — invest the time to get it right. Vector-drawn with brand-600 lines; nodes as small dots or rings; the player's position highlighted by a slightly larger filled dot.

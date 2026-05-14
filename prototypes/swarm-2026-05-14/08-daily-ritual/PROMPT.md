# Variant 08 — Daily-ritual

**Angle.** The daily puzzle IS the app. Every other surface orbits around it. The home screen has one thing on it: today's puzzle. Stats, progression, practice — all secondary, accessible but not in your face. Reference: NYT Games (the homepage is *literally* today's puzzles), Streaks app, the Apple News "Today" tab.

**Hypothesis being tested.** Puzzle players don't want a feed of options when they open the app — they want their daily ritual. If we centered the entire product on "open the app → solve today's puzzle → close", everything else becomes a lower-traffic discoverable. Maybe simpler. Maybe stickier.

---

## Interaction principles for this variant

- **Home is one screen, one thing.** Today's puzzle, full-bleed, with a "Begin" affordance. That's the entire home surface above the fold.
- **Yesterday and earlier are scroll-down.** Below today's puzzle, a thin chronological list of past days (last 7 visible; archive paywalled). The metaphor is a daily newspaper.
- **Practice (free-play) is a secondary tab or a small text link** — not a hero affordance. The product *recommends* the daily; practice is for people who want more.
- **Streak as ambient.** A tiny streak indicator (the only persistent metric on home) in the corner. Not punishing; not loud.
- **Time-aware.** The home screen knows what time of day it is. "Good morning" if before noon. "Today's puzzle is waiting" mid-day. "You haven't solved today's puzzle yet" if approaching midnight (gentle, not nagging).

---

## Screen-by-screen interpretation

1. **Auth.** A single editorial page that pitches the ritual: "One puzzle a day. The same puzzle for everyone. See how you do." Then auth buttons. Optimistic — sign in is what unlocks the streak.
2. **Onboarding.** A 2-step sequence. Step 1: "Today's puzzle is your first one — let's walk through it." (The first tutorial puzzle IS today's puzzle for Newcomers.) Step 2: "We'll have a new one tomorrow." Done.
3. **Home.** Above the fold: today's date, today's puzzle as a single big card with a "Begin" button (or "Resume" / "Solved in 2:14 ✓" depending on state). Below the fold: a chronological list of past 7 days, each a small row with date + difficulty + result. Free-tier shows archive past 7 days as a teaser. A tiny streak count in the top-right corner.
4. **New game.** This screen only exists as a *secondary* destination. Reached by tapping a small "Practice" link from Home. Difficulty picker is functional and similar to the other variants, but framed as "Practice — solve any puzzle you'd like, doesn't affect your daily streak."
5. **Solving.** Same as other variants — the board is the hero. But the chrome reminds you it's today's daily: "Today · Hard 5×5" at the top. Or "Practice · Easy 5×5" in the secondary mode.
6. **Solved.** Post-daily-puzzle: "Solved in 2:14. You're 1 of N solvers today." Comparison to the global cohort (faster than 67% of solvers — percentile, not rank). Share button is hero. Streak ticks up visibly. "See tomorrow's preview" is a tease affordance.
7. **Stats.** Reached from a small "Stats" link in the corner of Home. A calendar heatmap is the lead — a year of daily-puzzle results. Below it: solve performance, mastery (tucked at the bottom, since this variant de-emphasizes the journey somewhat — the daily *is* the journey).
8. **Stage-up.** Triggered after a daily-puzzle solve. Quiet — frames the stage-up as a side-effect of consistent daily solving. "You've crossed into Advanced — your daily puzzles will get harder over the next week." Continue button. The mechanics of stage-up are still operative; this variant just frames them inside the ritual.

---

## What this variant should NOT do

- Don't bury today's puzzle. If a player opens the app, today's puzzle is *the first thing they see*. No splash screen, no carousel.
- Don't hide practice / new game so deep it becomes annoying — secondary, not buried.
- Don't make the home screen feel empty. Whitespace is fine; *emptiness* is not. The single puzzle card should feel anchored and complete.
- Don't add badges, notifications, "you have 3 puzzles ready" framing. There is one puzzle a day. That's the point.

---

## Output reminder

8 HTML screens + `index.html` + `STATUS.md`. Render in 390×844 portrait. The home screen is this variant's signature — invest the time to make it feel like a calm morning newspaper opening to the daily, not a cluttered app launcher.

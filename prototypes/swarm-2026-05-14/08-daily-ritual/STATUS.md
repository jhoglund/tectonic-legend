# Variant 08 — Daily-ritual · STATUS

## Angle

**The daily puzzle IS the app.** Home opens like a calm morning newspaper: today's date, today's puzzle as a single card, a "Begin" affordance, and below the fold a chronological list of the past 7 days. Everything else — practice, stats, stage progress — orbits as small text links, never hero affordances.

Reference register: NYT Games homepage, Streaks app, Apple News "Today" tab, NYT Mini. Anti-references honored: no confetti, no streak fire, no badges, no "you have 3 puzzles ready" framing.

## Direction picked

Closer to **Modern Minimal** than Editorial Monocle, but with a newspaper-tinged masthead: a real `text-display` date as the page title, time-aware greeting in uppercase eyebrow, and a thin chronological list of past days that reads like a back-issue stack. Brand voice stays the cool desk lamp — Inter 400/500/600 only, JetBrains Mono for all numerals, tabular nums throughout.

## Key interaction decisions

1. **Home is one card, one CTA above the fold.** The today card contains a real 5×5 cage-bordered preview board, the "Today · Hard" eyebrow, and a single primary `Begin` button. State variants (`Resume` / `Solved in 2:14`) live in copy comments — the same shell handles all three. The streak count sits in the top-right corner as `Streak 14` — never punishing, never with a flame.
2. **Past-7-days list is the metaphor.** Each row is `date · difficulty · result (time or — missed)`. A dashed "Unlock archive" tease sits below the list as the free→paid handoff. Practice is a single muted text link in the bottom footer next to a stage indicator dot — reachable in one tap, but visually subordinate.
3. **Solving chrome reinforces "today."** The top bar reads `Today · Hard 5×5` with the timer pill in the corner. The same shell would render `Practice · Easy 5×5` when entered from the practice surface. The contradiction stepper sits below the board with all four hint-chain colors (amber assumption, blue deduction, red contradiction, emerald conclusion) on cells *and* in the stepper dots, satisfying the swarm-wide constraint.
4. **Solved screen leads with percentile, then streak.** Hero number is the solve time (48px JetBrains Mono); below it the percentile bar reads "Faster than 67% of solvers · 1 of 4,012", followed by a `+1` streak ticker. Share is the only full-width primary button — it's the variant's viral artifact. A tomorrow-preview tease sits above the share to anchor the ritual loop.
5. **Stats leads with the calendar heatmap.** A 26×7 grid of brand-tinted swatches (heat-0 through heat-4 generated procedurally so reviewers can see real density), then solve performance per difficulty, then mastery chips tucked at the bottom under a one-line note: "The daily is the journey here." This is the variant's biggest deviation from any other variant's stats screen.
6. **Stage-up frames itself as a side-effect.** Copy is explicit: "A side-effect of showing up. Fifteen days of dailies." The 5-rung Newcomer→Master ladder shows the move with a halo on Advanced. No celebration language, no confetti, no fanfare.

## Open question

Should the home screen show a **tomorrow-preview tease** (difficulty only, no board) once today is solved, to give returning-but-already-solved players a calm hook back tomorrow? Currently the solved screen has the preview but home does not — adding it to home post-solve would make the streak-continuity loop feel more deliberate, but risks pushing the eye past today's solved state.

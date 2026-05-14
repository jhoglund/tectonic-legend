# Variant 05 — Console / power-user

**Angle.** Linear-density. Every screen presents more information than the other variants. A command palette is the primary navigation. Keyboard shortcuts are visible (rendered as kbd chips, since this is web/Capacitor). The aesthetic is closer to a developer tool than a game.

**Hypothesis being tested.** Tectonic players who reach Master stage want a *tool*, not a *toy*. Treating the app as a pro-grade puzzle environment (think Linear, Raycast, Arc Search, Vim) might be the right shape from day one — even if it asks more of new players.

---

## Interaction principles for this variant

- **Command palette** (⌘K / long-press for mobile) as the primary nav. Type to filter actions: "new hard", "stats", "daily", "abandon", "settings".
- **Visible keyboard hints** — `kbd` chips next to actions, both on web and mobile (mobile shows them too; the affordance carries the brand even if the keyboard isn't there).
- **High information density.** Multiple data points visible per screen. No giant hero numbers without a sparkline next to them.
- **Monospace accents** — JetBrains Mono used not just for cell numerals but for solve times, percentile bands, technique counts. Makes data feel queryable.
- **Inline status bars** — a subtle bottom strip on every screen showing context: "Stage: Advanced · Streak: 12 · Today: 1/1 ✓".
- **Tabular layouts** dominate. Solve history is a table. Mastery is a table. Stats is a dashboard.

---

## Screen-by-screen interpretation

1. **Auth.** Single screen. Three small auth buttons in a row, with kbd hints (`⌘1` Apple / `⌘2` Google / `⌘3` Email). A tiny command-palette footer hint: *"Press ⌘K anywhere to navigate."*
2. **Onboarding.** Compact 3-step list — not a slideshow. "1. Read the rules · 2. First tutorial · 3. Begin." Inline. The first tutorial puzzle is embedded directly below the list with an expandable "What just happened?" detail row beneath each move.
3. **Home.** A dense dashboard. Daily puzzle as a single row (not a hero card): `Today · 5×5 Hard · 0/1 solved · 2 friends ahead`. Below it: Resume row, current stage with progress bar, mastery progress as a table of techniques with `selfApplied/threshold` ratios.
4. **New game.** A filterable list. Top: search/filter bar with kbd hint (`/` to filter). Difficulty rows show technique requirements as columns (`naked single ✓ · hidden single ⬚ · forced ⬚`). Click → start; ⌥-click → start in practice mode.
5. **Solving.** Board takes ~60% of vertical space. Below: tabular controls — `⌃H` Hint · `⌃N` Notes · `⌃Z` Undo · `1–6` Number entry. To the side or below: the cell info panel showing the selected cell's candidates as a bitmap, group ID, and constraint status. Contradiction stepper appears as a numbered list below the board with each step's deduction labeled.
6. **Solved.** Tabular summary: technique × count, errors, hints used, percentile, solve time. Share button is a single small icon button (not a hero). Next puzzle is a kbd hint: `⏎ to continue`.
7. **Stats.** A grid of compact widgets — solve time distribution (mini-histogram), technique mastery (bar chart of selfApplied/threshold), streak heatmap (calendar-style), daily-puzzle table (last 30 days). Power-tool dashboard energy.
8. **Stage-up.** A single understated banner — not a full-screen card. A line of text at the top of the next screen: `↑ Advanced · Hard puzzles unlocked · ⏎ to continue · ⌘? to learn what changed`. Quiet because *the player is sophisticated enough not to need fanfare.*

---

## What this variant should NOT do

- Don't be cold. Linear is dense but warm. Use the brand voice; don't go grey-on-grey developer tool.
- Don't render fake terminals or code editors. We're a puzzle app, not a console emulator.
- Don't replace the puzzle board with ASCII art. Visual identity stays consistent with the other variants.
- Don't go full keyboard-only — mobile players still need tappable affordances; the kbd chips are a visible *aesthetic*, not a requirement.

---

## Output reminder

8 HTML screens + `index.html` + `STATUS.md`. Render in 390×844 (mobile portrait). Where keyboard shortcuts are shown, render `kbd` styled chips. Use JetBrains Mono for any numeric data, not just cell numerals.

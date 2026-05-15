# Variant 05 — Console / power-user · STATUS

**Angle.** Linear-density. Every screen carries more information than the other variants, surfaced through tabular layouts, monospace data, kbd-chip vocabulary, and a persistent bottom status bar. Aesthetic refs: Linear, Raycast, Arc Search, Vim. Anti-refs (we explicitly avoid): cold dev-tool grey-on-grey, fake terminals, ASCII art puzzles.

**Direction picked.** Modern Minimal, density-pushed. Uses the shared brand-blue-green token set on every interactive accent, with surface-elevated panels separating data regions so the screens never read as a flat grey wall. Dark-mode aware via `prefers-color-scheme`. Inter for UI + JetBrains Mono for every numeric/data value (solve times, percentiles, mastery ratios, technique counts, kbd chips, seed IDs, dates).

---

## Interaction-model decisions

1. **Command palette as primary nav.** Shown explicitly as an open overlay on `04-new-game.html` with three matched actions (new hard / hard practice / daily) and the active row highlighted with a `⏎` kbd. Hinted on every other screen via a fake palette button in the topbar and a `⌘K` chip in the status bar. On screens where space is tight (Solving, Stats) the palette appears only in the status bar — the variant's "you can always reach it" affordance.
2. **kbd-chip vocabulary is consistent.** `⌘K` (palette), `⌘1 / ⌘2 / ⌘3` (auth methods), `/` (filter), `⏎` (primary affirm), `esc` (back), `⌃H / ⌃N / ⌃Z` (hint/notes/undo), `1–6` (number entry), `↑↓` (palette move), `⌘?` (what changed), `⌥G` (cycle grid). Rendered as actual `kbd`-styled inline chips (border-bottom 2px for the keycap feel), monospace, 10–11px.
3. **Bottom status bar on every screen.** Two-zone strip showing `Stage · Streak` (left) and a contextual indicator (right — palette hint, results count, timer, "Today 1/1 ✓"). Replaces the giant hero numbers that other variants might use; the same data is here, just compressed.
4. **Tabular data dominates over hero data.** Home is a table of techniques with `selfApplied/threshold` ratios rather than a giant streak number. Solved is a `technique × self/hinted` summary table with a percentile row underneath. Stats is a 6-widget dashboard (KPI tiles + histogram + mastery bars + activity heatmap + recent-solves table). New game is a filterable list with requirement columns rather than a card grid.
5. **Solving screen carries a cell-info panel.** Below the board, next to the keypad: selected cell ref (`R2C3`), region letter, candidate bitmap (`1·_·3·_·_`), neighbor count. Above it, a horizontally-scrolling control bar of `⌃H Hint`, `⌃N Notes`, `⌃Z Undo`, `1–6 Place`, `⌫ Clear`. The contradiction stepper sits between board and keypad as a numbered 4-step list — each step colored with the matching hint-chain token (amber / blue / red / emerald). All four colors render on cells on the board simultaneously.
6. **Stage-up is understated by design.** Not a full-screen card — a single 8-px-padded banner at the top of the post-solve home view ("↑ Confident → Advanced · Hard puzzles unlocked · ⏎ continue · ⌘? what changed"). Below the banner: one short paragraph of copy and a "what changed" 3-row table. The Advanced player doesn't need fanfare; they need to know what's different and get back to solving.

---

## Open question

**Should the command palette be rendered open on more than one screen?** I made it the overlay state on `04-new-game.html` because that's where filtering + action selection is the natural flow. The other screens reference it via a faux topbar button and the status-bar `⌘K` chip. Two alternative postures:

- **(A) keep palette open only on 04** — current. The palette reads as a discovery surface attached to where it's most useful (action launching), and other screens stay readable.
- **(B) add a second open-palette state on 03-home** — to demonstrate that the palette is genuinely the primary navigation, not just a 04 affordance. Risk: home becomes hard to read past the overlay.
- **(C) factor the palette into a tiny inline "palette-strip" at the bottom of every screen** — always visible, never modal. Different brand direction, less Raycast, more Vim-status-line.

Which posture matches the variant's hypothesis best? I'd lean (A) for the current swarm round and revisit (C) if the variant is selected for a second pass.

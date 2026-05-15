# Variant 07 — Game-progression / journey-forward

## Angle

The journey from **Newcomer → Master** is the structural spine of the entire app, not a feature folded into Stats. A topographic path graphic is the Home screen; a thin stage chip sits at the top of every other screen; the Stats screen is reframed as a **biography**; the stage-up moment is the peak visual experience.

## Design direction

**Modern Minimal**, with a quiet topographic-map sensibility. The path is rendered as a single brand-600 stroke that meanders vertically, set against faint horizontal contour lines (8% opacity) — closer to a contour map or a chess opening tree than anything in Candy Crush. No characters, no XP bars, no roundels, no level numbers, no confetti, no streak fire.

## Interaction decisions

1. **Path graphic anchor.** The same vertical-meander path appears at three different scales — full-size on Home, miniature on the Solved card ("you are still at Confident"), and full-screen on Stage-up where the player's dot animates from one node to the next. Re-using one motif at three scales gives the variant its unmistakable identity.
2. **Stage chip is omnipresent.** A `radius-chip` pill at the top of every post-auth screen carries `<stage-name> · <progress bar> · → <next-stage>`. The bar fills slowly across sessions — never explodes. It deliberately uses **2px height** so it reads as a sliver, not a progress bar.
3. **Ambient mastery arc.** Above the solving board, a 2px line shows mastery accruing this solve, with small dots marking each technique fire. **No numbers are shown to the player** — the feedback is positional, not quantitative. The technique-label chip below the board names the technique that just fired.
4. **Earned reveals over locks.** On the new-game screen, future difficulties show a brand-600 hollow ring and a tiny "Forced moves · 3/8" gate chip — they look reachable, not paywalled. Truly out-of-reach difficulties (Expert) show a dashed ring and a one-line note about which stage opens them.
5. **Biography over dashboard.** Stats leads with a **vertical timeline** of stage transitions and mastery moments going back to the join date. Solve-performance numbers are demoted to a sub-section below the fold. The streak ring is included, but framed as "Played 6 of the last 7 days" with copy reassuring that skips don't punish — the streak is gentle, not weaponized.

## Files

- `01-auth.html` — pre-journey doorway, single brand-600 contour curling off-screen toward a starting dot.
- `02-onboarding.html` — Stage 0 framed as 3 tutorial nodes on a vertical mini-path leading to the Beginner node.
- `03-home.html` — **the signature.** Five-stage topographic path with player-dot at Confident; daily-puzzle card and resume-pill anchored as side-affordances to the current node.
- `04-new-game.html` — scoped to the current stage; future difficulties show progress-to-unlock, not paywalls.
- `05-solving.html` — board as hero; stage chip + ambient mastery arc up top; contradiction stepper below with the four chain colors swatched as a legend; technique chip.
- `06-solved.html` — frames the solve as a step on the path; miniature path inset shows player position; mastery moments as chips, not point totals.
- `07-stats.html` — biography timeline as the lede; solve performance and streak as sub-sections.
- `08-stage-up.html` — full-screen path graphic with the player's dot animating into the Advanced node; one-line label "Advanced." + "Hard puzzles are unlocked." + a short description card with the assigned copy.
- `index.html` — sticky-sidebar reviewer.

## Open question

Should the player's dot on the Home path map carry **any micro-state** beyond position — e.g., a faint pulsing halo when there's a daily puzzle to play, vs. a still dot when there isn't — or does that violate the "quiet consistency" principle and start to feel notification-y? Currently the dot is always still and the daily puzzle pulls focus via the card; an alternative would have the dot itself acknowledge state.

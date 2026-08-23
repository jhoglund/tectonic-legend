# ADR-0021: Every difficulty is deductive; Expert means advanced deduction, not search

**Date:** 2026-08-23
**Status:** Accepted, amends [ADR-0001](ADR-0001-difficulty-progression-as-differentiator.md) and the grading decision recorded under backlog I9

## Context

Jonas plays Expert almost exclusively, and reported that Expert is "too often only
solvable by backtracking" and "should be solvable by using advanced solving strategies"
(backlog F3).

That was not a bug. It was the definition. `gradeDifficulty` walked a puzzle with
`findHint` and recorded the hardest tier used; `contradiction` was tier 4 and tier 4 was
`expert`, and a puzzle that defeated the engine outright was also graded Expert. The doc
comment said so plainly: *"Expert needs contradiction reasoning."* So the generator was
not accidentally producing search-required puzzles at Expert, it was **searching for
them**, rejecting every candidate that deduction could crack.

Two things made this worth revisiting now rather than tuning around:

1. Everything the deductive tiers could crack (domination, subsets, locked candidates)
   collapsed into tier 3, `hard`. There was no tier meaning "hard deduction, no search",
   which is exactly the tier a strong player wants.
2. [F1c](../backlog.md) taught the engine to read across cage boundaries
   ([`specs/solving-techniques.md`](../../specs/solving-techniques.md) §6a), which moved a
   large class of puzzles from "needs a trial" into "deductively solvable". Measured over
   90 maximally-carved 5x5 boards afterwards: **59% need the advanced deductive tier, 22%
   fall to plain singles, 11% need only domination, and 6% genuinely need a contradiction
   trial.** A fully deductive Expert had become both possible and well supplied.

This also contradicted the product premise. The pitch is a game that teaches you to solve
([`PRD.md`](../../PRD.md), ADR-0001). A tier whose defining property is that logic runs
out teaches nothing.

## Decision

**Every difficulty is solvable by deduction alone.** The ladder is re-mapped so each tier
names the hardest *technique* it requires:

| Difficulty | Requires |
|---|---|
| Easy | Naked singles only |
| Medium | Adds hidden singles |
| Hard | Adds cage domination (the forced move) |
| Expert | Adds subset / locked-candidate / cross-cage group elimination |

**Puzzles that need a contradiction trial are rejected at generation, not labelled.**
`gradeDifficulty` now returns `Difficulty | null`, where `null` means "needed a search, or
defeated the engine". The generator discards those candidates and carves another. Roughly
6% of maximally-carved boards are discarded this way.

The contradiction trial **stays in the hint engine** as the fallback of last resort, for
the player who is stuck and asks. It is simply no longer something any puzzle *requires*.

## Consequences

- **Expert is now a promise, not a warning.** "Group eliminations", not "contradiction
  chains". The difficulty-picker blurb changed accordingly.
- **Expert generation got faster, not slower.** 5x5 Expert went from roughly a second to a
  median of 2ms, because the generator stopped hunting for the rare 6% and started
  accepting the plentiful 59%. Measured across both grid sizes and all four tiers, no tier
  fails to generate and **no generated puzzle in any tier needs a contradiction hint**.
- **`hard` is now a narrower band.** It means domination and *not* the subset tier, where
  before it meant both. Its hit rate per carve drops (about 18% of carves at the hard
  density), so it retries more. Still well inside budget; worth a density pass if it ever
  bites.
- **The `contradiction-chain` mastery slot is now hint-only.** No puzzle requires the
  technique, so a player can only build depth in it by asking for hints. This matters:
  [ADR-0018](ADR-0018-legend-stage-and-mastery-depth.md) gates Legend on depth across
  *every* technique, which would make Legend effectively unreachable without deliberately
  requesting contradiction hints. **Left open on purpose** rather than resolved here, since
  it is a progression decision, not a generator one. Options are to drop
  `contradiction-chain` from the Legend gate, keep it and accept that Legend requires
  hint-assisted play, or retire the slot. Tracked in the backlog.
- **The premium gate is unaffected.** Contradiction-chain hints remain a paywalled feature
  ([`specs/progression.md`](../../specs/progression.md) §6); they are just no longer forced
  on anyone by the difficulty they picked.
- **A harder-than-Expert tier is still available** if the deductive ceiling ever needs
  raising: flip-flop / parity chains (`solving-techniques.md` §8) are spec'd and unbuilt,
  and would slot above the current Expert as a genuine deductive tier. That is the route to
  take rather than readmitting search. Note [ADR-0019](ADR-0019-legend-tiers-and-leaderboard.md)
  settled Legend as pure status, not a difficulty tier, and this ADR does not reopen it.

## Alternatives considered

- **A fifth tier above Expert for search-required puzzles.** Rejected: it reopens ADR-0019
  (Legend as status, not difficulty), needs a new name, and preserves the thing being
  complained about instead of removing it.
- **Fold search-required boards into Expert.** Expert would have been about 91% deductive,
  so the symptom would mostly disappear, but with no guarantee. Rejected because "mostly
  no guessing" is not a claim the product can make, and the whole point is that the tier
  should be trustworthy.

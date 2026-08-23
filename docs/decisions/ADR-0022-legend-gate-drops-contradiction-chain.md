# ADR-0022: Drop `contradiction-chain` from the Legend gate

**Date:** 2026-08-23
**Status:** Accepted, narrows [ADR-0018](ADR-0018-legend-stage-and-mastery-depth.md); follows from [ADR-0021](ADR-0021-expert-is-deductive-not-search.md)

## Context

[ADR-0018](ADR-0018-legend-stage-and-mastery-depth.md) gates stage 5 (Legend) on **all
five** techniques reaching `legend` chip state. One of the five is `contradiction-chain`.

That slot can never reach it, and not because of any tuning. The depth score's two heavy
terms are `SELF` (40 points) and `PUZZLES` (30 points). Both are fed by
`selfAppliedCount`: `puzzlesContaining` only increments when a solve records
`selfApplied > 0` (`profile.ts`). `selfAppliedCount` is awarded by `classifyMove`, whose
return type is:

```ts
'naked_single' | 'hidden_single' | 'domination' | 'pair_elimination' | null
```

There is no `contradiction` case, and never has been. So `contradiction-chain` scores 0
on both heavy terms for every player, capping its depth at **30 of 100**, against a
`legend` threshold of 90. The chip cannot pass `familiar`.

**Consequence: Legend has been unreachable for everyone since ADR-0018 shipped.** This is
a latent bug, not a side effect of recent work. Asking for hints does not help either:
hint-assisted uses increment `usedCount` only, never `selfAppliedCount`.

The same failure mode was caught once before and fixed. `solving-techniques.md` §11 flagged
that `pair-elimination` could not reach `mastered` until `classifyMove` credited it, and it
was later credited. Nobody re-ran that check for `contradiction-chain`.

[ADR-0021](ADR-0021-expert-is-deductive-not-search.md) then made the mismatch permanent in
principle as well as in practice: no puzzle requires a contradiction trial any more, so
the technique is not something a player can reasonably be asked to demonstrate.

## Decision

**Gate Legend on the four techniques a player can actually earn credit for:**
`naked-single`, `hidden-single`, `forced-move`, `pair-elimination`.

Introduces `LEGEND_GATE_TECHNIQUES` in `progression.ts`, derived from `TECHNIQUE_NAMES` by
excluding `contradiction-chain`. `nextStageFor`'s stage-4 branch uses it.

`contradiction-chain` **keeps its slot everywhere else**: the type, the chip in Stats, the
Solved screen tally, and the premium gate on contradiction hints. It is still a real
technique the engine offers to a stuck player. It simply no longer gates the peak.

## Consequences

- **Legend becomes reachable.** A player who reaches `legend` depth on the four creditable
  techniques now advances to stage 5, as ADR-0018 always intended.
- **The bar is genuinely lower than ADR-0018 specified**, because it is four techniques
  instead of five. Accepted: five was not a higher bar, it was an impossible one. If
  Legend proves too easy in practice, raise the depth thresholds, which are tunable and
  were always flagged as needing soft-launch data.
- **The five-slot mastery model is unchanged.** No migration, no profile schema change, no
  change to the Stats surface. Only the stage-5 predicate narrows.
- **A latent class of bug is now named.** Any technique in `TECHNIQUE_NAMES` that
  `classifyMove` cannot return is unearnable by definition. Worth asserting in a test if a
  sixth technique is ever added. Today the four gating techniques map exactly onto
  `classifyMove`'s four return values.
- **Reversible.** If contradiction reasoning should count toward the peak later, the route
  is to teach `classifyMove` to credit it and reintroduce puzzles that need it, which would
  mean revisiting ADR-0021 as well.

## Alternatives considered

- **Retire the `contradiction-chain` slot entirely.** Four chips instead of five. Tidier,
  but it changes the Stats surface and the share artifact, and discards a technique the
  engine still offers as a hint. Rejected as a bigger change than the problem needs.
- **Make it earnable: credit contradiction reasoning in `classifyMove` and generate
  puzzles that need it.** Rejected because it reverses ADR-0021, which was decided
  deliberately and for good reasons two hours earlier.

# Solving-techniques spec

> The catalogue of deductive techniques the hint engine should use, ordered from cheap-and-human to last-resort. The guiding rule: **a logic hint should explain a deduction, not narrate a trial-and-error search.**

**Last updated:** 2026-05-18
**Related:** [`ARCHITECTURE.md`](../ARCHITECTURE.md) (hint chain), [`progression.md`](progression.md) (technique mastery)

---

## 1. The two rules everything derives from

Tectonic / Suguru has exactly two constraints:

1. **Cage rule.** A cage of `N` cells contains each of `1…N` exactly once.
2. **Adjacency rule.** Two equal values may not be king-adjacent — orthogonally *or* diagonally.

Every technique below is a consequence of these two. The adjacency rule (diagonals included) is what makes Tectonic deductions different from Sudoku.

---

## 2. Why deductive techniques, not backtracking

The hint engine today (`src/engine/hints.ts`, `findHint`) does three things in order: naked single → hidden single → **contradiction trial**. There is no middle tier — the moment a puzzle needs more than a hidden single, the engine jumps straight to "assume a value, propagate, look for a contradiction." That is cell-by-cell backtracking dressed up as a hint.

A backtracking hint is a poor teacher: it shows *that* a value is wrong, not *why* the board makes it wrong. A human solver almost never backtracks first — they read shapes. The hint engine should do the same: exhaust the deductive tiers below, and only fall back to contradiction trials when none of them fire.

This also keeps the hint honest about difficulty. A puzzle solvable by domination is not "hard" just because the current engine can only crack it by searching.

---

## 3. The technique tiers

Hints are searched top-down; the first technique that fires wins.

| Tier | Technique | Needs filled cells? | Notes |
|------|-----------|---------------------|-------|
| 1 | Naked single | candidates | One candidate left in a cell. *(built)* |
| 1 | Hidden single | candidates | A value with one possible cell in its cage. *(built)* |
| 1 | Last cell in cage | filled | Cage with one empty cell → the missing value. |
| 2 | **Cage domination** | **no** | §4 — pure geometry, available from move zero. |
| 2 | Partial domination | filled | §5 — a cell sees some filled cells of a cage. |
| 3 | Naked subset (pair/triple) | candidates | §6 |
| 3 | Hidden subset (pair/triple) | candidates | §6 |
| 4 | Locked candidates ("sibling pairs") | candidates | §7 |
| 5 | Flip-flop / equality | candidates | §8 — advanced; parity chains. |
| 6 | Contradiction trial | — | §9 — last resort. *(built)* |

---

## 4. Cage domination — the headline technique

**Principle.** Call a cell **C** *dominated by* a cage **K** when C is king-adjacent to **every** cell of K. Because K (size `N`) is guaranteed to contain the whole set `{1…N}`, C is king-adjacent to all of those values at once, so:

> C cannot be any value in `1…N`.

Combined with C's own cage (size `M`), C's candidates are `{N+1 … M}`. When `N = M − 1`, C is **solved** outright.

The technique needs **no filled-in numbers** — only the cage shapes. It is the strongest opening move and the one most worth surfacing.

### Which cage shapes have a dominating cell

A cell C dominates K only if every cell of K fits inside C's 3×3 ring (the 8 cells around C). Working through every connected cage shape of size 1–5:

| Cage size | Shapes with a dominating cell | C is excluded from | If C is in a cage of size… |
|-----------|-------------------------------|--------------------|-----------------------------|
| 1 | the single cell | 1 | — (any neighbour ≠ 1) |
| 2 | every domino | 1, 2 → **≥ 3** | 3 → C = **3** |
| 3 | straight tromino **and** L-tromino — both | 1, 2, 3 → **≥ 4** | 4 → C = **4** |
| 4 | **only the L / J tetromino** | 1, 2, 3, 4 → **≥ 5** | 5 → C = **5** |
| 5 | none — a dominated 5-cage would force C ≥ 6 | — | — |

Key results:

- Among **4-cell** cages the L-shape is the *only* dominating shape. The square (O), T, S, Z and bar (I) tetrominoes have no fully-dominating external cell.
- Among **3-cell** cages **both** shapes work — the straight tromino is dominated by the cell centred on the opposite side of its middle; the L-tromino by its inner-corner cell.
- A **5-cell** cage is never dominated by an empty cell in a valid puzzle (it would need a 6). Only partial domination (§5) applies.

The dominating cell sits in the "inner corner" of an L, or directly across the middle of a straight run.

### Worked cases

- **L-tetromino → 5.** The inner-corner cell of a 4-cell L touches all four of `{1,2,3,4}`. If it belongs to a 5-cage it must be 5.
- **L-tromino + 4-cage → 4.** The inner-corner cell of a 3-cell L touches `{1,2,3}`. In a 4-cage it must be 4.
- **Domino + 3-cage → 3.** A cell touching both cells of a 2-cage touches `{1,2}`. In a 3-cage it must be 3.

---

## 5. Partial domination

When C is king-adjacent to *some* cells of a cage and those cells are already **filled** with distinct values `{v₁…vₖ}`, then C ≠ any `vᵢ`. This is ordinary adjacency elimination, but framed as a single readable hint ("this cell already sees the 1, 2 and 3 of that cage") rather than three separate ones.

Unlike §4, partial domination needs filled cells — touching `k` *empty* cells of a cage tells you nothing by size alone, because any value could be in any of them.

---

## 6. Candidate-set logic within a cage

- **Naked subset.** If `k` cells of a cage share exactly the same `k` candidates, those `k` values are locked to those cells — remove them from the cage's other cells. (`k = 2` pair, `k = 3` triple.)
- **Hidden subset.** If `k` values can only go in the same `k` cells of a cage, those cells are limited to those `k` values — remove all other candidates from them.

Naked and hidden subsets are duals; in a small cage (≤ 5) one is usually easier to spot than the other.

---

## 7. Locked candidates — the "sibling pair" family

**Principle.** Within cage K, if a value `V` can only land in a set `S` of cells, then any cell **outside K** that is king-adjacent to **every** cell of `S` cannot be `V` — whichever cell of `S` ends up holding `V` kills it for that outside cell.

The common, recognisable case is `|S| = 2`: `V` is confined to two "sibling" cells of a cage, and any cell touching both siblings loses `V`. Larger `S` works the same way but a fully-shared neighbour gets rarer.

This is the cross-cage counterpart of domination: §4 uses a *whole cage* to exclude values; §7 uses the *confined locations of one value*.

---

## 8. Flip-flop / equality (advanced)

When two 2-candidate cages (or two confined pairs) interlock, they force an alternating pattern: the value at one cell determines a chain of forced values, and cells of the same "phase" must hold equal values. That equality can then eliminate candidates elsewhere.

These are parity chains — powerful but hard to render as a short, legible hint. Lower priority than Tiers 1–4; revisit once those are in.

---

## 9. Contradiction trial — last resort only

The existing `findContradictionHint`: assume a candidate, propagate naked/hidden singles, and if a cell runs out of options the candidate is eliminated. Correct, but it explains a *search*, not a deduction.

It stays in the engine as the final fallback for puzzles (Expert tier) that genuinely need it, but it must run **after** every deductive tier above. A puzzle that any of Tiers 1–4 can crack should never receive a contradiction hint.

---

## 10. Hint-engine integration

`findHint` should try the techniques in the Tier order of §3, returning the first hit. Concretely, the new deductive passes (last-cell, cage domination, partial domination, subsets, locked candidates) are inserted between the hidden-single pass and the `findContradictionHint` fallback.

Each pass produces the existing `Hint` shape; the `type` union and the `HintChainEntry` roles already in `hints.ts` cover the new explanations (a domination hint is a `target` cell plus `info` entries for the dominating cage).

**Difficulty grading (done 2026-05-18).** The generator grades a puzzle by the hardest technique the hint engine needs — `gradeDifficulty` loops `findHint` and maps its `type` to a tier (naked → Easy, hidden → Medium, domination/pair-elimination → Hard, contradiction → Expert). This replaced the old backtrack-count proxy, so a difficulty label means "needs this technique" (progression.md §2). `solver.ts`'s backtracking solver stays — it still powers the unique-solution check (`countSolutions`).

---

## 11. Technique-slot mapping

`progression.md` §3 defines five mastery slots: `naked-single`, `hidden-single`, `forced-move`, `pair-elimination`, `contradiction-chain`. Before this work the engine emitted only the first two and `contradiction-chain`; `forced-move` and `pair-elimination` were unused names.

Mapping (accepted, as built):

| Slot | Engine technique |
|------|------------------|
| `naked-single` | unchanged |
| `hidden-single` | unchanged (also covers last-cell-in-cage) |
| `forced-move` | **cage domination** (`findDominationHint`) |
| `pair-elimination` | **naked/hidden subsets + locked candidates** (`findDeductiveHint`) |
| `contradiction-chain` | unchanged — the trial fallback |

This keeps the profile schema and the five chips stable. `findDeductiveHint` runs a candidate-elimination loop (§6–§7) and surfaces a hint the instant a strike pins a cell or a value; multi-step deductive chains that never pin anything are still left to the contradiction fallback. `pair-elimination` moves are not yet self-credited by `classifyMove` — a noted follow-up.

---

## Open questions

- **Clue-density tuning.** Per-tier carve densities (`generator.ts`) are tuned so a carve usually lands on the requested tier. Large-easy was raised to 0.62 on 2026-05-18; 8×8 medium currently generates in ~6 s — acceptable but worth a density pass if it grows.
- **Self-credit for `pair-elimination`.** `classifyMove` credits self-applied naked/hidden singles and domination, but not the subset / locked-candidate techniques (attributing a move to them needs the full elimination loop). Until it does, `pair-elimination` can show `usedCount` but never reaches the `mastered` chip state.
- **Flip-flop hints.** Whether parity chains (§8) are worth the rendering complexity for v1, or deferred.

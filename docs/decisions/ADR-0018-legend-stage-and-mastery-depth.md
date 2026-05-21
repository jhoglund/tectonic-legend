# ADR-0018: Legend stage + mastery depth (the I2 progression algorithm)

**Date:** 2026-05-20
**Status:** Accepted
**Source:** [`specs/progression.md`](../../specs/progression.md) (stages, mastery thresholds); [`specs/solving-techniques.md`](../../specs/solving-techniques.md) (technique catalogue); the **Legend tier** and **I2 — Improve the Technique card** entries in [`docs/backlog.md`](../backlog.md); [ADR-0006](ADR-0006-app-name.md) (brand).

## Context

The app is named **Tectonic Legend** (ADR-0006). The progression model (ADR-0001) is the differentiator — but today the highest stage a player can reach is `Master`, and the per-technique chip is a coarse three-state (`learning · familiar · mastered`) driven by a single `selfAppliedCount >= 8` threshold. The brand promises a peak; the spec stops one rung short.

The Open Question *"A difficulty tier above Expert (Legend?)"* in [`docs/backlog.md`](../backlog.md) resolved to **pure status** (2026-05-20): Legend is a stage the player earns, not a new generator tier. Clue density at Expert is already at the unique-solution floor; a Legend *difficulty* would require a new technique gate (depth-N contradictions, parity chains) that adds significant engine + grader work for an audience that hasn't yet hit Expert in soft launch. Status-only keeps the scope tight and the brand promise honest.

The companion ask — **I2** in the backlog — wants the mastery surface to be richer than a three-state chip: *"a progress bar that gradually rises toward mastery; reaching mastery / a Legend status should be genuinely hard. Mix of solve speed, hints-used vs. unaided, validation errors, and difficulty/level."* The depth score this ADR introduces is the engine behind that bar.

## Decision

### 1. Add stage 5 — Legend

`PlayerStage` becomes `0 | 1 | 2 | 3 | 4 | 5`; the names list extends with `Legend`.

| # | Stage | Unlock condition |
|---|-------|------------------|
| 5 | **Legend** | All five techniques at **Legend-grade depth** (see §3) |

Legend is the only stage **not** tied to one specific technique — every prior stage requires mastery of one technique. Reaching Legend means the player has reached deep mastery across the whole catalogue.

The Legend stage **does not unlock new puzzles** — every difficulty is already playable from stage 1 by [ADR-0012](ADR-0012-difficulty-is-player-choice.md). What it unlocks is the **status** itself, surfaced on Home, on the Solved screen, and on share artifacts.

Stage 5 is **the entry to Legend**, not the ceiling. The climb continues from here via the Legend tiers and the daily-puzzle leaderboard defined in [ADR-0019](ADR-0019-legend-tiers-and-leaderboard.md). The chip / halo this ADR introduces is the *Apprentice Legend* rung; ADR-0019 ladders above it.

### 2. Mastery is graded on a hidden **depth score**, surfaced as a progress bar

Each technique keeps its three-state chip headline (`learning · familiar · mastered`) — and gains a **fourth visual state, `legend`**, drawn as a halo / gem ring around the chip when the technique reaches Legend-grade depth. The headline never shows a number, in line with the [`progression.md` §9](../../specs/progression.md) anti-pattern *"Mastery shown as a numeric score. Chips only."*

Beneath the chip, a **progress bar** fills as the depth score climbs. The bar carries no numbers — it is a visual cue that effort and quality are accumulating. The bar continues filling past `mastered` toward `legend`, so the player can see the next rung.

### 3. The depth score formula

Per technique, a hidden 0–100 score:

```
depth(T) = Min(100,
    SELF      * 40 / SELF_TARGET
  + PUZZLES   * 30 / PUZZLES_TARGET
  + QUALITY   * 20
  + DIFFICULTY * 10
)
```

Weights **40 / 30 / 20 / 10** by decision (2026-05-20): heaviest on self-application — the original, behaviourally honest signal — second on distinct puzzles (breadth, not just repetition), with quality and difficulty as the lighter, *how-well* terms. The extreme `depth ≥ 95` / `puzzles ≥ 12` thresholds Jonas flagged in review go to the **next** rungs above Apprentice Legend (ADR-0019), not to this one.

Where the components are derived from `SolveRecord`s containing technique `T`:

| Component | What it measures | Cap |
|-----------|------------------|-----|
| `SELF` | `selfAppliedCount` for `T` | `SELF_TARGET = 12` |
| `PUZZLES` | `puzzlesContaining` for `T` (distinct puzzles the player self-applied `T` in) | `PUZZLES_TARGET = 5` |
| `QUALITY` | A 0–1 score from solves featuring `T`: low hint ratio, low error rate, time within par. Averaged over the player's last 10 solves featuring `T`. | 0–1 |
| `DIFFICULTY` | Fraction of those 10 solves that were Hard or Expert. | 0–1 |

Chip-state thresholds (no change to the existing player-facing semantics — re-expressed in terms of depth):

| State | Condition |
|-------|-----------|
| `learning` | `depth < 25` |
| `familiar` | `25 ≤ depth < 60` |
| `mastered` | `depth ≥ 60` **and** `puzzlesContaining ≥ 3` |
| `legend` | `depth ≥ 90` **and** `puzzlesContaining ≥ 8` |

`SELF_TARGET = 12` and `PUZZLES_TARGET = 5` were calibrated so that an existing v1 mastered player (`selfApplied >= 8`, `puzzles >= 3`) lands at depth ≈ 60 with merely average QUALITY + DIFFICULTY, i.e. stays mastered through the migration by intent. The earlier draft of this ADR proposed 20 / 12; that put a v1-mastered player at depth ≈ 50, drifting them below the `mastered` chip threshold — wrong for migration. Above mastered, the `legend` chip (depth ≥ 90) still demands real QUALITY + DIFFICULTY contributions; the `legendRung` ladder of ADR-0019 climbs on `puzzlesContaining` (un-capped) once depth pegs at 100.

These targets are first-draft. They're tunable in one place — `src/lib/progression.ts` — and the soft-launch data tells us whether `legend` is reachable at the right rate. Tracked in the open-questions section of [`progression.md`](../../specs/progression.md).

### 4. New `SolveRecord` fields the score reads

`SolveRecord` (defined in [`progression.md` §8](../../specs/progression.md)) gains:

```ts
errorsValidated: number;   // distinct cells the player tapped Validate on and were wrong
hintsByTechnique: Record<TechniqueName, number>;  // (already there)
parTimeMs?: number;        // the benchmark for this puzzle's difficulty/grid, for QUALITY's time term
```

`errorsValidated` is new instrumentation; `parTimeMs` can be a static lookup from a table seeded on the difficulty × grid size pair. The format change is a `schemaVersion: 1 → 2` migration in `profile-migrations.ts`.

### 5. UI surfaces

- **Technique card** (Stats screen, Solved screen): chip with the four states + a progress bar beneath. The bar is the visible engine of I2.
- **Home**: the stage chip displays `Legend` once earned, with a subtle gem accent — the only flourish the brand allows beyond the existing typographic quietness ([`progression.md` §5](../../specs/progression.md): *quiet, warm, adult*).
- **Stage-up card** for Legend: borrows the existing `StageUpCard` shape, with copy that names the achievement plainly — no exclamation, no animation. Suggested copy: *"You're a Legend now. You've worked every technique to its depth — the puzzle is yours."*
- **Share artifact**: a `Legend ✦` tag appended to the existing emoji-grid block when the solver is at stage 5.

## Consequences

- **Enables:** the brand and the spec finally agree — *Tectonic Legend* is a status the player can earn. The progress bar gives players a visible reason to keep solving past the current `mastered` ceiling. The score formula is one place to tune.
- **Costs:** `schemaVersion` bumps to 2 (first migration in this codebase); `SolveRecord` grows; `progression.ts` grows the depth-score function and Legend-stage transition; the Technique card and Home stage chip pick up a new visual state; a Legend `StageUpCard` joins the existing four. Tests need to cover the score function and the Legend transition.
- **Implies:** soft-launch data is the calibration source — the `SELF_TARGET / PUZZLES_TARGET` and the chip thresholds are first-draft guesses. The flagged follow-up *self-credit for `pair-elimination`* in [`solving-techniques.md`](../../specs/solving-techniques.md) §11 becomes the gating dependency for Legend reachability: until `classifyMove` credits self-applied pair-eliminations, the `pair-elimination` chip cannot reach `mastered`, so Legend stage cannot be reached. Solving that is in scope of this work.
- **Sequenced:** [ADR-0019](ADR-0019-legend-tiers-and-leaderboard.md) lifts the ceiling — Apprentice Legend (this ADR) is the entry rung; ADR-0019 adds the higher rungs (Adept / Grand / Mythic) plus the opt-in daily-puzzle leaderboard. ADR-0019 is spec-only until the engine work here lands.

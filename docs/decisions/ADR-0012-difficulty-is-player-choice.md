# ADR-0012: Difficulty is player-choice — stage gating disabled

**Date:** 2026-05-15
**Status:** Accepted
**Source:** [specs/progression.md](../../specs/progression.md), refines [ADR-0001](ADR-0001-difficulty-progression-as-differentiator.md)

## Context

ADR-0001 made the difficulty journey the differentiator: five player stages, each unlocking one difficulty (Beginner→Easy … Master→Expert), advanced by demonstrating technique mastery. The gating shipped in Phase 2 (backlog item 9). On review Jonas decided a hard content lock is the wrong call — it blocks players who already know Tectonic from the puzzles they want, couples "what I can play" to how well the engine scores my play, and the `forced-move` gate to Master is not even engine-detectable yet.

## Decision

Stage gating is permanently disabled (`STAGE_GATING_ENABLED = false` in `DifficultyPicker`). Every difficulty is playable from the first session. The stage system stays — stages still advance through mastery, the Home stage indicator and the stage-up cards remain — but a stage is a progress indicator, not a content lock. The gating code (the `isDifficultyUnlocked` logic, the lock rendering) is kept dormant behind the flag, not deleted.

## Consequences

- **Enables:** experienced players reach Hard / Expert immediately; difficulty is a free choice every session; no mastery-grind wall.
- **Precludes:** the original "earn your way up" funnel from ADR-0001, and difficulty-as-moat — premium gating, if any, will not be the difficulty ladder (revisit ADR-0007).
- **Implies:** ADR-0001's progression is now a guide and a badge, not a gate; the stage-up cards' "unlocked" wording reads as cosmetic; re-enabling the lock is a one-line flag flip if soft-launch data argues for it.

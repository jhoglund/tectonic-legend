# Progression spec

> The single source of truth for difficulty progression, technique mastery, unlocks, tutorial structure, and stats. This is the differentiator. Every other product surface bends around it.

**Last updated:** 2026-05-14
**Source for decisions:** [ADR-0001](../docs/decisions/ADR-0001-difficulty-progression-as-differentiator.md)

---

## 1. Player stages

A player is in exactly one stage at any time. Stages are advanced by demonstrating mastery, not by purchase or self-selection.

| # | Stage | Available difficulties | Unlock condition (from previous stage) |
|---|-------|------------------------|----------------------------------------|
| 0 | **Newcomer** | Tutorial puzzles only | First launch |
| 1 | **Beginner** | + Easy | Complete 3 tutorial puzzles |
| 2 | **Confident** | + Medium | `naked-single` mastered (see §3) |
| 3 | **Advanced** | + Hard | `hidden-single` mastered |
| 4 | **Master** | + Expert | `forced-move` mastered AND 5 Hard solves |
| 5 | **Legend** | (no new difficulty) | Every technique at Legend depth — see [ADR-0018](../docs/decisions/ADR-0018-legend-stage-and-mastery-depth.md) |

Stages are stored in the player profile as `stage: 0 | 1 | 2 | 3 | 4 | 5`. The transition function `nextStageFor(profile): Stage | null` is a pure function in `src/lib/progression.ts`. Stage 5 is the entry rung of the Legend climb; the higher rungs (Apprentice → Adept → Grand → Mythic Legend) and the daily-puzzle leaderboard are specified in [ADR-0019](../docs/decisions/ADR-0019-legend-tiers-and-leaderboard.md) and carried on the profile as `legendRung: 0 | 1 | 2 | 3 | 4`.

### Down-stage policy

Stages **do not** regress. Once earned, always available. A player who hasn't solved a Hard puzzle in 30 days is still in `Master`; they just see "Resume" on the home screen, not a humiliating downgrade.

---

## 2. Difficulty calibration

The generator gates puzzles by **the minimum-strength technique required to solve them**. See [`ARCHITECTURE.md` §3](../ARCHITECTURE.md).

| Difficulty | Minimum solvable technique |
|------------|----------------------------|
| Easy | Naked singles only |
| Medium | Up to hidden singles |
| Hard | Up to forced moves / pair eliminations (logic only, no guessing) |
| Expert | Requires contradiction chains |

Critical invariant: **an Easy puzzle is never solvable only by guessing.** Every puzzle in every difficulty has a deterministic logic path. The generator rejects any candidate that fails this check.

**As built (2026-05-18).** Difficulty is graded by the hardest technique the hint engine needs to solve the puzzle — `gradeDifficulty` in `src/engine/hints.ts` — which is what this table always intended. Easy = naked singles only; Medium = also needs hidden singles; Hard = needs deductive technique (cage domination, subsets, or locked candidates — logic only, no guessing); Expert = needs contradiction reasoning, or sits beyond the engine's deductive reach. The generator carves a candidate to a per-tier clue density, then accepts it only if it grades to the requested tier. This replaced an interim backtrack-count proxy (in place 2026-05-15 → 2026-05-18, while the solver knew only naked/hidden singles): a label now means "requires this technique", not "stumped a weak solver". See [`solving-techniques.md`](solving-techniques.md). A tier above Expert (Legend) is intended to gate on demonstrated mastery of every technique — see the backlog.

---

## 3. Technique mastery

The hint engine emits a `technique` label on every deduction step. The player profile counts two things per technique:

```ts
type TechniqueMastery = {
  technique: 'naked-single' | 'hidden-single' | 'forced-move' | 'pair-elimination' | 'contradiction-chain';
  usedCount: number;         // technique fired in a puzzle the player completed
  selfAppliedCount: number;  // player made the move BEFORE the hint engine offered it
  puzzlesContaining: number; // distinct puzzles in which the player self-applied this technique
};
```

The five slots map to hint-engine techniques per [`solving-techniques.md` §11](solving-techniques.md): `naked-single` and `hidden-single` are the basic singles, `forced-move` is **cage domination** (a cell that sees a whole adjacent cage's values), `pair-elimination` is the naked/hidden-subset and locked-candidate elimination pass, and `contradiction-chain` is the trial fallback of last resort.

### Mastery depth score

[ADR-0018](../docs/decisions/ADR-0018-legend-stage-and-mastery-depth.md) replaces the raw `selfAppliedCount >= 8` threshold with a composite 0–100 **depth score** per technique, weighted `40 / 30 / 20 / 10` over self-applications, distinct puzzles, solve quality (hint ratio + error rate + time-vs-par), and difficulty mix. The score is hidden from the player; the **chip + a non-numeric progress bar** are the surface (§9 anti-pattern still holds — no numbers in the UI).

Chip state thresholds:

| State | Condition |
|-------|-----------|
| `learning` | `depth < 25` |
| `familiar` | `25 ≤ depth < 60` |
| `mastered` | `depth ≥ 60` **and** `puzzlesContaining ≥ 3` |
| `legend` | `depth ≥ 90` **and** `puzzlesContaining ≥ 8` |

The existing `mastered` boundary (selfApplied 8 / puzzles 3) lands at depth ≈ 60 by design, so a player who is mastered today stays mastered after the migration. Above `legend`, [ADR-0019](../docs/decisions/ADR-0019-legend-tiers-and-leaderboard.md) defines the higher rungs (Adept / Grand / Mythic Legend). All thresholds are first-draft; calibration source is soft-launch data.

### What counts as "self-applied"

The hint engine runs continuously in the background. A move is `selfApplied` if:
- The player placed the correct value for a cell where exactly one technique would have justified it, AND
- The hint engine had not surfaced a hint for that cell within the current session.

If the player used a hint, the move is `assisted` and counts toward `usedCount` only.

### Surfacing mastery

Each technique gets a chip with four visual states + a non-numeric progress bar beneath. The chip + bar appear in Stats and on the Solved screen.

| State | Visual |
|-------|--------|
| `learning` | Outline chip, muted colour |
| `familiar` | Filled chip, brand colour |
| `mastered` | Filled chip with checkmark, brand emerald |
| `legend` | Filled chip with a gem halo; the halo's accent reflects the current Legend rung ([ADR-0019](../docs/decisions/ADR-0019-legend-tiers-and-leaderboard.md)) |

Mastery is never expressed as a raw number to the player. The chip + progress bar are the entire surface; the depth score is internal.

---

## 4. Tutorial puzzles

Three curated puzzles for Newcomer, plus one per stage-up. Stored as typed fixtures in `src/data/tutorials/` (`fixtures.ts` — `cellGroups` + `solution` come from the engine generator, so every board is provably valid).

### Newcomer tutorials (sequence)

Each is a short, **fully guided** 5×5 — the player taps the one highlighted cell's value, step by step, with a per-step explanation. Wrong taps are nudged, never recorded. (First-draft scope: tutorials are entirely scripted rather than mixing guided and free play — simpler to build and a tighter onboarding beat. Revisit with soft-launch data.)

1. **Read a cage.** Solution mostly filled; the player completes 3 cells using only the cage rule and sees coordinates (`A1`, `B2`, etc.) in the explanation copy.
2. **Complete a cage.** 5 guided cells, each the last empty cell of its cage. This reinforces scanning fuller cages before adding neighbour logic.
3. **Find a naked single.** 5 guided cells, each framed as ruling every value but one out by cage + neighbours. This is the first combined-rule beginner move.

### Stage-up tutorials

Each stage-up introduces a single tutorial puzzle that demonstrates the new technique with a guided overlay:

| On entering stage | Tutorial focus |
|--------------------|----------------|
| Confident (Medium unlocked) | Hidden singles |
| Advanced (Hard unlocked) | Forced moves + pair eliminations |
| Master (Expert unlocked) | Reading a contradiction chain end-to-end |

Tutorial puzzles bypass the procedural generator. They are deterministic — every player gets the same sequence. `TutorialScreen` walks the player through, rendering the shared `Board` over an engine `GameState`; `TutorialFlow` owns the funnel (welcome card → the three tutorials → Beginner). Stage-up tutorials are not yet built.

---

## 5. Unlocks (the celebration moment)

When a player crosses a stage threshold, the next puzzle they attempt **begins with a single full-screen card** before the board appears:

```
You're a Confident player now.

Medium puzzles are unlocked.
Medium asks you to look for where a value can go,
not just what value a cell must hold.

[Continue]
```

The card is dismissible by tap and never repeats. The card is the only celebration — no confetti, no animation, no popup chain. The brand voice is `quiet, warm, adult`.

**As built:** `StageUpCard` (one of four, by target stage) renders on the Home surface whenever `profile.stage` exceeds `profile.celebratedStage`; Continue marks the stage celebrated. Dismissal returns to Home — the stage-up tutorial puzzles are not yet built (they fold into a later pass). The Open Design pass for these cards was skipped by decision; revisit the visual treatment there if the moment needs more weight.

---

## 6. Stats surface

Three sections, ordered top to bottom. Detailed in [`PRD.md` §4](../PRD.md). The spec-level constraint:

- **Solve performance** — free tier.
- **Technique mastery** — premium tier (per [ADR-0007](../docs/decisions/ADR-0007-free-premium-feature-split.md)).
- **Streaks** — free tier. Resets are reframed as "Resume from {date}", never "broken".

The Stats surface is hard-gated until ≥5 solves exist in the profile — earlier than that it shows an empty state pointing back to the Practice tab.

---

## 7. Paywall triggers (tied to progression)

The paywall surfaces at these moments — never randomly, never as a banner, never as a modal interrupting the solve.

| Trigger | Context |
|---------|---------|
| Player taps a locked difficulty (Hard or Expert) | Stage-earned but tier-locked |
| Player taps a contradiction-chain hint | Tier-locked feature |
| Player taps a daily-puzzle archive entry older than 7 days | Content-window paywall |
| Player taps the technique-mastery section in Stats | Tier-locked stats |
| Hit free-tier daily limit on forced-move hints (3) | Soft limit; offer premium |

The paywall surface itself is designed in Open Design. The offer copy adapts to the trigger — a player hitting Hard hears "You've earned this. Keep going."; a player hitting the contradiction-chain hint hears "See exactly why each move works."

---

## 8. Profile schema

The player profile is the data behind all of this. Local-only in v1; designed to be cloud-syncable later without breaking the format.

```ts
type PlayerProfile = {
  stage: 0 | 1 | 2 | 3 | 4 | 5;
  legendRung: 0 | 1 | 2 | 3 | 4;    // 0 = pre-Legend; 1–4 = Apprentice → Mythic (ADR-0019)
  techniques: Record<TechniqueName, TechniqueMastery>;
  tutorialsCompleted: number;       // Newcomer tutorials done — gates stage 0 → 1
  solveHistory: SolveRecord[];      // capped at last 1000
  streak: { current: number; longest: number; lastSolveDate: string };
  tier: 'free' | 'premium';
  premiumExpiresAt?: string;        // ISO date, for receipt-validated subs
  settings: { theme: string; sound: boolean; haptics: boolean };
  schemaVersion: 2;
};

type SolveRecord = {
  date: string;                     // ISO
  difficulty: Difficulty;
  gridSize: GridSize;
  timeMs: number;
  parTimeMs?: number;               // benchmark for QUALITY's time term (ADR-0018)
  hintsUsed: { technique: TechniqueName; count: number }[];
  errorsValidated: number;          // distinct wrong cells the player tapped Validate on
  isDailyPuzzle: boolean;
};
```

`schemaVersion: 2` is mandatory after [ADR-0018](../docs/decisions/ADR-0018-legend-stage-and-mastery-depth.md). The 1 → 2 migration in `src/lib/profile-migrations.ts` seeds `legendRung: 0`, `errorsValidated: 0` on existing solve records, and leaves `parTimeMs` undefined (it's derived from a difficulty × grid-size lookup at depth-score time when unset).

---

## 9. Anti-patterns

Things this spec explicitly rejects.

- **Difficulty pickers as the home screen.** The home screen leads with the daily puzzle and the resume slot; difficulty selection is one tap in.
- **Mastery shown as a numeric score.** Chips only.
- **Broken-streak punishment UI.** Resets are reframed.
- **"Unlock all" purchase.** The journey is the moat. A purchase that bypasses the journey defeats the product.
- **Hints that don't explain.** Every hint surfaces its technique label. The contradiction stepper is the canonical pattern.
- **Stage regression.** Once earned, always available.

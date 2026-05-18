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

Stages are stored in the player profile as `stage: 0 | 1 | 2 | 3 | 4`. The transition function `nextStageFor(profile): Stage | null` is a pure function in `src/lib/progression.ts` (to be written).

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

**As built (2026-05-15).** The solver implements three techniques — naked single, hidden single, and backtracking search — so the four tiers are graded as: Easy = naked singles only; Medium = also needs hidden singles; Hard = needs real search (`backtracks ≥ 1`, below the Expert floor); Expert = needs sustained search (`backtracks ≥ 8` on 5×5, `≥ 15` on 8×8). Backtrack count — dead-end branches the search abandons — is the difficulty proxy; gating on it (not merely "did the solver guess once") is what makes Expert genuinely hard. Clue density was also lowered a notch per tier the same day. A tier above Expert would need a deeper gate still — see the Legend-level open question in the backlog.

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

### Mastery thresholds

A technique is **mastered** when:

- `selfAppliedCount >= 8`, AND
- `puzzlesContaining >= 3`.

These are first-draft values. Real soft-launch data may move them — tracked as an Open Question in [`docs/backlog.md`](../docs/backlog.md). Adjusting thresholds is a one-line change in `src/lib/progression.ts`.

### What counts as "self-applied"

The hint engine runs continuously in the background. A move is `selfApplied` if:
- The player placed the correct value for a cell where exactly one technique would have justified it, AND
- The hint engine had not surfaced a hint for that cell within the current session.

If the player used a hint, the move is `assisted` and counts toward `usedCount` only.

### Surfacing mastery

Each technique gets a chip with three visual states. The chip appears in stats and on the post-solve summary.

| State | Condition | Visual |
|-------|-----------|--------|
| `learning` | `usedCount < 5` | Outline chip, muted color |
| `familiar` | `usedCount >= 5` AND not mastered | Filled chip, brand color |
| `mastered` | mastery condition met | Filled chip with checkmark, brand emerald |

Mastery is never expressed as a raw number to the player. The chip is the entire surface.

---

## 4. Tutorial puzzles

Three curated puzzles for Newcomer, plus one per stage-up. Stored as typed fixtures in `src/data/tutorials/` (`fixtures.ts` — `cellGroups` + `solution` come from the engine generator, so every board is provably valid).

### Newcomer tutorials (sequence)

Each is a short, **fully guided** 5×5 — the player taps the one highlighted cell's value, step by step, with a per-step explanation. Wrong taps are nudged, never recorded. (First-draft scope: tutorials are entirely scripted rather than mixing guided and free play — simpler to build and a tighter onboarding beat. Revisit with soft-launch data.)

1. **Reading the board.** Solution mostly filled; the player completes 3 cells. The steps walk through the cage rule and the no-touching-neighbors rule.
2. **Naked singles.** 5 guided cells, each framed as ruling every value but one out by cage + neighbors.
3. **Cage completion.** 5 guided cells, each the last empty cell of its cage.

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
  stage: 0 | 1 | 2 | 3 | 4;
  techniques: Record<TechniqueName, TechniqueMastery>;
  tutorialsCompleted: number;       // Newcomer tutorials done — gates stage 0 → 1
  solveHistory: SolveRecord[];      // capped at last 1000
  streak: { current: number; longest: number; lastSolveDate: string };
  tier: 'free' | 'premium';
  premiumExpiresAt?: string;        // ISO date, for receipt-validated subs
  settings: { theme: string; sound: boolean; haptics: boolean };
  schemaVersion: 1;
};

type SolveRecord = {
  date: string;                     // ISO
  difficulty: Difficulty;
  gridSize: GridSize;
  timeMs: number;
  hintsUsed: { technique: TechniqueName; count: number }[];
  isDailyPuzzle: boolean;
};
```

`schemaVersion: 1` is mandatory. Schema migrations are pure functions in `src/lib/profile-migrations.ts` (to be written when v2 ships).

---

## 9. Anti-patterns

Things this spec explicitly rejects.

- **Difficulty pickers as the home screen.** The home screen leads with the daily puzzle and the resume slot; difficulty selection is one tap in.
- **Mastery shown as a numeric score.** Chips only.
- **Broken-streak punishment UI.** Resets are reframed.
- **"Unlock all" purchase.** The journey is the moat. A purchase that bypasses the journey defeats the product.
- **Hints that don't explain.** Every hint surfaces its technique label. The contradiction stepper is the canonical pattern.
- **Stage regression.** Once earned, always available.

import type { Difficulty, GridSize } from '../engine/types';

/**
 * The difficulty-progression model — the product's differentiator.
 * Pure logic only; no storage, no React. Source of truth for the rules
 * is specs/progression.md (read it before changing thresholds here).
 */

/** Solving techniques the hint engine can attribute a move to. */
export type TechniqueName =
  | 'naked-single'
  | 'hidden-single'
  | 'forced-move'
  | 'pair-elimination'
  | 'contradiction-chain';

export const TECHNIQUE_NAMES: readonly TechniqueName[] = [
  'naked-single',
  'hidden-single',
  'forced-move',
  'pair-elimination',
  'contradiction-chain',
];

/** Player-facing technique names — for chips, stats, the solved screen. */
export const TECHNIQUE_LABELS: Record<TechniqueName, string> = {
  'naked-single': 'Naked single',
  'hidden-single': 'Hidden single',
  'forced-move': 'Forced move',
  'pair-elimination': 'Pair elimination',
  'contradiction-chain': 'Contradiction chain',
};

/** Player journey stage. Stages never regress (progression.md §1).
 *  Stage 5 is the entry rung of the Legend climb (ADR-0018); the four
 *  Legend rungs above it ride on the `legendRung` profile field
 *  (ADR-0019). */
export type PlayerStage = 0 | 1 | 2 | 3 | 4 | 5;

export const STAGE_NAMES: Record<PlayerStage, string> = {
  0: 'Newcomer',
  1: 'Beginner',
  2: 'Confident',
  3: 'Advanced',
  4: 'Master',
  5: 'Legend',
};

/** Per-technique counters (progression.md §3). */
export interface TechniqueMastery {
  technique: TechniqueName;
  /** Times the technique fired in a puzzle the player completed. */
  usedCount: number;
  /** Times the player made the move before the engine offered a hint. */
  selfAppliedCount: number;
  /** Distinct puzzles in which the player self-applied this technique. */
  puzzlesContaining: number;
}

/** The four visible chip states for a technique (ADR-0018).
 *  `legend` is the entry rung of stage 5; ADR-0019 adds rung accents
 *  within `legend` on top. */
export type MasteryState = 'learning' | 'familiar' | 'mastered' | 'legend';

/** Tunable thresholds (progression.md §3). First-draft values — real
 *  soft-launch data may move them; this is the one place to change.
 *  Legacy `selfApplied / puzzles / familiarUsed` are kept so existing
 *  callers (DevTools fixtures, tests) keep compiling; the live chip
 *  state is now driven by the depth score (`masteryStateFromDepth`). */
export const MASTERY = {
  /** Self-applications needed to master a technique (legacy). */
  selfApplied: 8,
  /** Distinct puzzles needed to master a technique (legacy). */
  puzzles: 3,
  /** usedCount at which a technique becomes "familiar" (legacy). */
  familiarUsed: 5,
} as const;

/* ------------------------------------------------------------------ *
 * Depth score (ADR-0018) — the engine of the four-state chip and the
 * mastery progress bar. A hidden 0–100 per technique, weighted over
 * self-applications, distinct puzzles, solve quality and difficulty.
 * ------------------------------------------------------------------ */

/** Cap on the SELF contribution — depth gets full SELF credit once the
 *  player has self-applied this technique this many times. */
export const SELF_TARGET = 12;
/** Cap on the PUZZLES contribution — full credit at this many distinct
 *  puzzles where the player self-applied this technique. */
export const PUZZLES_TARGET = 5;

/** Chip-state thresholds (depth + minimum puzzlesContaining). */
export const DEPTH = {
  familiar: 25,
  mastered: { depth: 60, puzzles: 3 },
  legend: { depth: 90, puzzles: 8 },
} as const;

/** First-draft par solve times in ms, keyed by difficulty × grid size.
 *  Used by the depth score's QUALITY time term when a SolveRecord
 *  doesn't carry its own `parTimeMs`. Soft-launch data tunes this. */
export const PAR_TIME_MS: Record<GridSize, Record<Difficulty, number>> = {
  '5x5': { easy: 60_000, medium: 120_000, hard: 240_000, expert: 480_000 },
  '8x8': { easy: 180_000, medium: 360_000, hard: 720_000, expert: 1_440_000 },
};

/** Minimal SolveRecord shape the depth score reads. profile.ts's
 *  SolveRecord conforms structurally, but the dependency only goes one
 *  way — profile.ts → progression.ts — so progression.ts states the
 *  shape it needs locally. */
export interface DepthSolveRecord {
  difficulty: Difficulty;
  gridSize: GridSize;
  timeMs: number;
  hintsUsed: readonly { technique: TechniqueName; count: number }[];
  techniqueTally?: readonly {
    technique: TechniqueName;
    used: number;
    selfApplied: number;
  }[];
  errorsValidated: number;
  parTimeMs?: number;
}

/** Does this solve feature the technique — i.e. was it engaged with at
 *  least once, hint-assisted or self-applied? */
function solveFeatures(r: DepthSolveRecord, t: TechniqueName): boolean {
  const tally = r.techniqueTally?.find((x) => x.technique === t);
  if (tally) return tally.used > 0 || tally.selfApplied > 0;
  return r.hintsUsed.some((h) => h.technique === t && h.count > 0);
}

/** Per-solve 0–1 QUALITY for technique `t`. The three sub-factors
 *  (hint-reliance, error rate, time vs par) are averaged equally; this
 *  is deliberately simple — the formula is tunable in one place. */
function solveQuality(r: DepthSolveRecord, t: TechniqueName): number {
  const tally = r.techniqueTally?.find((x) => x.technique === t);
  const used = tally?.used ?? r.hintsUsed.find((h) => h.technique === t)?.count ?? 0;
  const selfApplied = tally?.selfApplied ?? 0;
  const hintCount = Math.max(0, used - selfApplied);
  const hintFactor = used > 0 ? 1 - hintCount / used : 1;

  const errorFactor = Math.max(0, 1 - r.errorsValidated / 5);

  const par = r.parTimeMs ?? PAR_TIME_MS[r.gridSize][r.difficulty];
  // 1 at or under par; 0 at or above 3× par; linear in between. The
  // 3× ceiling is forgiving on purpose — a slow but correct solve
  // shouldn't tank the score so far that mastered drifts out of reach.
  const ratio = r.timeMs / par;
  const timeFactor = Math.max(0, Math.min(1, (3 - ratio) / 2));

  return (hintFactor + errorFactor + timeFactor) / 3;
}

/**
 * Hidden 0–100 depth score for one technique (ADR-0018). Weights:
 *   40 · SELF  +  30 · PUZZLES  +  20 · QUALITY  +  10 · DIFFICULTY
 * QUALITY and DIFFICULTY are averaged over the player's last 10 solves
 * featuring this technique; with fewer than 10 they're averaged over
 * what we have, and over zero they contribute 0 (the player hasn't
 * shown enough of this technique yet for those terms to mean anything).
 */
export function computeDepth(
  technique: TechniqueName,
  mastery: TechniqueMastery,
  history: readonly DepthSolveRecord[],
): number {
  const featuring = history.filter((r) => solveFeatures(r, technique)).slice(-10);

  const self =
    (Math.min(mastery.selfAppliedCount, SELF_TARGET) * 40) / SELF_TARGET;
  const puzzles =
    (Math.min(mastery.puzzlesContaining, PUZZLES_TARGET) * 30) / PUZZLES_TARGET;
  const quality =
    featuring.length === 0
      ? 0
      : 20 *
        (featuring
          .map((r) => solveQuality(r, technique))
          .reduce((a, b) => a + b, 0) / featuring.length);
  const difficulty =
    featuring.length === 0
      ? 0
      : 10 *
        (featuring.filter(
          (r) => r.difficulty === 'hard' || r.difficulty === 'expert',
        ).length / featuring.length);

  return Math.min(100, self + puzzles + quality + difficulty);
}

/** The chip state from a precomputed depth + puzzles count. */
export function masteryStateFromDepth(
  depth: number,
  puzzlesContaining: number,
): MasteryState {
  if (depth >= DEPTH.legend.depth && puzzlesContaining >= DEPTH.legend.puzzles) {
    return 'legend';
  }
  if (
    depth >= DEPTH.mastered.depth &&
    puzzlesContaining >= DEPTH.mastered.puzzles
  ) {
    return 'mastered';
  }
  if (depth >= DEPTH.familiar) return 'familiar';
  return 'learning';
}

/** Tutorial puzzles to complete before leaving the Newcomer stage. */
export const TUTORIALS_TO_BEGINNER = 3;
/** Hard solves required (with forced-move mastery) to reach Master. */
export const HARD_SOLVES_TO_MASTER = 5;

/** A fresh, zeroed counter for one technique. */
export function emptyMastery(technique: TechniqueName): TechniqueMastery {
  return { technique, usedCount: 0, selfAppliedCount: 0, puzzlesContaining: 0 };
}

/** True iff the player has crossed the `mastered` chip threshold —
 *  used by `nextStageFor` to advance through the stages. With history
 *  the depth score drives the answer; without it (callers that don't
 *  have access to the solve history) the legacy raw-counter thresholds
 *  apply, so old call sites keep working. */
export function isTechniqueMastered(
  m: TechniqueMastery,
  history?: readonly DepthSolveRecord[],
): boolean {
  if (history) {
    const state = masteryState(m, history);
    return state === 'mastered' || state === 'legend';
  }
  return (
    m.selfAppliedCount >= MASTERY.selfApplied &&
    m.puzzlesContaining >= MASTERY.puzzles
  );
}

/** The chip state for a technique. With a solve history the depth
 *  score is used; without one a legacy approximation falls back on the
 *  raw counters (so callers that haven't been threaded with history
 *  yet stay correct, just less expressive). */
export function masteryState(
  m: TechniqueMastery,
  history?: readonly DepthSolveRecord[],
): MasteryState {
  if (history) {
    const depth = computeDepth(m.technique, m, history);
    return masteryStateFromDepth(depth, m.puzzlesContaining);
  }
  // Legacy fallback — chip without depth context.
  if (
    m.selfAppliedCount >= MASTERY.selfApplied &&
    m.puzzlesContaining >= MASTERY.puzzles
  ) {
    return 'mastered';
  }
  if (m.usedCount >= MASTERY.familiarUsed) return 'familiar';
  return 'learning';
}

/** Difficulties a player at this stage can play (progression.md §1).
 *  Legend (stage 5) is pure status — no new difficulty (ADR-0018). */
export function availableDifficulties(stage: PlayerStage): Difficulty[] {
  switch (stage) {
    case 0:
      return [];
    case 1:
      return ['easy'];
    case 2:
      return ['easy', 'medium'];
    case 3:
      return ['easy', 'medium', 'hard'];
    case 4:
    case 5:
      return ['easy', 'medium', 'hard', 'expert'];
  }
}

/**
 * Per-difficulty unlock data (progression.md §1) — the stage that
 * opens it, and the plain-language requirement shown on a locked row.
 * `requirement` is a bare action; the UI appends "to unlock".
 */
export const DIFFICULTY_UNLOCK: Record<
  Difficulty,
  { stage: PlayerStage; requirement: string }
> = {
  easy: { stage: 1, requirement: 'Finish the 3 starter tutorials' },
  medium: { stage: 2, requirement: 'Master naked singles' },
  hard: { stage: 3, requirement: 'Master hidden singles' },
  expert: { stage: 4, requirement: 'Master forced moves' },
};

/** Whether a player at this stage may play this difficulty. */
export function isDifficultyUnlocked(
  stage: PlayerStage,
  difficulty: Difficulty,
): boolean {
  return stage >= DIFFICULTY_UNLOCK[difficulty].stage;
}

/** Minimal view of a profile needed to evaluate stage advancement —
 *  kept structural so progression.ts has no dependency on profile.ts.
 *  `history` (ADR-0018) is what the depth score reads to grade each
 *  technique; it's optional so legacy callers without it keep working
 *  against the legacy mastered thresholds. */
export interface StageInput {
  stage: PlayerStage;
  techniques: Record<TechniqueName, TechniqueMastery>;
  tutorialsCompleted: number;
  hardSolveCount: number;
  history?: readonly DepthSolveRecord[];
}

/**
 * The single stage the player has earned the right to advance INTO,
 * or null if they haven't met the next threshold. Stages advance by
 * one; recordSolve() loops this to handle a multi-stage jump. Stage 5
 * (Legend) unlocks when every technique reaches the `legend` chip
 * state (ADR-0018).
 */
export function nextStageFor(input: StageInput): PlayerStage | null {
  const { stage, techniques, tutorialsCompleted, hardSolveCount, history } =
    input;
  switch (stage) {
    case 0:
      return tutorialsCompleted >= TUTORIALS_TO_BEGINNER ? 1 : null;
    case 1:
      return isTechniqueMastered(techniques['naked-single'], history) ? 2 : null;
    case 2:
      return isTechniqueMastered(techniques['hidden-single'], history) ? 3 : null;
    case 3:
      return isTechniqueMastered(techniques['forced-move'], history) &&
        hardSolveCount >= HARD_SOLVES_TO_MASTER
        ? 4
        : null;
    case 4: {
      const allLegend = TECHNIQUE_NAMES.every(
        (t) => masteryState(techniques[t], history ?? []) === 'legend',
      );
      return allLegend ? 5 : null;
    }
    case 5:
      return null;
  }
}

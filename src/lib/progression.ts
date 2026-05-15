import type { Difficulty } from '../engine/types';

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

/** Player journey stage. Stages never regress (progression.md §1). */
export type PlayerStage = 0 | 1 | 2 | 3 | 4;

export const STAGE_NAMES: Record<PlayerStage, string> = {
  0: 'Newcomer',
  1: 'Beginner',
  2: 'Confident',
  3: 'Advanced',
  4: 'Master',
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

/** The three visible chip states for a technique. */
export type MasteryState = 'learning' | 'familiar' | 'mastered';

/** Tunable thresholds (progression.md §3). First-draft values —
 *  real soft-launch data may move them; this is the one place to change. */
export const MASTERY = {
  /** Self-applications needed to master a technique. */
  selfApplied: 8,
  /** Distinct puzzles needed to master a technique. */
  puzzles: 3,
  /** usedCount at which a technique becomes "familiar". */
  familiarUsed: 5,
} as const;

/** Tutorial puzzles to complete before leaving the Newcomer stage. */
export const TUTORIALS_TO_BEGINNER = 3;
/** Hard solves required (with forced-move mastery) to reach Master. */
export const HARD_SOLVES_TO_MASTER = 5;

/** A fresh, zeroed counter for one technique. */
export function emptyMastery(technique: TechniqueName): TechniqueMastery {
  return { technique, usedCount: 0, selfAppliedCount: 0, puzzlesContaining: 0 };
}

/** A technique is mastered once it clears both thresholds. */
export function isTechniqueMastered(m: TechniqueMastery): boolean {
  return (
    m.selfAppliedCount >= MASTERY.selfApplied &&
    m.puzzlesContaining >= MASTERY.puzzles
  );
}

/** The chip state for a technique (progression.md §3). */
export function masteryState(m: TechniqueMastery): MasteryState {
  if (isTechniqueMastered(m)) return 'mastered';
  if (m.usedCount >= MASTERY.familiarUsed) return 'familiar';
  return 'learning';
}

/** Difficulties a player at this stage can play (progression.md §1). */
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
 *  kept structural so progression.ts has no dependency on profile.ts. */
export interface StageInput {
  stage: PlayerStage;
  techniques: Record<TechniqueName, TechniqueMastery>;
  tutorialsCompleted: number;
  hardSolveCount: number;
}

/**
 * The single stage the player has earned the right to advance INTO,
 * or null if they haven't met the next threshold. Stages advance by
 * one; recordSolve() loops this to handle a multi-stage jump.
 */
export function nextStageFor(input: StageInput): PlayerStage | null {
  const { stage, techniques, tutorialsCompleted, hardSolveCount } = input;
  switch (stage) {
    case 0:
      return tutorialsCompleted >= TUTORIALS_TO_BEGINNER ? 1 : null;
    case 1:
      return isTechniqueMastered(techniques['naked-single']) ? 2 : null;
    case 2:
      return isTechniqueMastered(techniques['hidden-single']) ? 3 : null;
    case 3:
      return isTechniqueMastered(techniques['forced-move']) &&
        hardSolveCount >= HARD_SOLVES_TO_MASTER
        ? 4
        : null;
    case 4:
      return null;
  }
}

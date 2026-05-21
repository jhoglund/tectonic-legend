import { describe, it, expect } from 'vitest';
import {
  emptyMastery,
  isTechniqueMastered,
  masteryState,
  masteryStateFromDepth,
  computeDepth,
  availableDifficulties,
  nextStageFor,
  TECHNIQUE_NAMES,
  MASTERY,
  DEPTH,
  SELF_TARGET,
  PUZZLES_TARGET,
  type TechniqueName,
  type TechniqueMastery,
  type DepthSolveRecord,
} from './progression';

function techMap(
  overrides: Partial<Record<TechniqueName, TechniqueMastery>> = {},
): Record<TechniqueName, TechniqueMastery> {
  const map = Object.fromEntries(
    TECHNIQUE_NAMES.map((t) => [t, emptyMastery(t)]),
  ) as Record<TechniqueName, TechniqueMastery>;
  return { ...map, ...overrides };
}

function masteredCounter(technique: TechniqueName): TechniqueMastery {
  return {
    technique,
    usedCount: 12,
    selfAppliedCount: MASTERY.selfApplied,
    puzzlesContaining: MASTERY.puzzles,
  };
}

describe('isTechniqueMastered', () => {
  it('is false for a fresh counter', () => {
    expect(isTechniqueMastered(emptyMastery('naked-single'))).toBe(false);
  });

  it('is true once both thresholds are cleared', () => {
    expect(isTechniqueMastered(masteredCounter('naked-single'))).toBe(true);
  });

  it('requires the puzzle-count threshold, not just self-applications', () => {
    expect(
      isTechniqueMastered({
        technique: 'naked-single',
        usedCount: 20,
        selfAppliedCount: MASTERY.selfApplied,
        puzzlesContaining: MASTERY.puzzles - 1,
      }),
    ).toBe(false);
  });
});

describe('masteryState', () => {
  it('is "learning" below the familiar threshold', () => {
    expect(masteryState(emptyMastery('naked-single'))).toBe('learning');
  });

  it('is "familiar" once used enough but not mastered', () => {
    expect(
      masteryState({
        technique: 'naked-single',
        usedCount: MASTERY.familiarUsed,
        selfAppliedCount: 2,
        puzzlesContaining: 1,
      }),
    ).toBe('familiar');
  });

  it('is "mastered" once the mastery thresholds are met', () => {
    expect(masteryState(masteredCounter('hidden-single'))).toBe('mastered');
  });
});

describe('availableDifficulties', () => {
  it('unlocks no difficulties for a Newcomer', () => {
    expect(availableDifficulties(0)).toEqual([]);
  });

  it('widens the set stage by stage', () => {
    expect(availableDifficulties(1)).toEqual(['easy']);
    expect(availableDifficulties(2)).toEqual(['easy', 'medium']);
    expect(availableDifficulties(3)).toEqual(['easy', 'medium', 'hard']);
    expect(availableDifficulties(4)).toEqual([
      'easy',
      'medium',
      'hard',
      'expert',
    ]);
  });
});

describe('nextStageFor', () => {
  it('advances Newcomer → Beginner after three tutorials', () => {
    const base = { techniques: techMap(), hardSolveCount: 0 };
    expect(nextStageFor({ ...base, stage: 0, tutorialsCompleted: 2 })).toBeNull();
    expect(nextStageFor({ ...base, stage: 0, tutorialsCompleted: 3 })).toBe(1);
  });

  it('advances Beginner → Confident on naked-single mastery', () => {
    expect(
      nextStageFor({
        stage: 1,
        techniques: techMap(),
        tutorialsCompleted: 3,
        hardSolveCount: 0,
      }),
    ).toBeNull();
    expect(
      nextStageFor({
        stage: 1,
        techniques: techMap({ 'naked-single': masteredCounter('naked-single') }),
        tutorialsCompleted: 3,
        hardSolveCount: 0,
      }),
    ).toBe(2);
  });

  it('advances Confident → Advanced on hidden-single mastery', () => {
    expect(
      nextStageFor({
        stage: 2,
        techniques: techMap({
          'hidden-single': masteredCounter('hidden-single'),
        }),
        tutorialsCompleted: 3,
        hardSolveCount: 0,
      }),
    ).toBe(3);
  });

  it('advances Advanced → Master only with forced-move mastery AND 5 Hard solves', () => {
    const techniques = techMap({ 'forced-move': masteredCounter('forced-move') });
    expect(
      nextStageFor({ stage: 3, techniques, tutorialsCompleted: 3, hardSolveCount: 4 }),
    ).toBeNull();
    expect(
      nextStageFor({ stage: 3, techniques, tutorialsCompleted: 3, hardSolveCount: 5 }),
    ).toBe(4);
    // Hard solves alone, without forced-move mastery, do not advance.
    expect(
      nextStageFor({
        stage: 3,
        techniques: techMap(),
        tutorialsCompleted: 3,
        hardSolveCount: 9,
      }),
    ).toBeNull();
  });

  it('does not advance Master → Legend without every technique at legend depth', () => {
    expect(
      nextStageFor({
        stage: 4,
        techniques: techMap(),
        tutorialsCompleted: 3,
        hardSolveCount: 99,
      }),
    ).toBeNull();
  });

  it('advances Master → Legend once every technique reaches legend depth', () => {
    // A counter that lands every term of computeDepth at the cap — well
    // past the legend threshold (depth >= 90, puzzles >= 8).
    const legendCounter = (t: TechniqueName): TechniqueMastery => ({
      technique: t,
      usedCount: 40,
      selfAppliedCount: SELF_TARGET + 5,
      puzzlesContaining: DEPTH.legend.puzzles + 2,
    });
    const techniques = Object.fromEntries(
      TECHNIQUE_NAMES.map((t) => [t, legendCounter(t)]),
    ) as Record<TechniqueName, TechniqueMastery>;
    // A flawless hard solve featuring every technique — pegs QUALITY
    // and DIFFICULTY at max. The depth term needs that for legend.
    const greatSolve = (t: TechniqueName): DepthSolveRecord => ({
      difficulty: 'hard',
      gridSize: '5x5',
      timeMs: 60_000, // well under any 5x5 par
      hintsUsed: [],
      techniqueTally: [{ technique: t, used: 6, selfApplied: 6 }],
      errorsValidated: 0,
    });
    const history: DepthSolveRecord[] = TECHNIQUE_NAMES.flatMap((t) =>
      Array.from({ length: 10 }, () => greatSolve(t)),
    );
    expect(
      nextStageFor({
        stage: 4,
        techniques,
        tutorialsCompleted: 3,
        hardSolveCount: 50,
        history,
      }),
    ).toBe(5);
  });

  it('returns null at Legend — the top stage', () => {
    expect(
      nextStageFor({
        stage: 5,
        techniques: techMap(),
        tutorialsCompleted: 3,
        hardSolveCount: 99,
      }),
    ).toBeNull();
  });
});

describe('computeDepth + masteryStateFromDepth', () => {
  it('returns 0 for a fresh counter with no history', () => {
    expect(
      computeDepth('naked-single', emptyMastery('naked-single'), []),
    ).toBe(0);
  });

  it('caps at 100 when every term is at the cap', () => {
    const mastery: TechniqueMastery = {
      technique: 'naked-single',
      usedCount: 100,
      selfAppliedCount: SELF_TARGET + 10,
      puzzlesContaining: PUZZLES_TARGET + 10,
    };
    const history: DepthSolveRecord[] = Array.from({ length: 10 }, () => ({
      difficulty: 'expert',
      gridSize: '5x5',
      timeMs: 1_000,
      hintsUsed: [],
      techniqueTally: [
        { technique: 'naked-single', used: 5, selfApplied: 5 },
      ],
      errorsValidated: 0,
    }));
    expect(computeDepth('naked-single', mastery, history)).toBe(100);
  });

  it('maps depth + puzzles to chip state at the right boundaries', () => {
    expect(masteryStateFromDepth(0, 0)).toBe('learning');
    expect(masteryStateFromDepth(DEPTH.familiar, 0)).toBe('familiar');
    expect(
      masteryStateFromDepth(DEPTH.mastered.depth, DEPTH.mastered.puzzles),
    ).toBe('mastered');
    // depth high but puzzles short → still familiar, not mastered.
    expect(
      masteryStateFromDepth(DEPTH.mastered.depth, DEPTH.mastered.puzzles - 1),
    ).toBe('familiar');
    expect(
      masteryStateFromDepth(DEPTH.legend.depth, DEPTH.legend.puzzles),
    ).toBe('legend');
    // depth high enough but puzzles below the legend gate.
    expect(
      masteryStateFromDepth(DEPTH.legend.depth, DEPTH.legend.puzzles - 1),
    ).toBe('mastered');
  });
});

import { describe, it, expect } from 'vitest';
import {
  emptyMastery,
  isTechniqueMastered,
  masteryState,
  availableDifficulties,
  nextStageFor,
  TECHNIQUE_NAMES,
  MASTERY,
  type TechniqueName,
  type TechniqueMastery,
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

  it('returns null at Master — the top stage', () => {
    expect(
      nextStageFor({
        stage: 4,
        techniques: techMap(),
        tutorialsCompleted: 3,
        hardSolveCount: 99,
      }),
    ).toBeNull();
  });
});

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  defaultProfile,
  recordSolve,
  recordTutorialCompletion,
  markStageCelebrated,
  skipTutorials,
  loadProfile,
  saveProfile,
  type PlayerProfile,
  type SolveOutcome,
} from './profile';
import { TECHNIQUE_NAMES } from './progression';

/** A solve outcome that self-applies naked-single `selfApplied` times. */
function nakedSingleSolve(
  selfApplied: number,
  extra: Partial<SolveOutcome> = {},
): SolveOutcome {
  return {
    difficulty: 'easy',
    gridSize: '5x5',
    timeMs: 120_000,
    isDailyPuzzle: false,
    techniques: [
      { technique: 'naked-single', used: selfApplied + 1, selfApplied },
    ],
    ...extra,
  };
}

describe('defaultProfile', () => {
  it('starts a player at Newcomer with everything zeroed', () => {
    const p = defaultProfile();
    expect(p.stage).toBe(0);
    expect(p.tutorialsCompleted).toBe(0);
    expect(p.solveHistory).toEqual([]);
    expect(p.streak).toEqual({ current: 0, longest: 0, lastSolveDate: '' });
    expect(p.tier).toBe('free');
    expect(p.schemaVersion).toBe(1);
    for (const t of TECHNIQUE_NAMES) {
      expect(p.techniques[t]).toEqual({
        technique: t,
        usedCount: 0,
        selfAppliedCount: 0,
        puzzlesContaining: 0,
      });
    }
  });
});

describe('recordSolve — technique counters', () => {
  it('accumulates used / self-applied counts and counts the puzzle', () => {
    const { profile } = recordSolve(defaultProfile(), nakedSingleSolve(2));
    const m = profile.techniques['naked-single'];
    expect(m.usedCount).toBe(3); // used = selfApplied + 1
    expect(m.selfAppliedCount).toBe(2);
    expect(m.puzzlesContaining).toBe(1);
  });

  it('does not count the puzzle when nothing was self-applied', () => {
    const outcome: SolveOutcome = {
      difficulty: 'easy',
      gridSize: '5x5',
      timeMs: 1000,
      isDailyPuzzle: false,
      techniques: [{ technique: 'naked-single', used: 4, selfApplied: 0 }],
    };
    const { profile } = recordSolve(defaultProfile(), outcome);
    expect(profile.techniques['naked-single'].puzzlesContaining).toBe(0);
    expect(profile.techniques['naked-single'].usedCount).toBe(4);
  });

  it('derives hintsUsed as the assisted (non-self-applied) moves', () => {
    const { profile } = recordSolve(defaultProfile(), nakedSingleSolve(2));
    expect(profile.solveHistory).toHaveLength(1);
    expect(profile.solveHistory[0].hintsUsed).toEqual([
      { technique: 'naked-single', count: 1 }, // used 3 − selfApplied 2
    ]);
  });

  it('does not mutate the input profile', () => {
    const original = defaultProfile();
    recordSolve(original, nakedSingleSolve(5));
    expect(original.techniques['naked-single'].selfAppliedCount).toBe(0);
    expect(original.solveHistory).toHaveLength(0);
  });
});

describe('recordSolve — streak', () => {
  it('starts at 1 on the first solve', () => {
    const { profile } = recordSolve(
      defaultProfile(),
      nakedSingleSolve(1, { date: '2026-05-15T10:00:00.000Z' }),
    );
    expect(profile.streak).toEqual({
      current: 1,
      longest: 1,
      lastSolveDate: '2026-05-15',
    });
  });

  it('increments on a consecutive day, holds on the same day, resets after a gap', () => {
    let p = defaultProfile();
    p = recordSolve(p, nakedSingleSolve(1, { date: '2026-05-15T10:00:00Z' })).profile;
    p = recordSolve(p, nakedSingleSolve(1, { date: '2026-05-16T09:00:00Z' })).profile;
    expect(p.streak.current).toBe(2);

    // A second solve the same day leaves the streak untouched.
    p = recordSolve(p, nakedSingleSolve(1, { date: '2026-05-16T20:00:00Z' })).profile;
    expect(p.streak.current).toBe(2);

    // A skipped day restarts the run but keeps the longest on record.
    p = recordSolve(p, nakedSingleSolve(1, { date: '2026-05-20T08:00:00Z' })).profile;
    expect(p.streak.current).toBe(1);
    expect(p.streak.longest).toBe(2);
  });
});

describe('recordSolve — stage advancement', () => {
  it('advances Beginner → Confident once naked-single is mastered', () => {
    let profile: PlayerProfile = { ...defaultProfile(), stage: 1 };

    // Three solves, each self-applying naked-single 3 times → 9 total
    // across 3 puzzles, clearing the 8 / 3 mastery thresholds.
    let stageUp = recordSolve(profile, nakedSingleSolve(3)).stageUp;
    profile = recordSolve(profile, nakedSingleSolve(3)).profile;
    expect(stageUp).toBeNull();

    stageUp = recordSolve(profile, nakedSingleSolve(3)).stageUp;
    profile = recordSolve(profile, nakedSingleSolve(3)).profile;
    expect(stageUp).toBeNull();

    const third = recordSolve(profile, nakedSingleSolve(3));
    expect(third.stageUp).toBe(2);
    expect(third.profile.stage).toBe(2);
  });
});

describe('recordTutorialCompletion', () => {
  it('advances Newcomer → Beginner on the third tutorial', () => {
    let profile = defaultProfile();
    let result = recordTutorialCompletion(profile);
    expect(result.stageUp).toBeNull();
    profile = result.profile;

    result = recordTutorialCompletion(profile);
    expect(result.stageUp).toBeNull();
    profile = result.profile;

    result = recordTutorialCompletion(profile);
    expect(result.stageUp).toBe(1);
    expect(result.profile.stage).toBe(1);
    expect(result.profile.tutorialsCompleted).toBe(3);
  });
});

describe('markStageCelebrated', () => {
  it('a fresh profile has no pending stage-up card', () => {
    const p = defaultProfile();
    expect(p.celebratedStage).toBe(p.stage);
  });

  it('a stage advance leaves the card pending until celebrated', () => {
    const advanced = recordTutorialCompletion(
      recordTutorialCompletion(
        recordTutorialCompletion(defaultProfile()).profile,
      ).profile,
    ).profile;
    expect(advanced.stage).toBe(1);
    // celebratedStage trails — the Beginner card is pending.
    expect(advanced.stage).toBeGreaterThan(advanced.celebratedStage);

    const celebrated = markStageCelebrated(advanced);
    expect(celebrated.celebratedStage).toBe(1);
    expect(celebrated.stage).toBe(celebrated.celebratedStage);
  });
});

describe('skipTutorials', () => {
  it('jumps a fresh Newcomer straight to Beginner', () => {
    const p = skipTutorials(defaultProfile());
    expect(p.stage).toBe(1);
    expect(p.tutorialsCompleted).toBe(3);
  });

  it('leaves no stage-up card pending — the skipper opted out', () => {
    const p = skipTutorials(defaultProfile());
    expect(p.celebratedStage).toBe(p.stage);
  });
});

describe('loadProfile / saveProfile', () => {
  beforeEach(() => {
    const store = new Map<string, string>();
    vi.stubGlobal('localStorage', {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => store.set(k, v),
      removeItem: (k: string) => store.delete(k),
      clear: () => store.clear(),
      key: (i: number) => [...store.keys()][i] ?? null,
      get length() {
        return store.size;
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('round-trips a profile through localStorage', () => {
    const { profile } = recordSolve(defaultProfile(), nakedSingleSolve(4));
    saveProfile(profile);
    expect(loadProfile()).toEqual(profile);
  });

  it('returns a default profile when storage is empty', () => {
    expect(loadProfile()).toEqual(defaultProfile());
  });

  it('returns a default profile on corrupt JSON', () => {
    localStorage.setItem('tectonic.profile', '{ not valid json');
    expect(loadProfile()).toEqual(defaultProfile());
  });

  it('returns a default profile on a schema-version mismatch', () => {
    localStorage.setItem(
      'tectonic.profile',
      JSON.stringify({ ...defaultProfile(), schemaVersion: 99 }),
    );
    expect(loadProfile()).toEqual(defaultProfile());
  });
});

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  defaultProfile,
  recordSolve,
  recordTutorialCompletion,
  markStageCelebrated,
  skipTutorials,
  redeemVoucher,
  isPremium,
  isDeveloper,
  isDeveloperEmail,
  withDeveloperRole,
  DEVELOPER_EMAILS,
  normalizeProfile,
  loadProfile,
  saveProfile,
  type PlayerProfile,
  type SolveOutcome,
} from './profile';
import { mintVoucher } from './vouchers';
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
    expect(p.schemaVersion).toBe(2);
    expect(p.legendRung).toBe(0);
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

describe('redeemVoucher / isPremium', () => {
  it('a fresh profile is not premium', () => {
    expect(isPremium(defaultProfile())).toBe(false);
  });

  it('a lifetime voucher grants premium with no expiry', () => {
    const result = redeemVoucher(defaultProfile(), mintVoucher(0));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.profile.tier).toBe('premium');
    expect(result.profile.premiumExpiresAt).toBeUndefined();
    expect(isPremium(result.profile)).toBe(true);
  });

  it('a timed voucher grants premium that lapses', () => {
    const result = redeemVoucher(defaultProfile(), mintVoucher(30));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(isPremium(result.profile)).toBe(true);
    // force the grant into the past
    const lapsed = {
      ...result.profile,
      premiumExpiresAt: new Date(Date.now() - 1000).toISOString(),
    };
    expect(isPremium(lapsed)).toBe(false);
  });

  it('rejects an invalid code, and a code already redeemed', () => {
    expect(redeemVoucher(defaultProfile(), 'NOPE').ok).toBe(false);
    const code = mintVoucher(7);
    const first = redeemVoucher(defaultProfile(), code);
    expect(first.ok).toBe(true);
    if (!first.ok) return;
    const second = redeemVoucher(first.profile, code);
    expect(second).toEqual({ ok: false, reason: 'already-redeemed' });
  });

  it('a timed voucher never downgrades a lifetime grant', () => {
    const lifetime = redeemVoucher(defaultProfile(), mintVoucher(0));
    expect(lifetime.ok).toBe(true);
    if (!lifetime.ok) return;
    const timed = redeemVoucher(lifetime.profile, mintVoucher(30));
    expect(timed.ok).toBe(true);
    if (!timed.ok) return;
    expect(timed.profile.premiumExpiresAt).toBeUndefined();
  });
});

describe('role / isDeveloper', () => {
  it('a fresh profile is a player', () => {
    expect(defaultProfile().role).toBe('player');
    expect(isDeveloper(defaultProfile())).toBe(false);
  });

  it('recognises the developer role', () => {
    expect(isDeveloper({ ...defaultProfile(), role: 'developer' })).toBe(true);
  });

  it('normalizeProfile defaults a missing or invalid role to player', () => {
    expect(normalizeProfile({}).role).toBe('player');
    expect(normalizeProfile({ role: 'developer' }).role).toBe('developer');
    expect(normalizeProfile({ role: 'hacker' }).role).toBe('player');
  });
});

describe('developer allowlist', () => {
  const devEmail = DEVELOPER_EMAILS[0];

  it('recognises an allowlisted email, case- and space-insensitively', () => {
    expect(isDeveloperEmail(devEmail)).toBe(true);
    expect(isDeveloperEmail(`  ${devEmail.toUpperCase()}  `)).toBe(true);
    expect(isDeveloperEmail('someone@example.com')).toBe(false);
    expect(isDeveloperEmail(null)).toBe(false);
    expect(isDeveloperEmail(undefined)).toBe(false);
  });

  it('elevates an allowlisted email to the developer role', () => {
    const before = defaultProfile();
    const elevated = withDeveloperRole(before, devEmail);
    expect(elevated.role).toBe('developer');
    expect(isDeveloper(elevated)).toBe(true);
    // updatedAt is bumped so the elevation wins last-write-wins sync.
    expect(elevated.updatedAt).not.toBe(before.updatedAt);
  });

  it('leaves a non-allowlisted email a player — same object back', () => {
    const p = defaultProfile();
    expect(withDeveloperRole(p, 'someone@example.com')).toBe(p);
    expect(withDeveloperRole(p, null)).toBe(p);
  });

  it('never downgrades — an existing developer is returned unchanged', () => {
    const dev: PlayerProfile = { ...defaultProfile(), role: 'developer' };
    expect(withDeveloperRole(dev, 'someone@example.com')).toBe(dev);
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

  it('migrates a v1 profile to v2, seeding the new fields', () => {
    // A v1 blob has no legendRung on the profile and no errorsValidated
    // on solve records. The migration must seed both.
    const v1 = {
      ...defaultProfile(),
      schemaVersion: 1,
      legendRung: undefined,
      solveHistory: [
        {
          date: '2026-05-15T12:00:00.000Z',
          difficulty: 'easy' as const,
          gridSize: '5x5' as const,
          timeMs: 60_000,
          hintsUsed: [],
          isDailyPuzzle: false,
        },
      ],
    };
    localStorage.setItem('tectonic.profile', JSON.stringify(v1));
    const loaded = loadProfile();
    expect(loaded.schemaVersion).toBe(2);
    expect(loaded.legendRung).toBe(0);
    expect(loaded.solveHistory[0].errorsValidated).toBe(0);
    expect(loaded.solveHistory[0].parTimeMs).toBeUndefined();
  });
});

import { useMemo, useState } from 'react';
import { MasteryChip } from '../components/MasteryChip';
import {
  CompactAppBar,
  IconButton,
  SectionLabel,
  TonalCard,
} from '../components/MaterialSurfaces';
import { useProfile } from '../lib/profileContext';
import { usePaywall } from '../lib/paywallContext';
import { isPremium } from '../lib/profile';
import { TECHNIQUE_NAMES, TECHNIQUE_LABELS } from '../lib/progression';
import type { Difficulty } from '../engine/types';

/** Solves required before the Stats surface unlocks (progression.md §6). */
const SOLVES_TO_UNLOCK = 5;

const DIFFICULTY_ORDER: Difficulty[] = ['easy', 'medium', 'hard', 'expert'];
const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
  expert: 'Expert',
};

function formatTime(ms: number): string {
  const s = Math.round(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

/**
 * The Stats surface — v1 Phase 2, backlog item 13. Three sections
 * (solve performance / technique mastery / streaks) from PRD §4,
 * hard-gated behind an empty state until SOLVES_TO_UNLOCK solves
 * exist. The percentile band and contradiction-chain record are
 * omitted — both need data this client does not yet keep. The premium
 * gate on technique mastery (progression.md §6 / ADR-0007) lands with
 * the Phase 4 paywall.
 */
export function StatsScreen() {
  const { profile } = useProfile();
  const { openPaywall } = usePaywall();
  const premium = isPremium(profile);
  const { solveHistory, streak, techniques } = profile;
  // Captured once at mount — the week/month windows stay stable across
  // re-renders (calling Date.now() in render is impure).
  const [now] = useState(() => Date.now());

  const bestTimes = useMemo(() => {
    const best = new Map<Difficulty, number>();
    for (const s of solveHistory) {
      const prev = best.get(s.difficulty);
      if (prev === undefined || s.timeMs < prev) best.set(s.difficulty, s.timeMs);
    }
    return best;
  }, [solveHistory]);

  const averageTimes = useMemo(() => {
    const totals = new Map<Difficulty, { total: number; count: number }>();
    for (const s of solveHistory) {
      const prev = totals.get(s.difficulty) ?? { total: 0, count: 0 };
      totals.set(s.difficulty, {
        total: prev.total + s.timeMs,
        count: prev.count + 1,
      });
    }
    return totals;
  }, [solveHistory]);

  const counts = useMemo(() => {
    const week = now - 7 * 86_400_000;
    const month = now - 30 * 86_400_000;
    let w = 0;
    let m = 0;
    for (const s of solveHistory) {
      const t = Date.parse(s.date);
      if (t >= week) w++;
      if (t >= month) m++;
    }
    return { week: w, month: m, all: solveHistory.length };
  }, [solveHistory, now]);

  const histogram = useMemo(() => {
    const recent = solveHistory.slice(-20);
    const tally = new Map<string, number>();
    for (const s of recent) {
      for (const h of s.hintsUsed) {
        tally.set(h.technique, (tally.get(h.technique) ?? 0) + h.count);
      }
    }
    const max = Math.max(1, ...tally.values());
    return { tally, max, hasAny: tally.size > 0 };
  }, [solveHistory]);

  const playedDays = useMemo(() => {
    const days = new Set(
      solveHistory.map((s) => new Date(s.date).toISOString().slice(0, 10)),
    );
    return Array.from({ length: 28 }, (_, offset) => {
      const d = new Date(now);
      d.setDate(d.getDate() - (27 - offset));
      return days.has(d.toISOString().slice(0, 10));
    });
  }, [solveHistory, now]);

  const daysPlayed = playedDays.filter(Boolean).length;

  if (solveHistory.length < SOLVES_TO_UNLOCK) {
    const left = SOLVES_TO_UNLOCK - solveHistory.length;
    return (
      <div>
        <CompactAppBar
          title="Stats"
          right={
            <IconButton label="Range">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M7 10h10M9 14h6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </IconButton>
          }
        />
        <div className="px-6 py-20 text-center">
          <p
            className="text-sm leading-relaxed"
            style={{ color: 'var(--text-secondary)' }}
          >
            Solve {left} more {left === 1 ? 'puzzle' : 'puzzles'} and your stats
            open up here — solve times, technique mastery, and streaks.
          </p>
          <p
            className="mt-3 text-xs font-medium"
            style={{ color: 'var(--text-tertiary)' }}
          >
            {solveHistory.length} of {SOLVES_TO_UNLOCK} solves
          </p>
        </div>
      </div>
    );
  }

  const streakResetLine =
    streak.current === 0 && streak.lastSolveDate
      ? `Resume from ${streak.lastSolveDate}`
      : null;

  return (
    <div>
      <CompactAppBar
        title="Stats"
        right={
          <IconButton label="Range">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M7 10h10M9 14h6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </IconButton>
        }
      />
      <div className="flex flex-col gap-4 px-4 pb-8">
        {/* Solve performance */}
        <TonalCard tonal>
          <p
            className="text-xs font-medium uppercase"
            style={{ color: 'var(--text-secondary)', letterSpacing: '0.06em' }}
          >
            Solve performance
          </p>
          <p
            className="mt-2 text-2xl font-semibold"
            style={{ color: 'var(--text-primary)' }}
          >
            {bestTimes.size} of 4 difficulties active
          </p>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
            {counts.month} solved this month · {counts.all} all-time
          </p>
          <div className="mt-3 flex flex-col">
            {DIFFICULTY_ORDER.map((d) => {
              const best = bestTimes.get(d);
              const avg = averageTimes.get(d);
              const solved = solveHistory.filter((s) => s.difficulty === d).length;
              return (
                <div
                  key={d}
                  className="grid items-center gap-2 py-3"
                  style={{
                    gridTemplateColumns: '1fr 64px 76px',
                    borderTop: '1px solid var(--border)',
                  }}
                >
                  <div
                    className="text-sm"
                    style={{ color: best == null ? 'var(--text-tertiary)' : 'var(--text-primary)' }}
                  >
                    {DIFFICULTY_LABEL[d]}
                    <small className="block text-xs" style={{ color: 'var(--text-tertiary)' }}>
                      {solved > 0 ? `${solved} solved` : 'locked or unplayed'}
                    </small>
                  </div>
                  <div
                    className="text-right text-sm font-medium"
                    style={{
                      color: best == null ? 'var(--text-tertiary)' : 'var(--brand-600)',
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    {best == null ? '-' : formatTime(best)}
                  </div>
                  <div
                    className="text-right text-xs font-medium"
                    style={{
                      color: 'var(--text-secondary)',
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    {avg == null ? '-' : `avg ${formatTime(avg.total / avg.count)}`}
                  </div>
                </div>
              );
            })}
          </div>
        </TonalCard>

        {/* Technique mastery */}
        <SectionLabel>Technique mastery</SectionLabel>
        <TonalCard>
          <div className="flex flex-col gap-3">
            {TECHNIQUE_NAMES.map((t) => (
              <MasteryChip
                key={t}
                mastery={techniques[t]}
                solveHistory={solveHistory}
              />
            ))}
          </div>

          {!premium ? (
            // The chips above are free for everyone; the deep dashboard
            // (the last-20-solves histogram) is premium — soft-launch
            // plan §3. A tap here is the mastery-stats paywall trigger.
            <button
              type="button"
              onClick={() => openPaywall('mastery_stats')}
              className="mt-4 w-full cursor-pointer px-3 py-3 text-left text-sm"
              style={{
                border: '1px dashed var(--border)',
                borderRadius: 'var(--radius-card)',
                color: 'var(--text-secondary)',
                lineHeight: 1.5,
              }}
            >
              <span
                className="font-semibold"
                style={{ color: 'var(--brand-600)' }}
              >
                Unlock the mastery dashboard
              </span>
              <br />
              See which techniques you lean on across your recent solves.
            </button>
          ) : (
            <>
              <p
                className="mt-4 mb-2 text-xs font-medium"
                style={{ color: 'var(--text-tertiary)' }}
              >
                Techniques in your last 20 solves
              </p>
              {histogram.hasAny ? (
                <div className="flex flex-col gap-2">
                  {TECHNIQUE_NAMES.filter((t) => histogram.tally.has(t)).map((t) => {
                const n = histogram.tally.get(t)!;
                return (
                  <div key={t} className="flex items-center gap-2">
                    <span
                      className="text-xs"
                      style={{ color: 'var(--text-secondary)', width: 120 }}
                    >
                      {TECHNIQUE_LABELS[t]}
                    </span>
                    <span
                      className="h-2 flex-1"
                      style={{
                        background: 'var(--surface)',
                        borderRadius: 999,
                        overflow: 'hidden',
                      }}
                    >
                      <span
                        className="block h-full"
                        style={{
                          width: `${(n / histogram.max) * 100}%`,
                          background: 'var(--brand-600)',
                        }}
                      />
                    </span>
                    <span
                      className="text-xs font-medium"
                      style={{
                        color: 'var(--text-tertiary)',
                        fontVariantNumeric: 'tabular-nums',
                        width: 20,
                        textAlign: 'right',
                      }}
                    >
                      {n}
                    </span>
                  </div>
                );
              })}
            </div>
              ) : (
                <p
                  className="text-sm"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  No hints used recently — you have been solving these
                  yourself.
                </p>
              )}
            </>
          )}
        </TonalCard>

        {/* Streaks */}
        <SectionLabel>Solve cadence</SectionLabel>
        <TonalCard>
          <div className="flex items-center gap-4">
            <div className="grid flex-1 gap-1" style={{ gridTemplateColumns: 'repeat(14, 1fr)' }}>
              {playedDays.map((played, i) => (
                <span
                  key={i}
                  style={{
                    aspectRatio: '1',
                    borderRadius: 'var(--space-1)',
                    background: played ? 'var(--brand-600)' : 'var(--border)',
                  }}
                />
              ))}
            </div>
            <div className="text-right">
              <p
                className="text-2xl font-medium"
                style={{
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-mono)',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {daysPlayed}
              </p>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                days played
                <br />
                of last 28
              </p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                Current streak
              </p>
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                {streak.current} {streak.current === 1 ? 'day' : 'days'}
              </p>
            </div>
            <div>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                Longest streak
              </p>
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                {streak.longest} {streak.longest === 1 ? 'day' : 'days'}
              </p>
            </div>
          </div>
          {streakResetLine && (
            <p
              className="mt-3 text-xs"
              style={{ color: 'var(--text-tertiary)' }}
            >
              {streakResetLine}
            </p>
          )}
          <p className="mt-3 text-center text-xs" style={{ color: 'var(--text-tertiary)' }}>
            Cadence is for your reference. Tectonic does not punish gaps.
          </p>
        </TonalCard>
      </div>
    </div>
  );
}

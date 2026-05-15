import { useMemo, useState } from 'react';
import { ScreenHeader } from '../components/ScreenHeader';
import { MasteryChip } from '../components/MasteryChip';
import { useProfile } from '../lib/profileContext';
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

const cardStyle: React.CSSProperties = {
  background: 'var(--surface-elevated)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-card)',
  padding: 'var(--space-4)',
};

function SectionTitle({ children }: { children: string }) {
  return (
    <p
      className="mb-3 text-xs font-semibold"
      style={{ color: 'var(--text-tertiary)', letterSpacing: '0.06em' }}
    >
      {children}
    </p>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
        {label}
      </span>
      <span
        className="text-sm font-medium"
        style={{
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-mono)',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value}
      </span>
    </div>
  );
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

  if (solveHistory.length < SOLVES_TO_UNLOCK) {
    const left = SOLVES_TO_UNLOCK - solveHistory.length;
    return (
      <div>
        <ScreenHeader title="Stats" />
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
      <ScreenHeader title="Stats" />
      <div className="flex flex-col gap-4 px-4 pb-8">
        {/* Solve performance */}
        <div style={cardStyle}>
          <SectionTitle>SOLVE PERFORMANCE</SectionTitle>
          {DIFFICULTY_ORDER.filter((d) => bestTimes.has(d)).map((d) => (
            <StatRow
              key={d}
              label={`Best — ${DIFFICULTY_LABEL[d]}`}
              value={formatTime(bestTimes.get(d)!)}
            />
          ))}
          <div
            className="my-2"
            style={{ borderTop: '1px solid var(--border)' }}
          />
          <StatRow label="Solved this week" value={String(counts.week)} />
          <StatRow label="Solved this month" value={String(counts.month)} />
          <StatRow label="Solved all-time" value={String(counts.all)} />
        </div>

        {/* Technique mastery */}
        <div style={cardStyle}>
          <SectionTitle>TECHNIQUE MASTERY</SectionTitle>
          <div className="flex flex-wrap gap-2">
            {TECHNIQUE_NAMES.map((t) => (
              <MasteryChip key={t} mastery={techniques[t]} />
            ))}
          </div>

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
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              No hints used recently — you have been solving these yourself.
            </p>
          )}
        </div>

        {/* Streaks */}
        <div style={cardStyle}>
          <SectionTitle>STREAKS</SectionTitle>
          <StatRow
            label="Current streak"
            value={`${streak.current} ${streak.current === 1 ? 'day' : 'days'}`}
          />
          <StatRow
            label="Longest streak"
            value={`${streak.longest} ${streak.longest === 1 ? 'day' : 'days'}`}
          />
          {streakResetLine && (
            <p
              className="mt-2 text-xs"
              style={{ color: 'var(--text-tertiary)' }}
            >
              {streakResetLine}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

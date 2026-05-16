import { ScreenHeader } from '../components/ScreenHeader';
import { useProfile } from '../lib/profileContext';
import { STAGE_NAMES } from '../lib/progression';
import { dailyPuzzleSpec } from '../lib/daily';
import type { Difficulty } from '../engine/types';

const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
  expert: 'Expert',
};

interface HomeLandingProps {
  onNewPuzzle: () => void;
  onStartDaily: () => void;
}

const card: React.CSSProperties = {
  background: 'var(--surface-elevated)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-card)',
  padding: 'var(--space-4)',
};

const label: React.CSSProperties = {
  color: 'var(--text-tertiary)',
  letterSpacing: '0.06em',
};

/**
 * Home landing — the stage indicator, the daily puzzle (the retention
 * anchor, ADR-0010), and a New puzzle entry point. A 7-day-plus gap
 * since the last visit surfaces a quiet "welcome back" line.
 */
export function HomeLanding({ onNewPuzzle, onStartDaily }: HomeLandingProps) {
  const { profile } = useProfile();
  const daily = dailyPuzzleSpec();
  const dailyDone = profile.solveHistory.some(
    (s) => s.isDailyPuzzle && s.date.slice(0, 10) === daily.dateKey,
  );
  const streak = profile.streak.current;

  return (
    <div>
      <ScreenHeader title="Tectonic" />
      <div className="flex flex-col gap-4 px-4 pt-2 pb-8">
        {/* stage */}
        <div style={card}>
          <p className="mb-1 text-xs font-semibold" style={label}>
            YOUR STAGE
          </p>
          <p
            className="text-2xl font-semibold"
            style={{ color: 'var(--text-primary)' }}
          >
            {STAGE_NAMES[profile.stage]}
          </p>
        </div>

        {/* daily puzzle — the retention anchor */}
        <div style={card}>
          <div className="flex items-start justify-between">
            <div>
              <p className="mb-1 text-xs font-semibold" style={label}>
                DAILY PUZZLE
              </p>
              <p
                className="text-xl font-semibold"
                style={{ color: 'var(--text-primary)' }}
              >
                {DIFFICULTY_LABEL[daily.difficulty]}
              </p>
            </div>
            {dailyDone && (
              <span
                className="inline-flex items-center gap-1 text-xs font-semibold"
                style={{ color: 'var(--success)' }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                Solved
              </span>
            )}
          </div>

          {streak > 0 && (
            <p
              className="mt-1 text-sm"
              style={{ color: 'var(--text-secondary)' }}
            >
              {streak}-day streak — keep it going.
            </p>
          )}

          <button
            type="button"
            onClick={onStartDaily}
            className="mt-4 w-full cursor-pointer py-3 text-base font-semibold"
            style={{
              background: dailyDone
                ? 'var(--surface)'
                : 'var(--brand-600)',
              color: dailyDone ? 'var(--brand-600)' : 'var(--text-on-brand)',
              border: dailyDone ? '1px solid var(--border)' : 'none',
              borderRadius: 'var(--radius-button)',
            }}
          >
            {dailyDone ? 'Play again' : 'Play today’s puzzle'}
          </button>
        </div>

        {/* free play */}
        <button
          type="button"
          onClick={onNewPuzzle}
          className="cursor-pointer py-3.5 text-base font-medium"
          style={{
            color: 'var(--brand-600)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-button)',
          }}
        >
          New puzzle
        </button>
      </div>
    </div>
  );
}

import { useMemo } from 'react';
import { Board } from '../components/Board';
import { useProfile } from '../lib/profileContext';
import {
  DEPTH,
  HARD_SOLVES_TO_MASTER,
  STAGE_NAMES,
  TECHNIQUE_NAMES,
  computeDepth,
  masteryState,
} from '../lib/progression';
import { dailyPuzzleSpec } from '../lib/daily';
import { REENTRY_THRESHOLD_DAYS } from '../lib/lastSeen';
import {
  type UnresolvedPuzzle,
  unresolvedCellsLeft,
  unresolvedPuzzleToGameState,
} from '../lib/unresolvedPuzzles';
import { createGameState, gridSizeDimensions } from '../lib/gameState';
import { generatePuzzle } from '../engine/generator';
import type { Difficulty, GameState } from '../engine/types';
import type { PlayerProfile } from '../lib/profile';
import type { TechniqueName } from '../lib/progression';

const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
  expert: 'Expert',
};

interface HomeLandingProps {
  /** Days since the last visit, or null if recent / first open. */
  reentryDays: number | null;
  unresolvedPuzzles: UnresolvedPuzzle[];
  onOpenSettings: () => void;
  onStartDaily: () => void;
  onResumePuzzle: (puzzle: UnresolvedPuzzle) => void;
  onShowAllUnresolved: () => void;
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

const stageProgressTrack: React.CSSProperties = {
  width: 'var(--space-16)',
  height: 'var(--space-1)',
  borderRadius: 'var(--radius-chip)',
  background: 'var(--border)',
  overflow: 'hidden',
};

const stageProgressFill: React.CSSProperties = {
  display: 'block',
  height: '100%',
  borderRadius: 'var(--radius-chip)',
  background: 'var(--brand-600)',
};

function puzzleTitle(puzzle: UnresolvedPuzzle): string {
  return `${DIFFICULTY_LABEL[puzzle.difficulty]} · ${puzzle.gridSize.replace('x', '×')}`;
}

function formatDailyDate(dateKey: string): string {
  const date = new Date(`${dateKey}T12:00:00Z`);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString([], {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

function stageTechnique(profile: PlayerProfile): TechniqueName | null {
  switch (profile.stage) {
    case 1:
      return 'naked-single';
    case 2:
      return 'hidden-single';
    case 3:
      return 'forced-move';
    default:
      return null;
  }
}

function techniqueActionLabel(technique: TechniqueName): string {
  switch (technique) {
    case 'naked-single':
      return 'naked singles';
    case 'hidden-single':
      return 'hidden singles';
    case 'forced-move':
      return 'forced moves';
    case 'pair-elimination':
      return 'pair eliminations';
    case 'contradiction-chain':
      return 'contradiction chains';
  }
}

function techniqueMasteryProgress(
  profile: PlayerProfile,
  technique: TechniqueName,
): number {
  const mastery = profile.techniques[technique];
  const depthProgress =
    computeDepth(technique, mastery, profile.solveHistory) / DEPTH.mastered.depth;
  const puzzleProgress =
    mastery.puzzlesContaining / DEPTH.mastered.puzzles;
  return Math.min(1, depthProgress, puzzleProgress);
}

function homeStageProgress(profile: PlayerProfile): {
  nextLabel: string;
  detail: React.ReactNode;
  progress: number;
} {
  if (profile.stage === 5) {
    return {
      nextLabel: 'Legend path',
      detail: 'Keep your daily streak and technique depth alive',
      progress: 1,
    };
  }

  if (profile.stage === 4) {
    const legendCount = TECHNIQUE_NAMES.filter(
      (technique) =>
        masteryState(profile.techniques[technique], profile.solveHistory) ===
        'legend',
    ).length;
    const remaining = TECHNIQUE_NAMES.length - legendCount;
    return {
      nextLabel: `${legendCount} of ${TECHNIQUE_NAMES.length} toward Legend`,
      detail:
        remaining === 0
          ? (
              <>
                Finish one more strong puzzle to claim{' '}
                <strong>Legend</strong> status
              </>
            )
          : `Raise ${remaining} more technique${remaining === 1 ? '' : 's'} to Legend depth`,
      progress: legendCount / TECHNIQUE_NAMES.length,
    };
  }

  const technique = stageTechnique(profile);
  if (!technique) {
    return {
      nextLabel: 'Building your base',
      detail: 'Starter lessons',
      progress: 0,
    };
  }

  const nextStage = (profile.stage + 1) as keyof typeof STAGE_NAMES;
  const nextStageName = STAGE_NAMES[nextStage];
  const techniqueProgress = techniqueMasteryProgress(profile, technique);
  const mastery = profile.techniques[technique];
  const techniquePuzzlesDone = Math.min(
    mastery.puzzlesContaining,
    DEPTH.mastered.puzzles,
  );
  const techniquePuzzlesLeft = Math.max(
    0,
    DEPTH.mastered.puzzles - mastery.puzzlesContaining,
  );
  const actionLabel = techniqueActionLabel(technique);

  if (profile.stage === 3) {
    const hardDone = profile.solveHistory.filter(
      (solve) => solve.difficulty === 'hard',
    ).length;
    const hardLeft = Math.max(0, HARD_SOLVES_TO_MASTER - hardDone);
    const progress = Math.min(
      techniqueProgress,
      hardDone / HARD_SOLVES_TO_MASTER,
    );

    return {
      nextLabel: `${Math.min(hardDone, HARD_SOLVES_TO_MASTER)} of ${HARD_SOLVES_TO_MASTER} toward ${nextStageName}`,
      detail:
        hardLeft > 0
          ? `${hardLeft} more Hard puzzle${hardLeft === 1 ? '' : 's'} plus self-solved ${actionLabel}`
          : (
              <>
                Self-solve {actionLabel} to reach{' '}
                <strong>{nextStageName}</strong> status
              </>
            ),
      progress,
    };
  }

  const progress =
    techniquePuzzlesDone / DEPTH.mastered.puzzles;

  return {
    nextLabel: `${techniquePuzzlesDone} of ${DEPTH.mastered.puzzles} toward ${nextStageName}`,
    detail:
      techniquePuzzlesLeft > 0
        ? (
            <>
              Self-solve {actionLabel} in {techniquePuzzlesLeft} more{' '}
              puzzle{techniquePuzzlesLeft === 1 ? '' : 's'} for{' '}
              <strong>{nextStageName}</strong> status
            </>
          )
        : (
            <>
              Keep solving {actionLabel} before hints to reach{' '}
              <strong>{nextStageName}</strong> status
            </>
          ),
    progress,
  };
}

function formatUpdatedAt(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return 'In progress';
  return `Updated ${date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })}`;
}

function ResumeThumbnail({ gameState }: { gameState: GameState }) {
  return (
    <div
      className="pointer-events-none shrink-0"
      aria-hidden="true"
      style={{ width: 64 }}
    >
      <Board
        gameState={gameState}
        selectedCell={null}
        hint={null}
        cellOverlays={null}
        onCellClick={() => {}}
        compact
      />
    </div>
  );
}

/**
 * Home landing — the stage indicator, the daily puzzle (the retention
 * anchor, ADR-0010), and a New puzzle entry point. A 7-day-plus gap
 * since the last visit surfaces a quiet "welcome back" line.
 */
export function HomeLanding({
  reentryDays,
  unresolvedPuzzles,
  onOpenSettings,
  onStartDaily,
  onResumePuzzle,
  onShowAllUnresolved,
}: HomeLandingProps) {
  const { profile } = useProfile();
  const daily = dailyPuzzleSpec();
  const previewState = useMemo(() => {
    const [rows, cols] = gridSizeDimensions(daily.gridSize);
    return createGameState(generatePuzzle(rows, cols, daily.difficulty, daily.seed));
  }, [daily.difficulty, daily.gridSize, daily.seed]);
  const dailyDone = profile.solveHistory.some(
    (s) => s.isDailyPuzzle && s.date.slice(0, 10) === daily.dateKey,
  );
  const stageProgress = homeStageProgress(profile);
  const stageProgressPct = Math.max(0, Math.min(1, stageProgress.progress));
  const showReentry =
    reentryDays !== null && reentryDays >= REENTRY_THRESHOLD_DAYS;

  return (
    <div>
      <header className="flex items-end justify-between gap-4 px-4 pt-4 pb-2">
        <div>
          <p className="mb-0.5 text-xs font-semibold uppercase" style={label}>
            {formatDailyDate(daily.dateKey)}
          </p>
          <h1
            className="text-3xl font-semibold"
            style={{ color: 'var(--text-primary)' }}
          >
            Today
          </h1>
        </div>
        <button
          type="button"
          onClick={onOpenSettings}
          aria-label="Settings"
          className="grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-full"
          style={{
            background: 'var(--surface-elevated)',
            border: '1px solid var(--border)',
            color: 'var(--text-secondary)',
          }}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" />
          </svg>
        </button>
      </header>
      <div className="flex flex-col gap-4 px-4 pt-2 pb-8">
        {/* a warm line after a long gap (backlog item 16) */}
        {showReentry && (
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Welcome back — it’s been {reentryDays} days. Today’s puzzle is
            ready when you are.
          </p>
        )}

        {/* stage */}
        <div className="flex items-center gap-3" style={card}>
          <span
            className="shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold uppercase"
            style={{
              background: 'var(--brand-50)',
              color: 'var(--brand-600)',
              letterSpacing: '0.06em',
            }}
          >
            {STAGE_NAMES[profile.stage]}
            {profile.stage === 5 && (
              <span
                aria-hidden="true"
                style={{
                  marginLeft: '0.25em',
                  color: 'var(--warning)',
                  textShadow:
                    '0 0 6px color-mix(in oklch, var(--warning) 60%, transparent)',
                }}
              >
                ✦
              </span>
            )}
          </span>
          <div className="min-w-0 flex-1">
            <p
              className="text-sm font-medium"
              style={{ color: 'var(--text-primary)' }}
            >
              {stageProgress.nextLabel}
            </p>
            <p
              className="mt-0.5 text-xs"
              style={{ color: 'var(--text-secondary)' }}
            >
              {stageProgress.detail}
            </p>
          </div>
          <div
            style={stageProgressTrack}
            aria-label={`${stageProgress.nextLabel} progress`}
          >
            <span
              style={{
                ...stageProgressFill,
                width: `${Math.round(stageProgressPct * 100)}%`,
              }}
            />
          </div>
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
                A {daily.gridSize.replace('x', '×')},{' '}
                {DIFFICULTY_LABEL[daily.difficulty].toLowerCase()}
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

          <div className="mt-4 flex justify-center">
            <div
              className="pointer-events-none"
              aria-hidden="true"
              style={{ width: '70%' }}
            >
              <Board
                gameState={previewState}
                selectedCell={null}
                hint={null}
                cellOverlays={null}
                onCellClick={() => {}}
              />
            </div>
          </div>

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

        {unresolvedPuzzles.length > 0 && (
          <div style={card}>
            <div className="mb-3 flex items-baseline justify-between">
              <p className="text-xs font-semibold" style={label}>
                RESUME
              </p>
              <span
                className="text-xs"
                style={{ color: 'var(--text-tertiary)' }}
              >
                {unresolvedPuzzles.length} unfinished
              </span>
            </div>

            <div className="flex flex-col">
              {unresolvedPuzzles.slice(0, 3).map((puzzle, index) => {
                const cellsLeft = unresolvedCellsLeft(puzzle);
                const preview = unresolvedPuzzleToGameState(puzzle);
                return (
                  <button
                    key={puzzle.id}
                    type="button"
                    onClick={() => onResumePuzzle(puzzle)}
                    className={`flex w-full cursor-pointer items-center gap-3 py-3 text-left ${
                      index > 0 ? 'border-t' : ''
                    }`}
                    style={{
                      borderColor: 'var(--border)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    {preview && <ResumeThumbnail gameState={preview} />}
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold">
                        {puzzleTitle(puzzle)}
                      </div>
                      <div
                        className="mt-0.5 text-xs"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        {formatUpdatedAt(puzzle.updatedAt)} · {cellsLeft}{' '}
                        {cellsLeft === 1 ? 'cell' : 'cells'} left
                      </div>
                    </div>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                      style={{ color: 'var(--text-tertiary)' }}
                    >
                      <polyline points="6 4 10 8 6 12" />
                    </svg>
                  </button>
                );
              })}
            </div>

            {unresolvedPuzzles.length > 3 && (
              <button
                type="button"
                onClick={onShowAllUnresolved}
                className="mt-2 cursor-pointer text-sm font-semibold"
                style={{ color: 'var(--brand-600)' }}
              >
                View all unfinished puzzles
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

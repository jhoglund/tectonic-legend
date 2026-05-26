import { Board } from '../components/Board';
import { ScreenHeader } from '../components/ScreenHeader';
import {
  type UnresolvedPuzzle,
  unresolvedCellsLeft,
  unresolvedPuzzleToGameState,
} from '../lib/unresolvedPuzzles';

const DIFFICULTY_LABEL = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
  expert: 'Expert',
} as const;

interface UnresolvedPuzzlesScreenProps {
  puzzles: UnresolvedPuzzle[];
  onBack: () => void;
  onResume: (puzzle: UnresolvedPuzzle) => void;
}

function formatUpdatedAt(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return 'In progress';
  return date.toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function titleFor(puzzle: UnresolvedPuzzle): string {
  return `${DIFFICULTY_LABEL[puzzle.difficulty]} · ${puzzle.gridSize.replace('x', '×')}`;
}

export function UnresolvedPuzzlesScreen({
  puzzles,
  onBack,
  onResume,
}: UnresolvedPuzzlesScreenProps) {
  return (
    <div>
      <div className="flex items-center gap-2 px-3 pt-3">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to Home"
          className="grid h-10 w-10 cursor-pointer place-items-center"
          style={{ color: 'var(--brand-600)' }}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
      </div>
      <ScreenHeader title="Unfinished" />
      <div className="flex flex-col gap-3 px-4 pt-2 pb-8">
        {puzzles.map((puzzle) => {
          const gameState = unresolvedPuzzleToGameState(puzzle);
          const cellsLeft = unresolvedCellsLeft(puzzle);
          return (
            <button
              key={puzzle.id}
              type="button"
              onClick={() => onResume(puzzle)}
              className="flex cursor-pointer items-center gap-3 rounded-[var(--radius-card)] border p-4 text-left"
              style={{
                background: 'var(--surface-elevated)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)',
              }}
            >
              {gameState && (
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
              )}
              <div className="min-w-0 flex-1">
                <div className="text-base font-semibold">{titleFor(puzzle)}</div>
                <div
                  className="mt-1 text-sm"
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
    </div>
  );
}

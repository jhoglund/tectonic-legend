import { useMemo, useState } from 'react';
import { Board } from '../components/Board';
import type { GameState } from '../engine/types';
import type { Hint } from '../engine/hints';
import type { Tutorial } from '../data/tutorials';

interface TutorialScreenProps {
  tutorial: Tutorial;
  /** 1-based position in the Newcomer sequence, for the progress line. */
  index: number;
  total: number;
  /** Called once the player has placed every guided value. */
  onComplete: () => void;
}

/**
 * A guided tutorial puzzle (specs/progression.md §4). Three phases:
 * an intro card, the step-by-step solve, and a completion card. Every
 * move is forced and scripted — the player taps the one highlighted
 * cell's value; wrong taps are nudged, never recorded.
 */
export function TutorialScreen({
  tutorial,
  index,
  total,
  onComplete,
}: TutorialScreenProps) {
  const { puzzle, steps, title, intro } = tutorial;
  const { layout, clues } = puzzle;

  const [phase, setPhase] = useState<'intro' | 'playing' | 'done'>('intro');
  const [stepIndex, setStepIndex] = useState(0);
  const [wrongValue, setWrongValue] = useState<number | null>(null);

  // The live grid: clues, plus every guided value placed so far.
  const [grid, setGrid] = useState<number[][]>(() =>
    clues.map((row) => [...row]),
  );

  const isClue = useMemo(
    () => clues.map((row) => row.map((v) => v !== 0)),
    [clues],
  );
  const emptyNotes = useMemo(
    () =>
      clues.map((row) => row.map(() => new Set<number>())),
    [clues],
  );
  const noErrors = useMemo(
    () => clues.map((row) => row.map(() => false)),
    [clues],
  );

  const maxNumber = useMemo(
    () => Math.max(...layout.groups.map((g) => g.cells.length)),
    [layout],
  );

  // Non-null only while a step is being played — so the completion
  // card shows a clean board, no lingering highlight.
  const step = phase === 'playing' ? steps[stepIndex] : null;

  const gameState: GameState = useMemo(
    () => ({
      puzzle,
      grid,
      isClue,
      notes: emptyNotes,
      errors: noErrors,
      isSolved: phase === 'done',
    }),
    [puzzle, grid, isClue, emptyNotes, noErrors, phase],
  );

  // Highlight the active step's cell via the Board's hint channel.
  const hint: Hint | null = step
    ? { row: step.row, col: step.col, value: 0, reason: '', type: 'reveal' }
    : null;

  function handleNumber(n: number) {
    if (!step) return;
    if (n !== step.value) {
      setWrongValue(n);
      return;
    }
    setWrongValue(null);
    const next = grid.map((row) => [...row]);
    next[step.row][step.col] = n;
    setGrid(next);
    if (stepIndex + 1 >= steps.length) {
      setPhase('done');
    } else {
      setStepIndex(stepIndex + 1);
    }
  }

  const panel: React.CSSProperties = {
    background: 'var(--surface-elevated)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-card)',
    padding: 'var(--space-4)',
  };

  return (
    <div className="flex flex-col">
      {/* nav bar */}
      <div
        className="flex items-center justify-center px-4"
        style={{ paddingTop: 'calc(env(safe-area-inset-top) + 6px)', height: 52 }}
      >
        <span
          className="text-base font-semibold"
          style={{ color: 'var(--text-primary)' }}
        >
          {title}
        </span>
      </div>

      {phase === 'intro' ? (
        <div className="flex flex-col gap-6 px-4 pt-8">
          <p
            className="text-xs font-semibold"
            style={{ color: 'var(--text-tertiary)', letterSpacing: '0.06em' }}
          >
            TUTORIAL {index} OF {total}
          </p>
          <p
            className="text-base"
            style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}
          >
            {intro}
          </p>
          <button
            type="button"
            onClick={() => setPhase('playing')}
            className="cursor-pointer py-4 text-base font-semibold"
            style={{
              background: 'var(--brand-600)',
              color: 'var(--text-on-brand)',
              borderRadius: 'var(--radius-button)',
            }}
          >
            Begin
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 px-4 pt-2 pb-8">
          <div
            className="text-sm"
            style={{
              color: 'var(--text-tertiary)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            {phase === 'done'
              ? 'Complete'
              : `Step ${stepIndex + 1} of ${steps.length}`}
          </div>

          <Board
            gameState={gameState}
            selectedCell={step ? [step.row, step.col] : null}
            hint={hint}
            cellOverlays={null}
            onCellClick={() => {}}
          />

          {phase === 'done' ? (
            <div className="flex w-full flex-col gap-4" style={panel}>
              <p
                className="text-lg font-semibold"
                style={{ color: 'var(--text-primary)' }}
              >
                Nicely done.
              </p>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {index < total
                  ? 'That technique is yours. One more on the next screen.'
                  : 'You have the basics. Easy puzzles are now open.'}
              </p>
              <button
                type="button"
                onClick={onComplete}
                className="cursor-pointer py-3 text-base font-semibold"
                style={{
                  background: 'var(--brand-600)',
                  color: 'var(--text-on-brand)',
                  borderRadius: 'var(--radius-button)',
                }}
              >
                Continue
              </button>
            </div>
          ) : (
            <>
              <div className="w-full" style={panel}>
                <p
                  className="text-sm"
                  style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}
                >
                  {step?.explanation}
                </p>
                {wrongValue !== null && (
                  <p
                    className="mt-2 text-sm font-medium"
                    style={{ color: 'var(--danger)' }}
                  >
                    Not quite — that value breaks a rule here. Try again.
                  </p>
                )}
              </div>

              {/* number row */}
              <div className="flex flex-wrap justify-center gap-2">
                {Array.from({ length: maxNumber }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => handleNumber(n)}
                    className="cursor-pointer"
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 'var(--radius-button)',
                      background: 'var(--surface-elevated)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-primary)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '1.15rem',
                      fontWeight: 500,
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

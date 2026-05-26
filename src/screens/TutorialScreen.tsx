import { useMemo, useState } from 'react';
import { Board } from '../components/Board';
import { HintText } from '../components/HintText';
import {
  CompactAppBar,
  IconButton,
  PrimaryButton,
  TonalCard,
} from '../components/MaterialSurfaces';
import type { GameState } from '../engine/types';
import type { Hint } from '../engine/hints';
import type { Tutorial } from '../data/tutorials';

function cellRef(row: number, col: number) {
  return `${String.fromCharCode(65 + col)}${row + 1}`;
}

interface TutorialScreenProps {
  tutorial: Tutorial;
  /** 1-based position in the Newcomer sequence, for the progress line. */
  index: number;
  total: number;
  /** Called once the player has placed every guided value. */
  onComplete: () => void;
  /** Skip the rest of the tutorials and jump to Beginner. */
  onSkip: () => void;
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
  onSkip,
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

  const previewState: GameState = useMemo(
    () => ({
      puzzle,
      grid: clues,
      isClue,
      notes: emptyNotes,
      errors: noErrors,
      isSolved: false,
    }),
    [puzzle, clues, isClue, emptyNotes, noErrors],
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

  return (
    <div className="flex min-h-screen flex-col">
      <CompactAppBar
        title={phase === 'intro' ? 'Welcome' : title}
        eyebrow={`Step ${index} of ${total}`}
        left={
          <IconButton label="Close" onClick={onSkip}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </IconButton>
        }
      />

      {phase === 'intro' ? (
        <div className="flex flex-1 flex-col px-6 pb-6">
          <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
            <div style={{ width: '100%', maxWidth: 280 }}>
              <Board
                gameState={previewState}
                selectedCell={[steps[0].row, steps[0].col]}
                hint={{
                  row: steps[0].row,
                  col: steps[0].col,
                  value: 0,
                  reason: '',
                  type: 'reveal',
                }}
                cellOverlays={null}
                onCellClick={() => {}}
                showCoordinates
              />
            </div>
            <div>
              <h2
                className="text-2xl font-semibold"
                style={{ color: 'var(--text-primary)' }}
              >
                {title}
              </h2>
              <p
                className="mt-3 max-w-80 text-sm"
                style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}
              >
                {intro}
              </p>
            </div>
          </div>

          <div className="flex justify-center gap-2 py-5" aria-hidden="true">
            {Array.from({ length: total }, (_, i) => (
              <span
                key={i}
                style={{
                  width: i + 1 === index ? 24 : 8,
                  height: 8,
                  borderRadius: 'var(--radius-chip)',
                  background: i + 1 === index ? 'var(--brand-600)' : 'var(--border)',
                }}
              />
            ))}
          </div>

          <div className="flex flex-col gap-3">
            <PrimaryButton onClick={() => setPhase('playing')}>
              Begin
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </PrimaryButton>
            <button
              type="button"
              onClick={onSkip}
              className="cursor-pointer py-2 text-sm font-medium"
              style={{ color: 'var(--text-tertiary)' }}
            >
              Skip tour
            </button>
          </div>
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
            showCoordinates
          />

          {phase === 'done' ? (
            <TonalCard className="w-full" accent={false}>
              <p
                className="text-lg font-semibold"
                style={{ color: 'var(--text-primary)' }}
              >
                Nicely done.
              </p>
              <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                {index < total
                  ? 'That technique is yours. One more on the next screen.'
                  : 'You have the basics. Easy puzzles are now open.'}
              </p>
              <div className="mt-4 flex justify-end">
                <PrimaryButton onClick={onComplete}>
                  Continue
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </PrimaryButton>
              </div>
            </TonalCard>
          ) : (
            <>
              <TonalCard className="w-full" accent={false}>
                <p
                  className="text-sm"
                  style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}
                >
                  {step && (
                    <HintText
                      text={`${cellRef(step.row, step.col)}: ${step.explanation}`}
                      emphasizeValues
                      onCellRef={() => {}}
                    />
                  )}
                </p>
                {wrongValue !== null && (
                  <p
                    className="mt-2 text-sm font-medium"
                    style={{ color: 'var(--danger)' }}
                  >
                    Not quite — that value breaks a rule here. Try again.
                  </p>
                )}
              </TonalCard>

              {/* number row */}
              <div className="flex flex-wrap justify-center gap-2">
                {Array.from({ length: maxNumber }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => handleNumber(n)}
                    className="solve-key"
                    style={{
                      width: 44,
                      height: 44,
                      flex: '0 0 auto',
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

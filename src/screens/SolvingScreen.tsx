import { useCallback, useEffect, useMemo, useState } from 'react';
import { Board } from '../components/Board';
import type { CellOverlay } from '../components/Board';
import { Keypad } from '../components/Keypad';
import { ContradictionStepper } from '../components/ContradictionStepper';
import { HintText } from '../components/HintText';
import { HintMenu } from '../components/HintMenu';
import { PauseSheet } from '../components/PauseSheet';
import { AbandonAlert } from '../components/AbandonAlert';
import { SolvedScreen } from './SolvedScreen';
import { useGame } from '../hooks/useGame';
import { analytics } from '../lib/analytics';
import { useProfile } from '../lib/profileContext';
import { usePaywall } from '../lib/paywallContext';
import { isPremium } from '../lib/profile';
import { posKey } from '../engine/types';
import type { Difficulty, GridSize } from '../engine/types';

const TECHNIQUE_LABEL: Record<string, string> = {
  naked_single: 'Naked single',
  hidden_single: 'Hidden single',
  domination: 'Forced move',
  pair_elimination: 'Pair elimination',
  contradiction: 'Contradiction chain',
  reveal: 'Revealed cell',
  candidates: 'Candidates',
  check: 'Error check',
};

const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
  expert: 'Expert',
};

interface SolvingScreenProps {
  initialDifficulty: Difficulty;
  initialGridSize: GridSize;
  /** Deterministic seed — set when this is the daily puzzle. */
  seed?: number;
  /** Whether this session is the daily puzzle (recorded on the solve). */
  isDaily?: boolean;
  onExit: () => void;
}

/**
 * The Solving screen — v1 Phase 1, backlog item 7. iOS-native chrome
 * around the engine: nav bar, status row, the board, the technique
 * chip / contradiction stepper, a Notes/Hint/Clear toolbar, the
 * keypad, and the pause + abandon overlays. Game logic stays in
 * useGame(); this screen is presentation + the solve timer.
 */
export function SolvingScreen({
  initialDifficulty,
  initialGridSize,
  seed,
  isDaily = false,
  onExit,
}: SolvingScreenProps) {
  const { profile } = useProfile();
  const { openPaywall } = usePaywall();
  // Contradiction-chain hints are premium — gate them at the hint engine.
  const hintGate = useMemo(
    () => ({
      contradictionHintsAllowed: isPremium(profile),
      onContradictionBlocked: () => openPaywall('contradiction_hint'),
    }),
    [profile, openPaywall],
  );

  const {
    gameState,
    selectedCell,
    hint,
    notesMode,
    isGenerating,
    techniquesUsed,
    selfAppliedMoves,
    canUndo,
    handleCellClick,
    handleNumberInput,
    handleClear,
    removeErrors,
    handleHint,
    toggleNotes,
    getShareUrl,
    getHintedCells,
    undo,
    redo,
  } = useGame(
    { difficulty: initialDifficulty, gridSize: initialGridSize, seed },
    hintGate,
  );

  const [chainStepIndex, setChainStepIndex] = useState(0);
  const chain = hint?.chain ?? null;
  const chainLength = chain?.length ?? 0;

  // Reset the stepper when a new hint arrives (adjust-during-render).
  const [hintForStepper, setHintForStepper] = useState(hint);
  if (hint !== hintForStepper) {
    setHintForStepper(hint);
    setChainStepIndex(0);
  }

  const clampStep = useCallback(
    (i: number) => Math.max(0, Math.min(i, chainLength - 1)),
    [chainLength],
  );
  const handleChainStep = useCallback(
    (delta: number) => setChainStepIndex((p) => clampStep(p + delta)),
    [clampStep],
  );
  const jumpToStep = useCallback(
    (i: number) => setChainStepIndex(clampStep(i)),
    [clampStep],
  );

  const cellOverlays = useMemo((): Map<string, CellOverlay> | null => {
    if (!chain || chainLength === 0) return null;
    const overlays = new Map<string, CellOverlay>();
    for (let i = 0; i <= chainStepIndex; i++) {
      const entry = chain[i];
      const key = posKey(entry.row, entry.col);
      const highlight =
        i === chainStepIndex
          ? entry.role === 'info'
            ? 'conclusion'
            : entry.role === 'target'
              ? 'assumption'
              : entry.role
          : null;
      const prev = overlays.get(key);
      overlays.set(key, {
        highlight: highlight ?? prev?.highlight ?? null,
        ghostValue:
          entry.value > 0 && entry.role !== 'target'
            ? entry.value
            : (prev?.ghostValue ?? 0),
      });
    }
    return overlays;
  }, [chain, chainStepIndex, chainLength]);

  const maxNumber = gameState
    ? Math.max(...gameState.puzzle.layout.groups.map((g) => g.cells.length))
    : 5;

  const solved = gameState?.isSolved ?? false;
  const [paused, setPaused] = useState(false);
  const [abandonOpen, setAbandonOpen] = useState(false);
  const [hintMenuOpen, setHintMenuOpen] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  // Validation is explicit — wrong entries surface in red only for a
  // few seconds after the player taps Validate, never live.
  const [showErrors, setShowErrors] = useState(false);
  const [validateNonce, setValidateNonce] = useState(0);
  const validate = useCallback(() => {
    setShowErrors(true);
    setValidateNonce((n) => n + 1);
  }, []);
  useEffect(() => {
    if (validateNonce === 0) return;
    const id = window.setTimeout(() => setShowErrors(false), 6000);
    return () => clearTimeout(id);
  }, [validateNonce]);

  // True while Validate is surfacing real mistakes — the toolbar's
  // Validate control becomes "Remove" so the player can clear them.
  const hasErrors = gameState
    ? gameState.errors.some((row) => row.some(Boolean))
    : false;
  const showingErrors = showErrors && hasErrors;
  const handleRemoveErrors = useCallback(() => {
    removeErrors();
    setShowErrors(false);
  }, [removeErrors]);

  // Solve timer — runs while a puzzle is live, unsolved, and not paused.
  useEffect(() => {
    if (!gameState || solved || paused || abandonOpen) return;
    const id = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(id);
  }, [gameState, solved, paused, abandonOpen]);

  // Keyboard play — number entry, delete, notes, hint, arrow navigation.
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!gameState || paused || abandonOpen || solved) return;

      if ((e.metaKey || e.ctrlKey) && (e.key === 'z' || e.key === 'Z')) {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
        return;
      }

      if (!selectedCell) return;

      const num = parseInt(e.key);
      if (num >= 1 && num <= maxNumber) {
        handleNumberInput(num);
        return;
      }
      if (e.key === 'Backspace' || e.key === 'Delete') {
        handleClear();
        return;
      }
      if (e.key === 'n' || e.key === 'N') {
        toggleNotes();
        return;
      }
      if (e.key === 'h' || e.key === 'H') {
        handleHint();
        return;
      }

      const [r, c] = selectedCell;
      const { rows, cols } = gameState.puzzle.layout;
      let newR = r;
      let newC = c;
      if (e.key === 'ArrowUp') newR = Math.max(0, r - 1);
      else if (e.key === 'ArrowDown') newR = Math.min(rows - 1, r + 1);
      else if (e.key === 'ArrowLeft') newC = Math.max(0, c - 1);
      else if (e.key === 'ArrowRight') newC = Math.min(cols - 1, c + 1);
      if (newR !== r || newC !== c) {
        e.preventDefault();
        handleCellClick(newR, newC);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    gameState,
    selectedCell,
    maxNumber,
    paused,
    abandonOpen,
    solved,
    handleNumberInput,
    handleClear,
    toggleNotes,
    handleHint,
    handleCellClick,
    undo,
    redo,
  ]);

  const cellsLeft = gameState
    ? gameState.grid.flat().filter((v) => v === 0).length
    : 0;
  const timeStr = `${Math.floor(elapsed / 60)}:${String(elapsed % 60).padStart(2, '0')}`;
  const title = `${DIFFICULTY_LABEL[initialDifficulty]} · ${initialGridSize === '5x5' ? '5×5' : '8×8'}`;

  const navIconBtn: React.CSSProperties = {
    width: 40,
    height: 40,
    display: 'grid',
    placeItems: 'center',
    cursor: 'pointer',
    color: 'var(--brand-600)',
  };

  return (
    <div className="flex flex-col">
      {/* nav bar */}
      <div
        className="flex items-center justify-between px-1"
        style={{ paddingTop: 'calc(env(safe-area-inset-top) + 6px)' }}
      >
        <button type="button" onClick={onExit} aria-label="Back to Home" style={navIconBtn}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <span className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
          {title}
        </span>
        <button
          type="button"
          onClick={() => setPaused(true)}
          aria-label="Pause"
          disabled={solved || isGenerating}
          style={{ ...navIconBtn, opacity: solved || isGenerating ? 0.3 : 1 }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <rect x="6" y="5" width="4" height="14" rx="1" />
            <rect x="14" y="5" width="4" height="14" rx="1" />
          </svg>
        </button>
      </div>

      {isGenerating || !gameState ? (
        <div className="flex items-center justify-center" style={{ height: 320 }}>
          <p className="text-lg" style={{ color: 'var(--text-tertiary)' }}>
            Generating puzzle…
          </p>
        </div>
      ) : solved ? (
        <SolvedScreen
          gameState={gameState}
          elapsedSeconds={elapsed}
          difficulty={initialDifficulty}
          gridSize={initialGridSize}
          techniquesUsed={techniquesUsed}
          selfAppliedMoves={selfAppliedMoves}
          isDaily={isDaily}
          getShareUrl={getShareUrl}
          getHintedCells={getHintedCells}
          onExit={onExit}
        />
      ) : (
        <div className="flex flex-col items-center gap-4 px-4 pt-2 pb-8">
          {/* status row */}
          <div
            className="text-sm"
            style={{
              color: 'var(--text-tertiary)',
              fontFamily: 'var(--font-mono)',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {timeStr} · {cellsLeft} left
          </div>

          <Board
            gameState={gameState}
            selectedCell={selectedCell}
            hint={hint}
            cellOverlays={cellOverlays}
            onCellClick={handleCellClick}
            showErrors={showErrors}
            showCoordinates={hint !== null}
          />

          {/* number keypad */}
          <Keypad maxNumber={maxNumber} onNumber={handleNumberInput} />

          {/* toolbar — Notes / Hint / Validate / Clear, then a round Undo */}
          <div className="flex w-full gap-2">
            {(
              [
                { label: 'Notes', onClick: toggleNotes, active: notesMode },
                { label: 'Hint', onClick: () => setHintMenuOpen(true), active: false },
                showingErrors
                  ? { label: 'Remove', onClick: handleRemoveErrors, active: true, tone: 'danger' as const }
                  : { label: 'Validate', onClick: validate, active: showErrors },
                { label: 'Clear', onClick: handleClear, active: false },
              ] as { label: string; onClick: () => void; active: boolean; tone?: 'danger' }[]
            ).map((tool) => (
              <button
                key={tool.label}
                type="button"
                onClick={tool.onClick}
                className={`solve-tool${
                  tool.tone === 'danger'
                    ? ' is-danger'
                    : tool.active
                      ? ' is-active'
                      : ''
                }`}
              >
                {tool.label}
              </button>
            ))}
            <button
              type="button"
              onClick={undo}
              disabled={!canUndo}
              aria-label="Undo"
              className="solve-undo"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  transform="rotate(90 12 12)"
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M15 3.75A5.25 5.25 0 0 0 9.75 9v10.19l4.72-4.72a.75.75 0 1 1 1.06 1.06l-6 6a.75.75 0 0 1-1.06 0l-6-6a.75.75 0 1 1 1.06-1.06l4.72 4.72V9a6.75 6.75 0 0 1 13.5 0v3a.75.75 0 0 1-1.5 0V9c0-2.9-2.35-5.25-5.25-5.25Z"
                />
              </svg>
            </button>
          </div>

          {/* hint area */}
          {hint && chain && chainLength > 0 ? (
            <ContradictionStepper
              chain={chain}
              stepIndex={chainStepIndex}
              onStep={handleChainStep}
              onJump={jumpToStep}
              onCellRef={handleCellClick}
            />
          ) : hint ? (
            <div
              className="w-full"
              style={{
                background: 'var(--surface-elevated)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-card)',
                padding: 'var(--space-3)',
              }}
            >
              <span
                className="inline-block text-xs font-semibold"
                style={{
                  color: 'var(--text-on-brand)',
                  background: 'var(--brand-600)',
                  borderRadius: 'var(--radius-chip)',
                  padding: '2px 10px',
                }}
              >
                {TECHNIQUE_LABEL[hint.type] ?? 'Hint'}
              </span>
              <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                <HintText text={hint.reason} onCellRef={handleCellClick} />
              </p>
            </div>
          ) : null}
        </div>
      )}

      <HintMenu
        open={hintMenuOpen}
        onClose={() => setHintMenuOpen(false)}
        onPick={(mode) => {
          analytics.hintUsed(mode);
          handleHint(mode);
        }}
      />
      <PauseSheet
        open={paused}
        onResume={() => setPaused(false)}
        onAbandon={() => {
          setPaused(false);
          setAbandonOpen(true);
        }}
      />
      <AbandonAlert
        open={abandonOpen}
        onAbandon={onExit}
        onKeepSolving={() => setAbandonOpen(false)}
      />
    </div>
  );
}

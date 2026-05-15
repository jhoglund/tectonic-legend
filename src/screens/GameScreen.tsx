import { useCallback, useEffect, useMemo, useState } from 'react';
import { Board } from '../components/Board';
import type { CellOverlay } from '../components/Board';
import { GameControls } from '../components/GameControls';
import { useGame } from '../hooks/useGame';
import { posKey } from '../engine/types';

/**
 * The playable game — board + controls. For v1 Phase 0 this is the
 * content of the Home tab. Phase 1 splits it into a Home landing
 * screen and a dedicated Solving screen per the prototype.
 */
export function GameScreen() {
  const {
    gameState,
    difficulty,
    gridSize,
    selectedCell,
    hint,
    hintMode,
    notesMode,
    isGenerating,
    startNewGame,
    handleCellClick,
    handleNumberInput,
    handleClear,
    handleHint,
    setHintMode,
    toggleNotes,
    getShareUrl,
  } = useGame();

  const [chainStepIndex, setChainStepIndex] = useState(0);

  const chain = hint?.chain ?? null;
  const chainLength = chain?.length ?? 0;

  // Reset the chain stepper to step 0 whenever a new hint arrives.
  // Adjusting state during render (rather than in an effect) is React's
  // recommended pattern for "reset state when a value changes".
  const [hintForStepper, setHintForStepper] = useState(hint);
  if (hint !== hintForStepper) {
    setHintForStepper(hint);
    setChainStepIndex(0);
  }

  const handleChainStep = useCallback((delta: number) => {
    setChainStepIndex((prev) => {
      const next = prev + delta;
      return Math.max(0, Math.min(next, chainLength - 1));
    });
  }, [chainLength]);

  const cellOverlays = useMemo((): Map<string, CellOverlay> | null => {
    if (!chain || chainLength === 0) return null;

    const overlays = new Map<string, CellOverlay>();

    for (let i = 0; i <= chainStepIndex; i++) {
      const entry = chain[i];
      const key = posKey(entry.row, entry.col);
      const highlight = i === chainStepIndex
        ? (entry.role === 'info' ? 'conclusion' : entry.role === 'target' ? 'assumption' : entry.role)
        : null;
      const prev = overlays.get(key);
      overlays.set(key, {
        highlight: highlight ?? prev?.highlight ?? null,
        ghostValue: entry.value > 0 && entry.role !== 'target' ? entry.value : prev?.ghostValue ?? 0,
      });
    }

    return overlays;
  }, [chain, chainStepIndex, chainLength]);

  const handleShare = useCallback(() => {
    const url = getShareUrl();
    if (url) {
      navigator.clipboard.writeText(url);
    }
  }, [getShareUrl]);

  const maxNumber = gameState
    ? Math.max(...gameState.puzzle.layout.groups.map((g) => g.cells.length))
    : 5;

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!gameState || !selectedCell) return;

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
  }, [gameState, selectedCell, maxNumber, handleNumberInput, handleClear, toggleNotes, handleHint, handleCellClick]);

  return (
    <div className="flex flex-col items-center py-8 px-4">
      <h1 className="text-3xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Tectonic</h1>
      <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
        Fill each group with 1..N. No equal neighbors (including diagonals).
      </p>

      {isGenerating ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-lg" style={{ color: 'var(--text-tertiary)' }}>Generating puzzle...</p>
        </div>
      ) : gameState ? (
        <div className="flex flex-col items-center gap-6">
          <Board
            gameState={gameState}
            selectedCell={selectedCell}
            hint={hint}
            cellOverlays={cellOverlays}
            onCellClick={handleCellClick}
          />
          <GameControls
            difficulty={difficulty}
            gridSize={gridSize}
            hint={hint}
            hintMode={hintMode}
            chainStepIndex={chainStepIndex}
            chainLength={chainLength}
            onNewGame={startNewGame}
            onNumberInput={handleNumberInput}
            onClear={handleClear}
            onToggleNotes={toggleNotes}
            onHint={handleHint}
            onHintModeChange={setHintMode}
            onShare={handleShare}
            onChainStep={handleChainStep}
            notesMode={notesMode}
            maxNumber={maxNumber}
            isSolved={gameState.isSolved}
          />
        </div>
      ) : null}

      <p className="text-xs mt-8" style={{ color: 'var(--text-tertiary)' }}>
        Arrow keys to navigate. Press N for notes, H for hint.
      </p>
    </div>
  );
}

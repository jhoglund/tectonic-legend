import { useState, useCallback, useEffect } from 'react';
import type { GameState, Difficulty, Puzzle, GridSize, HintMode } from '../engine/types';
import { findErrors, isSolved } from '../engine/validator';
import { generatePuzzle } from '../engine/generator';
import { findHint, findCandidatesHint, findRevealHint, findCheckHint } from '../engine/hints';
import type { Hint } from '../engine/hints';

function createGameState(puzzle: Puzzle): GameState {
  const { layout, clues } = puzzle;
  const { rows, cols } = layout;

  const grid = clues.map((row) => [...row]);
  const isClue = clues.map((row) => row.map((v) => v !== 0));
  const notes = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => new Set<number>())
  );
  const errors = Array.from({ length: rows }, () =>
    Array(cols).fill(false)
  ) as boolean[][];

  return {
    puzzle,
    grid,
    isClue,
    notes,
    errors,
    isSolved: false,
  };
}

function gridSizeDimensions(size: GridSize): [number, number] {
  return size === '10x10' ? [10, 10] : [5, 5];
}

export function useGame() {
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [gridSize, setGridSize] = useState<GridSize>('5x5');
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const [notesMode, setNotesMode] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hint, setHint] = useState<Hint | null>(null);
  const [hintMode, setHintMode] = useState<HintMode>('logic');

  const startNewGame = useCallback((diff: Difficulty, size?: GridSize) => {
    const actualSize = size ?? gridSize;
    setIsGenerating(true);
    setDifficulty(diff);
    if (size) setGridSize(size);
    setSelectedCell(null);
    setNotesMode(false);
    setHint(null);

    setTimeout(() => {
      const [rows, cols] = gridSizeDimensions(actualSize);
      const puzzle = generatePuzzle(rows, cols, diff);
      setGameState(createGameState(puzzle));
      setIsGenerating(false);
    }, 50);
  }, [gridSize]);

  useEffect(() => {
    startNewGame('easy', '5x5');
  }, []);

  const handleCellClick = useCallback(
    (row: number, col: number) => {
      if (!gameState) return;
      setSelectedCell([row, col]);
    },
    [gameState]
  );

  const handleNumberInput = useCallback(
    (num: number) => {
      if (!gameState || !selectedCell) return;
      const [r, c] = selectedCell;
      if (gameState.isClue[r][c]) return;
      setHint(null);

      setGameState((prev) => {
        if (!prev) return prev;
        const newGrid = prev.grid.map((row) => [...row]);
        const newNotes = prev.notes.map((row) =>
          row.map((s) => new Set(s))
        );

        if (notesMode) {
          if (newNotes[r][c].has(num)) {
            newNotes[r][c].delete(num);
          } else {
            newNotes[r][c].add(num);
          }
          newGrid[r][c] = 0;
        } else {
          newGrid[r][c] = newGrid[r][c] === num ? 0 : num;
          newNotes[r][c].clear();
        }

        const newErrors = findErrors(newGrid, prev.puzzle.layout);
        const solved = isSolved(newGrid, prev.puzzle.layout);

        return {
          ...prev,
          grid: newGrid,
          notes: newNotes,
          errors: newErrors,
          isSolved: solved,
        };
      });
    },
    [gameState, selectedCell, notesMode]
  );

  const handleClear = useCallback(() => {
    if (!gameState || !selectedCell) return;
    const [r, c] = selectedCell;
    if (gameState.isClue[r][c]) return;

    setGameState((prev) => {
      if (!prev) return prev;
      const newGrid = prev.grid.map((row) => [...row]);
      const newNotes = prev.notes.map((row) =>
        row.map((s) => new Set(s))
      );
      newGrid[r][c] = 0;
      newNotes[r][c].clear();
      const newErrors = findErrors(newGrid, prev.puzzle.layout);

      return {
        ...prev,
        grid: newGrid,
        notes: newNotes,
        errors: newErrors,
        isSolved: false,
      };
    });
  }, [gameState, selectedCell]);

  const handleHint = useCallback((mode?: HintMode) => {
    if (!gameState) return;
    const activeMode = mode ?? hintMode;

    if (activeMode === 'logic') {
      const h = findHint(gameState.grid, gameState.puzzle.layout);
      if (h) {
        setHint(h);
        setSelectedCell([h.row, h.col]);
      } else {
        // No logic deduction found — fall back to revealing a cell
        const { rows, cols } = gameState.puzzle.layout;
        let targetR = -1;
        let targetC = -1;
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            if (gameState.grid[r][c] === 0 && !gameState.isClue[r][c]) {
              targetR = r;
              targetC = c;
              break;
            }
          }
          if (targetR !== -1) break;
        }
        if (targetR === -1) {
          setHint({ row: -1, col: -1, value: 0, reason: 'No empty cells remaining.', type: 'reveal' });
        } else {
          const val = gameState.puzzle.solution[targetR][targetC];
          setHint({ row: targetR, col: targetC, value: val, reason: `No simple logic deduction found — revealing this cell. The answer is ${val}.`, type: 'reveal' });
          setSelectedCell([targetR, targetC]);
          setGameState((prev) => {
            if (!prev) return prev;
            const newGrid = prev.grid.map((row) => [...row]);
            const newNotes = prev.notes.map((row) => row.map((s) => new Set(s)));
            newGrid[targetR][targetC] = val;
            newNotes[targetR][targetC].clear();
            const newErrors = findErrors(newGrid, prev.puzzle.layout);
            const solved = isSolved(newGrid, prev.puzzle.layout);
            return { ...prev, grid: newGrid, notes: newNotes, errors: newErrors, isSolved: solved };
          });
        }
      }
    } else if (activeMode === 'candidates') {
      if (!selectedCell) {
        setHint({ row: -1, col: -1, value: 0, reason: 'Select a cell first to see its candidates.', type: 'candidates' });
        return;
      }
      const [r, c] = selectedCell;
      const h = findCandidatesHint(gameState.grid, gameState.puzzle.layout, r, c);
      setHint(h);
    } else if (activeMode === 'reveal') {
      if (!selectedCell) {
        setHint({ row: -1, col: -1, value: 0, reason: 'Select a cell first to reveal its answer.', type: 'reveal' });
        return;
      }
      const [r, c] = selectedCell;
      const h = findRevealHint(gameState.puzzle.solution, gameState.grid, r, c);
      setHint(h);
      if (h.value && gameState.grid[r][c] !== h.value && !gameState.isClue[r][c]) {
        setGameState((prev) => {
          if (!prev) return prev;
          const newGrid = prev.grid.map((row) => [...row]);
          const newNotes = prev.notes.map((row) => row.map((s) => new Set(s)));
          newGrid[r][c] = h.value;
          newNotes[r][c].clear();
          const newErrors = findErrors(newGrid, prev.puzzle.layout);
          const solved = isSolved(newGrid, prev.puzzle.layout);
          return { ...prev, grid: newGrid, notes: newNotes, errors: newErrors, isSolved: solved };
        });
      }
    } else if (activeMode === 'check') {
      const h = findCheckHint(gameState.grid, gameState.puzzle.layout);
      setHint(h);
    }
  }, [gameState, selectedCell, hintMode]);

  const toggleNotes = useCallback(() => {
    setNotesMode((prev) => !prev);
  }, []);

  return {
    gameState,
    difficulty,
    gridSize,
    selectedCell,
    notesMode,
    isGenerating,
    hint,
    hintMode,
    startNewGame,
    handleCellClick,
    handleNumberInput,
    handleClear,
    handleHint,
    setHintMode,
    toggleNotes,
  };
}

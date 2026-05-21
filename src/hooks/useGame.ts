import { useState, useCallback, useEffect, useRef } from 'react';
import type { GameState, Difficulty, Puzzle, GridSize, HintMode } from '../engine/types';
import { posKey } from '../engine/types';
import { findErrors, isSolved } from '../engine/validator';
import { generatePuzzle } from '../engine/generator';
import {
  findHint,
  findCandidatesHint,
  findRevealHint,
  findCheckHint,
  classifyMove,
} from '../engine/hints';
import type { Hint } from '../engine/hints';
import { encodeState, decodeState } from '../engine/urlCodec';

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
  return size === '8x8' ? [8, 8] : [5, 5];
}

export function useGame(
  initial?: {
    difficulty: Difficulty;
    gridSize: GridSize;
    /** Deterministic generator seed — set for the daily puzzle. */
    seed?: number;
  },
  /** Premium gate for contradiction-chain hints (the paywall trigger). */
  gate?: {
    contradictionHintsAllowed: boolean;
    onContradictionBlocked: () => void;
  },
) {
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [gridSize, setGridSize] = useState<GridSize>('5x5');
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const [notesMode, setNotesMode] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hint, setHint] = useState<Hint | null>(null);
  const [hintMode, setHintMode] = useState<HintMode>('logic');
  // Logic-hint techniques surfaced this game, keyed by Hint.type. Reset
  // per game; the Solved screen reads it for the per-solve breakdown.
  const [techniquesUsed, setTechniquesUsed] = useState<Record<string, number>>({});
  // Unaided correct moves that a basic technique justifies — keyed by
  // Hint.type, the self-applied tally for technique mastery (§3).
  const [selfAppliedMoves, setSelfAppliedMoves] = useState<Record<string, number>>({});
  // Cells the hint engine has surfaced this game; a later fill in one
  // is assisted, never self-applied. A ref — touched only in callbacks.
  const hintedCells = useRef<Set<string>>(new Set());
  // Distinct cells the player has tapped Validate on while wrong — the
  // depth score's QUALITY term reads this (ADR-0018). A cell counted
  // once per puzzle even if validated again after a correction.
  const validatedErrorCells = useRef<Set<string>>(new Set());
  // Undo / redo — full move history, no cap. `past` holds states before
  // the current one; `future` holds states undone away from.
  const [past, setPast] = useState<GameState[]>([]);
  const [future, setFuture] = useState<GameState[]>([]);

  /** Apply a board-changing state, pushing the current one onto history. */
  const commit = useCallback(
    (next: GameState) => {
      setPast((p) => (gameState ? [...p, gameState] : p));
      setGameState(next);
      setFuture([]);
    },
    [gameState],
  );

  const startNewGame = useCallback((diff: Difficulty, size?: GridSize, seed?: number) => {
    const actualSize = size ?? gridSize;
    setIsGenerating(true);
    setDifficulty(diff);
    if (size) setGridSize(size);
    setSelectedCell(null);
    setNotesMode(false);
    setHint(null);
    setTechniquesUsed({});
    setSelfAppliedMoves({});
    hintedCells.current = new Set();
    validatedErrorCells.current = new Set();

    setTimeout(() => {
      const [rows, cols] = gridSizeDimensions(actualSize);
      const puzzle = generatePuzzle(rows, cols, diff, seed);
      setGameState(createGameState(puzzle));
      setPast([]);
      setFuture([]);
      setIsGenerating(false);
    }, 50);
  }, [gridSize]);

  const loadFromUrl = useCallback(() => {
    const hash = window.location.hash.replace(/^#/, '');
    if (!hash) return false;
    const decoded = decodeState(hash);
    if (!decoded) return false;

    const { puzzle, grid, difficulty: diff, gridSize: size } = decoded;
    setDifficulty(diff);
    setGridSize(size);

    const state = createGameState(puzzle);
    state.grid = grid;
    state.isClue = puzzle.clues.map((row) => row.map((v) => v !== 0));
    state.errors = findErrors(grid, puzzle.layout, puzzle.solution, state.isClue);
    state.isSolved = isSolved(grid, puzzle.layout, state.errors);
    setGameState(state);
    setPast([]);
    setFuture([]);

    window.history.replaceState(null, '', window.location.pathname);
    return true;
  }, []);

  useEffect(() => {
    // Mount bootstrap, deferred to a macrotask so it doesn't call
    // setState synchronously within the effect (which would cascade an
    // extra render). loadFromUrl() restores a shared-link game;
    // otherwise generate a fresh Easy 5x5.
    const t = setTimeout(() => {
      if (!loadFromUrl()) {
        startNewGame(
          initial?.difficulty ?? 'easy',
          initial?.gridSize ?? '5x5',
          initial?.seed,
        );
      }
    }, 0);
    return () => clearTimeout(t);
    // Mount-only: loadFromUrl / startNewGame are intentionally not deps.
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

      const newGrid = gameState.grid.map((row) => [...row]);
      const newNotes = gameState.notes.map((row) => row.map((s) => new Set(s)));

      if (notesMode) {
        if (newNotes[r][c].has(num)) {
          newNotes[r][c].delete(num);
        } else {
          newNotes[r][c].add(num);
        }
        newGrid[r][c] = 0;
      } else {
        const wasEmpty = gameState.grid[r][c] === 0;
        newGrid[r][c] = newGrid[r][c] === num ? 0 : num;
        newNotes[r][c].clear();
        // Self-applied: an unaided, correct fill of a previously empty
        // cell that a naked / hidden single justifies (progression.md §3).
        if (
          wasEmpty &&
          newGrid[r][c] === num &&
          num === gameState.puzzle.solution[r][c] &&
          !hintedCells.current.has(posKey(r, c))
        ) {
          const tech = classifyMove(
            gameState.grid,
            gameState.puzzle.layout,
            r,
            c,
            num,
          );
          if (tech) {
            setSelfAppliedMoves((prev) => ({
              ...prev,
              [tech]: (prev[tech] ?? 0) + 1,
            }));
          }
        }
      }

      const newErrors = findErrors(newGrid, gameState.puzzle.layout, gameState.puzzle.solution, gameState.isClue);
      const solved = isSolved(newGrid, gameState.puzzle.layout, newErrors);

      commit({ ...gameState, grid: newGrid, notes: newNotes, errors: newErrors, isSolved: solved });
    },
    [gameState, selectedCell, notesMode, commit]
  );

  const handleClear = useCallback(() => {
    if (!gameState || !selectedCell) return;
    const [r, c] = selectedCell;
    if (gameState.isClue[r][c]) return;

    const newGrid = gameState.grid.map((row) => [...row]);
    const newNotes = gameState.notes.map((row) => row.map((s) => new Set(s)));
    newGrid[r][c] = 0;
    newNotes[r][c].clear();
    const newErrors = findErrors(newGrid, gameState.puzzle.layout, gameState.puzzle.solution, gameState.isClue);

    commit({ ...gameState, grid: newGrid, notes: newNotes, errors: newErrors, isSolved: false });
  }, [gameState, selectedCell, commit]);

  /** True when any player-entered value or note is on the board — the
   *  Clear-puzzle action has something to clear. */
  const hasPlayerProgress = useCallback(() => {
    if (!gameState) return false;
    const { rows, cols } = gameState.puzzle.layout;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (gameState.isClue[r][c]) continue;
        if (gameState.grid[r][c] !== 0) return true;
        if (gameState.notes[r][c].size > 0) return true;
      }
    }
    return false;
  }, [gameState]);

  /** Wipe every non-clue cell and all notes. Undoable. */
  const clearAll = useCallback(() => {
    if (!gameState) return;
    const { rows, cols } = gameState.puzzle.layout;
    const newGrid = gameState.grid.map((row, r) =>
      row.map((v, c) => (gameState.isClue[r][c] ? v : 0)),
    );
    const newNotes = Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => new Set<number>()),
    );
    const newErrors = findErrors(
      newGrid,
      gameState.puzzle.layout,
      gameState.puzzle.solution,
      gameState.isClue,
    );
    commit({ ...gameState, grid: newGrid, notes: newNotes, errors: newErrors, isSolved: false });
  }, [gameState, commit]);

  /** Clear every cell currently flagged as an error (wrong entries). */
  const removeErrors = useCallback(() => {
    if (!gameState) return;
    const { rows, cols } = gameState.puzzle.layout;
    const newGrid = gameState.grid.map((row) => [...row]);
    const newNotes = gameState.notes.map((row) => row.map((s) => new Set(s)));
    let removed = false;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (gameState.errors[r][c]) {
          newGrid[r][c] = 0;
          newNotes[r][c].clear();
          removed = true;
        }
      }
    }
    if (!removed) return;
    const newErrors = findErrors(newGrid, gameState.puzzle.layout, gameState.puzzle.solution, gameState.isClue);
    commit({ ...gameState, grid: newGrid, notes: newNotes, errors: newErrors, isSolved: false });
  }, [gameState, commit]);

  /** Step back one move. */
  const undo = useCallback(() => {
    if (past.length === 0 || !gameState) return;
    const prevState = past[past.length - 1];
    setPast((p) => p.slice(0, -1));
    setFuture((f) => [gameState, ...f]);
    setGameState(prevState);
    setHint(null);
  }, [past, gameState]);

  /** Step forward one undone move. */
  const redo = useCallback(() => {
    if (future.length === 0 || !gameState) return;
    const nextState = future[0];
    setFuture((f) => f.slice(1));
    setPast((p) => [...p, gameState]);
    setGameState(nextState);
    setHint(null);
  }, [future, gameState]);

  const handleHint = useCallback((mode?: HintMode) => {
    if (!gameState) return;
    const activeMode = mode ?? hintMode;

    if (activeMode === 'logic') {
      const h = findHint(gameState.grid, gameState.puzzle.layout);
      if (h) {
        // Contradiction-chain hints are premium (soft-launch plan §3) —
        // a free player here hits the primary paywall trigger.
        if (
          h.type === 'contradiction' &&
          gate &&
          !gate.contradictionHintsAllowed
        ) {
          gate.onContradictionBlocked();
          return;
        }
        setHint(h);
        setSelectedCell([h.row, h.col]);
        setTechniquesUsed((prev) => ({ ...prev, [h.type]: (prev[h.type] ?? 0) + 1 }));
        hintedCells.current.add(posKey(h.row, h.col));
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
          hintedCells.current.add(posKey(targetR, targetC));
          const newGrid = gameState.grid.map((row) => [...row]);
          const newNotes = gameState.notes.map((row) => row.map((s) => new Set(s)));
          newGrid[targetR][targetC] = val;
          newNotes[targetR][targetC].clear();
          const newErrors = findErrors(newGrid, gameState.puzzle.layout, gameState.puzzle.solution, gameState.isClue);
          const solved = isSolved(newGrid, gameState.puzzle.layout);
          commit({ ...gameState, grid: newGrid, notes: newNotes, errors: newErrors, isSolved: solved });
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
      hintedCells.current.add(posKey(r, c));
    } else if (activeMode === 'reveal') {
      if (!selectedCell) {
        setHint({ row: -1, col: -1, value: 0, reason: 'Select a cell first to reveal its answer.', type: 'reveal' });
        return;
      }
      const [r, c] = selectedCell;
      const h = findRevealHint(gameState.puzzle.solution, gameState.grid, r, c);
      setHint(h);
      hintedCells.current.add(posKey(r, c));
      if (h.value && gameState.grid[r][c] !== h.value && !gameState.isClue[r][c]) {
        const newGrid = gameState.grid.map((row) => [...row]);
        const newNotes = gameState.notes.map((row) => row.map((s) => new Set(s)));
        newGrid[r][c] = h.value;
        newNotes[r][c].clear();
        const newErrors = findErrors(newGrid, gameState.puzzle.layout, gameState.puzzle.solution, gameState.isClue);
        const solved = isSolved(newGrid, gameState.puzzle.layout);
        commit({ ...gameState, grid: newGrid, notes: newNotes, errors: newErrors, isSolved: solved });
      }
    } else if (activeMode === 'check') {
      const h = findCheckHint(gameState.grid, gameState.puzzle.layout, gameState.puzzle.solution, gameState.isClue);
      setHint(h);
    }
  }, [gameState, selectedCell, hintMode, commit, gate]);

  const toggleNotes = useCallback(() => {
    setNotesMode((prev) => !prev);
  }, []);

  const getShareUrl = useCallback(() => {
    if (!gameState) return null;
    const encoded = encodeState(gameState.puzzle, gameState.grid, difficulty);
    return `${window.location.origin}${window.location.pathname}#${encoded}`;
  }, [gameState, difficulty]);

  /** Snapshot of the cells the hint engine surfaced this game — read by
   *  the Solved screen to colour the shareable solve artifact. */
  const getHintedCells = useCallback(() => new Set(hintedCells.current), []);

  /** Record that the player tapped Validate — each currently-wrong cell
   *  becomes a distinct error against this solve's QUALITY (ADR-0018).
   *  A cell already counted this solve is not double-counted. */
  const recordValidation = useCallback(() => {
    if (!gameState) return;
    const { errors } = gameState;
    for (let r = 0; r < errors.length; r++) {
      for (let c = 0; c < errors[r].length; c++) {
        if (errors[r][c]) validatedErrorCells.current.add(posKey(r, c));
      }
    }
  }, [gameState]);

  /** How many distinct wrong cells the player has tapped Validate on
   *  this solve — passed into recordSolve at completion. */
  const getErrorsValidated = useCallback(
    () => validatedErrorCells.current.size,
    [],
  );

  return {
    gameState,
    difficulty,
    gridSize,
    selectedCell,
    notesMode,
    isGenerating,
    hint,
    hintMode,
    techniquesUsed,
    selfAppliedMoves,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
    startNewGame,
    handleCellClick,
    handleNumberInput,
    handleClear,
    hasPlayerProgress,
    clearAll,
    removeErrors,
    handleHint,
    setHintMode,
    toggleNotes,
    getShareUrl,
    getHintedCells,
    recordValidation,
    getErrorsValidated,
    undo,
    redo,
  };
}

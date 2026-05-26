import type { GameState, GridSize, Puzzle } from '../engine/types';
import { findErrors, isSolved } from '../engine/validator';

export function gridSizeDimensions(size: GridSize): [number, number] {
  return size === '8x8' ? [8, 8] : [5, 5];
}

export function createGameState(
  puzzle: Puzzle,
  grid: number[][] = puzzle.clues,
): GameState {
  const { rows, cols } = puzzle.layout;
  const clonedGrid = grid.map((row) => [...row]);
  const isClue = puzzle.clues.map((row) => row.map((value) => value !== 0));
  const errors = findErrors(clonedGrid, puzzle.layout, puzzle.solution, isClue);

  return {
    puzzle,
    grid: clonedGrid,
    isClue,
    notes: Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => new Set<number>()),
    ),
    errors,
    isSolved: isSolved(clonedGrid, puzzle.layout, errors),
  };
}

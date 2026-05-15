import { describe, it, expect } from 'vitest';
import { generatePuzzle } from './generator';
import { findErrors, isSolved } from './validator';

describe('findErrors', () => {
  it('flags no errors on a correct solution', () => {
    const puzzle = generatePuzzle(5, 5, 'easy');
    const errors = findErrors(puzzle.solution, puzzle.layout);
    expect(errors.flat().some(Boolean)).toBe(false);
  }, 15000);

  it('flags a cell that breaks the no-equal-neighbour rule', () => {
    const puzzle = generatePuzzle(5, 5, 'easy');
    // Copy the solution, then force two orthogonal neighbours to clash.
    const grid = puzzle.solution.map((row) => [...row]);
    grid[0][1] = grid[0][0];
    const errors = findErrors(grid, puzzle.layout);
    expect(errors.flat().some(Boolean)).toBe(true);
  }, 15000);
});

describe('isSolved', () => {
  it('is true for the complete solution grid', () => {
    const puzzle = generatePuzzle(5, 5, 'easy');
    expect(isSolved(puzzle.solution, puzzle.layout)).toBe(true);
  }, 15000);

  it('is false for the incomplete clue grid', () => {
    const puzzle = generatePuzzle(5, 5, 'easy');
    expect(isSolved(puzzle.clues, puzzle.layout)).toBe(false);
  }, 15000);
});

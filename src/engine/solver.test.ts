import { describe, it, expect } from 'vitest';
import { generatePuzzle } from './generator';
import { solve, countSolutions } from './solver';

describe('solve', () => {
  it('solves a generated easy puzzle to its known solution', () => {
    const puzzle = generatePuzzle(5, 5, 'easy');
    const result = solve(puzzle.layout, puzzle.clues);

    expect(result.solved).toBe(true);
    expect(result.grid).toEqual(puzzle.solution);
  }, 15000);

  it('returns the solution unchanged when fed the full solution as clues', () => {
    const puzzle = generatePuzzle(5, 5, 'easy');
    const result = solve(puzzle.layout, puzzle.solution);

    expect(result.solved).toBe(true);
    expect(result.grid).toEqual(puzzle.solution);
  }, 15000);
});

describe('countSolutions', () => {
  it('reports exactly one solution for a generated puzzle', () => {
    const puzzle = generatePuzzle(5, 5, 'medium');
    expect(countSolutions(puzzle.layout, puzzle.clues, 2)).toBe(1);
  }, 15000);

  it('reports exactly one solution for the fully-filled solution grid', () => {
    const puzzle = generatePuzzle(5, 5, 'easy');
    expect(countSolutions(puzzle.layout, puzzle.solution, 2)).toBe(1);
  }, 15000);
});

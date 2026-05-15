import { describe, it, expect } from 'vitest';
import { generatePuzzle } from './generator';
import { classifyMove } from './hints';

describe('classifyMove', () => {
  it('credits a forced single — a lone empty cell on a solved grid', () => {
    for (let n = 0; n < 5; n++) {
      const { layout, solution } = generatePuzzle(5, 5, 'easy');
      const grid = solution.map((row) => [...row]);
      grid[2][2] = 0;
      // With every other cell filled, the gap has exactly one candidate.
      expect(classifyMove(grid, layout, 2, 2, solution[2][2])).not.toBeNull();
    }
  });

  it('gives no credit for a value that is not even a candidate', () => {
    const { layout, solution } = generatePuzzle(5, 5, 'easy');
    const grid = solution.map((row) => [...row]);
    grid[1][1] = 0;
    const wrong = solution[1][1] === 1 ? 2 : 1;
    expect(classifyMove(grid, layout, 1, 1, wrong)).toBeNull();
  });

  it('gives no credit for a cell that already has a value', () => {
    const { layout, solution } = generatePuzzle(5, 5, 'easy');
    expect(classifyMove(solution, layout, 0, 0, solution[0][0])).toBeNull();
  });
});

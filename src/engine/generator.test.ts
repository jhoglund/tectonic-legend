import { describe, it, expect } from 'vitest';
import { generatePuzzle, generateLayout } from './generator';
import { countSolutions } from './solver';
import type { PuzzleLayout } from './types';

/** A grid is a valid Tectonic solution when every cage holds exactly
 *  1..N (N = cage size) and no two of the 8 neighbours of any cell
 *  share a value. */
function solutionIsValid(grid: number[][], layout: PuzzleLayout): boolean {
  const { rows, cols, groups, neighbors } = layout;

  for (const group of groups) {
    const n = group.cells.length;
    const seen = new Set<number>();
    for (const { row, col } of group.cells) {
      const v = grid[row][col];
      if (v < 1 || v > n || seen.has(v)) return false;
      seen.add(v);
    }
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      for (const [nr, nc] of neighbors[r][c]) {
        if (grid[r][c] === grid[nr][nc]) return false;
      }
    }
  }
  return true;
}

describe('generatePuzzle', () => {
  for (const difficulty of ['easy', 'medium', 'hard'] as const) {
    it(`produces a valid, uniquely-solvable ${difficulty} 5x5`, () => {
      const puzzle = generatePuzzle(5, 5, difficulty);

      expect(puzzle.layout.rows).toBe(5);
      expect(puzzle.layout.cols).toBe(5);

      // The solution is a structurally valid Tectonic grid.
      expect(solutionIsValid(puzzle.solution, puzzle.layout)).toBe(true);

      // Every given clue agrees with the solution; 0 means empty.
      for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 5; c++) {
          if (puzzle.clues[r][c] !== 0) {
            expect(puzzle.clues[r][c]).toBe(puzzle.solution[r][c]);
          }
        }
      }

      // The clue set yields exactly one solution.
      expect(countSolutions(puzzle.layout, puzzle.clues, 2)).toBe(1);

      // A puzzle has at least one empty cell to solve.
      expect(puzzle.clues.flat().some((v) => v === 0)).toBe(true);
    }, 15000);
  }

  it('keeps every cage within the 2..5 size bounds', () => {
    const puzzle = generatePuzzle(5, 5, 'easy');
    for (const group of puzzle.layout.groups) {
      expect(group.cells.length).toBeGreaterThanOrEqual(2);
      expect(group.cells.length).toBeLessThanOrEqual(5);
    }
  });
});

describe('generateLayout', () => {
  it('partitions every cell into exactly one cage', () => {
    const layout = generateLayout(5, 5, 5, 2);
    const covered = new Set<string>();
    for (const group of layout.groups) {
      for (const { row, col } of group.cells) {
        const key = `${row},${col}`;
        expect(covered.has(key)).toBe(false);
        covered.add(key);
      }
    }
    expect(covered.size).toBe(25);
  });
});

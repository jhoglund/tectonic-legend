import { describe, it, expect } from 'vitest';
import { generatePuzzle } from './generator';
import { findHint, classifyMove } from './hints';
import type { PuzzleLayout, Group, Position } from './types';

/**
 * Build a deterministic layout from a grid of cage ids (0-based,
 * contiguous). The random generator can't be relied on to produce a
 * specific cage shape, so the domination tests pin one by hand.
 */
function makeLayout(cageIds: number[][]): PuzzleLayout {
  const rows = cageIds.length;
  const cols = cageIds[0].length;

  const byId = new Map<number, Position[]>();
  const cellToGroup = new Map<string, number>();
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const id = cageIds[r][c];
      let cells = byId.get(id);
      if (!cells) {
        cells = [];
        byId.set(id, cells);
      }
      cells.push({ row: r, col: c });
      cellToGroup.set(`${r},${c}`, id);
    }
  }
  const groups: Group[] = [...byId.entries()]
    .sort(([a], [b]) => a - b)
    .map(([id, cells]) => ({ id, cells }));

  const neighbors: [number, number][][][] = [];
  for (let r = 0; r < rows; r++) {
    const row: [number, number][][] = [];
    for (let c = 0; c < cols; c++) {
      const n: [number, number][] = [];
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) n.push([nr, nc]);
        }
      }
      row.push(n);
    }
    neighbors.push(row);
  }

  return {
    rows,
    cols,
    groups,
    cellToGroup,
    neighbors,
    cellGroup: cageIds.map((row) => [...row]),
  };
}

/** An all-empty grid of the given size. */
function empty(rows: number, cols: number): number[][] {
  return Array.from({ length: rows }, () => Array(cols).fill(0));
}

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

describe('findHint — cage domination', () => {
  it('forces the inner corner of a 4-cell L to 5 (in a 5-cell cage)', () => {
    // g0 is an L-tetromino; g1 (size 5) wraps its inner corner (1,1),
    // which is king-adjacent to all four of g0 — so it can't be 1–4.
    const layout = makeLayout([
      [0, 1, 1],
      [0, 1, 1],
      [0, 0, 1],
    ]);
    const hint = findHint(empty(3, 3), layout);
    expect(hint).toMatchObject({
      row: 1,
      col: 1,
      value: 5,
      type: 'domination',
      // ADR-0015: the hint carries its candidate-note reasoning.
      notes: { kind: 'grid', survivor: 5, crossed: [1, 2, 3, 4] },
    });
  });

  it('forces the inner corner of a 3-cell L to 4 (in a 4-cell cage)', () => {
    // g0 is an L-tromino; g1 (size 4) holds its inner corner (0,1).
    const layout = makeLayout([
      [0, 1, 1],
      [0, 0, 1],
      [2, 2, 1],
    ]);
    const hint = findHint(empty(3, 3), layout);
    expect(hint).toMatchObject({
      row: 0,
      col: 1,
      value: 4,
      type: 'domination',
    });
  });

  it('reaches domination before any backtracking trial', () => {
    const layout = makeLayout([
      [0, 1, 1],
      [0, 1, 1],
      [0, 0, 1],
    ]);
    // A purely geometric deduction — never a contradiction-type hint.
    expect(findHint(empty(3, 3), layout)!.type).toBe('domination');
  });
});

describe('classifyMove — domination', () => {
  const layout = makeLayout([
    [0, 1, 1],
    [0, 1, 1],
    [0, 0, 1],
  ]);

  it('credits a domination move (the forced 5)', () => {
    expect(classifyMove(empty(3, 3), layout, 1, 1, 5)).toBe('domination');
  });

  it('gives no credit for a non-forced value in the same cell', () => {
    // 4 is a candidate of (1,1) but domination does not pin it down.
    expect(classifyMove(empty(3, 3), layout, 1, 1, 4)).toBeNull();
  });
});

describe('findHint — never suggests a wrong value', () => {
  it('solves easy and medium puzzles with correct hints only', () => {
    // 5×5 keeps the suite fast; the technique logic is size-independent.
    for (const size of [5] as const) {
      for (const diff of ['easy', 'medium'] as const) {
        const { layout, clues, solution } = generatePuzzle(size, size, diff);
        const grid = clues.map((row) => [...row]);
        const total = size * size;
        let placed = grid.flat().filter((v) => v !== 0).length;

        for (let step = 0; placed < total && step < total + 20; step++) {
          const hint = findHint(grid, layout);
          expect(hint).not.toBeNull();
          // Naked/hidden singles always pin a cell on these tiers.
          expect(hint!.value).toBe(solution[hint!.row][hint!.col]);
          grid[hint!.row][hint!.col] = hint!.value;
          placed++;
        }
        expect(placed).toBe(total);
      }
    }
  });

  it('only ever pins correct values on hard / expert puzzles', () => {
    // Exercises the domination, deductive and contradiction tiers —
    // every placement they surface must match the solution.
    for (const diff of ['hard', 'expert'] as const) {
      for (let attempt = 0; attempt < 3; attempt++) {
        const { layout, clues, solution } = generatePuzzle(5, 5, diff);
        const grid = clues.map((row) => [...row]);
        let placed = grid.flat().filter((v) => v !== 0).length;

        for (let step = 0; placed < 25 && step < 45; step++) {
          const hint = findHint(grid, layout);
          if (!hint || hint.value === 0) break; // can't auto-place further
          expect(grid[hint.row][hint.col]).toBe(0);
          expect(hint.value).toBe(solution[hint.row][hint.col]);
          // ADR-0015 notes script: a pair-elimination hint carries a
          // stepped walkthrough; the single-cell deductions a grid.
          if (hint.type === 'pair_elimination') {
            expect(hint.notes?.kind).toMatch(/steps|answer/);
          } else if (hint.type === 'naked_single' || hint.type === 'domination') {
            expect(hint.notes?.kind).toBe('grid');
          }
          grid[hint.row][hint.col] = hint.value;
          placed++;
        }
      }
    }
  });
});

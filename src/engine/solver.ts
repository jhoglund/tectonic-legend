import type { PuzzleLayout } from './types';
import { getNeighbors } from './validator';

export interface SolveResult {
  solved: boolean;
  grid: number[][];
  techniques: SolveTechnique[];
}

export type SolveTechnique = 'naked_single' | 'hidden_single' | 'backtrack';

/**
 * Solve a Tectonic puzzle using constraint propagation + backtracking.
 */
export function solve(
  layout: PuzzleLayout,
  clues: number[][],
  options: { randomize?: boolean } = {}
): SolveResult {
  const { rows, cols, groups } = layout;
  const techniques = new Set<SolveTechnique>();

  const candidates: Set<number>[][] = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => new Set<number>())
  );

  const neighborCache: [number, number][][][] = Array.from(
    { length: rows },
    (_, r) =>
      Array.from({ length: cols }, (_, c) => getNeighbors(r, c, rows, cols))
  );

  const cellGroup: number[][] = Array.from({ length: rows }, () =>
    Array(cols).fill(-1)
  );
  for (const group of groups) {
    for (const { row, col } of group.cells) {
      cellGroup[row][col] = group.id;
    }
  }

  const grid: number[][] = Array.from({ length: rows }, () =>
    Array(cols).fill(0)
  );

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const groupId = cellGroup[r][c];
      const groupSize = groups[groupId].cells.length;
      for (let v = 1; v <= groupSize; v++) {
        candidates[r][c].add(v);
      }
    }
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (clues[r][c] !== 0) {
        if (!assign(r, c, clues[r][c])) {
          return { solved: false, grid, techniques: [...techniques] };
        }
      }
    }
  }

  if (!propagate()) {
    return { solved: false, grid, techniques: [...techniques] };
  }

  if (isComplete()) {
    return { solved: true, grid, techniques: [...techniques] };
  }

  techniques.add('backtrack');
  const result = backtrack();
  return { solved: result, grid, techniques: [...techniques] };

  function assign(r: number, c: number, val: number): boolean {
    grid[r][c] = val;
    candidates[r][c].clear();

    for (const [nr, nc] of neighborCache[r][c]) {
      candidates[nr][nc].delete(val);
      if (grid[nr][nc] === 0 && candidates[nr][nc].size === 0) return false;
    }

    const groupId = cellGroup[r][c];
    for (const cell of groups[groupId].cells) {
      if (cell.row === r && cell.col === c) continue;
      candidates[cell.row][cell.col].delete(val);
      if (
        grid[cell.row][cell.col] === 0 &&
        candidates[cell.row][cell.col].size === 0
      )
        return false;
    }

    return true;
  }

  function propagate(): boolean {
    let changed = true;
    while (changed) {
      changed = false;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (grid[r][c] !== 0) continue;
          if (candidates[r][c].size === 0) return false;
          if (candidates[r][c].size === 1) {
            const val = [...candidates[r][c]][0];
            techniques.add('naked_single');
            if (!assign(r, c, val)) return false;
            changed = true;
          }
        }
      }

      for (const group of groups) {
        const size = group.cells.length;
        for (let v = 1; v <= size; v++) {
          const possible = group.cells.filter(
            ({ row, col }) =>
              grid[row][col] === v ||
              (grid[row][col] === 0 && candidates[row][col].has(v))
          );
          if (possible.length === 0) return false;
          if (
            possible.length === 1 &&
            grid[possible[0].row][possible[0].col] === 0
          ) {
            techniques.add('hidden_single');
            if (!assign(possible[0].row, possible[0].col, v)) return false;
            changed = true;
          }
        }
      }
    }
    return true;
  }

  function isComplete(): boolean {
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (grid[r][c] === 0) return false;
      }
    }
    return true;
  }

  function backtrack(): boolean {
    let minSize = Infinity;
    let bestR = -1;
    let bestC = -1;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (grid[r][c] === 0 && candidates[r][c].size < minSize) {
          minSize = candidates[r][c].size;
          bestR = r;
          bestC = c;
        }
      }
    }

    if (bestR === -1) return true;
    if (minSize === 0) return false;

    const savedGrid = grid.map((row) => [...row]);
    const savedCandidates = candidates.map((row) =>
      row.map((s) => new Set(s))
    );

    let vals = [...candidates[bestR][bestC]];
    if (options.randomize) {
      for (let i = vals.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [vals[i], vals[j]] = [vals[j], vals[i]];
      }
    }

    for (const val of vals) {
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          grid[r][c] = savedGrid[r][c];
          candidates[r][c] = new Set(savedCandidates[r][c]);
        }
      }

      if (assign(bestR, bestC, val) && propagate() && backtrack()) {
        return true;
      }
    }

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        grid[r][c] = savedGrid[r][c];
        candidates[r][c] = new Set(savedCandidates[r][c]);
      }
    }

    return false;
  }
}

/**
 * Count solutions (up to limit) using constraint propagation + backtracking.
 */
export function countSolutions(
  layout: PuzzleLayout,
  clues: number[][],
  limit: number = 2
): number {
  const { rows, cols, groups } = layout;
  let count = 0;
  let backtracks = 0;
  const maxBacktracks = rows * cols * 200;

  const neighborCache: [number, number][][][] = Array.from(
    { length: rows },
    (_, r) =>
      Array.from({ length: cols }, (_, c) => getNeighbors(r, c, rows, cols))
  );

  const cellGroup: number[][] = Array.from({ length: rows }, () =>
    Array(cols).fill(-1)
  );
  for (const group of groups) {
    for (const { row, col } of group.cells) {
      cellGroup[row][col] = group.id;
    }
  }

  const grid: number[][] = Array.from({ length: rows }, () => Array(cols).fill(0));
  const candidates: Set<number>[][] = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => new Set<number>())
  );

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const groupSize = groups[cellGroup[r][c]].cells.length;
      for (let v = 1; v <= groupSize; v++) {
        candidates[r][c].add(v);
      }
    }
  }

  function assign(r: number, c: number, val: number): boolean {
    grid[r][c] = val;
    candidates[r][c].clear();
    for (const [nr, nc] of neighborCache[r][c]) {
      candidates[nr][nc].delete(val);
      if (grid[nr][nc] === 0 && candidates[nr][nc].size === 0) return false;
    }
    for (const cell of groups[cellGroup[r][c]].cells) {
      if (cell.row === r && cell.col === c) continue;
      candidates[cell.row][cell.col].delete(val);
      if (grid[cell.row][cell.col] === 0 && candidates[cell.row][cell.col].size === 0) return false;
    }
    return true;
  }

  function propagate(): boolean {
    let changed = true;
    while (changed) {
      changed = false;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (grid[r][c] !== 0) continue;
          if (candidates[r][c].size === 0) return false;
          if (candidates[r][c].size === 1) {
            if (!assign(r, c, [...candidates[r][c]][0])) return false;
            changed = true;
          }
        }
      }
      for (const group of groups) {
        for (let v = 1; v <= group.cells.length; v++) {
          const possible = group.cells.filter(
            ({ row, col }) => grid[row][col] === v || (grid[row][col] === 0 && candidates[row][col].has(v))
          );
          if (possible.length === 0) return false;
          if (possible.length === 1 && grid[possible[0].row][possible[0].col] === 0) {
            if (!assign(possible[0].row, possible[0].col, v)) return false;
            changed = true;
          }
        }
      }
    }
    return true;
  }

  // Initialize with clues
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (clues[r][c] !== 0) {
        if (!assign(r, c, clues[r][c])) return 0;
      }
    }
  }
  if (!propagate()) return 0;

  function isComplete(): boolean {
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (grid[r][c] === 0) return false;
      }
    }
    return true;
  }

  if (isComplete()) return 1;

  function search(): void {
    if (count >= limit || backtracks >= maxBacktracks) return;

    let minSize = Infinity;
    let bestR = -1;
    let bestC = -1;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (grid[r][c] === 0 && candidates[r][c].size < minSize) {
          minSize = candidates[r][c].size;
          bestR = r;
          bestC = c;
        }
      }
    }

    if (bestR === -1) { count++; return; }
    if (minSize === 0) return;

    const savedGrid = grid.map((row) => [...row]);
    const savedCandidates = candidates.map((row) => row.map((s) => new Set(s)));

    for (const val of [...candidates[bestR][bestC]]) {
      if (count >= limit || backtracks >= maxBacktracks) return;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          grid[r][c] = savedGrid[r][c];
          candidates[r][c] = new Set(savedCandidates[r][c]);
        }
      }

      if (assign(bestR, bestC, val) && propagate()) {
        if (isComplete()) {
          count++;
        } else {
          search();
        }
      }
      backtracks++;
    }

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        grid[r][c] = savedGrid[r][c];
        candidates[r][c] = new Set(savedCandidates[r][c]);
      }
    }
  }

  search();
  return count;
}

import type { PuzzleLayout } from './types';

/** Get all 8-directional neighbors of a cell */
export function getNeighbors(
  row: number,
  col: number,
  rows: number,
  cols: number
): [number, number][] {
  const result: [number, number][] = [];
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const nr = row + dr;
      const nc = col + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
        result.push([nr, nc]);
      }
    }
  }
  return result;
}

/** Build the neighbor lookup table for an entire grid */
export function buildNeighborCache(rows: number, cols: number): [number, number][][][] {
  return Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => getNeighbors(r, c, rows, cols))
  );
}

/** Build the cell-to-group lookup table */
export function buildCellGroupMap(rows: number, cols: number, groups: { id: number; cells: { row: number; col: number }[] }[]): number[][] {
  const cellGroup: number[][] = Array.from({ length: rows }, () => Array(cols).fill(-1));
  for (const group of groups) {
    for (const { row, col } of group.cells) {
      cellGroup[row][col] = group.id;
    }
  }
  return cellGroup;
}

/** Check which cells have errors in the current grid */
export function findErrors(
  grid: number[][],
  layout: PuzzleLayout,
  solution?: number[][],
  isClue?: boolean[][]
): boolean[][] {
  const { rows, cols, groups, neighbors } = layout;
  const errors: boolean[][] = Array.from({ length: rows }, () =>
    Array(cols).fill(false)
  );

  if (solution && isClue) {
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (grid[r][c] !== 0 && !isClue[r][c] && grid[r][c] !== solution[r][c]) {
          errors[r][c] = true;
        }
      }
    }
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === 0) continue;
      for (const [nr, nc] of neighbors[r][c]) {
        if (grid[nr][nc] !== 0 && grid[r][c] === grid[nr][nc]) {
          errors[r][c] = true;
          errors[nr][nc] = true;
        }
      }
    }
  }

  for (const group of groups) {
    const seen = new Map<number, [number, number][]>();
    for (const { row, col } of group.cells) {
      const val = grid[row][col];
      if (val === 0) continue;
      if (!seen.has(val)) seen.set(val, []);
      seen.get(val)!.push([row, col]);
    }
    for (const positions of seen.values()) {
      if (positions.length > 1) {
        for (const [r, c] of positions) {
          errors[r][c] = true;
        }
      }
    }
  }

  return errors;
}

/** Check if the grid is fully and correctly solved (accepts precomputed errors) */
export function isSolved(grid: number[][], layout: PuzzleLayout, precomputedErrors?: boolean[][]): boolean {
  const { rows, cols, groups } = layout;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === 0) return false;
    }
  }

  const errors = precomputedErrors ?? findErrors(grid, layout);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (errors[r][c]) return false;
    }
  }

  for (const group of groups) {
    const size = group.cells.length;
    const values = new Set(group.cells.map(({ row, col }) => grid[row][col]));
    for (let v = 1; v <= size; v++) {
      if (!values.has(v)) return false;
    }
  }

  return true;
}

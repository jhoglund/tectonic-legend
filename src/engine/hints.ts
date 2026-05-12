import type { PuzzleLayout } from './types';
import { posKey } from './types';
import { getNeighbors } from './validator';

export interface Hint {
  row: number;
  col: number;
  value: number;
  reason: string;
  type: 'naked_single' | 'hidden_single' | 'neighbor_elimination' | 'group_elimination';
}

/**
 * Compute candidate values for every empty cell based on the current grid state.
 */
function computeCandidates(
  grid: number[][],
  layout: PuzzleLayout
): Set<number>[][] {
  const { rows, cols, groups, cellToGroup } = layout;

  const candidates: Set<number>[][] = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => new Set<number>())
  );

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] !== 0) continue;

      const groupId = cellToGroup.get(posKey(r, c))!;
      const groupSize = groups[groupId].cells.length;

      // Start with all possible values for this group size
      for (let v = 1; v <= groupSize; v++) {
        candidates[r][c].add(v);
      }

      // Remove values already in the same group
      for (const cell of groups[groupId].cells) {
        if (grid[cell.row][cell.col] !== 0) {
          candidates[r][c].delete(grid[cell.row][cell.col]);
        }
      }

      // Remove values in adjacent cells (8-directional)
      for (const [nr, nc] of getNeighbors(r, c, rows, cols)) {
        if (grid[nr][nc] !== 0) {
          candidates[r][c].delete(grid[nr][nc]);
        }
      }
    }
  }

  return candidates;
}

/**
 * Find the next logical hint for the current board state.
 * Returns null if no logical deduction can be made.
 */
export function findHint(
  grid: number[][],
  layout: PuzzleLayout
): Hint | null {
  const { rows, cols, groups } = layout;
  const candidates = computeCandidates(grid, layout);

  // 1. Look for naked singles (cell with only one candidate)
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] !== 0) continue;
      if (candidates[r][c].size === 1) {
        const value = [...candidates[r][c]][0];
        const reason = buildNakedSingleReason(r, c, value, grid, layout);
        return { row: r, col: c, value, reason, type: 'naked_single' };
      }
    }
  }

  // 2. Look for hidden singles (value can only go in one cell in a group)
  for (const group of groups) {
    const size = group.cells.length;
    for (let v = 1; v <= size; v++) {
      // Skip if value already placed in group
      const alreadyPlaced = group.cells.some(
        ({ row, col }) => grid[row][col] === v
      );
      if (alreadyPlaced) continue;

      const possibleCells = group.cells.filter(
        ({ row, col }) => grid[row][col] === 0 && candidates[row][col].has(v)
      );

      if (possibleCells.length === 1) {
        const { row, col } = possibleCells[0];
        const reason = buildHiddenSingleReason(row, col, v, group, grid, layout, candidates);
        return { row, col, value: v, reason, type: 'hidden_single' };
      }
    }
  }

  return null;
}

function buildNakedSingleReason(
  r: number,
  c: number,
  value: number,
  grid: number[][],
  layout: PuzzleLayout
): string {
  const { rows, cols, groups, cellToGroup } = layout;
  const groupId = cellToGroup.get(posKey(r, c))!;
  const group = groups[groupId];
  const groupSize = group.cells.length;

  const eliminatedBy: string[] = [];

  for (let v = 1; v <= groupSize; v++) {
    if (v === value) continue;

    // Check if eliminated by group
    const inGroup = group.cells.find(
      ({ row, col }) => grid[row][col] === v
    );
    if (inGroup) {
      eliminatedBy.push(`${v} is already in this group`);
      continue;
    }

    // Check if eliminated by neighbor
    const neighbors = getNeighbors(r, c, rows, cols);
    const blockingNeighbor = neighbors.find(
      ([nr, nc]) => grid[nr][nc] === v
    );
    if (blockingNeighbor) {
      eliminatedBy.push(`${v} is in an adjacent cell`);
      continue;
    }
  }

  if (eliminatedBy.length <= 3) {
    return `This cell must be ${value} — ${eliminatedBy.join(', ')}.`;
  }
  return `This cell must be ${value} — all other values are eliminated by neighbors or group members.`;
}

function buildHiddenSingleReason(
  r: number,
  c: number,
  value: number,
  group: { id: number; cells: { row: number; col: number }[] },
  grid: number[][],
  layout: PuzzleLayout,
  candidates: Set<number>[][]
): string {
  const { rows, cols } = layout;
  const otherCells = group.cells.filter(
    ({ row, col }) =>
      !(row === r && col === c) && grid[row][col] === 0
  );

  const reasons: string[] = [];
  for (const { row, col } of otherCells) {
    if (!candidates[row][col].has(value)) {
      // Figure out why this cell can't have the value
      const neighbors = getNeighbors(row, col, rows, cols);
      const blockingNeighbor = neighbors.find(
        ([nr, nc]) => grid[nr][nc] === value
      );
      if (blockingNeighbor) {
        reasons.push(`(${row + 1},${col + 1}) can't be ${value} — blocked by adjacent ${value}`);
      }
    }
  }

  const groupCellCount = group.cells.length;
  if (reasons.length <= 2) {
    return `${value} must go here — it's the only cell in this ${groupCellCount}-cell group where ${value} can fit. ${reasons.join('. ')}.`;
  }
  return `${value} must go here — every other cell in this ${groupCellCount}-cell group is blocked from being ${value} by adjacent cells.`;
}

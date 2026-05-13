import type { PuzzleLayout } from './types';
import { findErrors } from './validator';

export interface Hint {
  row: number;
  col: number;
  value: number;
  reason: string;
  type: 'naked_single' | 'hidden_single' | 'candidates' | 'reveal' | 'check';
  candidates?: number[];
  errorCount?: number;
}

function computeCandidates(
  grid: number[][],
  layout: PuzzleLayout
): Set<number>[][] {
  const { rows, cols, groups, cellGroup, neighbors } = layout;

  const candidates: Set<number>[][] = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => new Set<number>())
  );

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] !== 0) continue;

      const groupId = cellGroup[r][c];
      const groupSize = groups[groupId].cells.length;

      for (let v = 1; v <= groupSize; v++) {
        candidates[r][c].add(v);
      }

      for (const cell of groups[groupId].cells) {
        if (grid[cell.row][cell.col] !== 0) {
          candidates[r][c].delete(grid[cell.row][cell.col]);
        }
      }

      for (const [nr, nc] of neighbors[r][c]) {
        if (grid[nr][nc] !== 0) {
          candidates[r][c].delete(grid[nr][nc]);
        }
      }
    }
  }

  return candidates;
}

export function findHint(
  grid: number[][],
  layout: PuzzleLayout
): Hint | null {
  const { rows, cols, groups } = layout;
  const candidates = computeCandidates(grid, layout);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] !== 0) continue;
      if (candidates[r][c].size === 1) {
        const value = candidates[r][c].values().next().value!;
        const reason = buildNakedSingleReason(r, c, value, grid, layout);
        return { row: r, col: c, value, reason, type: 'naked_single' };
      }
    }
  }

  for (const group of groups) {
    const size = group.cells.length;
    for (let v = 1; v <= size; v++) {
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
  const { groups, cellGroup, neighbors } = layout;
  const groupId = cellGroup[r][c];
  const group = groups[groupId];
  const groupSize = group.cells.length;

  const eliminatedBy: string[] = [];

  for (let v = 1; v <= groupSize; v++) {
    if (v === value) continue;

    const inGroup = group.cells.find(
      ({ row, col }) => grid[row][col] === v
    );
    if (inGroup) {
      eliminatedBy.push(`${v} is already in this group`);
      continue;
    }

    const blockingNeighbor = neighbors[r][c].find(
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
  const { neighbors } = layout;
  const otherCells = group.cells.filter(
    ({ row, col }) =>
      !(row === r && col === c) && grid[row][col] === 0
  );

  const reasons: string[] = [];
  for (const { row, col } of otherCells) {
    if (!candidates[row][col].has(value)) {
      const blockingNeighbor = neighbors[row][col].find(
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

export function findCandidatesHint(
  grid: number[][],
  layout: PuzzleLayout,
  row: number,
  col: number
): Hint | null {
  if (grid[row][col] !== 0) {
    return { row, col, value: 0, reason: 'This cell already has a value.', type: 'candidates' };
  }
  const candidates = computeCandidates(grid, layout);
  const vals = [...candidates[row][col]].sort();
  if (vals.length === 0) {
    return { row, col, value: 0, reason: 'No valid candidates — there may be an error on the board.', type: 'candidates', candidates: [] };
  }
  return {
    row,
    col,
    value: 0,
    reason: `Possible values: ${vals.join(', ')}`,
    type: 'candidates',
    candidates: vals,
  };
}

export function findRevealHint(
  solution: number[][],
  grid: number[][],
  row: number,
  col: number
): Hint {
  const value = solution[row][col];
  if (grid[row][col] === value) {
    return { row, col, value, reason: 'This cell already has the correct value.', type: 'reveal' };
  }
  return { row, col, value, reason: `The answer for this cell is ${value}.`, type: 'reveal' };
}

export function findCheckHint(
  grid: number[][],
  layout: PuzzleLayout,
  solution?: number[][],
  isClue?: boolean[][]
): Hint | null {
  const errors = findErrors(grid, layout, solution, isClue);
  let errorCount = 0;
  for (let r = 0; r < errors.length; r++) {
    for (let c = 0; c < errors[r].length; c++) {
      if (errors[r][c]) errorCount++;
    }
  }
  if (errorCount === 0) {
    return { row: -1, col: -1, value: 0, reason: 'No errors found — looking good!', type: 'check', errorCount: 0 };
  }
  return { row: -1, col: -1, value: 0, reason: `Found ${errorCount} cell${errorCount > 1 ? 's' : ''} with errors.`, type: 'check', errorCount };
}

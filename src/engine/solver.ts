import type { PuzzleLayout } from './types';

export interface SolveResult {
  solved: boolean;
  grid: number[][];
  techniques: SolveTechnique[];
  /** Dead-end branches the search abandoned — a proxy for how much
   *  guess-and-check the puzzle demands. 0 = pure logic, no search. */
  backtracks: number;
}

export type SolveTechnique = 'naked_single' | 'hidden_single' | 'backtrack';

type UndoEntry = { r: number; c: number; prevVal: number; prevCands: Set<number>; removed: [number, number, number][] };

/**
 * Solve a Tectonic puzzle using constraint propagation + backtracking.
 */
export function solve(
  layout: PuzzleLayout,
  clues: number[][],
  options: { randomize?: boolean } = {}
): SolveResult {
  const { rows, cols, groups, neighbors, cellGroup } = layout;
  const techniques = new Set<SolveTechnique>();
  // Dead-end branches abandoned during search — see SolveResult.
  let backtracks = 0;

  const candidates: Set<number>[][] = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => new Set<number>())
  );

  const grid: number[][] = Array.from({ length: rows }, () =>
    Array(cols).fill(0)
  );

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const groupSize = groups[cellGroup[r][c]].cells.length;
      for (let v = 1; v <= groupSize; v++) {
        candidates[r][c].add(v);
      }
    }
  }

  const undoStack: UndoEntry[] = [];

  function assign(r: number, c: number, val: number): boolean {
    const entry: UndoEntry = { r, c, prevVal: grid[r][c], prevCands: new Set(candidates[r][c]), removed: [] };
    undoStack.push(entry);

    grid[r][c] = val;
    candidates[r][c].clear();

    for (const [nr, nc] of neighbors[r][c]) {
      if (candidates[nr][nc].has(val)) {
        candidates[nr][nc].delete(val);
        entry.removed.push([nr, nc, val]);
        if (grid[nr][nc] === 0 && candidates[nr][nc].size === 0) return false;
      }
    }

    for (const cell of groups[cellGroup[r][c]].cells) {
      if (cell.row === r && cell.col === c) continue;
      if (candidates[cell.row][cell.col].has(val)) {
        candidates[cell.row][cell.col].delete(val);
        entry.removed.push([cell.row, cell.col, val]);
        if (grid[cell.row][cell.col] === 0 && candidates[cell.row][cell.col].size === 0) return false;
      }
    }

    return true;
  }

  function undoTo(mark: number): void {
    while (undoStack.length > mark) {
      const entry = undoStack.pop()!;
      grid[entry.r][entry.c] = entry.prevVal;
      candidates[entry.r][entry.c] = entry.prevCands;
      for (const [nr, nc, val] of entry.removed) {
        candidates[nr][nc].add(val);
      }
    }
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
            const val = candidates[r][c].values().next().value!;
            techniques.add('naked_single');
            if (!assign(r, c, val)) return false;
            changed = true;
          }
        }
      }

      for (const group of groups) {
        const size = group.cells.length;
        for (let v = 1; v <= size; v++) {
          let count = 0;
          let lastR = -1;
          let lastC = -1;
          let placed = false;
          for (const { row, col } of group.cells) {
            if (grid[row][col] === v) { placed = true; break; }
            if (grid[row][col] === 0 && candidates[row][col].has(v)) {
              count++;
              lastR = row;
              lastC = col;
            }
          }
          if (placed) continue;
          if (count === 0) return false;
          if (count === 1) {
            techniques.add('hidden_single');
            if (!assign(lastR, lastC, v)) return false;
            changed = true;
          }
        }
      }
    }
    return true;
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (clues[r][c] !== 0) {
        if (!assign(r, c, clues[r][c])) {
          return { solved: false, grid, techniques: [...techniques], backtracks };
        }
      }
    }
  }

  if (!propagate()) {
    return { solved: false, grid, techniques: [...techniques], backtracks };
  }

  if (isComplete()) {
    return { solved: true, grid, techniques: [...techniques], backtracks };
  }

  techniques.add('backtrack');
  const result = backtrack();
  return { solved: result, grid, techniques: [...techniques], backtracks };

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

    const vals = [...candidates[bestR][bestC]];
    if (options.randomize) {
      for (let i = vals.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [vals[i], vals[j]] = [vals[j], vals[i]];
      }
    }

    for (const val of vals) {
      const mark = undoStack.length;
      if (assign(bestR, bestC, val) && propagate() && backtrack()) {
        return true;
      }
      undoTo(mark);
      backtracks++;
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
  const { rows, cols, groups, neighbors, cellGroup } = layout;
  let count = 0;
  let backtracks = 0;
  const maxBacktracks = rows * cols * 200;

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

  const undoStack: UndoEntry[] = [];

  function assign(r: number, c: number, val: number): boolean {
    const entry: UndoEntry = { r, c, prevVal: grid[r][c], prevCands: new Set(candidates[r][c]), removed: [] };
    undoStack.push(entry);

    grid[r][c] = val;
    candidates[r][c].clear();

    for (const [nr, nc] of neighbors[r][c]) {
      if (candidates[nr][nc].has(val)) {
        candidates[nr][nc].delete(val);
        entry.removed.push([nr, nc, val]);
        if (grid[nr][nc] === 0 && candidates[nr][nc].size === 0) return false;
      }
    }
    for (const cell of groups[cellGroup[r][c]].cells) {
      if (cell.row === r && cell.col === c) continue;
      if (candidates[cell.row][cell.col].has(val)) {
        candidates[cell.row][cell.col].delete(val);
        entry.removed.push([cell.row, cell.col, val]);
        if (grid[cell.row][cell.col] === 0 && candidates[cell.row][cell.col].size === 0) return false;
      }
    }
    return true;
  }

  function undoTo(mark: number): void {
    while (undoStack.length > mark) {
      const entry = undoStack.pop()!;
      grid[entry.r][entry.c] = entry.prevVal;
      candidates[entry.r][entry.c] = entry.prevCands;
      for (const [nr, nc, val] of entry.removed) {
        candidates[nr][nc].add(val);
      }
    }
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
            if (!assign(r, c, candidates[r][c].values().next().value!)) return false;
            changed = true;
          }
        }
      }
      for (const group of groups) {
        for (let v = 1; v <= group.cells.length; v++) {
          let cnt = 0;
          let lastR = -1;
          let lastC = -1;
          let placed = false;
          for (const { row, col } of group.cells) {
            if (grid[row][col] === v) { placed = true; break; }
            if (grid[row][col] === 0 && candidates[row][col].has(v)) {
              cnt++;
              lastR = row;
              lastC = col;
            }
          }
          if (placed) continue;
          if (cnt === 0) return false;
          if (cnt === 1) {
            if (!assign(lastR, lastC, v)) return false;
            changed = true;
          }
        }
      }
    }
    return true;
  }

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

    for (const val of [...candidates[bestR][bestC]]) {
      if (count >= limit || backtracks >= maxBacktracks) return;

      const mark = undoStack.length;
      if (assign(bestR, bestC, val) && propagate()) {
        if (isComplete()) {
          count++;
        } else {
          search();
        }
      }
      undoTo(mark);
      backtracks++;
    }
  }

  search();
  return count;
}

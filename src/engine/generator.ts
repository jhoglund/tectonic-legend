import type { PuzzleLayout, Puzzle, Group, Position, Difficulty } from './types';
import { posKey } from './types';
import { solve, countSolutions } from './solver';
import { buildNeighborCache, buildCellGroupMap } from './validator';

/**
 * Generate a random group/cage layout for a grid using region-growing.
 */
export function generateLayout(
  rows: number,
  cols: number,
  maxGroupSize: number = 5,
  minGroupSize: number = 2
): PuzzleLayout {
  const assigned: number[][] = Array.from({ length: rows }, () =>
    Array(cols).fill(-1)
  );
  const groupCells: Position[][] = [];
  let groupId = 0;

  const allCells: [number, number][] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      allCells.push([r, c]);
    }
  }
  shuffle(allCells);

  for (const [r, c] of allCells) {
    if (assigned[r][c] !== -1) continue;

    const cells: Position[] = [{ row: r, col: c }];
    assigned[r][c] = groupId;

    const targetSize = randInt(minGroupSize, maxGroupSize);
    let frontier = getOrthogonalNeighbors(r, c, rows, cols).filter(
      ([nr, nc]) => assigned[nr][nc] === -1
    );

    while (cells.length < targetSize && frontier.length > 0) {
      shuffle(frontier);
      const [nr, nc] = frontier[0];

      if (assigned[nr][nc] !== -1) {
        frontier = frontier.filter(([fr, fc]) => !(fr === nr && fc === nc));
        continue;
      }

      cells.push({ row: nr, col: nc });
      assigned[nr][nc] = groupId;

      for (const [nnr, nnc] of getOrthogonalNeighbors(nr, nc, rows, cols)) {
        if (
          assigned[nnr][nnc] === -1 &&
          !frontier.some(([fr, fc]) => fr === nnr && fc === nnc)
        ) {
          frontier.push([nnr, nnc]);
        }
      }

      frontier = frontier.filter(([fr, fc]) => assigned[fr][fc] === -1);
    }

    groupCells.push(cells);
    groupId++;
  }

  // Merge undersized groups into adjacent groups
  let mergeNeeded = true;
  while (mergeNeeded) {
    mergeNeeded = false;
    for (let gid = 0; gid < groupCells.length; gid++) {
      if (groupCells[gid].length === 0 || groupCells[gid].length >= minGroupSize) continue;
      mergeNeeded = true;

      const mergedSize = groupCells[gid].length;
      let bestNeighborGroup = -1;
      let bestSize = Infinity;

      for (const cell of groupCells[gid]) {
        for (const [nr, nc] of getOrthogonalNeighbors(cell.row, cell.col, rows, cols)) {
          const nGroup = assigned[nr][nc];
          if (nGroup !== gid && groupCells[nGroup].length > 0
            && groupCells[nGroup].length + mergedSize <= maxGroupSize
            && groupCells[nGroup].length < bestSize) {
            bestSize = groupCells[nGroup].length;
            bestNeighborGroup = nGroup;
          }
        }
      }

      if (bestNeighborGroup === -1) {
        for (const cell of groupCells[gid]) {
          for (const [nr, nc] of getOrthogonalNeighbors(cell.row, cell.col, rows, cols)) {
            const nGroup = assigned[nr][nc];
            if (nGroup !== gid && groupCells[nGroup].length > 0 && groupCells[nGroup].length < bestSize) {
              bestSize = groupCells[nGroup].length;
              bestNeighborGroup = nGroup;
            }
          }
        }
      }

      if (bestNeighborGroup !== -1) {
        for (const c of groupCells[gid]) {
          groupCells[bestNeighborGroup].push(c);
          assigned[c.row][c.col] = bestNeighborGroup;
        }
        groupCells[gid] = [];
      }
    }
  }

  const groups: Group[] = [];
  const oldToNew = new Map<number, number>();
  for (let gid = 0; gid < groupCells.length; gid++) {
    if (groupCells[gid].length === 0) continue;
    const newId = groups.length;
    oldToNew.set(gid, newId);
    groups.push({ id: newId, cells: groupCells[gid] });
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      assigned[r][c] = oldToNew.get(assigned[r][c])!;
    }
  }

  const cellToGroup = new Map<string, number>();
  for (const group of groups) {
    for (const { row, col } of group.cells) {
      cellToGroup.set(posKey(row, col), group.id);
    }
  }

  return {
    rows,
    cols,
    groups,
    cellToGroup,
    neighbors: buildNeighborCache(rows, cols),
    cellGroup: buildCellGroupMap(rows, cols, groups),
  };
}

/**
 * Generate a complete valid Tectonic puzzle.
 */
export function generatePuzzle(
  rows: number,
  cols: number,
  difficulty: Difficulty
): Puzzle {
  const isLarge = rows * cols > 50;
  const maxGroupSize = 5;
  const minGroupSize = isLarge ? 3 : 2;
  const deadline = Date.now() + (isLarge ? 30000 : 5000);
  for (let attempt = 0; Date.now() < deadline; attempt++) {
    const layout = generateLayout(rows, cols, maxGroupSize, minGroupSize);

    if (layout.groups.some(g => g.cells.length > maxGroupSize || g.cells.length < minGroupSize)) continue;

    const grid = fillGrid(layout);
    if (!grid) continue;

    const puzzle = carveClues(layout, grid, difficulty);
    if (puzzle) return puzzle;
  }

  throw new Error('Failed to generate puzzle — please try again');
}

type UndoEntry = { r: number; c: number; prevVal: number; prevCands: Set<number>; removed: [number, number, number][] };

function fillGrid(layout: PuzzleLayout): number[][] | null {
  const { rows, cols, groups, neighbors, cellGroup } = layout;

  const grid: number[][] = Array.from({ length: rows }, () => Array(cols).fill(0));
  const candidates: Set<number>[][] = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => new Set<number>())
  );

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const gs = groups[cellGroup[r][c]].cells.length;
      for (let v = 1; v <= gs; v++) candidates[r][c].add(v);
    }
  }

  let backtracks = 0;
  const maxBacktracks = rows * cols * 500;
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

  if (!propagate()) return null;

  function search(): boolean {
    if (backtracks > maxBacktracks) return false;

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
    shuffle(vals);

    for (const val of vals) {
      if (backtracks > maxBacktracks) return false;

      const mark = undoStack.length;
      if (assign(bestR, bestC, val) && propagate() && search()) {
        return true;
      }
      undoTo(mark);
      backtracks++;
    }

    return false;
  }

  return search() ? grid : null;
}

function carveClues(
  layout: PuzzleLayout,
  solution: number[][],
  difficulty: Difficulty
): Puzzle | null {
  const { rows, cols } = layout;
  const clues = solution.map((row) => [...row]);
  const isLarge = rows * cols > 50;

  const positions: [number, number][] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      positions.push([r, c]);
    }
  }
  shuffle(positions);

  const totalCells = rows * cols;
  const targetClues = isLarge
    ? { easy: Math.ceil(totalCells * 0.58), medium: Math.ceil(totalCells * 0.48), hard: Math.ceil(totalCells * 0.38) }[difficulty]
    : { easy: Math.ceil(totalCells * 0.52), medium: Math.ceil(totalCells * 0.40), hard: Math.ceil(totalCells * 0.28) }[difficulty];

  let currentClueCount = totalCells;

  for (const [r, c] of positions) {
    if (currentClueCount <= targetClues) break;
    if (clues[r][c] === 0) continue;

    const saved = clues[r][c];
    clues[r][c] = 0;

    if (countSolutions(layout, clues, 2) === 1) {
      currentClueCount--;
      continue;
    }

    clues[r][c] = saved;
  }

  const check = solve(layout, clues);
  if (!check.solved) return null;

  const usedBacktrack = check.techniques.includes('backtrack');
  if (difficulty === 'easy' && usedBacktrack && !isLarge) return null;

  return { layout, clues, solution };
}

function getOrthogonalNeighbors(
  row: number,
  col: number,
  rows: number,
  cols: number
): [number, number][] {
  const result: [number, number][] = [];
  if (row > 0) result.push([row - 1, col]);
  if (row < rows - 1) result.push([row + 1, col]);
  if (col > 0) result.push([row, col - 1]);
  if (col < cols - 1) result.push([row, col + 1]);
  return result;
}

function shuffle<T>(arr: T[]): void {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

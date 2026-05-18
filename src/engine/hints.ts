import type { PuzzleLayout } from './types';
import { findErrors } from './validator';

export interface HintChainEntry {
  row: number;
  col: number;
  value: number;
  role: 'target' | 'assumption' | 'deduction' | 'contradiction' | 'conclusion' | 'info';
  text: string;
}

export interface Hint {
  row: number;
  col: number;
  value: number;
  reason: string;
  type:
    | 'naked_single'
    | 'hidden_single'
    | 'domination'
    | 'contradiction'
    | 'candidates'
    | 'reveal'
    | 'check';
  candidates?: number[];
  errorCount?: number;
  steps?: string[];
  chain?: HintChainEntry[];
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

  const domination = findDominationHint(grid, layout, candidates);
  if (domination) return domination;

  return findContradictionHint(grid, layout, candidates);
}

/**
 * Cage domination — specs/solving-techniques.md §4. When an empty cell
 * is king-adjacent to *every* cell of some other cage of size N, that
 * cage is guaranteed to hold the whole set 1..N, so the cell cannot be
 * any of them. Returns the forced value and the dominating cage's size
 * when that elimination leaves exactly one candidate; otherwise null.
 *
 * This is pure geometry: it needs no filled-in numbers, only the cage
 * shapes — which is why it is favoured over a backtracking trial.
 */
function dominationFor(
  layout: PuzzleLayout,
  candidates: Set<number>[][],
  r: number,
  c: number,
): { value: number; cageSize: number } | null {
  const { cols, groups, cellGroup, neighbors } = layout;
  const cands = candidates[r][c];
  if (cands.size < 2) return null;

  const ring = new Set(neighbors[r][c].map(([nr, nc]) => nr * cols + nc));
  const ownGroup = cellGroup[r][c];

  for (const group of groups) {
    if (group.id === ownGroup) continue;
    const n = group.cells.length;
    if (n > ring.size) continue; // cage too large to fit the cell's ring
    const dominated = group.cells.every(({ row, col }) =>
      ring.has(row * cols + col),
    );
    if (!dominated) continue;

    // The cage holds 1..n and this cell sees all of them — rule them out.
    const remaining = [...cands].filter((v) => v > n);
    if (remaining.length === 1) {
      return { value: remaining[0], cageSize: n };
    }
  }
  return null;
}

function buildDominationReason(value: number, cageSize: number): string {
  const set = Array.from({ length: cageSize }, (_, i) => i + 1).join(', ');
  return (
    `This cell touches every cell of a ${cageSize}-cell cage, which must ` +
    `hold ${set} — so it can't be any of them. It must be ${value}.`
  );
}

/** Scan for the first cell a cage domination solves outright. */
function findDominationHint(
  grid: number[][],
  layout: PuzzleLayout,
  candidates: Set<number>[][],
): Hint | null {
  const { rows, cols } = layout;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] !== 0) continue;
      const dom = dominationFor(layout, candidates, r, c);
      if (dom) {
        return {
          row: r,
          col: c,
          value: dom.value,
          reason: buildDominationReason(dom.value, dom.cageSize),
          type: 'domination',
        };
      }
    }
  }
  return null;
}

interface DeductionStep {
  row: number;
  col: number;
  value: number;
  technique: 'naked_single' | 'hidden_single';
}

interface TrialResult {
  contradiction: boolean;
  steps: DeductionStep[];
  contradictionReason?: string;
}

function simulateTrial(
  grid: number[][],
  layout: PuzzleLayout,
  baseCandidates: Set<number>[][],
  trialRow: number,
  trialCol: number,
  trialValue: number
): TrialResult {
  const { rows, cols, groups, cellGroup, neighbors } = layout;
  const simGrid = grid.map((row) => [...row]);
  const simCands: Set<number>[][] = baseCandidates.map((row) =>
    row.map((s) => new Set(s))
  );
  const steps: DeductionStep[] = [];

  function simAssign(r: number, c: number, val: number): boolean {
    simGrid[r][c] = val;
    simCands[r][c].clear();
    for (const [nr, nc] of neighbors[r][c]) {
      simCands[nr][nc].delete(val);
      if (simGrid[nr][nc] === 0 && simCands[nr][nc].size === 0) return false;
    }
    for (const cell of groups[cellGroup[r][c]].cells) {
      if (cell.row === r && cell.col === c) continue;
      simCands[cell.row][cell.col].delete(val);
      if (simGrid[cell.row][cell.col] === 0 && simCands[cell.row][cell.col].size === 0) return false;
    }
    return true;
  }

  if (!simAssign(trialRow, trialCol, trialValue)) {
    return { contradiction: true, steps, contradictionReason: 'a neighbor loses all candidates' };
  }

  let changed = true;
  while (changed) {
    changed = false;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (simGrid[r][c] !== 0) continue;
        if (simCands[r][c].size === 0) {
          return {
            contradiction: true,
            steps,
            contradictionReason: `cell (${r + 1},${c + 1}) has no valid values left`,
          };
        }
        if (simCands[r][c].size === 1) {
          const val = simCands[r][c].values().next().value!;
          steps.push({ row: r, col: c, value: val, technique: 'naked_single' });
          if (!simAssign(r, c, val)) {
            return {
              contradiction: true,
              steps,
              contradictionReason: `placing ${val} at (${r + 1},${c + 1}) causes a conflict`,
            };
          }
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
          if (simGrid[row][col] === v) { placed = true; break; }
          if (simGrid[row][col] === 0 && simCands[row][col].has(v)) {
            count++;
            lastR = row;
            lastC = col;
          }
        }
        if (placed) continue;
        if (count === 0) {
          return {
            contradiction: true,
            steps,
            contradictionReason: `${v} has nowhere to go in a ${size}-cell group`,
          };
        }
        if (count === 1) {
          steps.push({ row: lastR, col: lastC, value: v, technique: 'hidden_single' });
          if (!simAssign(lastR, lastC, v)) {
            return {
              contradiction: true,
              steps,
              contradictionReason: `placing ${v} at (${lastR + 1},${lastC + 1}) causes a conflict`,
            };
          }
          changed = true;
        }
      }
    }
  }

  return { contradiction: false, steps };
}

interface TrialExplanation {
  texts: string[];
  chainEntries: HintChainEntry[];
}

function formatTrialExplanation(
  trialRow: number,
  trialCol: number,
  trialValue: number,
  result: TrialResult
): TrialExplanation {
  const texts: string[] = [];
  const chainEntries: HintChainEntry[] = [];

  texts.push(`Assume (${trialRow + 1},${trialCol + 1}) = ${trialValue}`);
  chainEntries.push({
    row: trialRow, col: trialCol, value: trialValue,
    role: 'assumption',
    text: `Assume this cell is ${trialValue}`,
  });

  const stepsToShow = result.steps.slice(0, 4);
  for (const step of stepsToShow) {
    const reason = step.technique === 'naked_single' ? 'only candidate' : 'only spot in group';
    texts.push(`→ (${step.row + 1},${step.col + 1}) is forced to ${step.value} (${reason})`);
    chainEntries.push({
      row: step.row, col: step.col, value: step.value,
      role: 'deduction',
      text: `This cell is forced to ${step.value} (${reason})`,
    });
  }
  if (result.steps.length > 4) {
    const extra = result.steps.slice(4);
    texts.push(`→ ...${extra.length} more forced moves...`);
    for (const step of extra) {
      const reason = step.technique === 'naked_single' ? 'only candidate' : 'only spot in group';
      chainEntries.push({
        row: step.row, col: step.col, value: step.value,
        role: 'deduction',
        text: `This cell is forced to ${step.value} (${reason})`,
      });
    }
  }

  texts.push(`→ Contradiction: ${result.contradictionReason!}`);
  chainEntries.push({
    row: trialRow, col: trialCol, value: trialValue,
    role: 'contradiction',
    text: `Contradiction! ${result.contradictionReason!}`,
  });

  texts.push(`So (${trialRow + 1},${trialCol + 1}) cannot be ${trialValue}.`);

  return { texts, chainEntries };
}

function tryEliminationsForCell(
  grid: number[][],
  layout: PuzzleLayout,
  candidates: Set<number>[][],
  cellR: number,
  cellC: number,
  maxDepth: number
): { eliminated: number[]; explanations: Map<number, TrialExplanation> } {
  const vals = [...candidates[cellR][cellC]];
  const eliminated: number[] = [];
  const explanations: Map<number, TrialExplanation> = new Map();

  for (const v of vals) {
    const result = simulateTrial(grid, layout, candidates, cellR, cellC, v);
    if (result.contradiction) {
      eliminated.push(v);
      explanations.set(v, formatTrialExplanation(cellR, cellC, v, result));
      continue;
    }

    if (maxDepth >= 2) {
      const { rows, cols } = layout;
      const simGrid = grid.map((row) => [...row]);
      const simCands: Set<number>[][] = candidates.map((row) => row.map((s) => new Set(s)));
      simGrid[cellR][cellC] = v;
      simCands[cellR][cellC] = new Set();
      for (const [nr, nc] of layout.neighbors[cellR][cellC]) {
        simCands[nr][nc].delete(v);
      }
      for (const cell of layout.groups[layout.cellGroup[cellR][cellC]].cells) {
        simCands[cell.row][cell.col].delete(v);
      }

      let propagated = true;
      let propChanged = true;
      while (propChanged) {
        propChanged = false;
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            if (simGrid[r][c] !== 0 || simCands[r][c].size !== 1) continue;
            const sv = simCands[r][c].values().next().value!;
            simGrid[r][c] = sv;
            simCands[r][c].clear();
            for (const [nr, nc] of layout.neighbors[r][c]) {
              simCands[nr][nc].delete(sv);
              if (simGrid[nr][nc] === 0 && simCands[nr][nc].size === 0) { propagated = false; break; }
            }
            if (!propagated) break;
            for (const cell of layout.groups[layout.cellGroup[r][c]].cells) {
              if (cell.row === r && cell.col === c) continue;
              simCands[cell.row][cell.col].delete(sv);
              if (simGrid[cell.row][cell.col] === 0 && simCands[cell.row][cell.col].size === 0) { propagated = false; break; }
            }
            if (!propagated) break;
            propChanged = true;
          }
          if (!propagated) break;
        }
        if (!propagated) break;
      }

      if (!propagated) {
        eliminated.push(v);
        const texts = [`Assume (${cellR + 1},${cellC + 1}) = ${v}`];
        const chainEntries: HintChainEntry[] = [{
          row: cellR, col: cellC, value: v, role: 'assumption',
          text: `Assume this cell is ${v}`,
        }];
        if (result.steps.length > 0) {
          texts.push(`→ ...after ${result.steps.length} forced move${result.steps.length > 1 ? 's' : ''}, a deeper contradiction is reached`);
          for (const step of result.steps) {
            const reason = step.technique === 'naked_single' ? 'only candidate' : 'only spot in group';
            chainEntries.push({
              row: step.row, col: step.col, value: step.value, role: 'deduction',
              text: `This cell is forced to ${step.value} (${reason})`,
            });
          }
        } else {
          texts.push(`→ After further analysis, this leads to a contradiction`);
        }
        chainEntries.push({
          row: cellR, col: cellC, value: v, role: 'contradiction',
          text: 'Contradiction! Deeper analysis shows this is impossible',
        });
        texts.push(`So (${cellR + 1},${cellC + 1}) cannot be ${v}.`);
        explanations.set(v, { texts, chainEntries });
        continue;
      }

      const subCells: [number, number, number][] = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (simGrid[r][c] === 0 && simCands[r][c].size >= 2) {
            subCells.push([r, c, simCands[r][c].size]);
          }
        }
      }
      subCells.sort((a, b) => a[2] - b[2]);

      let foundDeep = false;
      for (const [sr, sc] of subCells.slice(0, 8)) {
        for (const sv of simCands[sr][sc]) {
          const subResult = simulateTrial(simGrid, layout, simCands, sr, sc, sv);
          if (subResult.contradiction) {
            const allSubContradict = [...simCands[sr][sc]].every((sv2) => {
              if (sv2 === sv) return true;
              return simulateTrial(simGrid, layout, simCands, sr, sc, sv2).contradiction;
            });
            if (allSubContradict) {
              eliminated.push(v);
              const texts = [`Assume (${cellR + 1},${cellC + 1}) = ${v}`];
              const chainEntries: HintChainEntry[] = [{
                row: cellR, col: cellC, value: v, role: 'assumption',
                text: `Assume this cell is ${v}`,
              }];
              if (result.steps.length > 0) {
                texts.push(`→ ...${result.steps.length} forced move${result.steps.length > 1 ? 's' : ''} follow`);
                for (const step of result.steps) {
                  const reason = step.technique === 'naked_single' ? 'only candidate' : 'only spot in group';
                  chainEntries.push({
                    row: step.row, col: step.col, value: step.value, role: 'deduction',
                    text: `This cell is forced to ${step.value} (${reason})`,
                  });
                }
              }
              texts.push(`→ Then cell (${sr + 1},${sc + 1}) has candidates ${[...simCands[sr][sc]].join(', ')}, but every option leads to a contradiction`);
              chainEntries.push({
                row: sr, col: sc, value: 0, role: 'contradiction',
                text: `Every candidate here leads to a contradiction`,
              });
              texts.push(`So (${cellR + 1},${cellC + 1}) cannot be ${v}.`);
              explanations.set(v, { texts, chainEntries });
              foundDeep = true;
              break;
            }
          }
        }
        if (foundDeep) break;
      }
    }
  }

  return { eliminated, explanations };
}

function findContradictionHint(
  grid: number[][],
  layout: PuzzleLayout,
  candidates: Set<number>[][]
): Hint | null {
  const { rows, cols } = layout;

  const cells: [number, number, number][] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] !== 0) continue;
      const sz = candidates[r][c].size;
      if (sz > 1) cells.push([r, c, sz]);
    }
  }
  if (cells.length === 0) return null;
  cells.sort((a, b) => a[2] - b[2]);

  function buildResult(
    cellR: number,
    cellC: number,
    eliminated: number[],
    explanations: Map<number, TrialExplanation>
  ): Hint {
    const vals = [...candidates[cellR][cellC]];
    const remaining = vals.filter((v) => !eliminated.includes(v));

    const hintSteps: string[] = [];
    const chain: HintChainEntry[] = [];

    hintSteps.push(`Cell (${cellR + 1},${cellC + 1}) could be ${vals.join(', ')}.`);
    chain.push({
      row: cellR, col: cellC, value: 0, role: 'target',
      text: `This cell could be ${vals.join(', ')}`,
    });

    for (const v of eliminated) {
      const exp = explanations.get(v)!;
      hintSteps.push(...exp.texts);
      chain.push(...exp.chainEntries);
    }

    if (remaining.length === 1) {
      const answer = remaining[0];
      hintSteps.push(`Therefore (${cellR + 1},${cellC + 1}) must be ${answer}.`);
      chain.push({
        row: cellR, col: cellC, value: answer, role: 'conclusion',
        text: `Therefore this cell must be ${answer}`,
      });
      return {
        row: cellR, col: cellC, value: answer,
        reason: hintSteps.join('\n'), type: 'contradiction',
        steps: hintSteps, chain,
      };
    }

    hintSteps.push(`This eliminates ${eliminated.join(', ')}, leaving ${remaining.join(', ')} as possibilities.`);
    chain.push({
      row: cellR, col: cellC, value: 0, role: 'info',
      text: `Eliminates ${eliminated.join(', ')}, leaving ${remaining.join(', ')}`,
    });
    return {
      row: cellR, col: cellC, value: 0,
      reason: hintSteps.join('\n'), type: 'contradiction',
      steps: hintSteps, chain,
    };
  }

  let bestPartial: Hint | null = null;

  for (const maxDepth of [1, 2]) {
    for (const [cellR, cellC] of cells) {
      const { eliminated, explanations } = tryEliminationsForCell(
        grid, layout, candidates, cellR, cellC, maxDepth
      );
      if (eliminated.length === 0) continue;

      const vals = [...candidates[cellR][cellC]];
      const remaining = vals.filter((v) => !eliminated.includes(v));

      if (remaining.length === 1) {
        return buildResult(cellR, cellC, eliminated, explanations);
      }

      if (!bestPartial) {
        bestPartial = buildResult(cellR, cellC, eliminated, explanations);
      }
    }
  }

  return bestPartial;
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

/**
 * Classify a just-made move for self-applied mastery tracking
 * (progression.md §3). Given the grid *before* the move, was placing
 * `value` at (row, col) justified by a naked single (the cell's only
 * candidate), a hidden single (`value` fits only this cell of its
 * group), or a cage domination (the cell sees a whole cage's values)?
 * Returns null for moves no basic technique pins down — guesses, or
 * contradiction reasoning — which earn no self-applied credit.
 */
export function classifyMove(
  grid: number[][],
  layout: PuzzleLayout,
  row: number,
  col: number,
  value: number,
): 'naked_single' | 'hidden_single' | 'domination' | null {
  if (grid[row][col] !== 0) return null;
  const candidates = computeCandidates(grid, layout);
  const cands = candidates[row][col];
  if (!cands.has(value)) return null;
  if (cands.size === 1) return 'naked_single';

  const group = layout.groups[layout.cellGroup[row][col]];
  let fits = 0;
  for (const cell of group.cells) {
    if (
      grid[cell.row][cell.col] === 0 &&
      candidates[cell.row][cell.col].has(value)
    ) {
      fits++;
    }
  }
  if (fits === 1) return 'hidden_single';

  const dom = dominationFor(layout, candidates, row, col);
  return dom && dom.value === value ? 'domination' : null;
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

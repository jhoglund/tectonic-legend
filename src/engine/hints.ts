import type { PuzzleLayout, Difficulty } from './types';
import { findErrors } from './validator';

/** Column letter for a 0-based column — 0 → A, 1 → B … (chess / A1 style). */
export function columnLetter(col: number): string {
  return String.fromCharCode(65 + col);
}

/** A cell's player-facing label: column letter + 1-based row — e.g.
 *  row 2, col 2 → "C3". Used in every hint so the text lines up with
 *  the board's coordinate gutter; the hint UI renders these as
 *  clickable tokens (HintText). */
function cellLabel(row: number, col: number): string {
  return `${columnLetter(col)}${row + 1}`;
}

export interface HintChainEntry {
  row: number;
  col: number;
  value: number;
  role: 'target' | 'assumption' | 'deduction' | 'contradiction' | 'conclusion' | 'info';
  text: string;
}

/**
 * The on-board reasoning a deductive hint draws in its target cell
 * (ADR-0015). `grid` paints the cell's candidate notes — `crossed`
 * values struck through, `survivor` in the answer colour, anything not
 * in `present` left blank. `answer` just states the value, for a
 * hidden single (where the deduction is "this is its only home", not a
 * per-cell elimination).
 */
export type HintNotes =
  | {
      kind: 'grid';
      cageSize: number;
      present?: number[];
      crossed?: number[];
      survivor?: number;
    }
  | { kind: 'answer'; value: number }
  | {
      /** A pair-elimination walkthrough — each step strikes candidates
       *  off the cell with a reason; the board crosses them off
       *  cumulatively as the player steps. */
      kind: 'steps';
      cageSize: number;
      steps: { crossed: number[]; reason: string }[];
      survivor: number;
    };

export interface Hint {
  row: number;
  col: number;
  value: number;
  reason: string;
  type:
    | 'naked_single'
    | 'hidden_single'
    | 'domination'
    | 'pair_elimination'
    | 'contradiction'
    | 'candidates'
    | 'reveal'
    | 'check';
  candidates?: number[];
  errorCount?: number;
  steps?: string[];
  chain?: HintChainEntry[];
  /** Candidate-note reasoning drawn in the target cell (ADR-0015). */
  notes?: HintNotes;
  /** Constrained regions of empty cells the hint leans on — each a set
   *  of cells that collectively hold a known value-set. Drawn on the
   *  board as a blue value-set chip, distinct from the candidate-note
   *  grid (ADR-0016). The Forced move emits its dominating cage here. */
  regions?: HintRegion[];
}

/** A region of empty cells constrained to a known value-set. */
export interface HintRegion {
  cells: { row: number; col: number }[];
  set: number[];
}

/** A `grid` notes script: the cell's cage values, all but `survivor`
 *  struck through. Used by naked single, forced move, pair elimination. */
function answerGrid(
  layout: PuzzleLayout,
  row: number,
  col: number,
  survivor: number,
): HintNotes {
  const cageSize = layout.groups[layout.cellGroup[row][col]].cells.length;
  const crossed: number[] = [];
  for (let v = 1; v <= cageSize; v++) if (v !== survivor) crossed.push(v);
  return { kind: 'grid', cageSize, crossed, survivor };
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
        return {
          row: r, col: c, value, reason, type: 'naked_single',
          notes: answerGrid(layout, r, c, value),
        };
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
        return {
          row, col, value: v, reason, type: 'hidden_single',
          notes: { kind: 'answer', value: v },
        };
      }
    }
  }

  const domination = findDominationHint(grid, layout, candidates);
  if (domination) return domination;

  const deductive = findDeductiveHint(grid, layout, candidates);
  if (deductive) return deductive;

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
): { value: number; cageSize: number; cage: { row: number; col: number }[] } | null {
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
      return {
        value: remaining[0],
        cageSize: n,
        cage: group.cells.map(({ row, col }) => ({ row, col })),
      };
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
          notes: answerGrid(layout, r, c, dom.value),
          // The dominating cage, drawn as a value-set chip (ADR-0016).
          regions: [{
            cells: dom.cage,
            set: Array.from({ length: dom.cageSize }, (_, i) => i + 1),
          }],
        };
      }
    }
  }
  return null;
}

/* ------------------------------------------------------------------ *
 * Deductive eliminations — specs/solving-techniques.md §6–§7.
 *
 * Naked/hidden subsets and locked candidates ("sibling pairs") don't
 * place a value on their own; they strike candidates. findDeductiveHint
 * runs a candidate-elimination loop — it applies one sound strike at a
 * time and stops the instant a strike leaves a cell with one candidate,
 * or a value with one home in its cage. That is the placement surfaced.
 * ------------------------------------------------------------------ */

/** One candidate to strike, with a sentence describing why. */
interface Elimination {
  row: number;
  col: number;
  value: number;
  detail: string;
}

/** All k-sized combinations of `items` (k is small — 2 or 3). */
function combinations<T>(items: T[], k: number): T[][] {
  const out: T[][] = [];
  const pick = (start: number, combo: T[]): void => {
    if (combo.length === k) {
      out.push([...combo]);
      return;
    }
    for (let i = start; i < items.length; i++) {
      combo.push(items[i]);
      pick(i + 1, combo);
      combo.pop();
    }
  };
  pick(0, []);
  return out;
}

// (cell labels use the shared cellLabel helper defined near the top)

/** Join names as "A and B" / "A, B and C". */
function nameList(parts: string[]): string {
  if (parts.length <= 1) return parts.join('');
  return `${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}`;
}

/**
 * First strike justified by a naked subset (§6): k empty cells of a
 * cage whose candidates together span exactly k values — those values
 * are used up there, so every other cell of the cage loses them.
 */
function nakedSubsetElimination(
  grid: number[][],
  layout: PuzzleLayout,
  cands: Set<number>[][],
): Elimination | null {
  for (const group of layout.groups) {
    const open = group.cells.filter(
      ({ row, col }) => grid[row][col] === 0 && cands[row][col].size >= 2,
    );
    for (const k of [2, 3]) {
      if (open.length <= k) continue;
      const sized = open.filter(({ row, col }) => cands[row][col].size <= k);
      for (const combo of combinations(sized, k)) {
        const union = new Set<number>();
        for (const { row, col } of combo) {
          for (const v of cands[row][col]) union.add(v);
        }
        if (union.size !== k) continue;
        const inCombo = new Set(combo.map(({ row, col }) => `${row},${col}`));
        for (const { row, col } of open) {
          if (inCombo.has(`${row},${col}`)) continue;
          for (const v of union) {
            if (!cands[row][col].has(v)) continue;
            const names = combo.map(({ row: r, col: c }) => cellLabel(r, c));
            const vals = [...union].sort((a, b) => a - b).map(String);
            return {
              row,
              col,
              value: v,
              detail: `Cells ${nameList(names)} can only hold ${nameList(vals)} between them.`,
            };
          }
        }
      }
    }
  }
  return null;
}

/**
 * First strike justified by a hidden subset (§6): k values of a cage
 * that can land only in the same k cells — those cells are pinned to
 * those values and shed every other candidate.
 */
function hiddenSubsetElimination(
  grid: number[][],
  layout: PuzzleLayout,
  cands: Set<number>[][],
): Elimination | null {
  for (const group of layout.groups) {
    const size = group.cells.length;
    const open = group.cells.filter(({ row, col }) => grid[row][col] === 0);
    const spotsByValue = new Map<number, string[]>();
    for (let v = 1; v <= size; v++) {
      if (group.cells.some(({ row, col }) => grid[row][col] === v)) continue;
      const spots = open
        .filter(({ row, col }) => cands[row][col].has(v))
        .map(({ row, col }) => `${row},${col}`);
      if (spots.length >= 2) spotsByValue.set(v, spots);
    }
    const values = [...spotsByValue.keys()];
    for (const k of [2, 3]) {
      for (const combo of combinations(values, k)) {
        const cellSet = new Set<string>();
        for (const v of combo) {
          for (const key of spotsByValue.get(v)!) cellSet.add(key);
        }
        if (cellSet.size !== k) continue;
        const comboValues = new Set(combo);
        for (const key of cellSet) {
          const [r, c] = key.split(',').map(Number);
          for (const v of cands[r][c]) {
            if (comboValues.has(v)) continue;
            const names = [...cellSet].map((kk) => {
              const [rr, cc] = kk.split(',').map(Number);
              return cellLabel(rr, cc);
            });
            const vals = combo.slice().sort((a, b) => a - b).map(String);
            return {
              row: r,
              col: c,
              value: v,
              detail: `In one cage, ${nameList(vals)} can only go in cells ${nameList(names)}.`,
            };
          }
        }
      }
    }
  }
  return null;
}

/**
 * First strike justified by a locked candidate / sibling pair (§7): a
 * value confined to a set of cells within a cage, with an outside cell
 * king-adjacent to all of them — that outside cell cannot hold it.
 */
function lockedCandidateElimination(
  grid: number[][],
  layout: PuzzleLayout,
  cands: Set<number>[][],
): Elimination | null {
  const { groups, neighbors, cellGroup } = layout;
  for (const group of groups) {
    const size = group.cells.length;
    for (let v = 1; v <= size; v++) {
      if (group.cells.some(({ row, col }) => grid[row][col] === v)) continue;
      const spots = group.cells.filter(
        ({ row, col }) => grid[row][col] === 0 && cands[row][col].has(v),
      );
      if (spots.length < 2) continue; // one spot is a hidden single
      for (const [nr, nc] of neighbors[spots[0].row][spots[0].col]) {
        if (grid[nr][nc] !== 0) continue;
        if (cellGroup[nr][nc] === group.id) continue;
        if (!cands[nr][nc].has(v)) continue;
        const seesAll = spots.every(
          ({ row, col }) => Math.abs(row - nr) <= 1 && Math.abs(col - nc) <= 1,
        );
        if (!seesAll) continue;
        const names = spots.map(({ row, col }) => cellLabel(row, col));
        return {
          row: nr,
          col: nc,
          value: v,
          detail: `In one cage, ${v} can only go in ${nameList(names)}, and each of those touches ${cellLabel(nr, nc)}.`,
        };
      }
    }
  }
  return null;
}

/**
 * A `steps` notes script for a pair-elimination placement — replays the
 * eliminations that landed on cell (tr,tc), one step at a time, ending
 * on `placed` (specs/solving-techniques.md §7, ADR-0015).
 */
function elimSteps(
  layout: PuzzleLayout,
  candidates: Set<number>[][],
  log: Elimination[],
  tr: number,
  tc: number,
  placed: number,
): HintNotes {
  const cageSize = layout.groups[layout.cellGroup[tr][tc]].cells.length;
  const steps: { crossed: number[]; reason: string }[] = [];

  // Values already ruled out by filled cells before any deduction.
  const initial: number[] = [];
  for (let v = 1; v <= cageSize; v++) {
    if (!candidates[tr][tc].has(v)) initial.push(v);
  }
  if (initial.length > 0) {
    const verb = initial.length > 1 ? 'are' : 'is';
    steps.push({
      crossed: initial,
      reason:
        `${cellLabel(tr, tc)} starts open to 1–${cageSize}. ` +
        `${nameList(initial.map(String))} ${verb} already taken by a filled ` +
        `cell in the cage or next to it.`,
    });
  }

  // One step per strike that landed on the target cell, in order.
  const hits = log.filter((s) => s.row === tr && s.col === tc);
  hits.forEach((s, i) => {
    const last = i === hits.length - 1;
    steps.push({
      crossed: [s.value],
      reason: last
        ? `${s.detail} That leaves ${cellLabel(tr, tc)} with only ${placed}.`
        : s.detail,
    });
  });

  return { kind: 'steps', cageSize, steps, survivor: placed };
}

/**
 * Candidate-elimination loop over the deductive techniques (§6–§7).
 * Applies one sound strike at a time and returns the moment a strike
 * leaves a cell with one candidate, or a value with one home in its
 * cage. Returns null when no technique can strike further — the puzzle
 * is then left to the contradiction fallback.
 */
function findDeductiveHint(
  grid: number[][],
  layout: PuzzleLayout,
  candidates: Set<number>[][],
): Hint | null {
  const { groups, cellGroup } = layout;
  const cands = candidates.map((row) => row.map((s) => new Set(s)));
  // Every strike is recorded so the placement can replay, step by
  // step, the eliminations that landed on the cell it solves (§7).
  const log: Elimination[] = [];

  // Every pass strikes one candidate, so this bounds the loop well
  // above any real board's total candidate count.
  for (let guard = 0; guard < 4000; guard++) {
    const strike =
      nakedSubsetElimination(grid, layout, cands) ??
      hiddenSubsetElimination(grid, layout, cands) ??
      lockedCandidateElimination(grid, layout, cands);
    if (!strike) return null;

    const { row, col, value, detail } = strike;
    log.push(strike);
    cands[row][col].delete(value);
    if (cands[row][col].size === 0) return null; // board already inconsistent

    // The struck cell may now be a naked single.
    if (cands[row][col].size === 1) {
      const placed = [...cands[row][col]][0];
      return {
        row,
        col,
        value: placed,
        reason: `${detail} That leaves ${cellLabel(row, col)} with only ${placed}.`,
        type: 'pair_elimination',
        notes: elimSteps(layout, candidates, log, row, col, placed),
      };
    }

    // Or the struck value may now have a single home in its cage.
    const group = groups[cellGroup[row][col]];
    if (!group.cells.some(({ row: r, col: c }) => grid[r][c] === value)) {
      const homes = group.cells.filter(
        ({ row: r, col: c }) => grid[r][c] === 0 && cands[r][c].has(value),
      );
      if (homes.length === 0) return null; // inconsistent — leave it be
      if (homes.length === 1) {
        return {
          row: homes[0].row,
          col: homes[0].col,
          value,
          reason: `${detail} That makes ${cellLabel(homes[0].row, homes[0].col)} the only home for ${value} in its cage.`,
          type: 'pair_elimination',
          notes: { kind: 'answer', value },
        };
      }
    }
  }
  return null;
}

interface DeductionStep {
  id: number;
  row: number;
  col: number;
  value: number;
  technique: 'naked_single' | 'hidden_single';
  deps: number[];
}

interface TrialResult {
  contradiction: boolean;
  steps: DeductionStep[];
  contradictionReason?: string;
  /** The empty cell the contradiction strands with no value — so the
   *  hint can point the board highlight and the text at the same cell.
   *  Absent when the contradiction is a value with nowhere to go. */
  conflictCell?: { row: number; col: number };
  contradictionDeps?: number[];
}

type CandidateCauses = Map<number, number>[][];

function uniquePositiveIds(ids: Iterable<number | undefined>): number[] {
  return [...new Set([...ids].filter((id): id is number => id !== undefined && id >= 0))];
}

export function trimStepsToContradiction(result: TrialResult): DeductionStep[] {
  const needed = new Set(result.contradictionDeps ?? []);

  const byId = new Map(result.steps.map((step) => [step.id, step]));
  const stack = [...needed];
  while (stack.length > 0) {
    const id = stack.pop()!;
    const step = byId.get(id);
    if (!step) continue;
    for (const dep of step.deps) {
      if (!needed.has(dep)) {
        needed.add(dep);
        stack.push(dep);
      }
    }
  }

  return result.steps.filter((step) => needed.has(step.id));
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
  const causes: CandidateCauses = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => new Map<number, number>())
  );
  const steps: DeductionStep[] = [];
  let nextStepId = 1;
  // The empty cell a failed assignment strips of its last candidate —
  // simAssign records it so the contradiction can name the cell.
  let conflict: { row: number; col: number } | null = null;
  let conflictDeps: number[] = [];

  function candidateCause(r: number, c: number, val: number): number | undefined {
    return causes[r][c].get(val);
  }

  function recordRemoval(r: number, c: number, val: number, causeId: number): void {
    if (simGrid[r][c] !== 0 || !simCands[r][c].has(val)) return;
    simCands[r][c].delete(val);
    causes[r][c].set(val, causeId);
  }

  function noValueDeps(r: number, c: number): number[] {
    const groupSize = groups[cellGroup[r][c]].cells.length;
    return uniquePositiveIds(
      Array.from({ length: groupSize }, (_, i) => candidateCause(r, c, i + 1)),
    );
  }

  function nakedDeps(r: number, c: number, val: number): number[] {
    const groupSize = groups[cellGroup[r][c]].cells.length;
    return uniquePositiveIds(
      Array.from({ length: groupSize }, (_, i) => i + 1)
        .filter((candidate) => candidate !== val && !simCands[r][c].has(candidate))
        .map((candidate) => candidateCause(r, c, candidate)),
    );
  }

  function hiddenDeps(group: { cells: { row: number; col: number }[] }, val: number): number[] {
    return uniquePositiveIds(
      group.cells
        .filter(({ row, col }) => simGrid[row][col] === 0 && !simCands[row][col].has(val))
        .map(({ row, col }) => candidateCause(row, col, val)),
    );
  }

  function valueNowhereDeps(group: { cells: { row: number; col: number }[] }, val: number): number[] {
    return uniquePositiveIds(
      group.cells
        .filter(({ row, col }) => simGrid[row][col] === 0)
        .map(({ row, col }) => candidateCause(row, col, val)),
    );
  }

  function simAssign(r: number, c: number, val: number, causeId: number): boolean {
    simGrid[r][c] = val;
    simCands[r][c].clear();
    for (const [nr, nc] of neighbors[r][c]) {
      recordRemoval(nr, nc, val, causeId);
      if (simGrid[nr][nc] === 0 && simCands[nr][nc].size === 0) {
        conflict = { row: nr, col: nc };
        conflictDeps = noValueDeps(nr, nc);
        return false;
      }
    }
    for (const cell of groups[cellGroup[r][c]].cells) {
      if (cell.row === r && cell.col === c) continue;
      recordRemoval(cell.row, cell.col, val, causeId);
      if (simGrid[cell.row][cell.col] === 0 && simCands[cell.row][cell.col].size === 0) {
        conflict = { row: cell.row, col: cell.col };
        conflictDeps = noValueDeps(cell.row, cell.col);
        return false;
      }
    }
    return true;
  }

  /** Build the contradiction result for the cell stranded in `conflict`. */
  function cellConflict(): TrialResult {
    const cc = conflict!;
    return {
      contradiction: true,
      steps,
      conflictCell: cc,
      contradictionDeps: conflictDeps,
      contradictionReason: `${cellLabel(cc.row, cc.col)} has no value left`,
    };
  }

  if (!simAssign(trialRow, trialCol, trialValue, 0)) {
    return cellConflict();
  }

  let changed = true;
  while (changed) {
    changed = false;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (simGrid[r][c] !== 0) continue;
        if (simCands[r][c].size === 0) {
          conflict = { row: r, col: c };
          conflictDeps = noValueDeps(r, c);
          return cellConflict();
        }
        if (simCands[r][c].size === 1) {
          const val = simCands[r][c].values().next().value!;
          const id = nextStepId++;
          steps.push({ id, row: r, col: c, value: val, technique: 'naked_single', deps: nakedDeps(r, c, val) });
          if (!simAssign(r, c, val, id)) {
            return cellConflict();
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
            contradictionDeps: valueNowhereDeps(group, v),
            contradictionReason: `${v} has nowhere left to go in its cage`,
          };
        }
        if (count === 1) {
          const id = nextStepId++;
          steps.push({ id, row: lastR, col: lastC, value: v, technique: 'hidden_single', deps: hiddenDeps(group, v) });
          if (!simAssign(lastR, lastC, v, id)) {
            return cellConflict();
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

  texts.push(`Assume ${cellLabel(trialRow, trialCol)} = ${trialValue}`);
  chainEntries.push({
    row: trialRow, col: trialCol, value: trialValue,
    role: 'assumption',
    text: `Assume ${cellLabel(trialRow, trialCol)} is ${trialValue}.`,
  });

  const relevantSteps = trimStepsToContradiction(result);
  const stepsToShow = relevantSteps.slice(0, 4);
  for (const step of stepsToShow) {
    const reason = step.technique === 'naked_single' ? 'only candidate' : 'only spot in cage';
    texts.push(`→ ${cellLabel(step.row, step.col)} is forced to ${step.value} (${reason})`);
    chainEntries.push({
      row: step.row, col: step.col, value: step.value,
      role: 'deduction',
      text: `${cellLabel(step.row, step.col)} is then forced to ${step.value} — ${reason}.`,
    });
  }
  if (relevantSteps.length > 4) {
    const extra = relevantSteps.slice(4);
    texts.push(`→ ...${extra.length} more forced moves...`);
    for (const step of extra) {
      const reason = step.technique === 'naked_single' ? 'only candidate' : 'only spot in cage';
      chainEntries.push({
        row: step.row, col: step.col, value: step.value,
        role: 'deduction',
        text: `${cellLabel(step.row, step.col)} is then forced to ${step.value} — ${reason}.`,
      });
    }
  }

  texts.push(`→ Contradiction — ${result.contradictionReason!}`);
  const cc = result.conflictCell;
  chainEntries.push({
    row: cc ? cc.row : trialRow,
    col: cc ? cc.col : trialCol,
    value: 0,
    role: 'contradiction',
    text: `Contradiction — ${result.contradictionReason!}.`,
  });

  texts.push(`So ${cellLabel(trialRow, trialCol)} cannot be ${trialValue}.`);

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
        const texts = [`Assume ${cellLabel(cellR, cellC)} = ${v}`];
        const chainEntries: HintChainEntry[] = [{
          row: cellR, col: cellC, value: v, role: 'assumption',
          text: `Assume ${cellLabel(cellR, cellC)} is ${v}.`,
        }];
        const relevantSteps = trimStepsToContradiction(result);
        if (relevantSteps.length > 0) {
          texts.push(`→ ...after ${relevantSteps.length} forced move${relevantSteps.length > 1 ? 's' : ''}, a deeper contradiction is reached`);
          for (const step of relevantSteps) {
            const reason = step.technique === 'naked_single' ? 'only candidate' : 'only spot in cage';
            chainEntries.push({
              row: step.row, col: step.col, value: step.value, role: 'deduction',
              text: `${cellLabel(step.row, step.col)} is then forced to ${step.value} — ${reason}.`,
            });
          }
        } else {
          texts.push(`→ After further analysis, this leads to a contradiction`);
        }
        chainEntries.push({
          row: cellR, col: cellC, value: v, role: 'contradiction',
          text: `Contradiction — assuming ${cellLabel(cellR, cellC)} = ${v} breaks the board.`,
        });
        texts.push(`So ${cellLabel(cellR, cellC)} cannot be ${v}.`);
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
              const texts = [`Assume ${cellLabel(cellR, cellC)} = ${v}`];
              const chainEntries: HintChainEntry[] = [{
                row: cellR, col: cellC, value: v, role: 'assumption',
                text: `Assume ${cellLabel(cellR, cellC)} is ${v}.`,
              }];
              const relevantSteps = trimStepsToContradiction(result);
              if (relevantSteps.length > 0) {
                texts.push(`→ ...${relevantSteps.length} forced move${relevantSteps.length > 1 ? 's' : ''} follow`);
                for (const step of relevantSteps) {
                  const reason = step.technique === 'naked_single' ? 'only candidate' : 'only spot in cage';
                  chainEntries.push({
                    row: step.row, col: step.col, value: step.value, role: 'deduction',
                    text: `${cellLabel(step.row, step.col)} is then forced to ${step.value} — ${reason}.`,
                  });
                }
              }
              texts.push(`→ Then cell ${cellLabel(sr, sc)} has candidates ${[...simCands[sr][sc]].join(', ')}, but every option leads to a contradiction`);
              chainEntries.push({
                row: sr, col: sc, value: 0, role: 'contradiction',
                text: `Contradiction — every value for ${cellLabel(sr, sc)} fails.`,
              });
              texts.push(`So ${cellLabel(cellR, cellC)} cannot be ${v}.`);
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

    hintSteps.push(`Cell ${cellLabel(cellR, cellC)} could be ${vals.join(', ')}.`);
    chain.push({
      row: cellR, col: cellC, value: 0, role: 'target',
      text: `${cellLabel(cellR, cellC)} could be ${vals.join(' or ')}.`,
    });

    for (const v of eliminated) {
      const exp = explanations.get(v)!;
      hintSteps.push(...exp.texts);
      chain.push(...exp.chainEntries);
    }

    if (remaining.length === 1) {
      const answer = remaining[0];
      hintSteps.push(`Therefore ${cellLabel(cellR, cellC)} must be ${answer}.`);
      chain.push({
        row: cellR, col: cellC, value: answer, role: 'conclusion',
        text: `Therefore ${cellLabel(cellR, cellC)} must be ${answer}.`,
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
      text: `${cellLabel(cellR, cellC)} can't be ${eliminated.join(' or ')} — only ${remaining.join(' or ')} remain.`,
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
      eliminatedBy.push(`${v} is already in this cage`);
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
  return `This cell must be ${value} — all other values are eliminated by neighbours or cage-mates.`;
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
        reasons.push(`${cellLabel(row, col)} can't be ${value} — blocked by adjacent ${value}`);
      }
    }
  }

  const groupCellCount = group.cells.length;
  if (reasons.length <= 2) {
    return `${value} must go here — it's the only cell in this ${groupCellCount}-cell cage where ${value} can fit. ${reasons.join('. ')}.`;
  }
  return `${value} must go here — every other cell in this ${groupCellCount}-cell cage is blocked from being ${value} by adjacent cells.`;
}

/**
 * Classify a just-made move for self-applied mastery tracking
 * (progression.md §3). Given the grid *before* the move, was placing
 * `value` at (row, col) justified by a naked single (the cell's only
 * candidate), a hidden single (`value` fits only this cell of its
 * group), or a cage domination (the cell sees a whole cage's values)?
 * Returns null for moves no basic technique pins down — guesses,
 * contradiction reasoning, or the subset / locked-candidate techniques
 * (which are emitted as hints but not yet self-credited).
 */
export function classifyMove(
  grid: number[][],
  layout: PuzzleLayout,
  row: number,
  col: number,
  value: number,
): 'naked_single' | 'hidden_single' | 'domination' | 'pair_elimination' | null {
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
  if (dom && dom.value === value) return 'domination';

  // Pair-elimination self-credit (ADR-0018 / solving-techniques §11).
  // We rerun the deductive pass on the pre-move grid and check whether
  // its first placement pins this cell with this value. This catches
  // the common case (the deductive loop's first hit lands here) and is
  // honest about its limit — when the loop happens to pin a different
  // cell first, this move stays uncredited even if the same strikes
  // would also have pinned this cell. Refining is a follow-up; this is
  // the gating dependency for the pair-elimination chip ever reaching
  // `mastered` (and Legend stage 5).
  const deductive = findDeductiveHint(grid, layout, candidates);
  if (
    deductive &&
    deductive.row === row &&
    deductive.col === col &&
    deductive.value === value
  ) {
    return 'pair_elimination';
  }

  return null;
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
    notes: {
      kind: 'grid',
      cageSize: layout.groups[layout.cellGroup[row][col]].cells.length,
      present: vals,
    },
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

/** Hint technique → difficulty tier (1 easiest). The hardest tier a
 *  puzzle forces is its grade — specs/solving-techniques.md §3. */
const HINT_TIER: Record<Hint['type'], number> = {
  naked_single: 1,
  hidden_single: 2,
  domination: 3,
  pair_elimination: 3,
  contradiction: 4,
  candidates: 4,
  reveal: 4,
  check: 4,
};

/** Tier (1–4) → difficulty label; index 0 is an unused placeholder. */
const TIER_DIFFICULTY: Difficulty[] = ['easy', 'easy', 'medium', 'hard', 'expert'];

/**
 * Grade a puzzle by the hardest technique the hint engine needs to
 * solve it — progression.md §2, the original intent of that table.
 * Easy = naked singles only; Medium adds hidden singles; Hard adds
 * deductive technique (cage domination, subsets, locked candidates);
 * Expert needs contradiction reasoning. A puzzle the engine cannot
 * finish deductively is graded Expert — it sits at the ceiling of what
 * the engine can teach.
 *
 * The generator calls this instead of counting backtracks, so a
 * difficulty label means "needs this technique", not "stumped a weak
 * solver". Deterministic — `findHint` uses no randomness.
 */
export function gradeDifficulty(
  layout: PuzzleLayout,
  clues: number[][],
): Difficulty {
  const { rows, cols } = layout;
  const grid = clues.map((row) => [...row]);
  let remaining = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === 0) remaining++;
    }
  }

  let hardest = 1;
  while (remaining > 0) {
    const hint = findHint(grid, layout);
    if (!hint || hint.value === 0) {
      hardest = 4; // engine stalled — beyond its deductive + trial tiers
      break;
    }
    hardest = Math.max(hardest, HINT_TIER[hint.type]);
    if (hardest === 4) break; // Expert confirmed — no need to finish
    grid[hint.row][hint.col] = hint.value;
    remaining--;
  }
  return TIER_DIFFICULTY[hardest];
}

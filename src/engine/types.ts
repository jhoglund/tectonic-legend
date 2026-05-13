/** A position on the grid */
export interface Position {
  row: number;
  col: number;
}

/** A group/cage of cells that must contain 1..N */
export interface Group {
  id: number;
  cells: Position[];
}

/** The static structure of a puzzle (grid dimensions + group layout) */
export interface PuzzleLayout {
  rows: number;
  cols: number;
  groups: Group[];
  /** Map from "row,col" to group id for fast lookup */
  cellToGroup: Map<string, number>;
  /** Precomputed 8-directional neighbors per cell */
  neighbors: [number, number][][][];
  /** Precomputed group id per cell */
  cellGroup: number[][];
}

/** A puzzle to be solved: layout + initial clues */
export interface Puzzle {
  layout: PuzzleLayout;
  /** Clue values — 0 means empty */
  clues: number[][];
  /** The complete solution grid */
  solution: number[][];
}

/** Full game state */
export interface GameState {
  puzzle: Puzzle;
  /** Current cell values (player input + clues). 0 = empty */
  grid: number[][];
  /** Which cells are clues (not editable) */
  isClue: boolean[][];
  /** Pencil marks / candidates per cell */
  notes: Set<number>[][];
  /** Whether each cell has an error */
  errors: boolean[][];
  /** Is the puzzle completed correctly? */
  isSolved: boolean;
}

export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';
export type GridSize = '5x5' | '8x8';
export type HintMode = 'logic' | 'candidates' | 'reveal' | 'check';

export function posKey(row: number, col: number): string {
  return `${row},${col}`;
}

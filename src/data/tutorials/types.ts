/**
 * Tutorial fixture types. Tutorial puzzles bypass the procedural
 * generator — they are deterministic, hand-curated, and identical for
 * every player (specs/progression.md §4).
 */

/** One guided move: place `value` in (row, col), with a teaching note. */
export interface GuidedStep {
  row: number;
  col: number;
  value: number;
  /** Why this cell takes this value — shown while the step is active. */
  explanation: string;
}

/**
 * A curated tutorial puzzle. `cellGroups` + `solution` come from the
 * engine generator (so the board is provably valid); `steps` are the
 * cells left empty, in teaching order. Clues are derived: the solution
 * with every step cell cleared.
 */
export interface TutorialData {
  id: string;
  title: string;
  /** Shown once before the first step. */
  intro: string;
  rows: number;
  cols: number;
  /** Group id per cell. */
  cellGroups: number[][];
  /** The complete, valid solution grid. */
  solution: number[][];
  /** Empty cells, in the order the player fills them. */
  steps: GuidedStep[];
}

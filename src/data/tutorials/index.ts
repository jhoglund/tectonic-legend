import type { Group, Position, Puzzle, PuzzleLayout } from '../../engine/types';
import { posKey } from '../../engine/types';
import { buildNeighborCache, buildCellGroupMap } from '../../engine/validator';
import { TUTORIAL_FIXTURES } from './fixtures';
import type { GuidedStep, TutorialData } from './types';

export type { GuidedStep } from './types';

/** A tutorial ready to play — fixture data turned into an engine Puzzle. */
export interface Tutorial {
  id: string;
  title: string;
  intro: string;
  puzzle: Puzzle;
  steps: GuidedStep[];
}

/** Reassemble a full PuzzleLayout from a flat group-id grid. */
function buildLayout(rows: number, cols: number, cellGroups: number[][]): PuzzleLayout {
  const byId = new Map<number, Position[]>();
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const gid = cellGroups[r][c];
      if (!byId.has(gid)) byId.set(gid, []);
      byId.get(gid)!.push({ row: r, col: c });
    }
  }

  const groups: Group[] = [...byId.entries()]
    .map(([id, cells]) => ({ id, cells }))
    .sort((a, b) => a.id - b.id);

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

/** Turn one fixture into a playable Tutorial — clues are the solution
 *  with every guided-step cell cleared. */
function buildTutorial(data: TutorialData): Tutorial {
  const { rows, cols, cellGroups, solution, steps } = data;
  const layout = buildLayout(rows, cols, cellGroups);

  const stepCells = new Set(steps.map((s) => posKey(s.row, s.col)));
  const clues = solution.map((row, r) =>
    row.map((v, c) => (stepCells.has(posKey(r, c)) ? 0 : v)),
  );

  return {
    id: data.id,
    title: data.title,
    intro: data.intro,
    puzzle: { layout, clues, solution },
    steps,
  };
}

/** The three Newcomer tutorials, in play order (progression.md §4). */
export const NEWCOMER_TUTORIALS: Tutorial[] = TUTORIAL_FIXTURES.map(buildTutorial);

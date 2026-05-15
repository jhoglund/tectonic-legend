import type { PuzzleLayout } from '../engine/types';
import { posKey } from '../engine/types';

/** A cell edge is either a cage boundary, a within-cage line, or unset
 *  ('none' — the board container draws that outer frame instead). */
export type CellEdge = 'cage' | 'inner' | 'none';

export interface CellBorders {
  top: CellEdge;
  left: CellEdge;
}

/** Which border each cell paints on its top and left edge. Every internal
 *  grid line is owned by exactly one cell (the one below / to the right);
 *  the board container paints the outer frame, so row 0 / column 0 cells
 *  paint 'none' on their outer edge. */
export function computeBorders(
  row: number,
  col: number,
  layout: PuzzleLayout,
): CellBorders {
  const { cellToGroup } = layout;
  const myGroup = cellToGroup.get(posKey(row, col))!;

  const top: CellEdge =
    row === 0
      ? 'none'
      : cellToGroup.get(posKey(row - 1, col)) !== myGroup
        ? 'cage'
        : 'inner';

  const left: CellEdge =
    col === 0
      ? 'none'
      : cellToGroup.get(posKey(row, col - 1)) !== myGroup
        ? 'cage'
        : 'inner';

  return { top, left };
}

import type { PuzzleLayout } from '../engine/types';
import { posKey } from '../engine/types';

/** A cell edge is either a cage boundary, a within-cage line, or unset
 *  ('none' — the board container draws that outer frame instead). */
export type CellEdge = 'cage' | 'inner' | 'none';

export interface CellBorders {
  top: CellEdge;
  left: CellEdge;
  /** True when a cage boundary turns a corner exactly at the cell's
   *  top-left point, yet both of the cell's own edges there are `inner`
   *  — so neither cage segment reaches into this cell. The cell must
   *  paint a small cage-coloured patch to close the corner. */
  cornerTL: boolean;
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

  // The top-left corner is a cage corner this cell must close itself
  // only when both its edges are `inner` (so the up- and left-neighbours
  // share its cage) but the diagonal neighbour is a different cage —
  // the cage L turns the corner around that diagonal cell.
  const cornerTL =
    top === 'inner' &&
    left === 'inner' &&
    cellToGroup.get(posKey(row - 1, col - 1)) !== myGroup;

  return { top, left, cornerTL };
}

import type { PuzzleLayout } from '../engine/types';
import { posKey } from '../engine/types';

/** A cell edge is either a cage boundary, a within-cage line, or unset
 *  ('none' — no line drawn on that edge). */
export type CellEdge = 'cage' | 'inner' | 'none';

export interface CellBorders {
  top: CellEdge;
  left: CellEdge;
  /** Bottom / right are only set ('cage') on the board's last row /
   *  column — that is the outer frame. Interior horizontal and vertical
   *  lines are owned by the cell below / to the right (as its `top` /
   *  `left`), so interior cells leave these 'none'. */
  bottom: CellEdge;
  right: CellEdge;
  /** The actual edge type on the right / bottom side, regardless of
   *  which cell paints the line. 'cage' on the board frame or where the
   *  neighbour is in a different cage; 'inner' where the neighbour
   *  shares this cell's cage. Used by ring layers (selection, hint,
   *  region) to decide whether to draw a heavy ring on that edge or
   *  let the existing inner gridline show through. */
  rightEdge: 'cage' | 'inner';
  bottomEdge: 'cage' | 'inner';
  /** True when a cage boundary turns a corner exactly at the cell's
   *  top-left point, yet both of the cell's own edges there are `inner`
   *  — so neither cage segment reaches into this cell. The cell must
   *  paint a small cage-coloured patch to close the corner. */
  cornerTL: boolean;
  /** Which board corner this cell sits at, or null. A corner cell
   *  rounds that corner so its frame box-shadow follows the board's
   *  radius (the frame is drawn by the cell, not the container). */
  boardCorner: 'tl' | 'tr' | 'bl' | 'br' | null;
}

/**
 * Which border each cell paints. Each cell always paints its `top` and
 * `left`; the cells on the last row / column also paint the outer frame
 * as `bottom` / `right`. Drawing the frame on the cells themselves —
 * rather than as a border on the board container — lets a selected
 * edge cell's ring replace the frame cleanly, instead of stacking a
 * second border beside it.
 */
export function computeBorders(
  row: number,
  col: number,
  layout: PuzzleLayout,
): CellBorders {
  const { rows, cols, cellToGroup } = layout;
  const myGroup = cellToGroup.get(posKey(row, col))!;

  const top: CellEdge =
    row === 0
      ? 'cage'
      : cellToGroup.get(posKey(row - 1, col)) !== myGroup
        ? 'cage'
        : 'inner';

  const left: CellEdge =
    col === 0
      ? 'cage'
      : cellToGroup.get(posKey(row, col - 1)) !== myGroup
        ? 'cage'
        : 'inner';

  // The outer frame — only the last row / column draw it.
  const lastRow = row === rows - 1;
  const lastCol = col === cols - 1;
  const bottom: CellEdge = lastRow ? 'cage' : 'none';
  const right: CellEdge = lastCol ? 'cage' : 'none';

  // The actual right / bottom edge type, regardless of which cell paints
  // the line. Ring layers use this to skip 'inner' edges and let the
  // existing gridline show through.
  const rightEdge: 'cage' | 'inner' =
    lastCol || cellToGroup.get(posKey(row, col + 1)) !== myGroup
      ? 'cage'
      : 'inner';
  const bottomEdge: 'cage' | 'inner' =
    lastRow || cellToGroup.get(posKey(row + 1, col)) !== myGroup
      ? 'cage'
      : 'inner';

  const boardCorner: CellBorders['boardCorner'] =
    row === 0 && col === 0
      ? 'tl'
      : row === 0 && lastCol
        ? 'tr'
        : lastRow && col === 0
          ? 'bl'
          : lastRow && lastCol
            ? 'br'
            : null;

  // The top-left corner is a cage corner this cell must close itself
  // only when both its edges are `inner` (so the up- and left-neighbours
  // share its cage) but the diagonal neighbour is a different cage —
  // the cage L turns the corner around that diagonal cell.
  const cornerTL =
    top === 'inner' &&
    left === 'inner' &&
    cellToGroup.get(posKey(row - 1, col - 1)) !== myGroup;

  return { top, left, bottom, right, rightEdge, bottomEdge, cornerTL, boardCorner };
}

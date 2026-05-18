import { useMemo } from 'react';
import type { GameState, PuzzleLayout } from '../engine/types';
import { posKey } from '../engine/types';
import type { Hint } from '../engine/hints';
import { columnLetter } from '../engine/hints';
import { Cell } from './Cell';
import type { CellHighlight } from './Cell';
import { computeBorders } from './cellBorders';

function colorGroups(layout: PuzzleLayout): number[] {
  const { rows, cols, groups, cellToGroup } = layout;

  const adj = new Map<number, Set<number>>();
  for (const group of groups) {
    adj.set(group.id, new Set());
  }
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const gid = cellToGroup.get(posKey(r, c))!;
      for (const [dr, dc] of [[0, 1], [1, 0], [0, -1], [-1, 0]] as const) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
          const nid = cellToGroup.get(posKey(nr, nc))!;
          if (nid !== gid) adj.get(gid)!.add(nid);
        }
      }
    }
  }

  const colors = new Array(groups.length).fill(-1);
  for (const group of groups) {
    const usedByNeighbors = new Set<number>();
    for (const nid of adj.get(group.id)!) {
      if (colors[nid] !== -1) usedByNeighbors.add(colors[nid]);
    }
    let color = 0;
    while (usedByNeighbors.has(color)) color++;
    colors[group.id] = color;
  }
  return colors;
}

export interface CellOverlay {
  highlight: CellHighlight;
  ghostValue: number;
}

interface BoardProps {
  gameState: GameState;
  selectedCell: [number, number] | null;
  hint: Hint | null;
  cellOverlays: Map<string, CellOverlay> | null;
  onCellClick: (row: number, col: number) => void;
  /** Surface wrong entries in red. Off by default — validation is
   *  explicit (the Validate control), never live. */
  showErrors?: boolean;
  /** Draw a chess-style coordinate gutter (A–E columns, 1–5 rows)
   *  around the board — shown while a hint is open so its cell
   *  references are easy to locate. */
  showCoordinates?: boolean;
}

export function Board({
  gameState,
  selectedCell,
  hint,
  cellOverlays,
  onCellClick,
  showErrors = false,
  showCoordinates = false,
}: BoardProps) {
  const { puzzle, grid, isClue, notes, errors } = gameState;
  const { layout } = puzzle;
  const { rows, cols, groups, cellToGroup } = layout;

  const groupColors = useMemo(() => colorGroups(layout), [layout]);

  // The board grows to the full content width (solving-shapes
  // graduation, variant 11): equal `1fr` tracks, square cells. The
  // outer frame is drawn by the edge cells themselves (cellBorders),
  // not as a container border — so a selected edge cell's ring can
  // replace it cleanly. The radius still clips the corner cells.
  const boardGrid = (
    <div
      className="grid"
      style={{
        width: '100%',
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        borderRadius: 'var(--radius-card)',
        overflow: 'hidden',
      }}
    >
      {Array.from({ length: rows }, (_, r) =>
        Array.from({ length: cols }, (_, c) => {
          const groupId = cellToGroup.get(posKey(r, c))!;
          const groupSize = groups[groupId].cells.length;
          const borders = computeBorders(r, c, layout);
          const isSelected =
            selectedCell !== null &&
            selectedCell[0] === r &&
            selectedCell[1] === c;
          const isHinted =
            hint !== null && hint.row === r && hint.col === c;
          const key = posKey(r, c);
          const overlay = cellOverlays?.get(key) ?? null;
          const isDimmed = cellOverlays !== null && !cellOverlays.has(key);

          return (
            <Cell
              key={key}
              value={grid[r][c]}
              isClue={isClue[r][c]}
              isSelected={isSelected}
              isError={showErrors && errors[r][c]}
              isHinted={!cellOverlays && isHinted}
              isDimmed={isDimmed}
              cellHighlight={overlay?.highlight ?? null}
              ghostValue={overlay?.ghostValue ?? 0}
              notes={notes[r][c]}
              groupSize={groupSize}
              colorIndex={groupColors[groupId]}
              borders={borders}
              onClick={() => onCellClick(r, c)}
            />
          );
        })
      )}
    </div>
  );

  if (!showCoordinates) return boardGrid;

  // Coordinate gutter — column letters above, row numbers down the
  // left, aligned to the cell tracks. Shown only while a hint is open.
  const GUTTER = '1.4rem';
  const labelStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.7rem',
    fontFamily: 'var(--font-mono)',
    color: 'var(--text-tertiary)',
  };

  return (
    <div
      style={{
        display: 'grid',
        width: '100%',
        gridTemplateColumns: `${GUTTER} 1fr`,
        gridTemplateRows: `${GUTTER} 1fr`,
      }}
    >
      <div aria-hidden="true" />
      <div
        aria-hidden="true"
        style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)` }}
      >
        {Array.from({ length: cols }, (_, c) => (
          <span key={c} style={labelStyle}>
            {columnLetter(c)}
          </span>
        ))}
      </div>
      <div
        aria-hidden="true"
        style={{ display: 'grid', gridTemplateRows: `repeat(${rows}, 1fr)` }}
      >
        {Array.from({ length: rows }, (_, r) => (
          <span key={r} style={labelStyle}>
            {r + 1}
          </span>
        ))}
      </div>
      {boardGrid}
    </div>
  );
}

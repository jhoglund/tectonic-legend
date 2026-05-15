import { useMemo } from 'react';
import type { GameState, PuzzleLayout } from '../engine/types';
import { posKey } from '../engine/types';
import type { Hint } from '../engine/hints';
import { Cell, computeBorders } from './Cell';
import type { CellHighlight } from './Cell';

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
}

export function Board({ gameState, selectedCell, hint, cellOverlays, onCellClick }: BoardProps) {
  const { puzzle, grid, isClue, notes, errors } = gameState;
  const { layout } = puzzle;
  const { rows, cols, groups, cellToGroup } = layout;
  const compact = rows > 5 || cols > 5;

  const groupColors = useMemo(() => colorGroups(layout), [layout]);

  return (
    <div
      className="inline-grid"
      style={{
        gridTemplateColumns: `repeat(${cols}, auto)`,
        border: 'var(--border-cage-width) solid var(--border-cage)',
        borderRadius: '6px',
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
              isError={errors[r][c]}
              isHinted={!cellOverlays && isHinted}
              isDimmed={isDimmed}
              cellHighlight={overlay?.highlight ?? null}
              ghostValue={overlay?.ghostValue ?? 0}
              notes={notes[r][c]}
              groupSize={groupSize}
              colorIndex={groupColors[groupId]}
              borders={borders}
              compact={compact}
              onClick={() => onCellClick(r, c)}
            />
          );
        })
      )}
    </div>
  );
}

import { useMemo, type CSSProperties } from 'react';
import type { GameState, PuzzleLayout } from '../engine/types';
import { posKey } from '../engine/types';
import type { Hint, HintNotes } from '../engine/hints';
import { columnLetter } from '../engine/hints';
import { Cell } from './Cell';
import type { CellHighlight } from './Cell';
import { computeBorders } from './cellBorders';

/** Number of distinct cage tints in the design palette
 *  (`--cage-1`…`--cage-5`). The greedy plain-smallest coloring would
 *  often only use the first three slots, leaving boards visually
 *  monotone; this lets us spread across all five when the layout has
 *  enough groups. */
const CAGE_PALETTE_SIZE = 5;

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

  // Color the groups balanced across the 5-tint palette: process the
  // most-constrained group (largest adjacency) first, and at each step
  // pick the palette colour with the lowest current usage that no
  // neighbour already owns. This spreads the five tints evenly — five
  // groups produce all five colours when the adjacency allows it,
  // rather than the plain-greedy "use the smallest free index" that
  // tended to reuse only the first three.
  const colors = new Array(groups.length).fill(-1);
  const usage = new Array(CAGE_PALETTE_SIZE).fill(0);
  const order = groups
    .map((g) => g.id)
    .sort((a, b) => adj.get(b)!.size - adj.get(a)!.size);

  for (const gid of order) {
    const banned = new Set<number>();
    for (const nid of adj.get(gid)!) {
      if (colors[nid] !== -1) banned.add(colors[nid]);
    }
    let pick = -1;
    let pickUsage = Infinity;
    for (let c = 0; c < CAGE_PALETTE_SIZE; c++) {
      if (banned.has(c)) continue;
      if (usage[c] < pickUsage) {
        pickUsage = usage[c];
        pick = c;
      }
    }
    if (pick === -1) {
      // Adjacency consumed every palette slot (rare — the Four Colour
      // Theorem makes this all but impossible on planar cage maps).
      // Fall back to the original smallest-free-index pattern; the
      // Cell renderer mods by the palette size so the cage still draws.
      let c = CAGE_PALETTE_SIZE;
      while (banned.has(c % CAGE_PALETTE_SIZE)) c++;
      pick = c;
    } else {
      usage[pick]++;
    }
    colors[gid] = pick;
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
  /** Candidate-note reasoning to draw in the hint's target cell
   *  (ADR-0015). For a stepped pair-elimination hint, the caller passes
   *  the frame for the current step. */
  hintNotes?: HintNotes | null;
}

export function Board({
  gameState,
  selectedCell,
  hint,
  cellOverlays,
  onCellClick,
  showErrors = false,
  showCoordinates = false,
  hintNotes = null,
}: BoardProps) {
  const { puzzle, grid, isClue, notes, errors } = gameState;
  const { layout } = puzzle;
  const { rows, cols, groups, cellToGroup } = layout;

  const groupColors = useMemo(() => colorGroups(layout), [layout]);

  // A region hint (ADR-0016) — the Forced move's dominating cage —
  // rings its empty cells blue and draws the value-set chip on one of
  // them: every cell for a tiny region, the cell nearest the hint's
  // target for a larger one. Suppressed while a contradiction-chain
  // overlay owns the board.
  const regionCells = useMemo(() => {
    if (cellOverlays || !hint?.regions) return null;
    const ring = new Set<string>();
    const chip = new Map<string, number[]>();
    for (const region of hint.regions) {
      for (const { row, col } of region.cells) ring.add(posKey(row, col));
      const empty = region.cells.filter(({ row, col }) => grid[row][col] === 0);
      if (empty.length === 0) continue;
      const dist = (c: { row: number; col: number }) =>
        Math.hypot(c.row - hint.row, c.col - hint.col);
      const carriers =
        empty.length <= 2
          ? empty
          : [empty.reduce((best, c) => (dist(c) < dist(best) ? c : best))];
      for (const { row, col } of carriers) {
        chip.set(posKey(row, col), region.set);
      }
    }
    return { ring, chip };
  }, [hint, cellOverlays, grid]);

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
          const isHintCell =
            hint !== null && hint.row === r && hint.col === c;
          // A notes hint (ADR-0015) draws its reasoning in the cell; it
          // rings the cell itself, so it suppresses the amber fill.
          const cellHintNotes =
            !cellOverlays && isHintCell ? hintNotes : null;
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
              isHinted={!cellOverlays && isHintCell && !cellHintNotes}
              isDimmed={isDimmed}
              cellHighlight={overlay?.highlight ?? null}
              ghostValue={overlay?.ghostValue ?? 0}
              notes={notes[r][c]}
              hintNotes={cellHintNotes}
              isRegionCell={regionCells?.ring.has(key) ?? false}
              regionSet={regionCells?.chip.get(key) ?? null}
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

  // Coordinate gutter — column letters above, row numbers to the left.
  // Both are absolutely positioned, so the board grid keeps the full
  // content width and stays aligned with the keypad and hint card
  // below; only `marginTop` makes vertical room for the letters.
  const GUTTER = '1.2rem';
  const labelStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.7rem',
    fontFamily: 'var(--font-mono)',
    color: 'var(--text-tertiary)',
  };

  return (
    <div style={{ position: 'relative', width: '100%', marginTop: GUTTER }}>
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: '100%',
          height: GUTTER,
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
        }}
      >
        {Array.from({ length: cols }, (_, c) => (
          <span key={c} style={labelStyle}>
            {columnLetter(c)}
          </span>
        ))}
      </div>
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          right: '100%',
          width: GUTTER,
          display: 'grid',
          gridTemplateRows: `repeat(${rows}, 1fr)`,
        }}
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

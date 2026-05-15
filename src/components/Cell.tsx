import type { PuzzleLayout } from '../engine/types';
import { posKey } from '../engine/types';

export type CellHighlight = 'assumption' | 'deduction' | 'contradiction' | 'conclusion' | null;

/** A cell edge is either a cage boundary, a within-cage line, or unset
 *  ('none' — the board container draws that outer frame instead). */
export type CellEdge = 'cage' | 'inner' | 'none';

export interface CellBorders {
  top: CellEdge;
  left: CellEdge;
}

interface CellProps {
  value: number;
  isClue: boolean;
  isSelected: boolean;
  isError: boolean;
  isHinted: boolean;
  isDimmed: boolean;
  cellHighlight: CellHighlight;
  ghostValue: number;
  notes: Set<number>;
  groupSize: number;
  colorIndex: number;
  borders: CellBorders;
  compact: boolean;
  onClick: () => void;
}

const HIGHLIGHT_RINGS: Record<string, string> = {
  assumption: 'ring-2 ring-amber-500 ring-inset',
  deduction: 'ring-2 ring-blue-400 ring-inset',
  contradiction: 'ring-2 ring-red-500 ring-inset',
  conclusion: 'ring-2 ring-green-500 ring-inset',
};

/** CSS `border` shorthand for one edge, using the board tokens. */
function edgeStyle(edge: CellEdge): string | undefined {
  if (edge === 'none') return undefined;
  if (edge === 'cage') {
    return 'var(--border-cage-width) solid var(--border-cage)';
  }
  return 'var(--border-inner-width) solid var(--cell-inner)';
}

export function Cell({
  value,
  isClue,
  isSelected,
  isError,
  isHinted,
  isDimmed,
  cellHighlight,
  ghostValue,
  notes,
  groupSize,
  colorIndex,
  borders,
  compact,
  onClick,
}: CellProps) {
  // Cage fill comes from the design tokens via the `.cage-N` class.
  // Transient states (hint / selection / error) override the fill.
  const cageClass = `cage-${(colorIndex % 5) + 1}`;
  const stateBgClass = isHinted
    ? 'bg-amber-300'
    : isSelected
      ? 'bg-blue-300'
      : isError
        ? 'bg-red-200'
        : '';

  const ringClass = cellHighlight ? HIGHLIGHT_RINGS[cellHighlight] : '';

  const sizeClass = compact
    ? 'w-8 h-8 sm:w-9 sm:h-9'
    : 'w-12 h-12 sm:w-14 sm:h-14';

  const textSize = compact ? 'text-sm' : 'text-xl';
  const noteTextSize = compact ? 'text-[6px]' : 'text-[9px]';
  const dimClass = isDimmed ? 'opacity-30' : '';

  // Clue vs. player entry distinguished by weight; both use --cell-text.
  const valueWeight = isClue ? 'font-bold' : 'font-medium';

  return (
    <div
      className={`flex items-center justify-center cursor-pointer select-none relative
        ${sizeClass} ${cageClass} ${stateBgClass} ${ringClass} ${dimClass} transition-all duration-200`}
      style={{
        borderTop: edgeStyle(borders.top),
        borderLeft: edgeStyle(borders.left),
        ...(stateBgClass ? {} : { background: 'var(--cell-fill)' }),
      }}
      onClick={onClick}
    >
      {ghostValue !== 0 && value === 0 ? (
        <span className={`${textSize} text-amber-500 font-semibold opacity-70`}>{ghostValue}</span>
      ) : value !== 0 ? (
        <span
          className={`${textSize} ${valueWeight} ${isError ? 'text-red-600' : ''}`}
          style={isError ? undefined : { color: 'var(--cell-text)' }}
        >
          {value}
        </span>
      ) : notes.size > 0 ? (
        <div className="grid grid-cols-3 gap-0 w-full h-full p-0.5">
          {Array.from({ length: groupSize }, (_, i) => i + 1).map((n) => (
            <span
              key={n}
              className={`${noteTextSize} text-slate-400 flex items-center justify-center leading-none`}
            >
              {notes.has(n) ? n : ''}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
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

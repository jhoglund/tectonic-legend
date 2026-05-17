import type { CellEdge, CellBorders } from './cellBorders';

export type CellHighlight = 'assumption' | 'deduction' | 'contradiction' | 'conclusion' | null;

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

/**
 * One board cell. The cell is square (`aspect-ratio: 1`) and sizes
 * itself from the board's responsive grid track — the board grew to the
 * screen width in the 2026-05-17 solving-shapes graduation (variant
 * 11), so cells no longer carry fixed pixel sizes. Each cell is a query
 * container; the value font scales with the cell via `cqw` units.
 */
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
  onClick,
}: CellProps) {
  // Cage fill comes from the design tokens via the `.cage-N` class.
  const cageClass = `cage-${(colorIndex % 5) + 1}`;
  // Transient hint / error states override the fill via a class; the
  // selected cell uses the selection surface (set inline below).
  const stateBgClass = isHinted ? 'bg-amber-300' : isError ? 'bg-red-200' : '';
  const ringClass = cellHighlight ? HIGHLIGHT_RINGS[cellHighlight] : '';
  const dimClass = isDimmed ? 'opacity-30' : '';

  // Background: hint / error use a class; the selected cell takes the
  // selection surface; everything else takes its cage fill.
  const background = stateBgClass
    ? undefined
    : isSelected
      ? 'var(--surface-cell-selected)'
      : 'var(--cell-fill)';

  // Value ink: error red (class), else the active cell's darker blue,
  // else bold clue ink or the player's cage-tinted ink.
  const valueWeight = isClue ? 'font-bold' : 'font-medium';
  const valueColor = isSelected
    ? 'var(--text-cell-selected)'
    : isClue
      ? 'var(--cell-text)'
      : 'var(--cell-player)';

  return (
    <div
      className={`relative flex cursor-pointer select-none items-center justify-center transition-all duration-200
        ${cageClass} ${stateBgClass} ${ringClass} ${dimClass}`}
      style={{
        aspectRatio: '1',
        containerType: 'inline-size',
        borderTop: edgeStyle(borders.top),
        borderLeft: edgeStyle(borders.left),
        ...(background ? { background } : {}),
        // The selected cell is marked by the brand ring (graduated from
        // the solving-shapes prototype, variant 11).
        ...(isSelected
          ? { boxShadow: 'inset 0 0 0 2px var(--brand-600)' }
          : {}),
      }}
      onClick={onClick}
    >
      {ghostValue !== 0 && value === 0 ? (
        <span
          className="font-semibold text-amber-500 opacity-70"
          style={{ fontSize: '42cqw', lineHeight: 1 }}
        >
          {ghostValue}
        </span>
      ) : value !== 0 ? (
        <span
          className={`${valueWeight} ${isError ? 'text-red-600' : ''}`}
          style={{
            fontSize: '42cqw',
            lineHeight: 1,
            ...(isError ? {} : { color: valueColor }),
          }}
        >
          {value}
        </span>
      ) : notes.size > 0 ? (
        <div className="grid h-full w-full grid-cols-3 gap-0 p-0.5">
          {Array.from({ length: groupSize }, (_, i) => i + 1).map((n) => (
            <span
              key={n}
              className="flex items-center justify-center leading-none text-slate-400"
              style={{ fontSize: '16cqw' }}
            >
              {notes.has(n) ? n : ''}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

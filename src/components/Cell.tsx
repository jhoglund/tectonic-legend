import type { CellBorders } from './cellBorders';

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

/** Box-shadow colour for each contradiction-chain highlight. Semantic
 *  tokens — see design-tokens §4. */
const HIGHLIGHT_COLOR: Record<string, string> = {
  assumption: 'var(--cell-assumption)',
  deduction: 'var(--cell-deduction)',
  contradiction: 'var(--cell-contradiction)',
  conclusion: 'var(--cell-conclusion)',
};

/**
 * One board cell. The cell is square (`aspect-ratio: 1`) and sizes
 * itself from the board's responsive grid track — the board grew to the
 * screen width in the 2026-05-17 solving-shapes graduation (variant
 * 11), so cells no longer carry fixed pixel sizes. Each cell is a query
 * container; the value font scales with the cell via `cqw` units.
 *
 * Grid lines are drawn as **inset box-shadows**, not CSS borders, so
 * they paint in list order — the 2px cage line, listed first, always
 * wins a shared corner over the 1px inner line. Where a cage boundary
 * turns a corner that neither of the cell's own edges reaches
 * (`borders.cornerTL`), the cell paints a small cage patch to close it.
 *
 * The selected cell's ring is inset on the top/left edges it owns and
 * outset on the right/bottom edges its neighbours own, so it lands
 * exactly on the grid lines rather than beside them — and, raised above
 * its neighbours, it cleanly replaces them instead of compounding.
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

  // Box-shadow stack. The selected cell's ring is inset on the edges it
  // owns (top/left) and outset on the edges its neighbours own
  // (right/bottom) so it lands on the grid lines; z-index then lifts it
  // above the neighbours so it replaces those lines. Every other cell
  // draws its top/left grid lines as insets — cage entries first so the
  // darker 2px line always paints over the 1px inner line at a corner.
  const shadows: string[] = [];
  if (isSelected) {
    shadows.push(
      'inset 0 2px 0 0 var(--brand-600)',
      'inset 2px 0 0 0 var(--brand-600)',
      '2px 0 0 0 var(--brand-600)',
      '0 2px 0 0 var(--brand-600)',
    );
  } else {
    if (cellHighlight) {
      shadows.push(`inset 0 0 0 2px ${HIGHLIGHT_COLOR[cellHighlight]}`);
    }
    const cage: string[] = [];
    const inner: string[] = [];
    if (borders.top === 'cage') {
      cage.push('inset 0 var(--border-cage-width) 0 0 var(--border-cage)');
    } else if (borders.top === 'inner') {
      inner.push('inset 0 var(--border-inner-width) 0 0 var(--cell-inner)');
    }
    if (borders.left === 'cage') {
      cage.push('inset var(--border-cage-width) 0 0 0 var(--border-cage)');
    } else if (borders.left === 'inner') {
      inner.push('inset var(--border-inner-width) 0 0 0 var(--cell-inner)');
    }
    shadows.push(...cage, ...inner);
  }

  return (
    <div
      className={`relative flex cursor-pointer select-none items-center justify-center transition-all duration-200
        ${cageClass} ${stateBgClass} ${dimClass}`}
      style={{
        aspectRatio: '1',
        containerType: 'inline-size',
        ...(background ? { background } : {}),
        ...(shadows.length ? { boxShadow: shadows.join(', ') } : {}),
        // Raise the selected cell so its outset ring sits above the
        // neighbouring cells' grid lines.
        ...(isSelected ? { zIndex: 5 } : {}),
      }}
      onClick={onClick}
    >
      {/* Cage-corner patch — closes a cage L whose corner falls in this
          cell but is reached by neither of its own edges. */}
      {!isSelected && borders.cornerTL && (
        <span
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: 'var(--border-cage-width)',
            height: 'var(--border-cage-width)',
            background: 'var(--border-cage)',
          }}
        />
      )}
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

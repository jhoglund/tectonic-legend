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
 * The selected cell's ring is a separate child layer that fades in
 * (`cell-ring-in`): inset on the edges the cell draws itself, outset on
 * the edges a neighbour draws, so it lands exactly on the grid line and
 * — raised above its neighbours — replaces it rather than doubling it.
 * A player-entered value grows into place via `cell-value-enter`. Both
 * keyframes live in src/index.css. The selected cell's background, ring,
 * and value ink are a darker tint of its own cage colour — the
 * `.cell-selected` / `.cell-selected-ink` classes in src/index.css.
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
  // Transient hint / error states override the fill via a Tailwind
  // class and take precedence over the selection tint.
  const stateBgClass = isHinted ? 'bg-amber-300' : isError ? 'bg-red-200' : '';
  const dimClass = isDimmed ? 'opacity-30' : '';
  // The selected cell gets the `.cell-selected` cage-tint class — a
  // darker tint of its own cage — unless hint / error already own it.
  const selectedTint = isSelected && !stateBgClass;

  // Background: hint / error and the selected cell come from classes;
  // every other cell takes its cage fill inline.
  const background =
    stateBgClass || selectedTint ? undefined : 'var(--cell-fill)';

  // Value ink — error red and the selected cell come from classes; a
  // clue is bold dark ink, a player entry the cage-tinted ink.
  const valueWeight = isClue ? 'font-bold' : 'font-medium';
  const valueColor = isClue ? 'var(--cell-text)' : 'var(--cell-player)';

  // Box-shadow stack — the cell's grid lines as insets, cage entries
  // first so the darker 2px line always paints over the 1px inner line
  // at a shared corner; a chain-highlight ring goes on top. `top`/`left`
  // are always drawn; `bottom`/`right` only on the board's edge cells
  // (the outer frame). The selection ring is a separate child layer.
  const shadows: string[] = [];
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
  if (borders.bottom === 'cage') {
    cage.push('inset 0 calc(-1 * var(--border-cage-width)) 0 0 var(--border-cage)');
  }
  if (borders.right === 'cage') {
    cage.push('inset calc(-1 * var(--border-cage-width)) 0 0 0 var(--border-cage)');
  }
  shadows.push(...cage, ...inner);

  // The selection ring lands on a grid line on every edge: inset on the
  // top/left this cell draws, and on the bottom/right of a board-edge
  // cell (which draws its own frame there); outset on an interior
  // bottom/right, where the neighbour draws the line. Raised by z-index,
  // it then replaces that line instead of doubling it. Its colour is the
  // cage-tinted ring (`--cell-sel-ring`, set by `.cell-selected`), with
  // the brand colour as a fallback for the rare selected-while-hinted.
  const rc = 'var(--cell-sel-ring, var(--brand-600))';
  const ringShadow = [
    `inset 0 2px 0 0 ${rc}`,
    `inset 2px 0 0 0 ${rc}`,
    borders.right === 'cage' ? `inset -2px 0 0 0 ${rc}` : `2px 0 0 0 ${rc}`,
    borders.bottom === 'cage' ? `inset 0 -2px 0 0 ${rc}` : `0 2px 0 0 ${rc}`,
  ].join(', ');

  // A board-corner cell rounds that corner, so its frame box-shadow
  // (and the selection ring) follow the board's radius.
  const cornerRadius =
    borders.boardCorner === 'tl'
      ? { borderTopLeftRadius: 'var(--radius-card)' }
      : borders.boardCorner === 'tr'
        ? { borderTopRightRadius: 'var(--radius-card)' }
        : borders.boardCorner === 'bl'
          ? { borderBottomLeftRadius: 'var(--radius-card)' }
          : borders.boardCorner === 'br'
            ? { borderBottomRightRadius: 'var(--radius-card)' }
            : {};

  return (
    <div
      className={`relative flex cursor-pointer select-none items-center justify-center
        ${cageClass} ${stateBgClass} ${dimClass} ${selectedTint ? 'cell-selected' : ''}`}
      style={{
        aspectRatio: '1',
        containerType: 'inline-size',
        transition:
          'background-color var(--motion-fast), opacity var(--motion-fast)',
        ...cornerRadius,
        ...(background ? { background } : {}),
        ...(shadows.length ? { boxShadow: shadows.join(', ') } : {}),
        // Raise the selected cell so its ring child's outset segments
        // sit above the neighbouring cells' grid lines.
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
      {/* Selection ring — a child layer so it fades in cleanly
          (cell-ring-in). See `ringShadow` for the per-edge geometry. */}
      {isSelected && (
        <span
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            ...cornerRadius,
            boxShadow: ringShadow,
            animation: 'cell-ring-in var(--motion-fast)',
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
          // Keyed by value so a freshly entered number remounts and
          // replays the grow-in animation.
          key={value}
          className={`${valueWeight} ${isError ? 'text-red-600' : ''} ${
            selectedTint ? 'cell-selected-ink' : ''
          }`}
          style={{
            fontSize: '42cqw',
            lineHeight: 1,
            ...(isError || selectedTint ? {} : { color: valueColor }),
            // A player-entered value grows into place and its colour
            // settles in; clues are given, so they simply appear.
            ...(isClue ? {} : { animation: 'cell-value-enter var(--motion-base)' }),
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

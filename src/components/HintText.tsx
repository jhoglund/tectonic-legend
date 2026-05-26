/**
 * Renders hint text with cell references — "A3", "B4" — pulled out as
 * clickable tokens. Tapping one marks that cell on the board, so a
 * player can follow a hint without hunting for the coordinate.
 *
 * Used by the simple hint card and the contradiction stepper. The
 * accent colour lets the stepper match a token to its cell highlight.
 */

/** Column letter + 1-based row, e.g. "C3" — matched as a whole word. */
const CELL_REF = /\b([A-H][1-9])\b/g;
const IS_CELL_REF = /^[A-H][1-9]$/;
const CELL_REF_OR_VALUE = /\b([A-H][1-9]|[1-8])\b/g;
const IS_VALUE = /^[1-8]$/;

interface HintTextProps {
  text: string;
  /** Colour for the cell-reference tokens. */
  accent?: string;
  /** Bold standalone values, used by tutorial copy. */
  emphasizeValues?: boolean;
  /** Called with the 0-based row/col when a reference is tapped. */
  onCellRef: (row: number, col: number) => void;
}

export function HintText({
  text,
  accent = 'var(--brand-600)',
  emphasizeValues = false,
  onCellRef,
}: HintTextProps) {
  const splitter = emphasizeValues ? CELL_REF_OR_VALUE : CELL_REF;
  return (
    <>
      {text.split(splitter).map((part, i) => {
        if (IS_VALUE.test(part) && emphasizeValues) {
          return (
            <strong
              key={i}
              style={{
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
              }}
            >
              {part}
            </strong>
          );
        }
        if (!IS_CELL_REF.test(part)) return <span key={i}>{part}</span>;
        const col = part.charCodeAt(0) - 65;
        const row = Number(part[1]) - 1;
        return (
          <button
            key={i}
            type="button"
            onClick={() => onCellRef(row, col)}
            className="cursor-pointer"
            style={{
              display: 'inline',
              padding: 0,
              border: 'none',
              background: 'none',
              font: 'inherit',
              fontWeight: 700,
              fontFamily: 'var(--font-mono)',
              color: accent,
              textDecoration: 'underline',
            }}
          >
            {part}
          </button>
        );
      })}
    </>
  );
}

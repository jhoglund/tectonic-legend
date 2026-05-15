interface KeypadProps {
  maxNumber: number;
  onNumber: (n: number) => void;
  onUndo: () => void;
  canUndo: boolean;
}

const keyStyle = (disabled: boolean): React.CSSProperties => ({
  width: 44,
  height: 44,
  borderRadius: 'var(--radius-button)',
  background: 'var(--surface-elevated)',
  border: '1px solid var(--border)',
  cursor: disabled ? 'default' : 'pointer',
  opacity: disabled ? 0.35 : 1,
  display: 'grid',
  placeItems: 'center',
});

/**
 * The number-entry keypad — digits 1..maxNumber, then Undo.
 * Per-cell clearing lives in the toolbar's Clear; Undo steps back
 * through the full move history.
 */
export function Keypad({
  maxNumber,
  onNumber,
  onUndo,
  canUndo,
}: KeypadProps) {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {Array.from({ length: maxNumber }, (_, i) => i + 1).map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onNumber(n)}
          style={{
            ...keyStyle(false),
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-mono)',
            fontSize: '1.15rem',
            fontWeight: 500,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {n}
        </button>
      ))}
      <button
        type="button"
        disabled={!canUndo}
        onClick={onUndo}
        aria-label="Undo"
        style={{ ...keyStyle(!canUndo), color: 'var(--text-secondary)' }}
      >
        <svg
          width={21}
          height={21}
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            transform="rotate(90 12 12)"
            fillRule="evenodd"
            clipRule="evenodd"
            d="M15 3.75A5.25 5.25 0 0 0 9.75 9v10.19l4.72-4.72a.75.75 0 1 1 1.06 1.06l-6 6a.75.75 0 0 1-1.06 0l-6-6a.75.75 0 1 1 1.06-1.06l4.72 4.72V9a6.75 6.75 0 0 1 13.5 0v3a.75.75 0 0 1-1.5 0V9c0-2.9-2.35-5.25-5.25-5.25Z"
          />
        </svg>
      </button>
    </div>
  );
}

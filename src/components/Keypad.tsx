interface KeypadProps {
  maxNumber: number;
  onNumber: (n: number) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
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

const svgProps = {
  width: 21,
  height: 21,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

/**
 * The number-entry keypad — digits 1..maxNumber, then Undo and Redo.
 * Per-cell clearing lives in the toolbar's Clear; the keypad's action
 * keys step through the full move history.
 */
export function Keypad({
  maxNumber,
  onNumber,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
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
        <svg {...svgProps} aria-hidden="true">
          <path d="M3 7v6h6" />
          <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6.7 3L3 13" />
        </svg>
      </button>
      <button
        type="button"
        disabled={!canRedo}
        onClick={onRedo}
        aria-label="Redo"
        style={{ ...keyStyle(!canRedo), color: 'var(--text-secondary)' }}
      >
        <svg {...svgProps} aria-hidden="true">
          <path d="M21 7v6h-6" />
          <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6.7 3L21 13" />
        </svg>
      </button>
    </div>
  );
}

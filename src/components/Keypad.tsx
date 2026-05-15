interface KeypadProps {
  maxNumber: number;
  onNumber: (n: number) => void;
  onClear: () => void;
  disabled?: boolean;
}

const keyStyle = (disabled: boolean): React.CSSProperties => ({
  width: 44,
  height: 44,
  borderRadius: 'var(--radius-button)',
  background: 'var(--surface-elevated)',
  border: '1px solid var(--border)',
  cursor: disabled ? 'default' : 'pointer',
  opacity: disabled ? 0.4 : 1,
  display: 'grid',
  placeItems: 'center',
});

/** The number-entry keypad — digits 1..maxNumber plus a delete key.
 *  Digits use the tabular mono numeral face. */
export function Keypad({ maxNumber, onNumber, onClear, disabled = false }: KeypadProps) {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {Array.from({ length: maxNumber }, (_, i) => i + 1).map((n) => (
        <button
          key={n}
          type="button"
          disabled={disabled}
          onClick={() => onNumber(n)}
          style={{
            ...keyStyle(disabled),
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
        disabled={disabled}
        onClick={onClear}
        aria-label="Delete"
        style={{ ...keyStyle(disabled), color: 'var(--danger)' }}
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
          <line x1="18" y1="9" x2="12" y2="15" />
          <line x1="12" y1="9" x2="18" y2="15" />
        </svg>
      </button>
    </div>
  );
}

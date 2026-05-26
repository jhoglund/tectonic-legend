const VALUES = [
  [1, 2, 3, 4, 5],
  [2, 4, 1, 5, 3],
  [5, 3, 2, 1, 4],
  [3, 1, 5, 2, 0],
  [4, 5, 0, 3, 1],
];

const SELECTED = new Set(['0:3', '1:3', '2:3']);

export function MiniBoardIllustration() {
  return (
    <div
      className="grid place-items-center"
      style={{
        width: '100%',
        maxWidth: 280,
        aspectRatio: '1',
        background: 'var(--brand-100)',
        borderRadius: 'var(--radius-modal)',
      }}
    >
      <div
        className="grid"
        style={{
          width: '76%',
          aspectRatio: '1',
          gridTemplateColumns: 'repeat(5, 1fr)',
          background: 'var(--surface-board)',
          border: '1px solid var(--border-cage)',
          borderRadius: 'var(--radius-button)',
          boxShadow: 'var(--shadow-cell)',
          overflow: 'hidden',
        }}
        aria-hidden="true"
      >
        {VALUES.flatMap((row, r) =>
          row.map((value, c) => {
            const selected = SELECTED.has(`${r}:${c}`);
            const cageBreakRight = c === 0 || c === 2;
            const cageBreakBottom = r < 3;
            return (
              <div
                key={`${r}:${c}`}
                className="grid place-items-center"
                style={{
                  background: selected
                    ? 'var(--surface-cell-selected)'
                    : 'var(--surface-cell)',
                  borderRight: cageBreakRight
                    ? '2px solid var(--border-cage)'
                    : '1px solid var(--border)',
                  borderBottom: cageBreakBottom
                    ? '2px solid var(--border-cage)'
                    : '1px solid var(--border)',
                  color: selected ? 'var(--brand-600)' : 'var(--text-primary)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'clamp(0.85rem, 5vw, 1.15rem)',
                  fontWeight: selected ? 500 : 400,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {value || ''}
              </div>
            );
          }),
        )}
      </div>
    </div>
  );
}

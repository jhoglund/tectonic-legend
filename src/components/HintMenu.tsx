import type { HintMode } from '../engine/types';

const HINT_MODES: { mode: HintMode; label: string; description: string }[] = [
  {
    mode: 'logic',
    label: 'Logic hint',
    description: 'Explains the next logical deduction',
  },
  {
    mode: 'candidates',
    label: 'Show candidates',
    description: 'Lists the possible values for the selected cell',
  },
  {
    mode: 'reveal',
    label: 'Reveal cell',
    description: 'Fills in the correct answer for the selected cell',
  },
];

interface HintMenuProps {
  open: boolean;
  onClose: () => void;
  onPick: (mode: HintMode) => void;
}

/**
 * The multi-hint menu — a bottom sheet over the Solving screen.
 * 'check' is intentionally absent: validation is its own toolbar
 * control (Validate), not a hint mode.
 */
export function HintMenu({ open, onClose, onPick }: HintMenuProps) {
  if (!open) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 flex items-end justify-center"
      style={{ background: 'rgba(0,0,0,0.4)', zIndex: 50 }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex w-full flex-col"
        style={{
          maxWidth: '430px',
          background: 'var(--surface-elevated)',
          borderTopLeftRadius: 'var(--radius-modal)',
          borderTopRightRadius: 'var(--radius-modal)',
          padding: 'var(--space-4)',
          paddingBottom: 'calc(env(safe-area-inset-bottom) + var(--space-4))',
        }}
      >
        <div
          className="mx-auto mb-4"
          style={{ width: 36, height: 5, borderRadius: 999, background: 'var(--border)' }}
        />
        <h2 className="mb-1 text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
          Hint
        </h2>
        <p className="mb-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
          Pick how much help you want.
        </p>

        <div
          className="flex flex-col"
          style={{
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-card)',
            overflow: 'hidden',
          }}
        >
          {HINT_MODES.map((item, i) => (
            <button
              key={item.mode}
              type="button"
              onClick={() => {
                onPick(item.mode);
                onClose();
              }}
              className="flex cursor-pointer flex-col px-4 py-3 text-left"
              style={{
                background: 'var(--surface-elevated)',
                borderTop: i > 0 ? '1px solid var(--border)' : 'none',
              }}
            >
              <span
                className="text-base font-medium"
                style={{ color: 'var(--text-primary)' }}
              >
                {item.label}
              </span>
              <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                {item.description}
              </span>
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-4 cursor-pointer py-3 text-base font-medium"
          style={{ color: 'var(--brand-600)' }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

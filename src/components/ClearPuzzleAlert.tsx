import { useEscapeKey } from '../hooks/useEscapeKey';

interface ClearPuzzleAlertProps {
  open: boolean;
  onClear: () => void;
  onCancel: () => void;
}

/** iOS-style confirmation alert for wiping every player entry and note
 *  from the current puzzle. The puzzle itself stays open. */
export function ClearPuzzleAlert({ open, onClear, onCancel }: ClearPuzzleAlertProps) {
  useEscapeKey(onCancel, open);
  if (!open) return null;

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: backdrop is a mouse affordance; the keyboard path is Escape via useEscapeKey
    <div
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
      className="fixed inset-0 flex items-center justify-center px-8"
      style={{ background: 'rgba(0,0,0,0.4)', zIndex: 60 }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Clear this puzzle?"
        className="flex flex-col"
        style={{
          width: '100%',
          maxWidth: 280,
          background: 'var(--surface-elevated)',
          borderRadius: 'var(--radius-modal)',
          boxShadow: 'var(--shadow-modal)',
          overflow: 'hidden',
        }}
      >
        <div className="px-5 pt-5 pb-4 text-center">
          <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
            Clear this puzzle?
          </h2>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
            All your entries and notes are removed. The puzzle stays open so
            you can start over.
          </p>
        </div>
        <button
          type="button"
          onClick={onClear}
          className="cursor-pointer py-3 text-base font-semibold"
          style={{ color: 'var(--danger)', borderTop: '1px solid var(--border)' }}
        >
          Clear
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="cursor-pointer py-3 text-base font-medium"
          style={{ color: 'var(--brand-600)', borderTop: '1px solid var(--border)' }}
        >
          Keep my progress
        </button>
      </div>
    </div>
  );
}

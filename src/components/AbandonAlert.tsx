import { useEscapeKey } from '../hooks/useEscapeKey';

interface AbandonAlertProps {
  open: boolean;
  onAbandon: () => void;
  onKeepSolving: () => void;
}

/** iOS-style confirmation alert for abandoning the current puzzle. */
export function AbandonAlert({ open, onAbandon, onKeepSolving }: AbandonAlertProps) {
  useEscapeKey(onKeepSolving, open);
  if (!open) return null;

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: backdrop is a mouse affordance; the keyboard path is Escape via useEscapeKey
    <div
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onKeepSolving();
      }}
      className="fixed inset-0 flex items-center justify-center px-8"
      style={{ background: 'rgba(0,0,0,0.4)', zIndex: 60 }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Abandon this puzzle?"
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
            Abandon this puzzle?
          </h2>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
            Your progress on this puzzle is lost. Your stage and stats stay the
            same.
          </p>
        </div>
        <button
          type="button"
          onClick={onAbandon}
          className="cursor-pointer py-3 text-base font-semibold"
          style={{ color: 'var(--danger)', borderTop: '1px solid var(--border)' }}
        >
          Abandon
        </button>
        <button
          type="button"
          onClick={onKeepSolving}
          className="cursor-pointer py-3 text-base font-medium"
          style={{ color: 'var(--brand-600)', borderTop: '1px solid var(--border)' }}
        >
          Keep solving
        </button>
      </div>
    </div>
  );
}

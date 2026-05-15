interface PauseSheetProps {
  open: boolean;
  onResume: () => void;
  onAbandon: () => void;
}

/** Pause overlay — a bottom sheet with Resume / Abandon. */
export function PauseSheet({ open, onResume, onAbandon }: PauseSheetProps) {
  if (!open) return null;

  return (
    <div
      onClick={onResume}
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
        <h2 className="mb-4 text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
          Paused
        </h2>

        <button
          type="button"
          onClick={onResume}
          className="mb-2 cursor-pointer py-3.5 text-base font-semibold"
          style={{
            background: 'var(--brand-600)',
            color: 'var(--text-on-brand)',
            borderRadius: 'var(--radius-button)',
          }}
        >
          Resume
        </button>
        <button
          type="button"
          onClick={onAbandon}
          className="cursor-pointer py-3.5 text-base font-medium"
          style={{
            color: 'var(--danger)',
            borderRadius: 'var(--radius-button)',
            border: '1px solid var(--border)',
          }}
        >
          Abandon puzzle
        </button>
      </div>
    </div>
  );
}

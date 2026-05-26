import { HintText } from './HintText';

interface NotesStepperProps {
  steps: { crossed: number[]; reason: string }[];
  stepIndex: number;
  onStep: (delta: number) => void;
  onJump: (index: number) => void;
  onSkip: () => void;
  /** Marks the tapped cell reference on the board. */
  onCellRef: (row: number, col: number) => void;
}

/**
 * The pair-elimination walkthrough (ADR-0015). One elimination at a
 * time — the board crosses candidates off the target cell as the
 * player steps; this card carries the reason for each.
 */
export function NotesStepper({
  steps,
  stepIndex,
  onStep,
  onJump,
  onSkip,
  onCellRef,
}: NotesStepperProps) {
  const step = steps[stepIndex];
  const atStart = stepIndex <= 0;
  const atEnd = stepIndex >= steps.length - 1;

  return (
    <div
      className="w-full"
      style={{
        background: 'var(--surface-elevated)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-card)',
        padding: 'var(--space-3)',
      }}
    >
      <span
        className="mb-2 inline-block text-xs font-semibold"
        style={{
          color: 'var(--text-on-brand)',
          background: 'var(--brand-600)',
          borderRadius: 'var(--radius-chip)',
          padding: '2px 10px',
        }}
      >
        Pair elimination
      </span>

      <div className="mb-2 flex items-center justify-between gap-2">
        <span
          className="text-xs font-semibold"
          style={{ color: 'var(--text-tertiary)', letterSpacing: '0.04em' }}
        >
          STEP {stepIndex + 1} OF {steps.length}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onSkip}
            className="cursor-pointer px-2 py-0.5 text-sm font-semibold"
            style={{
              borderRadius: 'var(--radius-button)',
              color: 'var(--brand-600)',
            }}
          >
            Skip
          </button>
          <button
            type="button"
            onClick={() => onStep(-1)}
            disabled={atStart}
            aria-label="Previous step"
            className="cursor-pointer px-2 py-0.5 text-sm font-semibold"
            style={{
              borderRadius: 'var(--radius-button)',
              border: '1px solid var(--border)',
              color: 'var(--text-secondary)',
              opacity: atStart ? 0.3 : 1,
            }}
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => onStep(1)}
            disabled={atEnd}
            aria-label="Next step"
            className="cursor-pointer px-2 py-0.5 text-sm font-semibold"
            style={{
              borderRadius: 'var(--radius-button)',
              border: '1px solid var(--border)',
              color: 'var(--text-on-brand)',
              background: atEnd ? 'var(--text-tertiary)' : 'var(--brand-600)',
              opacity: atEnd ? 0.4 : 1,
            }}
          >
            ›
          </button>
        </div>
      </div>

      <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
        <HintText text={step.reason} onCellRef={onCellRef} />
      </p>

      <div className="mt-3 flex gap-1.5">
        {steps.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onJump(i)}
            aria-label={`Go to step ${i + 1}`}
            className="cursor-pointer"
            style={{
              flex: 1,
              height: 4,
              borderRadius: 999,
              background: i <= stepIndex ? 'var(--brand-600)' : 'var(--border)',
            }}
          />
        ))}
      </div>
    </div>
  );
}

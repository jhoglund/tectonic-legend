import type { HintChainEntry } from '../engine/hints';

/** Hint-chain role → its reserved board colour token. */
const ROLE_COLOR: Record<HintChainEntry['role'], string> = {
  target: 'var(--cell-assumption)',
  assumption: 'var(--cell-assumption)',
  deduction: 'var(--cell-deduction)',
  contradiction: 'var(--cell-contradiction)',
  conclusion: 'var(--cell-conclusion)',
  info: 'var(--cell-conclusion)',
};

interface ContradictionStepperProps {
  chain: HintChainEntry[];
  stepIndex: number;
  onStep: (delta: number) => void;
  onJump: (index: number) => void;
}

/**
 * The interactive contradiction-chain walkthrough. One step at a time,
 * colour-coded by role with the reserved hint-chain palette; the dot
 * track shows the assumption → deduction → contradiction → conclusion
 * arc at a glance.
 */
export function ContradictionStepper({
  chain,
  stepIndex,
  onStep,
  onJump,
}: ContradictionStepperProps) {
  const entry = chain[stepIndex];
  const atStart = stepIndex <= 0;
  const atEnd = stepIndex >= chain.length - 1;

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
      <div className="mb-2 flex items-center justify-between">
        <span
          className="text-xs font-semibold"
          style={{ color: 'var(--text-tertiary)', letterSpacing: '0.04em' }}
        >
          STEP {stepIndex + 1} OF {chain.length}
        </span>
        <div className="flex gap-1">
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

      <p
        className="text-sm font-medium"
        style={{ color: ROLE_COLOR[entry.role] }}
      >
        {entry.text}
      </p>

      <div className="mt-3 flex gap-1.5">
        {chain.map((step, i) => (
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
              background: i <= stepIndex ? ROLE_COLOR[step.role] : 'var(--border)',
            }}
          />
        ))}
      </div>
    </div>
  );
}

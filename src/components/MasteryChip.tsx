import {
  type TechniqueMastery,
  TECHNIQUE_LABELS,
  masteryState,
} from '../lib/progression';

interface MasteryChipProps {
  mastery: TechniqueMastery;
}

/**
 * A technique-mastery chip with the three states from progression.md
 * §3: `learning` (outline, muted), `familiar` (filled, brand), and
 * `mastered` (filled emerald, checkmark). Mastery is never shown as a
 * number — the chip is the whole surface.
 */
export function MasteryChip({ mastery }: MasteryChipProps) {
  const state = masteryState(mastery);
  const label = TECHNIQUE_LABELS[mastery.technique];

  const filled = state !== 'learning';
  const bg =
    state === 'mastered'
      ? 'var(--success)'
      : state === 'familiar'
        ? 'var(--brand-600)'
        : 'transparent';

  return (
    <span
      className="inline-flex items-center gap-1 text-xs font-medium"
      style={{
        background: bg,
        color: filled ? 'var(--text-on-brand)' : 'var(--text-tertiary)',
        border: filled ? '1px solid transparent' : '1px solid var(--border)',
        borderRadius: 'var(--radius-chip)',
        padding: '4px 10px',
      }}
    >
      {state === 'mastered' && (
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M20 6 9 17l-5-5" />
        </svg>
      )}
      {label}
    </span>
  );
}

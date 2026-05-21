import {
  type TechniqueMastery,
  type DepthSolveRecord,
  TECHNIQUE_LABELS,
  computeDepth,
  masteryState,
} from '../lib/progression';

interface MasteryChipProps {
  mastery: TechniqueMastery;
  /** When provided, the chip + bar read the depth score (ADR-0018);
   *  without it the chip falls back to the legacy raw-counter state
   *  (no progress bar drawn). */
  solveHistory?: readonly DepthSolveRecord[];
}

/**
 * A technique-mastery chip with the four states from progression.md §3:
 * `learning` (outline, muted), `familiar` (filled brand), `mastered`
 * (filled emerald, checkmark), and `legend` (filled emerald with a gem
 * glyph + a gold ring). Mastery is never shown as a number — the chip
 * + the non-numeric progress bar are the whole surface. When the
 * caller passes `solveHistory`, the bar appears beneath the chip; the
 * bar fills with the hidden depth score and is colour-keyed to the
 * chip state.
 */
export function MasteryChip({ mastery, solveHistory }: MasteryChipProps) {
  const state = masteryState(mastery, solveHistory);
  const label = TECHNIQUE_LABELS[mastery.technique];

  const filled = state !== 'learning';
  const bg =
    state === 'mastered' || state === 'legend'
      ? 'var(--success)'
      : state === 'familiar'
        ? 'var(--brand-600)'
        : 'transparent';

  // Legend chip: same emerald body, a gold ring + a ✦ glyph instead of
  // the checkmark — gem accents on the same "mastered" colour so the
  // climb reads as a higher tier without a brand-new palette entry.
  const ring = state === 'legend' ? '1px solid var(--warning)' : '0';

  const depth =
    solveHistory != null
      ? computeDepth(mastery.technique, mastery, solveHistory)
      : null;

  return (
    <div className="flex flex-col gap-1.5" style={{ minWidth: 0 }}>
      <span
        className="inline-flex items-center gap-1 self-start text-xs font-medium"
        style={{
          background: bg,
          color: filled ? 'var(--text-on-brand)' : 'var(--text-tertiary)',
          border: filled
            ? state === 'legend'
              ? ring
              : '1px solid transparent'
            : '1px solid var(--border)',
          boxShadow:
            state === 'legend'
              ? '0 0 0 2px color-mix(in oklch, var(--warning) 35%, transparent)'
              : undefined,
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
        {state === 'legend' && (
          <span
            aria-hidden="true"
            style={{
              fontSize: '13px',
              lineHeight: 1,
              color: 'var(--warning)',
              textShadow: '0 0 4px color-mix(in oklch, var(--warning) 70%, transparent)',
            }}
          >
            ✦
          </span>
        )}
        {label}
      </span>
      {depth != null && (
        <MasteryProgressBar state={state} depth={depth} />
      )}
    </div>
  );
}

/** Non-numeric depth-score progress bar (ADR-0018). Sits beneath the
 *  chip; the fill colour mirrors the chip state. */
function MasteryProgressBar({
  state,
  depth,
}: {
  state: ReturnType<typeof masteryState>;
  depth: number;
}) {
  const fillColor =
    state === 'legend'
      ? 'var(--warning)'
      : state === 'mastered'
        ? 'var(--success)'
        : state === 'familiar'
          ? 'var(--brand-600)'
          : 'var(--text-tertiary)';
  // A floor of ~3% keeps a sliver visible at depth 0, so the bar
  // always reads as a track-with-progress rather than an empty void.
  const pct = Math.max(3, Math.min(100, depth));
  return (
    <div
      aria-hidden="true"
      style={{
        width: '100%',
        height: 4,
        background: 'var(--border)',
        borderRadius: 999,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          width: `${pct}%`,
          height: '100%',
          background: fillColor,
          borderRadius: 999,
          transition: 'width var(--motion-base), background-color var(--motion-fast)',
        }}
      />
    </div>
  );
}

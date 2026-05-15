import { ScreenHeader } from '../components/ScreenHeader';
import { STAGE_NAMES, type PlayerStage } from '../lib/progression';

interface HomeLandingProps {
  stage: PlayerStage;
  onNewPuzzle: () => void;
}

/**
 * Home landing — v1 Phase 1, simplified composition (ADR-0011 A1).
 * Stage indicator + a single "New puzzle" entry point. The daily
 * puzzle, Resume card, and richer composition arrive in Phase 3.
 */
export function HomeLanding({ stage, onNewPuzzle }: HomeLandingProps) {
  return (
    <div>
      <ScreenHeader title="Tectonic" />
      <div className="flex flex-col gap-6 px-4 pt-2">
        <div
          style={{
            background: 'var(--surface-elevated)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-card)',
            padding: 'var(--space-4)',
          }}
        >
          <p
            className="mb-1 text-xs font-semibold"
            style={{ color: 'var(--text-tertiary)', letterSpacing: '0.06em' }}
          >
            YOUR STAGE
          </p>
          <p
            className="text-2xl font-semibold"
            style={{ color: 'var(--text-primary)' }}
          >
            {STAGE_NAMES[stage]}
          </p>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
            {stage === 0
              ? 'Start with the basics. Harder puzzles unlock as you master each technique.'
              : 'Keep solving — each technique you master opens the next difficulty.'}
          </p>
        </div>

        <button
          type="button"
          onClick={onNewPuzzle}
          className="cursor-pointer py-4 text-base font-semibold"
          style={{
            background: 'var(--brand-600)',
            color: 'var(--text-on-brand)',
            borderRadius: 'var(--radius-button)',
          }}
        >
          New puzzle
        </button>

        <p className="text-center text-xs" style={{ color: 'var(--text-tertiary)' }}>
          Daily puzzles and your streak arrive in a later build.
        </p>
      </div>
    </div>
  );
}

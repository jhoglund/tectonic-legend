import { MiniBoardIllustration } from '../components/MiniBoardIllustration';
import { PrimaryButton } from '../components/MaterialSurfaces';

interface WelcomeScreenProps {
  /** Begin the first Newcomer tutorial. */
  onStart: () => void;
  /** Skip the tutorials entirely and jump to Beginner. */
  onSkip: () => void;
}

/**
 * First-launch welcome — shown once, before the Newcomer tutorials
 * (specs/progression.md §4). Quiet, warm, adult: no hype, just a frame
 * for the journey ahead.
 */
export function WelcomeScreen({ onStart, onSkip }: WelcomeScreenProps) {
  return (
    <div
      className="flex min-h-screen flex-col px-6"
      style={{
        paddingTop: 'calc(env(safe-area-inset-top) + var(--space-8))',
        paddingBottom: 'calc(env(safe-area-inset-bottom) + var(--space-6))',
      }}
    >
      <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
        <MiniBoardIllustration />
        <h1
          className="text-2xl font-semibold"
          style={{ color: 'var(--text-primary)' }}
        >
          Learn to think in cages
        </h1>
        <p
          className="max-w-80 text-sm"
          style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}
        >
          Three short lessons teach the board, then harder puzzles open as you
          master each technique.
        </p>
      </div>

      <div className="flex flex-col gap-3 pt-6">
        <PrimaryButton onClick={onStart}>Start tour</PrimaryButton>
        <button
          type="button"
          onClick={onSkip}
          className="cursor-pointer py-2 text-sm font-medium"
          style={{ color: 'var(--text-tertiary)' }}
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}

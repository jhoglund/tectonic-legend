interface WelcomeScreenProps {
  /** Begin the first Newcomer tutorial. */
  onStart: () => void;
}

/**
 * First-launch welcome — shown once, before the Newcomer tutorials
 * (specs/progression.md §4). Quiet, warm, adult: no hype, just a frame
 * for the journey ahead.
 */
export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  return (
    <div
      className="flex min-h-screen flex-col justify-between px-6"
      style={{
        paddingTop: 'calc(env(safe-area-inset-top) + var(--space-12))',
        paddingBottom: 'calc(env(safe-area-inset-bottom) + var(--space-8))',
      }}
    >
      <div className="flex flex-col gap-6">
        <h1
          className="text-3xl font-semibold"
          style={{ color: 'var(--text-primary)' }}
        >
          Welcome to Tectonic
        </h1>
        <p
          className="text-base"
          style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}
        >
          A logic puzzle of cages and numbers. There is no guessing — every
          puzzle has a path you can reason out, one cell at a time.
        </p>
        <p
          className="text-base"
          style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}
        >
          Three short lessons teach you to read the board. As you master each
          technique, harder puzzles open up. Take it at your own pace.
        </p>
      </div>

      <button
        type="button"
        onClick={onStart}
        className="cursor-pointer py-4 text-base font-semibold"
        style={{
          background: 'var(--brand-600)',
          color: 'var(--text-on-brand)',
          borderRadius: 'var(--radius-button)',
        }}
      >
        Start
      </button>
    </div>
  );
}

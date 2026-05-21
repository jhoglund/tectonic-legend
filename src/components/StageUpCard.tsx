import { useEffect } from 'react';
import { type PlayerStage, STAGE_NAMES } from '../lib/progression';
import { analytics } from '../lib/analytics';

/**
 * One card per stage transition (progression.md §5). The headline names
 * the new stage; the body frames the technique the unlocked difficulty
 * asks for. Quiet, warm, adult — no confetti, no animation.
 */
const CARDS: Record<1 | 2 | 3 | 4 | 5, { headline: string; body: string }> = {
  1: {
    headline: "You're a Beginner now.",
    body: 'Easy puzzles are open. Every one can be solved with naked singles — a cell with a single number left, the move you just practised.',
  },
  2: {
    headline: "You're a Confident player now.",
    body: 'Medium puzzles are unlocked. Medium asks you to look for where a value can go, not just what value a cell must hold.',
  },
  3: {
    headline: "You're an Advanced player now.",
    body: 'Hard puzzles are open. They ask for forced moves — following a chain of consequences a few steps before you commit.',
  },
  4: {
    headline: "You're a Master now.",
    body: 'Expert puzzles are unlocked. They turn on contradiction chains — proving a value wrong by following it until it breaks.',
  },
  5: {
    headline: "You're a Legend now.",
    body: "You've worked every technique to its depth — the puzzle is yours. The climb continues from here.",
  },
};

interface StageUpCardProps {
  /** The stage just entered (1–5). */
  stage: PlayerStage;
  onContinue: () => void;
}

/**
 * The stage-up celebration — a single full-screen card shown once when
 * the player crosses a stage threshold (progression.md §5). Dismissed
 * by Continue; `celebratedStage` then keeps it from repeating.
 */
export function StageUpCard({ stage, onContinue }: StageUpCardProps) {
  // The card showing means the player just reached this stage.
  useEffect(() => {
    if (stage !== 0) analytics.stageReached(stage, STAGE_NAMES[stage]);
  }, [stage]);

  if (stage === 0) return null;
  const card = CARDS[stage];

  return (
    <div
      className="flex min-h-screen flex-col justify-between px-6"
      style={{
        paddingTop: 'calc(env(safe-area-inset-top) + var(--space-16))',
        paddingBottom: 'calc(env(safe-area-inset-bottom) + var(--space-8))',
      }}
    >
      <div className="flex flex-col gap-6">
        <p
          className="text-xs font-semibold"
          style={{ color: 'var(--brand-600)', letterSpacing: '0.08em' }}
        >
          NEW STAGE
        </p>
        <h1
          className="text-3xl font-semibold"
          style={{ color: 'var(--text-primary)', lineHeight: 1.25 }}
        >
          {card.headline}
        </h1>
        <p
          className="text-base"
          style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}
        >
          {card.body}
        </p>
      </div>

      <button
        type="button"
        onClick={onContinue}
        className="cursor-pointer py-4 text-base font-semibold"
        style={{
          background: 'var(--brand-600)',
          color: 'var(--text-on-brand)',
          borderRadius: 'var(--radius-button)',
        }}
      >
        Continue
      </button>
    </div>
  );
}

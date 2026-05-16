import type { Difficulty, GridSize } from '../engine/types';

/**
 * Mimir analytics — typed wrappers over the SDK's `track()`.
 *
 * The Mimir SDK `<script>` is injected into index.html by the Vite
 * config when `VITE_MIMIR_*` is configured (it must be parser-inserted
 * so the SDK can read its own `data-*` attributes). The SDK handles
 * pageviews and click / form autocapture on its own; this module only
 * emits the semantic game events.
 *
 * Every call is a safe no-op when analytics is not configured, and
 * works before the SDK has loaded — calls queue on `window.mimirq`,
 * which the SDK drains on load.
 */

const ENABLED = Boolean(import.meta.env.VITE_MIMIR_TOKEN);

declare global {
  interface Window {
    mimir?: { track: (name: string, props?: Record<string, unknown>) => void };
    /** Pre-load call queue — the SDK drains it iff it is an array at
     *  load time, so only push here while the SDK is not yet loaded. */
    mimirq?: unknown[];
  }
}

function track(name: string, props: Record<string, unknown> = {}): void {
  if (!ENABLED || typeof window === 'undefined') return;
  if (window.mimir) {
    window.mimir.track(name, props);
  } else {
    (window.mimirq ||= []).push(['track', name, props]);
  }
}

/** Semantic game events. Names are snake_case to read well in SQL. */
export const analytics = {
  puzzleStarted(difficulty: Difficulty, gridSize: GridSize): void {
    track('puzzle_started', { difficulty, gridSize });
  },
  puzzleSolved(args: {
    difficulty: Difficulty;
    gridSize: GridSize;
    timeMs: number;
    hintCount: number;
    selfAppliedCount: number;
  }): void {
    track('puzzle_solved', args);
  },
  puzzleShared(difficulty: Difficulty, gridSize: GridSize): void {
    track('puzzle_shared', { difficulty, gridSize });
  },
  hintUsed(mode: string): void {
    track('hint_used', { mode });
  },
  tutorialCompleted(index: number, id: string): void {
    track('tutorial_completed', { index, id });
  },
  tutorialSkipped(): void {
    track('tutorial_skipped');
  },
  stageReached(stage: number, stageName: string): void {
    track('stage_reached', { stage, stageName });
  },
  voucherRedeemed(days: number): void {
    track('voucher_redeemed', { days, lifetime: days === 0 });
  },
  paywallShown(trigger: string): void {
    track('paywall_shown', { trigger });
  },
  paywallDismissed(trigger: string): void {
    track('paywall_dismissed', { trigger });
  },
  purchaseStarted(plan: string): void {
    track('purchase_started', { sku: plan });
  },
};


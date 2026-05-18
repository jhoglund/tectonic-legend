import { useEffect, useRef, useState } from 'react';
import { Board } from '../components/Board';
import { MasteryChip } from '../components/MasteryChip';
import type { GameState, Difficulty, GridSize } from '../engine/types';
import { useProfile } from '../lib/profileContext';
import { analytics } from '../lib/analytics';
import { buildShareText, shareGrid } from '../lib/shareArtifact';
import type { SolveTechniqueTally } from '../lib/profile';
import { TECHNIQUE_NAMES, type TechniqueName } from '../lib/progression';

const TECHNIQUE_LABEL: Record<string, string> = {
  naked_single: 'Naked single',
  hidden_single: 'Hidden single',
  domination: 'Forced move',
  contradiction: 'Contradiction chain',
  reveal: 'Revealed cell',
};

/** Hint.type → progression TechniqueName. 'reveal' is not a technique. */
const HINT_TO_TECHNIQUE: Record<string, TechniqueName> = {
  naked_single: 'naked-single',
  hidden_single: 'hidden-single',
  domination: 'forced-move',
  contradiction: 'contradiction-chain',
};

const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
  expert: 'Expert',
};

interface SolvedScreenProps {
  gameState: GameState;
  elapsedSeconds: number;
  difficulty: Difficulty;
  gridSize: GridSize;
  /** Logic-hint techniques surfaced this solve, keyed by Hint.type. */
  techniquesUsed: Record<string, number>;
  /** Unaided technique applications this solve, keyed by Hint.type. */
  selfAppliedMoves: Record<string, number>;
  /** Whether this solve was the daily puzzle. */
  isDaily: boolean;
  getShareUrl: () => string | null;
  /** Snapshot of cells the hint engine surfaced — colours the artifact. */
  getHintedCells: () => Set<string>;
  onExit: () => void;
}

/**
 * The post-solve summary — solve time, the per-solve hint breakdown,
 * technique-mastery chips, and the shareable solve artifact (ADR-0004).
 * Cohort/percentile is deliberately absent (ADR-0011 — needs a backend).
 */
export function SolvedScreen({
  gameState,
  elapsedSeconds,
  difficulty,
  gridSize,
  techniquesUsed,
  selfAppliedMoves,
  isDaily,
  getShareUrl,
  getHintedCells,
  onExit,
}: SolvedScreenProps) {
  const [copied, setCopied] = useState(false);
  const { profile, recordSolve } = useProfile();
  // One-time snapshot at mount — the game is over, so it is stable.
  const [hintedCells] = useState(getHintedCells);

  const timeStr = `${Math.floor(elapsedSeconds / 60)}:${String(elapsedSeconds % 60).padStart(2, '0')}`;
  const techniqueRows = Object.entries(techniquesUsed).filter(([, n]) => n > 0);
  const hintCount = Object.values(techniquesUsed).reduce((a, b) => a + b, 0);

  // Techniques the player has any history with — their mastery chips
  // reflect the profile *after* this solve has been recorded.
  const masteryTechniques = TECHNIQUE_NAMES.filter(
    (t) => profile.techniques[t].usedCount > 0,
  );

  // Record the finished solve into the profile exactly once. The ref
  // guard keeps it idempotent under StrictMode's double-invoke.
  const recorded = useRef(false);
  useEffect(() => {
    if (recorded.current) return;
    recorded.current = true;
    // Merge assisted (hint) and self-applied counts per technique:
    // used = assisted + selfApplied, selfApplied = the unaided subset.
    const types = new Set([
      ...Object.keys(techniquesUsed),
      ...Object.keys(selfAppliedMoves),
    ]);
    const techniques: SolveTechniqueTally[] = [...types]
      .map((type) => {
        const technique = HINT_TO_TECHNIQUE[type];
        if (!technique) return null;
        const self = selfAppliedMoves[type] ?? 0;
        const assisted = techniquesUsed[type] ?? 0;
        return { technique, used: assisted + self, selfApplied: self };
      })
      .filter((t): t is SolveTechniqueTally => t !== null);
    recordSolve({
      difficulty,
      gridSize,
      timeMs: elapsedSeconds * 1000,
      isDailyPuzzle: isDaily,
      techniques,
    });

    const sum = (r: Record<string, number>) =>
      Object.values(r).reduce((a, b) => a + b, 0);
    analytics.puzzleSolved({
      difficulty,
      gridSize,
      timeMs: elapsedSeconds * 1000,
      hintCount: sum(techniquesUsed),
      selfAppliedCount: sum(selfAppliedMoves),
    });
    // Mount-once: inputs are captured at solve time and don't change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleShare() {
    const text = buildShareText({
      gameState,
      difficulty,
      elapsedSeconds,
      hintCount,
      hintedCells,
      isDaily,
      url: getShareUrl(),
    });
    analytics.puzzleShared(difficulty, gridSize);
    // Native share sheet on iOS; clipboard everywhere else.
    if (navigator.share) {
      try {
        await navigator.share({ text });
      } catch {
        // player dismissed the share sheet — nothing to do
      }
    } else {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div
      className="flex flex-col items-center gap-5 px-4 pb-12"
      style={{ paddingTop: 'calc(env(safe-area-inset-top) + 28px)' }}
    >
      <p
        className="text-sm font-semibold"
        style={{ color: 'var(--success)', letterSpacing: '0.06em' }}
      >
        SOLVED
      </p>
      <p
        className="text-4xl font-semibold"
        style={{
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-mono)',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {timeStr}
      </p>

      <Board
        gameState={gameState}
        selectedCell={null}
        hint={null}
        cellOverlays={null}
        onCellClick={() => {}}
      />

      {/* this-solve summary */}
      <div
        className="w-full"
        style={{
          background: 'var(--surface-elevated)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-card)',
          overflow: 'hidden',
        }}
      >
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Puzzle
          </span>
          <span
            className="text-sm font-medium"
            style={{ color: 'var(--text-primary)' }}
          >
            {DIFFICULTY_LABEL[difficulty]} · {gridSize === '5x5' ? '5×5' : '8×8'}
          </span>
        </div>

        <div style={{ borderTop: '1px solid var(--border)' }} />

        {techniqueRows.length === 0 ? (
          <p className="px-4 py-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
            No hints used — you solved this one yourself.
          </p>
        ) : (
          techniqueRows.map(([type, count]) => (
            <div
              key={type}
              className="flex items-center justify-between px-4 py-3"
              style={{ borderTop: '1px solid var(--border)' }}
            >
              <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                {TECHNIQUE_LABEL[type] ?? type}
              </span>
              <span
                className="text-sm font-medium"
                style={{
                  color: 'var(--text-tertiary)',
                  fontFamily: 'var(--font-mono)',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                ×{count}
              </span>
            </div>
          ))
        )}
      </div>

      {/* technique mastery — recognition of where the player stands */}
      {masteryTechniques.length > 0 && (
        <div
          className="w-full"
          style={{
            background: 'var(--surface-elevated)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-card)',
            padding: 'var(--space-4)',
          }}
        >
          <p
            className="mb-3 text-xs font-semibold"
            style={{ color: 'var(--text-tertiary)', letterSpacing: '0.06em' }}
          >
            TECHNIQUE MASTERY
          </p>
          <div className="flex flex-wrap gap-2">
            {masteryTechniques.map((t) => (
              <MasteryChip key={t} mastery={profile.techniques[t]} />
            ))}
          </div>
        </div>
      )}

      {/* shareable solve artifact — a spoiler-free brag (ADR-0004) */}
      <div
        className="flex w-full flex-col items-center gap-3"
        style={{
          background: 'var(--surface-elevated)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-card)',
          padding: 'var(--space-4)',
        }}
      >
        <div
          style={{
            whiteSpace: 'pre',
            lineHeight: 1.05,
            fontSize: '1.5rem',
            textAlign: 'center',
          }}
        >
          {shareGrid(gameState, hintedCells)}
        </div>
        <button
          type="button"
          onClick={handleShare}
          className="w-full cursor-pointer py-3 text-base font-medium"
          style={{
            color: 'var(--brand-600)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-button)',
          }}
        >
          {copied ? 'Copied' : 'Share result'}
        </button>
      </div>

      <button
        type="button"
        onClick={onExit}
        className="w-full cursor-pointer py-3.5 text-base font-semibold"
        style={{
          background: 'var(--brand-600)',
          color: 'var(--text-on-brand)',
          borderRadius: 'var(--radius-button)',
        }}
      >
        Done
      </button>
    </div>
  );
}

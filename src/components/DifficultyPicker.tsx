import { useState } from 'react';
import type { Difficulty, GridSize } from '../engine/types';
import {
  DIFFICULTY_UNLOCK,
  isDifficultyUnlocked,
  type PlayerStage,
} from '../lib/progression';

const DIFFICULTIES: { id: Difficulty; label: string; blurb: string }[] = [
  { id: 'easy', label: 'Easy', blurb: 'Naked singles' },
  { id: 'medium', label: 'Medium', blurb: 'Hidden singles' },
  { id: 'hard', label: 'Hard', blurb: 'Forced moves' },
  { id: 'expert', label: 'Expert', blurb: 'Contradiction chains' },
];

/**
 * Difficulty is player-choice — stage gating is off by decision
 * (ADR-0012). The lock rendering and `isDifficultyUnlocked` logic are
 * kept intact, dormant behind this flag; flipping it back on is a
 * one-line change should soft-launch data argue for it.
 */
const STAGE_GATING_ENABLED = false;

interface DifficultyPickerProps {
  open: boolean;
  stage: PlayerStage;
  onClose: () => void;
  onStart: (difficulty: Difficulty, gridSize: GridSize) => void;
}

/** Padlock glyph for a stage-locked difficulty row. */
function LockIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}

/**
 * The single merged difficulty entry point (ADR-0011 A2) — a bottom
 * sheet. Difficulties above the player's stage are shown locked with
 * the requirement to unlock them (progression.md §1).
 */
export function DifficultyPicker({
  open,
  stage,
  onClose,
  onStart,
}: DifficultyPickerProps) {
  const [size, setSize] = useState<GridSize>('5x5');
  if (!open) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 flex items-end justify-center"
      style={{ background: 'var(--overlay, rgba(0,0,0,0.4))', zIndex: 50 }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex w-full flex-col"
        style={{
          maxWidth: '430px',
          background: 'var(--surface-elevated)',
          borderTopLeftRadius: 'var(--radius-modal)',
          borderTopRightRadius: 'var(--radius-modal)',
          padding: 'var(--space-4)',
          paddingBottom: 'calc(env(safe-area-inset-bottom) + var(--space-4))',
        }}
      >
        <div
          className="mx-auto mb-4"
          style={{ width: 36, height: 5, borderRadius: 999, background: 'var(--border)' }}
        />
        <h2 className="mb-1 text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
          New puzzle
        </h2>
        <p className="mb-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
          Pick a grid size and difficulty.
        </p>

        {/* grid-size segmented control */}
        <div
          className="mb-4 flex gap-1 p-1"
          style={{ background: 'var(--surface-track)', borderRadius: 'var(--radius-button)' }}
        >
          {(['5x5', '8x8'] as GridSize[]).map((s) => {
            const active = size === s;
            return (
              <button
                key={s}
                type="button"
                onClick={() => setSize(s)}
                className="flex-1 cursor-pointer py-2 text-sm font-medium"
                style={{
                  borderRadius: 'calc(var(--radius-button) - 2px)',
                  background: active ? 'var(--surface-elevated)' : 'transparent',
                  color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                  boxShadow: active ? 'var(--shadow-cell)' : 'none',
                }}
              >
                {s === '5x5' ? '5×5' : '8×8'}
              </button>
            );
          })}
        </div>

        {/* difficulty rows */}
        <div
          className="flex flex-col"
          style={{
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-card)',
            overflow: 'hidden',
          }}
        >
          {DIFFICULTIES.map((d, i) => {
            const unlocked =
              !STAGE_GATING_ENABLED || isDifficultyUnlocked(stage, d.id);
            return (
              <button
                key={d.id}
                type="button"
                disabled={!unlocked}
                onClick={() => unlocked && onStart(d.id, size)}
                className="flex items-center justify-between px-4 py-3 text-left"
                style={{
                  background: 'var(--surface-elevated)',
                  borderTop: i > 0 ? '1px solid var(--border)' : 'none',
                  cursor: unlocked ? 'pointer' : 'default',
                  opacity: unlocked ? 1 : 0.55,
                }}
              >
                <span className="flex flex-col">
                  <span
                    className="text-base font-medium"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {d.label}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                    {unlocked
                      ? d.blurb
                      : `${DIFFICULTY_UNLOCK[d.id].requirement} to unlock`}
                  </span>
                </span>
                <span style={{ color: 'var(--text-tertiary)' }}>
                  {unlocked ? '›' : <LockIcon />}
                </span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-4 cursor-pointer py-3 text-base font-medium"
          style={{ color: 'var(--brand-600)' }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

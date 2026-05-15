import { useState } from 'react';
import type { Difficulty, GridSize } from '../engine/types';

const DIFFICULTIES: { id: Difficulty; label: string; blurb: string }[] = [
  { id: 'easy', label: 'Easy', blurb: 'Naked singles' },
  { id: 'medium', label: 'Medium', blurb: 'Hidden singles' },
  { id: 'hard', label: 'Hard', blurb: 'Forced moves' },
  { id: 'expert', label: 'Expert', blurb: 'Contradiction chains' },
];

interface DifficultyPickerProps {
  open: boolean;
  onClose: () => void;
  onStart: (difficulty: Difficulty, gridSize: GridSize) => void;
}

/**
 * The single merged difficulty entry point (ADR-0011 A2) — a bottom
 * sheet. Stage-gated locked rows are Phase 2 (backlog item 9); for
 * now every difficulty is selectable.
 */
export function DifficultyPicker({ open, onClose, onStart }: DifficultyPickerProps) {
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
          style={{ background: 'var(--surface)', borderRadius: 'var(--radius-button)' }}
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
          {DIFFICULTIES.map((d, i) => (
            <button
              key={d.id}
              type="button"
              onClick={() => onStart(d.id, size)}
              className="flex cursor-pointer items-center justify-between px-4 py-3 text-left"
              style={{
                background: 'var(--surface-elevated)',
                borderTop: i > 0 ? '1px solid var(--border)' : 'none',
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
                  {d.blurb}
                </span>
              </span>
              <span style={{ color: 'var(--text-tertiary)' }}>›</span>
            </button>
          ))}
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

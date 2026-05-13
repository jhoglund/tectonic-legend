import { useState, useRef, useEffect } from 'react';
import type { Difficulty, GridSize, HintMode } from '../engine/types';
import type { Hint } from '../engine/hints';

const HINT_OPTIONS: { mode: HintMode; label: string; description: string }[] = [
  { mode: 'logic', label: 'Logic Hint', description: 'Explains the next logical deduction' },
  { mode: 'candidates', label: 'Show Candidates', description: 'Shows possible values for selected cell' },
  { mode: 'reveal', label: 'Reveal Cell', description: 'Fills in the correct answer' },
  { mode: 'check', label: 'Check Errors', description: 'Highlights mistakes on the board' },
];

interface GameControlsProps {
  difficulty: Difficulty;
  gridSize: GridSize;
  hint: Hint | null;
  hintMode: HintMode;
  onNewGame: (difficulty: Difficulty, size?: GridSize) => void;
  onNumberInput: (num: number) => void;
  onClear: () => void;
  onToggleNotes: () => void;
  onHint: (mode?: HintMode) => void;
  onHintModeChange: (mode: HintMode) => void;
  notesMode: boolean;
  maxNumber: number;
  isSolved: boolean;
}

export function GameControls({
  difficulty,
  gridSize,
  hint,
  hintMode,
  onNewGame,
  onNumberInput,
  onClear,
  onToggleNotes,
  onHint,
  onHintModeChange,
  notesMode,
  maxNumber,
  isSolved,
}: GameControlsProps) {
  const [hintDropdownOpen, setHintDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setHintDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-md">
      {isSolved && (
        <div className="text-green-600 font-bold text-xl py-2">
          Puzzle Solved!
        </div>
      )}

      {hint && (
        <div className="bg-amber-50 border border-amber-300 rounded-lg px-4 py-3 text-sm text-amber-800 text-left w-full max-h-64 overflow-y-auto">
          <span className="font-semibold">Hint:</span>
          {hint.steps ? (
            <div className="mt-1 space-y-0.5">
              {hint.steps.map((step, i) => (
                <div
                  key={i}
                  className={
                    step.startsWith('→')
                      ? 'pl-3 text-amber-700'
                      : step.startsWith('Assume')
                        ? 'font-medium mt-2'
                        : step.startsWith('So ')
                          ? 'text-red-700 font-medium'
                          : step.startsWith('Therefore')
                            ? 'text-green-700 font-semibold mt-2'
                            : ''
                  }
                >
                  {step}
                </div>
              ))}
            </div>
          ) : (
            <span> {hint.reason}</span>
          )}
        </div>
      )}

      {/* Number buttons */}
      <div className="flex gap-1.5 flex-wrap justify-center">
        {Array.from({ length: maxNumber }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            onClick={() => onNumberInput(n)}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-slate-100 hover:bg-slate-200
              text-slate-800 font-semibold text-lg transition-colors
              border border-slate-300 active:bg-slate-300"
          >
            {n}
          </button>
        ))}
        <button
          onClick={onClear}
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-red-50 hover:bg-red-100
            text-red-600 font-semibold text-sm transition-colors
            border border-red-200 active:bg-red-200"
        >
          X
        </button>
      </div>

      {/* Notes toggle + Hint dropdown */}
      <div className="flex gap-2 items-center">
        <button
          onClick={onToggleNotes}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border
            ${
              notesMode
                ? 'bg-blue-100 text-blue-700 border-blue-300'
                : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
            }`}
        >
          {notesMode ? 'Notes: ON' : 'Notes: OFF'}
        </button>

        <div className="relative" ref={dropdownRef}>
          <div className="flex">
            <button
              onClick={() => onHint(hintMode)}
              className="px-4 py-2 rounded-l-lg text-sm font-medium transition-colors border
                bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100"
            >
              {HINT_OPTIONS.find((h) => h.mode === hintMode)?.label ?? 'Hint'}
            </button>
            <button
              onClick={() => setHintDropdownOpen((prev) => !prev)}
              className="px-2 py-2 rounded-r-lg text-sm font-medium transition-colors border-t border-r border-b
                bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {hintDropdownOpen && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-10 min-w-[220px]">
              {HINT_OPTIONS.map((opt) => (
                <button
                  key={opt.mode}
                  onClick={() => {
                    onHintModeChange(opt.mode);
                    onHint(opt.mode);
                    setHintDropdownOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm hover:bg-amber-50 first:rounded-t-lg last:rounded-b-lg transition-colors
                    ${hintMode === opt.mode ? 'bg-amber-50 text-amber-800 font-medium' : 'text-slate-700'}`}
                >
                  <div className="font-medium">{opt.label}</div>
                  <div className="text-xs text-slate-400">{opt.description}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Grid size + Difficulty */}
      <div className="flex flex-col items-center gap-2 mt-2">
        <div className="flex gap-2">
          {(['5x5', '8x8'] as GridSize[]).map((size) => (
            <button
              key={size}
              onClick={() => onNewGame(difficulty, size)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border
                ${
                  gridSize === size
                    ? 'bg-slate-800 text-white border-slate-800'
                    : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                }`}
            >
              {size}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {(['easy', 'medium', 'hard', 'expert'] as Difficulty[]).map((d) => (
            <button
              key={d}
              onClick={() => onNewGame(d)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border
                ${
                  difficulty === d
                    ? 'bg-slate-800 text-white border-slate-800'
                    : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                }`}
            >
              {d.charAt(0).toUpperCase() + d.slice(1)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

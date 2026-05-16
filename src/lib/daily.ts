import type { Difficulty, GridSize } from '../engine/types';

/**
 * The daily puzzle (ADR-0010) — client-only, deterministic. The UTC day
 * seeds the generator, so every player gets the same puzzle for a date
 * with zero backend. The weekday sets the difficulty.
 */

/** Weekday → difficulty. Index 0 = Sunday. A gentle start to the week,
 *  ramping to an Expert on Saturday. (ADR-0010 named Sunday "curated";
 *  v1 simplifies that to Easy — curated tutorial puzzles are separate.) */
const WEEKDAY_DIFFICULTY: Difficulty[] = [
  'easy', // Sun
  'easy', // Mon
  'easy', // Tue
  'medium', // Wed
  'medium', // Thu
  'hard', // Fri
  'expert', // Sat
];

export interface DailyPuzzleSpec {
  /** UTC day key, YYYY-MM-DD — also the solve-history match key. */
  dateKey: string;
  difficulty: Difficulty;
  gridSize: GridSize;
  /** Deterministic generator seed for this date. */
  seed: number;
}

/** YYYY-MM-DD for a UTC date. */
function utcDateKey(y: number, m: number, d: number): string {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

/**
 * The daily puzzle spec for a date (defaults to today), computed in UTC
 * so the rollover is the same instant worldwide.
 */
export function dailyPuzzleSpec(date: Date = new Date()): DailyPuzzleSpec {
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth();
  const d = date.getUTCDate();
  const dayIndex = Math.floor(Date.UTC(y, m, d) / 86_400_000);
  const weekday = new Date(Date.UTC(y, m, d)).getUTCDay();
  return {
    dateKey: utcDateKey(y, m, d),
    difficulty: WEEKDAY_DIFFICULTY[weekday],
    gridSize: '5x5',
    // Knuth multiplicative hash — spreads adjacent days far apart so
    // consecutive dailies don't feel similar.
    seed: (dayIndex * 2654435761) >>> 0,
  };
}

import type { Difficulty, GameState } from '../engine/types';
import { posKey } from '../engine/types';

/**
 * The shareable solve artifact (ADR-0004) — a compact, spoiler-free,
 * paste-anywhere text block, Wordle-style. No numbers leak, so a
 * recipient can still play the puzzle. v1 is text rather than a
 * rendered image: text is universally shareable and proved the viral
 * mechanic for Wordle. An image artifact can come later.
 *
 * Each cell is one square:
 *   ⬜ a given clue   🟩 you solved it unaided   🟨 you used a hint
 */

const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
  expert: 'Expert',
};

export interface ShareArtifactArgs {
  gameState: GameState;
  difficulty: Difficulty;
  elapsedSeconds: number;
  hintCount: number;
  /** posKey()s of cells the hint engine surfaced this game. */
  hintedCells: Set<string>;
  isDaily: boolean;
  /** Challenge URL to append, if any. */
  url: string | null;
}

/** The emoji grid alone — used for the on-screen preview. */
export function shareGrid(
  gameState: GameState,
  hintedCells: Set<string>,
): string {
  const { rows, cols } = gameState.puzzle.layout;
  const { isClue } = gameState;
  const lines: string[] = [];
  for (let r = 0; r < rows; r++) {
    let line = '';
    for (let c = 0; c < cols; c++) {
      if (isClue[r][c]) line += '⬜';
      else if (hintedCells.has(posKey(r, c))) line += '🟨';
      else line += '🟩';
    }
    lines.push(line);
  }
  return lines.join('\n');
}

/** The full shareable text block. */
export function buildShareText(args: ShareArtifactArgs): string {
  const { gameState, difficulty, elapsedSeconds, hintCount, hintedCells, isDaily, url } =
    args;
  const { rows, cols } = gameState.puzzle.layout;

  const time = `${Math.floor(elapsedSeconds / 60)}:${String(
    elapsedSeconds % 60,
  ).padStart(2, '0')}`;
  const header = `Tectonic — ${isDaily ? 'Daily · ' : ''}${
    DIFFICULTY_LABEL[difficulty]
  } ${rows}×${cols}`;
  const hintLine =
    hintCount === 0
      ? 'no hints'
      : `${hintCount} hint${hintCount > 1 ? 's' : ''}`;

  const parts = [
    header,
    `${time} · ${hintLine}`,
    '',
    shareGrid(gameState, hintedCells),
  ];
  if (url) parts.push('', url);
  return parts.join('\n');
}

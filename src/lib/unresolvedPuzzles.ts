import type { Difficulty, GameState, GridSize } from '../engine/types';
import { encodeState, decodeState } from '../engine/urlCodec';
import { createGameState } from './gameState';

const STORAGE_KEY = 'tectonic.unresolvedPuzzles';
const MAX_UNRESOLVED = 20;

export interface UnresolvedPuzzle {
  id: string;
  encodedState: string;
  difficulty: Difficulty;
  gridSize: GridSize;
  isDailyPuzzle: boolean;
  createdAt: string;
  updatedAt: string;
  elapsedSeconds: number;
}

export function createUnresolvedPuzzleId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `puzzle-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function readStored(): UnresolvedPuzzle[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isUnresolvedPuzzle);
  } catch {
    return [];
  }
}

function writeStored(items: UnresolvedPuzzle[]): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Storage can be disabled or full. In-progress puzzle persistence is
    // helpful, not critical, so fail quietly.
  }
}

function isUnresolvedPuzzle(value: unknown): value is UnresolvedPuzzle {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === 'string' &&
    typeof v.encodedState === 'string' &&
    (v.difficulty === 'easy' ||
      v.difficulty === 'medium' ||
      v.difficulty === 'hard' ||
      v.difficulty === 'expert') &&
    (v.gridSize === '5x5' || v.gridSize === '8x8') &&
    typeof v.isDailyPuzzle === 'boolean' &&
    typeof v.createdAt === 'string' &&
    typeof v.updatedAt === 'string' &&
    typeof v.elapsedSeconds === 'number'
  );
}

function isDecodable(item: UnresolvedPuzzle): boolean {
  return decodeState(item.encodedState) !== null;
}

export function listUnresolvedPuzzles(): UnresolvedPuzzle[] {
  const stored = readStored();
  const valid = stored
    .filter(isDecodable)
    .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))
    .slice(0, MAX_UNRESOLVED);
  if (valid.length !== stored.length) writeStored(valid);
  return valid;
}

export function unresolvedPuzzleToGameState(item: UnresolvedPuzzle): GameState | null {
  const decoded = decodeState(item.encodedState);
  if (!decoded) return null;
  return createGameState(decoded.puzzle, decoded.grid);
}

export function unresolvedCellsLeft(item: UnresolvedPuzzle): number {
  const decoded = decodeState(item.encodedState);
  if (!decoded) return 0;
  return decoded.grid.flat().filter((value) => value === 0).length;
}

export function upsertUnresolvedPuzzle(input: {
  id: string;
  gameState: GameState;
  difficulty: Difficulty;
  gridSize: GridSize;
  isDailyPuzzle: boolean;
  elapsedSeconds: number;
}): void {
  const now = new Date().toISOString();
  const existing = readStored().find((item) => item.id === input.id);
  const next: UnresolvedPuzzle = {
    id: input.id,
    encodedState: encodeState(
      input.gameState.puzzle,
      input.gameState.grid,
      input.difficulty,
    ),
    difficulty: input.difficulty,
    gridSize: input.gridSize,
    isDailyPuzzle: input.isDailyPuzzle,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    elapsedSeconds: input.elapsedSeconds,
  };
  const items = [
    next,
    ...readStored().filter((item) => item.id !== input.id),
  ]
    .filter(isDecodable)
    .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))
    .slice(0, MAX_UNRESOLVED);
  writeStored(items);
}

export function removeUnresolvedPuzzle(id: string): void {
  writeStored(readStored().filter((item) => item.id !== id));
}

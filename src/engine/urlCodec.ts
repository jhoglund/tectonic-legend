import type { Puzzle, PuzzleLayout, Group, Difficulty, GridSize } from './types';
import { posKey } from './types';
import { buildNeighborCache, buildCellGroupMap } from './validator';

const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard', 'expert'];

class BitWriter {
  private bytes: number[] = [];
  private current = 0;
  private bitPos = 0;

  write(value: number, bits: number): void {
    for (let i = bits - 1; i >= 0; i--) {
      if (value & (1 << i)) {
        this.current |= 1 << (7 - this.bitPos);
      }
      this.bitPos++;
      if (this.bitPos === 8) {
        this.bytes.push(this.current);
        this.current = 0;
        this.bitPos = 0;
      }
    }
  }

  finish(): Uint8Array {
    if (this.bitPos > 0) {
      this.bytes.push(this.current);
    }
    return new Uint8Array(this.bytes);
  }
}

class BitReader {
  private bytes: Uint8Array;
  private bytePos = 0;
  private bitPos = 0;

  constructor(bytes: Uint8Array) {
    this.bytes = bytes;
  }

  read(bits: number): number {
    let value = 0;
    for (let i = 0; i < bits; i++) {
      value <<= 1;
      if (this.bytePos < this.bytes.length) {
        if (this.bytes[this.bytePos] & (1 << (7 - this.bitPos))) {
          value |= 1;
        }
        this.bitPos++;
        if (this.bitPos === 8) {
          this.bytePos++;
          this.bitPos = 0;
        }
      }
    }
    return value;
  }
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(str: string): Uint8Array {
  const padded = str.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function rebuildLayout(rows: number, cols: number, cellGroupIds: number[][]): PuzzleLayout {
  const groupMap = new Map<number, { row: number; col: number }[]>();
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const gid = cellGroupIds[r][c];
      if (!groupMap.has(gid)) groupMap.set(gid, []);
      groupMap.get(gid)!.push({ row: r, col: c });
    }
  }

  const groups: Group[] = [];
  for (const [id, cells] of groupMap) {
    groups.push({ id, cells });
  }
  groups.sort((a, b) => a.id - b.id);

  const cellToGroup = new Map<string, number>();
  for (const group of groups) {
    for (const { row, col } of group.cells) {
      cellToGroup.set(posKey(row, col), group.id);
    }
  }

  return {
    rows,
    cols,
    groups,
    cellToGroup,
    neighbors: buildNeighborCache(rows, cols),
    cellGroup: buildCellGroupMap(rows, cols, groups),
  };
}

export interface EncodedState {
  puzzle: Puzzle;
  grid: number[][];
  difficulty: Difficulty;
  gridSize: GridSize;
}

export function encodeState(
  puzzle: Puzzle,
  grid: number[][],
  difficulty: Difficulty
): string {
  const { rows, cols, cellGroup } = puzzle.layout;
  const w = new BitWriter();

  // Byte 0: version(4) | gridType(1) | difficulty(2) | reserved(1)
  const version = 1;
  const gridType = rows === 8 ? 1 : 0;
  const diffIdx = DIFFICULTIES.indexOf(difficulty);
  w.write(version, 4);
  w.write(gridType, 1);
  w.write(diffIdx, 2);
  w.write(0, 1);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      w.write(cellGroup[r][c], 5);
      w.write(puzzle.clues[r][c], 3);
      w.write(puzzle.solution[r][c], 3);
      w.write(grid[r][c], 3);
    }
  }

  return toBase64Url(w.finish());
}

export function decodeState(encoded: string): EncodedState | null {
  try {
    const bytes = fromBase64Url(encoded);
    const rd = new BitReader(bytes);

    const version = rd.read(4);
    if (version !== 1) return null;

    const gridType = rd.read(1);
    const diffIdx = rd.read(2);
    rd.read(1); // reserved

    const rows = gridType === 1 ? 8 : 5;
    const cols = rows;
    const difficulty = DIFFICULTIES[diffIdx];
    const gridSize: GridSize = gridType === 1 ? '8x8' : '5x5';

    const cellGroupIds: number[][] = Array.from({ length: rows }, () => Array(cols).fill(0));
    const clues: number[][] = Array.from({ length: rows }, () => Array(cols).fill(0));
    const solution: number[][] = Array.from({ length: rows }, () => Array(cols).fill(0));
    const grid: number[][] = Array.from({ length: rows }, () => Array(cols).fill(0));

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        cellGroupIds[r][c] = rd.read(5);
        clues[r][c] = rd.read(3);
        solution[r][c] = rd.read(3);
        grid[r][c] = rd.read(3);
      }
    }

    const layout = rebuildLayout(rows, cols, cellGroupIds);
    const puzzle: Puzzle = { layout, clues, solution };

    return { puzzle, grid, difficulty, gridSize };
  } catch {
    return null;
  }
}

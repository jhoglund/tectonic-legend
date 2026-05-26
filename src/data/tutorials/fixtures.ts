import type { TutorialData } from './types';

/**
 * The three Newcomer tutorial puzzles (specs/progression.md §4).
 * `cellGroups` and `solution` were produced by the engine generator,
 * so each board satisfies the cage and adjacency rules. `steps` are
 * ordered to make the beginner journey progressively more demanding:
 * read one cage, complete cages, then combine cage + neighbour logic.
 */
export const TUTORIAL_FIXTURES: TutorialData[] = [
  {
    id: 'reading-the-board',
    title: 'Read a cage',
    intro:
      'Start with the cage rule. An outlined cage of three holds 1, 2 and 3, once each. Read the cage, find the missing value, then place it.',
    rows: 5,
    cols: 5,
    cellGroups: [
      [5, 5, 0, 0, 0],
      [5, 4, 4, 4, 0],
      [3, 1, 1, 4, 4],
      [3, 6, 6, 2, 2],
      [3, 6, 6, 2, 2],
    ],
    solution: [
      [1, 2, 1, 4, 2],
      [3, 4, 3, 5, 3],
      [2, 1, 2, 1, 2],
      [3, 4, 3, 4, 3],
      [1, 2, 1, 2, 1],
    ],
    steps: [
      {
        row: 0,
        col: 0,
        value: 1,
        explanation:
          'This cage has three cells, so it holds 1, 2 and 3. Two of them are already placed — only 1 is missing.',
      },
      {
        row: 2,
        col: 2,
        value: 2,
        explanation:
          'This cage holds 1 and 2. The cage already has 1, so this cell must be 2.',
      },
      {
        row: 4,
        col: 3,
        value: 2,
        explanation:
          'A four-cell cage holds 1 to 4. This one already has 1, 3 and 4 — so the gap is 2.',
      },
    ],
  },
  {
    id: 'cage-completion',
    title: 'Complete a cage',
    intro:
      'Now use the same cage rule across a fuller board. When a cage has one empty cell, the missing number is forced before you even look at neighbours.',
    rows: 5,
    cols: 5,
    cellGroups: [
      [5, 5, 4, 4, 4],
      [5, 5, 1, 1, 1],
      [0, 2, 6, 3, 1],
      [0, 2, 6, 3, 3],
      [2, 2, 2, 3, 3],
    ],
    solution: [
      [2, 4, 1, 3, 2],
      [1, 3, 2, 4, 1],
      [2, 4, 1, 5, 3],
      [1, 3, 2, 4, 1],
      [2, 5, 1, 3, 2],
    ],
    steps: [
      {
        row: 0,
        col: 0,
        value: 2,
        explanation:
          'This cage is one cell short. It already holds 1, 3 and 4, so the missing value is 2.',
      },
      {
        row: 1,
        col: 4,
        value: 1,
        explanation: 'This three-cell cage already has 2 and 4. The only missing value is 1.',
      },
      {
        row: 2,
        col: 2,
        value: 1,
        explanation:
          'A two-cell cage holds 1 and 2. One is already placed, so this cell takes the other value: 1.',
      },
      {
        row: 3,
        col: 4,
        value: 1,
        explanation: 'This cage is missing 1. Complete the cage by placing that value here.',
      },
      {
        row: 4,
        col: 0,
        value: 2,
        explanation: 'Last one: this cage is missing 2. The cage itself gives the answer.',
      },
    ],
  },
  {
    id: 'naked-singles',
    title: 'Find a naked single',
    intro:
      'The final beginner move combines both rules. A naked single is a cell where the cage and the neighbouring cells rule out every value but one.',
    rows: 5,
    cols: 5,
    cellGroups: [
      [5, 5, 6, 6, 6],
      [1, 1, 1, 4, 4],
      [1, 1, 4, 4, 2],
      [3, 3, 0, 4, 2],
      [3, 3, 0, 0, 0],
    ],
    solution: [
      [2, 1, 2, 1, 3],
      [3, 4, 5, 4, 2],
      [1, 2, 1, 3, 1],
      [4, 3, 4, 5, 2],
      [2, 1, 2, 3, 1],
    ],
    steps: [
      {
        row: 0,
        col: 0,
        value: 2,
        explanation:
          'Check this cell’s cage and all touching neighbours. They rule out every value except 2.',
      },
      {
        row: 1,
        col: 4,
        value: 2,
        explanation:
          'Step through 1 to 5. The cage and neighbours block 1, 3, 4 and 5, so only 2 survives.',
      },
      {
        row: 2,
        col: 0,
        value: 1,
        explanation:
          'This cell has one legal option left after you compare its cage with the surrounding cells.',
      },
      {
        row: 3,
        col: 2,
        value: 4,
        explanation: 'Four of the five values are blocked here. The remaining value is 4.',
      },
      {
        row: 4,
        col: 0,
        value: 2,
        explanation: 'One number is left once the cage and neighbours are ruled out: 2.',
      },
    ],
  },
];

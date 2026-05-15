import type { TutorialData } from './types';

/**
 * The three Newcomer tutorial puzzles (specs/progression.md §4).
 * `cellGroups` and `solution` were produced by the engine generator,
 * so each board satisfies the cage and adjacency rules. `steps` are
 * mutually non-adjacent and each alone in its cage — so every guided
 * move is fully forced, whatever order it is made in.
 */
export const TUTORIAL_FIXTURES: TutorialData[] = [
  {
    id: 'reading-the-board',
    title: 'Reading the board',
    intro:
      'Tectonic has two rules. Cages — the outlined blocks — hold the numbers 1 up to their size, once each. And no two touching cells, even diagonally, may repeat a number. That is the whole game. Let us read three cells.',
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
          'This cage holds 1 and 2. A cell touching it already shows 1, so 1 cannot go here.',
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
    id: 'naked-singles',
    title: 'Naked singles',
    intro:
      'A naked single is a cell with only one number left — every other option ruled out by its cage and its neighbours. Spotting them is the heart of every solve.',
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
          'Work through this cell’s cage and its neighbours. Every value but one is already taken.',
      },
      {
        row: 1,
        col: 4,
        value: 2,
        explanation:
          'Same idea — step through 1 to 5 and cross off what the surrounding cells use. Only 2 survives.',
      },
      {
        row: 2,
        col: 0,
        value: 1,
        explanation:
          'Its cage and the cells around it leave a single option standing.',
      },
      {
        row: 3,
        col: 2,
        value: 4,
        explanation: 'Four of the five values here are blocked. One remains.',
      },
      {
        row: 4,
        col: 0,
        value: 2,
        explanation: 'One number left once the neighbours are ruled out.',
      },
    ],
  },
  {
    id: 'cage-completion',
    title: 'Cage completion',
    intro:
      'When a cage has just one empty cell, you do not need its neighbours at all — the missing number is whatever the cage has not used yet.',
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
          'This cage is one cell short. List what it already holds — the gap is 2.',
      },
      {
        row: 1,
        col: 4,
        value: 1,
        explanation: 'One empty cell in this cage. The number it is missing is 1.',
      },
      {
        row: 2,
        col: 2,
        value: 1,
        explanation:
          'A two-cell cage holds 1 and 2. One is already placed — this is the other.',
      },
      {
        row: 3,
        col: 4,
        value: 1,
        explanation: 'Fill the cage’s last cell with the value it lacks.',
      },
      {
        row: 4,
        col: 0,
        value: 2,
        explanation: 'Last one. This cage is missing 2.',
      },
    ],
  },
];

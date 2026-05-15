# Architecture

> *How* it's built. The *what* (player-facing) lives in [`PRD.md`](PRD.md).

**Last updated:** 2026-05-14

---

## 1. System shape

A single-page Vite + React 19 + TypeScript app. The puzzle engine is pure TypeScript with no React or DOM dependencies. The React layer renders engine state; it never reimplements engine logic.

```
┌──────────────────────────────────────────────────┐
│  React surface (src/components, src/hooks)       │
│  - Board / Cell / GameControls                   │
│  - useGame() hook owns React-side state          │
└──────────────┬───────────────────────────────────┘
               │ reads
               ▼
┌──────────────────────────────────────────────────┐
│  Engine (src/engine, pure TS)                    │
│  generator → solver → validator → hints → codec  │
└──────────────────────────────────────────────────┘
```

---

## 2. Engine modules

| Module | Responsibility |
|--------|----------------|
| [`types.ts`](src/engine/types.ts) | `Position`, `Group`, `PuzzleLayout`, `Puzzle`, `GameState`, `Difficulty`, `GridSize`, `HintMode`. The contract every other engine module obeys. |
| [`generator.ts`](src/engine/generator.ts) | Region-growing cage layout + solution generation. Difficulty calibration via technique-gated solving (see §3). |
| [`generator.worker.ts`](src/engine/generator.worker.ts) | Web Worker wrapper so generation doesn't block the main thread. |
| [`solver.ts`](src/engine/solver.ts) | Backtracking solver + `countSolutions()` for uniqueness checks. |
| [`validator.ts`](src/engine/validator.ts) | Neighbor cache, cell-to-group map, in-game error detection. |
| [`hints.ts`](src/engine/hints.ts) | Hint chain construction. Emits a technique label per step (`naked-single`, `hidden-single`, `forced-move`, `pair-elimination`, `contradiction-chain`). The interactive contradiction stepper data comes from here. |
| [`urlCodec.ts`](src/engine/urlCodec.ts) | Base64url encoding of full game state for shareable URLs. |

### Engine constraint

The engine has **no React imports, no DOM access, no `localStorage` access**. It is testable as plain TS. Any persistence side effect (saving progression, stats, settings) lives in a separate persistence layer; the engine produces values, the layer writes them.

---

## 3. Difficulty calibration

A puzzle's difficulty is determined by **the minimum-strength technique required to solve it**:

| Difficulty | Solvable with |
|------------|---------------|
| Easy | Naked singles only |
| Medium | Up to hidden singles |
| Hard | Up to forced moves / pair eliminations (backtracking permitted) |
| Expert | Requires contradiction chains |

The generator produces a candidate puzzle, runs it through a tiered solver (each tier enables one more technique), and accepts only puzzles whose minimum-tier-solver matches the requested difficulty. This is the source of the "technique-gated" property the market research calls out.

Tutorial puzzles bypass this calibration — they are hand-curated JSON fixtures designed to *require* exactly one technique.

---

## 4. State model

### React-side (`useGame.ts`)

`useGame()` owns:
- `gameState: GameState` — current puzzle, grid, notes, errors, solved flag
- `difficulty: Difficulty`, `gridSize: GridSize`
- `selectedCell`, `hint`, `hintMode`, `notesMode`
- `isGenerating` — true while the worker is producing a new puzzle

### Persistence (to be added)

Persistence is **not yet implemented**. The current app holds state in React only; refreshing loses it (except via share URL).

For v1 we need three persistence surfaces, all local-only:

| Store | Contents | Backed by |
|-------|----------|-----------|
| **Player profile** | Stage, technique-mastery counters, settings, tier (free/premium) | `localStorage` initially; IndexedDB if size grows |
| **Active game** | Current `GameState` so refresh / app-background doesn't lose progress | `localStorage` keyed by `active-game` |
| **Stats** | Solve times per difficulty, daily-puzzle results, streak counter | `localStorage` initially |

No cloud sync in v1 (see [`docs/decisions/ADR-0009-multiplayer-scope-v1.md`](docs/decisions/ADR-0009-multiplayer-scope-v1.md)). Cross-device requires a backend; the kill criterion before building one is in `PRD.md` §10.

---

## 5. Shareable URLs

`urlCodec.encode(state) → base64url` produces a compact hash; `urlCodec.decode(hash) → state` round-trips. The hash carries:

- Grid dimensions + group layout
- Clues
- (For challenge links) the challenger's solve time

Challenge-link metadata is appended as a small JSON envelope inside the hash. The recipient sees the puzzle and the time-to-beat; client-side comparison decides the result. No server.

---

## 6. Platform plan

| Platform | Approach | Status |
|----------|----------|--------|
| Web | Vite build, hosted via puma-dev locally (`http://tectonic.test`) | Working dev server |
| iOS | Capacitor wrap of the Vite build | Not scaffolded yet — ADR pending |
| Android | Same Capacitor bundle | Phase 4+ per `docs/market-research.md` §4 |

iOS-specific concerns when we get there:
- Apple Search Ads / App Store Connect IAP setup
- Sign in with Apple for the eventual account system
- Capacitor StatusBar / SafeArea handling

---

## 7. Tooling

- `npm run dev` — Vite dev server (bind to puma-dev port — TBD)
- `npm run build` — typecheck + Vite production build
- `npm run lint` — ESLint
- `npm run preview` — preview production build locally
- `npm run test` — Vitest (engine unit tests); `npm run test:watch` for watch mode

**Vitest** is wired (`vitest.config.ts`, node environment). First engine coverage lives in `src/engine/*.test.ts` — generator validity + uniqueness, solver correctness, validator error/solved detection. Progression and mastery logic must land with tests as they're built.

---

## 8. What this app does NOT have

- No backend, no API, no database
- No analytics yet (added before soft launch — see backlog)
- No authentication
- No cross-device sync
- No Capacitor / native wrappers
- No CI

Several of these are required before App Store launch; the order is in [`docs/backlog.md`](docs/backlog.md).

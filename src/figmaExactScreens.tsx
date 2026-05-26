/* eslint-disable react-refresh/only-export-components */
import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { HomeLanding } from './screens/HomeLanding';
import { SolvingScreen } from './screens/SolvingScreen';
import { TutorialScreen } from './screens/TutorialScreen';
import { StatsScreen } from './screens/StatsScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { SolvedScreen } from './screens/SolvedScreen';
import { UnresolvedPuzzlesScreen } from './screens/UnresolvedPuzzlesScreen';
import { TabBar, type Tab } from './components/TabBar';
import { AuthSheet } from './components/AuthSheet';
import { ProfileContext } from './lib/profileContext';
import { AuthContext, type AuthContextValue } from './lib/authContext';
import { PaywallContext } from './lib/paywallContext';
import { DevViewContext } from './lib/devViewContext';
import { defaultProfile, type PlayerProfile } from './lib/profile';
import { TECHNIQUE_NAMES } from './lib/progression';
import { generatePuzzle } from './engine/generator';
import { createGameState } from './lib/gameState';
import { encodeState } from './engine/urlCodec';
import type { GameState, GridSize, Difficulty } from './engine/types';
import type { UnresolvedPuzzle } from './lib/unresolvedPuzzles';
import { NEWCOMER_TUTORIALS } from './data/tutorials';

const now = new Date('2026-05-25T12:49:00.000Z').toISOString();

const captureStyles = document.createElement('style');
captureStyles.textContent = `
  body {
    margin: 0;
    background: #eef3f6;
    font-family: var(--font-ui);
  }

  .capture-page {
    min-height: 100vh;
    padding: 40px;
  }

  .capture-header {
    max-width: 1280px;
    margin: 0 auto var(--space-8);
  }

  .capture-header h1 {
    margin: 0;
    font-size: 32px;
    line-height: 36px;
    font-weight: 600;
    color: var(--text-primary);
  }

  .capture-header p {
    margin: var(--space-2) 0 0;
    font-size: 15px;
    line-height: 22px;
    color: var(--text-secondary);
  }

  .capture-grid {
    max-width: 1280px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: repeat(3, 390px);
    gap: 40px;
    align-items: start;
  }

  .capture-card h2 {
    margin: 0 0 var(--space-2);
    font-size: 12px;
    line-height: 16px;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--text-secondary);
  }

  .exact-phone {
    position: relative;
    width: 390px;
    height: 844px;
    overflow: hidden;
    background: var(--surface);
    border-radius: 36px;
    box-shadow: 0 24px 70px rgba(17, 24, 39, 0.15);
    transform: translateZ(0);
  }

  .phone-main {
    height: 100%;
    overflow: hidden;
  }

  .exact-phone .min-h-screen {
    min-height: 844px;
  }

  .bottom-nav-shell {
    position: absolute;
  }
`;
document.head.appendChild(captureStyles);

function screenProfile(): PlayerProfile {
  const profile = defaultProfile();
  profile.stage = 1;
  profile.celebratedStage = 1;
  profile.tutorialsCompleted = 3;
  profile.streak = { current: 3, longest: 7, lastSolveDate: '2026-05-25' };
  profile.solveHistory = [
    {
      date: '2026-05-23T11:00:00.000Z',
      difficulty: 'easy',
      gridSize: '5x5',
      timeMs: 142_000,
      hintsUsed: [],
      techniqueTally: [{ technique: 'naked-single', used: 4, selfApplied: 4 }],
      isDailyPuzzle: false,
      errorsValidated: 0,
    },
    {
      date: '2026-05-24T11:00:00.000Z',
      difficulty: 'medium',
      gridSize: '5x5',
      timeMs: 312_000,
      hintsUsed: [{ technique: 'hidden-single', count: 1 }],
      techniqueTally: [{ technique: 'hidden-single', used: 3, selfApplied: 2 }],
      isDailyPuzzle: false,
      errorsValidated: 1,
    },
    {
      date: '2026-05-25T11:00:00.000Z',
      difficulty: 'easy',
      gridSize: '5x5',
      timeMs: 138_000,
      hintsUsed: [],
      techniqueTally: [{ technique: 'naked-single', used: 5, selfApplied: 5 }],
      isDailyPuzzle: true,
      errorsValidated: 0,
    },
    {
      date: '2026-05-25T12:00:00.000Z',
      difficulty: 'hard',
      gridSize: '5x5',
      timeMs: 520_000,
      hintsUsed: [{ technique: 'forced-move', count: 2 }],
      techniqueTally: [{ technique: 'forced-move', used: 4, selfApplied: 2 }],
      isDailyPuzzle: false,
      errorsValidated: 1,
    },
    {
      date: '2026-05-25T12:30:00.000Z',
      difficulty: 'easy',
      gridSize: '5x5',
      timeMs: 118_000,
      hintsUsed: [],
      techniqueTally: [{ technique: 'naked-single', used: 5, selfApplied: 5 }],
      isDailyPuzzle: false,
      errorsValidated: 0,
    },
  ];
  for (const technique of TECHNIQUE_NAMES) {
    profile.techniques[technique] = {
      technique,
      usedCount: technique === 'naked-single' ? 9 : technique === 'hidden-single' ? 3 : 1,
      selfAppliedCount: technique === 'naked-single' ? 6 : technique === 'hidden-single' ? 2 : 0,
      puzzlesContaining: technique === 'naked-single' ? 2 : technique === 'hidden-single' ? 1 : 0,
    };
  }
  profile.role = 'player';
  profile.updatedAt = now;
  return profile;
}

const profile = screenProfile();

function puzzleState(seed: number, difficulty: Difficulty = 'easy', gridSize: GridSize = '5x5'): GameState {
  const size = gridSize === '8x8' ? 8 : 5;
  return createGameState(generatePuzzle(size, size, difficulty, seed));
}

function unresolved(seed: number, id: string, difficulty: Difficulty, gridSize: GridSize, elapsedSeconds: number): UnresolvedPuzzle {
  const gameState = puzzleState(seed, difficulty, gridSize);
  const grid = gameState.grid.map((row) => [...row]);
  const fillCount = gridSize === '8x8' ? 8 : 4;
  let filled = 0;
  for (let row = 0; row < grid.length && filled < fillCount; row += 1) {
    for (let col = 0; col < grid[row].length && filled < fillCount; col += 1) {
      if (grid[row][col] === 0) {
        grid[row][col] = gameState.puzzle.solution[row][col];
        filled += 1;
      }
    }
  }
  return {
    id,
    encodedState: encodeState(gameState.puzzle, grid, difficulty),
    difficulty,
    gridSize,
    isDailyPuzzle: id.startsWith('daily'),
    createdAt: now,
    updatedAt: new Date(Date.parse(now) - elapsedSeconds * 1000).toISOString(),
    elapsedSeconds,
  };
}

const unresolvedPuzzles = [
  unresolved(101, 'daily-2026-05-25', 'easy', '5x5', 240),
  unresolved(202, 'medium-a', 'medium', '5x5', 640),
  unresolved(303, 'easy-8', 'easy', '8x8', 1200),
  unresolved(404, 'hard-a', 'hard', '5x5', 1840),
];

const auth: AuthContextValue = {
  status: 'anonymous',
  user: { id: 'anonymous', email: '', isAnonymous: true },
  signInWithApple: async () => ({ ok: true }),
  signInWithGoogle: async () => ({ ok: true }),
  signInWithMagicLink: async () => ({ ok: true, needsConfirmation: true }),
  signOut: async () => {},
};

function Providers({ children }: { children: React.ReactNode }) {
  const profileValue = useMemo(
    () => ({
      profile,
      syncState: 'idle' as const,
      recordSolve: () => null,
      recordTutorial: () => null,
      celebrateStage: () => {},
      skipTutorials: () => {},
      redeemVoucher: () => ({ ok: false as const, reason: 'invalid' as const }),
      devSetProfile: () => {},
    }),
    [],
  );

  return (
    <AuthContext.Provider value={auth}>
      <ProfileContext.Provider value={profileValue}>
        <PaywallContext.Provider value={{ openPaywall: () => {} }}>
          <DevViewContext.Provider value={{ viewAsGuest: true, setViewAsGuest: () => {} }}>
            {children}
          </DevViewContext.Provider>
        </PaywallContext.Provider>
      </ProfileContext.Provider>
    </AuthContext.Provider>
  );
}

function PhoneFrame({
  name,
  children,
  nav = true,
  active = 'home',
}: {
  name: string;
  children: React.ReactNode;
  nav?: boolean;
  active?: Tab;
}) {
  return (
    <article className="capture-card">
      <h2>{name}</h2>
      <div className="exact-phone" data-capture={name}>
        <main className={`phone-main safe-area-pad-top ${nav ? 'nav-clearance' : ''}`}>
          {children}
        </main>
        {nav && <TabBar active={active} onChange={() => {}} onNewPuzzle={() => {}} />}
      </div>
    </article>
  );
}

function SolvingCapture() {
  return (
    <SolvingScreen
      puzzleId="figma-solving"
      initialDifficulty="easy"
      initialGridSize="5x5"
      seed={42}
      initialElapsedSeconds={49}
      isDaily
      onExit={() => {}}
    />
  );
}

function SolvedCapture() {
  const state = puzzleState(42);
  const solvedState = createGameState(state.puzzle, state.puzzle.solution);
  return (
    <SolvedScreen
      gameState={solvedState}
      elapsedSeconds={138}
      difficulty="easy"
      gridSize="5x5"
      techniquesUsed={{ naked_single: 4 }}
      selfAppliedMoves={{ naked_single: 4 }}
      errorsValidated={0}
      isDaily
      getShareUrl={() => 'https://example.test/#share'}
      getHintedCells={() => new Set()}
      onExit={() => {}}
    />
  );
}

function SettingsWithAuth() {
  const [open, setOpen] = useState(true);
  return (
    <>
      <SettingsScreen />
      <AuthSheet open={open} onClose={() => setOpen(false)} />
    </>
  );
}

function ExactScreens() {
  return (
    <Providers>
      <div className="capture-page">
        <header className="capture-header">
          <h1>Tectonic exact app captures</h1>
          <p>These frames render real React screens and CSS at 390 × 844.</p>
        </header>
        <div className="capture-grid">
          <PhoneFrame name="Today">
            <HomeLanding
              reentryDays={null}
              unresolvedPuzzles={unresolvedPuzzles}
              onOpenSettings={() => {}}
              onStartDaily={() => {}}
              onResumePuzzle={() => {}}
              onShowAllUnresolved={() => {}}
            />
          </PhoneFrame>
          <PhoneFrame name="Solving" nav={false}>
            <SolvingCapture />
          </PhoneFrame>
          <PhoneFrame name="Onboarding" nav={false}>
            <TutorialScreen
              tutorial={NEWCOMER_TUTORIALS[0]}
              index={1}
              total={3}
              onComplete={() => {}}
              onSkip={() => {}}
            />
          </PhoneFrame>
          <PhoneFrame name="Solved">
            <SolvedCapture />
          </PhoneFrame>
          <PhoneFrame name="Stats" active="stats">
            <StatsScreen />
          </PhoneFrame>
          <PhoneFrame name="Settings auth">
            <SettingsWithAuth />
          </PhoneFrame>
          <PhoneFrame name="All unfinished">
            <UnresolvedPuzzlesScreen
              puzzles={unresolvedPuzzles}
              onBack={() => {}}
              onResume={() => {}}
            />
          </PhoneFrame>
        </div>
      </div>
    </Providers>
  );
}

createRoot(document.getElementById('root')!).render(<ExactScreens />);

import { useEffect, useState } from 'react';
import { HomeLanding } from './HomeLanding';
import { SolvingScreen } from './SolvingScreen';
import { TutorialFlow } from './TutorialFlow';
import { UnresolvedPuzzlesScreen } from './UnresolvedPuzzlesScreen';
import { DifficultyPicker } from '../components/DifficultyPicker';
import { StageUpCard } from '../components/StageUpCard';
import { useProfile } from '../lib/profileContext';
import { analytics } from '../lib/analytics';
import { dailyPuzzleSpec } from '../lib/daily';
import { checkReentry } from '../lib/lastSeen';
import {
  type UnresolvedPuzzle,
  createUnresolvedPuzzleId,
  listUnresolvedPuzzles,
} from '../lib/unresolvedPuzzles';
import type { Difficulty, GridSize } from '../engine/types';

interface HomeTabProps {
  newPuzzleNonce: number;
  onOpenSettings: () => void;
}

interface ActiveGame {
  id: string;
  difficulty: Difficulty;
  gridSize: GridSize;
  /** Deterministic seed — set for the daily puzzle. */
  seed?: number;
  /** Encoded unfinished game state when resuming. */
  resumeEncodedState?: string;
  elapsedSeconds?: number;
  isDaily: boolean;
}

/**
 * The Home tab — owns navigation between the landing screen and a
 * playing session, with the difficulty picker as a sheet over the
 * landing. A Newcomer (stage 0) is routed into the tutorial funnel
 * instead, until they earn the Beginner stage.
 */
export function HomeTab({ newPuzzleNonce, onOpenSettings }: HomeTabProps) {
  const { profile, celebrateStage } = useProfile();
  const [view, setView] = useState<'landing' | 'playing' | 'unresolved'>('landing');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [game, setGame] = useState<ActiveGame | null>(null);
  const [unresolvedPuzzles, setUnresolvedPuzzles] = useState(() =>
    listUnresolvedPuzzles(),
  );
  // Bumped on every start so SolvingScreen remounts with a fresh puzzle.
  const [gameKey, setGameKey] = useState(0);
  // Days since the last visit — stamped once on mount (backlog item 16).
  const [reentryDays] = useState(checkReentry);

  useEffect(() => {
    if (newPuzzleNonce === 0 || profile.stage === 0) return;
    const id = window.setTimeout(() => {
      setView('landing');
      setPickerOpen(true);
    }, 0);
    return () => clearTimeout(id);
  }, [newPuzzleNonce, profile.stage]);

  function handleStart(difficulty: Difficulty, gridSize: GridSize) {
    analytics.puzzleStarted(difficulty, gridSize);
    setGame({
      id: createUnresolvedPuzzleId(),
      difficulty,
      gridSize,
      isDaily: false,
    });
    setGameKey((k) => k + 1);
    setPickerOpen(false);
    setView('playing');
  }

  function handleStartDaily() {
    const spec = dailyPuzzleSpec();
    analytics.puzzleStarted(spec.difficulty, spec.gridSize);
    setGame({
      id: `daily-${spec.dateKey}`,
      difficulty: spec.difficulty,
      gridSize: spec.gridSize,
      seed: spec.seed,
      isDaily: true,
    });
    setGameKey((k) => k + 1);
    setView('playing');
  }

  function handleResumePuzzle(puzzle: UnresolvedPuzzle) {
    analytics.puzzleStarted(puzzle.difficulty, puzzle.gridSize);
    setGame({
      id: puzzle.id,
      difficulty: puzzle.difficulty,
      gridSize: puzzle.gridSize,
      resumeEncodedState: puzzle.encodedState,
      elapsedSeconds: puzzle.elapsedSeconds,
      isDaily: puzzle.isDailyPuzzle,
    });
    setGameKey((k) => k + 1);
    setView('playing');
  }

  function returnToLanding() {
    setUnresolvedPuzzles(listUnresolvedPuzzles());
    setView('landing');
  }

  // A Newcomer plays the tutorial funnel, nothing else, until Beginner.
  if (profile.stage === 0) {
    return <TutorialFlow />;
  }

  return (
    <>
      {view === 'playing' && game ? (
        <SolvingScreen
          key={gameKey}
          puzzleId={game.id}
          initialDifficulty={game.difficulty}
          initialGridSize={game.gridSize}
          seed={game.seed}
          resumeEncodedState={game.resumeEncodedState}
          initialElapsedSeconds={game.elapsedSeconds}
          isDaily={game.isDaily}
          onExit={returnToLanding}
        />
      ) : view === 'unresolved' ? (
        <UnresolvedPuzzlesScreen
          puzzles={unresolvedPuzzles}
          onBack={returnToLanding}
          onResume={handleResumePuzzle}
        />
      ) : profile.stage > profile.celebratedStage ? (
        // A stage-up crossed since the player last saw Home — celebrate
        // it before anything else (progression.md §5).
        <StageUpCard stage={profile.stage} onContinue={celebrateStage} />
      ) : (
        <HomeLanding
          reentryDays={reentryDays}
          unresolvedPuzzles={unresolvedPuzzles}
          onOpenSettings={onOpenSettings}
          onStartDaily={handleStartDaily}
          onResumePuzzle={handleResumePuzzle}
          onShowAllUnresolved={() => setView('unresolved')}
        />
      )}
      <DifficultyPicker
        open={pickerOpen}
        stage={profile.stage}
        onClose={() => setPickerOpen(false)}
        onStart={handleStart}
      />
    </>
  );
}

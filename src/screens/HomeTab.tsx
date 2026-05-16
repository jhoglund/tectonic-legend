import { useState } from 'react';
import { HomeLanding } from './HomeLanding';
import { SolvingScreen } from './SolvingScreen';
import { TutorialFlow } from './TutorialFlow';
import { DifficultyPicker } from '../components/DifficultyPicker';
import { StageUpCard } from '../components/StageUpCard';
import { useProfile } from '../lib/profileContext';
import { analytics } from '../lib/analytics';
import { dailyPuzzleSpec } from '../lib/daily';
import type { Difficulty, GridSize } from '../engine/types';

interface ActiveGame {
  difficulty: Difficulty;
  gridSize: GridSize;
  /** Deterministic seed — set for the daily puzzle. */
  seed?: number;
  isDaily: boolean;
}

/**
 * The Home tab — owns navigation between the landing screen and a
 * playing session, with the difficulty picker as a sheet over the
 * landing. A Newcomer (stage 0) is routed into the tutorial funnel
 * instead, until they earn the Beginner stage.
 */
export function HomeTab() {
  const { profile, celebrateStage } = useProfile();
  const [view, setView] = useState<'landing' | 'playing'>('landing');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [game, setGame] = useState<ActiveGame | null>(null);
  // Bumped on every start so SolvingScreen remounts with a fresh puzzle.
  const [gameKey, setGameKey] = useState(0);

  function handleStart(difficulty: Difficulty, gridSize: GridSize) {
    analytics.puzzleStarted(difficulty, gridSize);
    setGame({ difficulty, gridSize, isDaily: false });
    setGameKey((k) => k + 1);
    setPickerOpen(false);
    setView('playing');
  }

  function handleStartDaily() {
    const spec = dailyPuzzleSpec();
    analytics.puzzleStarted(spec.difficulty, spec.gridSize);
    setGame({
      difficulty: spec.difficulty,
      gridSize: spec.gridSize,
      seed: spec.seed,
      isDaily: true,
    });
    setGameKey((k) => k + 1);
    setView('playing');
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
          initialDifficulty={game.difficulty}
          initialGridSize={game.gridSize}
          seed={game.seed}
          isDaily={game.isDaily}
          onExit={() => setView('landing')}
        />
      ) : profile.stage > profile.celebratedStage ? (
        // A stage-up crossed since the player last saw Home — celebrate
        // it before anything else (progression.md §5).
        <StageUpCard stage={profile.stage} onContinue={celebrateStage} />
      ) : (
        <HomeLanding
          onNewPuzzle={() => setPickerOpen(true)}
          onStartDaily={handleStartDaily}
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

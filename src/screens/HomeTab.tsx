import { useState } from 'react';
import { HomeLanding } from './HomeLanding';
import { SolvingScreen } from './SolvingScreen';
import { DifficultyPicker } from '../components/DifficultyPicker';
import { useProfile } from '../lib/profileContext';
import type { Difficulty, GridSize } from '../engine/types';

/**
 * The Home tab — owns navigation between the landing screen and a
 * playing session, with the difficulty picker as a sheet over the
 * landing.
 */
export function HomeTab() {
  const { profile } = useProfile();
  const [view, setView] = useState<'landing' | 'playing'>('landing');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [game, setGame] = useState<{ difficulty: Difficulty; gridSize: GridSize } | null>(
    null,
  );
  // Bumped on every start so GameScreen remounts with a fresh puzzle.
  const [gameKey, setGameKey] = useState(0);

  function handleStart(difficulty: Difficulty, gridSize: GridSize) {
    setGame({ difficulty, gridSize });
    setGameKey((k) => k + 1);
    setPickerOpen(false);
    setView('playing');
  }

  return (
    <>
      {view === 'playing' && game ? (
        <SolvingScreen
          key={gameKey}
          initialDifficulty={game.difficulty}
          initialGridSize={game.gridSize}
          onExit={() => setView('landing')}
        />
      ) : (
        <HomeLanding stage={profile.stage} onNewPuzzle={() => setPickerOpen(true)} />
      )}
      <DifficultyPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onStart={handleStart}
      />
    </>
  );
}

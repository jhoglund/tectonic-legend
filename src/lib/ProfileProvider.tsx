import { useCallback, useState, type ReactNode } from 'react';
import {
  type SolveOutcome,
  loadProfile,
  saveProfile,
  recordSolve,
  recordTutorialCompletion,
  markStageCelebrated,
  skipTutorials,
} from './profile';
import type { PlayerStage } from './progression';
import { ProfileContext } from './profileContext';

/**
 * Holds the player profile in state, loaded from localStorage and
 * persisted on every mutation. Wrap the app in this so all surfaces
 * share one profile.
 */
export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState(() => loadProfile());

  const handleRecordSolve = useCallback(
    (outcome: SolveOutcome): PlayerStage | null => {
      const result = recordSolve(profile, outcome);
      saveProfile(result.profile);
      setProfile(result.profile);
      return result.stageUp;
    },
    [profile],
  );

  const handleRecordTutorial = useCallback((): PlayerStage | null => {
    const result = recordTutorialCompletion(profile);
    saveProfile(result.profile);
    setProfile(result.profile);
    return result.stageUp;
  }, [profile]);

  const handleCelebrateStage = useCallback(() => {
    const next = markStageCelebrated(profile);
    saveProfile(next);
    setProfile(next);
  }, [profile]);

  const handleSkipTutorials = useCallback(() => {
    const next = skipTutorials(profile);
    saveProfile(next);
    setProfile(next);
  }, [profile]);

  return (
    <ProfileContext.Provider
      value={{
        profile,
        recordSolve: handleRecordSolve,
        recordTutorial: handleRecordTutorial,
        celebrateStage: handleCelebrateStage,
        skipTutorials: handleSkipTutorials,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

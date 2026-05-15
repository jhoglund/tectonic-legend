import { useState } from 'react';
import { useProfile } from '../lib/profileContext';
import { NEWCOMER_TUTORIALS } from '../data/tutorials';
import { WelcomeScreen } from './WelcomeScreen';
import { TutorialScreen } from './TutorialScreen';

/**
 * The Newcomer onboarding funnel (specs/progression.md §4): a one-time
 * welcome, then the three tutorials in order. Completing the third
 * advances the profile to Beginner, after which HomeTab routes here no
 * more. Progress is profile-backed, so a mid-funnel relaunch resumes.
 */
export function TutorialFlow() {
  const { profile, recordTutorial, skipTutorials } = useProfile();
  // The welcome card shows only to a player who has not begun.
  const [showWelcome, setShowWelcome] = useState(
    profile.tutorialsCompleted === 0,
  );

  if (showWelcome) {
    return (
      <WelcomeScreen
        onStart={() => setShowWelcome(false)}
        onSkip={skipTutorials}
      />
    );
  }

  const idx = Math.min(
    profile.tutorialsCompleted,
    NEWCOMER_TUTORIALS.length - 1,
  );
  const tutorial = NEWCOMER_TUTORIALS[idx];

  return (
    <TutorialScreen
      key={tutorial.id}
      tutorial={tutorial}
      index={idx + 1}
      total={NEWCOMER_TUTORIALS.length}
      onComplete={() => recordTutorial()}
      onSkip={skipTutorials}
    />
  );
}

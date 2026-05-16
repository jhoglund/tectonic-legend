import { createContext, useContext } from 'react';
import type { PlayerProfile, SolveOutcome, RedeemResult } from './profile';
import type { PlayerStage } from './progression';
import type { SyncState } from './profileSync';

/**
 * App-wide player-profile store contract. One source of truth so the
 * Home, Solving, Solved, and Stats surfaces all read the same profile.
 * The provider lives in ProfileProvider.tsx.
 */
export interface ProfileContextValue {
  profile: PlayerProfile;
  /** Account-sync status — `idle` when signed out (accounts plan §4). */
  syncState: SyncState;
  /** Ingest a finished solve; returns the stage advanced into, if any. */
  recordSolve: (outcome: SolveOutcome) => PlayerStage | null;
  /** Record one completed tutorial; returns the stage advanced into. */
  recordTutorial: () => PlayerStage | null;
  /** Dismiss the pending stage-up card — marks the current stage seen. */
  celebrateStage: () => void;
  /** Skip the Newcomer tutorials and jump to Beginner. */
  skipTutorials: () => void;
  /** Redeem a voucher code; persists on success. Returns the outcome. */
  redeemVoucher: (code: string) => RedeemResult;
}

export const ProfileContext = createContext<ProfileContextValue | null>(null);

/** Read the profile store. Must be used inside a ProfileProvider. */
export function useProfile(): ProfileContextValue {
  const ctx = useContext(ProfileContext);
  if (!ctx) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return ctx;
}

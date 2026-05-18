import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  type SolveOutcome,
  type RedeemResult,
  type PlayerProfile,
  loadProfile,
  saveProfile,
  recordSolve,
  recordTutorialCompletion,
  markStageCelebrated,
  skipTutorials,
  redeemVoucher,
} from './profile';
import type { PlayerStage } from './progression';
import { ProfileContext } from './profileContext';
import { useAuth } from './authContext';
import {
  type SyncState,
  fetchRemoteProfile,
  pushRemoteProfile,
  reconcile,
} from './profileSync';

/** Idle delay before a local change is pushed to the account backend. */
const PUSH_DEBOUNCE_MS = 1500;

/**
 * Holds the player profile in state, loaded from localStorage and
 * persisted on every mutation. Wrap the app in this so all surfaces
 * share one profile.
 *
 * When a user is signed in (ADR-0013), the profile also syncs: it is
 * pulled and reconciled on sign-in, and local changes are pushed up
 * after a short debounce. Signed out, it is local-only exactly as
 * before. Must sit inside AuthProvider.
 */
export function ProfileProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState(() => loadProfile());
  const [syncState, setSyncState] = useState<SyncState>('idle');

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

  const handleRedeemVoucher = useCallback(
    (code: string): RedeemResult => {
      const result = redeemVoucher(profile, code);
      if (result.ok) {
        saveProfile(result.profile);
        setProfile(result.profile);
      }
      return result;
    },
    [profile],
  );

  // Developer debug panel only (ADR-0014). The mutator returns the new
  // profile; updatedAt is stamped so the change persists and syncs.
  const handleDevSetProfile = useCallback(
    (mutator: (p: PlayerProfile) => PlayerProfile) => {
      const next: PlayerProfile = {
        ...mutator(profile),
        updatedAt: new Date().toISOString(),
      };
      saveProfile(next);
      setProfile(next);
    },
    [profile],
  );

  // The latest profile, readable from the sync effects without making
  // it a dependency (which would re-fire the pull on every change).
  const profileRef = useRef(profile);
  useEffect(() => {
    profileRef.current = profile;
  }, [profile]);

  // Serialized form of the profile last known to be on the server —
  // lets the debounced push skip no-op writes (e.g. just after a pull).
  const syncedRef = useRef<string | null>(null);

  const userId = user?.id ?? null;

  // Pull on sign-in: fetch the server profile and reconcile. A user
  // with no server row yet (first sign-in) has their local profile
  // adopted as the account.
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    (async () => {
      setSyncState('syncing');
      try {
        const local = profileRef.current;
        const remote = await fetchRemoteProfile(userId);
        if (cancelled) return;
        if (remote === null) {
          // First sign-in — the local profile becomes the account.
          await pushRemoteProfile(userId, local);
          if (cancelled) return;
          syncedRef.current = JSON.stringify(local);
        } else {
          const winner = reconcile(local, remote);
          if (winner === remote) {
            saveProfile(remote);
            setProfile(remote);
          } else {
            await pushRemoteProfile(userId, winner);
          }
          if (cancelled) return;
          syncedRef.current = JSON.stringify(winner);
        }
        setSyncState('synced');
      } catch {
        if (!cancelled) setSyncState('error');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  // Debounced push: once the initial sync has settled, every local
  // change is pushed up after a short idle delay.
  useEffect(() => {
    if (!userId || syncState !== 'synced') return;
    const serialized = JSON.stringify(profile);
    if (serialized === syncedRef.current) return;
    const timer = setTimeout(() => {
      setSyncState('syncing');
      pushRemoteProfile(userId, profile)
        .then(() => {
          syncedRef.current = serialized;
          setSyncState('synced');
        })
        .catch(() => setSyncState('error'));
    }, PUSH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [profile, userId, syncState]);

  return (
    <ProfileContext.Provider
      value={{
        profile,
        // Signed out, sync is always idle — the internal state may hold
        // a stale value from a previous session until the pull re-runs.
        syncState: userId ? syncState : 'idle',
        recordSolve: handleRecordSolve,
        recordTutorial: handleRecordTutorial,
        celebrateStage: handleCelebrateStage,
        skipTutorials: handleSkipTutorials,
        redeemVoucher: handleRedeemVoucher,
        devSetProfile: handleDevSetProfile,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

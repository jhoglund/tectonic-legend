import { createContext, useContext } from 'react';

/**
 * Developer "View as guest" toggle (ADR-0017). When on, every consumer
 * of `useEffectiveDeveloper()` reads `false` even if the profile role
 * is `developer` — so the developer sees the new-player experience
 * without signing out or losing the role. The provider lives in
 * `DevViewProvider.tsx` and persists the toggle to `localStorage`.
 */

export interface DevViewContextValue {
  viewAsGuest: boolean;
  setViewAsGuest: (next: boolean) => void;
}

export const DevViewContext = createContext<DevViewContextValue | null>(null);

/** Read the dev-view toggle. Returns the default (false) when no
 *  provider is mounted, so callers in tests don't have to wrap. */
export function useDevView(): DevViewContextValue {
  const ctx = useContext(DevViewContext);
  if (ctx) return ctx;
  return { viewAsGuest: false, setViewAsGuest: () => {} };
}

/** True iff the player has the developer role AND isn't viewing as a
 *  guest. Use this in place of `isDeveloper(profile)` at every UI
 *  surface that should hide for a developer previewing the guest path. */
export function useEffectiveDeveloper(
  isDeveloperFromProfile: boolean,
): boolean {
  const { viewAsGuest } = useDevView();
  return isDeveloperFromProfile && !viewAsGuest;
}

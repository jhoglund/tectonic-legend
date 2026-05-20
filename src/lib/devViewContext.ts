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

/** True iff developer UI should be shown right now. Three paths reach
 *  it (ADR-0017): a dev build (`import.meta.env.DEV` — local `npm run
 *  dev`, so no 7-tap or sign-in is needed during development), the
 *  developer role on the profile (allowlisted email, or unlocked by
 *  the 7-tap gesture), or — never — `viewAsGuest` overrides all of
 *  them so a developer can preview the new-player experience. */
export function useEffectiveDeveloper(
  isDeveloperFromProfile: boolean,
): boolean {
  const { viewAsGuest } = useDevView();
  if (viewAsGuest) return false;
  if (import.meta.env.DEV) return true;
  return isDeveloperFromProfile;
}

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { DevViewContext } from './devViewContext';

/**
 * Mounts the developer "View as guest" toggle (ADR-0017). The flag is
 * persisted to `localStorage` so it survives a reload, and so a
 * developer who flips it on by accident can flip it off again without
 * any other dance.
 */
const KEY = 'tectonic:devViewAsGuest';

export function DevViewProvider({ children }: { children: ReactNode }) {
  const [viewAsGuest, setViewAsGuestState] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      return window.localStorage.getItem(KEY) === '1';
    } catch {
      return false;
    }
  });

  const setViewAsGuest = useCallback((next: boolean) => {
    setViewAsGuestState(next);
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(KEY, viewAsGuest ? '1' : '0');
    } catch {
      // private mode / quota — the toggle still works for the session.
    }
  }, [viewAsGuest]);

  const value = useMemo(
    () => ({ viewAsGuest, setViewAsGuest }),
    [viewAsGuest, setViewAsGuest],
  );

  return (
    <DevViewContext.Provider value={value}>{children}</DevViewContext.Provider>
  );
}

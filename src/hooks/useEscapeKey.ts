import { useEffect } from 'react';

/**
 * Dismiss-on-Escape for modals, sheets and alerts.
 *
 * Every overlay in the app dismisses on a backdrop click, which is a mouse-only
 * gesture. This is the keyboard half of that: without it a keyboard-only player
 * can open a sheet and have no way out.
 */
export function useEscapeKey(onEscape: () => void, active = true) {
  useEffect(() => {
    if (!active) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onEscape();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onEscape, active]);
}

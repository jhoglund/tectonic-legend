const KEY = 'tectonic.lastSeen';

/** Gap (in whole days) below which no re-entry line shows. */
export const REENTRY_THRESHOLD_DAYS = 7;

/**
 * How many whole days since the app was last opened — then records
 * "now". Returns null on the first-ever open, same-day reopens, or if
 * storage is unavailable. Call exactly once per app launch: it has the
 * side effect of stamping the visit (backlog item 16).
 */
export function checkReentry(): number | null {
  if (typeof localStorage === 'undefined') return null;
  let daysAway: number | null = null;
  try {
    const prev = localStorage.getItem(KEY);
    if (prev) {
      const gap = Math.floor((Date.now() - Number(prev)) / 86_400_000);
      if (gap > 0) daysAway = gap;
    }
    localStorage.setItem(KEY, String(Date.now()));
  } catch {
    return null;
  }
  return daysAway;
}

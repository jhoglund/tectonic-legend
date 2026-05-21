import type { PlayerProfile } from './profile';

/**
 * Profile schema migrations (progression.md §8, ADR-0018).
 *
 * Each migration is a pure function that takes a parsed blob of the
 * previous schema version and returns a blob of the next version,
 * untouched on fields that haven't changed. The chain is composed by
 * `migrateProfile`: pass any version in, get the current version out.
 *
 * Migrations only handle structural changes — defaulting new fields,
 * renaming, dropping retired ones. `normalizeProfile` still runs after
 * a migration to fill in any field a saved blob is missing.
 */

interface V1Profile {
  schemaVersion: 1;
  // ...everything else; we only touch the fields v2 adds.
  [key: string]: unknown;
}

/** Bump schemaVersion 1 → 2: seed `legendRung` on the profile and
 *  `errorsValidated` on every solve record. `parTimeMs` stays absent
 *  on legacy records — `computeDepth` falls back to the table lookup. */
export function migrateV1ToV2(v1: V1Profile): Record<string, unknown> {
  const history = Array.isArray(v1.solveHistory)
    ? (v1.solveHistory as Record<string, unknown>[]).map((rec) => ({
        ...rec,
        errorsValidated:
          typeof rec.errorsValidated === 'number' ? rec.errorsValidated : 0,
      }))
    : [];
  return {
    ...v1,
    schemaVersion: 2,
    legendRung: 0,
    solveHistory: history,
  };
}

/** Run every migration the saved blob needs to reach the current
 *  schema. Returns a blob whose `schemaVersion` is the latest one
 *  (`PlayerProfile['schemaVersion']`) or `null` if the input is too
 *  alien to recognise — the caller can then default-profile. */
export function migrateProfile(
  parsed: Record<string, unknown>,
): Record<string, unknown> | null {
  let cur: Record<string, unknown> = parsed;
  if (cur.schemaVersion === 1) {
    cur = migrateV1ToV2(cur as V1Profile);
  }
  if (cur.schemaVersion !== 2) return null;
  return cur;
}

// Re-exported for tests that want to assert the chain's terminal version.
export const CURRENT_SCHEMA_VERSION: PlayerProfile['schemaVersion'] = 2;

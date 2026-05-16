/**
 * Profile sync — the account-backed half of the local-first profile
 * (ADR-0013, accounts plan §4). The local profile stays the working
 * copy; when signed in, ProfileProvider uses these helpers to pull the
 * server copy on sign-in and push local changes up.
 *
 * Reconciliation is last-write-wins on the whole blob, by `updatedAt`.
 * Field-level merge (max streak, union solve history) is a noted
 * future refinement.
 */
import { supabase } from './supabase';
import { normalizeProfile, type PlayerProfile } from './profile';

/** Lifecycle of the sync layer, surfaced to the Settings UI. */
export type SyncState = 'idle' | 'syncing' | 'synced' | 'error';

/**
 * Fetch the signed-in user's profile row, or `null` when they have no
 * row yet (a first-ever sign-in). Throws on a transport/RLS error.
 */
export async function fetchRemoteProfile(
  userId: string,
): Promise<PlayerProfile | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('profiles')
    .select('data')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw error;
  const blob = data?.data;
  if (!blob || typeof blob !== 'object') return null;
  return normalizeProfile(blob as Record<string, unknown>);
}

/**
 * Upsert the profile blob for the signed-in user. The server stamps
 * `updated_at` via a trigger; the blob carries its own `updatedAt`.
 */
export async function pushRemoteProfile(
  userId: string,
  profile: PlayerProfile,
): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase
    .from('profiles')
    .upsert({ id: userId, data: profile }, { onConflict: 'id' });
  if (error) throw error;
}

/**
 * Last-write-wins reconciliation: whichever profile has the newer
 * `updatedAt` wins as a whole. A tie keeps the local copy.
 */
export function reconcile(
  local: PlayerProfile,
  remote: PlayerProfile,
): PlayerProfile {
  return Date.parse(remote.updatedAt) > Date.parse(local.updatedAt)
    ? remote
    : local;
}

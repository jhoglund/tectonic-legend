/**
 * Supabase client — the backend platform for player accounts (ADR-0013).
 *
 * Env-driven and graceful: the client is created only when both
 * `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set. When they
 * are not — which is the case until Jonas creates the Supabase project
 * — `supabase` is `null` and the app runs fully local-only, exactly as
 * it does today. Callers gate on `isAccountsEnabled()` (or a null
 * check) before touching auth or sync.
 *
 * The anon key is safe to ship in the client bundle: it carries no
 * privileges that Row-Level Security doesn't grant. RLS on the
 * `profiles` table (see `supabase/schema.sql`) is the security
 * boundary — every row is reachable only by its owner.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/** True when the Supabase project is configured and accounts can be used. */
export function isAccountsEnabled(): boolean {
  return Boolean(url && anonKey);
}

/**
 * The shared Supabase client, or `null` when accounts are not yet
 * configured. Persisting the session in `localStorage` lets a signed-in
 * player stay signed in across reloads; on device, Capacitor's
 * preferences-backed storage is wired in when the auth layer lands.
 */
export const supabase: SupabaseClient | null = isAccountsEnabled()
  ? createClient(url!, anonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

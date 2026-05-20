import { createContext, useContext } from 'react';

/**
 * App-wide authentication state, backed by Supabase Auth (ADR-0013).
 * The provider lives in AuthProvider.tsx.
 *
 * Auth follows the anonymous-by-default pattern (ADR-0017): a player
 * never sees a signup wall — on first launch the app silently calls
 * `signInAnonymously()`, and the upgrade-to-a-real-account ask only
 * lands at value moments (Settings, subscribe, cross-device).
 *
 * Auth is still optional: when the Supabase project is not configured
 * (`isAccountsEnabled()` is false) the status is `disabled` and every
 * action is a no-op — the app stays fully usable, purely local.
 */

/**
 * - `loading`   — checking for or bootstrapping a session at startup.
 * - `anonymous` — silent Supabase user, no provider linked yet.
 * - `signed-in` — a real account is linked (Apple, Google, or email).
 * - `disabled`  — Supabase not configured; accounts unavailable.
 */
export type AuthStatus = 'loading' | 'anonymous' | 'signed-in' | 'disabled';

export interface AuthUser {
  id: string;
  /** Empty string for an anonymous user. */
  email: string;
  /** True while no provider identity is linked. */
  isAnonymous: boolean;
}

/** The outcome of an auth action — a friendly message on failure. */
export type AuthResult =
  | { ok: true; needsConfirmation?: boolean }
  | { ok: false; message: string };

export interface AuthContextValue {
  status: AuthStatus;
  /** The current Supabase user — anonymous or signed-in. `null` only
   *  while the session is bootstrapping or when accounts are disabled. */
  user: AuthUser | null;
  /** Open the Apple OAuth redirect (Sign in with Apple). On an
   *  anonymous user this links the identity in place, preserving the
   *  user's ID and all server-side progress. */
  signInWithApple: () => Promise<AuthResult>;
  /** Open the Google OAuth redirect. Same linking behaviour as Apple. */
  signInWithGoogle: () => Promise<AuthResult>;
  /** Email magic link — Supabase emails a one-tap sign-in link. For an
   *  anonymous user, the link verifies and attaches the email to the
   *  existing account; for a fully signed-out caller it signs them in. */
  signInWithMagicLink: (email: string) => Promise<AuthResult>;
  /** Sign out and immediately bootstrap a fresh anonymous session, so
   *  the app continues to have a user. */
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

/** Read the auth store. Must be used inside an AuthProvider. */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}

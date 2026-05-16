import { createContext, useContext } from 'react';

/**
 * App-wide authentication state, backed by Supabase Auth (ADR-0013).
 * The provider lives in AuthProvider.tsx.
 *
 * Auth is optional: when the Supabase project is not configured
 * (`isAccountsEnabled()` is false) the status is `disabled` and every
 * action is a no-op — the app stays fully usable, local-only.
 */

/**
 * - `loading`    — checking for an existing session at startup.
 * - `signed-out` — accounts available, no one signed in.
 * - `signed-in`  — a user is signed in (`user` is set).
 * - `disabled`   — Supabase not configured; accounts unavailable.
 */
export type AuthStatus = 'loading' | 'signed-out' | 'signed-in' | 'disabled';

export interface AuthUser {
  id: string;
  email: string;
}

/** The outcome of an auth action — a friendly message on failure. */
export type AuthResult =
  | { ok: true; needsConfirmation?: boolean }
  | { ok: false; message: string };

export interface AuthContextValue {
  status: AuthStatus;
  /** The signed-in user, or `null` in every other status. */
  user: AuthUser | null;
  /** Create an account. `needsConfirmation` is set when Supabase has
   *  emailed a confirmation link and no session was opened yet. */
  signUp: (email: string, password: string) => Promise<AuthResult>;
  /** Sign in with email + password. */
  signIn: (email: string, password: string) => Promise<AuthResult>;
  /** Sign out the current user. */
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

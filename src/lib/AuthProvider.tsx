import { useCallback, useEffect, useState, type ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { analytics } from './analytics';
import {
  AuthContext,
  type AuthResult,
  type AuthStatus,
  type AuthUser,
} from './authContext';

/** Map a Supabase user onto the trimmed shape the app consumes. */
function toAuthUser(user: User | null | undefined): AuthUser | null {
  if (!user) return null;
  return { id: user.id, email: user.email ?? '' };
}

/**
 * Tracks the Supabase Auth session and exposes sign-up / sign-in /
 * sign-out app-wide. When Supabase is not configured the status is
 * `disabled` and the actions return a friendly failure — nothing
 * throws, so the app runs local-only exactly as before.
 *
 * Mount this *outside* ProfileProvider: the profile-sync layer (A3)
 * reacts to auth state, so it must be able to read this context.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>(
    supabase ? 'loading' : 'disabled',
  );
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    if (!supabase) return;
    let active = true;

    // Resolve the initial session, then keep in sync with auth changes
    // (sign-in, sign-out, token refresh) for the rest of the session.
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setUser(toAuthUser(data.session?.user));
      setStatus(data.session ? 'signed-in' : 'signed-out');
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(toAuthUser(session?.user));
      setStatus(session ? 'signed-in' : 'signed-out');
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signUp = useCallback(
    async (email: string, password: string): Promise<AuthResult> => {
      if (!supabase) {
        return { ok: false, message: 'Accounts are not available.' };
      }
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) return { ok: false, message: error.message };
      analytics.signedUp();
      // No session means Supabase emailed a confirmation link — the
      // account is not usable until that link is followed.
      return { ok: true, needsConfirmation: data.session === null };
    },
    [],
  );

  const signIn = useCallback(
    async (email: string, password: string): Promise<AuthResult> => {
      if (!supabase) {
        return { ok: false, message: 'Accounts are not available.' };
      }
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) return { ok: false, message: error.message };
      analytics.signedIn();
      return { ok: true };
    },
    [],
  );

  const signOut = useCallback(async (): Promise<void> => {
    if (!supabase) return;
    await supabase.auth.signOut();
    analytics.signedOut();
  }, []);

  return (
    <AuthContext.Provider value={{ status, user, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
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
  // Supabase >= 2.43 exposes `is_anonymous` on the user record. Older
  // builds and OAuth-linked users leave it falsy.
  const isAnonymous =
    (user as User & { is_anonymous?: boolean }).is_anonymous === true;
  return { id: user.id, email: user.email ?? '', isAnonymous };
}

function statusFor(user: AuthUser | null): AuthStatus {
  if (!user) return 'loading';
  return user.isAnonymous ? 'anonymous' : 'signed-in';
}

/** Where Apple/Google should redirect back to after an OAuth round-trip.
 *  The Supabase client's `detectSessionInUrl` reads the hash params here
 *  and completes sign-in without any router help. */
function redirectTo(): string {
  if (typeof window === 'undefined') return '';
  // Strip any existing hash so a fresh OAuth callback hash lands clean.
  return window.location.origin + window.location.pathname;
}

/**
 * Tracks the Supabase Auth session and exposes the four entry points
 * the app uses today: Apple, Google, email magic link, and sign-out.
 * Follows the anonymous-by-default pattern (ADR-0017) — on first launch
 * with no session, `signInAnonymously` runs silently so the player has
 * a real Supabase user ID from the very first puzzle, and the upgrade
 * to a real provider preserves that ID via `linkIdentity`.
 *
 * When Supabase is not configured the status is `disabled` and the
 * actions return a friendly failure — nothing throws, so the app runs
 * local-only exactly as before.
 *
 * Mount this *outside* ProfileProvider: the profile-sync layer reacts
 * to auth state, so it must be able to read this context.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>(
    supabase ? 'loading' : 'disabled',
  );
  const [user, setUser] = useState<AuthUser | null>(null);
  // Guards `signInAnonymously` against firing twice while the initial
  // session is still being fetched (StrictMode double-invokes effects).
  const bootstrapping = useRef(false);

  useEffect(() => {
    if (!supabase) return;
    let active = true;

    // Resolve the initial session, then keep in sync with auth changes
    // (sign-in, sign-out, token refresh) for the rest of the session.
    supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return;
      if (data.session) {
        const u = toAuthUser(data.session.user);
        setUser(u);
        setStatus(statusFor(u));
        return;
      }
      // No session — bootstrap a silent anonymous user so the app has
      // server-side state from the first launch (ADR-0017).
      if (bootstrapping.current) return;
      bootstrapping.current = true;
      const { data: anon, error } = await supabase!.auth.signInAnonymously();
      bootstrapping.current = false;
      if (!active) return;
      if (error || !anon.session) {
        // Anonymous sign-ins disabled in the dashboard, or transient
        // network failure — keep the app usable, fall back to a
        // signed-out shape with no user.
        setStatus('anonymous');
        setUser(null);
        return;
      }
      const u = toAuthUser(anon.session.user);
      setUser(u);
      setStatus(statusFor(u));
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = toAuthUser(session?.user);
      setUser(u);
      setStatus(u ? statusFor(u) : 'loading');
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  /** Apple / Google share one shape: link onto the anonymous user if
   *  there is one (preserving the user ID + everything attached), or
   *  redirect to a fresh sign-in if accounts are not enabled. */
  const oauthEntry = useCallback(
    async (provider: 'apple' | 'google'): Promise<AuthResult> => {
      if (!supabase) {
        return { ok: false, message: 'Accounts are not available.' };
      }
      const opts = { redirectTo: redirectTo() };
      // `linkIdentity` is the right path when the player is anonymous —
      // it attaches the OAuth identity to the existing user. If there's
      // no user yet (rare; bootstrap failed), fall through to a fresh
      // signInWithOAuth which creates a brand-new account.
      const link =
        user && user.isAnonymous
          ? await supabase.auth.linkIdentity({ provider, options: opts })
          : await supabase.auth.signInWithOAuth({ provider, options: opts });
      if (link.error) return { ok: false, message: link.error.message };
      analytics.signedIn();
      return { ok: true };
    },
    [user],
  );

  const signInWithApple = useCallback(
    () => oauthEntry('apple'),
    [oauthEntry],
  );
  const signInWithGoogle = useCallback(
    () => oauthEntry('google'),
    [oauthEntry],
  );

  const signInWithMagicLink = useCallback(
    async (email: string): Promise<AuthResult> => {
      if (!supabase) {
        return { ok: false, message: 'Accounts are not available.' };
      }
      const trimmed = email.trim();
      if (!trimmed) {
        return { ok: false, message: 'Enter an email address.' };
      }
      // For an anonymous user: `updateUser({ email })` queues an email
      // confirmation that attaches this email to the existing user once
      // the link is followed — the anonymous progress is preserved.
      // For everyone else: `signInWithOtp` sends a fresh sign-in link.
      const op =
        user && user.isAnonymous
          ? await supabase.auth.updateUser({ email: trimmed })
          : await supabase.auth.signInWithOtp({
              email: trimmed,
              options: { emailRedirectTo: redirectTo() },
            });
      if (op.error) return { ok: false, message: op.error.message };
      analytics.signedUp();
      return { ok: true, needsConfirmation: true };
    },
    [user],
  );

  const signOut = useCallback(async (): Promise<void> => {
    if (!supabase) return;
    await supabase.auth.signOut();
    analytics.signedOut();
    // The auth state listener will fire with session = null; the
    // initial-getSession path won't re-run, so bootstrap a fresh
    // anonymous user here so the app continues to have one.
    const { data } = await supabase.auth.signInAnonymously();
    if (data.session) {
      const u = toAuthUser(data.session.user);
      setUser(u);
      setStatus(statusFor(u));
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        status,
        user,
        signInWithApple,
        signInWithGoogle,
        signInWithMagicLink,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

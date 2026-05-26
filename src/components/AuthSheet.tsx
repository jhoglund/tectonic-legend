import { useState } from 'react';
import { PrimaryButton, SecondaryButton } from './MaterialSurfaces';
import { useAuth } from '../lib/authContext';

interface AuthSheetProps {
  open: boolean;
  onClose: () => void;
}

type Step = 'pick' | 'email-form' | 'email-sent';
type AuthMode = 'sign-in' | 'create';

function AppMark() {
  return (
    <div
      className="grid place-items-center"
      style={{
        width: 56,
        height: 56,
        borderRadius: 'var(--radius-modal)',
        background: 'var(--brand-100)',
        color: 'var(--brand-600)',
      }}
    >
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="3" y="3" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
        <rect x="13" y="3" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
        <rect x="3" y="13" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
        <rect x="13" y="13" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.6" fill="currentColor" fillOpacity=".18" />
      </svg>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="currentColor" d="M17.6 9.2c0-.6-.1-1.3-.2-1.9H9v3.6h4.8c-.2 1.1-.8 2-1.8 2.6v2.2h2.9c1.7-1.5 2.7-3.8 2.7-6.5z" />
      <path fill="currentColor" opacity=".85" d="M9 18c2.4 0 4.5-.8 6-2.2l-2.9-2.2c-.8.5-1.8.9-3.1.9-2.4 0-4.4-1.6-5.2-3.8H.8v2.4C2.3 16 5.4 18 9 18z" />
      <path fill="currentColor" opacity=".7" d="M3.8 10.7C3.6 10.1 3.5 9.6 3.5 9s.1-1.1.3-1.7V4.9H.8C.3 6.2 0 7.6 0 9s.3 2.8.8 4.1l3-2.4z" />
      <path fill="currentColor" opacity=".55" d="M9 3.5c1.3 0 2.5.5 3.4 1.3l2.6-2.6C13.5.9 11.4 0 9 0 5.4 0 2.3 2 .8 4.9l3 2.4C4.6 5.1 6.6 3.5 9 3.5z" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M16.4 1.4c0 1-.4 2.1-1.1 2.9-.7.8-1.9 1.5-3 1.4-.1-1 .4-2.1 1-2.8.8-.9 2-1.5 3.1-1.5zm3.4 17.1c-.6 1.3-.9 1.9-1.7 3-1.1 1.6-2.6 3.6-4.5 3.6-1.7 0-2.1-1.1-4.4-1.1-2.3 0-2.8 1.1-4.5 1.1-1.9 0-3.4-1.8-4.5-3.4-3-4.4-3.3-9.6-1.5-12.4 1.3-2 3.4-3.2 5.3-3.2 2 0 3.2 1.1 4.8 1.1 1.6 0 2.5-1.1 4.8-1.1 1.7 0 3.6.9 4.9 2.5-4.3 2.4-3.6 8.6.3 9.9z" />
    </svg>
  );
}

/**
 * Bottom sheet for upgrading from an anonymous session to a real
 * account (ADR-0017). Anonymous-by-default means a player never sees a
 * signup wall — this sheet only surfaces at value moments: Settings,
 * the subscribe flow, cross-device prompts. The framing is "save your
 * progress," not "sign up."
 *
 * Three provider entries — Apple, Google, email magic link — covering
 * App Store guideline 4.8 and a passwordless fallback. The Apple /
 * Google taps trigger a redirect handled by Supabase; the email tap
 * opens an inline field and sends a one-tap link.
 */
export function AuthSheet({ open, onClose }: AuthSheetProps) {
  const { signInWithApple, signInWithGoogle, signInWithMagicLink } = useAuth();
  const [step, setStep] = useState<Step>('pick');
  const [mode, setMode] = useState<AuthMode>('sign-in');
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  function reset() {
    setStep('pick');
    setEmail('');
    setBusy(false);
    setError(null);
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function handleOAuth(provider: 'apple' | 'google') {
    setBusy(true);
    setError(null);
    const result =
      provider === 'apple'
        ? await signInWithApple()
        : await signInWithGoogle();
    setBusy(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    // The provider redirects; the page reloads with a fresh session.
    // Nothing more for the sheet to do — Supabase handles the callback.
  }

  async function handleSendLink() {
    const trimmed = email.trim();
    if (!trimmed) {
      setError('Enter an email address.');
      return;
    }
    setBusy(true);
    setError(null);
    const result = await signInWithMagicLink(trimmed);
    setBusy(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    setStep('email-sent');
  }

  return (
    <div
      onClick={handleClose}
      className="fixed inset-0 flex items-end justify-center"
      style={{ background: 'rgba(0,0,0,0.4)', zIndex: 80 }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex w-full flex-col overflow-y-auto"
        style={{
          maxWidth: '430px',
          maxHeight: 'calc(100dvh - env(safe-area-inset-top) - var(--space-4))',
          background: 'var(--surface-elevated)',
          borderTopLeftRadius: 'var(--radius-modal)',
          borderTopRightRadius: 'var(--radius-modal)',
          padding: 'var(--space-4)',
          paddingBottom: 'calc(env(safe-area-inset-bottom) + var(--space-4))',
        }}
      >
        <div
          className="mx-auto mb-4"
          style={{ width: 36, height: 5, borderRadius: 999, background: 'var(--border)' }}
        />

        {step === 'pick' && (
          <>
            <div className="mb-5 flex flex-col items-center text-center">
              <AppMark />
              <h2
                className="mt-4 text-2xl font-semibold"
                style={{ color: 'var(--text-primary)' }}
              >
                Save your progress
              </h2>
              <p
                className="mt-2 max-w-72 text-sm"
                style={{ color: 'var(--text-secondary)', lineHeight: 1.45 }}
              >
                Sync your puzzles, mastery, and streak across devices.
              </p>
            </div>

            <div
              className="mx-auto mb-5 grid w-fit grid-cols-2 p-1"
              role="tablist"
              style={{
                background: 'var(--surface-track)',
                borderRadius: 'var(--radius-chip)',
              }}
            >
              {(['sign-in', 'create'] as const).map((tab) => {
                const selected = mode === tab;
                return (
                  <button
                    key={tab}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    onClick={() => setMode(tab)}
                    className="cursor-pointer px-4 py-2 text-sm font-medium"
                    style={{
                      background: selected ? 'var(--surface-elevated)' : 'transparent',
                      borderRadius: 'var(--radius-chip)',
                      color: selected ? 'var(--brand-600)' : 'var(--text-secondary)',
                    }}
                  >
                    {tab === 'sign-in' ? 'Sign in' : 'Create account'}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-col gap-3">
              <PrimaryButton onClick={() => handleOAuth('google')} disabled={busy}>
                <GoogleIcon />
                Continue with Google
              </PrimaryButton>
              <SecondaryButton onClick={() => handleOAuth('apple')} disabled={busy}>
                <AppleIcon />
                Continue with Apple
              </SecondaryButton>
            </div>

            <div className="my-5 flex items-center gap-3">
              <span className="h-px flex-1" style={{ background: 'var(--border)' }} />
              <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                OR
              </span>
              <span className="h-px flex-1" style={{ background: 'var(--border)' }} />
            </div>

            <button
              type="button"
              onClick={() => {
                setStep('email-form');
                setError(null);
              }}
              disabled={busy}
              className="w-full cursor-pointer py-3 text-sm font-medium"
              style={{
                background: 'var(--surface-elevated)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-button)',
                color: 'var(--brand-600)',
                opacity: busy ? 0.5 : 1,
              }}
            >
              {mode === 'sign-in' ? 'Continue with email' : 'Create with email'}
            </button>

            {error && (
              <p
                className="mt-3 text-sm font-medium"
                style={{ color: 'var(--danger)' }}
              >
                {error}
              </p>
            )}

            <button
              type="button"
              onClick={handleClose}
              className="mt-4 cursor-pointer py-2 text-sm font-medium"
              style={{ color: 'var(--text-tertiary)' }}
            >
              Not now
            </button>
          </>
        )}

        {step === 'email-form' && (
          <>
            <h2
              className="mb-1 text-xl font-semibold"
              style={{ color: 'var(--text-primary)' }}
            >
              {mode === 'sign-in' ? 'Email me a link' : 'Create with email'}
            </h2>
            <p
              className="mb-4 text-sm"
              style={{ color: 'var(--text-secondary)', lineHeight: 1.55 }}
            >
              We'll send a one-tap link to sign you in. No password to
              remember.
            </p>

            <label
              className="relative block"
              style={{
                background: 'var(--surface-elevated)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-button)',
              }}
            >
              <span
                className="absolute left-3 px-1 text-xs"
                style={{
                  top: -8,
                  background: 'var(--surface-elevated)',
                  color: 'var(--text-secondary)',
                }}
              >
                Email
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError(null);
                }}
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                className="w-full bg-transparent px-4 py-4 text-base outline-none"
                style={{
                  color: 'var(--text-primary)',
                }}
              />
            </label>

            {error && (
              <p
                className="mt-2 text-sm font-medium"
                style={{ color: 'var(--danger)' }}
              >
                {error}
              </p>
            )}

            <div className="mt-3 flex flex-col">
              <PrimaryButton
                onClick={handleSendLink}
                disabled={busy || email.trim().length === 0}
              >
                {busy ? 'Sending...' : 'Send link'}
              </PrimaryButton>
            </div>
            <button
              type="button"
              onClick={() => {
                setStep('pick');
                setError(null);
              }}
              className="mt-2 cursor-pointer py-2 text-sm font-medium"
              style={{ color: 'var(--text-tertiary)' }}
            >
              Back
            </button>
          </>
        )}

        {step === 'email-sent' && (
          <>
            <h2
              className="mb-1 text-xl font-semibold"
              style={{ color: 'var(--text-primary)' }}
            >
              Check your email
            </h2>
            <p
              className="mb-4 text-sm"
              style={{ color: 'var(--text-secondary)', lineHeight: 1.55 }}
            >
              We sent a sign-in link to {email.trim()}. Tap it on this device
              to finish saving your progress.
            </p>
            <PrimaryButton onClick={handleClose}>Done</PrimaryButton>
          </>
        )}
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useAuth } from '../lib/authContext';

interface AuthSheetProps {
  open: boolean;
  onClose: () => void;
}

type Step = 'pick' | 'email-form' | 'email-sent';

const inputStyle: React.CSSProperties = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-button)',
  color: 'var(--text-primary)',
};

const buttonBase: React.CSSProperties = {
  width: '100%',
  padding: '12px 16px',
  borderRadius: 'var(--radius-button)',
  fontSize: '15px',
  fontWeight: 600,
  cursor: 'pointer',
  textAlign: 'center',
};

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
      style={{ background: 'rgba(0,0,0,0.4)', zIndex: 50 }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex w-full flex-col"
        style={{
          maxWidth: '430px',
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
            <h2
              className="mb-1 text-xl font-semibold"
              style={{ color: 'var(--text-primary)' }}
            >
              Save your progress
            </h2>
            <p
              className="mb-5 text-sm"
              style={{ color: 'var(--text-secondary)', lineHeight: 1.55 }}
            >
              Sync across devices and keep your puzzles, mastery and streak
              safe.
            </p>

            <button
              type="button"
              onClick={() => handleOAuth('apple')}
              disabled={busy}
              style={{
                ...buttonBase,
                background: '#000',
                color: '#fff',
                opacity: busy ? 0.5 : 1,
              }}
            >
              Continue with Apple
            </button>
            <button
              type="button"
              onClick={() => handleOAuth('google')}
              disabled={busy}
              style={{
                ...buttonBase,
                marginTop: 'var(--space-2)',
                background: 'var(--surface-elevated)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border)',
                opacity: busy ? 0.5 : 1,
              }}
            >
              Continue with Google
            </button>
            <button
              type="button"
              onClick={() => {
                setStep('email-form');
                setError(null);
              }}
              disabled={busy}
              style={{
                ...buttonBase,
                marginTop: 'var(--space-2)',
                background: 'transparent',
                color: 'var(--brand-600)',
                border: '1px solid var(--border)',
                opacity: busy ? 0.5 : 1,
              }}
            >
              Email me a link
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
              Email me a link
            </h2>
            <p
              className="mb-4 text-sm"
              style={{ color: 'var(--text-secondary)', lineHeight: 1.55 }}
            >
              We'll send a one-tap link to sign you in — no password to
              remember.
            </p>

            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError(null);
              }}
              placeholder="Email"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              className="w-full px-3 py-3 text-base"
              style={inputStyle}
            />

            {error && (
              <p
                className="mt-2 text-sm font-medium"
                style={{ color: 'var(--danger)' }}
              >
                {error}
              </p>
            )}

            <button
              type="button"
              onClick={handleSendLink}
              disabled={busy || email.trim().length === 0}
              style={{
                ...buttonBase,
                marginTop: 'var(--space-3)',
                background: 'var(--brand-600)',
                color: 'var(--text-on-brand)',
                opacity: busy || email.trim().length === 0 ? 0.5 : 1,
              }}
            >
              {busy ? 'Sending…' : 'Send link'}
            </button>
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
            <button
              type="button"
              onClick={handleClose}
              style={{
                ...buttonBase,
                background: 'var(--brand-600)',
                color: 'var(--text-on-brand)',
              }}
            >
              Done
            </button>
          </>
        )}
      </div>
    </div>
  );
}

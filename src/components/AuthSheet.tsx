import { useState } from 'react';
import { useAuth } from '../lib/authContext';

interface AuthSheetProps {
  open: boolean;
  onClose: () => void;
}

type Mode = 'signin' | 'signup';

/** Supabase's default minimum password length. */
const MIN_PASSWORD = 6;

const inputStyle: React.CSSProperties = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-button)',
  color: 'var(--text-primary)',
};

/**
 * Bottom sheet for signing in and creating an account (accounts plan
 * §5 / backlog A2). One sheet, two modes — it mirrors the modal
 * pattern of RedeemCodeSheet rather than introducing a routed screen,
 * since the app has no router.
 *
 * Sign-out lives in Settings, not here — this sheet is only ever shown
 * to a signed-out player.
 */
export function AuthSheet({ open, onClose }: AuthSheetProps) {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmSent, setConfirmSent] = useState(false);

  if (!open) return null;

  function reset() {
    setMode('signin');
    setEmail('');
    setPassword('');
    setBusy(false);
    setError(null);
    setConfirmSent(false);
  }

  function handleClose() {
    reset();
    onClose();
  }

  function switchMode(next: Mode) {
    setMode(next);
    setError(null);
  }

  async function handleSubmit() {
    const trimmedEmail = email.trim();
    if (!trimmedEmail || password.length < MIN_PASSWORD) {
      setError(`Enter an email and a password of at least ${MIN_PASSWORD} characters.`);
      return;
    }
    setBusy(true);
    setError(null);
    const result =
      mode === 'signin'
        ? await signIn(trimmedEmail, password)
        : await signUp(trimmedEmail, password);
    setBusy(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }
    if (result.needsConfirmation) {
      // Account made, but a confirmation email must be followed before
      // sign-in works. Keep the sheet open with the instruction.
      setConfirmSent(true);
      return;
    }
    // Signed in — onAuthStateChange will update the app; close up.
    handleClose();
  }

  const canSubmit = email.trim().length > 0 && password.length > 0 && !busy;
  const title = mode === 'signin' ? 'Sign in' : 'Create account';

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

        {confirmSent ? (
          <>
            <h2
              className="mb-1 text-xl font-semibold"
              style={{ color: 'var(--text-primary)' }}
            >
              Check your email
            </h2>
            <p className="mb-4 text-sm" style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              We sent a confirmation link to {email.trim()}. Follow it to
              finish creating your account, then come back and sign in.
            </p>
            <button
              type="button"
              onClick={handleClose}
              className="mt-2 cursor-pointer py-3 text-base font-semibold"
              style={{
                background: 'var(--brand-600)',
                color: 'var(--text-on-brand)',
                borderRadius: 'var(--radius-button)',
              }}
            >
              Done
            </button>
          </>
        ) : (
          <>
            <h2
              className="mb-1 text-xl font-semibold"
              style={{ color: 'var(--text-primary)' }}
            >
              {title}
            </h2>
            <p className="mb-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
              {mode === 'signin'
                ? 'Sign in to sync your progress across devices.'
                : 'Create an account to keep your progress safe.'}
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
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(null);
              }}
              placeholder={
                mode === 'signup'
                  ? `Password (${MIN_PASSWORD}+ characters)`
                  : 'Password'
              }
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              className="mt-2 w-full px-3 py-3 text-base"
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
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="mt-4 cursor-pointer py-3 text-base font-semibold"
              style={{
                background: 'var(--brand-600)',
                color: 'var(--text-on-brand)',
                borderRadius: 'var(--radius-button)',
                opacity: canSubmit ? 1 : 0.4,
              }}
            >
              {busy ? 'Please wait…' : title}
            </button>

            <button
              type="button"
              onClick={() => switchMode(mode === 'signin' ? 'signup' : 'signin')}
              className="mt-4 cursor-pointer py-2 text-sm font-medium"
              style={{ color: 'var(--brand-600)' }}
            >
              {mode === 'signin'
                ? 'New here? Create an account'
                : 'Already have an account? Sign in'}
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="cursor-pointer py-2 text-sm font-medium"
              style={{ color: 'var(--text-tertiary)' }}
            >
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  );
}

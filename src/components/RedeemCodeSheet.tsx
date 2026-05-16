import { useState } from 'react';
import { useProfile } from '../lib/profileContext';
import { analytics } from '../lib/analytics';

interface RedeemCodeSheetProps {
  open: boolean;
  onClose: () => void;
}

interface Feedback {
  tone: 'success' | 'error';
  text: string;
}

/**
 * A bottom sheet for redeeming a voucher code (backlog item 17a).
 * Codes are verified and granted entirely on-device — no network.
 */
export function RedeemCodeSheet({ open, onClose }: RedeemCodeSheetProps) {
  const { redeemVoucher } = useProfile();
  const [code, setCode] = useState('');
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  if (!open) return null;

  const redeemed = feedback?.tone === 'success';

  function handleRedeem() {
    const result = redeemVoucher(code);
    if (result.ok) {
      analytics.voucherRedeemed(result.days);
      setFeedback({
        tone: 'success',
        text:
          result.days === 0
            ? 'Premium unlocked — for good.'
            : `Premium unlocked — ${result.days} days.`,
      });
    } else {
      setFeedback({
        tone: 'error',
        text:
          result.reason === 'already-redeemed'
            ? 'That code has already been redeemed.'
            : 'That code isn’t valid. Check it and try again.',
      });
    }
  }

  function handleClose() {
    setCode('');
    setFeedback(null);
    onClose();
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
        <h2
          className="mb-1 text-xl font-semibold"
          style={{ color: 'var(--text-primary)' }}
        >
          Redeem a code
        </h2>
        <p className="mb-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
          Enter a voucher code to unlock Tectonic Premium.
        </p>

        {redeemed ? (
          <p
            className="mb-4 text-base font-medium"
            style={{ color: 'var(--success)' }}
          >
            {feedback?.text}
          </p>
        ) : (
          <>
            <input
              type="text"
              value={code}
              onChange={(e) => {
                setCode(e.target.value.toUpperCase());
                setFeedback(null);
              }}
              placeholder="TEC-XXXX-XXXX"
              autoCapitalize="characters"
              autoCorrect="off"
              spellCheck={false}
              className="w-full px-3 py-3 text-base"
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-button)',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-mono)',
                letterSpacing: '0.04em',
              }}
            />
            {feedback?.tone === 'error' && (
              <p
                className="mt-2 text-sm font-medium"
                style={{ color: 'var(--danger)' }}
              >
                {feedback.text}
              </p>
            )}
            <button
              type="button"
              onClick={handleRedeem}
              disabled={code.trim().length === 0}
              className="mt-4 cursor-pointer py-3 text-base font-semibold"
              style={{
                background: 'var(--brand-600)',
                color: 'var(--text-on-brand)',
                borderRadius: 'var(--radius-button)',
                opacity: code.trim().length === 0 ? 0.4 : 1,
              }}
            >
              Redeem
            </button>
          </>
        )}

        <button
          type="button"
          onClick={handleClose}
          className="mt-4 cursor-pointer py-3 text-base font-medium"
          style={{ color: 'var(--brand-600)' }}
        >
          {redeemed ? 'Done' : 'Cancel'}
        </button>
      </div>
    </div>
  );
}

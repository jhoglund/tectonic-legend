import { useState } from 'react';

/**
 * The premium paywall (backlog item 18).
 *
 * STATUS: built as a ready-to-wire UI component. It is **not** mounted
 * anywhere yet, and `onSubscribe` / `onRestore` are caller-supplied —
 * no StoreKit call is made. Wiring it requires three things that are
 * Jonas / Apple decisions, not code:
 *   1. The final free/premium split (ADR-0007 is being re-derived now
 *      that ADR-0012 removed difficulty gating — see soft-launch plan).
 *   2. StoreKit / RevenueCat products in App Store Connect (ADR-0008).
 *   3. Real Terms-of-Use (EULA) and Privacy Policy URLs.
 * Until then no feature is gated, so there is no "premium feature with
 * no purchase path" — no App Store 3.1.1 risk.
 *
 * Prices below are the soft-launch-plan recommendation; at runtime the
 * displayed price MUST come from StoreKit's localized product (Apple
 * requirement) — treat these as placeholders.
 */

export type PaywallPlan = 'monthly' | 'annual';

interface PlanInfo {
  id: PaywallPlan;
  label: string;
  price: string;
  caption: string;
  badge?: string;
}

const PLANS: PlanInfo[] = [
  {
    id: 'annual',
    label: 'Annual',
    price: '$19.99 / year',
    caption: 'About $1.67 a month',
    badge: 'Best value',
  },
  {
    id: 'monthly',
    label: 'Monthly',
    price: '$3.99 / month',
    caption: 'Billed monthly',
  },
];

const PERKS = [
  'No ads, ever',
  'Contradiction-chain hints — see exactly why each move works',
  'Unlimited advanced hints',
  'The full technique-mastery dashboard',
  'The daily-puzzle archive',
  'Every theme',
];

interface PaywallProps {
  open: boolean;
  onClose: () => void;
  /** Caller wires this to StoreKit / RevenueCat. */
  onSubscribe: (plan: PaywallPlan) => void;
  /** Caller wires this to a StoreKit restore. */
  onRestore: () => void;
}

/** Full-screen premium offer. */
export function Paywall({ open, onClose, onSubscribe, onRestore }: PaywallProps) {
  const [selected, setSelected] = useState<PaywallPlan>('annual');
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 flex flex-col"
      style={{
        background: 'var(--surface)',
        zIndex: 60,
        maxWidth: '430px',
        margin: '0 auto',
        paddingTop: 'calc(env(safe-area-inset-top) + var(--space-2))',
        paddingBottom: 'calc(env(safe-area-inset-bottom) + var(--space-4))',
      }}
    >
      {/* close */}
      <div className="flex justify-end px-2">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="cursor-pointer"
          style={{ width: 40, height: 40, color: 'var(--text-tertiary)' }}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-5 overflow-auto px-5">
        <div>
          <h2
            className="text-2xl font-semibold"
            style={{ color: 'var(--text-primary)' }}
          >
            You’ve earned this.
          </h2>
          <p
            className="mt-1 text-sm"
            style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}
          >
            Keep going — unlock every hint, the full picture of your
            progress, and an ad-free board.
          </p>
        </div>

        {/* perks */}
        <div className="flex flex-col gap-2">
          {PERKS.map((perk) => (
            <div key={perk} className="flex items-start gap-2">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--success)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                style={{ flexShrink: 0, marginTop: 1 }}
              >
                <path d="M20 6 9 17l-5-5" />
              </svg>
              <span
                className="text-sm"
                style={{ color: 'var(--text-primary)', lineHeight: 1.5 }}
              >
                {perk}
              </span>
            </div>
          ))}
        </div>

        {/* plans */}
        <div className="flex flex-col gap-2">
          {PLANS.map((plan) => {
            const active = selected === plan.id;
            return (
              <button
                key={plan.id}
                type="button"
                onClick={() => setSelected(plan.id)}
                className="flex cursor-pointer items-center justify-between px-4 py-3 text-left"
                style={{
                  borderRadius: 'var(--radius-card)',
                  border: `2px solid ${active ? 'var(--brand-600)' : 'var(--border)'}`,
                  background: active ? 'var(--brand-100)' : 'var(--surface-elevated)',
                }}
              >
                <span className="flex flex-col">
                  <span
                    className="text-base font-semibold"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {plan.label}
                  </span>
                  <span
                    className="text-xs"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    {plan.caption}
                  </span>
                </span>
                <span className="flex items-center gap-2">
                  {plan.badge && (
                    <span
                      className="text-xs font-semibold"
                      style={{
                        color: 'var(--text-on-brand)',
                        background: 'var(--brand-600)',
                        borderRadius: 'var(--radius-chip)',
                        padding: '2px 8px',
                      }}
                    >
                      {plan.badge}
                    </span>
                  )}
                  <span
                    className="text-sm font-medium"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {plan.price}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* actions + Apple-required disclosure */}
      <div className="flex flex-col gap-3 px-5 pt-3">
        <button
          type="button"
          onClick={() => onSubscribe(selected)}
          className="cursor-pointer py-4 text-base font-semibold"
          style={{
            background: 'var(--brand-600)',
            color: 'var(--text-on-brand)',
            borderRadius: 'var(--radius-button)',
          }}
        >
          Continue
        </button>
        <button
          type="button"
          onClick={onRestore}
          className="cursor-pointer py-1 text-sm font-medium"
          style={{ color: 'var(--brand-600)' }}
        >
          Restore purchases
        </button>
        <p
          className="text-center text-xs"
          style={{ color: 'var(--text-tertiary)', lineHeight: 1.5 }}
        >
          Billed through your Apple ID. Subscriptions renew automatically
          unless cancelled at least 24 hours before the period ends.
          Manage or cancel in your App Store account settings. Terms of
          Use and Privacy Policy apply.
        </p>
      </div>
    </div>
  );
}

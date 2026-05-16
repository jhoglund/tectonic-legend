import { useState } from 'react';
import { ScreenHeader } from '../components/ScreenHeader';
import { RedeemCodeSheet } from '../components/RedeemCodeSheet';
import { useProfile } from '../lib/profileContext';
import { isPremium } from '../lib/profile';

/** Working version string — bump on each release. */
const APP_VERSION = '0.1.0';

const card: React.CSSProperties = {
  background: 'var(--surface-elevated)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-card)',
  padding: 'var(--space-4)',
};

const sectionLabel: React.CSSProperties = {
  color: 'var(--text-tertiary)',
  letterSpacing: '0.06em',
};

function Rule({ heading, body }: { heading: string; body: string }) {
  return (
    <div>
      <p
        className="text-sm font-semibold"
        style={{ color: 'var(--text-primary)' }}
      >
        {heading}
      </p>
      <p
        className="mt-0.5 text-sm"
        style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}
      >
        {body}
      </p>
    </div>
  );
}

/**
 * Settings tab — v1 Phase 4, backlog item 19. Trimmed to what the app
 * actually does today: the rules and an About section. Theme, sound,
 * and haptics are deferred until those features exist; Restore Purchase
 * / Manage Subscription land with the StoreKit work. No account row,
 * no sign-in — v1 is local-only (ADR-0011).
 */
export function SettingsScreen() {
  const { profile } = useProfile();
  const [redeemOpen, setRedeemOpen] = useState(false);

  const premium = isPremium(profile);
  const planStatus = !premium
    ? 'Free'
    : profile.premiumExpiresAt
      ? `Premium · until ${new Date(profile.premiumExpiresAt).toLocaleDateString()}`
      : 'Premium · lifetime';

  return (
    <div>
      <ScreenHeader title="Settings" />
      <div className="flex flex-col gap-4 px-4 pt-2 pb-8">
        {/* plan */}
        <div>
          <p className="mb-2 px-1 text-xs font-semibold" style={sectionLabel}>
            TECTONIC PREMIUM
          </p>
          <div className="flex flex-col gap-3" style={card}>
            <div className="flex items-center justify-between">
              <span
                className="text-sm"
                style={{ color: 'var(--text-secondary)' }}
              >
                Plan
              </span>
              <span
                className="text-sm font-medium"
                style={{
                  color: premium ? 'var(--success)' : 'var(--text-primary)',
                }}
              >
                {planStatus}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setRedeemOpen(true)}
              className="cursor-pointer py-2.5 text-sm font-medium"
              style={{
                color: 'var(--brand-600)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-button)',
              }}
            >
              Redeem a code
            </button>
          </div>
        </div>

        {/* how to play */}
        <div>
          <p className="mb-2 px-1 text-xs font-semibold" style={sectionLabel}>
            HOW TO PLAY
          </p>
          <div className="flex flex-col gap-3" style={card}>
            <Rule
              heading="Fill every cage"
              body="Each outlined cage holds the numbers 1 up to its size, once each — a three-cell cage holds 1, 2, 3."
            />
            <Rule
              heading="Keep neighbours apart"
              body="No two touching cells may share a number — not even diagonally."
            />
            <Rule
              heading="There is always a path"
              body="Every puzzle can be reasoned out one cell at a time. Stuck? The Hint button explains the next move."
            />
          </div>
        </div>

        {/* about */}
        <div>
          <p className="mb-2 px-1 text-xs font-semibold" style={sectionLabel}>
            ABOUT
          </p>
          <div className="flex flex-col gap-3" style={card}>
            <div className="flex items-center justify-between">
              <span
                className="text-sm"
                style={{ color: 'var(--text-secondary)' }}
              >
                Version
              </span>
              <span
                className="text-sm font-medium"
                style={{
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                {APP_VERSION}
              </span>
            </div>
            <p
              className="text-sm"
              style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}
            >
              Tectonic is a logic puzzle of cages and numbers — no guessing,
              just reasoning. Your progress is kept on this device only.
            </p>
          </div>
        </div>

        <p
          className="px-1 text-xs"
          style={{ color: 'var(--text-tertiary)', lineHeight: 1.6 }}
        >
          Theme, sound, and haptics settings arrive alongside those features.
        </p>
      </div>

      <RedeemCodeSheet
        open={redeemOpen}
        onClose={() => setRedeemOpen(false)}
      />
    </div>
  );
}

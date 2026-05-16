import { useCallback, useState, type ReactNode } from 'react';
import { Paywall, type PaywallPlan } from '../components/Paywall';
import { RedeemCodeSheet } from '../components/RedeemCodeSheet';
import { analytics } from './analytics';
import { PaywallContext } from './paywallContext';

/**
 * Mounts the paywall once and exposes `openPaywall` app-wide. Premium
 * gates call it; the trigger is recorded for the conversion funnel.
 *
 * StoreKit / IAP is not wired (backlog item 17 — Apple-account-gated),
 * so the actionable unlock today is a voucher code: every paywall
 * action funnels into the redeem sheet. When StoreKit lands, `Continue`
 * becomes a real purchase and `Restore` a real restore.
 */
export function PaywallProvider({ children }: { children: ReactNode }) {
  // The paywall is open while a trigger is set; null = closed.
  const [trigger, setTrigger] = useState<string | null>(null);
  const [redeemOpen, setRedeemOpen] = useState(false);

  const openPaywall = useCallback((t: string) => {
    analytics.paywallShown(t);
    setTrigger(t);
  }, []);

  const closePaywall = useCallback(() => {
    setTrigger((t) => {
      if (t) analytics.paywallDismissed(t);
      return null;
    });
  }, []);

  const handleSubscribe = useCallback((plan: PaywallPlan) => {
    analytics.purchaseStarted(plan);
    // No StoreKit yet — route to the working unlock path.
    setRedeemOpen(true);
  }, []);

  return (
    <PaywallContext.Provider value={{ openPaywall }}>
      {children}
      <Paywall
        // Hidden while the redeem sheet is up so the sheet is reachable.
        open={trigger !== null && !redeemOpen}
        onClose={closePaywall}
        onSubscribe={handleSubscribe}
        onRestore={() => setRedeemOpen(true)}
        onRedeem={() => setRedeemOpen(true)}
      />
      <RedeemCodeSheet
        open={redeemOpen}
        onClose={() => {
          setRedeemOpen(false);
          // Close the paywall too — the player either unlocked premium
          // or stepped back; either way the gate moment is over.
          setTrigger(null);
        }}
      />
    </PaywallContext.Provider>
  );
}

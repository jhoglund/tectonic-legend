import { createContext, useContext } from 'react';

/**
 * App-wide paywall control. Any surface that gates a premium feature
 * calls `openPaywall` with the trigger that caused it (the trigger is
 * recorded for the soft-launch conversion funnel). The provider lives
 * in PaywallProvider.tsx.
 */
export interface PaywallContextValue {
  /** Open the paywall, tagged with the trigger (e.g. 'contradiction_hint'). */
  openPaywall: (trigger: string) => void;
}

export const PaywallContext = createContext<PaywallContextValue | null>(null);

/** Read the paywall control. Must be used inside a PaywallProvider. */
export function usePaywall(): PaywallContextValue {
  const ctx = useContext(PaywallContext);
  if (!ctx) {
    throw new Error('usePaywall must be used within a PaywallProvider');
  }
  return ctx;
}

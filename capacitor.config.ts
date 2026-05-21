import type { CapacitorConfig } from '@capacitor/cli';

/**
 * Capacitor config for the iOS wrapper.
 *
 * `appId` is the iOS bundle identifier. It is effectively permanent
 * once an App Store Connect record exists. The current value predates
 * the brand being finalised (ADR-0006 — `Tectonic Legend`); whether
 * to align it to `com.jhoglund.tectoniclegend` before submission is a
 * deliberate call documented in the rename handover. `appName` is the
 * on-device label and matches the brand.
 *
 * Build the web bundle for native with `npm run build:ios` (base = '/'),
 * then `npx cap sync ios`.
 */
const config: CapacitorConfig = {
  appId: 'com.jhoglund.tectonic',
  appName: 'Tectonic Legend',
  webDir: 'dist',
};

export default config;

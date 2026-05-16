import type { CapacitorConfig } from '@capacitor/cli';

/**
 * Capacitor config for the iOS wrapper.
 *
 * `appId` is the iOS bundle identifier. It is effectively permanent
 * once an App Store Connect record exists — confirm it before that
 * record is created. `appName` is the working display name; the final
 * brand is still being decided (see docs/soft-launch-plan.md).
 *
 * Build the web bundle for native with `npm run build:ios` (base = '/'),
 * then `npx cap sync ios`.
 */
const config: CapacitorConfig = {
  appId: 'com.jhoglund.tectonic',
  appName: 'Tectonic',
  webDir: 'dist',
};

export default config;

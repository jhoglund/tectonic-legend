import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';

/**
 * One-time native setup for the Capacitor iOS shell. A no-op on the
 * web build — `Capacitor.isNativePlatform()` is false there, so the
 * same bundle runs unchanged in a browser and on a device.
 *
 * Layout safe-areas are handled in CSS via `env(safe-area-inset-*)`;
 * this only sets the status-bar text style, which follows the system
 * light/dark setting (the app themes the same way).
 */
export async function initNative(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  try {
    await StatusBar.setStyle({ style: Style.Default });
  } catch {
    // Status-bar plugin unavailable — non-fatal; the app still runs.
  }
}

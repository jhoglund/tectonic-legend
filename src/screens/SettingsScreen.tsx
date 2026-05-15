import { ScreenHeader } from '../components/ScreenHeader';

/**
 * Settings tab — stub for v1 Phase 0. The real Settings surface
 * (theme / sound / haptics / Restore Purchase / How to play / About)
 * is Phase 4, backlog item 19.
 */
export function SettingsScreen() {
  return (
    <div>
      <ScreenHeader title="Settings" />
      <div className="px-6 py-20 text-center">
        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          Theme, sound, haptics, and your subscription will live here.
        </p>
      </div>
    </div>
  );
}

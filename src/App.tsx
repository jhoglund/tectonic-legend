import { useState } from 'react';
import { TabBar } from './components/TabBar';
import type { Tab } from './components/TabBar';
import { HomeTab } from './screens/HomeTab';
import { StatsScreen } from './screens/StatsScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { AuthProvider } from './lib/AuthProvider';
import { ProfileProvider } from './lib/ProfileProvider';
import { PaywallProvider } from './lib/PaywallProvider';

/**
 * App shell — a phone-width column with a three-tab bottom bar
 * (Home / Stats / Settings, per ADR-0011). Navigation is plain tab
 * state — no URL router; the location hash is reserved for
 * shareable-puzzle links (src/engine/urlCodec.ts). The whole app is
 * wrapped in ProfileProvider so every surface shares one profile, and
 * in AuthProvider (outermost — the profile-sync layer reads auth).
 */
function App() {
  const [tab, setTab] = useState<Tab>('home');

  return (
    <AuthProvider>
      <ProfileProvider>
        <PaywallProvider>
          <div style={{ background: 'var(--surface)', minHeight: '100dvh' }}>
            {/* Phone-width column, centred via margin auto. Not a flex child —
                flex items default to min-width:auto and would refuse to cap. */}
            <div
              className="mx-auto flex flex-col"
              style={{ maxWidth: '430px', minHeight: '100dvh' }}
            >
              <main className="flex-1 overflow-auto">
                {tab === 'home' ? (
                  <HomeTab />
                ) : tab === 'stats' ? (
                  <StatsScreen />
                ) : (
                  <SettingsScreen />
                )}
              </main>
              <TabBar active={tab} onChange={setTab} />
            </div>
          </div>
        </PaywallProvider>
      </ProfileProvider>
    </AuthProvider>
  );
}

export default App;

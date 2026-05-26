import { useState } from 'react';
import { TabBar } from './components/TabBar';
import type { Tab } from './components/TabBar';
import { HomeTab } from './screens/HomeTab';
import { StatsScreen } from './screens/StatsScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { AuthProvider } from './lib/AuthProvider';
import { ProfileProvider } from './lib/ProfileProvider';
import { PaywallProvider } from './lib/PaywallProvider';
import { DevViewProvider } from './lib/DevViewProvider';
import { useProfile } from './lib/profileContext';

/**
 * App shell — a phone-width column with a three-tab bottom bar
 * (Home / Stats / Settings, per ADR-0011). Navigation is plain tab
 * state — no URL router; the location hash is reserved for
 * shareable-puzzle links (src/engine/urlCodec.ts). The whole app is
 * wrapped in ProfileProvider so every surface shares one profile, and
 * in AuthProvider (outermost — the profile-sync layer reads auth).
 */
function App() {
  return (
    <AuthProvider>
      <ProfileProvider>
        <PaywallProvider>
          <DevViewProvider>
            <AppShell />
          </DevViewProvider>
        </PaywallProvider>
      </ProfileProvider>
    </AuthProvider>
  );
}

function AppShell() {
  const [tab, setTab] = useState<Tab>('home');
  const [newPuzzleNonce, setNewPuzzleNonce] = useState(0);
  const { profile } = useProfile();
  const showTabBar = !(tab === 'home' && profile.stage === 0);

  function openNewPuzzle() {
    setTab('home');
    setNewPuzzleNonce((n) => n + 1);
  }

  return (
    <div style={{ background: 'var(--surface)', minHeight: '100dvh' }}>
      <div className="fixed top-0 left-0 right-0 z-40 pointer-events-none status-safe-area" />
      {/* Phone-width column, centred via margin auto. Not a flex child —
          flex items default to min-width:auto and would refuse to cap. */}
      <div
        className="mx-auto flex flex-col"
        style={{ maxWidth: '430px', minHeight: '100dvh' }}
      >
        <main className={`flex-1 overflow-auto safe-area-pad-top ${showTabBar ? 'nav-clearance' : ''}`}>
          {tab === 'home' ? (
            <HomeTab
              newPuzzleNonce={newPuzzleNonce}
              onOpenSettings={() => setTab('settings')}
            />
          ) : tab === 'stats' ? (
            <StatsScreen />
          ) : (
            <SettingsScreen />
          )}
        </main>
        {showTabBar && (
          <TabBar active={tab} onChange={setTab} onNewPuzzle={openNewPuzzle} />
        )}
      </div>
    </div>
  );
}

export default App;

import { useState } from 'react';
import { TabBar } from './components/TabBar';
import type { Tab } from './components/TabBar';
import { HomeTab } from './screens/HomeTab';
import { StatsScreen } from './screens/StatsScreen';
import { SettingsScreen } from './screens/SettingsScreen';

/**
 * App shell — v1 Phase 0. A phone-width column with a three-tab
 * bottom bar (Home / Stats / Settings, per ADR-0011). Navigation is
 * plain tab state — no URL router; the location hash is reserved for
 * shareable-puzzle links (src/engine/urlCodec.ts).
 *
 * The Home tab currently renders the existing game; Phase 1 splits it
 * into a Home landing screen and a dedicated Solving screen.
 */
function App() {
  const [tab, setTab] = useState<Tab>('home');

  return (
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
  );
}

export default App;

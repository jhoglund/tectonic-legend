import type { ReactNode } from 'react';

export type Tab = 'home' | 'stats' | 'settings';

interface TabBarProps {
  active: Tab;
  onChange: (tab: Tab) => void;
  onNewPuzzle: () => void;
}

const iconProps = {
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

const TABS: { id: Tab; label: string; icon: ReactNode }[] = [
  {
    id: 'home',
    label: 'Today',
    icon: (
      <svg {...iconProps} aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="3" />
        <path d="M3 9h18M9 3v18" />
      </svg>
    ),
  },
  {
    id: 'stats',
    label: 'Stats',
    icon: (
      <svg {...iconProps} aria-hidden="true">
        <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
      </svg>
    ),
  },
];

/** Liquid-glass global nav. Today / new puzzle / Stats. */
export function TabBar({ active, onChange, onNewPuzzle }: TabBarProps) {
  return (
    <nav
      className="bottom-nav-shell fixed left-0 right-0 z-50 pointer-events-none"
      aria-label="Primary"
    >
      <div className="mx-auto max-w-[430px] px-3">
        <div className="bottom-nav-glass pointer-events-auto grid grid-cols-3 items-center gap-1 rounded-[28px] px-2 py-1.5">
          {TABS.slice(0, 1).map((tab) => {
            const isActive = active === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onChange(tab.id)}
                aria-current={isActive ? 'page' : undefined}
                className="flex min-w-0 cursor-pointer select-none flex-col items-center justify-center gap-0.5 rounded-full px-2 py-1.5 transition-colors"
                style={{
                  color: isActive ? 'var(--brand-700)' : 'var(--text-secondary)',
                  background: 'transparent',
                }}
              >
                <span className="grid h-5 w-5 place-items-center">{tab.icon}</span>
                <span className="text-[10px] font-semibold uppercase tracking-[0.08em]">
                  {tab.label}
                </span>
              </button>
            );
          })}
          <button
            type="button"
            onClick={onNewPuzzle}
            className="flex min-w-0 cursor-pointer select-none items-center justify-center gap-1.5 rounded-full px-2 py-3 text-sm font-semibold transition-transform active:scale-[0.98]"
            style={{
              background: 'var(--brand-600)',
              color: 'var(--text-on-brand)',
              boxShadow: 'var(--shadow-fab)',
            }}
          >
            + New
          </button>
          {TABS.slice(1).map((tab) => {
            const isActive = active === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onChange(tab.id)}
                aria-current={isActive ? 'page' : undefined}
                className="flex min-w-0 cursor-pointer select-none flex-col items-center justify-center gap-0.5 rounded-full px-2 py-1.5 transition-colors"
                style={{
                  color: isActive ? 'var(--brand-700)' : 'var(--text-secondary)',
                  background: 'transparent',
                }}
              >
                <span className="grid h-5 w-5 place-items-center">{tab.icon}</span>
                <span className="text-[10px] font-semibold uppercase tracking-[0.08em]">
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

import type { ReactNode } from 'react';

export type Tab = 'home' | 'stats' | 'settings';

interface TabBarProps {
  active: Tab;
  onChange: (tab: Tab) => void;
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
    label: 'Home',
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
  {
    id: 'settings',
    label: 'Settings',
    icon: (
      <svg {...iconProps} aria-hidden="true">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" />
      </svg>
    ),
  },
];

/** iOS-style bottom tab bar. Three destinations per ADR-0011's v1 nav. */
export function TabBar({ active, onChange }: TabBarProps) {
  return (
    <nav
      className="flex shrink-0"
      style={{
        background: 'var(--surface-elevated)',
        borderTop: '1px solid var(--border)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {TABS.map((tab) => {
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            aria-current={isActive ? 'page' : undefined}
            className="flex flex-1 flex-col items-center gap-1 pt-2 pb-1.5 cursor-pointer select-none"
            style={{ color: isActive ? 'var(--brand-600)' : 'var(--text-tertiary)' }}
          >
            {tab.icon}
            <span className="text-[11px] font-medium">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

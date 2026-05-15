import { ScreenHeader } from '../components/ScreenHeader';

/**
 * Stats tab — stub for v1 Phase 0. The real three-section Stats
 * surface (solve performance / technique mastery / streaks) is
 * Phase 2, backlog item 13.
 */
export function StatsScreen() {
  return (
    <div>
      <ScreenHeader title="Stats" />
      <div className="px-6 py-20 text-center">
        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          Solve a few puzzles and your stats appear here — solve times,
          technique mastery, and streaks.
        </p>
      </div>
    </div>
  );
}

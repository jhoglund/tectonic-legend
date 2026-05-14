# ADR-0010: Daily puzzle system design

**Date:** 2026-05-14
**Status:** Proposed
**Source:** [docs/market-research.md §3](../market-research.md), [PRD.md §4](../../PRD.md)

## Context

The daily puzzle is the second-highest-leverage retention feature in the genre after the core loop — NYT Mini, Wordle, and Sudoku.com all anchor habits on it. Two implementation paths:

1. **Client-only deterministic seed** — the date (UTC) seeds the generator; all players get the same puzzle without a server. Free; zero infra; trivially auditable; archive is a function of the seed range. Risk: a generator regression that produces a bad day's puzzle is global and unrecoverable.
2. **Server-issued puzzle** — a backend curates and serves one puzzle per day per difficulty. Editorial control; can hand-pick or hand-tune; recoverable mistakes. Cost: backend, distribution, ongoing operation.

## Decision (proposed)

**V1 ships client-only deterministic seeding.** The UTC day seeds `generator.ts` with a fixed-difficulty profile per weekday (Mon/Tue Easy, Wed/Thu Medium, Fri Hard, Sat Expert, Sun curated-tutorial-style). The archive feature reads the same seed function for past dates. Streak counter is `localStorage`.

If a daily puzzle ever generates badly (player report or QA), we ship a build with a per-date override list. Acceptable until a backend exists for other reasons (Tier-1 social, per ADR-0009).

## Consequences

- **Enables:** daily puzzle in v1 with zero infra; archive comes for free; predictable behavior across platforms.
- **Precludes:** editorial curation per day; surprise content; cross-device streak sync.
- **Implies:** `generator.ts` accepts an optional seed parameter; an `overrides` map ships in code for hot-fixing bad dates; the streak counter is local-only (lost on uninstall) — acceptable for v1 because the rest of the profile is also local-only.

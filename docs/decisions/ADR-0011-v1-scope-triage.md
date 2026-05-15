# ADR-0011: v1 scope — prototype triaged against the PRD

**Date:** 2026-05-15
**Status:** Accepted
**Source:** [PRD.md §8–9](../../PRD.md), [docs/backlog.md](../backlog.md)

## Context

The iOS-native prototype (variant 01 of the 2026-05-14 swarm) was fleshed out to 25 screens. Some of those screens — produced from the swarm brief, not the PRD — introduced surfaces that assume infrastructure the PRD explicitly excludes from v1: an Auth screen and an Account screen imply a backend and an account system, and some screens carried cohort/percentile comparisons that imply a leaderboard. Before building, the prototype needed to be reconciled against the PRD so v1 doesn't overreach.

Jonas triaged all surfaces on 2026-05-15.

## Decision

v1 builds the iOS-native prototype with this scope:

**In v1:** Home (simplified), a single merged difficulty picker, the Solving screen + all 7 states, Solved (no cohort/percentile), Onboarding + guided tutorial, Stage-up cards, mid-solve + post-solve mastery moments, Stats (3 sections), daily puzzle + local streak, the share artifact, the paywall (built last), and a trimmed Settings.

**Cut from v1:** the Auth screen, the standalone Account screen, Practice as a separate tab (merged into the difficulty picker), and all cohort/percentile comparisons.

Monetization ships in v1 via Apple StoreKit, which needs no account system or backend — so cutting auth does not cut the paywall.

## Consequences

- **Enables:** a local-only v1 with no backend, consistent with `ARCHITECTURE.md` §8; a 3-tab nav (Home / Stats / Settings); a leaner build surface; the six-phase build plan in `docs/backlog.md`.
- **Precludes:** cross-device sync, friend/leaderboard features, and account-based personalization in v1 — all deferred to a Tier-1 backend release.
- **Implies:** the prototype's `01-auth.html` and `12-settings-account.html` are reference-only, not built; Restore Purchase + Manage Subscription fold into Settings as StoreKit rows; the Solved and Stats screens must not show comparative ranking in v1; `PRD.md` §8–9 updated to match.

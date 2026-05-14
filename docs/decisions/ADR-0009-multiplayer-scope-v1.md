# ADR-0009: Multiplayer scope for v1

**Date:** 2026-05-14
**Status:** Proposed
**Source:** [docs/market-research.md §3](../market-research.md), [ADR-0004](ADR-0004-tier-0-viral-before-backend.md)

## Context

Real-time multiplayer is expensive (WebSocket infra, room state, matchmaking) and historically a flop in casual puzzles when shipped before validating async interest. The genre's social winners are Tier-0 artifacts (Wordle's emoji grid, NYT streak shares) and Tier-1 friend leaderboards (NYT, Words With Friends). Tier-2 real-time has flopped more often than it has worked.

## Decision (proposed)

V1 has **zero multiplayer**. No matchmaking, no live races, no friend system, no leaderboards. Tier-0 share artifacts (ADR-0004) provide the social surface. Tier-1 (friend leaderboards via a minimal backend) becomes a roadmap item only if soft-launch share-rate clears 5% of sessions. Tier-2 (real-time race / co-op) is deferred until Tier-1 social engagement justifies the infra.

## Consequences

- **Enables:** v1 ships without backend infrastructure; share metrics are the gate, not a guess; we don't build features no one asked for.
- **Precludes:** "vs. friend" framing in marketing for v1; head-to-head modes in launch ads.
- **Implies:** the share artifact and challenge link bear the entire viral load — they need to be excellent (Open Design iteration); analytics must capture share funnel cleanly so the Tier-1 trigger is unambiguous.

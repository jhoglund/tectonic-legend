# ADR-0004: Tier-0 viral mechanics before any backend

**Date:** 2026-05-14
**Status:** Accepted
**Source:** [docs/market-research.md §3](../market-research.md)

## Context

The historical winners in casual-puzzle virality (Wordle, NYT Mini, Words With Friends streaks) all relied on **artifact-driven sharing** — a compact, spoiler-free, screenshot-friendly summary — not on global leaderboards or server-mediated social features. The losers added real-time multiplayer or rank-based leaderboards too early, before they had validated that anyone cared. Our existing share-URL feature is already 60% of a Tier-0 challenge mechanic.

## Decision

V1 ships **only Tier-0 viral mechanics**: shareable solve summary (colored mini-grid + time), challenge links (existing share URLs + challenger's time encoded in the hash), and copyable streak displays. No backend, no friend system, no leaderboards. Tier-1 (daily-puzzle leaderboard, friend system) is post-launch and gated on Tier-0 share rate ≥5% of sessions.

## Consequences

- **Enables:** zero infra cost at launch; v1 ships faster; viral metrics measurable before any server investment.
- **Precludes:** global leaderboards, friend-versus-friend streaks, real-time co-op for v1.
- **Implies:** `urlCodec.ts` needs a challenge-link extension; the share-image rendering happens client-side (canvas or SVG-to-PNG); analytics must capture share taps so Tier-1 trigger can be measured.

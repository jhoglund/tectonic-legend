# ADR-0014: Developer role and in-app debug panel

**Date:** 2026-05-18
**Status:** Accepted
**Source:** [docs/backlog.md](../backlog.md) — improvement item I5

## Context

Testing a flow or state — onboarding, the stage-up card, technique-mastery levels, the paywall, sign-in — meant grinding the game to that state or hand-editing `localStorage`. Backlog item I5 asks for a developer debug UI, gated by role management, to reach those states on demand on any build (dev, TestFlight, production).

## Decision

Add a `role: 'player' | 'developer'` field to `PlayerProfile`. The developer role is unlocked by tapping the Settings → Version row seven times — a hidden, deliberate gesture. When `role === 'developer'`, the Settings screen shows a **DEVELOPER** panel (`DevTools`) with tools to set the stage, set every technique's mastery, grant/remove premium, jump to flows (onboarding, stage-up card, paywall, sign-in), and reset. The tools mutate the profile through a `devSetProfile` escape hatch on the profile context. Most "flows" are reached by putting the profile into the state that routes to them (stage 0 → onboarding, a trailing `celebratedStage` → the stage-up card).

## Consequences

- **Enables:** any flow or state reachable on any build without code changes or `localStorage` edits — the I5 ask.
- **Costs:** `role` is part of the synced profile blob, so it follows a signed-in user across devices (fine for the solo dev). The panel can grant premium; the 7-tap unlock is obscure but not a hard gate — **before a wide public launch the unlock should be hardened** (a dev-build gate, or dropping the premium-granting tool from production). Tracked under I5.
- **Implies:** the `role` concept is a foundation other role-based features can build on — Supabase account roles, a future admin surface.

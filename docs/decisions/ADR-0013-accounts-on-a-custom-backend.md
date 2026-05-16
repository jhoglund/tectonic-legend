# ADR-0013: Player accounts on a custom backend

**Date:** 2026-05-16
**Status:** Accepted — amends [ADR-0011](ADR-0011-v1-scope-triage.md) and [ADR-0004](ADR-0004-tier-0-viral-before-backend.md)
**Source:** [docs/accounts-plan.md](../accounts-plan.md)

## Context

v1 was deliberately local-only: ADR-0011 cut the Auth and Account screens and committed to no backend; ADR-0004 deferred any server until Tier-0 viral mechanics had proven out. The cost is real — a local-only profile is lost on uninstall and cannot follow a player across devices. Jonas has decided accounts are wanted now, and chose a **custom backend** over a BaaS (Supabase) or the Apple-native path (Sign in with Apple + CloudKit) — for full control of the data model and auth, and cross-platform reach (iOS, web, and a future Android all sync against one API).

## Decision

Add player accounts backed by a **custom service**: a small API over **Postgres with Drizzle ORM**, mirroring the Mimir data stack. Auth is email + password (argon2id hashing) with short-lived access tokens plus refresh tokens; "Sign in with Apple" is a fast-follow once Apple Developer enrolment lands. The profile becomes **local-first, synced when signed in** — the app stays fully usable signed-out; signing in reconciles the local and server profile (last-write-wins by `updatedAt`). The backend is its own private repo. Build plan, data model, and API contract: `docs/accounts-plan.md`.

## Consequences

- **Enables:** progress that survives uninstall and follows the player across devices and platforms; the data foundation Tier-1 social (ADR-0009) will also build on.
- **Costs:** the "no backend" simplicity is gone — there is now a service to host, secure, and pay for. The privacy posture changes (profile data leaves the device), so the App Store privacy labels and `docs/app-store-launch.md` need rework. Auth is security-critical surface.
- **Implies:** ADR-0011's local-only stance and its cut of the Auth/Account screens are reversed; ADR-0004 still holds for *social* features (no leaderboard backend yet) but its "no backend at all" premise is amended. Soft-launch timing (backlog item 24) must now decide whether accounts ship *before* launch or whether launched local-only users are migrated *after* — see the plan.

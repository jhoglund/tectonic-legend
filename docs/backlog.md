# Backlog

> Single tracker for in-progress, planned, and intent-only work. Solo project — kept lightweight.
> Decisions live in [`decisions/`](decisions/). Open questions are at the bottom.

**Last updated:** 2026-05-15

---

## Now

Active work, in progress or paused awaiting input.

### v1 implementation · 2026-05-15 — *starting*

The iOS-native prototype (variant 01 of the 2026-05-14 swarm) is the design target. Scope was triaged against the PRD on 2026-05-15 — see [ADR-0011](decisions/ADR-0011-v1-scope-triage.md). The v1 build plan below is the result. Work starts at Phase 0.

**Decisions still blocked on Jonas:**
- App name (ADR-0006) — needed before App Store submission.
- Lifetime pricing (ADR-0008) — the swarm flagged that $6.99 Lifetime strictly dominates $24.99/yr Annual; ADR-0008 needs a resolved price or a decision to drop Lifetime.

---

## v1 build plan

Six phases to soft launch. Phases are roughly sequential; within a phase, order is approximate. Scope per [ADR-0011](decisions/ADR-0011-v1-scope-triage.md); the differentiator spec is [`specs/progression.md`](../specs/progression.md).

### Phase 0 — Foundations

1. **Design tokens → `src/index.css`.** Bind the `specs/design-tokens.md` token set to CSS custom properties (light + dark). Palette is being refined in Open Design — that feeds in here. Centralized JS constants module for non-CSS contexts.
2. **Vitest + first engine tests.** Solver uniqueness invariants, generator difficulty-tier acceptance, and (once written) mastery-counter logic. No progression code lands without coverage.
3. **App shell + navigation.** Three-tab bar (Home / Stats / Settings), screen routing, the iOS-native chrome (nav bar, safe areas).

### Phase 1 — Core game loop

4. **Player profile + persistence layer** (`PRD.md` §2–4, `ARCHITECTURE.md` §4). New `src/lib/profile.ts`: `PlayerStage` type + transitions, `TechniqueMastery` counters, `loadProfile()` / `saveProfile()` against `localStorage`, `recordSolve()`. Includes active-game persistence (refresh shouldn't drop progress).
5. **Home screen** — simplified composition (daily-puzzle anchor, Resume, stage chip). Final composition revisited after the loop works.
6. **Difficulty picker** — single merged entry point from Home (difficulty + grid size). Replaces the prototype's separate New Game sheet + Practice tab.
7. **Solving screen + all 7 states** — wire the React layer to the engine; build fresh / cell-selected / notes / conflict / basic-hint / contradiction-stepper / pause / abandon to the prototype design.
8. **Solved screen** — solve time, technique histogram, mastery chips, share button. No cohort/percentile (no backend in v1).

### Phase 2 — The differentiator

9. **Stage gating** — difficulty picker becomes stage-aware; locked difficulties show the technique to master. Driven by `specs/progression.md` §2.
10. **Tutorial pipeline + onboarding** — 3 curated Newcomer puzzles + 1 per stage-up, JSON fixtures under `src/data/tutorials/`, generator-bypass path, the guided-overlay component (dimmed board, forced moves), and the Welcome → tutorials flow.
11. **Stage-up celebration cards** — four tailored full-screen cards, one per transition. `specs/progression.md` §5.
12. **Mastery chip + mastery moments** — the chip (`learning · familiar · mastered`), the mid-solve chip when a technique crosses mastery, and the post-solve mastery recognition.
13. **Stats surface** — three sections from `PRD.md` §4. Empty-state until ≥5 solves.

### Phase 3 — Retention + viral

14. **Daily puzzle + streak** — deterministic seed per UTC day (ADR-0010), local streak counter. Client-only, no server.
15. **Share artifact** — colored mini-grid (green/yellow/red per cell by hint usage and corrections) + solve time, share-to-clipboard. Tier-0 viral.
16. **Re-entry line on Home** — a warm "Welcome back" line after a 7+ day gap. Local "last opened" check; no dedicated screen.

### Phase 4 — Monetization

17. **StoreKit / RevenueCat setup** — subscription products per ADR-0008. No backend, no account — StoreKit only. Restore-purchase flow.
18. **Paywall** — one component, two trigger surfaces (Hard tap, contradiction-hint tap). Designed in Open Design (`09-paywall-hard-tap`, `10-paywall-contradiction`).
19. **Settings (trimmed)** — theme, sound, haptics, Restore Purchase, Manage Subscription, How to play, About. No account row, no sign-in.

### Phase 5 — Ship

20. **Analytics integration** — lightweight event tracking (puzzles started/completed, hints by technique, share taps, paywall views, IAP taps). Pre-soft-launch requirement.
21. **Capacitor iOS scaffolding** — wrap the web build. StatusBar / SafeArea. ADR-pending: Capacitor vs native shell.
22. **App Store assets** — icon, screenshots (5–8), description, keywords. Built in Open Design.
23. **TestFlight beta** — 10–20 testers. Two-week cycle before soft launch.
24. **Soft launch — NZ + CA** (`docs/market-research.md` §4 Phase 1). Validate retention + IAP conversion before paid acquisition. Targets in `PRD.md` §10.

---

## Later

Intent only. Not committed; included so direction stays visible. Post-v1.

- **English-speaking expansion — US, UK, AU, IE** (market research Phase 2). Only after soft-launch metrics pass.
- **Europe + Japan rollout** (Phase 3). Light localization, regional pricing.
- **Challenge links** — extend `src/engine/urlCodec.ts` to carry the challenger's solve time; recipient sees a "time to beat". Zero-server; a fast-follow to the share artifact.
- **Tier-1 social features** — global daily-puzzle leaderboard, friend system, async challenges, cohort/percentile comparisons. Requires a backend (Postgres + minimal API, ~$50–100/mo at launch scale). This is also when auth / accounts / cross-device sync would land.
- **Daily puzzle archive UI** — searchable archive of past dailies; premium-gated by date window.
- **Tier-2 multiplayer** — head-to-head race, co-op solving. Only if Tier-1 engagement justifies it.
- **Cosmetics / themes** — theme pack as a premium perk.
- **Localization** beyond English — Japanese first, then Eurozone.
- **Web version polish** for organic discovery — shareable links land on the web app, not just iOS.
- **Android launch** — same Capacitor bundle, separate listing.

---

## Open questions

Deliberately unresolved. Resolve through evidence, not committee. When resolved, either become ADRs or get closed by inline answers in `PRD.md` / `specs/progression.md`.

- **App name.** "Tectonic" is generic and Keesing owns its puzzle-app association. Distinctive brand + "Tectonic Puzzles" subtitle for ASO. Tracked in ADR-0006.
- **Lifetime pricing.** $6.99 Lifetime strictly dominates $24.99/yr Annual — the swarm's paywall agent flagged it. Options: reprice Lifetime (~$39.99), hide it on the contradiction paywall, or gate it behind two declines. ADR-0008 needs the answer.
- **Free/premium split.** Current thinking gates Hard/Expert + contradiction hints + technique-mastery stats + archive. Validate in soft launch. ADR-0007.
- **Subscription vs one-time unlock.** Research favors subscription; test both in soft launch. ADR-0008.
- **Tutorial skippability.** Should experienced players be allowed to skip Newcomer entirely? If yes, what's the gate?
- **Mastery thresholds** (`specs/progression.md`). 8 self-applications / 3 puzzles is a guess. Real data may move it.
- **Basic-hint persistence.** Should the basic-hint ring/caption persist until the player acts, or auto-clear after N seconds? (Swarm batch-1 open question.)
- **Mastery chip layout.** The mid-solve chip shifts the keypad down ~58px. Overlay on the toolbar, shrink the technique chip, or accept the crowd? (Swarm batch-3 open question.)
- **Hint usage in solve summary.** Does using hints turn cells yellow (mild penalty) or green (no penalty)? Affects how much players show hints in shares.

---

## Future: migration to GitHub Issues

When a collaborator joins, items in **Now** and the **v1 build plan** move to GitHub Issues with priority + area labels. ADRs stay in `docs/decisions/`. **Later** items can stay here as roadmap intent or migrate with a `roadmap` label. **Open questions** stay until resolved.

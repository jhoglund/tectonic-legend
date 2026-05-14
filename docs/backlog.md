# Backlog

> Single tracker for in-progress, planned, and intent-only work. Solo project — kept lightweight.
> Decisions live in [`decisions/`](decisions/). Open questions are at the bottom.

**Last updated:** 2026-05-14

---

## Now

Active work, in progress or paused awaiting input.

### Tracking scaffold · 2026-05-14 — *complete, in this PR*

Ported the diet-app tracking structure into this repo: PRD / ARCHITECTURE / CONTRIBUTING / CLAUDE.md, `docs/decisions/` with starter ADRs, this backlog, `specs/progression.md` as the differentiator spec, `specs/design-tokens.md`, `specs/design-workflow.md` for the Open Design loop, and `prototypes/DESIGN-BRIEF.md` as the seed brief.

**Next decision blocked on Jonas:**
- App name (ADR-0006). Soft-launch app store listing needs this before submission.
- Free/premium gating (ADR-0007). Affects what code paywalls fence.
- Subscription vs one-time (ADR-0008). Affects RevenueCat / StoreKit setup.

---

## Next

Committed work, not yet started. Order is approximate priority — items 1–4 are the critical path to soft launch.

1. **Vitest + first engine tests** — uniqueness invariants for the solver, difficulty-tier acceptance for the generator, mastery-counter logic once it exists. No progression code lands without coverage. ADR-pending: test strategy.

2. **Player profile + persistence layer** (`PRD.md` §2–4, `ARCHITECTURE.md` §4). New `src/lib/profile.ts`:
   - `PlayerStage` type + transition rules
   - `TechniqueMastery` counters per technique
   - `loadProfile()` / `saveProfile()` against `localStorage`
   - `recordSolve()` ingesting a finished game into mastery counters
   Subsumes "active game persistence" (refresh shouldn't drop progress).

3. **Stage gating in difficulty picker** — replace the open difficulty switcher with stage-aware UI. Locked difficulties show a chip explaining what unlocks them (technique to master). Driven by `specs/progression.md` §2.

4. **Tutorial puzzle pipeline** — 3 curated puzzles for Newcomer + 1 per stage-up. JSON fixtures under `src/data/tutorials/`. Guided-overlay component that dims the rest of the board and walks through the technique. Generator bypass path.

5. **Stats surface** — three sections from `PRD.md` §4. Hard-gated until enough solve data exists (≥5 solves) — show empty-state with "Solve a few more puzzles to see your stats."

6. **Mastery chip on solve** — when a hint fires or the player makes a self-applied move, a small chip surfaces the technique name. Animates in, dwells 2s, fades. Reinforces the learning curve without lecturing.

7. **Onboarding flow** — Welcome → Tutorial 1 → Tutorial 2 → Tutorial 3 → "You're a Beginner". Skippable (gated by ADR — should it be skippable at all? probably not).

8. **Stage-up celebration moments** — single-screen cards for each stage transition. Designed in Open Design first (see `specs/design-workflow.md`).

9. **Shareable solve summary** — colored mini-grid + time, share-to-clipboard. Tier-0 viral (per `docs/market-research.md` §3).

10. **Challenge-link enhancement** — extend `src/engine/urlCodec.ts` to carry challenger's solve time in the URL. Recipient sees "{time to beat}" framing.

11. **Daily puzzle** (client-only). Deterministic seed per UTC day. Local streak counter. Tier-0; no server. Archive >7 days behind premium (driven by ADR-0007).

12. **Analytics integration** — lightweight event tracking (puzzles started/completed, hints used by technique, share taps, paywall views, IAP taps). Pre-soft-launch requirement.

13. **Capacitor iOS scaffolding** — wrap the web build. StatusBar / SafeArea / Sign in with Apple plumbing. ADR-pending: Capacitor vs native shell.

14. **App Store assets** — icon, screenshots (5–8), description, keywords. Build in Open Design alongside the in-app UI.

15. **TestFlight beta** — 10–20 testers from network. Two-week cycle before soft launch.

16. **RevenueCat / StoreKit setup** — subscription products configured per ADR-0008. Restore-purchase flow.

17. **Paywall surfaces** — triggered on locked-difficulty tap, contradiction-hint tap, archive tap. Designed in Open Design first.

18. **Soft launch — NZ + CA** (`docs/market-research.md` §4 Phase 1). Validate retention + IAP conversion before paid acquisition. Targets in `PRD.md` §10.

19. **English-speaking expansion — US, UK, AU, IE** (Phase 2). Only after soft-launch metrics pass.

---

## Later

Intent only. Not committed; included so direction stays visible.

20. **Europe + Japan rollout** (Phase 3). Light localization, regional pricing.
21. **Tier-1 social features** — global daily-puzzle leaderboard, friend system, async challenges. Requires backend (Postgres + minimal API, ~$50–100/mo at launch scale).
22. **Daily puzzle archive UI** — full searchable archive of past dailies; premium-gated by date window.
23. **Tier-2 multiplayer** — head-to-head race, co-op solving. Only if Tier-1 engagement justifies it.
24. **Cosmetics / themes** — theme pack as a premium perk. Low conversion lift; ARPPU play.
25. **Localization** beyond English — Japanese first, then Eurozone.
26. **Web version polish** for organic discovery — shareable links land on the web app, not just iOS.
27. **Android launch** — same Capacitor bundle, separate listing.

---

## Open questions

Deliberately unresolved. Resolve through evidence, not committee. When resolved, either become ADRs or get closed by inline answers in `PRD.md` / `specs/progression.md`.

- **App name.** "Tectonic" is generic and Keesing owns its puzzle-app association. Alternatives to evaluate: distinctive brand + "Tectonic Puzzles" subtitle for ASO. Tracked in ADR-0006.
- **Free/premium split.** Current thinking gates Hard/Expert + contradiction hints + technique-mastery stats + archive. Validate in soft launch. ADR-0007.
- **Subscription vs one-time unlock.** Research favors subscription; test both in soft launch. ADR-0008.
- **Multiplayer scope for v1.** ADR-0009 leans toward zero-multiplayer (Tier-0 viral only) for v1. Confirm before lock-in.
- **Daily puzzle system.** Client-only deterministic seed vs server-issued puzzle. Server gives editorial control but adds infra. ADR-0010.
- **Tutorial skippability.** Should experienced players be allowed to skip Newcomer entirely? If yes, what's the gate?
- **Mastery thresholds** (specs/progression.md). 8 self-applications / 3 puzzles is a guess. Real data may move it.
- **Hint usage in solve summary.** Does using hints turn cells yellow (mild penalty) or green (no penalty)? Affects how much players show hints in shares.

---

## Future: migration to GitHub Issues

When a collaborator joins, items in **Now** and **Next** move to GitHub Issues with priority + area labels. ADRs stay in `docs/decisions/`. **Later** items can stay here as roadmap intent or migrate with a `roadmap` label. **Open questions** stay until resolved.

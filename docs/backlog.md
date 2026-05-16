# Backlog

> Single tracker for in-progress, planned, and intent-only work. Solo project — kept lightweight.
> Decisions live in [`decisions/`](decisions/). Open questions are at the bottom.

**Last updated:** 2026-05-15

---

## Now

Active work, in progress or paused awaiting input.

### v1 implementation · 2026-05-15 — *Phases 0–1 done, Phase 2 next*

The iOS-native prototype (variant 01 of the 2026-05-14 swarm) is the design target. Scope was triaged against the PRD on 2026-05-15 — see [ADR-0011](decisions/ADR-0011-v1-scope-triage.md). The v1 build plan below is the result.

**Done:** Phase 0 (design tokens, Vitest + 13 engine tests, 3-tab app shell) and Phase 1 (profile + progression layer with 26 tests; Home landing; difficulty picker; the iOS-native Solving screen + states; Solved screen). 39 tests, lint + build green.

**Deferred slices** (carried forward):
- Active-game persistence (refresh-safe in-progress puzzle) — needs `GameState` serialization.
- Mid-solve mastery-crossing moment — self-applied detection now feeds real data (`classifyMove` + useGame tracking, 2026-05-15), so `mastered` is reachable; the live "you just mastered X" beat during a solve is still not built.
- Self-applied credit covers naked / hidden singles only — the engine never emits `forced-move` or `pair-elimination`, so the Master gate (forced-move mastery) stays unreachable until the hint engine grows those techniques.

**Phase 2 is next.**

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

### Solving screen refinements

Added 2026-05-15 from Jonas's review of the rebuilt Solving screen. v1 scope; slot alongside Phase 2. **All four done 2026-05-15** (commits `d2e8044`, `4efcc56`).

- **S1. ✅ Clearer clue vs. player-entered distinction.** Player entries now render in `--text-cell-player` (brand) at medium weight; clues stay `--cell-text` bold. Applied in `Cell.tsx`; design-tokens §2a updated.
- **S2. ✅ Undo / Redo replacing the keypad delete key.** `useGame` holds full `past`/`future` GameState stacks with a `commit()` helper. The keypad's delete key is gone — Undo + Redo keys in its place; Cmd/Ctrl+Z (+Shift) on keyboard. The toolbar's "Clear" stays.
- **S3. ✅ Explicit validation — no live red errors.** `Board` takes a `showErrors` prop (default off); a "Validate" toolbar control surfaces wrong entries in red for 6 s on demand, then clears.
- **S4. ✅ Restored the multi-hint menu.** New `HintMenu` bottom sheet (Logic hint / Show candidates / Reveal cell) opened by the toolbar Hint button. `check` is omitted — validation is its own control (S3), resolving the noted overlap.

### Phase 2 — The differentiator

9. **✅ Stage gating** — difficulty picker is stage-aware; locked difficulties show the requirement to unlock them. Done 2026-05-15 (`b290627`). **Locking off permanently** by decision ([ADR-0012](decisions/ADR-0012-difficulty-is-player-choice.md)) — `STAGE_GATING_ENABLED = false`; every difficulty is playable, stage is a progress indicator not a gate. The gating code is kept dormant behind the flag for reference.
10. **✅ Tutorial pipeline + onboarding** — 3 curated Newcomer tutorials (typed fixtures in `src/data/tutorials/`, generator-validated boards), `TutorialScreen` guided play, `WelcomeScreen`, and the `TutorialFlow` funnel routing Newcomers from stage 0 to Beginner. A Skip control (Welcome + each tutorial) jumps straight to Beginner. Done 2026-05-15. **Needs a polish pass before soft launch** — tutorial content, pacing, and visual treatment are first-draft. Stage-up tutorials still unbuilt.
11. **✅ Stage-up celebration cards** — `StageUpCard`, four full-screen cards (one per transition), shown on Home when `profile.stage` outruns `profile.celebratedStage`. Done 2026-05-15. The Open Design pass was skipped by decision; stage-up tutorial puzzles remain unbuilt (dismissal returns to Home).
12. **✅ Mastery chip + mastery moments** — `MasteryChip` (`learning · familiar · mastered`), surfaced in Stats and on the Solved screen. Done 2026-05-15. The mid-solve crossing moment is deferred — it depends on self-applied detection (deferred slice below); until that lands, `mastered` is unreachable.
13. **✅ Stats surface** — solve performance / technique mastery / streaks, empty-state until ≥5 solves. Done 2026-05-15. Percentile band and contradiction-chain record omitted (no backend / not tracked); the premium gate on technique mastery lands with the Phase 4 paywall.

> **Phase 3–5 autonomous run, 2026-05-16.** Phase 3 done; Capacitor scaffolded; Phase 4 Settings done + paywall built (unwired). Two background agents produced `docs/soft-launch-plan.md` and `docs/app-store-launch.md`. Decisions taken and what's still on Jonas: see [`docs/handover-2026-05-16.md`](handover-2026-05-16.md).

### Phase 3 — Retention + viral

14. **✅ Daily puzzle + streak** — seeded generator (mulberry32) + `src/lib/daily.ts` (UTC-day seed, weekday→difficulty); Home daily card + streak line. Client-only (ADR-0010). Done 2026-05-16.
15. **✅ Share artifact** — `src/lib/shareArtifact.ts`: a spoiler-free emoji-grid text block (clue / unaided / hinted per cell) + time. v1 is text not an image — deliberate (see handover). Native share sheet on iOS. Done 2026-05-16.
16. **✅ Re-entry line on Home** — `src/lib/lastSeen.ts`, a warm line after a 7+ day gap. Done 2026-05-16.

### Phase 4 — Monetization

17. **StoreKit / RevenueCat setup** — NOT started. Blocked on Apple Developer enrolment + App Store Connect products + the resolved free/premium split. See handover.
17a. **◑ Subscription offers — vouchers & temporary discounts** (added 2026-05-16). Grant comped access and run time-boxed discounts.
    - **✅ Local vouchers** — `src/lib/vouchers.ts` + redeem flow in Settings: self-verifying `TEC-XXXX-XXXX` codes carrying a lifetime or N-day grant, validated offline. Premium entitlement on the profile (`isPremium`, timed-grant expiry). No Apple account, no backend. Done 2026-05-16 — see [`docs/vouchers.md`](vouchers.md). The timed (N-day) code is the local stand-in for a temporary offer.
    - **Apple-native (deferred, needs item 17).** App Store **Offer Codes** for store-side vouchers; **Introductory & Promotional Offers** for real price discounts (free trial, win-back). App Store Connect is the console — no custom admin UI. RevenueCat, if adopted (ADR-0008), layers its own offer/entitlement tooling on top.
    - Lettered (17a) to avoid renumbering 18–24.
18. **◑ Paywall** — built and **wired** 2026-05-16. `PaywallProvider` mounts it app-wide; `openPaywall(trigger)` records the trigger for the funnel. Two premium gates live (the two fences from `soft-launch-plan.md` §3 that exist today): contradiction-chain hints (`useGame`) and the technique-mastery histogram (`StatsScreen`). Verified end-to-end: locked stat → paywall → voucher redeem → premium → unlocked. **Remaining:** the live StoreKit purchase (Continue currently funnels to voucher redeem) needs item 17; the ads / archive / themes / 3-a-day-hint-limit gates need those features built first.
19. **✅ Settings (trimmed)** — How to Play + About; replaces the stub the App Store audit flagged. Theme/sound/haptics deferred (features don't exist yet). Done 2026-05-16.

### Phase 5 — Ship

20. **◑ Analytics integration** — Mimir wired (2026-05-15): SDK injected by a `vite.config` plugin when `VITE_MIMIR_*` is set; `src/lib/analytics.ts` emits semantic events; verified dev (event → `/_m/api/ingest` → 202). **Remaining:** paywall/IAP events (Phase 4); prod analytics is dormant until Mimir is publicly hosted and the repo variables/secret are set.
21. **✅ Capacitor iOS scaffolding** — `@capacitor/*` 8, `capacitor.config.ts`, `ios/` Xcode project (SPM-based), conditional `base`, status-bar init. Done 2026-05-16. Build to device: `npm run sync:ios` then Xcode.
22. **App Store assets** — icon, screenshots, description, keywords. Prep + drafts in `docs/app-store-launch.md`; assets themselves not built.
23. **TestFlight beta** — 10–20 testers. Pipeline documented in `docs/app-store-launch.md`; Apple-account-gated.
24. **Soft launch — NZ + CA (+ IE recommended)** (`docs/soft-launch-plan.md`). Validate retention + IAP conversion before paid acquisition. Targets in `PRD.md` §10.

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
- **Tutorial skippability.** ✅ Resolved 2026-05-15 — anyone can skip, no gate. A Skip control on the Welcome screen and each tutorial jumps straight to Beginner.
- **A difficulty tier above Expert ("Legend"?).** Puzzle difficulty was bumped up a notch 2026-05-15 (lower clue density per tier). Expert already carves to the unique-solution floor — clue density cannot go lower — so a genuinely harder tier needs a *new technique gate* (e.g. requiring multi-step contradiction chains of depth ≥ N), not just fewer clues. Decide whether to add it, and what to call it.
- **Mastery thresholds** (`specs/progression.md`). 8 self-applications / 3 puzzles is a guess. Real data may move it.
- **Basic-hint persistence.** Should the basic-hint ring/caption persist until the player acts, or auto-clear after N seconds? (Swarm batch-1 open question.)
- **Mastery chip layout.** The mid-solve chip shifts the keypad down ~58px. Overlay on the toolbar, shrink the technique chip, or accept the crowd? (Swarm batch-3 open question.)
- **Hint usage in solve summary.** Does using hints turn cells yellow (mild penalty) or green (no penalty)? Affects how much players show hints in shares.

---

## Future: migration to GitHub Issues

When a collaborator joins, items in **Now** and the **v1 build plan** move to GitHub Issues with priority + area labels. ADRs stay in `docs/decisions/`. **Later** items can stay here as roadmap intent or migrate with a `roadmap` label. **Open questions** stay until resolved.

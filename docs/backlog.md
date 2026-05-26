# Backlog

> Single tracker for in-progress, planned, and intent-only work. Solo project — kept lightweight.
> Decisions live in [`decisions/`](decisions/). Open questions are at the bottom.

**Last updated:** 2026-05-26

---

## Now

Active work, in progress or paused awaiting input.

### v1.0 submission sprint · target June 2

**Decisions resolved:**
- ✅ **App name:** Tectonic Legend (ADR-0006, accepted 2026-05-20). Repo renamed to `tectonic-legend`.
- ✅ **v1.0 ships free — no IAP, no ads.** Everything unlocked. Validates retention before monetization. Paywall + StoreKit land in v1.1.
- ✅ **Apple Developer enrollment:** done. TestFlight working.
- ✅ **Capacitor iOS:** scaffolded + building to device.

**Phases 0–4 substantially complete.** 84 tests green. What remains is Phase 5 — ship.

**Deferred slices** (carried forward to v1.1+):
- Mid-solve mastery-crossing moment — self-applied detection feeds real data, but the live "you just mastered X" beat is not built.
- Self-applied credit covers naked/hidden singles only — forced-move and pair-elimination self-credit deferred.

---

### v1.0 submission — one-week sprint

Seven days to App Store submission. The game is feature-complete; this sprint is about the remaining submission blockers.

**What bc6a291 (2026-05-25) shipped:**
- ✅ Active-game persistence (`unresolvedPuzzles.ts` — resume in-progress puzzles)
- ✅ Screenshot capture rig (`figmaExactScreens.tsx` — all 7 screens at 390×844)
- ✅ ExportOptions.plist + code signing configured (team `S4UF72BD94`, automatic signing)
- ✅ OAuth deep links (`tectonic://auth/callback` in AppDelegate + Info.plist)
- ✅ Material surfaces component library + glass-morphism floating nav
- ✅ Full UI polish pass (Home, Solving, Solved, Stats, Tutorial, Welcome, TabBar)
- ✅ Hint engine polish (richer reasoning data: regions, steps, contradiction chains)
- ✅ Design tokens finalized (glass elevation, typography scale, cage fills, motion)
- ✅ Prototypes refined into shipped features (bottom nav FAB, typefaces)

#### Day 1 (Mon May 26) — Decisions + prep

- [x] Confirm app name: **Tectonic Legend**
- [x] Confirm v1.0 monetization: **free, no IAP** (everything unlocked)
- [ ] Confirm bundle ID: `com.jhoglund.tectoniclegend` (or keep `com.jhoglund.tectonic`) — must decide before creating App Store Connect record
- [ ] Acquire domain (e.g. `tectoniclegend.app`) for privacy policy + support URLs

#### Day 2 (Tue May 27) — Code: v1.0 submission readiness

- [ ] Disable/hide paywall triggers for v1.0 (everything unlocked, no premium gates)
- [ ] **Wire Supabase for production.** Currently dev-only; needs a production project + env vars set before launch so accounts/sync work on real devices. Apply `supabase/schema.sql`, enable Anonymous sign-ins + Apple/Google providers, configure SMTP. Without this, auth degrades to local-only silently (ADR-0017) — functional but no cross-device sync.
- [ ] Replace stock Vite README.md (audit item R7)
- [ ] Add `PrivacyInfo.xcprivacy` with empty `NSPrivacyCollectedDataTypes` (Mimir OFF)
- [ ] Set version to `1.0.0`, build number `1`

#### Day 3 (Wed May 28) — App icon + screenshots

- [ ] Design app icon (1024×1024 PNG, no alpha, no rounded corners) — Open Design
- [ ] Generate all icon sizes via `@capacitor/assets`
- [ ] Capture 5–6 screenshots at 1320×2868 (iPhone 6.9") — leverage `figmaExactScreens.tsx` rig or real-device capture:
  1. Hero — Home with daily puzzle + stage chip ("Learn the logic, not the levels")
  2. Teaching hint — Solving screen + hint overlay with technique label
  3. The journey — Stage-up card or progression visualizer
  4. Contradiction stepper — step-by-step walkthrough
  5. Mastery & stats — Stats screen with technique mastery chips + progress bars
  6. Daily + share — Daily puzzle card + share artifact
- [ ] Add caption text to screenshots (Open Design or screenshot generator)

#### Day 4 (Thu May 29) — Device testing + web pages

- [ ] `npm run sync:ios` → Xcode → real device testing:
  - Full flow: launch → tutorial (+ skip) → solve → daily puzzle → resume → share → backgrounding → offline
  - Verify unresolved-puzzle resume works (new feature)
  - StatusBar / SafeArea / splash screen look native
  - No white-screen on asset loading (verify `base: '/'` in Capacitor build)
- [ ] Publish privacy policy at `<domain>/privacy` — honest, minimal ("Data Not Collected", no analytics in v1.0)
- [ ] Publish support page at `<domain>/support` — How to Play, FAQ, contact email
- [ ] Tutorial content review — pacing and visual treatment (item 10, flagged as first-draft)

#### Day 5 (Fri May 30) — App Store Connect + TestFlight

- [ ] Create App Store Connect record:
  - App name: Tectonic Legend
  - Subtitle: `Tectonic & Suguru Puzzles` (25 chars)
  - Primary category: Games → Puzzle
  - Secondary category: Games → Board
  - Bundle ID: (per Day 1 decision)
- [ ] Fill metadata:
  - Description (draft in `docs/app-store-launch.md` §2.3)
  - Keywords: `tectonic,suguru,logic puzzle,sudoku alternative,number puzzle,brain game,daily puzzle,cage,deduction` (96 chars)
  - Promotional text (draft in §2.2)
- [ ] Upload icon + screenshots
- [ ] Complete age rating questionnaire → 4+
- [ ] Complete App Privacy questionnaire → "Data Not Collected" (all categories)
- [ ] Archive in Xcode 26 → upload → distribute to internal TestFlight testers (5–10)

#### Day 6 (Sat May 31) — Beta feedback + fixes

- [ ] Fix any crash/UX issues from TestFlight
- [ ] Final smoke test on device
- [ ] Write App Review Notes (draft in `docs/app-store-launch.md` §5):
  > No account/login — all progress stored locally. No demo credentials needed.
  > Launch → tutorial (or Skip) → solve any puzzle. Hints via toolbar button.
  > Works fully offline. No IAP in v1.0.

#### Day 7 (Sun June 1) — Submit

- [ ] Set availability: NZ + CA (+ IE if desired)
- [ ] Attach build to v1.0 release
- [ ] Submit for review (typically 24–48 hours)

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

**Deferred to v1.1.** v1.0 ships free with everything unlocked — no IAP, no ads. Decision: 2026-05-26.

17. **StoreKit / RevenueCat setup** — **v1.1.** Two SKUs: $3.99/mo + $19.99/yr (per `docs/soft-launch-plan.md` §2). Lifetime SKU dropped. Apple Developer enrollment done; wire when soft-launch retention data justifies monetization.
17a. **◑ Subscription offers — vouchers & temporary discounts** (added 2026-05-16). Grant comped access and run time-boxed discounts.
    - **✅ Local vouchers** — `src/lib/vouchers.ts` + redeem flow in Settings: self-verifying `TEC-XXXX-XXXX` codes carrying a lifetime or N-day grant, validated offline. Premium entitlement on the profile (`isPremium`, timed-grant expiry). No Apple account, no backend. Done 2026-05-16 — see [`docs/vouchers.md`](vouchers.md). The timed (N-day) code is the local stand-in for a temporary offer.
    - **Apple-native (deferred to v1.1, needs item 17).** App Store **Offer Codes** for store-side vouchers; **Introductory & Promotional Offers** for real price discounts (free trial, win-back).
    - Lettered (17a) to avoid renumbering 18–24.
18. **◑ Paywall** — built and **wired** 2026-05-16. `PaywallProvider` mounts it app-wide; `openPaywall(trigger)` records the trigger for the funnel. Two premium gates live: contradiction-chain hints (`useGame`) and the technique-mastery histogram (`StatsScreen`). Verified end-to-end: locked stat → paywall → voucher redeem → premium → unlocked. **For v1.0 submission:** disable all premium gates so everything is free (no paywall visible to reviewers). **For v1.1:** wire StoreKit purchase, re-enable gates, add ad SDK + interstitials.
19. **✅ Settings (trimmed)** — How to Play + About; replaces the stub the App Store audit flagged. Theme/sound/haptics deferred (features don't exist yet). Done 2026-05-16.

### Phase 5 — Ship

20. **◑ Analytics integration** — Mimir wired (2026-05-15): SDK injected by a `vite.config` plugin when `VITE_MIMIR_*` is set; `src/lib/analytics.ts` emits semantic events; verified dev (event → `/_m/api/ingest` → 202). **v1.0 ships with Mimir OFF** (simplest privacy posture: "Data Not Collected"). Prod analytics deferred to v1.1.
21. **✅ Capacitor iOS scaffolding** — `@capacitor/*` 8, `capacitor.config.ts`, `ios/` Xcode project (SPM-based), conditional `base`, status-bar init. Done 2026-05-16. ExportOptions.plist + signing configured 2026-05-25. Build to device: `npm run sync:ios` then Xcode.
21a. **✅ Active-game persistence** — `src/lib/unresolvedPuzzles.ts`: up to 20 in-progress puzzles in localStorage, resumable from Home. `UnresolvedPuzzlesScreen` for browsing. Done 2026-05-25 (`bc6a291`). Previously listed as a deferred slice; now shipped.
21b. **✅ Screenshot capture rig** — `src/figmaExactScreens.tsx`: all 7 app screens at 390×844 with realistic game state. Available for App Store screenshot generation. Done 2026-05-25.
22. **◑ App Store assets** — icon, screenshots, description, keywords. Metadata drafts in `docs/app-store-launch.md`; screenshot rig ready (21b). **Remaining:** design the 1024² app icon, capture final screenshots at 1320×2868, add marketing captions.
23. **TestFlight beta** — 5–10 internal testers (no review required). Apple Developer enrolled; TestFlight pipeline working.
24. **Soft launch — NZ + CA (+ IE recommended)** (`docs/soft-launch-plan.md`). v1.0 validates retention only (no IAP). Targets in `PRD.md` §10.

### v1.1 — Monetization (target: 2–3 weeks post-submission)

Ship once soft-launch retention data is in (Day 1 > 40%, Day 7 > 20% per PRD §10). This is the revenue update.

25. **StoreKit integration** — two auto-renewable SKUs ($3.99/mo, $19.99/yr) in one subscription group. Restore Purchases + Manage Subscription in Settings. Sign Paid Applications Agreement + banking/tax in App Store Connect first.
26. **Re-enable premium gates** — contradiction-chain hints, advanced-hint daily limit (3/day free), technique-mastery dashboard, daily archive (>7 days). Wire the existing `PaywallProvider` to StoreKit purchase flow.
27. **Ad SDK** — tasteful interstitials between puzzles (never mid-solve). The primary conversion driver for ad-removal.
28. **Paywall polish** — two-option layout (monthly + annual), exact price/recurrence/auto-renew disclosure, link to Apple subscription management. Compliant per Guideline 3.1.1.
29. **Analytics production** — host Mimir publicly, set `VITE_MIMIR_*` repo variables. Update App Privacy labels to declare Product Interaction (analytics). Update `PrivacyInfo.xcprivacy`.

### Accounts — Supabase backend

Decided 2026-05-16 ([ADR-0013](decisions/ADR-0013-supabase-as-the-backend.md)) — reverses the local-only v1. Player accounts on Supabase (managed Postgres + Auth + RLS, free tier in dev) so progress survives uninstall and syncs across devices. Full design + data model + schema: [`docs/accounts-plan.md`](accounts-plan.md). **Recommended to land as the first post-soft-launch feature** (it doesn't gate the launch's retention signal; the sync model migrates launched local-only users cleanly). A1 must come before A2–A3.

- **A1. Supabase foundation** — *done.* `@supabase/supabase-js`, the env-driven `src/lib/supabase.ts` client, and `supabase/schema.sql` (the `profiles` table + RLS). The project exists and `.env.local` is wired. *Still on Jonas:* apply `supabase/schema.sql` in the SQL editor — needed before A3 sync works.
- **A2. Client auth** — *done.* `AuthProvider` + `useAuth` over Supabase Auth, the `AuthSheet` bottom sheet (sign in / create account), and the Account section in Settings with **Log out** (the original ask). Password reset is deferred — it needs a recovery-link landing UI; tracked as a follow-up.
- **A3. Profile sync** — *done.* `PlayerProfile` gained an `updatedAt`; `ProfileProvider` pulls + reconciles on sign-in, debounced-upserts on change, and adopts the local profile on first sign-in. Last-write-wins by `updatedAt` (`src/lib/profileSync.ts`). Settings shows the sync status. *End-to-end verification pending a live sign-in* — needs a confirmed Supabase user.
- **A4. Privacy rework** — data now leaves the device: update `docs/app-store-launch.md`, the privacy manifest, and the App Store privacy labels. A Privacy Policy URL becomes mandatory.
- **A5. Sign in with Apple** — fast-follow (Supabase OAuth provider) once Apple Developer enrolment lands.

---

## Improvements & follow-ups

Queued 2026-05-17. Concrete improvement tasks — not yet scheduled into a phase.

- **I1. Improve the share result card.** Make the mini-grid look better, add some stats, and give the card a title or stronger button copy. Builds on the share artifact (item 15), a spoiler-free text emoji-grid today.
- **I2. ◑ Improve the Technique card.** Spec'd 2026-05-20 — [ADR-0018](decisions/ADR-0018-legend-stage-and-mastery-depth.md) (depth score, four chip states, progress bar) + [ADR-0019](decisions/ADR-0019-legend-tiers-and-leaderboard.md) (Legend rungs + daily-puzzle leaderboard). Implementation deferred to a fresh arc; spec layer is in place.
- **I3. Validate button — success feedback.** When the board is fully valid, the Validate button turns green, then slowly fades back to gray.
- **I4. Multi-provider login.** Extend the auth screen to support Sign in with Apple, Google, and possibly more — Supabase Auth provides these as OAuth providers. Expands A5 (Apple-only).
- **I5. ◑ Developer debug UI.** A dev-tools surface in the Settings screen, gated behind role management. *First increment done 2026-05-18* ([ADR-0014](decisions/ADR-0014-developer-role-and-debug-panel.md)) — a `role` on the profile, the 7-tap Version-row unlock, and a DEVELOPER panel (`DevTools`) with stage / technique-mastery / premium setters, jump-to-flow buttons (onboarding, stage-up card, paywall, sign-in), and reset. Also an account-backed developer allowlist (`DEVELOPER_EMAILS`) — a known developer email is elevated to the developer role automatically on sign-in, on every device. **Next:** deeper direct screen-jumps (Solving / Solved need a live puzzle); harden the unlock before public launch.
- **I6. Improve the start screen.** A richer Home — possibly a mini grid and more.
- **I7. Floating pill nav bar.** Replace the global bottom tab bar with an iOS-native floating button bar — rounded corners (pill).
- **I8. Account page.** Add an avatar to Settings; possibly transform the Settings page into an Account page with subscription management, history, and settings. Relates to Settings (item 19) and the Accounts work.
- **I9. Deductive hint techniques.** Give the hint engine a deductive middle tier so logic hints explain a deduction instead of narrating a backtracking search. *Done 2026-05-18* — [`specs/solving-techniques.md`](../specs/solving-techniques.md) catalogues the tiers; `src/engine/hints.ts` now runs cage domination (`findDominationHint`, the `forced-move` technique) and a naked/hidden-subset + locked-candidate elimination loop (`findDeductiveHint`, the `pair-elimination` technique) before the `findContradictionHint` fallback. Probe over 28 hard/expert solves: contradiction trials dropped to 6 of 567 hints. The generator now also grades difficulty by required technique (`gradeDifficulty`) instead of backtrack count, so a label means "needs this technique" — `progression.md` §2. **Optional follow-ups:** self-credit `pair-elimination` in `classifyMove`; flip-flop / parity-chain hints (spec §8); a clue-density pass if 8×8 medium generation (~6 s) needs trimming.
- **I10. ✅ Auth sheet bottom clearance.** Done 2026-05-25. The account overlay now stacks above the floating bottom tab bar and constrains its height to the viewport, so the lower controls are not covered on iPhone.

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

- ~~**App name.**~~ ✅ Resolved 2026-05-20 — **Tectonic Legend** (ADR-0006). Repo renamed to `tectonic-legend`.
- ~~**Lifetime pricing.**~~ ✅ Resolved 2026-05-26 — **dropped.** v1.0 ships free; v1.1 ships $3.99/mo + $19.99/yr only, no lifetime SKU (per `docs/soft-launch-plan.md` §2).
- ~~**Free/premium split.**~~ ✅ Resolved 2026-05-26 for v1.0 — **everything unlocked.** v1.0 is free with no gates. v1.1 re-derives the split per `docs/soft-launch-plan.md` §3 (ad-free + contradiction hints + unlimited advanced hints + mastery dashboard + daily archive + themes; no difficulty gate per ADR-0012).
- ~~**Subscription vs one-time unlock.**~~ ✅ Resolved 2026-05-26 — **subscription only** at soft launch ($3.99/mo + $19.99/yr). One-time unlock is a Phase 2 contingency test if IAP conversion < 2%.
- ~~**Tutorial skippability.**~~ ✅ Resolved 2026-05-15 — anyone can skip, no gate.
- ~~**A difficulty tier above Expert ("Legend"?).**~~ ✅ Resolved 2026-05-20 — *pure status, not a difficulty tier*. Stage 5 Legend (ADR-0018) plus four Legend rungs and the daily-puzzle leaderboard (ADR-0019).
- **Mastery thresholds** (`specs/progression.md`). Spec'd in ADR-0018 as a depth score with the existing 8 / 3 boundary landing at depth ≈ 60 (mastered). The first-draft `SELF_TARGET = 20` / `PUZZLES_TARGET = 12` and the rung thresholds (Adept 93/12 … Mythic 99/25) are the calibration question soft-launch data resolves.
- **Basic-hint persistence.** Should the basic-hint ring/caption persist until the player acts, or auto-clear after N seconds? (Swarm batch-1 open question.)
- **Mastery chip layout.** The mid-solve chip shifts the keypad down ~58px. Overlay on the toolbar, shrink the technique chip, or accept the crowd? (Swarm batch-3 open question.)
- **Hint usage in solve summary.** Does using hints turn cells yellow (mild penalty) or green (no penalty)? Affects how much players show hints in shares.
- **Bundle ID.** `com.jhoglund.tectonic` (current) vs `com.jhoglund.tectoniclegend`. Must decide before creating the App Store Connect record — permanent once set.

---

## Future: migration to GitHub Issues

When a collaborator joins, items in **Now** and the **v1 build plan** move to GitHub Issues with priority + area labels. ADRs stay in `docs/decisions/`. **Later** items can stay here as roadmap intent or migrate with a `roadmap` label. **Open questions** stay until resolved.

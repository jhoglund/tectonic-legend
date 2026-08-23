# Backlog

> Single tracker for in-progress, planned, and intent-only work. Solo project — kept lightweight.
> Decisions live in [`decisions/`](decisions/). Open questions are at the bottom.

**Last updated:** 2026-08-23

---

## Now

Active work, in progress or paused awaiting input.

### Status · 2026-08-23 · *v1 feature-complete; parked on Phase 5 ship prep*

Nothing is in flight. The last commit landed 2026-07-04, `main` is clean, and every
branch is merged. Resuming cold, read [`docs/backend-sync.md`](backend-sync.md) first
if the question touches the backend.

**Built and shipped:** Phases 0 through 4. The engine, the progression layer, the
tutorial pipeline, stage-up cards, the Stats surface, the daily puzzle, the share
artifact, the Capacitor iOS shell, trimmed Settings, and the paywall wired to two live
gates with voucher redemption. 85 tests pass; `typecheck` and `build` are clean. Web is
live at https://jhoglund.github.io/tectonic-legend/ and redeploys on push to `main`.
**iOS build 7 is on TestFlight**, verified syncing on Jonas's phone.

**The last arc was infrastructure, not product.** Between June and July the
`@hoglund/config` house stack landed, the `@hoglund` deps were repointed to the
hybris-fed org (PLT-45), vite was pinned to clear a dev-server advisory, and profile
sync moved off Supabase onto a Cloudflare Worker + KV
([ADR-0020](decisions/ADR-0020-sync-off-supabase-cloudflare-worker.md)). Supabase is
gone entirely: project deleted, one-way, nothing to fall back to.

**Still deferred:**
- **Mid-solve mastery-crossing moment.** The live "you just mastered X" beat during a
  solve is still not built. Everything it depends on now exists.
- **Stage-up tutorial puzzles.** The celebration cards ship; dismissal returns to Home
  with no curated puzzle behind it.
- **Tutorial polish pass** before soft launch. Content, pacing and visual treatment
  are all first-draft.

**Lint is green again** (fixed 2026-08-23). It had rotted to 59 errors after the
stricter `@hoglund/config` biome rules landed on 2026-06-05 against code written before
them. `prototypes/` is now out of lint scope (throwaway design captures, not product
code), `noNonNullAssertion` is off (the engine is built on `Map.get()` over keys
guaranteed by construction, where `?.` would silently swallow an invariant break), and
the rest were fixed or suppressed with a written reason. CI now runs `lint` and `test`
before `build`, so it cannot rot silently again.

**Decisions still blocked on Jonas:**
- **Apple Developer enrolment.** Gates StoreKit (item 17), TestFlight at scale (23)
  and the soft launch (24). The rest of Phase 5 queues behind it.
- **Lifetime pricing** (ADR-0008). $6.99 Lifetime strictly dominates $24.99/yr
  Annual. Needs a resolved price or a decision to drop Lifetime.
- **Free/premium split** (ADR-0007), still `Proposed`. The App Store description
  cannot be finalised until the shipped gating is known (Guideline 2.3).
- **Brand domains** (item 25), decided 2026-05-27, never purchased.
- **Mimir on or off in production.** The privacy labels branch on the answer.

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
12. **✅ Mastery chip + mastery moments** — `MasteryChip` (`learning · familiar · mastered`), surfaced in Stats and on the Solved screen. Done 2026-05-15. The mid-solve crossing moment is still deferred, but its dependency is met: `classifyMove` credits all four techniques (naked / hidden single, domination, pair elimination), so `mastered` is reachable and the Master gate is live.
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
25. **Register brand domains** — *decided 2026-05-27, not yet purchased.* Secure **`tectoniclegend.com`** + **`tectoniclegend.app`** — both confirmed available (RDAP + whois), ~$10–11/yr and ~$14/yr at-cost. Registrar: **Cloudflare Registrar** (true at-cost, requires DNS on Cloudflare) or Porkbun / Namecheap; the Hey Ginger project used GoDaddy. **`.game` deliberately skipped** — premium TLD at ~$300/yr *each* (`tectoniclegend.game`, `tectonic.game`); `.games` (plural, ~$10–30/yr) is the cheap fallback if a "game" TLD is ever wanted. Note: `.app` is on the HSTS preload list (HTTPS-only — fine for the current Pages/TLS deploy). Jonas does the checkout (no automated purchases). Relates to ADR-0006 (brand) and the Privacy-Policy URL that A4 / App Store submission will require.

### Backend: profile sync (Cloudflare Worker + KV)

Shipped 2026-07-04 ([ADR-0020](decisions/ADR-0020-sync-off-supabase-cloudflare-worker.md)),
replacing the Supabase accounts project ADR-0013 set up. Live state and the pickup
runbook: [`docs/backend-sync.md`](backend-sync.md).

**What exists.** A Worker (`tectonic-sync`) serving `GET` / `PUT /profile` over a single
KV key, guarded by one bearer secret. Identity is stubbed to a fixed local user, so
there is no sign-in. The client is env-gated on `VITE_SYNC_URL` + `VITE_SYNC_SECRET` and
runs fully local-only, gracefully, when either is unset. Verified working on iOS build 7.

**Deliberately not built**, and only worth building if Tectonic goes multi-user: real
auth, per-user isolation, sign-in UI. ADR-0020 records the trade it accepted (a
bundle-inspectable bearer secret, tolerable only while single-user) and would itself
need superseding.

**The Supabase accounts plan (old items A1–A5) is dead.** A1–A3 shipped and were then
removed wholesale; A5 (Sign in with Apple) is moot without auth. Only the privacy
obligation survived the backend change:

- **B1. Privacy rework.** *Partly done, still blocking submission.* Profile data leaves
  the device, so the privacy posture is no longer "nothing leaves the device".
  [`docs/app-store-launch.md`](app-store-launch.md) §0–§2 was corrected on 2026-08-23.
  **Still open:** write `ios/App/App/PrivacyInfo.xcprivacy` (it does not exist yet),
  answer the App Store Connect privacy questionnaire to match, and publish a Privacy
  Policy URL, which needs a brand domain (item 25) first.

---

## Improvements & follow-ups

Queued 2026-05-17. Concrete improvement tasks — not yet scheduled into a phase.

- **I1. Improve the share result card.** Make the mini-grid look better, add some stats, and give the card a title or stronger button copy. Builds on the share artifact (item 15), a spoiler-free text emoji-grid today.
- **I2. ◑ Improve the Technique card.** Spec'd 2026-05-20 — [ADR-0018](decisions/ADR-0018-legend-stage-and-mastery-depth.md) (depth score, four chip states, progress bar) + [ADR-0019](decisions/ADR-0019-legend-tiers-and-leaderboard.md) (Legend rungs + daily-puzzle leaderboard). Implementation deferred to a fresh arc; spec layer is in place.
- **I3. Validate button — success feedback.** When the board is fully valid, the Validate button turns green, then slowly fades back to gray.
- **I4. ~~Multi-provider login.~~** *Dropped 2026-07-04 by [ADR-0020](decisions/ADR-0020-sync-off-supabase-cloudflare-worker.md).* There is no auth screen any more: identity is stubbed to one fixed local user and the Supabase OAuth providers this item assumed are gone. Revisit only if Tectonic goes multi-user, at which point real auth returns as its own project.
- **I5. ◑ Developer debug UI.** A dev-tools surface in the Settings screen, gated behind role management. *First increment done 2026-05-18* ([ADR-0014](decisions/ADR-0014-developer-role-and-debug-panel.md)) — a `role` on the profile, the 7-tap Version-row unlock, and a DEVELOPER panel (`DevTools`) with stage / technique-mastery / premium setters, jump-to-flow buttons (onboarding, stage-up card, paywall, sign-in), and reset. Also an account-backed developer allowlist (`DEVELOPER_EMAILS`) — a known developer email is elevated to the developer role automatically on sign-in, on every device. **Next:** deeper direct screen-jumps (Solving / Solved need a live puzzle); harden the unlock before public launch.
- **I6. Improve the start screen.** A richer Home — possibly a mini grid and more.
- **I7. Floating pill nav bar.** Replace the global bottom tab bar with an iOS-native floating button bar — rounded corners (pill).
- **I8. Account page.** Add an avatar to Settings; possibly transform the Settings page into an Account page with subscription management, history, and settings. Relates to Settings (item 19) and the Accounts work.
- **I9. Deductive hint techniques.** Give the hint engine a deductive middle tier so logic hints explain a deduction instead of narrating a backtracking search. *Done 2026-05-18* — [`specs/solving-techniques.md`](../specs/solving-techniques.md) catalogues the tiers; `src/engine/hints.ts` now runs cage domination (`findDominationHint`, the `forced-move` technique) and a naked/hidden-subset + locked-candidate elimination loop (`findDeductiveHint`, the `pair-elimination` technique) before the `findContradictionHint` fallback. Probe over 28 hard/expert solves: contradiction trials dropped to 6 of 567 hints. The generator now also grades difficulty by required technique (`gradeDifficulty`) instead of backtrack count, so a label means "needs this technique" — `progression.md` §2. **Optional follow-ups:** flip-flop / parity-chain hints (spec §8); a clue-density pass if 8×8 medium generation (~6 s) needs trimming. *(Self-crediting `pair-elimination` in `classifyMove` is done, see `src/engine/hints.ts`; it credits the common case and is honest about the limit where the deductive loop pins a different cell first.)*
- **I10. ✅ Auth sheet bottom clearance.** Done 2026-05-25. The account overlay now stacks above the floating bottom tab bar and constrains its height to the viewport, so the lower controls are not covered on iPhone.
- **I11. PauseSheet bottom clearance.** *Found 2026-08-23.* The **Abandon puzzle**
  button renders inside the viewport (y 742-796 at 375x812) but sits underneath the
  floating bottom tab bar, so it cannot be clicked. Pause is then a dead end for the
  mouse: the only way out is Resume. Exactly the bug I10 fixed for the auth sheet, so
  the same fix applies. Check the other bottom sheets (HintMenu, DifficultyPicker,
  RedeemCodeSheet) for the same clearance while in there.
- **I12. Real grid semantics for the board.** *Found 2026-08-23.* `Cell` is a `<div>`
  with an `onClick` and no role; keyboard play works only through SolvingScreen's
  window `keydown` handler. Two a11y lint rules are suppressed there with that reason.
  The honest fix is `role="grid"` / `role="row"` / `role="gridcell"` with a roving
  tabindex, which makes the board reachable and announced properly. Worth doing before
  public launch; it is a Board + Cell refactor, not a patch.

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

- **~~App name.~~** ✅ Resolved 2026-05-21. **Tectonic Legend** ([ADR-0006](decisions/ADR-0006-app-name.md), Accepted). The repo, the app, the `<title>` and the in-app wordmark were all renamed in commit `11a9bde`. The "Tectonic & Suguru Puzzles" subtitle carries the genre keywords for ASO.
- **Lifetime pricing.** $6.99 Lifetime strictly dominates $24.99/yr Annual — the swarm's paywall agent flagged it. Options: reprice Lifetime (~$39.99), hide it on the contradiction paywall, or gate it behind two declines. ADR-0008 needs the answer.
- **Free/premium split.** Current thinking gates Hard/Expert + contradiction hints + technique-mastery stats + archive. Validate in soft launch. ADR-0007.
- **Subscription vs one-time unlock.** Research favors subscription; test both in soft launch. ADR-0008.
- **Tutorial skippability.** ✅ Resolved 2026-05-15 — anyone can skip, no gate. A Skip control on the Welcome screen and each tutorial jumps straight to Beginner.
- **~~A difficulty tier above Expert ("Legend"?)~~.** ✅ Resolved 2026-05-20 — *pure status, not a difficulty tier*. Stage 5 Legend (ADR-0018) plus four Legend rungs and the daily-puzzle leaderboard (ADR-0019). The brand-named status is earned through depth across every technique, not by adding a new generator gate.
- **Mastery thresholds** (`specs/progression.md`). Spec'd in ADR-0018 as a depth score with the existing 8 / 3 boundary landing at depth ≈ 60 (mastered). The first-draft `SELF_TARGET = 20` / `PUZZLES_TARGET = 12` and the rung thresholds (Adept 93/12 … Mythic 99/25) are the calibration question soft-launch data resolves.
- **Basic-hint persistence.** Should the basic-hint ring/caption persist until the player acts, or auto-clear after N seconds? (Swarm batch-1 open question.)
- **Mastery chip layout.** The mid-solve chip shifts the keypad down ~58px. Overlay on the toolbar, shrink the technique chip, or accept the crowd? (Swarm batch-3 open question.)
- **Hint usage in solve summary.** Does using hints turn cells yellow (mild penalty) or green (no penalty)? Affects how much players show hints in shares.

---

## Future: migration to GitHub Issues

When a collaborator joins, items in **Now** and the **v1 build plan** move to GitHub Issues with priority + area labels. ADRs stay in `docs/decisions/`. **Later** items can stay here as roadmap intent or migrate with a `roadmap` label. **Open questions** stay until resolved.

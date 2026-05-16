# Tectonic — Soft-Launch Plan

> **Status:** Draft for Jonas's review and approval.
> **Date:** 2026-05-16
> **Author:** Claude (research + recommendations pass)
> **Sources:** [`docs/market-research.md`](market-research.md), [`PRD.md`](../PRD.md), ADR-0003 / 0006 / 0007 / 0008 / 0010 / 0012, [`specs/progression.md`](../specs/progression.md), [`docs/backlog.md`](backlog.md), plus 2026 web research (cited inline).

This document gives a decision-ready recommendation on every soft-launch parameter. Each section ends with a **Recommendation** and a clear flag where the final call is yours. Where a recommendation changes an existing ADR, that's noted so the ADR can be amended.

---

## 0. Executive summary

| Decision | Recommendation | Your call needed? |
|----------|----------------|-------------------|
| **App name** | Primary brand **"Cagey"** · subtitle `Tectonic & Suguru Logic Puzzles` | **Yes** — final name is a brand/legal judgment. Top pick stated below. |
| **Pricing** | $3.99/mo · **$19.99/yr** (default) · drop the $6.99 lifetime SKU | Confirm only |
| **Free vs premium** | Premium = ad-free + advanced/contradiction hints + technique-mastery stats + daily archive + theme pack. **No difficulty gate** (ADR-0012). | Confirm only |
| **Launch market** | Confirm **NZ + CA**, add **IE** to the soft-launch cohort | Confirm only |
| **Language** | **English only** at soft launch; localization roadmap below | Confirm only |
| **Platform** | **iOS-first via Capacitor**; Android in Phase 3, same bundle | Confirm only |
| **Metrics** | Targets unchanged from PRD §10; instrumentation plan below; **Mimir must be publicly hosted before launch** | Action item |

The single biggest open blocker is the **app name** — it gates the App Store submission and a trademark filing. Everything else is a confirm-or-tweak.

---

## 1. App name (ADR-0006 → ready to move to Accepted)

### The problem, restated

"Tectonic" is generic and **not defensible**. Worse, the collision is now confirmed concrete: Keesing ships **"Tectonic | Logic puzzles"** live on the US App Store (`id1628584293`), and "Suguru" is taken by at least two live iOS apps — Aliaksandr Uvarau's *Suguru* (`id1441239692`, 6,000 levels, free, no ads) and *Suguru & Variants by Logic Wiz* (`id1667284679`). A player who hears "try Tectonic" or "try Suguru" lands on a competitor. We cannot win the store search for our own name if our name **is** a competitor's name.

So the brand must be **distinctive and ownable**, with "Tectonic" and "Suguru" demoted to the ASO subtitle/keyword string where they do real discovery work without being the thing we compete for.

### Naming criteria

1. Distinctive enough to be the #1 result for itself and trademark-filable.
2. Short, one or two syllables, easy to say and type.
3. Evokes the mechanic (cages / cells / logic) without being literal.
4. Clean `.com` or `.app` domain plausibly available.
5. No obvious live iOS-app or trademark collision in the Games/Puzzle category.

### Ranked candidates

**1. Cagey** *(recommended primary)*
- The core mechanic of Tectonic/Suguru is the **cage** — the irregular cell group. "Cagey" names it, and the word independently means *shrewd / clever* — a perfect fit for a logic puzzle that markets itself on teaching you to think. Two syllables, friendly, memorable.
- Web check: no logic-puzzle iOS app named "Cagey" surfaced. The closest hits are *"Cage It!"* (`id1439556953`, an unrelated tap-to-clear game) and *"Cage Match"*-type titles — different words, different genre framing, low collision risk. This is **not** a clearance opinion (see legal note), but no blocking head-on collision is visible.
- Domain: `cagey.app` / `getcagey.com` / `playcagey.com` are realistic acquisition targets if the bare `.com` is held.
- Risk: "Cagey" also reads as *evasive/secretive*, a mild negative connotation. In a puzzle context the *clever* reading dominates, so this is minor.

**2. Cairn**
- A cairn is a deliberate stack of stones — quiet, calm, methodical, premium-feeling; pairs naturally with the brand voice ("quiet, warm, adult" per `specs/progression.md`). Distinctive and very clean as a wordmark.
- Risk: weaker mechanical link (it's a *pile*, not a *cage*), and "cairn" is a moderately common brand word generally (outside puzzles). Worth a closer trademark look if it becomes the pick. No blocking puzzle-app collision found.

**3. Sumi**
- Carried over from ADR-0006. Japanese for "corner/nook," ties to the cage shape and the genre's Nikoli heritage; short and soft.
- Risk: "Sumi" is a common given name and a common brand token across many categories — high genericness and likely crowded trademark space. Verify carefully before committing. Ranked third for that reason.

> Note on ADR-0006's other listed candidates: **"Nikoli"** must stay struck — it is a real Japanese puzzle publisher and trademark-encumbered. A fully coined name (Calm/Headway style) remains an option but is the most expensive path to awareness for a solo dev; not recommended for a soft launch where budget is the constraint.

### ASO subtitle

iOS gives a 30-character **subtitle** and a 100-character **keyword field**, both indexed for search.

- **App name field:** `Cagey` (or `Cagey: Logic Puzzles` if you want the category in the title — both fit).
- **Subtitle (≤30 chars):** `Tectonic & Suguru Puzzles` (25 chars) — captures both generics players actually search.
- **Keyword field (≤100 chars):** `tectonic,suguru,logic puzzle,sudoku alternative,number puzzle,brain game,daily puzzle,nikoli`

This rides "Tectonic," "Suguru," and "Sudoku alternative" for discovery while the brand itself stays ownable — exactly the ADR-0006 strategy, now with a concrete name.

### Recommendation

Adopt **Cagey** as the primary brand with subtitle **"Tectonic & Suguru Puzzles."** Move ADR-0006 to **Accepted** once you sign off.

**This is flagged as your call** — the name is a brand and legal judgment, not a data one. If "Cagey" doesn't land for you, **Cairn** is the strong runner-up. Before App Store submission, regardless of pick:
- Run a proper USPTO/EUIPO clearance search (or a quick paid clearance via a service like Trademarkia) in **Class 9 (software)** and **Class 41 (games/entertainment)**.
- Confirm the App Store name is free in NZ, CA, IE, US (App Store Connect rejects duplicate names per storefront).
- Secure the domain and the `@cagey`-style social handles in the same pass.
The repo can stay `tectonic-for-the-win` as a working title; renaming it is cosmetic.

---

## 2. Pricing (ADR-0008 → ready to amend)

### Current 2026 genre benchmarks (web-researched)

| Product | Model | Price (2026) |
|---------|-------|--------------|
| NYT Games (individual) | Subscription | **$39.99/yr** or **$4.25/mo** (annual ≈ $3.33/mo, ~22% saving) |
| NYT Games (family) | Subscription | $10/mo |
| Sudoku.com (Easybrain) | Subscription | **$4.99/mo** (annual ~$60) |
| Monument Valley 2 | One-time premium | $4.99 |
| Typical premium-puzzle one-time unlock | One-time | ~$4.99 (first chapter free, full unlock) |

The market-research doc's numbers still hold in mid-2026: subscriptions cluster at **$4–5/mo**, and annual plans land **$25–60/yr**. Our proposed $3.99/mo sits cleanly *below* both NYT and Sudoku.com — the right place for an unknown brand with no editorial reputation.

### The lifetime-SKU problem (the flagged open question)

ADR-0008 proposes three SKUs: $3.99/mo, $24.99/yr, $6.99 lifetime. The backlog and the swarm both flagged the defect: **a $6.99 one-time lifetime purchase strictly dominates a $24.99/yr subscription.** A rational buyer never picks annual when lifetime is cheaper than one year. Showing all three on one paywall trains every would-be annual subscriber to buy the cheapest forever-option, collapsing your highest-LTV tier.

There are three ways out:

1. **Reprice lifetime up** to ~$39.99 so annual is the value pick for a 1–2 year horizon. Keeps the A/B but makes lifetime a deliberate "I'm all-in" purchase.
2. **Drop lifetime entirely** — ship monthly + annual only, the proven NYT/Sudoku.com shape.
3. **Hide lifetime** as a win-back offer surfaced only after a subscription decline.

ADR-0008's stated *intent* for lifetime was a **fallback A/B** — "does one-time beat subscription LTV?" That's a real question, but $6.99 is the wrong instrument: it's so cheap it doesn't test "subscription vs one-time," it tests "subscription vs nearly-free." A $6.99 unlock would almost certainly "win" on raw conversion while destroying revenue per user.

### Recommendation

**Ship two SKUs at soft launch: monthly + annual. Drop the lifetime SKU.**

| SKU | Price | Notes |
|-----|-------|-------|
| Monthly | **$3.99/mo** | Unchanged. Low-commitment entry; below NYT and Sudoku.com. |
| Annual | **$19.99/yr** *(recommended, was $24.99)* | Default highlighted option. $19.99 = "less than $1.67/mo," a 58% discount vs monthly — a sharper anchor than $24.99 and still healthy LTV. Sits well under NYT's $39.99. |

Rationale for $19.99 over $24.99: with no lifetime SKU, the annual plan is now the *value* tier and should be priced to convert decisively. $19.99 crosses the psychological "under twenty dollars" line, reads as the obvious smart choice next to $3.99/mo, and the App Store's standard $19.99 price point is a clean tier. We are buying retention and LTV, not margin per sale — a solo dev with no content team needs the annual lock more than the extra $5.

**On the one-time-vs-subscription question ADR-0008 wanted to test:** don't kill it, *defer* it. Soft launch already has five kill-metrics to read; adding a pricing-model A/B muddies a small NZ+CA sample. Ship subscription-only, and **if soft-launch IAP conversion lands below ~2%**, run a one-time-unlock test in Phase 2 (the larger US/UK/AU cohort) at a **non-dominating price (~$24.99 lifetime)** where the A/B is actually meaningful. This is a clean amendment to ADR-0008: "soft launch ships monthly + annual only; one-time unlock is a Phase-2 contingency test, not a launch SKU."

**Regional pricing:** keep NZ/CA/IE at the **US baseline tier** for soft launch — all three are high-ARPU English markets and the research explicitly groups CA with the US baseline. Use App Store Connect's automatic territory pricing off the US anchor; revisit per-region pricing in Phase 3 (EU/JP) per ADR-0003.

**StoreKit setup:** two auto-renewable subscription products in one subscription group (so upgrade/downgrade between monthly and annual is handled by StoreKit). No lifetime non-consumable. This also simplifies the paywall to a two-option layout — easier to design well in Open Design.

---

## 3. Free vs premium split (ADR-0007 → must be re-derived)

### Why ADR-0007 is now stale

ADR-0007's split made **Hard + Expert difficulty** a premium fence ("the paywall first appears when the player taps a Hard difficulty"). **ADR-0012 (Accepted, 2026-05-15) removed difficulty gating entirely** — `STAGE_GATING_ENABLED = false`, every difficulty is free to play from session one. So:

- Difficulty **can no longer be a paywall**. The line "Hard + Expert difficulty — Premium" in ADR-0007 and in PRD §6 is dead.
- The paywall trigger "Player taps a locked difficulty (Hard/Expert)" in `specs/progression.md` §7 and PRD §8 is also dead — there are no locked difficulties.
- This removes ADR-0007's central conversion mechanic ("by the time they want Hard, they've felt the journey"). We need a new primary trigger.

This is the most important re-derivation in this document.

### What premium *is* now — re-derived

With difficulty off the table, premium has to be built from the remaining levers. Ranked by the research's conversion-effectiveness data (`market-research.md` §2: ad removal is the #1 first-purchase trigger in the genre, content-windowing is NYT's proven hardgate, advanced hints are #3):

| Premium lever | Keep? | Why |
|---------------|-------|-----|
| **Ad-free** | ✅ Core | #1 converter in the genre. The free tier *must* run interstitials between puzzles for this to bite — the player feels the pain, then pays. This is now the **primary** conversion driver. |
| **Contradiction-chain hints** | ✅ Core | The product's signature feature ("no other puzzle app does this," per market research). A premium player gets the full step-by-step "why." Free players see that the feature exists (greyed) — aspiration, not a crippled demo. |
| **Unlimited advanced hints** (forced-move / pair-elimination) | ✅ Core | Free tier gets a daily limit; premium is unlimited. This is the soft-limit nudge ADR-0007 already specified. |
| **Technique-mastery stats** | ✅ Keep | Already premium in PRD §4 and `specs/progression.md` §6. The *chips* stay visible to everyone (mastery as a concept is free); the deep mastery dashboard is premium. |
| **Daily-puzzle archive (>7 days)** | ✅ Keep | NYT's proven windowed hardgate. Today + last 7 days free; older puzzles premium. Zero extra infra — ADR-0010's deterministic seed makes the archive a pure function. |
| **Theme pack** | ✅ Keep | Low conversion, good incremental ARPPU. One free theme, premium theme pack. |
| Hard + Expert difficulty | ❌ **Remove** | Dead per ADR-0012. All difficulties free. |

### Recommended free/premium table (replaces PRD §6 and ADR-0007's table)

| Feature | Free | Premium |
|---------|------|---------|
| **All difficulties — Easy / Medium / Hard / Expert** | ✅ | ✅ |
| Tutorial puzzles | ✅ | ✅ |
| Naked + hidden single hints | ✅ | ✅ |
| Forced-move / pair-elimination hints | ✅ limited (3/day) | ✅ unlimited |
| Contradiction-chain hints | — | ✅ |
| Stats — solve performance | ✅ | ✅ |
| Stats — streaks | ✅ | ✅ |
| Stats — technique-mastery dashboard | — | ✅ (chips visible to all; deep stats premium) |
| Mastery chips on Solved screen | ✅ | ✅ |
| Daily puzzle — today | ✅ | ✅ |
| Daily puzzle — last 7 days | ✅ | ✅ |
| Daily puzzle — archive (>7 days) | — | ✅ |
| Ad experience | Interstitial **between** puzzles (never mid-solve) | Ad-free |
| Cosmetics / themes | 1 default theme | Theme pack |

### New paywall triggers (replaces `specs/progression.md` §7)

Since the marquee "tap a locked Hard puzzle" trigger is gone, the paywall now surfaces at:

| Trigger | Offer copy framing |
|---------|--------------------|
| Player taps a **contradiction-chain hint** | "See exactly why each move works." — the signature-feature pitch. **This is the new primary trigger.** |
| Player hits the **3/day free advanced-hint limit** | "You're solving hard puzzles. Get unlimited hints." — catches engaged players. |
| Player taps a **daily-archive entry older than 7 days** | "Catch up on every daily puzzle." — NYT-style content window. |
| Player taps the **technique-mastery section** in Stats | "See which techniques you've mastered." |
| **Ad-dismiss / "remove ads" affordance** on the interstitial | "Play ad-free." — the #1 genre converter; make it a one-tap path from every interstitial. |

Note this is a softer funnel than ADR-0007's. ADR-0007 leaned on a single high-intent moment (you earned Hard, now pay). Without difficulty gating, conversion now rests on **ad annoyance + the contradiction-hint aspiration**. That's still a proven combination — it's literally the Sudoku.com / NYT model — but it means the **free-tier ad experience must be real**. If the free tier is effectively ad-free, there is no soft-launch conversion engine. The interstitial-between-puzzles spec in PRD §6 is now load-bearing, not optional polish.

### Recommendation

Adopt the table above. **Amend ADR-0007** (it is still `Proposed`, so this is a clean rewrite, not a reversal) to: difficulty is *not* gated; premium = ad-free + contradiction hints + unlimited advanced hints + mastery dashboard + daily archive + themes; primary trigger is the contradiction-hint tap and the ad-remove affordance. **Amend PRD §6** and **`specs/progression.md` §7** to drop the locked-difficulty rows.
*(Per the task constraints I have not edited those files — flagging the edits so you can make them, or approve me to in a follow-up.)*

ADR-0007's own fallback still applies: if soft-launch IAP conversion < 1%, the first knob to loosen is the 3/day advanced-hint limit (tighten it to pull conversion, loosen it if it's choking the free experience).

---

## 4. Launch market (ADR-0003 — confirm with a tweak)

ADR-0003 (Accepted) specifies NZ + CA for soft launch. This still holds and the reasoning is sound:

- **New Zealand** is the canonical English-language soft-launch proxy — small enough that a bad metric doesn't burn a real market, English-speaking, App-Store-mature, behaviorally close to AU/US, low organic-discovery noise.
- **Canada** adds scale and a population that behaves like the US market for retention and IAP, at lower acquisition cost and lower reputational stakes.

One tweak worth making: **add Ireland (IE) to the soft-launch cohort, not just Phase 2.** IE is small, English-speaking, EUR-priced, and gives you an early read on **Eurozone pricing behavior** before the bigger EU push in Phase 3 — at soft-launch scale where a wobble is cheap. It costs nothing (App Store Connect territory toggle) and de-risks the EUR price point. ADR-0003 currently puts IE in Phase 2; pulling it forward is a low-risk refinement.

**Do not** add the US to soft launch — the whole point is to validate before the highest-value market sees the app, and before paid acquisition. Keep US/UK/AU in Phase 2 exactly as ADR-0003 has them.

### Recommendation

Confirm **NZ + CA**, **add IE**. Soft-launch availability list = **New Zealand, Canada, Ireland**. No paid acquisition in this phase — organic + TestFlight graduates only. This is a minor amendment to ADR-0003 (IE moves from Phase 2 to Phase 1).

---

## 5. Language / localization

### Soft launch: English only

The app is **almost entirely numeric** — the board is digits, cages are shapes. Text is confined to onboarding, the tutorial scripts, stage-up cards, hint captions, Stats labels, the paywall, and Settings. The PRD already scopes localization out of v1 (PRD §9). For a NZ/CA/IE soft launch — three English-first markets — there is **zero localization need**. Shipping English-only is correct and adds no risk.

### Localization roadmap (post-soft-launch)

The cost is low *because* the surface is small, so localization can move fast once a market justifies it. Recommended order, mapped to ADR-0003's phases:

| When | Languages | Rationale |
|------|-----------|-----------|
| **Phase 2** (US/UK/AU/IE) | English only | No new languages; all English markets. |
| **Phase 3** (EU + Japan) | **Japanese** first, then **German, Dutch, French** | Japan is the puzzle-culture heartland (Nikoli invented Suguru) and a top-3 revenue market — JP is the highest-ROI single localization. DE/NL/FR cover the puzzle-strong EU markets ADR-0003 names. |
| **Phase 4** (global) | **Spanish, Portuguese (BR)** | LATAM + SEA expansion; pairs with regional pricing. |

Practical setup: introduce an i18n string layer (e.g. a simple `react-intl` or a flat key/value JSON per locale) **before Phase 3**, not at soft launch — but **write all new UI strings through a single strings module now** so the eventual extraction is mechanical. Also localize the **App Store listing metadata** (title, subtitle, keywords, screenshots, description) per market — that's higher-leverage for discovery than in-app text and should lead each phase. Keyword research per locale matters: "Suguru" and "Tectonic" have different search volumes in JP vs EU.

### Recommendation

**English only at soft launch.** Localize the App Store listing + in-app strings for **Japanese** first at Phase 3, then DE/NL/FR; ES/PT-BR at Phase 4. Route all new UI copy through a strings module now to keep the future extraction cheap.

---

## 6. Platform (confirm iOS-first, plan Android)

### iOS-first via Capacitor — confirmed

The plan (PRD, backlog item 21) is an iOS wrapper via Capacitor. This is right:

- The app is already a working Vite + React + TypeScript web build. Capacitor wraps that build with **near-zero rework** — it's a WebView shell plus a few native plugins (StatusBar, SafeArea, and later StoreKit/RevenueCat for IAP).
- iOS-first matches the market: the research's ARPU and benchmark data (NYT, Sudoku.com pricing, IAP payer rates) is iOS/US-centric, and the soft-launch proxy-market methodology (NZ/CA) is an iOS-App-Store convention.
- A solo dev should validate **one** store, one review process, one set of metrics before doubling the surface.

There is still an open ADR ("Capacitor vs native shell," backlog item 21). Recommendation: **resolve it as Capacitor.** A hand-rolled native shell buys nothing for a WebView-based puzzle game and costs a solo dev weeks. Capacitor is the pragmatic, reversible choice — if a future feature genuinely needs native UI, that's a per-feature decision, not a reason to start native.

### Android — Phase 3, same Capacitor bundle

Capacitor's core advantage: **the same web bundle ships to Android** with a second platform target and a Play Store listing. So Android is cheap *later* but should not be *now*:

- Don't split focus during soft launch — the kill-metrics must be read on one platform first.
- Android's puzzle-segment ARPU is lower; the monetization model should be proven on the higher-ARPU iOS audience first.
- Play Store has its own review, billing (Google Play Billing — RevenueCat abstracts both), and a separate metrics baseline.

Best fit: **launch Android in Phase 3** alongside the EU/JP expansion. By then iOS retention and IAP conversion are validated, the paywall is tuned, and Android becomes a low-risk reach extension on a bundle that already exists. Note Keesing's Tectonic has its meaningful traction *on Android* (~1,100 downloads/mo) — so Android is a real opportunity, just not a soft-launch one. The backlog already lists "Android launch — same Capacitor bundle" under Later; this just assigns it a phase.

### Recommendation

**iOS-first via Capacitor** for soft launch (resolve the pending ADR as Capacitor). **Android in Phase 3**, same Capacitor bundle, via RevenueCat so one IAP integration covers both stores. No Android work before iOS soft-launch metrics pass.

---

## 7. Soft-launch metrics & kill criteria

### Targets — unchanged from PRD §10

These come straight from `market-research.md` §4 / PRD §10 and are well-calibrated for the genre. No change recommended.

| Metric | Target (proceed) | Kill threshold |
|--------|------------------|----------------|
| Day 1 retention | > 40% | < 25% |
| Day 7 retention | > 20% | < 10% |
| IAP conversion | > 3% | < 1% |
| Avg puzzles / session | > 2 | < 1.2 |
| Share rate | > 5% of sessions | < 1% |

Reading: hit targets → proceed to Phase 2 (paid acquisition in US/UK/AU). Land between target and kill → iterate (onboarding, hint limits, paywall copy) and re-measure before paid spend. Below kill → revisit the journey itself per PRD §10's hypothesis ("if retention is low, the journey is unfelt").

One caveat on **IAP conversion**: 3% is achievable but ambitious for a brand-new app with no reviews and a softer-than-originally-planned funnel (difficulty is no longer a paywall — see §3). Treat the 3% as the *Phase-2-readiness* bar and 1–3% as "the model works, tune it." Don't kill the product on IAP alone if retention and engagement are strong — weak early IAP with strong retention is a paywall-tuning problem, not a product-death signal.

### Instrumentation — mapping each metric to events

The app already has **Mimir** analytics wired (backlog item 20): a `vite.config` plugin injects the SDK when `VITE_MIMIR_*` is set; `src/lib/analytics.ts` emits semantic events; pageviews + click autocapture are free. The semantic events already emitted: `puzzle_started`, `puzzle_solved`, `puzzle_shared`, hint-used, `tutorial_completed`, `tutorial_skipped`, stage-reached.

| Metric | How to compute it from events |
|--------|-------------------------------|
| **Day 1 / Day 7 retention** | Needs a stable per-install anonymous ID + a `session_started` (or app-open) event per launch. Retention = distinct IDs with an app-open on day N / distinct IDs on day 0. Confirm Mimir issues a persistent anonymous device ID; if not, generate a UUID in `localStorage` on first launch and attach it to every event. |
| **IAP conversion** | Needs **Phase-4 paywall/IAP events** — not yet emitted (backlog item 20 explicitly lists these as remaining). Add: `paywall_shown` (with a `trigger` property: `contradiction_hint` / `hint_limit` / `archive` / `mastery_stats` / `ad_remove`), `paywall_dismissed`, `purchase_started`, `purchase_completed` (with `sku`: `monthly` / `annual`), `purchase_restored`. Conversion = distinct IDs with `purchase_completed` / distinct installs. |
| **Avg puzzles / session** | `puzzle_started` count grouped by session ID. Requires a session boundary — Mimir's pageview/session model likely supplies one; otherwise derive from a 30-min inactivity gap on app-open events. |
| **Share rate** | `puzzle_shared` events / sessions. The share artifact is backlog item 15 — confirm `puzzle_shared` fires on the actual share tap (and ideally carries `difficulty`). |
| **Funnel health (supporting)** | `tutorial_completed` vs `tutorial_skipped` (onboarding drop-off); `hint_used` by technique (hint dependence); `stage_reached` (does the journey actually progress players?); `paywall_shown` by `trigger` (which trigger converts — critical for tuning the §3 funnel). |

### The hard blocker — Mimir must be publicly hosted

Per backlog item 20: **`mimir.test` is local-only, so production analytics is dormant.** A soft launch with no analytics is not a soft launch — every kill-metric above is unmeasurable. Before submission:

1. Host Mimir at a stable **public URL** (a small VPS or a managed deploy).
2. Set `VITE_MIMIR_SCRIPT_URL`, `VITE_MIMIR_ENDPOINT`, `VITE_MIMIR_TOKEN` as repo variables/secret so the production build injects the SDK.
3. Verify end-to-end from a **TestFlight build** (not just dev) — a Capacitor WebView ingesting to the public endpoint is a different path than `localhost`; CORS and the `/_m/*` proxy behave differently in the wrapped app. Test this during the TestFlight beta, not after launch.
4. Add the **Phase-4 paywall/IAP events** before launch even though the paywall is built last — IAP conversion is a kill-metric and cannot be retrofitted after data collection starts.

### Pre-launch instrumentation checklist

- [ ] Mimir hosted at a public URL; prod env vars set as repo variables/secret.
- [ ] Persistent anonymous install ID confirmed (or added via `localStorage` UUID).
- [ ] `session_started` / app-open event emitting (required for retention).
- [ ] Paywall + IAP events added (`paywall_shown` w/ `trigger`, `purchase_*` w/ `sku`).
- [ ] `puzzle_shared` confirmed firing on real share taps.
- [ ] End-to-end verified from a **TestFlight build**, not dev.
- [ ] A simple dashboard (or saved Mimir queries) for the five kill-metrics, checked weekly across the 4-week soft launch.

### Recommendation

Keep PRD §10 targets unchanged. Instrument every metric through Mimir per the table above. **Treat "Mimir publicly hosted + paywall events added + TestFlight-verified" as a hard gate on soft-launch submission** — it is currently the highest-risk unchecked item, ahead of even the app name.

---

## 8. Consolidated action list for Jonas

**Decide (your judgment):**
1. **App name** — approve **Cagey** (runner-up: Cairn), or pick another. Blocks App Store submission and trademark filing.

**Confirm (recommendations ready, expecting yes):**
2. Pricing: $3.99/mo + **$19.99/yr**, **no lifetime SKU** at launch. → amend ADR-0008.
3. Free/premium split per §3 table; difficulty is **not** gated. → rewrite ADR-0007 (still Proposed), amend PRD §6 and `specs/progression.md` §7.
4. Soft-launch markets: NZ + CA **+ IE**. → minor amend to ADR-0003.
5. English-only at launch; JP-first localization at Phase 3.
6. Platform: Capacitor for iOS; Android at Phase 3. → resolve the pending Capacitor-vs-native ADR as Capacitor.

**Do before submission (action items):**
7. Run a real trademark clearance on the chosen name (Class 9 + Class 41); secure domain + handles.
8. Host Mimir publicly; add paywall/IAP events; verify analytics from a TestFlight build. **Hard gate.**
9. Configure two StoreKit subscription SKUs (one group) via RevenueCat.

---

## Sources

- [NYT Games Subscription pricing 2026 — Connections Hintz](https://www.connectionshintz.com/blog/nyt-games-subscription-guide)
- [NYT Games / All Access pricing — RedFlagDeals](https://forums.redflagdeals.com/ny-times-ny-times-games-25-per-yr-all-access-39-per-yr-1st-yr-only-new-subscribers-2562707/)
- [Best Sudoku Apps Compared 2026 — sudokuaday.com](https://sudokuaday.com/best-sudoku-app-comparison)
- [11 Best Logic Puzzle Apps 2026 — Freeappsforme](https://freeappsforme.com/logic-puzzle-apps/)
- [Tectonic | Logic puzzles (Keesing) — Apple App Store](https://apps.apple.com/us/app/tectonic-logic-puzzles/id1628584293)
- [Suguru (Aliaksandr Uvarau) — Apple App Store](https://apps.apple.com/us/app/suguru/id1441239692)
- [Suguru & Variants by Logic Wiz — Apple App Store](https://apps.apple.com/us/app/suguru-variants-by-logic-wiz/id1667284679)
- [Cage It! — Apple App Store](https://apps.apple.com/us/app/cage-it/id1439556953)
- [Sudoku trademark history (Nikoli) — AUTOMATON WEST](https://automaton-media.com/en/news/20230830-21220/)

# App Store Launch Prep

> Concrete submission checklist and guide for getting **Tectonic** (working title)
> onto the Apple App Store. Pairs with [`docs/backlog.md`](backlog.md) Phase 5.
>
> **Status:** Pre-submission. The iOS shell is not yet scaffolded; the paywall is
> not built. This document is the plan, not a record of completed work.
>
> **Last updated:** 2026-05-16

This guide is built from the App Store skills under
[`.claude/skills/`](../.claude/skills/) — in particular `apple-appstore-reviewer`,
`app-store-review`, `release-spec`, `app-store-screenshots`,
`app-store-deployment`, and the ASO skill. Read those for depth; this is the
project-specific application of them.

---

## 0. Where the app stands today (audit baseline)

What a reviewer-mindset pass of the repo found, so the rest of the document has
context:

- **Platform:** Web SPA only — Vite 8 + React 19 + TypeScript. No `ios/`
  directory, no `capacitor.config.*`. The Capacitor wrap is **not scaffolded**
  ([`ARCHITECTURE.md`](../ARCHITECTURE.md) §6, backlog item 21).
- **No backend, no accounts, no auth, no cross-device sync** — local-only state
  in `localStorage`, share via URL hash. This is good for review: no login wall,
  no demo account needed.
- **Analytics:** Mimir, wired but dormant. The SDK `<script>` is injected by
  `vite.config.ts` *only* when `VITE_MIMIR_*` env vars are all set. In a
  production build with those unset, the app ships with **zero analytics and no
  third-party scripts**. When set, it collects anonymous usage data only (see §1).
- **Monetization:** Paywall + StoreKit/RevenueCat are **Phase 4, not built**
  (backlog items 17–18). `PRD.md` §6 describes the free/premium split; ADR-0007
  and ADR-0008 are still `Proposed`.
- **Placeholder content still in the repo** (rejection risk — see §5):
  - `index.html` `<title>` is `tectonic-for-the-win`.
  - `README.md` is the stock Vite template.
  - `src/screens/SettingsScreen.tsx` is a one-paragraph stub — no Restore
    Purchase, no How to Play, no About, no privacy link.
  - App name is unresolved (ADR-0006).
- **Tests:** 39 passing (engine + progression). No crash-handling review done
  for the native shell yet (it does not exist yet).

---

## 1. Privacy

The app's privacy posture is genuinely simple, which is an asset. Declare it
**honestly and minimally** — over-declaring triggers "your labels don't match
your behaviour" rejections just as under-declaring does.

### 1.1 What the app actually collects

| Data | When | Notes |
|------|------|-------|
| Puzzle play events (`puzzle_started`, `puzzle_solved`, `hint_used`, `puzzle_shared`, `tutorial_completed/skipped`, `stage_reached`) | Only if Mimir is configured for the production build | `src/lib/analytics.ts` |
| Pageviews + click/form autocapture | Same — Mimir SDK default | Mimir README "Autocapture" |
| `anonymous_id`, `session_id` (client-generated UUIDs) | Same | Not tied to a person |
| User-agent, language, viewport, device platform, app version | Same | Standard SDK context |
| Player profile, stats, settings, in-progress game | Always | **Stays on-device** in `localStorage`. Never leaves the device. Not "collected" in App Store terms. |

**Not collected, ever:** name, email, contacts, photos, location, IP-based
geolocation (Mimir does not store raw IPs), canvas/WebGL/font fingerprinting,
cross-site identifiers, advertising identifiers. The app does **not** call
`mimir.identify()`, so no `user_id` / "User ID" data type applies. Source:
Mimir README "Privacy posture" and "App Store nutrition labels" note.

**Decision point for Jonas:** ship v1 with Mimir **on** or **off** in production.

- **Off** (no `VITE_MIMIR_*` set in the deploy): the simplest privacy story —
  "Data Not Collected" on every category. Mimir is local-only (`mimir.test`)
  today, so this is the *current* default until Mimir is publicly hosted
  (backlog item 20).
- **On:** requires hosting Mimir at a public HTTPS URL first, then the labels
  and manifest below. Recommended for soft launch since retention metrics are
  the whole point of the soft launch (`PRD.md` §10).

The rest of §1 assumes **Mimir on**. If shipping with it off, declare "Data Not
Collected" everywhere and skip the data-type entries in the manifest.

### 1.2 `PrivacyInfo.xcprivacy` (privacy manifest)

Capacitor produces a native iOS app, so a privacy manifest is required. Place it
in the iOS app target's resources (`ios/App/App/PrivacyInfo.xcprivacy`). Two
things go in it: declared data collection, and Required-Reason API usage.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <!-- The app does NOT track in the App Tracking Transparency sense:
         no cross-app/cross-site linking, no data broker sharing,
         no advertising identifiers. -->
    <key>NSPrivacyTracking</key>
    <false/>
    <key>NSPrivacyTrackingDomains</key>
    <array/>

    <!-- Data collected. Only include this block if Mimir is enabled
         in the production build. With Mimir off, leave the array empty. -->
    <key>NSPrivacyCollectedDataTypes</key>
    <array>
        <dict>
            <key>NSPrivacyCollectedDataType</key>
            <string>NSPrivacyCollectedDataTypeProductInteraction</string>
            <key>NSPrivacyCollectedDataTypeLinked</key>
            <false/>
            <key>NSPrivacyCollectedDataTypeTracking</key>
            <false/>
            <key>NSPrivacyCollectedDataTypePurposes</key>
            <array>
                <string>NSPrivacyCollectedDataTypePurposeAnalytics</string>
            </array>
        </dict>
    </array>

    <!-- Required-Reason APIs. Capacitor + WKWebView read UserDefaults
         for app state; the WebView's localStorage persistence touches
         file-timestamp APIs. Declare both with the standard reasons.
         Verify against the final Capacitor plugin set before submitting. -->
    <key>NSPrivacyAccessedAPITypes</key>
    <array>
        <dict>
            <key>NSPrivacyAccessedAPIType</key>
            <string>NSPrivacyAccessedAPICategoryUserDefaults</string>
            <key>NSPrivacyAccessedAPITypeReasons</key>
            <array><string>CA92.1</string></array>
        </dict>
        <dict>
            <key>NSPrivacyAccessedAPIType</key>
            <string>NSPrivacyAccessedAPICategoryFileTimestamp</string>
            <key>NSPrivacyAccessedAPITypeReasons</key>
            <array><string>C617.1</string></array>
        </dict>
    </array>
</dict>
</plist>
```

Notes:

- `NSPrivacyCollectedDataTypeProductInteraction` is the App Store data type that
  matches Mimir's "Usage Data — Product Interaction" (confirmed by Mimir's own
  README note). It is **not linked** to identity and **not used for tracking** —
  the UUIDs are anonymous and never joined to a real person.
- Capacitor's own SDK and common plugins (`@capacitor/app`,
  `@capacitor/preferences`, `@capacitor/status-bar`, `@capacitor/splash-screen`)
  ship their own privacy manifests. After `npx cap add ios`, run a build and let
  Xcode's privacy report aggregate them — then reconcile your top-level manifest
  with what it shows. Do not hand-guess the Required-Reason list; verify it.
- If Mimir is **off** for v1, `NSPrivacyCollectedDataTypes` is an empty array and
  `NSPrivacyTracking` stays `false` — the simplest possible manifest.

### 1.3 App Store Connect privacy "nutrition labels"

In App Store Connect → App Privacy, answer the questionnaire to match §1.1.

**With Mimir on:**

| Question | Answer |
|----------|--------|
| Usage Data → Product Interaction — collected? | **Yes** |
| — Linked to the user's identity? | **No** |
| — Used for tracking? | **No** |
| — Purpose | **Analytics** |
| All other categories (Contact Info, Health, Financial, Location, Identifiers, Browsing, Diagnostics, etc.) | **Not Collected** |

Diagnostics/Crash Data: only declare it if you add a crash SDK (none today —
Apple's own Xcode Organizer crash collection does not need a label).

**With Mimir off:** every category is **Data Not Collected**. This is the
current honest answer until Mimir is publicly hosted.

### 1.4 Privacy policy URL (required regardless)

Apple requires a reachable privacy policy URL for **every** app, even one that
collects nothing. It must be a real public HTTPS page (not a Google Drive link,
not `localhost`).

- Host it on the brand domain once the name is picked (ADR-0006), e.g.
  `https://<brand>.app/privacy`.
- Content must state: whether usage analytics is collected and via what
  (self-hosted Mimir, anonymous, no third parties); that all gameplay/profile
  data stays on-device; that no personal data, location, or contacts are taken;
  that there is no account and nothing to delete server-side; a contact email.
- A short, plain-English page is fine — match the policy to the genuinely thin
  data practice. Do not paste a generic boilerplate that claims data practices
  the app does not have; mismatches get flagged under Guideline 5.1.

---

## 2. Metadata

App name is being decided separately (ADR-0006) — every name field below is a
**`<BRAND>` placeholder**. Fill them in once the brand is chosen.

### 2.1 Name, subtitle, category, rating

| Field | Value | Limit / notes |
|-------|-------|---------------|
| **App name** | `<BRAND>` | ≤ 30 chars, must be unique on the App Store. ADR-0006 favours a distinctive brand, not "Tectonic" (Keesing owns that search result). |
| **Subtitle** | `Tectonic & Suguru Puzzles` | ≤ 30 chars (this string is exactly 25). Carries the genre keywords for ASO without committing the brand. Per ADR-0006. |
| **Primary category** | **Games → Puzzle** | The natural home; this is where Sudoku-adjacent logic games rank. |
| **Secondary category** | **Games → Board** *or* **Education** | Board reinforces the logic-game shelf; Education leans on the "teaches you to solve" differentiator (`PRD.md` §1). Pick one; Board is the safer discovery bet. |
| **Age rating** | **4+** | No objectionable content; see §2.5. |
| **Price** | **Free** | Freemium — free download, IAP for premium (`PRD.md` §6). |

### 2.2 Promotional text (≤ 170 chars, updatable without review)

> Learn the logic, not just the levels. A guided journey from your first puzzle
> to contradiction chains — with a hint engine that teaches every move.

### 2.3 Description draft (≤ 4000 chars)

```
<BRAND> is a Tectonic puzzle game that teaches you to solve.

Most logic-puzzle apps just ship difficulty levels and leave you to sink
or swim. <BRAND> is built around a guided journey: you start with your
first cage and naked singles, and you earn your way up to forced moves,
pair eliminations, and full contradiction chains. The hint engine doesn't
just give answers — it explains the deduction, so the technique sticks.

Tectonic (also called Suguru) is a number-placement puzzle. Fill every
cage with 1 to N. No repeated value can touch — not in a cage, not even
diagonally. Simple rules, deep logic.

A JOURNEY, NOT A DIFFICULTY MENU
- Five stages, from Newcomer to Master — progress is a record of what
  you've learned, and every difficulty is always playable.
- Hand-built tutorial puzzles introduce each new technique.
- Celebration moments when a technique finally clicks.

A HINT ENGINE THAT TEACHES
- Every hint names the technique it used: naked single, hidden single,
  forced move, pair elimination, contradiction chain.
- Step through a contradiction chain one move at a time.
- Validate your grid on demand — no nagging red errors while you think.

TRACK YOUR GROWTH
- Best solve times and a solve-time distribution per difficulty.
- Technique mastery — see which techniques you've truly internalised.
- Gentle streaks: a break is never punished, just a "resume where you
  left off".

PLAYS YOUR WAY
- A fresh daily puzzle every day.
- Share a spoiler-free, colour-coded solve summary.
- Light and dark themes. Built mobile-first.
- No account, no sign-in. Your progress lives on your device.

<BRAND> Premium unlocks Hard and Expert difficulty, unlimited advanced
hints, contradiction-chain hints, the technique-mastery stats, and the
daily-puzzle archive. Available as a subscription, with a free tier
that's a complete game on its own.
```

Tighten the closing paragraph once ADR-0007 (free/premium split) and ADR-0008
(subscription vs lifetime) are resolved — the description must describe the
*actual* shipped gating, or it fails Guideline 2.3.

### 2.4 Keyword string (≤ 100 chars, comma-separated, no spaces)

Do not repeat the app name (auto-indexed). Do not use competitor names
("Keesing", "Nikoli"). Singular forms — the store stems plurals. Draft:

```
tectonic,suguru,logic puzzle,number puzzle,brain,sudoku alternative,daily puzzle,cage,deduction
```

That is 96 characters. Run it through the ASO skill's `keyword_analyzer.py` and
`aso_scorer.py` once the brand is set; iterate after soft-launch search data.

### 2.5 Age-rating questionnaire

Answer the (post-January-2026 updated) questionnaire honestly. For a number
puzzle every content axis is **None** — no violence, no sexual content, no
profanity, no horror, no alcohol/drugs/tobacco references, **no simulated
gambling**, no contests. The IAP subscription does **not** count as gambling.
Result: **4+**.

Note: Apple required updated age-rating answers by 2026-01-31 to avoid
submission interruption — when the App Store Connect record is created, just
complete the current questionnaire in full.

### 2.6 Support & marketing URLs

- **Support URL** (required, must be live): `https://<brand>.app/support` — a
  page with a How-to-play primer, an FAQ, and a contact email. Can be a single
  static page.
- **Marketing URL** (optional): `https://<brand>.app` — the landing page.
- These plus the privacy URL all need to resolve before submission. A reviewer
  will click them.

---

## 3. Screenshots

Driven by the `app-store-screenshots` skill. **Core principle: screenshots are
advertisements, not UI documentation — each one sells a single idea.**

### 3.1 Required resolutions (2026)

Apple's current rule: upload **6.9" iPhone** screenshots and they propagate to
smaller iPhones automatically. iPad screenshots are required **only if the app
is offered on iPad** — decide that in App Store Connect (a Capacitor app can be
iPhone-only for v1, which is the simplest path).

| Device | Pixel size (portrait) | Required? |
|--------|----------------------|-----------|
| iPhone 6.9" (16 Pro Max class) | **1320 × 2868** | **Yes** — the one required set |
| iPhone 6.5" (older Pro Max) | 1242 × 2688 | Optional fallback |
| iPad 13" Pro | 2064 × 2752 | Only if the app supports iPad |

Count: **3–10 per set; 5–6 recommended.** PNG, no transparency, no device
frames baked in by Apple's requirement (the screenshot skill's mockup frame is a
*marketing* frame and is fine).

**Recommendation for v1:** ship **iPhone-only**. It removes the iPad screenshot
obligation and the iPad-layout QA pass. Add iPad later as an update.

### 3.2 Slide plan (6 slides, iPhone)

Per the screenshot skill's narrative arc. Capture real app screens (no mockup
data), then compose them with caption + background in the generator.

| # | Idea | Headline (draft) | Source screen |
|---|------|------------------|---------------|
| 1 | Hero / main benefit | Learn the logic, not the levels | Home with stage chip |
| 2 | Differentiator — the teaching hint | Every hint names the move | Solving screen + Hint menu |
| 3 | The journey | From first cage to contradiction chains | Stage-up card |
| 4 | Contradiction stepper | Follow the "what if" step by step | ContradictionStepper |
| 5 | Mastery & stats | See what you've truly mastered | Stats screen, mastery chips |
| 6 | Daily + share | A new puzzle every day | Home daily puzzle / share artifact |

Build process (screenshot skill, Steps 5–6): a single Next.js `page.tsx`
generator, `html-to-image` export at 1320×2868, zero-padded filenames
(`01-hero-...`, `02-...`). Open Design is the alternative composition tool
already in this project's workflow (backlog item 22) — either is fine; the skill
gives the resolution + copy rules regardless of tool.

### 3.3 App icon

- **1024 × 1024 PNG, no alpha, no rounded corners** (iOS rounds it). sRGB or
  Display P3, < 1 MB.
- The repo has `public/favicon.svg` and `public/icons.svg` — neither is an App
  Store icon. A dedicated 1024² icon must be designed (Open Design) once the
  brand mark exists (ADR-0006).
- Capacitor: drop the generated icon set into
  `ios/App/App/Assets.xcassets/AppIcon.appiconset/` (use `@capacitor/assets` or
  `cap-asset-generator` to produce all sizes from the 1024² master).

### 3.4 App preview video

Optional, recommended later. Not a v1 blocker — skip for the soft launch, add
once the UI is final.

---

## 4. Build & submit pipeline

The app is a web build today. The path to the App Store is: scaffold Capacitor →
archive in Xcode → TestFlight → submit. Reference: the `app-store-deployment`
and `release-spec` skills.

### 4.1 Scaffold Capacitor (backlog item 21 — not done)

```bash
npm install @capacitor/core @capacitor/cli @capacitor/ios
npm install @capacitor/status-bar @capacitor/splash-screen @capacitor/app
npx cap init "<BRAND>" "app.<brand>.tectonic" --web-dir=dist
npm run build           # produces dist/
npx cap add ios
npx cap sync ios
```

`webDir` must be `dist` (Vite's output). **Watch this:** `vite.config.ts` sets
`base: '/tectonic-for-the-win/'` — that base path is for GitHub Pages and will
**break asset loading inside the Capacitor WebView**, which serves from the
bundle root. The native build needs `base: '/'` (or `'./'`). Handle it with a
build-mode switch (e.g. a `capacitor` mode, or an env flag) so the web deploy
and the iOS bundle each get the right base. This is a real bug-in-waiting —
verify the WebView loads assets before archiving.

After `cap add ios`: set the bundle identifier, display name, deployment target,
and add the **In-App Purchase** capability in the Xcode project. Add
`PrivacyInfo.xcprivacy` (§1.2) to the `App` target.

### 4.2 Versioning

- **Marketing version** `CFBundleShortVersionString`: start at `1.0.0`
  (MAJOR.MINOR.PATCH).
- **Build number** `CFBundleVersion`: monotonically increasing integer per
  upload (`1`, `2`, …). Every TestFlight/App Store upload needs a fresh, higher
  build number even at the same marketing version.
- Optionally feed the marketing version into `VITE_MIMIR_APP_VERSION` so
  analytics events are tagged with the release.

### 4.3 Code signing

- Enrol in the Apple Developer Program first (§6) — signing is impossible
  without it.
- Use **automatic signing** in Xcode (Signing & Capabilities → "Automatically
  manage signing", select the team). Xcode manages the App ID, distribution
  certificate, and provisioning profile. This is the right choice for a solo
  developer.
- Manual signing / `fastlane match` is only worth it later for CI; not for the
  first manual submission.

### 4.4 Archive & upload

iOS minimum requirement as of **April 28, 2026**: apps must be built with
**Xcode 26 / the iOS 26 SDK**. Build on Xcode 26+. The deployment target (lowest
iOS the app supports) can be lower — iOS 16 or 17 is a reasonable floor for a
WebView app; verify Capacitor's own minimum.

CLI archive (matches Jonas's "drive it from the CLI, stay out of Xcode" workflow
in his global iOS-build preference):

```bash
npm run build && npx cap sync ios
xcodebuild -workspace ios/App/App.xcworkspace \
  -scheme App \
  -configuration Release \
  -sdk iphoneos \
  -archivePath build/App.xcarchive \
  archive
xcodebuild -exportArchive \
  -archivePath build/App.xcarchive \
  -exportOptionsPlist ios/ExportOptions.plist \
  -exportPath build/
xcrun altool --upload-app --type ios \
  --file build/App.ipa \
  --username "$APPLE_ID" \
  --password "$APP_SPECIFIC_PASSWORD"
```

`ExportOptions.plist` needs `method = app-store-connect` and the team ID.
`$APP_SPECIFIC_PASSWORD` is generated at appleid.apple.com (not the Apple ID
password). `xcrun notarytool`/`altool` upload works; `Transporter.app` is the
GUI alternative.

### 4.5 TestFlight

After upload, the build appears in App Store Connect → TestFlight after
processing (10–30 min). Run a **2-week beta with 10–20 testers** (backlog
item 23) before the soft launch. Internal testers (up to 100, no review)
suffice; external testers trigger a lightweight beta review. Watch the
crash-free rate in Xcode Organizer.

### 4.6 Submit for review

In App Store Connect: attach the build to the 1.0 version, fill all metadata
(§2), upload screenshots (§3), complete the privacy questionnaire (§1.3) and age
rating (§2.5), fill App Review Information (contact details; **no demo account
needed** — there is no login), choose manual or automatic release. Soft launch
is **New Zealand + Canada only** for v1 (`docs/market-research.md` §4, backlog
item 24) — set availability accordingly.

---

## 5. Review-guideline compliance — prioritized risk register

From a reviewer-mindset audit of the current repo. Priorities:
**P0** = will reject / blocks submission · **P1** = common rejection trigger ·
**P2** = risky, fix before submit · **P3** = polish.

| # | Pri | Area | Finding | Guideline | Fix |
|---|-----|------|---------|-----------|-----|
| R1 | **P0** | Completeness | No iOS app exists — Capacitor not scaffolded (`ARCHITECTURE.md` §6). | 2.1 | Scaffold Capacitor (§4.1). Nothing else in this list matters until there is a build. |
| R2 | **P0** | Completeness / placeholders | `SettingsScreen.tsx` is a stub paragraph. A reviewer tapping the Settings tab sees a dead end. Restore Purchase, How to Play, About, and the privacy link are all missing. | 2.1, 3.1.1 | Build the real Settings surface (backlog item 19) **before submission**: How to Play, About, privacy-policy link, and — if IAP ships — Restore Purchase + Manage Subscription. |
| R3 | **P0** | IAP | Paywall + StoreKit are Phase 4, unbuilt. If the build ships premium-gated features with no working purchase/restore path, it is rejected. | 3.1.1 | Either (a) finish Phase 4 — StoreKit/RevenueCat with a working **Restore Purchases** button and a Manage Subscription link, paywall clearly stating price/recurrence/trial — **or** (b) ship v1 with *no* IAP and everything unlocked, add the paywall in 1.1. Decide deliberately; do not submit a half-wired paywall. |
| R4 | **P1** | IAP messaging | Paywall must show exact price, billing period, that subscriptions auto-renew, and link to Apple's subscription management. No "buy on our website" / external-payment links for digital unlocks. | 3.1.1, 3.1.2 | When building the paywall, include all subscription-disclosure copy and StoreKit-only purchase. ADR-0008's lifetime-vs-annual issue must be resolved first — a paywall where $6.99 lifetime dominates $24.99/yr annual is a UX/pricing flaw, not a rejection, but fix it before it ships. |
| R5 | **P1** | Privacy labels | App Store Connect privacy answers must exactly match runtime behaviour. Mimir's enabled/disabled state changes the truthful answer. | 5.1.1, 5.1.2 | Decide Mimir on/off for the production build (§1.1) and fill the labels (§1.3) to match. Add `PrivacyInfo.xcprivacy` (§1.2). |
| R6 | **P1** | Privacy policy | No privacy policy URL exists; one is required for every app. | 5.1.1 | Publish a privacy page on the brand domain (§1.4) before submitting. |
| R7 | **P1** | Metadata accuracy | `index.html` `<title>` is `tectonic-for-the-win`; `README.md` is the stock Vite template. Neither blocks review directly, but the title leaks into the WebView and looks like an unfinished app. | 2.3, 2.1 | Set a real `<title>`. Replace the README (does not affect review but is hygiene). |
| R8 | **P1** | App name | Brand undecided (ADR-0006). The store record cannot be created without a final, unique name; "Tectonic" alone collides with Keesing. | 2.3, 5.2 | Resolve ADR-0006 and run a trademark search before creating the App Store Connect record. |
| R9 | **P2** | Completeness | No native crash review possible yet (no shell). WebView apps can white-screen on asset-path errors — see the `base: '/tectonic-for-the-win/'` trap in §4.1. | 2.1 | After scaffolding, verify the WebView loads with `base: '/'`; test launch, offline, and a full solve on a real device. |
| R10 | **P2** | Min functionality | Capacitor apps get scrutinised under "is this just a website in a wrapper?" | 4.2 | Tectonic is a real offline game with a local engine, persistence, daily puzzles, and native chrome — it clears 4.2 comfortably. Make sure StatusBar/SafeArea/splash are configured so it feels native, not like a hosted page. |
| R11 | **P2** | Share / external content | The share artifact (backlog item 15) copies text/links. No UGC, no inbound content, no messaging — low risk. | 1.2 | No moderation needed. Just ensure shared URLs point to your own domain/app, not arbitrary user input. |
| R12 | **P3** | Accessibility / polish | Tutorial content is first-draft (backlog item 10 "needs a polish pass"); Dynamic Type / VoiceOver not yet verified. | 4.0 | Not a rejection blocker for a puzzle game, but polish the tutorial and do a Dynamic Type pass before paid acquisition. |

**The three that actually gate submission: R1, R2, R3.** There is no app, the
Settings tab dead-ends, and the monetization path is unbuilt. Everything else is
straightforward once those are resolved.

### Suggested App Review Notes (draft for App Store Connect)

> <BRAND> is a single-player Tectonic/Suguru logic-puzzle game. There is no
> account or login — all progress is stored locally on the device, so no demo
> credentials are needed.
>
> To see the core loop: launch the app, complete the short tutorial (or tap
> Skip), then start any puzzle from Home. Hints are available from the Hint
> button in the solving toolbar.
>
> [If IAP ships in v1:] Premium unlocks Hard/Expert difficulty and advanced
> hints. The paywall appears when tapping a locked difficulty or a
> contradiction-chain hint. To test purchases, use a Sandbox Apple ID; Restore
> Purchases is in Settings.
>
> The app works fully offline. Optional anonymous usage analytics is
> self-hosted and collects no personal data, no IP, and no identifiers tied to
> a person.

---

## 6. What Jonas must do himself (Apple-account work)

These need Jonas's Apple ID and a credit card / D-U-N-S — they cannot be done
from the codebase.

1. **Enrol in the Apple Developer Program** — $99/year, at
   developer.apple.com. As an individual, enrolment is usually same-day to a few
   days. Required before any signing, TestFlight, or App Store Connect app
   record. Do this first; it gates everything in §4.
2. **Decide the legal seller identity** — individual vs a registered company.
   A company needs a D-U-N-S number (free, can take ~2 weeks) and shows the
   company as the seller; an individual shows Jonas's legal name. Decide before
   enrolling — switching later is painful.
3. **Create the App Store Connect app record** — once ADR-0006 resolves the
   name: My Apps → New App → pick the bundle ID (must match Capacitor's
   `app.<brand>.tectonic`), set SKU, primary language.
4. **Register the App ID / bundle identifier** in the Developer portal (or let
   automatic signing create it) — must match the Capacitor `appId`.
5. **Generate certificates & provisioning** — automatic signing in Xcode does
   this, but it needs the active Developer Program membership and Jonas logged
   into his Apple ID in Xcode.
6. **Create an app-specific password** at appleid.apple.com — needed for
   `altool`/`notarytool`/Transporter uploads (`$APP_SPECIFIC_PASSWORD` in §4.4).
7. **Set up In-App Purchase products** (only if IAP ships in v1) — in App Store
   Connect, create the auto-renewable subscription group and SKUs per ADR-0008
   (monthly, annual, and possibly lifetime as a non-consumable). Each SKU needs
   a localized display name, price tier, and review screenshot. Sign the **Paid
   Applications agreement** and fill banking + tax info first — IAP will not
   function until that agreement is active. Create **Sandbox test accounts** for
   testing purchases.
8. **Resolve the open ADRs that block submission** — ADR-0006 (app name,
   blocks the store record), ADR-0007 (free/premium split, blocks the
   description and paywall), ADR-0008 (subscription vs lifetime, blocks IAP
   product setup). These are product decisions, not Apple-account tasks, but
   they gate the Apple-account steps above.
9. **Publish the privacy policy and support pages** on the brand domain (§1.4,
   §2.6) — acquire the domain (ADR-0006 calls for it) and put up the pages.
10. **Complete the age-rating questionnaire** in the App Store Connect record
    (§2.5) and the **App Privacy** section (§1.3).
11. **Recruit TestFlight testers** — 10–20 people for the 2-week beta
    (backlog item 23).

---

## 7. Pre-submission checklist

Condensed from the `release-spec` skill, scoped to this project.

**Build & technical**
- [ ] Capacitor scaffolded; `base` path fixed for the WebView (§4.1)
- [ ] Built with Xcode 26 / iOS 26 SDK (mandatory from 2026-04-28)
- [ ] App launches, solves a puzzle, and survives backgrounding on a real device
- [ ] Works fully offline
- [ ] `PrivacyInfo.xcprivacy` added and reconciled with Xcode's privacy report
- [ ] Real `<title>` in `index.html`; `1.0.0` / build `1` set
- [ ] StatusBar / SafeArea / splash screen configured

**Completeness (the P0s)**
- [ ] Settings tab is a real screen — How to Play, About, privacy link (R2)
- [ ] IAP decision made: full StoreKit path *or* no-IAP v1 (R3)
- [ ] If IAP ships: working Restore Purchases + Manage Subscription, compliant
      paywall copy (R3, R4)
- [ ] No placeholder/stub screens reachable by a reviewer

**Metadata & assets**
- [ ] App name finalized (ADR-0006), unique, ≤ 30 chars
- [ ] Subtitle, description, keywords, promo text entered
- [ ] 1024² app icon; 5–6 iPhone 6.9" screenshots (1320×2868)
- [ ] Support, marketing, and privacy URLs all live

**Privacy & legal**
- [ ] App Privacy questionnaire matches runtime (Mimir on/off decision made)
- [ ] Age rating completed → 4+
- [ ] Privacy policy reachable and accurate
- [ ] Trademark search done on the chosen name

**Process**
- [ ] Apple Developer Program active
- [ ] App Store Connect record created; bundle ID matches Capacitor
- [ ] Paid Applications agreement signed (if IAP)
- [ ] TestFlight beta run, crash-free rate healthy
- [ ] Soft-launch territories set (NZ + CA)

---

## 8. Skills reference

The reusable skills behind this guide, under
[`.claude/skills/`](../.claude/skills/):

| Skill | Use it for |
|-------|-----------|
| `christophacham-agent-skills-library-apple-appstore-reviewer` | Reviewer-mindset audit; the risk-register format in §5 |
| `alejandrolaborda-agent-tools-app-store-review` | Guideline quick-reference; top rejection reasons |
| `rshankras-release-spec` | The full release-spec template — privacy manifest, build config, submission steps |
| `ParthJadhav-app-store-screenshots` | Screenshot resolutions, the advertisement-not-documentation principle, the generator |
| `secondsky-claude-skills-app-store-deployment` | `xcodebuild` archive/export/upload commands; CI/CD |
| `wsbs20-claude-code-aso-skill-app-store-optimization` | Keyword scoring, metadata optimization, competitor analysis (`*.py` helpers) |
```

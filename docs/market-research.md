# Tectonic Puzzle App — Market Research & Business Plan

## 1. Market Opportunity

### Market Size
- **Logic puzzle games**: $12.4B (2025), projected $26.8B by 2034 (8.9% CAGR)
- **Mobile puzzle games**: $6.66B (2026), projected $14.45B by 2035 (9% CAGR)
- **Puzzle genre ranks 3rd** in mobile revenue behind Strategy and RPG — $8.8B in 2025 (+14.7% YoY)
- Logic puzzle downloads grew **19% YoY** in 2026
- 65%+ of mobile gamers play puzzle games
- Asia Pacific leads with $4.2B / 33.9% share

### The Tectonic/Suguru Niche is Wide Open
The competitive landscape is remarkably thin:

| App | Ratings | Downloads/mo | Model | Key Weakness |
|-----|---------|-------------|-------|-------------|
| Tectonic (Keesing) | 4.45/5, ~4,900 | ~1,100 (Android) | Credit-based (watch 3 ads per game) | Credits are expensive, recycled puzzles, ad reward bugs |
| Tectonic (Keesing Digital) | Low presence | Negligible | 6 difficulty levels, offline | Minimal market traction |
| Suguru (Uvarau) | Minimal | Negligible | 6,000 levels | No market presence |
| SUGURU Tectonic (B20Robots) | New (Sep 2025) | Negligible | v1.0 | No traction |

**No competitor has broken 5K ratings.** For comparison, Sudoku.com has ~1M downloads/month on US iOS alone. Easybrain's portfolio has 2.5B+ cumulative downloads and was acquired for **$1.2B** in Nov 2024.

### Common Complaints Across Puzzle Apps (Our Gaps to Fill)
- **Ads**: overwhelming frequency, 30-50s unskippable, gameplay shorter than ad duration
- **Hints**: require watching ads, unhelpful, no explanation of logic
- **Energy/paywall walls**: forced to pay or wait after a few puzzles
- **Difficulty progression**: no meaningful curve, random difficulty
- **Content recycling**: same puzzles reused with minor variations

**Our differentiators**: technique-gated difficulty (provably harder levels), interactive step-by-step contradiction hints (no other puzzle app does this), unlimited procedural generation, shareable puzzle links.

---

## 2. Monetization Strategy

### Pricing Benchmarks
| App | Model | Price |
|-----|-------|-------|
| NYT Games | Subscription | $39.99/yr or $4.25/mo |
| Sudoku.com (Easybrain) | Subscription | $4.99/mo or ~$60/yr |
| Monument Valley 2 | Premium | $4.99 one-time |
| Casual battle passes | Season pass | $4.99/season |

### Key Data Points
- **IAP payer rate**: 2-5% of installs; top-25% casual games reach ~28% among active players
- **Top first-purchase triggers**: in-game currency (18% iOS), limited-time sales (17%), ad removal (11%)
- **Subscriptions outperform one-time purchases**: one-time paid puzzle revenue was ~$0.05B vs $5.96B from IAP/subscriptions in 2022
- **US ARPPU** (paying users only): $48.21 in 2026
- **Ad revenue baseline**: puzzle games average 72.5 interstitials + 23.4 rewarded videos + 241.5 banner impressions per user

### Recommended Model: Freemium + Subscription

**Free tier** (maximize reach and retention):
- Easy + Medium difficulty, 5x5 grids
- Basic hints (naked single, hidden single)
- Daily puzzle with streak counter
- Ad-supported (tasteful interstitials between puzzles, not during)

**Premium subscription — "Tectonic Pro"**:
- **$3.99/mo or $24.99/yr** (positioned below NYT Games, accessible)
- Hard + Expert difficulty, 8x8 grids
- Interactive contradiction hints (stepper walkthrough)
- Unlimited puzzle generation
- Ad-free experience
- Full puzzle archive (daily puzzles older than 7 days)
- Stats dashboard (solve times, streaks, technique breakdown)

**Why subscription over one-time**: NYT Games and Sudoku.com both migrated from one-time ad-removal to subscriptions. Subscriptions increase LTV, fund ongoing content, and create retention loops. Annual discount drives commitment.

**Alternative: one-time "Pro" unlock at $6.99** as a fallback if subscription conversion is low — test both in soft launch.

### What to Gate (Ranked by Conversion Effectiveness)
1. **Ad removal** — top converter; players feel the pain first, then pay
2. **Daily puzzle archive** — last 7 days free, full archive paywalled (NYT's proven "windowed hardgate")
3. **Advanced hints** — contradiction stepper behind premium
4. **Difficulty tiers** — Hard/Expert behind premium
5. **Cosmetics/themes** — low conversion but good incremental ARPPU

### Regional Pricing
| Market | Pricing vs US | Notes |
|--------|--------------|-------|
| US, Canada, Australia | Baseline | Highest ARPU |
| Japan | Baseline | Top-3 market, strong puzzle culture |
| Europe (Eurozone) | 5-15% below US | Moderate spending |
| Southeast Asia | 40-60% below US | 2nd largest by downloads, low spending per user |
| LATAM | 40-60% below US | Growing market, price-sensitive |

---

## 3. Growth Strategy: Social & Viral Mechanics

### Tier 0 — Ship Immediately (No Server Required)

**Shareable solve summary**
Generate a spoiler-free visual showing how the player solved the puzzle — a mini colored grid (green = solved quickly, yellow = struggled, red = error) plus solve time. Compact enough for Twitter/iMessage/WhatsApp. This is the Wordle playbook: zero friction, visually distinctive, implicitly competitive.

**Challenge links**
Already partially built (share puzzle URL). Extend with: "I solved this Hard 5×5 in 2:14 — can you beat me?" framing. The recipient opens the exact same puzzle. Compare times client-side (encode challenger's time in the URL).

**Streak display**
Show consecutive-day solve streak prominently. Players screenshot and share streaks organically (proven by NYT Games, Duolingo).

### Tier 1 — Simple API Backend (REST + Postgres)

**Daily puzzle with global leaderboard**
One puzzle per day per difficulty. All players solve the same puzzle. Post-solve, show:
- Your time vs friends
- Percentile rank ("faster than 87% of players")
- Friend leaderboard (NYT-style)

**Friend system + async challenges**
- Add friends via share code or contacts
- Send specific puzzle challenges ("beat my time")
- Friend-pair streaks (Words With Friends model — "you and Alex: 14 days")

**Estimated infrastructure**: single API server, Postgres, auth (Sign in with Apple/Google). ~$50-100/mo at launch scale.

### Tier 2 — Real-Time Multiplayer (WebSocket, build after validating demand)

**Head-to-head race**
Same puzzle, separate boards, live progress indicator (% filled, not positions — no spoilers). First correct solve wins. 2-player duels or tournament brackets.

**Co-op solving**
Shared board, live cursors (each player has a color), divide-and-conquer. Works especially well on larger grids (8×8). Think Google Docs for puzzle solving.

**Technical stack**: WebSocket server (Colyseus or Socket.IO on Node.js), Redis for room state. More complex but proven architecture.

### What Worked vs. What Flopped

| Worked | Flopped |
|--------|---------|
| Spoiler-free share artifacts (Wordle) | Complex real-time co-op without simple onboarding |
| Friend-pair streaks (Words With Friends) | Generic global leaderboards ("rank #847,291") |
| Daily leaderboards among friends (NYT) | Social features as a gate to playing |
| Challenge links with embedded puzzle | Features requiring login before offering value |
| Percentile ranks ("faster than 87%") | Formal ELO systems in casual games |

### Viral Loop Sequencing
1. **Week 1 feature**: shareable solve summary + challenge links (zero server cost, maximum viral potential)
2. **Month 1**: daily puzzle + streak counter (drives retention, creates shareable moments)
3. **Month 2-3**: friend leaderboard + async challenges (Tier 1 backend)
4. **Month 4+**: head-to-head race mode if social metrics warrant it (Tier 2)

---

## 4. Launch Plan

### Phase 1: Soft Launch (Weeks 1-4)
- **Markets**: New Zealand + Canada (standard proxy markets for US)
- **Goal**: validate retention and IAP conversion before spending on acquisition
- **Key metrics to hit before proceeding**:

| Metric | Target | Kill threshold |
|--------|--------|---------------|
| Day 1 retention | > 40% | < 25% |
| Day 7 retention | > 20% | < 10% |
| IAP conversion | > 3% | < 1% |
| Avg puzzles/session | > 2 | < 1.2 |
| Share rate | > 5% of sessions | < 1% |

### Phase 2: English-Speaking Markets (Weeks 5-8)
- **Markets**: US, UK, Australia (already in from soft launch), Ireland
- **Acquisition**: Apple Search Ads on "puzzle game," "logic puzzle," "sudoku alternative" ($1-2 CPI)
- **Only spend on paid acquisition after soft launch proves retention**
- Launch web version simultaneously (drives organic discovery + shareable links)

### Phase 3: Europe + Japan (Months 3-4)
- Germany, Netherlands, Nordics — highest puzzle engagement per capita in Europe
- Japan — puzzle culture heartland (Nikoli invented both Sudoku and Suguru/Tectonic)
- Localization is light: UI has minimal text, mostly numbers
- Adjust IAP pricing per region

### Phase 4: Global + Multiplayer (Months 5+)
- LATAM, SEA, rest of Asia with regional pricing
- Launch Tier 1 social features (friend leaderboards, async challenges)
- Evaluate Tier 2 (real-time multiplayer) based on social engagement data

---

## 5. Key Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Low brand awareness ("what is Tectonic?") | Position as "the next puzzle after Sudoku" — ride Sudoku's coattails in ASO and marketing |
| Keesing owns "Tectonic" brand recognition | Consider a distinctive app name; Tectonic is a generic term, not trademarkable for puzzles |
| Subscription fatigue (users already pay for NYT, etc.) | Offer annual plan at $24.99 (significantly below NYT's $39.99); one-time unlock as fallback |
| Real-time multiplayer complexity | Don't build it until Tier 0/1 social features prove demand |
| Puzzle generation quality at scale | Already solved — procedural generation with technique gating ensures consistent difficulty |

---

## 6. Immediate Next Steps

1. **App name decision** — "Tectonic" works but verify no trademark conflicts; consider a subtitle for differentiation
2. **Daily puzzle system** — build the one-puzzle-per-day + streak mechanic (highest-impact retention feature)
3. **Shareable solve summary** — colored mini-grid + time, share-to-clipboard (highest-impact viral feature)
4. **Challenge link enhancement** — add challenger's time to the URL encoding so recipients see the time to beat
5. **Analytics integration** — lightweight event tracking from day one (puzzles started/completed, hints used, share taps, IAP taps)
6. **Soft launch prep** — App Store assets (icon, screenshots, description), TestFlight beta

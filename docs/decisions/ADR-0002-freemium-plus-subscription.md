# ADR-0002: Freemium + subscription monetization

**Date:** 2026-05-14
**Status:** Accepted
**Source:** [docs/market-research.md §2](../market-research.md)

## Context

Premium puzzle apps (NYT Games, Sudoku.com) have migrated from one-time ad-removal to subscription. Subscription dwarfs paid-once revenue in the genre (2022: $5.96B IAP/sub vs $0.05B paid puzzles). The current competitive set in our niche (Keesing Tectonic) runs an ad-credit model with widely-cited "too many ads, too expensive credits" complaints — an opening for a cleaner freemium + subscription play.

## Decision

The baseline monetization model for v1 is freemium with an optional Tectonic Pro subscription. Free tier carries the journey through Easy + Medium with tasteful interstitials. Premium unlocks Hard + Expert, contradiction-chain hints, technique-mastery stats, full daily-puzzle archive, and removes ads. Pricing target: **$3.99/mo or $24.99/yr** (per market research §2).

Exact feature split is `Proposed` in ADR-0007; subscription-vs-one-time pricing is `Proposed` in ADR-0008 and will be A/B-tested in soft launch.

## Consequences

- **Enables:** ongoing revenue to fund content (daily puzzles, themes, new techniques) and retention loops via annual commit; ad-free is the top first-purchase trigger in the genre.
- **Precludes:** pure one-time unlock as the v1 model (kept as a fallback if subscription conversion fails); pay-to-win difficulty unlocks (the journey gates difficulty, not the wallet).
- **Implies:** RevenueCat or StoreKit2 integration before soft launch; restore-purchase flow; receipt validation; a paywall surface designed in Open Design before code.

# ADR-0003: Phased launch — NZ/CA → US/UK/AU → EU/JP → global

**Date:** 2026-05-14
**Status:** Accepted
**Source:** [docs/market-research.md §4](../market-research.md)

## Context

Mobile gaming has well-established proxy markets — New Zealand and Canada are the standard soft-launch geos for English-speaking apps targeting US/UK. They carry comparable user behavior at lower acquisition cost, which lets us validate retention and IAP conversion before paid spend. Japan and the puzzle-strong Nordics warrant their own phase because puzzle culture there is mature and pricing is regionally distinct.

## Decision

Launch in four phases, with kill criteria from `PRD.md` §10 between each:

1. **Soft launch (weeks 1–4):** NZ + CA. Validate Day-1 retention (>40%), Day-7 retention (>20%), IAP conversion (>3%). No paid acquisition.
2. **English-speaking expansion (weeks 5–8):** US, UK, AU, IE. Apple Search Ads begin only after soft-launch metrics pass.
3. **Europe + Japan (months 3–4):** Germany, Netherlands, Nordics, Japan. Light localization, regional pricing.
4. **Global (months 5+):** LATAM, SEA, rest-of-Asia with regional pricing.

## Consequences

- **Enables:** kill-thresholds before paid spend; iteration on the journey before scale; regional pricing learnings.
- **Precludes:** day-one global launch; treating launch as a single event.
- **Implies:** App Store Connect availability list updates per phase; soft-launch metrics dashboard before Phase 1; localization plan before Phase 3.

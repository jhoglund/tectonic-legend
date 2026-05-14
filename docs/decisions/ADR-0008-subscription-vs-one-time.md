# ADR-0008: Subscription vs one-time unlock

**Date:** 2026-05-14
**Status:** Proposed
**Source:** [docs/market-research.md §2](../market-research.md)

## Context

The genre has migrated from one-time ad-removal to subscription (NYT Games, Sudoku.com). LTV is higher, content investment is funded ongoing, and annual plans create a commitment lock. But solo-developer puzzle apps with no fresh-content cadence (no editorial team, no daily-puzzle backlog) have a weak subscription story — players churn after a month because there's nothing new to retain them against. We have one ongoing-content lever (daily puzzles + archive) which is server-light but real.

## Decision (proposed)

Ship **subscription as the primary offer** at $3.99/mo or $24.99/yr. Show both prices on the paywall; annual is the default highlighted option (37% discount frames it as the "smart" choice and the data agrees).

**Run a one-time unlock A/B test in soft launch:** a $6.99 "Pro" lifetime purchase available alongside the subscription. If lifetime conversion + retention beats subscription LTV over a 4-week window, flip primary. If subscription wins, drop lifetime and keep monthly + annual.

## Consequences

- **Enables:** ongoing revenue if subscription wins (the better default for genre); a real fallback if it doesn't.
- **Precludes:** committing to either model without data; complicated multi-product paywalls long-term.
- **Implies:** RevenueCat or StoreKit2 configured with three SKUs initially (monthly, annual, lifetime); soft-launch analytics tracks which SKU each cohort converts on and retention by SKU; ADR-amended after soft launch with the winner.

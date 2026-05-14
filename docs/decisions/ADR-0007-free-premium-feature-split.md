# ADR-0007: Free vs premium feature split

**Date:** 2026-05-14
**Status:** Proposed
**Source:** [PRD.md §6](../../PRD.md), [docs/market-research.md §2](../market-research.md)

## Context

ADR-0002 commits to freemium + subscription. The remaining question is which features fence on which side of the paywall. Top conversion drivers in the genre are ad removal, advanced hints, and content-windowing (NYT-style 7-day archive gate). The risk is fencing the journey itself behind the paywall — the journey is the moat, and a player who hits a paywall before they've felt the curve will churn instead of convert.

## Decision (proposed)

| Feature | Free | Premium |
|---------|------|---------|
| Easy + Medium difficulty | ✅ | ✅ |
| Hard + Expert difficulty | — | ✅ |
| Tutorial puzzles | ✅ | ✅ |
| Naked + hidden single hints | ✅ | ✅ |
| Forced-move / pair-elimination hints | ✅ limited (3/day) | ✅ unlimited |
| Contradiction-chain hints | — | ✅ |
| Stats — solve performance | ✅ | ✅ |
| Stats — technique mastery | — | ✅ |
| Daily puzzle (today) | ✅ | ✅ |
| Daily puzzle archive (>7 days) | — | ✅ |
| Ad experience | Interstitial between puzzles | Ad-free |
| Cosmetics / themes | 1 default | Theme pack |

Player can reach **Confident** stage entirely on the free tier. The paywall first appears when the player taps a Hard difficulty (having earned it) or taps a contradiction-chain hint. The reasoning: by the time they're advanced enough to want Hard, they've felt the journey and the offer is "keep going" rather than "pay to start."

## Consequences

- **Enables:** the journey serves as both the product and the conversion engine — the moment a player has invested enough to unlock Hard, the paywall surfaces; gives free-tier players a complete loop (the curve from Newcomer to Confident) rather than a crippled demo.
- **Precludes:** locking technique-mastery as a *concept* away from free players (we show the chips; we just don't show the deep stats); locking Easy/Medium difficulty behind a paywall.
- **Implies:** the paywall surface must be designed for this exact trigger moment (post-mastery, pre-Hard) — the offer is "you've earned this; here's the next chapter." Open Design will iterate this specifically.

Validate the split in soft launch (NZ + CA). If IAP conversion < 1%, revisit the limit on free forced-move hints — that's the most likely place to loosen.

# ADR-0001: Difficulty progression as the primary differentiator

**Date:** 2026-05-14
**Status:** Accepted — refined by [ADR-0012](ADR-0012-difficulty-is-player-choice.md) (difficulty is no longer hard-gated; the progression journey stays as a guide and a badge)
**Source:** [specs/progression.md](../../specs/progression.md), [docs/market-research.md](../market-research.md)

## Context

The Tectonic / Suguru niche is competitively thin (top app has 4,900 ratings) and the dominant complaint across puzzle apps is "no meaningful difficulty curve." We already have a technique-aware hint engine (naked/hidden singles → forced moves → contradiction chains) and a difficulty-tiered generator. Other puzzle apps treat difficulty as a switch; we can treat it as a journey.

## Decision

Difficulty progression — a guided player journey from Newcomer → Beginner → Confident → Advanced → Master, with **technique mastery** as the unlock currency — is the product's primary differentiator. Every other v1 feature is sequenced behind whether it strengthens or distracts from this curve.

## Consequences

- **Enables:** a single, defensible "why this app" narrative for ASO, paid acquisition, and PR; technique-mastery stats as a premium feature; tutorial puzzles as a content category; structured onboarding.
- **Precludes:** a flat difficulty picker as the home screen; "unlock all" purchases that bypass the curve; cosmetics-led monetization as the v1 wedge.
- **Implies:** the player profile (stage, per-technique mastery counters) is a first-class data model, not a settings sidebar; tutorial puzzles are curated content with editorial cost; the hint engine's technique labels become a product-level contract, not just an engine internal.

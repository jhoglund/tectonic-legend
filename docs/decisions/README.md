# Decisions (ADRs)

Architecture, product, and business decisions that shape this app. Each ADR captures *why* a decision was made so future-Jonas can tell whether the rationale still holds.

## Format

Lightweight MADR variant. Each ADR is a short markdown file:

```markdown
# ADR-NNNN: Title

**Date:** YYYY-MM-DD
**Status:** Accepted | Proposed | Superseded by ADR-XXXX
**Source:** path/to/spec.md (if the decision is restated from a longer doc)

## Context
Why this decision came up. 2–4 sentences.

## Decision
The decision itself. 1–3 sentences.

## Consequences
- Enables: …
- Precludes: …
- Implies: …
```

## Conventions

- **Numbering:** zero-padded, monotonic. Never reuse a number, even for superseded ADRs.
- **Status:** start as `Accepted` for things already decided; `Proposed` for things under discussion. When superseded, update the old ADR's status — don't delete it.
- **Source:** if the decision is documented in more depth elsewhere (e.g. `docs/market-research.md`, `specs/progression.md`), link to it instead of restating.
- **Scope:** ADRs are for decisions with consequences beyond a single PR. Routine implementation choices belong in commit messages or PR descriptions.

## Index

| # | Title | Status |
|---|-------|--------|
| [0001](ADR-0001-difficulty-progression-as-differentiator.md) | Difficulty progression as the primary differentiator | Accepted |
| [0002](ADR-0002-freemium-plus-subscription.md) | Freemium + subscription monetization | Accepted |
| [0003](ADR-0003-phased-launch-rollout.md) | Phased launch — NZ/CA → US/UK/AU → EU/JP → global | Accepted |
| [0004](ADR-0004-tier-0-viral-before-backend.md) | Tier-0 viral mechanics before any backend | Accepted |
| [0005](ADR-0005-open-design-for-ux-iteration.md) | Open Design is the UX iteration surface | Accepted |
| [0006](ADR-0006-app-name.md) | App name | Proposed |
| [0007](ADR-0007-free-premium-feature-split.md) | Free vs premium feature split | Proposed |
| [0008](ADR-0008-subscription-vs-one-time.md) | Subscription vs one-time unlock | Proposed |
| [0009](ADR-0009-multiplayer-scope-v1.md) | Multiplayer scope for v1 | Proposed |
| [0010](ADR-0010-daily-puzzle-design.md) | Daily puzzle system design | Proposed |
| [0011](ADR-0011-v1-scope-triage.md) | v1 scope — prototype triaged against the PRD | Accepted |
| [0012](ADR-0012-difficulty-is-player-choice.md) | Difficulty is player-choice — stage gating disabled | Accepted |
| [0013](ADR-0013-supabase-as-the-backend.md) | Supabase as the backend platform | Accepted |

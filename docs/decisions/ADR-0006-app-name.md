# ADR-0006: App name — Tectonic Legend

**Date:** 2026-05-20
**Status:** Accepted
**Source:** [docs/market-research.md §5](../market-research.md); the "Legend" tier in [specs/progression.md](../../specs/progression.md).

## Context

"Tectonic" is generic and not trademark-defensible for puzzle apps. Keesing owns the puzzle-app association in the App Store (4,900 ratings, top result). A search for "Tectonic" returns Keesing first; a player who hears "try Tectonic" lands on a competitor by default. We need a name that wins the app-store search for our own players while still riding "Tectonic" / "Suguru" as discovery keywords.

The repo name (`tectonic-for-the-win`) is a working title and is not the brand.

## Decision

The app is **Tectonic Legend**.

- It keeps **Tectonic** as the lead noun — preserving the App Store / Google Play search keyword every player will type.
- It pairs it with **Legend**, which is both distinctive (the trademark surface is "Tectonic Legend," not the generic) and **product-true**: it names the top tier in the difficulty progression — a status the player earns, not buys ([progression.md](../../specs/progression.md); the "Legend" stage above Expert). The brand and the differentiator share the word.

Subtitle for ASO stays generic to keep the discovery surface: `Tectonic & Suguru Puzzles`.

## Consequences

- **Enables:** trademark filing on "Tectonic Legend"; ASO positioning that catches both "Tectonic" searchers (lead noun) and the aspirational framing (Legend); brand alignment with the mastery model that is the product differentiator ([ADR-0001](ADR-0001-difficulty-progression-as-differentiator.md)).
- **Implies, follow-up work not in this ADR:** trademark search and filing before App Store submission; logo + wordmark in Open Design; domain acquisition (`tectoniclegend.com` and similar); `package.json` `name`, the `<title>` tag in `index.html`, the in-app brand text in `SettingsScreen`, and the on-device app name (Capacitor `ios/`/`android/`) to be flipped from "Tectonic" to "Tectonic Legend" as a single rename PR; the repo can stay as `tectonic-for-the-win` until the App Store submission, or be renamed at the same time as the rename PR.
- **Precludes:** using "Tectonic" as the standalone brand. Other earlier candidates (Cage, Sumi) are dropped.

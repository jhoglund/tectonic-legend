# Swarm 2026-05-14 — 8 interaction-model variants

> Starting-point exploration. One visual treatment. Eight interaction models. The goal is to surface the *shape* of the product, not the *skin*.

**State:** prepared, awaiting 8 Open Design runs
**Brief (shared):** [BRIEF.md](BRIEF.md) — visual treatment, screens, brand voice, tokens, anti-patterns
**Per-variant prompt:** `<variant>/PROMPT.md`

## How to read this folder

Every variant produces the **same 8 screens** with the **same visual tokens** (color, type, radii, motion). What changes between variants is **how the player interacts with the app** — what's tappable, what's gestural, what's surfaced vs. hidden, where the journey lives, how the AI hint engine participates.

The exercise isn't to pick a winner — it's to *see what's possible* so the chosen direction is informed.

## Variants

| # | Slug | Angle | Hypothesis |
|---|------|-------|-----------|
| 01 | [`01-ios-native`](01-ios-native/) | Apple HIG playbook | If we ship as a native-feeling iOS app, every interaction follows Apple's defaults: tab bar, large titles, sheet modals, system gestures. Familiar = frictionless. |
| 02 | [`02-material-cross-platform`](02-material-cross-platform/) | Material 3, Android-parity | A contrast read: would the product feel different on Material? Useful for the eventual Android port and to test whether iOS-native is the right choice or just the default one. |
| 03 | [`03-gesture-first`](03-gesture-first/) | Chrome-less, swipes drive everything | Almost no visible UI. Swipes between screens, long-press to act, edge gestures for global nav. Inspired by Things 3, Mela, Bear. Tests "the puzzle is the surface". |
| 04 | [`04-conversational`](04-conversational/) | Chat / AI-native; hint engine as voice | The hint engine becomes a conversational presence. Every screen has a "talk to the engine" affordance. Inspired by Anthropic's native apps. Tests "AI is the surface". |
| 05 | [`05-console-power-user`](05-console-power-user/) | Linear-density, keyboard-feel | Dense info, every shortcut visible, command palette as primary nav. Pro-tool vibe. Tests "what if we built it for the player who's already a Master". |
| 06 | [`06-editorial`](06-editorial/) | Text-led, NYT-Press feel | Slow reading. Large type, pull-quotes, generous whitespace. The puzzle is a chapter, not the whole book. Inspired by Stripe Press, Are.na editorial, NYT Games homepage. |
| 07 | [`07-game-progression`](07-game-progression/) | Journey-forward, map-like | Leans hard into the differentiator. Visible stage progression, map-style journey view. Without crossing into Duolingo-confetti territory. |
| 08 | [`08-daily-ritual`](08-daily-ritual/) | The daily puzzle IS the app | Every other screen orbits around the daily. Open the app → today's puzzle. Stats and progression are secondary surfaces. Tests "what if NYT Games' daily anchor is the only one we need". |

## Workflow

1. Each variant subfolder has its own `BRIEF.md` (copy of the shared brief) + `PROMPT.md` (variant-specific angle).
2. In Open Design at `http://open-design.test`, **New Project → Import folder** for each variant subfolder.
3. Recommended order: start with one (try **01-ios-native** as your baseline read) → review → if useful, run the rest in batches of 2–3.
4. Each session: `@BRIEF.md @PROMPT.md @frontend-skill` in the composer, then send.
5. Variants land directly in their subfolders. `git add prototypes/swarm-2026-05-14/<NN-slug>/ && git commit` when each is done.

After all 8 (or however many) have produced output, write a `STATUS.md` here noting which variant(s) are the direction or hybrid, and Claude Code ports the chosen direction into `src/`.

## Cost note

Eight agents producing 8 screens each is ~64 full prototype renders. Run sequentially or in pairs if you want to limit token spend; OD doesn't enforce a budget cap.

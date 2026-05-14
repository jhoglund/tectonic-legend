# Tectonic — Design Brief

> Context pack for Open Design (`http://open-design.test`). Drop this file in at the start of a session to give the design surface everything it needs to explore UX.

**Last updated:** 2026-05-14

---

## 1. Who we are

This app is a **Tectonic / Suguru puzzle game** with a guided journey from naked singles to contradiction chains. The differentiator is the journey, not the puzzles themselves. Players progress from `Newcomer → Beginner → Confident → Advanced → Master` by demonstrating that they've mastered a technique — not by paying or by clicking a difficulty switch.

**Brand voice:** quiet, focused, adult. Warm but never playful. Confident but never loud. The product feels like a cool desk lamp, not a carnival.

**Working name:** Tectonic (placeholder; the real name is being decided in [ADR-0006](../docs/decisions/ADR-0006-app-name.md)).

---

## 2. The player journey (this drives everything)

```
   Newcomer ──▶ Beginner ──▶ Confident ──▶ Advanced ──▶ Master
   tutorial      Easy         Medium        Hard          Expert
   onboarding    naked        hidden        forced        contradiction
                 singles      singles       moves         chains
```

Each stage transition is **earned by demonstrating technique mastery** (see `specs/progression.md` §3). Transitions are celebrated with a single full-screen card — quiet, not confetti.

The UX of each stage feels subtly different:

| Stage | UX flavor |
|-------|-----------|
| Newcomer | Guided. Tutorials with forced hints. The board is small and the explanation is large. |
| Beginner | Spacious. One puzzle visible at a time. Low-density home screen. |
| Confident | Slightly denser. "Try Medium today?" prompts appear in the home slot. |
| Advanced | Tool-feel. Stats are surfaced more prominently. Mastery chips earn more space. |
| Master | Compressed. The player knows what they're doing. Get out of the way. |

This *adaptive density* is one of the open design questions for exploration.

---

## 3. Design principles

| # | Principle | What it means for design |
|---|-----------|--------------------------|
| **P1** | **The journey is the moat** | Every surface should reinforce the player's sense of progress. No design that breaks the journey. |
| **P2** | **Quiet by default, loud when it matters** | Stage-ups and mastery moments stand out *because* the rest of the UI is calm. |
| **P3** | **Show the technique, never lecture** | Mastery chips and inline hint labels — never tooltips or modals explaining how to play. |
| **P4** | **No broken-streak punishment** | Resets reframe to "Resume from {date}". Gaps are invitations. |
| **P5** | **One screen, one decision** | The home screen has one anchor (today's puzzle). Settings is a stack, not a grid. |

Anti-principles (do not design like these):
- Confetti / streak-fire / overdone celebration
- "Try harder!" copy
- Modal interrupts during solving
- Numeric mastery scores
- Difficulty as a tab bar

---

## 4. Design tokens

Pasted from [`specs/design-tokens.md`](../specs/design-tokens.md). Treat as the constraint set — no arbitrary hex codes or pixel sizes.

### Brand (cool blue-green — "thinking", not "marketing")
| Token | Light | Dark |
|-------|-------|------|
| `brand-600` | `#0891b2` (primary) | `#06b6d4` |
| `brand-500` | `#06b6d4` | `#22d3ee` |
| `brand-100` | `#cffafe` | `#155057` |

### Surfaces
| Token | Light | Dark |
|-------|-------|------|
| `surface` | `#fafafa` | `#0a0a0a` |
| `surface-board` | `#ffffff` | `#0f1419` |
| `surface-cell` | `#ffffff` | `#1a1f24` |
| `surface-cell-selected` | `#e0f7fa` | `#164e5b` |

### Hint chain (the contradiction stepper — semantic, do not substitute)
| Token | Hex | Used for |
|-------|-----|----------|
| `cell-assumption` | `#f59e0b` (amber) | "What if this cell is X?" |
| `cell-deduction` | `#3b82f6` (blue) | Logical consequence |
| `cell-contradiction` | `#dc2626` (red) | Proves the assumption wrong |
| `cell-conclusion` | `#10b981` (emerald) | The proven move |

### Typography
- **UI:** Inter (variable). Weights 400 / 500 / 600. **No 700** — it reads loud.
- **Cell numerals:** JetBrains Mono, tabular numbers, weight 500.

### Radius
- `radius-cell` 4px, `radius-card` 12px, `radius-board` 16px, `radius-modal` 20px, `radius-chip` 999px.

### Motion
- `motion-fast` 120ms, `motion-base` 200ms, `motion-slow` 400ms cubic-bezier(0.2, 0.8, 0.2, 1).
- **No bouncy springs.** No overshoot. Adult voice.

Full token list with dark-mode variants: [`specs/design-tokens.md`](../specs/design-tokens.md).

---

## 5. Locked-in decisions (don't re-litigate)

- **The board is the hero.** It occupies the visual center on every solve surface. Controls sit below, not around.
- **Hint chain rings stay on cells, not in side panels.** Step-through happens via a stepper below the board.
- **Contradiction-chain colors are fixed** — amber/blue/red/emerald per the token spec. No re-coloring per theme.
- **Tabular numerals everywhere.** No proportional digits in cell values, ever.
- **Mobile-first.** Portrait. Max-width container. Desktop is a courtesy view.
- **Native iOS feel.** Safe areas respected. Haptics on cell select and solve. No web-y scroll bounces.

---

## 6. Current state

Implemented:
- Solve view with board, cell selection, number input, notes mode, errors, hint mode.
- Difficulty switcher (Easy / Medium / Hard / Expert) — open switcher, no stage gating.
- Contradiction stepper with ghost values cascading.
- Shareable URL via base64url hash.
- 5×5 and 8×8 grid sizes.

Not implemented (and not yet designed):
- Home screen (currently the solve view *is* the home).
- Player profile / stage / mastery counters / stats.
- Tutorial puzzles + onboarding.
- Stage-up cards.
- Mastery chips.
- Paywall.
- Daily puzzle anchor.
- Share artifact (colored mini-grid + time).
- App icon.

Screenshots of the running app will be attached separately.

---

## 7. Open questions for design to explore (per session)

**Pick one or two per session — the brief should narrow.**

1. **Home screen anchor.** When the player opens the app, what's the one thing on screen? Today's daily puzzle? A "Resume" card? A stage indicator?
2. **Stage-up celebration.** One full-screen card per stage transition. How does it feel? Read like a postcard? A whisper? A title card from a film?
3. **Mastery chip.** Three states — `learning · familiar · mastered`. Tiny. Appears post-solve. How does the mastered state visually distinguish without screaming?
4. **Paywall trigger.** Specifically: the moment a Confident player taps Hard for the first time. The offer is *"you've earned this, keep going"*. What does that surface look like?
5. **Share artifact.** Spoiler-free colored mini-grid + solve time. Square-ish for iMessage / Twitter. How do we color cells without revealing the solution? (Suggested: green/yellow/red per cell based on hint usage and error count, not values.)
6. **Adaptive density.** How does the same Stats surface feel different in Beginner vs Master? Whitespace? Number of chips visible by default? Hierarchy of sections?
7. **Re-entry from lapse.** First open after 7+ days. Warm, not punishing.
8. **Onboarding shape.** Three tutorial puzzles + a welcome. Vertical scroll-stack? Card stack? One-screen-each?

---

## 8. Things design should avoid

- **Emoji-heavy moods.** The product is adult.
- **Streak fire 🔥 / confetti / explosions.** P2 — quiet by default.
- **Numeric mastery score.** Chips only.
- **"Day 47 of 60" framing.** Verdict-style. Use trends.
- **Modal interrupts during a solve.** The board is sacred during solving.
- **Arbitrary colors outside the token set.** Especially: don't recolor the hint chain.
- **Bouncy springs / overshoot.** Calm motion.

---

## 9. Output expectations

For each session, produce:
- 2–4 variants of the requested surface (different directions, not minor tweaks).
- Each as an HTML file (`<variant-slug>/index.html`) that uses the tokens above.
- A side-by-side index at `<session-folder>/index.html` if there are multiple variants.
- A short `STATUS.md` capturing the brief and the variants produced.

Once Jonas picks a direction, Claude Code reads it and reproduces it in `src/`. The prototype stays as the permanent reference. See [`specs/design-workflow.md`](../specs/design-workflow.md) for the full loop.

---

## 10. How to run the session (concrete recipe)

The session folder for this round is created *before* opening Open Design and imported into it as a project, so OD writes its artifacts directly into the repo:

```bash
# 1. Make the session folder (slug = topic, or date for broad exploration)
mkdir -p prototypes/<slug>

# 2. Optionally snapshot this brief so the session has a frozen copy
cp prototypes/DESIGN-BRIEF.md prototypes/<slug>/BRIEF.md
# Trim §7 down to the surface(s) for this session
```

Then in Open Design at `http://open-design.test`:

1. **New Project → Import folder** (web: paste absolute path; desktop: file picker).
2. Path: `/Users/jonashoglund/dev/tectonic-for-the-win/prototypes/<slug>`.
3. Skill: `mobile-app` for in-app surfaces, `web-prototype` for share artifact, `magazine-poster` for App Store screenshots.
4. Direction: Modern Minimal or Editorial Monocle. Avoid Brutalist Experimental — wrong voice.
5. Paste this brief (or the trimmed `BRIEF.md`) into the prompt.

Everything OD generates lands directly under `prototypes/<slug>/`. When the round is done, `git add prototypes/<slug>/ && git commit`, then ping Claude Code with the slug + chosen variant — e.g. *"`prototypes/stage-up-moments-v1/`, variant 02 is the direction"*. Claude Code then reads it, ports the visual decisions into `src/`, and updates `STATUS.md` → `graduated → <sha>`.

Full workflow contract: [`specs/design-workflow.md`](../specs/design-workflow.md).

---

*Brief revision history lives in git. When the brief changes shape (not just adds a session), bump the "Last updated" date.*

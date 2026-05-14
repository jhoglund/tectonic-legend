# Tectonic — Design Brief — Stage-up moments

> Frozen snapshot for the **stage-up moments** session. The always-current brief is at `../DESIGN-BRIEF.md`.

**Session:** `2026-05-14-stage-up-moments`
**Surface:** the single full-screen card that appears when a player crosses a stage threshold (4 cards total — one per transition)
**Skill:** `mobile-app`
**Direction:** Modern Minimal or Editorial Monocle

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

## 7. This session's focus: stage-up moments

When a player demonstrates mastery and earns a new stage, **a single full-screen card** appears before the next puzzle. Tap to dismiss; never repeats for that stage. The card is the only celebration — no confetti, no popup chain, no fireworks.

There are four cards to design. Each marks a different transition:

| Card | Trigger | Copy (working draft — design can refine) |
|------|---------|------------------------------------------|
| **1. Beginner** | Completed 3 tutorial puzzles | "You're a Beginner now. <br> Easy puzzles are unlocked. <br> Easy asks you to find what a cell *must* hold." |
| **2. Confident** | `naked-single` mastered | "You're a Confident player now. <br> Medium puzzles are unlocked. <br> Medium asks where a value *can* go, not just what a cell must hold." |
| **3. Advanced** | `hidden-single` mastered | "You're an Advanced player now. <br> Hard puzzles are unlocked. <br> Hard asks you to read a cell's neighborhood — what other cells force this one." |
| **4. Master** | `forced-move` mastered + 5 Hard solves | "You're a Master now. <br> Expert puzzles are unlocked. <br> Expert puzzles aren't solvable by direct logic alone — you'll need to follow a contradiction chain." |

### What the design needs to figure out

**Tone.** Postcard? Title card from a film? A whisper? A small ceremony? The brand voice is *quiet, focused, adult* — these should land like a quiet "well done", not a confetti burst. Reference brand voice from §3 and anti-patterns from §8.

**Variation across the 4 cards.** Should all four cards share an identical structure (same layout, same vertical rhythm, only copy varies)? Or should each transition feel slightly different — the Beginner card warm and welcoming, the Master card sparse and confident? Show at least one variant of each direction.

**Use of the board.** Could the card use a frozen puzzle state in the background — a faint, blurred Tectonic grid behind the text — as a visual anchor? Or is type-only cleaner? Try both.

**Type-only vs. type + ornament.** A small mark / wordmark / tiny icon? Or zero ornament — just the type? The hint-chain palette (amber / blue / red / emerald) is reserved for solving; do NOT borrow it for celebration. Brand-600 is fine. Single accent is fine.

**Dismiss affordance.** One-tap to dismiss the whole screen, OR an explicit "Continue" button at the bottom? Either is OK; test which reads more like a small ceremony.

**Stage indicator.** Should the card show a small stage indicator (e.g., 1-of-4 dots, or a labeled chip "Beginner → Confident") to give the player a sense of journey position? Optional — try with and without.

### Variants requested

Produce 2–4 variant directions. Each variant should show **all four cards** so the tonal consistency across transitions can be evaluated. The side-by-side `index.html` should let me flip between the 4 cards within each variant and compare variants against each other.

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

## 10. How to run this session

The session folder already exists at `prototypes/2026-05-14-stage-up-moments/`. Open Design will write directly into it.

In Open Design at `http://open-design.test`:

1. **New Project → Import folder** (web: paste absolute path; desktop: file picker).
2. Path: `/Users/jonashoglund/dev/tectonic-for-the-win/prototypes/2026-05-14-stage-up-moments`.
3. Skill: `mobile-app`.
4. Direction: pick one of **Modern Minimal** or **Editorial Monocle**. Avoid Brutalist Experimental — wrong voice for this product.
5. Paste this brief into the prompt.

Once Open Design has produced 2–4 variants, `git add prototypes/2026-05-14-stage-up-moments/ && git commit`, then send Claude Code the chosen variant — e.g. *"variant 02 is the direction"* — and Claude Code will port it into `src/`.

Full workflow contract: [`specs/design-workflow.md`](../specs/design-workflow.md).

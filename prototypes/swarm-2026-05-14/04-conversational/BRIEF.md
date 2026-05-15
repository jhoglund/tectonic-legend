# Tectonic — Swarm Brief

> Shared context pack for all 8 swarm variants. Same visual treatment across every variant. The *PROMPT.md* sitting next to this file tells you which interaction model angle to take.

**Session:** `swarm-2026-05-14`
**Skill:** `@frontend-skill`
**You are one of 8 agents.** Your angle is in `PROMPT.md` next to this file. Read it after this brief.

---

## 1. The product

A **Tectonic / Suguru puzzle game** with a guided journey from naked singles to contradiction chains. The differentiator is the journey, not the puzzles themselves. Players progress through five stages — `Newcomer → Beginner → Confident → Advanced → Master` — by demonstrating that they've mastered a technique, not by paying or by clicking a difficulty switch.

The hint engine already teaches solving techniques (naked single → hidden single → forced moves → contradiction chains). Each technique fired during a solve emits a technique label. The product wraps this into a learning curve the player can feel.

**Working name:** Tectonic (placeholder; the real name is being decided).

---

## 2. Brand voice

**Quiet. Focused. Adult.** Warm but never playful. Confident but never loud. The product feels like a cool desk lamp, not a carnival.

Do not produce: confetti, 🔥 streak fire, exclamation marks in copy, bouncy springs, neon, emoji-heavy moods, "Try harder!" motivational language, or anything that reads like a freemium mobile game from 2015.

Adjacent reference brands: Linear, Things 3, NYT Games, Mela, Calm, Stripe Press, Are.na. *Not*: Duolingo, Candy Crush, Peak, Lumosity.

---

## 3. The player journey (everything bends around this)

```
   Newcomer ──▶ Beginner ──▶ Confident ──▶ Advanced ──▶ Master
   tutorial      Easy         Medium        Hard          Expert
   onboarding    naked        hidden        forced        contradiction
                 singles      singles       moves         chains
```

Each stage transition is **earned by demonstrating technique mastery**. Transitions are celebrated with a single full-screen card — quiet, not confetti.

A technique is **mastered** when the player has used it self-applied 8 times across at least 3 distinct puzzles. Mastery is the unlock currency.

---

## 4. Design tokens (constraint set — do not invent values)

### Brand (cool blue-green — "thinking", not "marketing")
| Token | Light | Dark |
|-------|-------|------|
| `brand-600` | `#0891b2` (primary) | `#06b6d4` |
| `brand-500` | `#06b6d4` | `#22d3ee` |
| `brand-100` | `#cffafe` | `#155057` |
| `brand-50` | `#ecfeff` | `#0e2a30` |

### Surfaces
| Token | Light | Dark |
|-------|-------|------|
| `surface` | `#fafafa` | `#0a0a0a` |
| `surface-elevated` | `#ffffff` | `#171717` |
| `surface-board` | `#ffffff` | `#0f1419` |
| `surface-cell` | `#ffffff` | `#1a1f24` |
| `surface-cell-selected` | `#e0f7fa` | `#164e5b` |
| `border` | `#e5e5e5` | `#2a2a2a` |
| `border-cage` | `#a3a3a3` | `#525252` |

### Text
| Token | Light | Dark |
|-------|-------|------|
| `text-primary` | `#0a0a0a` | `#fafafa` |
| `text-secondary` | `#525252` | `#a3a3a3` |
| `text-tertiary` | `#a3a3a3` | `#737373` |
| `text-on-brand` | `#ffffff` | `#0a0a0a` |

### Hint chain (RESERVED — only used during solving; do not borrow for other surfaces)
| Token | Hex | Used for |
|-------|-----|----------|
| `cell-assumption` | `#f59e0b` (amber) | "What if this cell is X?" |
| `cell-deduction` | `#3b82f6` (blue) | Logical consequence |
| `cell-contradiction` | `#dc2626` (red) | Proves the assumption wrong |
| `cell-conclusion` | `#10b981` (emerald) | The proven move |

### Status
| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `success` | `#10b981` | `#34d399` | Solve, mastery achieved |
| `warning` | `#f59e0b` | `#fbbf24` | Hints remaining low |
| `danger` | `#dc2626` | `#f87171` | Errors only |

### Typography
- **UI:** Inter (variable). Weights 400 / 500 / 600 only. **No 700** — it reads loud.
- **Cell numerals:** JetBrains Mono. **Tabular numerals everywhere.** `font-variant-numeric: tabular-nums`.
- Scale: `text-display` 32/36 · `text-heading` 24/30 · `text-subheading` 18/24 · `text-body` 16/24 · `text-small` 14/20 · `text-caption` 12/16 · `text-cell` 24/1 (5×5) or 18/1 (8×8) · `text-cell-note` 10/1.

### Radius
- `radius-cell` 4px · `radius-button` 8px · `radius-chip` 999px · `radius-card` 12px · `radius-board` 16px · `radius-modal` 20px.

### Spacing
- 4px base. `space-1` 4 · `space-2` 8 · `space-3` 12 · `space-4` 16 · `space-6` 24 · `space-8` 32 · `space-12` 48 · `space-16` 64.

### Motion
- `motion-fast` 120ms ease-out · `motion-base` 200ms ease-out · `motion-slow` 400ms cubic-bezier(0.2, 0.8, 0.2, 1).
- **No bouncy springs. No overshoot.** Adult voice.

### Elevation
- `shadow-cell` `0 1px 2px rgba(0,0,0,0.04)` · `shadow-card` `0 2px 8px rgba(0,0,0,0.06)` · `shadow-modal` `0 12px 40px rgba(0,0,0,0.18)`.

---

## 5. Locked-in visual decisions (apply to all variants regardless of angle)

- The **board** is the visual hero on the solving screen. Other surfaces may de-emphasize it but never compete with it on the solving screen.
- **Hint chain rings stay on cells, not in side panels.** Step-through happens via a stepper below the board.
- **Contradiction-chain colors are fixed** — amber/blue/red/emerald per the token spec. No re-coloring per variant.
- **Tabular numerals everywhere.** No proportional digits in cell values, ever.
- **Mobile-first portrait.** Max-width container. Desktop is a courtesy view.
- **Safe areas respected** (iOS notch / Dynamic Island / home indicator).

These are the visual constants. Your variant differs in *interaction model*, not in *visual identity*.

---

## 6. The eight screens every variant must produce

Each variant produces the same 8 screens. The angle (in `PROMPT.md`) tells you *how* the player gets between them and how each one is structured — not what tokens to use.

| # | Screen | What's on it |
|---|--------|--------------|
| 1 | **Auth** | Sign in / sign up (one screen with toggle, or two screens; Apple / Google / email). |
| 2 | **Onboarding** | Newcomer welcome + entry into the first tutorial puzzle. |
| 3 | **Home** | Post-auth landing. The daily puzzle is here. A "Resume" affordance if a game is in progress. The current stage indicator. Entry to Practice, Stats. |
| 4 | **New game** | Difficulty + grid size picker. Locked difficulties show what unlocks them (technique to master). |
| 5 | **Solving** | The board with cell selection, number input, notes mode, hint mode. The contradiction stepper (when a contradiction hint fires) sits below the board. The technique-label chip surfaces post-hint. |
| 6 | **Solved** | Post-solve summary: solve time, technique histogram, mastery chips earned, share button (Tier-0 viral artifact). "Next" CTA. |
| 7 | **Stats** | Three sections: solve performance (best times per difficulty), technique mastery (chips), streaks (gently — never punished). |
| 8 | **Stage-up** | One full-screen card representing a stage transition. Use the **Confident → Advanced** transition as the example. Copy: *"You're an Advanced player now. Hard puzzles are unlocked. Hard asks you to read a cell's neighborhood — what other cells force this one."* |

---

## 7. Anti-patterns (do not produce, regardless of angle)

- Emoji-heavy moods · streak fire / confetti / explosions · numeric mastery score · "Day 47 of 60" verdict framing · modal interrupts during a solve · arbitrary colors outside the token set · bouncy springs / overshoot · global leaderboards (`rank #847,291`-style) · ad placeholders inside the solving surface.

---

## 8. Output expectations

For your variant:

- Produce **all 8 screens** as separate HTML files in this folder (`01-auth.html`, `02-onboarding.html`, … `08-stage-up.html`).
- An **`index.html`** at the root of this folder that lets a reviewer flip between the 8 screens (a sticky vertical or horizontal nav of screen names is fine).
- A short **`STATUS.md`** capturing: which angle you took, which design direction you picked (Modern Minimal vs. Editorial Monocle vs. other), 3–5 sentences on the interaction-model decisions you made, and any open questions.

Use the same tokens, type, and brand voice as every other variant. The *only* thing that varies between variants is interaction model and screen composition.

---

## 9. Now read `PROMPT.md`

Your angle is in `PROMPT.md` in this folder. It tells you which interaction model to embody and what each of the 8 screens should look like under that lens.

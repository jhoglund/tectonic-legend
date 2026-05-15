# Design tokens

> Canonical visual values. Source of truth for both `src/index.css` and any Open Design brief.

**Last updated:** 2026-05-15

When changing a token:
1. Update the value in `src/index.css` (both light and dark mode).
2. Update the value in this file.
3. Update any Open Design brief that references it.

No hardcoded hex colors in `src/`. No arbitrary pixel sizes. Semantic tokens over palette tokens (`cell-assumption`, not `bg-amber-400`).

---

## 1. Color — brand

The product feels like a cool, focused puzzle space — not a warm consumer app. The brand color is a calm blue-green that reads as "thinking", not "marketing".

| Token | Light | Dark |
|-------|-------|------|
| `brand-50` | `#ecfeff` | `#0e2a30` |
| `brand-100` | `#cffafe` | `#155057` |
| `brand-500` | `#06b6d4` | `#22d3ee` |
| `brand-600` | `#0891b2` ← primary brand | `#06b6d4` ← primary brand (dark) |
| `brand-700` | `#0e7490` | `#0e7490` |

## 2. Color — surfaces

| Token | Light | Dark |
|-------|-------|------|
| `surface` | `#fafafa` | `#0a0a0a` |
| `surface-elevated` | `#ffffff` | `#171717` |
| `surface-board` | `#ffffff` | `#0f1419` |
| `surface-cell` | `#ffffff` | `#1a1f24` |
| `surface-cell-clue` | `#f5f5f5` | `#262626` |
| `surface-cell-selected` | `#e0f7fa` | `#164e5b` |
| `border` | `#e5e5e5` | `#2a2a2a` |

> `border-cage` is defined under §2a (the board palette) — it is an OKLCH neutral.

## 2a. Board & cage colors

Finalized 2026-05-15 from Open Design palette exploration. The board's cells are tinted by **cage** — each cage (cell group) gets one of five fills, graph-coloured so no two adjacent cages share a colour. Values are OKLCH; dark mode is derived by **lightness −60, chroma ×0.7**. Bound in [`src/index.css`](../src/index.css); board cells set them per-cell via the `.cage-1`…`.cage-5` classes.

### Cage fills

| Token | Light | Dark |
|-------|-------|------|
| `cage-1` | `oklch(96.5% 0.074 88)` | `oklch(36.5% 0.052 88)` |
| `cage-2` | `oklch(92% 0.036 0)` | `oklch(32% 0.025 0)` |
| `cage-3` | `oklch(88% 0.038 256)` | `oklch(28% 0.027 256)` |
| `cage-4` | `oklch(88.5% 0.048 180)` | `oklch(28.5% 0.034 180)` |
| `cage-5` | `oklch(96.5% 0.006 83)` | `oklch(36.5% 0.004 83)` |

A cell's cage fill supersedes `surface-cell` on the board. `surface-cell` remains the cell background for non-board contexts (share-artifact thumbnails, etc.).

### Borders

| Token | Value | Usage |
|-------|-------|-------|
| `border-cage` | `oklch(54% 0 0)` | The 2px line between two different cages. Neutral — same in both modes. |
| `border-cage-width` | `2px` | Cage-boundary line width |
| `border-inner-width` | `1px` | Within-cage cell-to-cell line width |
| `border-inner-target-l` | `0.66` | Lightness the inner border is pulled toward |
| `border-inner-blend` | `0.40` | How far to pull (0 = invisible, 1 = full shift) |
| `cage-N-inner` | derived | `cage-N` with lightness blended toward `border-inner-target-l` by `border-inner-blend`; hue + chroma preserved. Computed in CSS via relative color syntax, so it re-resolves per light/dark. |
| `cage-N-player` | derived | `cage-N` taken to a fixed contrasting lightness (`0.42` light / `0.85` dark) with chroma doubled, hue preserved — the ink for player-entered values. Exposed per cell as `--cell-player` by the `.cage-N` class. |

The board container paints the outer frame; each cell paints only its top + left edge, so every internal line is drawn exactly once at the intended width.

### Cell value text

| Token | Light | Dark |
|-------|-------|------|
| `cell-text` | `oklch(4% 0 0)` | `oklch(96% 0 0)` |

Clue values use `cell-text` (bold). Player-entered values use `cell-player` — a darker, more saturated shade of that cell's own cage fill (`cage-N-player`, §2) — at medium weight, so given numbers and the player's own entries read clearly apart on any cage colour. Error values override to the danger colour.

## 3. Color — text

| Token | Light | Dark |
|-------|-------|------|
| `text-primary` | `#0a0a0a` | `#fafafa` |
| `text-secondary` | `#525252` | `#a3a3a3` |
| `text-tertiary` | `#a3a3a3` | `#737373` |
| `text-on-brand` | `#ffffff` | `#0a0a0a` |
| `text-cell-clue` | `#525252` | `#a3a3a3` |
| `text-cell-error` | `#dc2626` | `#f87171` |
| `text-ghost-value` | `#a3a3a3` | `#737373` |

## 4. Color — hint chain (the contradiction stepper)

Used by `Cell.tsx` overlay rings. Semantic; do not substitute.

| Token | Value (light) | Used for |
|-------|---------------|----------|
| `cell-assumption` | `#f59e0b` (amber-500) | "What if this cell is X?" — the hypothesis under test |
| `cell-deduction` | `#3b82f6` (blue-500) | Logical consequence of the assumption |
| `cell-contradiction` | `#dc2626` (red-600) | The cell that proves the assumption wrong |
| `cell-conclusion` | `#10b981` (emerald-500) | The final, proven move |

Dark mode lightens each by ~15% to maintain contrast on a dark board.

## 5. Color — status

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `success` | `#10b981` | `#34d399` | Solve, mastery achieved |
| `warning` | `#f59e0b` | `#fbbf24` | Hints remaining low |
| `danger` | `#dc2626` | `#f87171` | Errors only |
| `info` | `#3b82f6` | `#60a5fa` | Neutral info |

## 6. Typography

- **Font family:** `Inter` (variable) for UI; `JetBrains Mono` for the numerals inside cells.
- **Numerals must be tabular** — `font-variant-numeric: tabular-nums` on every cell value.
- **Scale:**

| Token | Size | Usage |
|-------|------|-------|
| `text-display` | 32px / 36px line | App title, victory screen |
| `text-heading` | 24px / 30px | Page titles |
| `text-subheading` | 18px / 24px | Section headings |
| `text-body` | 16px / 24px | Default body |
| `text-small` | 14px / 20px | Secondary text |
| `text-caption` | 12px / 16px | Chips, labels |
| `text-cell` | 24px / 1 (5×5) / 18px / 1 (8×8) | Cell value |
| `text-cell-note` | 10px / 1 | Pencil mark |

- **Weights:** 400 / 500 / 600. No 700 — it reads as marketing-loud.

## 7. Radius

| Token | Value | Usage |
|-------|-------|-------|
| `radius-cell` | 4px | Individual cells |
| `radius-button` | 8px | Buttons, inputs |
| `radius-chip` | 999px | Mastery chips, status pills |
| `radius-card` | 12px | Cards (settings, stats sections) |
| `radius-board` | 16px | Outer board container |
| `radius-modal` | 20px | Paywall, stage-up cards |

## 8. Spacing

4px base. Tokens: `space-1` (4px), `space-2` (8px), `space-3` (12px), `space-4` (16px), `space-6` (24px), `space-8` (32px), `space-12` (48px), `space-16` (64px).

## 9. Elevation

| Token | Value | Usage |
|-------|-------|-------|
| `shadow-cell` | `0 1px 2px rgba(0,0,0,0.04)` | Cell at rest |
| `shadow-cell-selected` | `0 2px 6px rgba(8,145,178,0.20)` | Selected cell |
| `shadow-card` | `0 2px 8px rgba(0,0,0,0.06)` | Cards |
| `shadow-modal` | `0 12px 40px rgba(0,0,0,0.18)` | Paywall, stage-up |
| `shadow-fab` | `0 4px 16px rgba(0,0,0,0.16)` | Floating action button (if used) |

## 10. Motion

Durations are categorical, not arbitrary.

| Token | Value | Usage |
|-------|-------|-------|
| `motion-fast` | 120ms ease-out | Cell selection, button press |
| `motion-base` | 200ms ease-out | Most transitions |
| `motion-slow` | 400ms cubic-bezier(0.2, 0.8, 0.2, 1) | Chain stepper transitions, stage-up reveal |
| `motion-chain-cascade` | 180ms stagger | Ghost values cascading through a contradiction chain |

**No bouncy springs.** Adult, focused brand voice. No overshoot.

## 11. Reserved tokens (planned, not yet bound)

- `theme-premium-*` — premium theme pack tokens (ADR-pending)
- `cell-haptic-pattern-*` — iOS haptic intensity by event type

---

## 12. What this token set is NOT

- Not a Tailwind config replacement. Tailwind utility classes are still used; tokens are CSS custom properties consumed by both inline styles and arbitrary Tailwind values where unavoidable.
- Not a runtime theming system. Themes (when they ship) swap by mounting a new root class that overrides the CSS variable values.
- Not exhaustive. New tokens are added as needed and audited via a planned `scripts/token-audit.mjs` (modeled on diet-app's).

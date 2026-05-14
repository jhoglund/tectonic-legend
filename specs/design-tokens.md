# Design tokens

> Canonical visual values. Source of truth for both `src/index.css` and any Open Design brief.

**Last updated:** 2026-05-14

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
| `border-cage` | `#a3a3a3` | `#525252` |

## 3. Color — text

| Token | Light | Dark |
|-------|-------|------|
| `text-primary` | `#0a0a0a` | `#fafafa` |
| `text-secondary` | `#525252` | `#a3a3a3` |
| `text-tertiary` | `#a3a3a3` | `#737373` |
| `text-on-brand` | `#ffffff` | `#0a0a0a` |
| `text-cell-clue` | `#525252` | `#a3a3a3` |
| `text-cell-player` | `#0891b2` | `#06b6d4` |
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

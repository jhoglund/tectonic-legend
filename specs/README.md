# Specs

Cross-cutting product, design, and methodology specs. These sit above any single feature and govern decisions inside their area.

| Spec | Topic | Read when working on |
|------|-------|----------------------|
| [`progression.md`](progression.md) | The differentiator — player stages, technique mastery, unlock rules, tutorial structure | Any change to difficulty gating, hint surfacing, stats, onboarding, or paywall triggers |
| [`design-tokens.md`](design-tokens.md) | Color, typography, spacing, motion, radius, elevation | Any UI work; mirrored to `src/index.css` |
| [`design-workflow.md`](design-workflow.md) | How UX iteration flows between Claude Code and Open Design | Any new surface or major redesign before code lands |

Specs are read before code is written. If a spec is wrong, fix the spec, then fix the code.

# ADR-0005: Open Design is the UX iteration surface

**Date:** 2026-05-14
**Status:** Accepted
**Source:** [specs/design-workflow.md](../../specs/design-workflow.md)

## Context

UX iteration in this project happens between two surfaces: Claude Code (which writes the code) and Open Design at `http://open-design.test` (a local-first design tool that produces real on-disk project folders containing HTML prototypes, design tokens, and brand-grade design systems). Without an explicit contract between the two, prototypes drift, design tokens diverge between the design tool and the codebase, and Claude Code re-derives visual decisions from scratch.

## Decision

Open Design is the canonical surface for exploring UX. The loop is documented in [`specs/design-workflow.md`](../../specs/design-workflow.md) and follows the diet-app pattern: a `DESIGN-BRIEF.md` at `prototypes/DESIGN-BRIEF.md` seeds an Open Design session; output prototypes land under `prototypes/<slug-or-date>/`; the chosen direction graduates into `src/` while the prototype stays as a permanent reference.

Design tokens are dual-sourced: defined as CSS custom properties in `src/index.css` and mirrored in `specs/design-tokens.md`. Any new token must be added to both at the same time, and Open Design's brief always points to `specs/design-tokens.md` as the constraint set.

## Consequences

- **Enables:** fast UX exploration without re-prompting Claude Code each iteration; a paper trail of visual decisions; design and implementation stay in sync via the token spec.
- **Precludes:** ad-hoc UI invention inside `src/` without a corresponding design brief; arbitrary hex codes in code.
- **Implies:** `prototypes/` is git-tracked but never imported into the app build; a `token-audit` script is on the roadmap so drift between `src/index.css` and `specs/design-tokens.md` fails CI.

# ADR-0015: Candidate notes as the hint visual language

**Date:** 2026-05-19
**Status:** Accepted
**Source:** [specs/solving-techniques.md](../../specs/solving-techniques.md) — the technique catalogue the hints draw on. Prototyped in `prototypes/2026-05-19-hint-types/`.

## Context

The hint engine surfaces five deductive techniques (naked single, hidden single, cage domination, pair elimination, contradiction) plus three utility modes (candidates, reveal, check). Their presentation grew piecemeal: naked/hidden/forced are one-line text cards, pair elimination and contradiction are steppers — three different shapes for one feature.

Reviewing the pair-elimination notes-stepper (prototype `2026-05-19-hint-types`) made a pattern obvious: **most hints are candidate elimination.** A naked single, a forced move, a pair elimination — each is "cross values off a cell until one remains." A hidden single is the dual — "cross a value off the cage's cells until one home remains." Presented as text, that reasoning is invisible; presented as candidate notes with crossings, it is on the board, where the player can follow it and reproduce it.

## Decision

Adopt **candidate notes as the shared visual language for deductive hints.**

- **Cell-centric hints** — naked single, forced move, pair elimination, candidates — show the target cell's candidate grid; values are crossed out with their reason; the survivor is the answer.
- **The value-centric hint** — hidden single — shows one value tracked across the cage's cells, struck where it is blocked, surviving in its one home.
- A single-beat deduction renders **statically** (all crossings at once); a sequential one — pair elimination, contradiction — renders as a **stepper**.
- The contradiction hint uses notes **selectively** — the trial cell and the cell the contradiction strands — not the whole cascade.
- **Reveal and Check** are not deductions; they keep their text form.

The engine emits a per-hint "notes script" — the cells involved, their candidates, the ordered crossings, and a reason per crossing. The data already exists (`computeCandidates` plus each technique's elimination logic in `src/engine/hints.ts`); this is a surfacing change, not new solving logic.

## Consequences

- **Enables:** one consistent hint surface instead of three; the reasoning lives on the board, not in a text card; and — the real point — a hint *teaches candidate elimination*, the core solving skill. That aligns the hint system with the technique-mastery model that is the product's differentiator ([ADR-0001](ADR-0001-difficulty-progression-as-differentiator.md)).
- **Costs:** the hidden-single "one value across cells" needs a layout distinct from a cell's own note grid; hint-painted notes must be visually distinguishable from the player's own pencil marks; the contradiction hint needs restraint so the cascade does not become noise. The text-card hint surface is redesigned.
- **Implies:** `Cell.tsx` note rendering becomes shared by play-mode pencil marks and hint overlays; the `Hint` shape in `src/engine/hints.ts` grows a structured notes-script form alongside the existing `chain`; the change goes through the prototype loop before code.

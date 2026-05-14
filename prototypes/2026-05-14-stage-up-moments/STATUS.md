# Status — 2026-05-14-stage-up-moments

**State:** prepared, awaiting Open Design run
**Brief:** [BRIEF.md](BRIEF.md)
**Surface:** the 4 full-screen stage-up cards (Beginner / Confident / Advanced / Master)
**Skill:** `mobile-app`
**Direction:** Modern Minimal or Editorial Monocle (designer's pick)

## How this session was set up

Folder created via the recipe in [`../../specs/design-workflow.md`](../../specs/design-workflow.md) §3a. The brief is a snapshot of `../DESIGN-BRIEF.md` with §7 narrowed to just stage-up moments and §10 reduced to the concrete Open Design steps for this session.

## Variants expected

2–4 design directions, each showing **all four cards** so tonal consistency across transitions is evaluable. See `BRIEF.md` §7 for the questions design should answer.

## After the run

When Open Design has produced variants, update this file:

- `State:` → `awaiting review`
- Add a `Variants produced` list with one bullet per variant
- Push the prototype files

When Jonas picks a direction:

- `State:` → `graduated`
- `Graduated commit:` → `<sha>` (the commit on `main` that ports the chosen variant into `src/`)
- Add a `Rejected variants` note if useful for future sessions

If the session needs another round of refinement, create `prototypes/2026-05-14-stage-up-moments-v2/` rather than overwriting.

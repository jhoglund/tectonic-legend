# Design workflow — Claude Code × Open Design

> How UX iterates between two surfaces so design and implementation stay in sync. Source: [ADR-0005](../docs/decisions/ADR-0005-open-design-for-ux-iteration.md).

**Last updated:** 2026-05-14

---

## 1. The two surfaces

| Surface | Address | Role |
|---------|---------|------|
| **Open Design** | `http://open-design.test` (local, puma-dev port 7575) | Explores UX. Produces real on-disk project folders containing HTML prototypes, design briefs, and screenshots. Bring-your-own-key, runs locally. |
| **Claude Code** | This editor session | Reads design output, writes the React code that ships, audits drift between `specs/design-tokens.md` and `src/index.css`. |

Open Design is *not* a design hand-off tool (like Figma → Zeplin). It is a generative tool: you give it a brief; it produces an interactive HTML prototype with the design system applied. The prototype is canonical until graduated.

---

## 2. The loop

```
  ┌───────────────────────────────────────────────────────────────┐
  │                                                               │
  │   1. Claude Code writes/updates a brief                       │
  │      prototypes/DESIGN-BRIEF.md  ─or─  prototypes/<slug>/BRIEF.md
  │                                                               │
  │                              │                                │
  │                              ▼                                │
  │   2. Jonas creates the session folder + imports it into OD    │
  │      mkdir prototypes/<slug>/                                 │
  │      OD: New Project → Import folder → paste absolute path    │
  │                                                               │
  │                              │                                │
  │                              ▼                                │
  │   3. Jonas works in Open Design at open-design.test           │
  │      Pastes the brief, picks skill + direction                │
  │      OD writes artifacts directly into prototypes/<slug>/     │
  │                                                               │
  │                              │                                │
  │                              ▼                                │
  │   4. Jonas reviews variants, picks a direction (or refines)   │
  │      git add prototypes/<slug>/ && commit                     │
  │                                                               │
  │                              │                                │
  │                              ▼                                │
  │   5. Claude Code reads the chosen prototype                   │
  │      Reproduces the visual decisions in src/                  │
  │      Updates specs/design-tokens.md if any tokens changed     │
  │      Marks the prototype's STATUS.md → graduated → <sha>      │
  │                                                               │
  │                              │                                │
  │                              ▼                                │
  │   6. Prototype stays as the permanent reference               │
  │      Not built. Not imported by the app. Just there.          │
  │                                                               │
  └───────────────────────────────────────────────────────────────┘
```

---

## 3. Directory shape

```
prototypes/
  DESIGN-BRIEF.md              ← the always-current brief (context pack)
  <slug-or-date>/              ← one folder per Open Design session
    BRIEF.md                   ← the brief used for that session (snapshot)
    index.html                 ← side-by-side index when there's more than one variant
    01-stage-up-quiet/
      index.html
      screenshot.png
    02-stage-up-spotlight/
      index.html
      screenshot.png
    STATUS.md                  ← captured, refined, graduated, or rejected
```

The `slug-or-date` convention: use a date when exploring broad (e.g., `2026-05-20-onboarding-shapes`); use a slug when iterating tightly (e.g., `paywall-trigger-hard-tap`).

The folder for a session is created *before* the Open Design session and imported into Open Design as the project root — see §3a.

---

## 3a. Importing a session folder into Open Design

Open Design supports a "git-linked project" model: import an existing local folder as a project and every artifact OD generates lands directly in that folder. No copy, no shadow tree, no export step.

**Recipe for starting a session:**

```bash
mkdir -p prototypes/<slug>
# optional: copy + trim the always-current brief
cp prototypes/DESIGN-BRIEF.md prototypes/<slug>/BRIEF.md
$EDITOR prototypes/<slug>/BRIEF.md   # narrow §7 to this session's surfaces
```

Then in Open Design at `http://open-design.test`:

1. **New Project** → **Import folder** (the manual `baseDir` input on the web; the file picker on the desktop app).
2. Paste the absolute path: `/Users/jonashoglund/dev/tectonic-legend/prototypes/<slug>`.
3. Pick a **skill** matching the surface:
   - `mobile-app` — in-app surfaces (onboarding, stage-up, paywall, stats)
   - `web-prototype` — share artifact, web app landing
   - `magazine-poster` — App Store screenshots
   - `gamified-app` — for moments that should feel celebratory (stage-ups, mastery)
4. Pick a **design direction** — Modern Minimal or Editorial Monocle match the brand voice. Skip Brutalist Experimental.
5. Paste the contents of `BRIEF.md` into the prompt.

OD writes its output directly into `prototypes/<slug>/`. When the session is done, `git add prototypes/<slug>/ && git commit`.

**Under the hood** (for debugging): the import is `POST /api/import/folder` with `{ baseDir, name?, skillId?, designSystemId? }`. The daemon stores `metadata.baseDir = <your absolute path>` on the project record; from then on, every `writeProjectFile` resolves against that baseDir instead of `.od/projects/<id>/`. Once set, `baseDir` is immutable for the project — to point at a different folder, create a new project.

**Gotcha:** if the daemon was started with `OD_REQUIRE_DESKTOP_AUTH=1`, the web-only import path is blocked and you need the desktop app. Your current puma-dev setup at `http://open-design.test` does NOT set that env var, so the web flow works.

---

## 4. The brief

`prototypes/DESIGN-BRIEF.md` is the always-current context pack. Every Open Design session starts by reading it. Its structure mirrors the diet-app pattern:

1. **Who we are** — brand, voice, one-paragraph product thesis.
2. **The journey** — the player stages from `specs/progression.md` §1, plus a sentence per stage on what's *different* about the UX in that stage.
3. **Design principles** — the constraints (P1–P5; see brief).
4. **Design tokens** — pasted from `specs/design-tokens.md` so Open Design produces token-faithful prototypes.
5. **Locked-in decisions** — what's already settled (board layout, hint chain colors, navigation shape).
6. **What's staying / changing / adding** — for this specific session.
7. **Current screen references** — screenshots from the running app, attached.
8. **Open questions for design to explore** — the actual brief for this round.
9. **Things design should avoid** — the anti-patterns.

When a session needs a different brief (e.g., "design the paywall, don't worry about the rest"), copy the always-current brief into `prototypes/<slug>/BRIEF.md` and edit *that* — keep the always-current one in shape for the next general session.

---

## 5. Graduation

A prototype "graduates" into shipping code when:
- Jonas accepts the direction in writing (a `STATUS.md` note, a slack/chat ack relayed into a commit message, or an inline approval in a PR).
- Claude Code reproduces the visual decisions in `src/`.
- Any new design tokens have been added to both `src/index.css` and `specs/design-tokens.md`.
- The prototype's `STATUS.md` is updated to `graduated → commit <sha>`.

A graduated prototype is **never deleted**. It is the visual record of why the UI looks the way it does.

---

## 6. Rejection and refinement

If a prototype is rejected, its `STATUS.md` notes:
- What didn't work (one sentence).
- What the next session should explore differently.

If a prototype needs refinement, do it as a new session (`prototypes/<original-slug>-v2/`). Don't overwrite — keep iteration legible.

---

## 7. Token drift guard

Tokens are dual-sourced (`src/index.css` and `specs/design-tokens.md`). A planned `scripts/token-audit.mjs` (modeled on diet-app's `scripts/token-audit.mjs`) checks that:
- Every token in `specs/design-tokens.md` has a corresponding CSS custom property.
- No `src/` file uses an arbitrary hex code or pixel size for properties covered by the token system.

The audit runs in CI once CI exists. Until then, it's a manual `npm run token-audit` before any merge that touches UI.

---

## 8. When to skip the loop

Small things don't need a prototype. Examples that go straight to `src/`:
- Bug fixes that don't change visual semantics.
- Copy edits.
- A new icon that maps to an existing pattern.
- Internal refactors invisible to the player.

Anything that introduces a *new visual pattern* (new component shape, new color usage, new motion behavior) goes through the loop.

---

## 9. Surfaces queued for Open Design

These are the surfaces that need Open Design iteration before code, per the backlog:

| Surface | Why it needs design first |
|---------|---------------------------|
| Onboarding flow (Newcomer tutorials) | First impression; pace and warmth matter more than layout |
| Stage-up moments (4 stages × 1 card each) | The celebration tone is the brand voice in pure form |
| Mastery chip | Tiny, surfaces often, easy to over-design |
| Stats surface | Three sections; ordering and density need iteration |
| Paywall (post-mastery, pre-Hard) | Highest-conversion surface; needs the right "you've earned this" tone |
| Daily puzzle home-screen anchor | Anchor of daily habit; needs the right level of presence |
| Share artifact (colored mini-grid + time) | Tier-0 viral; visual identity matters |
| App icon + App Store screenshots | Soft launch blocker |

The seed brief at [`prototypes/DESIGN-BRIEF.md`](../prototypes/DESIGN-BRIEF.md) is ready to use for the first session.

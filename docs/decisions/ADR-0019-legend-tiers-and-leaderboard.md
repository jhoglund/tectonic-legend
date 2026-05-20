# ADR-0019: Legend tiers + daily-puzzle leaderboard

**Date:** 2026-05-20
**Status:** Accepted (spec only; implementation deferred until ADR-0018 ships)
**Source:** Extends [ADR-0018](ADR-0018-legend-stage-and-mastery-depth.md) — Legend stage + mastery depth. References [ADR-0013](ADR-0013-supabase-as-the-backend.md) (Supabase backend) and [ADR-0017](ADR-0017-anonymous-by-default-auth.md) (anonymous-by-default).

## Context

ADR-0018 makes "Legend" a reachable stage — depth ≥ 90, puzzles ≥ 8, on all five techniques. That's a strong endpoint *for the player who hasn't reached it yet*. But the brand is **Tectonic Legend**, and the explicit ask in review (2026-05-20) was *"option 3 should be strived for even when the user has reached Legend status"* — the extreme `depth ≥ 95, puzzles ≥ 12` thresholds aren't the gate; they're the **next rung**. The player who reaches Legend needs somewhere to keep climbing.

Two engines for that climb:

- **Tiers within Legend** — the depth score keeps climbing past 90; each climb earns a higher Legend rung. Purely local; reuses the engine ADR-0018 already builds.
- **Daily-puzzle leaderboard among Legends** — same daily puzzle every day (item 14, shipped); fastest solve appears on a Legend-only board. Comparative; needs a backend (Supabase, already in place per ADR-0013).

Both ship under this ADR.

## Decision

### 1. Four rungs of Legend

ADR-0018 establishes the chip's fourth state, `legend`, lit at depth ≥ 90 / puzzles ≥ 8 on every technique. This ADR subdivides that state into four rungs, climbed by reaching every threshold on **every** technique:

| Rung | Depth threshold | Puzzles threshold |
|------|----------------|-------------------|
| **Apprentice Legend** | 90 | 8 |
| **Adept Legend** | 93 | 12 |
| **Grand Legend** | 96 | 18 |
| **Mythic Legend** | 99 | 25 |

The thresholds are deliberately steep — Mythic Legend is intended to be a multi-month destination for a dedicated player, and the calibration source is soft-launch data.

`PlayerProfile` carries `legendRung: 0 | 1 | 2 | 3 | 4` (0 = not yet Legend; 1 = Apprentice; …; 4 = Mythic). The transition function in `src/lib/progression.ts` updates the rung any time a solve completes; the rung never regresses, in line with the *"Stages do not regress"* rule ([`progression.md` §1](../../specs/progression.md)).

#### Visual surface

- The Legend halo on the technique chip (ADR-0018) gains a tier accent — the gem changes shape / colour subtly as the player climbs from Apprentice to Mythic. The chip headline still reads `legend` regardless of rung — the *rung* lives on the stage chip and on the share artifact, not on every technique card.
- The Home stage chip displays the current rung — e.g. `Grand Legend` — replacing the bare `Legend`.
- Each rung-up shows the existing `StageUpCard` shape, with copy that honours the quiet, warm voice ([`progression.md` §5](../../specs/progression.md)): *"Adept Legend. The technique is becoming instinct."*
- The share artifact's `Legend ✦` tag (ADR-0018) becomes rung-aware: `Mythic Legend ✦`.

### 2. Daily-puzzle Legend leaderboard

A Legend who is signed in to a real provider (Apple, Google, or email magic link — per ADR-0017) may **opt in** to the leaderboard. Anonymous users are never on it — the leaderboard is one of the **value moments** for the Save-your-progress upgrade.

#### Scope

- **One leaderboard per UTC day**, scoped to today's daily puzzle. Yesterday's stays visible for 24 h, then archives.
- **Score = solve time in ms**, lower is better. Hint usage and validation errors do not count against time directly (they'll have come out in the depth score that made the player a Legend at all), but they are **recorded** on the entry so a future surface can highlight *unaided* Legends.
- **Rank surface**: top 10 globally, plus the player's own rank if outside the top 10 (the "you are 247th" line).
- **Display handle**: a player-chosen short handle (3–12 chars, ASCII), defaulting to `Legend-<6-char-id>` derived from the user id. No emails, no avatars in v1.
- **No friends / no follows / no profile pages** in v1. The leaderboard is the only social surface this ADR introduces.

#### Data model (Supabase)

```sql
-- One row per (user, daily-puzzle date). RLS: insert/update own row; read all.
create table legend_leaderboard (
  user_id          uuid references auth.users(id) on delete cascade,
  puzzle_date      date not null,
  time_ms          integer not null check (time_ms > 0),
  hints_used       integer not null default 0,
  errors_validated integer not null default 0,
  display_handle   text not null,
  rung_at_submit   smallint not null check (rung_at_submit between 1 and 4),
  submitted_at     timestamptz not null default now(),
  primary key (user_id, puzzle_date)
);

-- Index for the top-10 query.
create index on legend_leaderboard (puzzle_date, time_ms);
```

RLS: the policy permits `select` to anyone; `insert / update` only when `auth.uid() = user_id`. The `rung_at_submit` check guarantees no non-Legend rows. Schema lands in `supabase/schema.sql` and is applied out-of-band like the rest of the backend ([ADR-0013](ADR-0013-supabase-as-the-backend.md)).

#### Anti-cheat — v1 stance

**Honour system.** Client submits time; server accepts. v1 ships with a known floor — the engine's own fastest deductive walkthrough of today's puzzle, computed once per day server-side via a Supabase Edge Function and stored in a sibling `daily_puzzle_floor` row. Submissions below the floor are silently dropped (the player can still solve, just doesn't appear). Real anti-cheat (server-validated solve sequences, replay) is a follow-up — flagged in §3 of [`docs/soft-launch-plan.md`](../soft-launch-plan.md).

### 3. Opt-in flow + privacy

- A new toggle in Settings → Account: *"Appear on the Legend leaderboard"*. Off by default. Surfaced as an upgrade prompt the first time an anonymous-or-signed-out Legend taps the leaderboard surface — the Apple / Google / magic-link sheet appears, with the toggle pre-checked on completion.
- A *Choose a display name* field appears the first time the toggle goes on. The chosen handle is stored on `auth.users.user_metadata.display_handle` so the leaderboard rows can reference it without joining a separate table.
- The leaderboard surface lives on the Stats screen — a fourth section beneath Solve performance / Technique mastery / Streaks. It is **hidden for non-Legends entirely** (the daily-leaderboard surface is an earned reward for reaching Legend, not a teaser for the climb).

## Consequences

- **Enables:** the climb past Legend that the brand promises. Tiers (A) give a local, no-backend progression engine; the leaderboard (B) is the comparative surface that turns "I'm a Legend" into "I'm Grand Legend, ranked 12 today." The leaderboard is also a *value moment* for the auth upgrade (ADR-0017) — the first real social hook the app has.
- **Costs:** four `legendRung` chip / card variants instead of one; a new Supabase table + RLS + an Edge Function for the daily floor; the Stats surface grows; the opt-in flow needs design (Settings toggle, first-time handle picker). The honour-system anti-cheat is a known v1 compromise.
- **Implies, sequencing:** ADR-0018 ships first (the engine of `depth` and the entry-rung Legend chip + stage card). The tiers (this ADR §1) land as a second pass that adds rung accents and rung transitions to the existing surfaces — no new engine layer. The leaderboard (this ADR §2) lands third — earliest after ADR-0017's Supabase providers are configured end-to-end (Apple, Google, magic link verified on a real device). All three could land before soft launch if the Apple Developer enrolment doesn't block the leaderboard launch.
- **Open questions deferred to soft-launch data:** are the rung thresholds reachable on the intended timeline (Adept ≈ 2 mo, Mythic ≈ 6+ mo)? Does the honour-system leaderboard accumulate enough fraud that we need server-side replay validation before public launch? Should the rung-up cards carry more weight than the four-stage cards (a single image, an animation)?

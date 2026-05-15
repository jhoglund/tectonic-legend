# PRD — Tectonic (working title)

> Product spec. *What* players experience. *How* it's built lives in [`ARCHITECTURE.md`](ARCHITECTURE.md). *Why* the market opportunity exists is in [`docs/market-research.md`](docs/market-research.md).

**Last updated:** 2026-05-14
**Status:** Pre-launch, soft-launch prep

---

## 1. Thesis

Tectonic (Suguru) is an under-served puzzle genre with a thin, ad-heavy competitive field. The winning product is the one that teaches the player to solve harder puzzles. Everyone else ships difficulty levels. We ship a **guided journey from naked singles to contradiction chains**, with technique mastery as the spine.

Difficulty progression is the differentiator. The hint engine already explains the logic; the product wraps that into a learning curve the player can feel.

The full opinion is in [`specs/progression.md`](specs/progression.md). This PRD restates the player-facing surface.

---

## 2. Player journey

Five stages. The player is always in exactly one stage. Movement between stages is **earned**, not selected.

| Stage | Unlocked by | Available difficulties | What the player learns |
|-------|-------------|------------------------|------------------------|
| **Newcomer** | First launch | Tutorial puzzles only | What a Tectonic puzzle is. Cage rules. How to mark a candidate. |
| **Beginner** | Completing 3 tutorial puzzles | Easy (naked singles only) | Scanning. Naked singles. Cage-completion logic. |
| **Confident** | Demonstrating naked-single mastery (see §3) | Easy + Medium | Hidden singles. Group/row/column interactions. |
| **Advanced** | Demonstrating hidden-single mastery | Easy + Medium + Hard | Forced moves. Pair eliminations. Cage-by-cage deduction. |
| **Master** | Demonstrating Hard solve consistency | All difficulties + Expert | Contradiction chains. "What if" reasoning. |

Each unlock is celebrated with a one-screen moment — not a popup; a *board state*. The first puzzle in the new stage starts with a 2-line context from Ginger… *not Ginger, from the hint engine* — a one-line setup. ("Hidden singles look at where a value *can* go. Watch the first three cells.")

### Re-entry after a break

When a player has been away for 7+ days, they land on a warm re-entry screen showing their current stage, last solve time, and "Pick up where you left off" — never broken streaks as punishment.

---

## 3. Technique mastery

The hint engine emits a technique label every time a deduction fires (`naked-single`, `hidden-single`, `forced-move`, `pair-elimination`, `contradiction-chain`). The player's profile tracks two numbers per technique:

- **Used count** — how many times the technique appeared in a solve that the player completed (whether via hint or unaided).
- **Self-applied count** — how many times the player made the move *before* the hint engine offered it.

A technique is **mastered** when the player has 8 self-applications across at least 3 distinct puzzles. Mastery is the unlock currency.

This is not surfaced as a number to the player. They see a chip: *Naked single — learning · familiar · mastered*. Mastery thresholds and tuning live in `specs/progression.md`; UI in `src/components/MasteryChip.tsx` (to be written).

---

## 4. Stats

A single Stats surface, accessible from the home screen. Three sections.

### Solve performance
- Best solve time per difficulty
- Solve time distribution (percentile band, not a leaderboard) per difficulty
- Solves this week / month / all-time

### Technique mastery
- Chip per technique with `learning · familiar · mastered` state
- Histogram: which techniques fired in your last 20 solves
- Personal best: longest contradiction chain you've followed

### Streaks (gently)
- Current solve streak (days)
- Longest solve streak
- **Never** shown as broken when reset; reframed as "Resume from {date}"

Free tier sees solve performance and streaks. Technique mastery sits behind premium (see §6).

---

## 5. Tutorial mode

Newcomer stage is **3 hand-curated puzzles** that teach:
1. *Reading the board* — how cages, rows, and orthogonal neighbors interact
2. *Naked singles* — a puzzle solvable using only this technique, with forced hints on the first 3 moves
3. *Cage completion* — recognizing when a cage has only one cell left

Tutorial puzzles bypass the procedural generator and live as JSON fixtures under `src/data/tutorials/` (path TBD). Each fires a guided overlay that dims the rest of the board and walks the player through the move.

Subsequent stage unlocks introduce a single tutorial puzzle that demonstrates the new technique with the same guided overlay.

---

## 6. Monetization shape

Per [`docs/market-research.md`](docs/market-research.md) §2 — freemium + subscription. Exact gating is **proposed**, not accepted; see [`docs/decisions/ADR-0007-free-premium-feature-split.md`](docs/decisions/ADR-0007-free-premium-feature-split.md).

| Feature | Free | Premium |
|---------|------|---------|
| Easy + Medium difficulty | ✅ | ✅ |
| Hard + Expert difficulty | — | ✅ |
| Tutorial puzzles | ✅ | ✅ |
| Naked & hidden single hints | ✅ | ✅ |
| Forced-move / pair-elimination hints | ✅ (limited per day) | ✅ unlimited |
| Contradiction-chain hints | — | ✅ |
| Stats — solve performance | ✅ | ✅ |
| Stats — technique mastery | — | ✅ |
| Daily puzzle (today) | ✅ | ✅ |
| Daily puzzle archive (>7 days) | — | ✅ |
| Ad experience | Interstitial between puzzles | Ad-free |
| Cosmetics / themes | 1 default theme | Theme pack |

Pricing target: **$3.99/mo or $24.99/yr** (per market research). One-time unlock at $6.99 as a fallback if subscription conversion fails in soft launch.

---

## 7. Viral mechanics

Tier 0 only for v1 launch. See `docs/market-research.md` §3 and [`docs/decisions/ADR-0004-tier-0-viral-before-backend.md`](docs/decisions/ADR-0004-tier-0-viral-before-backend.md).

- **Shareable solve summary** — colored mini-grid (green/yellow/red per cell based on hint usage and corrections) + solve time. Spoiler-free.
- **Challenge links** — extension of the existing share-URL feature. Encodes challenger's time. Recipient sees "{Name} solved this Hard 5×5 in 2:14 — can you beat it?"
- **Streak display** — copyable. No external server.

Tier 1 (daily puzzle leaderboard, friends) is on the roadmap; not in v1.

---

## 8. Surfaces (where features live in the UI)

v1 surface set, after the prototype-vs-PRD scope triage of 2026-05-15 ([ADR-0011](docs/decisions/ADR-0011-v1-scope-triage.md)). The iOS-native prototype is variant 01 of the 2026-05-14 swarm.

| Surface | Contents |
|---------|----------|
| **Home** | Today's daily puzzle, "Resume" if a game is in progress, current stage chip, a "Welcome back" line after a 7+ day gap. v1 ships a simplified composition; refined later. |
| **Difficulty picker** | Single entry point from Home — choose difficulty + grid size. Locked difficulties show what unlocks them. (v1 merges the prototype's separate New Game sheet and Practice tab into one surface.) |
| **Solve view** | Board, technique chip, notes/clear/hint controls, share on solve. All solving states: fresh, cell-selected, notes, conflict, basic hint, contradiction stepper, pause, abandon. |
| **Solved** | Solve time, technique histogram, mastery chips earned, share button. No cohort/percentile comparison in v1 — that needs a backend. |
| **Onboarding** | Newcomer welcome → guided tutorial puzzles. No account step. |
| **Stage-up moment** | Single full-screen card per stage transition; tappable to dismiss. |
| **Mastery moments** | Mid-solve chip when a technique crosses mastery + a post-solve mastery recognition. |
| **Stats** | Three sections from §4. |
| **Paywall** | Triggered on Hard tap and contradiction-hint tap. One component, two trigger copies. Built last, pre-soft-launch. |
| **Settings** | Theme, sound, haptics, Restore Purchase, Manage Subscription, How to play, About. No account / sign-in. |

**Navigation:** v1 tab bar is **Home / Stats / Settings** (three tabs — the prototype's Practice tab is merged into the difficulty picker).

UI fidelity for each of these is iterated in Open Design — see [`specs/design-workflow.md`](specs/design-workflow.md) and the starter brief at [`prototypes/DESIGN-BRIEF.md`](prototypes/DESIGN-BRIEF.md).

---

## 9. Out of scope for v1

- **Authentication / accounts / sign-in.** v1 is local-only, no backend (`ARCHITECTURE.md` §8). Apple StoreKit handles subscriptions without an account system. The prototype's Auth screen (01-auth) is cut from v1; re-add when a backend exists.
- **Standalone Account screen.** Restore Purchase + Manage Subscription fold into Settings as StoreKit rows. The prototype's 12-settings-account screen is cut.
- **Practice as a separate tab.** Merged into the single difficulty picker for v1.
- **Cohort / percentile comparison** ("faster than X% of solvers", "1 of N today"). A leaderboard feature — needs a backend (Tier-1).
- Multiplayer (real-time or async). Tier 0 viral is enough until retention proves out.
- Friend leaderboards, friend system. Requires backend; not before Tier 1 metrics warrant it.
- Cosmetics / themes beyond a single Premium theme pack.
- Localization beyond English. UI has minimal text, mostly numbers; localize after first non-English market expansion.
- Cross-device sync. Local state only in v1.
- Challenge links (challenger's time encoded in the share URL). The share artifact is the v1 viral bet; challenge links are a fast-follow.

---

## 10. Success criteria for v1 (soft launch)

From `docs/market-research.md` §4. Reproduced here for legibility.

| Metric | Target | Kill threshold |
|--------|--------|----------------|
| Day 1 retention | > 40% | < 25% |
| Day 7 retention | > 20% | < 10% |
| IAP conversion | > 3% | < 1% |
| Avg puzzles/session | > 2 | < 1.2 |
| Share rate | > 5% of sessions | < 1% |

Below kill thresholds → revisit difficulty progression and onboarding before paid acquisition. The hypothesis is that the journey is the moat; if retention is low, the journey is unfelt.

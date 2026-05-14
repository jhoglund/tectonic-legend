# Variant 03 — Gesture-first / chrome-less

## Angle taken

The hypothesis: Tectonic players are puzzle-people who tolerate higher learning curves for cleaner surfaces. So we strip away tab bars, FABs, persistent navigation, and most explicit buttons. The home screen IS the nav. Swipes drive transitions, long-presses act, edge gestures expose global commands. Reference brands: Things 3, Mela, Bear, Twitter (pre-X) gesture navigation. References explicitly avoided: Material, HIG, anything from a 2015 freemium playbook.

## Direction picked

**Modern Minimal** — closer to Linear and Things 3 than to Editorial Monocle. Generous whitespace, type-led hierarchy, no decorative chrome. The board is the visual hero; surrounding surfaces de-emphasize themselves to disappear. Type weights stay at 400/500. No 600 used in headings (the brief permits 600, but at this scale 500 reads more adult).

## Interaction-model decisions

- **No tab bar anywhere.** All eight screens render without a persistent nav. The home screen functions as the nav because the only meaningful destinations (daily, resume, stats, new-game) all live there as cards or reachable gestures.
- **Affordances are minimal but never zero.** Every screen has at least one subtle cue: the two corner dots on Home (settings/stats pull-down zones), the pull-handle at the top of Stats, the scroll indicator on Onboarding, the grip at the top of Home. None of these read as "buttons" — they read as the edge of a system that's listening.
- **Every gesture is annotated** with a small cyan annotation label in the corner of the frame (e.g. "← swipe right = home"). The annotation is `text-caption` size, deliberately quiet, and only present so a reviewer reading the static HTML can understand the interaction model. In production these would be replaced by the first-time ghost-pointer animation described in PROMPT.md.
- **Number row on Solving is summoned**, not persistent. It appears at the bottom edge when a cell is selected — making the board the genuine full-screen hero. The contradiction stepper underneath the board carries the technique label chip and all four hint-chain colors.
- **Solving has the lightest chrome possible**: just a 11px monospace status row at the very top (time + puzzle number) and nothing else. No menu icon, no hint button, no settings cog.
- **Stage-up is button-less.** The current screen zooms out and fades to 18% behind the stage card. A row of dots at the bottom + "Swipe in any direction to continue" is the dismissal. No CTA, no "Got it!", no exclamation marks.
- **Stats has no cards.** Flat rows separated by 1px borders, like a Things 3 list. The streak section uses muted blocks (no fire, no shame language) — caption reads "12 of the last 14 days · no streak shaming".

## Open questions

1. **Discoverability of the corner-dot pull zones for stats/settings.** Two grey 6px dots in opposite corners of Home is the only static signal that pull-down zones exist there. The first-time ghost-pointer animation has to do the heavy lifting on first run. Is that enough — or do we need a more legible affordance (e.g. a subtle 24px gradient at the very top edges that hints at downward motion)? Worth user testing against a more explicit affordance.

2. **Solving abandon is gestural.** Right now there's no visible "quit" button on the solving screen — it requires an edge swipe-right that opens a confirm sheet. For an accessibility audience or a first-time user mid-frustration, this could feel trapping. May need an exception: surface a single quiet ⓧ in the top-left after, say, 60 seconds of inactivity.

3. **New-game horizontal pager.** Only the first page (Medium) is rendered in the prototype; the dots indicate the others exist behind a horizontal swipe. A reviewer who can't actually swipe a static HTML page won't experience the locked-difficulty scrim. Worth adding a small inline-rendered "locked preview" example below the main pager — or making page 3 (Expert) the active one in a second variant of this screen so the locked state is visible.

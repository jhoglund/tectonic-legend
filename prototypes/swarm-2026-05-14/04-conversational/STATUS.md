# Variant 04 — Conversational / AI-native · STATUS

## Angle
The hint engine is a **conversational presence across the entire app**, not a feature that surfaces only during a solve. Every non-modal screen has a persistent chat pill at the bottom; every "answer" surface (difficulty cards, stats sections, summary blocks) is rendered as an inline card that's part of the conversation, not a separate page. The engine has personality but is adult: short, considered, never bubbly, never emoji.

## Direction picked
**Modern Minimal** with editorial restraint. Single hairline borders, generous vertical rhythm in the chat scroll, JetBrains Mono used as eyebrow / metadata typography (uppercase tracking) so it reads like a quiet desk app, not a chat product. The engine identity is a 6px brand-600 dot — never an avatar, never a wordmark next to messages.

## Interaction-model decisions

1. **Engine vs player visual contract.** Engine messages: left-aligned, `text-primary`, anchored by a 6px brand-600 dot at the start of the line. Player replies: right-aligned, `text-secondary`, no dot. This holds across every screen so the user always knows who's speaking without reading.
2. **Inline cards, never modals.** Daily puzzle, resume game, difficulty picker, mastery histogram, solve summary, stats sections — every one is rendered as a card slotted into the chat scroll, indented to align with the engine's column. The card is the engine's answer; the buttons inside it are the player's reply options. No screen uses a modal interrupt.
3. **Chat IS the nav.** There's no tab bar. The pill at the bottom accepts typed intent ("show stats", "harder", "next puzzle") and routes. Quick-action chips below engine messages are the visual scaffolding for users who don't want to type. Back affordances are kept (small "← Home" top-left on sub-screens) so the chat isn't load-bearing for navigation.
4. **Solving keeps direct manipulation.** Board, number dock, notes toggle — all tappable, unchanged. The chat panel sits below the board and *narrates* + *teaches*. When a contradiction chain fires, the stepper shows all four colors (amber/blue/red/emerald) as pills below the board and the engine explains the chain in a single considered message with "Place 3 / Step through / Let me try" quick actions. Hint isn't a label — it's a dialogue.
5. **Stage-up is the one screen that drops the chat scaffolding.** It's a full-screen engine moment — the wordmark, a single dot, an eyebrow, a title, a paragraph, an aside, two reply buttons. The pill stays at the bottom (slightly quieter, no shadow) so the model remains consistent: even ceremony can be talked back to.
6. **Pacing is implied, not animated.** No typing indicator is rendered as a "thinking" dot animation in this static prototype, but the layout reserves space for it (gap before quick-actions, distinct turns rather than a single wall of text). The engine never says more than ~2 lines per turn.

## Brand-voice spot-checks
- "Solved. 2 minutes 14 seconds. No hints used." — fact, not celebration.
- "Missed days don't reset anything." — gentle streak posture.
- "Hard asks you to read a cell's neighborhood — what other cells force this one." — teaches what the stage *means*, not just that it unlocked.
- No exclamation marks. No emoji. No "Great job!" Nothing reads like Duolingo.

## Open questions

1. **Density control.** The PROMPT.md mentions a "silent / occasional / verbose" density toggle for solving narration. I didn't render the toggle UI (the chat panel is showing the "occasional" default with one hint message). Should this live as a settings entry the engine can be asked to change ("be quieter"), or as a visible segmented control somewhere on the solving screen? I lean on the engine being asked, but a discoverable control may be needed for first-time users.

2. **Conversation persistence vs. per-session.** Does the Home screen's chat log persist across sessions (so the player sees yesterday's "Good evening" above today's "Good morning")? I rendered a fresh "today" view, but a persistent log would lean harder into the conversational hypothesis — at the cost of clutter and a harder mental model for new users.

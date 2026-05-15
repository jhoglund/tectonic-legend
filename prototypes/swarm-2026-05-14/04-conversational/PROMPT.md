# Variant 04 — Conversational / AI-native

**Angle.** The hint engine becomes a conversational presence. Every screen has a "talk to the engine" affordance. The player can ask *why* a technique works, *what* technique would crack the next move, or *how* to read the contradiction chain — and the engine answers inline.

**Hypothesis being tested.** The hint engine isn't just a feature — it's the product's personality. Treating it as a conversational layer surfaces the *teaching* aspect of the journey that's otherwise invisible. Reference: Anthropic's claude.ai mobile app, NYT Connections "hint" overlay, ChatGPT iOS app.

---

## Interaction principles for this variant

- **Persistent chat affordance** — a small text input or pill at the bottom of most screens (collapsible). Tap to expand into a chat sheet.
- **Inline AI cards** — when the engine has something to say, it surfaces as a card inline in the current view, not as a modal. The card has 2–3 quick-action buttons ("Show me", "Why?", "Skip").
- **Hints are dialogues.** When a hint fires, it isn't a one-shot label — it's a 2-3 turn conversation pinned beside the board. "I see a hidden single. Want me to point at the cell, or work it out yourself?"
- **No explicit nav — the chat is the nav.** "Show stats", "Try a Hard puzzle", "Why did I get stage-up'd?" — all resolved by the engine routing intent.
- **A typing indicator and "thinking" state** — the engine takes a moment, not instantly. Adult, considered pacing.

---

## Screen-by-screen interpretation

1. **Auth.** A chat-style intro: a single message bubble from the engine ("Welcome. I'll help you get better at Tectonic. First — let's sign you in."), then auth options as inline buttons. Conversational from the very first screen.
2. **Onboarding.** A 3-message conversation: "I'm going to show you a small puzzle. You don't need to know anything yet — just tap a cell to select, then tap a number." Each tutorial puzzle is introduced this way. The puzzle appears inline below the engine's setup message.
3. **Home.** A scrollable conversation log: "Good morning. Your daily is ready. You're 2 self-applications away from mastering hidden singles." Each line is actionable — tap to act. Below the log: a chat input.
4. **New game.** Player types "new game" or "harder" or "expert" → engine clarifies and presents difficulty cards inline as a response. Locked difficulties trigger an inline explanation, not a paywall modal.
5. **Solving.** Board top half, chat panel bottom half. As the player makes moves, the engine narrates lightly ("Nice — that was a naked single. You found it in 4 seconds.") at a configurable density (silent / occasional / verbose). Hints arrive as chat messages with the board cells highlighted by the engine.
6. **Solved.** The engine summarizes: "Solved in 2:14. You self-applied hidden single 2 times — one more puzzle like that and you'll have mastered it." Share button is an inline action button on this final message. "Next" is a typed reply.
7. **Stats.** A single message: "Here's what I've seen." Then sections appear as cards inside the conversation. Each card is taggable — tap mastery to drill into a technique-specific conversation about what the player is missing.
8. **Stage-up.** A single conversational moment: the engine's message takes the full screen. "You're an Advanced player now. Hard puzzles are unlocked. Want me to explain what Hard asks of you, or jump straight in?" Two reply buttons.

---

## What this variant should NOT do

- Don't make the engine *chatty*. Adult brand voice — short, considered, never bubbly. No emoji. No "Great job!"
- Don't make every action go through the chat. The board is still tappable; the chat *supplements* direct manipulation, doesn't replace it.
- Don't render the engine as an avatar / face. A small dot or wordmark is enough.
- Don't borrow ChatGPT's "GPT-4" model picker or other LLM-product UI. The engine is the engine — not a chatbot the user picks from a menu.

---

## Output reminder

8 HTML screens + `index.html` + `STATUS.md`. Render in a 390×844 viewport. Use a clear typographic distinction between "engine" messages and "player" actions/replies — perhaps engine messages in `text-primary` with a small brand-600 dot, player replies in `text-secondary` right-aligned.

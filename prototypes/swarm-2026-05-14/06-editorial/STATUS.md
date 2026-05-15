# Variant 06 — Editorial · STATUS

## Angle taken

**Text-led, magazine-paced.** The product reads like a small editorial section — masthead, kicker, hero head, dek, body paragraphs, pull quotes, thin section rules. Reference grammar: Stripe Press / NYT Games homepage / NPR.org reading.

## Direction picked

**Editorial Monocle**, leaning print-of-record rather than designy-magazine. No drop caps, no ornament, no diamond separators. The "editorial" feel comes from rhythm and type hierarchy, not decoration.

## Type hierarchy (decided up front, then applied consistently)

| Role | Size / line | Weight | Where |
|---|---|---|---|
| Hero (stage-up only) | 42px / 1.1 | 600 italic | The pull-quote stage transition. |
| Display | 32–36px / 1.1 | 600 | Page heroes (Home, Solved, Stats, Onboarding). |
| Section | 22–24px / 1.2 | 600 | New-game difficulty names, in-page H2s. |
| Subheading | 18px / 1.4 | 600 | Solving "Today's Daily" header. |
| Body | 15–16px / 1.65–1.7 | 400 | All prose. Reading-width 50–58ch. |
| Kicker | 12px / 0.16em tracking | 500 uppercase | brand-600 above heroes. |
| Masthead label | 11px / 0.16em tracking | 500 uppercase | Section labels, byline-style chrome. |
| Cell numerals | 24px JetBrains Mono, tabular-nums | 500 | Board. |

All in Inter (UI) per tokens, no 700 weight anywhere. Italics carry editorial weight (bylines, pull quotes, footers).

## Interaction-model decisions

1. **Home is a magazine front page.** Top of grid is a real masthead with date. The daily gets a kicker / display head / 2-sentence dek / metadata row / resume affordance — the same anatomy as a featured article. Other puzzles live below as a tighter editorial list. Stats + stage live as italic byline chrome at the bottom of the page.
2. **New-game is a reading list, not a button grid.** Each difficulty is a paragraph with a 22–24px heading. Tapping the heading enters the game. Locked rungs read like editor's notes — italic "unlock when you've shown…" copy.
3. **Solving keeps the board hero, makes everything around it editorial.** The board is full-width, 2px ink-stroke border, 12px radius. The toolbar is underline-on-active text links ("Notes · Hint · Clear · Undo") rather than chip buttons. The number rail is a row of mono-numeral buttons. The contradiction stepper is a numbered prose `<ol>` with each step coloured by chain role (amber / blue / red / emerald), reading like marginalia.
4. **Solved is an epilogue.** The solve time gets one display row. The reflection is two prose paragraphs (technique mix written out as English, not just chart bars — though a small inline histogram is provided for reference). Pull quote closes it. Share is a quiet underline link, "Next" is the primary brand link.
5. **Stage-up is the most magazine-feeling moment** as briefed. Full-screen pull-quote: *"You're an Advanced player now."* with branded curly quotes. Stage progression dots run across the top of the page-body. Two short paragraphs beneath. Continue is a quiet brand-600 link, not a slab CTA.
6. **No modals during solving.** Hints surface as the prose stepper underneath the board. The technique-label chip in the stepper header says "technique · hint" — a quiet ascription, like a print caption.

## Brand voice notes applied

- Copy reads adult-paced. "A puzzle for people who like to think slowly." "Patience is the first technique." "The numbers above are for you, not for anyone else."
- No exclamation marks anywhere. No emoji. No "Try harder!" framing.
- Streaks are mentioned but never punished — Stats explicitly says "if you miss a day, nothing breaks; we just stop counting until you're back."
- Brand-600 used as section colour cue, never as a flat fill on hero surfaces. It anchors kickers, accent words in body copy, and the primary link in each page foot.

## Open question

**Is "Continue" the right verb on the stage-up screen, or should it be something less directional?** The pull-quote layout reads ceremoniously, and a bottom-right "Continue →" link feels slightly utilitarian against it. Alternatives considered: "Begin Hard" (commits the player to a difficulty they may not be ready for tonight), "Back to today" (more honest to the no-pressure tone), or no link at all and dismiss with a tap anywhere. Recommendation: probably "Back to today" — the stage transition is a recognition, not a fork in the road.

# Variant 06 — Editorial

**Angle.** Text-led, magazine-paced. The product reads like an editorial section — generous whitespace, large display type, pull-quote moments, a slow rhythm. The puzzle is a chapter inside a larger reading experience. Reference brands: Stripe Press, Are.na editorial, NYT Games homepage, NPR.org reading.

**Hypothesis being tested.** Puzzles are a quiet pleasure. Treating the surrounding app as editorial-paced — not game-paced — might be the right fit for the brand voice (*quiet, focused, adult*) and the target audience (people who do Sudoku on Sundays, not players grinding levels).

---

## Interaction principles for this variant

- **Generous vertical rhythm.** 24px / 32px spacing between blocks. Type-led hierarchy with very large headings (`text-display` 32px and even bigger for hero moments — up to 48px for the hero feels right).
- **Long-form copy.** Body text is real prose, not microcopy. The Home screen reads like a small column — "Today's puzzle, and what to notice about it." 2–3 sentences of context for the daily.
- **Pull quotes.** A signature element: occasional 1-line quotes set in italics, centered, with extra space above and below. Used sparingly for moments worth pausing on.
- **Serif accent.** Headings stay in Inter (per tokens), but feel free to use Inter's tighter weights and broader spacing to evoke a print feel. Avoid system-y compactness.
- **Reading-width content** even on a mobile screen — line length ~50–65 characters where prose appears.
- **Section dividers** — thin rules between blocks, never heavy. `1px solid border` is enough.

---

## Screen-by-screen interpretation

1. **Auth.** A single editorial page: a title ("Tectonic"), a 2-paragraph essay introducing the app ("A puzzle for people who like to think slowly. We'll start you with the basics and grow harder as you grow better."), then auth options as quiet text-button choices at the end.
2. **Onboarding.** Long-form. A page that scrolls through the rules as prose: "Each cage must contain the numbers 1 through N, where N is the size of the cage. Cells that touch — including diagonally — cannot share a number." Inline tutorial puzzles appear as boxed asides within the prose, each with a 1-sentence intro.
3. **Home.** A magazine front page. Top: today's date as a section masthead. Hero: the daily puzzle with a 2–3 sentence context ("Today's daily is a Medium 5×5 that rewards looking at where a value can go, not just what it must hold. Average solve: 4 minutes."). Below: "Other puzzles" as a small editorial list with brief descriptions ("Practice (Easy 5×5): solve as many as you'd like. No timer."). Stats and stage appear as small italic chips at the page bottom, like a print byline.
4. **New game.** A reading-list page. Each difficulty is a paragraph: "Hard. Asks you to read a cell's neighborhood — what other cells force this one. Unlocked when you've shown you understand hidden singles." The difficulty name is a heading, the description is body. Tap heading to start.
5. **Solving.** A surprise: the board is huge and central, with generous whitespace around it. The toolbar is text-link style ("Notes · Hint · Clear" as plain underline-on-hover text, not buttons). Contradiction stepper appears as a numbered prose list below the board: "1. Suppose this cell is 3. 2. Then this neighbor must be 1, …"
6. **Solved.** An editorial epilogue. "Solved in 2:14 — faster than your average for Hard." A 1-paragraph reflection by the engine on what the player did (technique usage as prose, not a chart). Share button is a quiet "Share this solve →" link.
7. **Stats.** A reading-paced view. Each metric is a short paragraph: "You've solved 47 Medium puzzles. Your average time has come down 38 seconds over the past month. Hidden singles are now familiar — you self-apply them in 4 of 5 puzzles." Charts are small and inline, not the focus.
8. **Stage-up.** The most magazine-feeling moment. Full screen, very large display type centered. A pull-quote layout: *"You're an Advanced player now."* Beneath, a paragraph of context. At the bottom, a small "Continue" link.

---

## What this variant should NOT do

- Don't get precious. Editorial doesn't mean flowery — keep the prose direct, just *paced*. Reading should feel calm, not lush.
- Don't add print-ish decorations (drop caps, ornamental dividers, "♦" between paragraphs) — those age fast.
- Don't go monochrome. The brand-600 cool blue-green still anchors moments; use it as a section-color cue.
- Don't lose the board's visual primacy on Solving. The page may be editorial, but the puzzle is still the work.

---

## Output reminder

8 HTML screens + `index.html` + `STATUS.md`. Render in 390×844 portrait. Use Inter's variable weights with confidence — try heading variants at 600 with tight letter-spacing and body at 400 with looser line-height than the other variants.

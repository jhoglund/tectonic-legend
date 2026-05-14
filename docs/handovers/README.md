# Handovers

End-of-session notes for picking up multi-session work. One file per session that you couldn't finish in a single sitting.

## When to write a handover

- You're stopping mid-feature and the next session needs context that's not in the code.
- You ran into a decision you couldn't make alone and the next session needs to start there.
- You produced exploratory work (prototypes, scratch branches) that the next session should evaluate before continuing.

## When NOT to write a handover

- The PR description covers it.
- The work is done and merged.
- A `docs/backlog.md` line is enough.

## Format

```markdown
# Handover — YYYY-MM-DD — <slug>

**Branch:** feature/<name>
**Status:** in progress | paused | needs decision

## What's done
- …

## What's next
- …

## Open question / decision needed
- …

## Files touched
- path/to/file.ts — what changed
```

## Lifecycle

When the work picks back up and lands, delete the handover. Handovers are not history — `git log` is. They are a baton for the next session.

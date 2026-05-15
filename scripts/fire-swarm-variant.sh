#!/usr/bin/env bash
# Fire one swarm variant through Open Design's daemon API.
# Usage: scripts/fire-swarm-variant.sh <variant-folder-name>
# Example: scripts/fire-swarm-variant.sh 01-ios-native

set -euo pipefail

VARIANT="${1:?variant folder name required, e.g. 01-ios-native}"
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SWARM="$REPO_ROOT/prototypes/swarm-2026-05-14"
VARIANT_DIR="$SWARM/$VARIANT"

if [ ! -d "$VARIANT_DIR" ]; then
  echo "Variant folder not found: $VARIANT_DIR" >&2
  exit 1
fi
if [ ! -f "$VARIANT_DIR/BRIEF.md" ] || [ ! -f "$VARIANT_DIR/PROMPT.md" ]; then
  echo "Variant folder missing BRIEF.md or PROMPT.md" >&2
  exit 1
fi

OD="${OD_HOST:-http://open-design.test}"

# 1. Import the variant folder as an OD project
IMPORT=$(curl -sS -X POST "$OD/api/import/folder" \
  -H 'content-type: application/json' \
  -d "$(jq -n --arg baseDir "$VARIANT_DIR" --arg name "swarm/$VARIANT" --arg skill "frontend-skill" \
    '{baseDir:$baseDir, name:$name, skillId:$skill}')")

PROJECT_ID=$(echo "$IMPORT" | jq -r '.project.id // .id // empty')
CONV_ID=$(echo "$IMPORT" | jq -r '.conversation.id // .conversationId // empty')
if [ -z "$PROJECT_ID" ]; then
  echo "Import failed: $IMPORT" >&2
  exit 1
fi

# 2. Compose the user message (short — agent reads files via cwd)
MSG="You are running variant \`$VARIANT\` of the Tectonic swarm. Your project root contains BRIEF.md (the shared swarm context) and PROMPT.md (your specific angle). Read BOTH files completely before doing anything else.

Produce exactly the 8 HTML screens specified in BRIEF.md §6, plus an index.html for side-by-side review and a STATUS.md capturing your direction and decisions. Render each screen as if it's a 390×844 portrait iPhone viewport. Stick rigorously to the tokens in BRIEF.md §4 — no arbitrary colors, no off-spec type weights, no bouncy springs. Your variant's interaction model is defined in PROMPT.md; honor it across every screen.

Begin by writing a short plan (which screens, in what order, design direction picked). Then build."

# 3. Fire the chat run
RUN=$(curl -sS -X POST "$OD/api/runs" \
  -H 'content-type: application/json' \
  -H 'x-od-client: web' \
  -d "$(jq -n \
      --arg agentId "claude" \
      --arg projectId "$PROJECT_ID" \
      --arg conversationId "$CONV_ID" \
      --arg skillId "frontend-skill" \
      --arg message "$MSG" \
      '{agentId:$agentId, projectId:$projectId, conversationId:$conversationId, skillId:$skillId, message:$message, model:"default"}')")

RUN_ID=$(echo "$RUN" | jq -r '.runId // empty')
if [ -z "$RUN_ID" ]; then
  echo "Run failed to start: $RUN" >&2
  exit 1
fi

echo "$VARIANT projectId=$PROJECT_ID runId=$RUN_ID"

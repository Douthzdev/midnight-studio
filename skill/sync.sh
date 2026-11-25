#!/bin/bash
# Sync Claude's memory notes into the skill's references/, then commit + push the whole studio repo.
# usage: bash skill/sync.sh "message"
set -e
REPO="M:/Google/hyperframes/Midnight-Studio"; MEM="M:/CLAUDE/c-drive/dot-claude/projects/M--CLAUDE/memory"
mkdir -p "$REPO/skill/midnight-studio/references"
cp "$MEM"/*.md "$REPO/skill/midnight-studio/references/"
for s in hyperframes hyperframes-core hyperframes-cli hyperframes-animation hyperframes-audio hyperframes-creative hyperframes-studio hyperframes-keyframes hyperframes-registry media-use earshot real-sound reverse-any-video motion-graphics talking-head-recut embedded-captions; do rm -rf "$REPO/skill/deps/$s"; mkdir -p "$REPO/skill/deps"; cp -r "$HOME/.claude/skills/$s" "$REPO/skill/deps/$s"; done
cd "$REPO"
git add -A
git diff --cached --quiet && { echo "nothing to sync"; exit 0; }
git commit -q -m "${1:-sync: studio + skill}" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
git push -q origin main && echo "pushed: $(git log -1 --oneline)"

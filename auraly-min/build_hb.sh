#!/bin/bash
# Glass Clean build for the hook+body batch: build_hb.sh [--render] [slug filter]
export PATH="/m/CLAUDE/tools/ffmpeg/bin:$PATH" HYPERFRAMES_EXTRACT_CACHE_DIR=M:/CLAUDE/tools/hf-frames TMPDIR=M:/CLAUDE/tools/hf-frames TEMP=M:/CLAUDE/tools/hf-frames TMP=M:/CLAUDE/tools/hf-frames
cd "M:/Google/hyperframes/Midnight-Studio/auraly-lineart"
for av in "Marva|marva" "Mateo|mateo" "Selena|selena" "Sienna|sienna"; do
  IFS='|' read -r name key <<< "$av"
  for r in 1 2 3 4; do
    slug="r${r}_${key}"; [ -n "$2" ] && [[ "$slug" != *$2* ]] && continue
    echo "=== $slug"
    node tools/overlay.mjs "M:/Google/hyperframes/Midnight-Studio/auraly-min/src/$slug.mp4" "$name" "$slug" "../auraly-min/scripts/hb_r$r.json" $1 2>&1 | grep -v '^GAP 0.0' | grep -E 'skipped|CLASH|GAP|cut |Error|error|wrote|VIDEOS' | cut -c1-200
  done
done

#!/bin/bash
# Glass Clean (+ colour tones, + pick-a-card hook on p4) for the 2026-11-27 batch: build_p.sh [--render] [slug filter]
export PATH="/m/CLAUDE/tools/ffmpeg/bin:$PATH" HYPERFRAMES_EXTRACT_CACHE_DIR=M:/CLAUDE/tools/hf-frames TMPDIR=M:/CLAUDE/tools/hf-frames TEMP=M:/CLAUDE/tools/hf-frames TMP=M:/CLAUDE/tools/hf-frames
IN="M:/Google/hyperframes/VIDEOS PARA EDITAR"; SRC="M:/Google/hyperframes/Midnight-Studio/auraly-min/src"
cd "M:/Google/hyperframes/Midnight-Studio/auraly-lineart" && node ../auraly-min/scripts/mk_p.mjs
while IFS='|' read -r slug name file; do
  [ -n "$2" ] && [[ "$slug" != *$2* ]] && continue
  [ -z "$file" ] && file="$SRC/$slug.mp4" || file="$IN/$file"
  echo "=== $slug"
  node tools/overlay.mjs "$file" "$name" "$slug" "../auraly-min/scripts/$slug.json" $1 </dev/null 2>&1 | grep -E 'skipped|CLASH|GAP|cut |Error|error|delivered' | cut -c1-220
done <<'LIST'
p1_marva|Marva (data)|Marva Lohris.mp4
p2_marva|Marva 2 (data)|Marva Lohris (1).mp4
p3_marva|Marva 3 (data)|Marva Lohris - GPT.mp4
p4_marva|Marva 4 (data)|
p1_mateo|Mateo (data)|Mateo Fernandez.mp4
p2_mateo|Mateo 2 (data)|Mateo Fernandez (1).mp4
p3_mateo|Mateo 3 (data)|Mateo Fernandez - GPT.mp4
p4_mateo|Mateo 4 (data)|
p1_selena|Selena (data)|Selena Blake.mp4
p2_selena|Selena 2 (data)|Selena Blake (1).mp4
p3_selena|Selena 3 (data)|Selena Blake - GPT.mp4
p4_selena|Selena 4 (data)|
p1_sienna|Sienna (data)|Sienna Mary.mp4
p2_sienna|Sienna 2 (data)|Sienna Mary (2).mp4
p3_sienna|Sienna 3 (data)|Sienna Mary - GPT.mp4
p4_sienna|Sienna 4 (data)|
LIST

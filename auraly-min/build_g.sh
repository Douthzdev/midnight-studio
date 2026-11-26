#!/bin/bash
# Glass Clean build for the 2026-11-26 GPT batch (14 standalone videos): build_g.sh [--render] [slug filter]
export PATH="/m/CLAUDE/tools/ffmpeg/bin:$PATH" HYPERFRAMES_EXTRACT_CACHE_DIR=M:/CLAUDE/tools/hf-frames TMPDIR=M:/CLAUDE/tools/hf-frames TEMP=M:/CLAUDE/tools/hf-frames TMP=M:/CLAUDE/tools/hf-frames
IN="M:/Google/hyperframes/VIDEOS PARA EDITAR"
cd "M:/Google/hyperframes/Midnight-Studio/auraly-lineart"
while IFS='|' read -r slug name file; do
  [ -n "$2" ] && [[ "$slug" != *$2* ]] && continue
  echo "=== $slug"
  node tools/overlay.mjs "$IN/$file" "$name" "$slug" "../auraly-min/scripts/g_${slug%%_*}.json" $1 2>&1 | grep -E 'skipped|CLASH|GAP|cut |Error|error|delivered' | cut -c1-200
done <<'EOF'
a_marva|Marva|Marva Lohris - GPT - Fala.mp4
b_marva|Marva|Marva Lohris - GPT.mp4
c_marva|Marva|Marva_Lohris_-_GPT.mp4
a_mateo|Mateo|Mateo Fernandez - GPT - Fala.mp4
b_mateo|Mateo|Mateo Fernandez - GPT.mp4
c_mateo|Mateo|Mateo_Fernandez_-_GPT.mp4
d_mateo|Mateo|Mateo_Fernandez__2.mp4
a_selena|Selena|Selena Blake - GPT - Fala.mp4
b_selena|Selena|Selena Blake - GPT.mp4
c_selena|Selena|Selena_Blake_-_GPT.mp4
a_sienna|Sienna|Sienna Mary - GPT - Fala.mp4
b_sienna|Sienna|Sienna Mary - GPT.mp4
c_sienna|Sienna|Sienna_Mary_-_GPT.mp4
d_sienna|Sienna|Sienna Mary__2.mp4
EOF

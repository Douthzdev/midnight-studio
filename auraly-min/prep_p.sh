#!/bin/bash
# 2026-11-27 "pick a card" batch: 4 avatars x (3 standalone videos + 1 tarot hook joined to its body) -> src/<slug>.mp4/.wav + transcript
export PATH="/m/CLAUDE/tools/ffmpeg/bin:$PATH" HYPERFRAMES_EXTRACT_CACHE_DIR=M:/CLAUDE/tools/hf-frames TMPDIR=M:/CLAUDE/tools/hf-frames TEMP=M:/CLAUDE/tools/hf-frames TMP=M:/CLAUDE/tools/hf-frames
IN="M:/Google/hyperframes/VIDEOS PARA EDITAR"; cd "M:/Google/hyperframes/Midnight-Studio/auraly-min/src"
while IFS='|' read -r slug f1 f2; do
  [ -f "t_$slug/transcript.json" ] && continue
  if [ -n "$f2" ]; then # 720p/24 fps hook + body -> 1080x1920 30 fps CFR
    ffmpeg -nostdin -v error -y -i "$IN/$f1" -i "$IN/$f2" -filter_complex \
      "[0:v]fps=30,scale=1080:1920:flags=lanczos,setsar=1,setpts=PTS-STARTPTS[v0];[1:v]fps=30,scale=1080:1920,setsar=1,setpts=PTS-STARTPTS[v1];[0:a]aresample=48000:async=1:first_pts=0,aformat=channel_layouts=stereo[a0];[1:a]aresample=48000:async=1:first_pts=0,aformat=channel_layouts=stereo[a1];[v0][a0][v1][a1]concat=n=2:v=1:a=1[v][a]" \
      -map "[v]" -map "[a]" -c:v h264_nvenc -preset p5 -cq 18 -c:a aac -b:a 192k "$slug.mp4"
    src="$slug.mp4"
  else src="$IN/$f1"; fi
  ffmpeg -nostdin -v error -y -i "$src" -ac 1 -ar 16000 "$slug.wav"
  PATH="M:\CLAUDE\tools\ffmpeg\bin;$PATH" npx hyperframes@0.9.67 transcribe "$slug.wav" -d "t_$slug" --json </dev/null >/dev/null 2>&1
  echo "$slug words=$(node -e "console.log(require('./t_$slug/transcript.json').length)" 2>/dev/null)"
done <<'LIST'
p1_marva|Marva Lohris.mp4
p2_marva|Marva Lohris (1).mp4
p3_marva|Marva Lohris - GPT.mp4
p4_marva|Marva Lohris - Hook Tarot.mp4|Marva Lohris (body.mp4
p1_mateo|Mateo Fernandez.mp4
p2_mateo|Mateo Fernandez (1).mp4
p3_mateo|Mateo Fernandez - GPT.mp4
p4_mateo|Mateo Fernandez - Hook Tarot.mp4|Mateo Fernandez body.mp4
p1_selena|Selena Blake.mp4
p2_selena|Selena Blake (1).mp4
p3_selena|Selena Blake - GPT.mp4
p4_selena|Selena Blake - Hook Tarot.mp4|Selena Blake body.mp4
p1_sienna|Sienna Mary.mp4
p2_sienna|Sienna Mary (2).mp4
p3_sienna|Sienna Mary - GPT.mp4
p4_sienna|Sienna Mary - Hook Tarot.mp4|Sienna Mary body.mp4
LIST

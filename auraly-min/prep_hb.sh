#!/bin/bash
# Join hook + body (fala) for each avatar/script into src/<slug>.mp4 (1080x1920, 30 fps CFR, 48k audio), then wav + transcript.
export PATH="/m/CLAUDE/tools/ffmpeg/bin:$PATH" HYPERFRAMES_EXTRACT_CACHE_DIR=M:/CLAUDE/tools/hf-frames TMPDIR=M:/CLAUDE/tools/hf-frames TEMP=M:/CLAUDE/tools/hf-frames TMP=M:/CLAUDE/tools/hf-frames
IN="M:/Google/hyperframes/VIDEOS PARA EDITAR"; cd "M:/Google/hyperframes/Midnight-Studio/auraly-min/src"
for av in "Marva Lohris|Marva R01|marva" "Mateo Fernandez|Mateo R01|mateo" "Selena Blake|Selena R01|selena" "Sienna Mary|Siena R01|sienna"; do
  IFS='|' read -r full r1 key <<< "$av"
  for r in 1 2 3 4; do
    slug="r${r}_${key}"; [ -f "t_$slug/transcript.json" ] && continue
    hook="$IN/$full - R0$r - Hook.mp4"; body="$IN/$full - R0$r - Fala.mp4"; [ $r = 1 ] && body="$IN/$r1.mp4"
    ffmpeg -v error -y -i "$hook" -i "$body" -filter_complex \
      "[0:v]fps=30,scale=1080:1920:flags=lanczos,setsar=1,setpts=PTS-STARTPTS[v0];[1:v]fps=30,scale=1080:1920,setsar=1,setpts=PTS-STARTPTS[v1];[0:a]aresample=48000:async=1:first_pts=0,aformat=channel_layouts=stereo[a0];[1:a]aresample=48000:async=1:first_pts=0,aformat=channel_layouts=stereo[a1];[v0][a0][v1][a1]concat=n=2:v=1:a=1[v][a]" \
      -map "[v]" -map "[a]" -c:v h264_nvenc -preset p5 -cq 18 -c:a aac -b:a 192k "$slug.mp4"
    ffmpeg -v error -y -i "$slug.mp4" -ac 1 -ar 16000 "$slug.wav"
    PATH="M:\\CLAUDE\\tools\\ffmpeg\\bin;$PATH" npx hyperframes@0.9.67 transcribe "$slug.wav" -d "t_$slug" --json >/dev/null 2>&1
    echo "$slug $(ffprobe -v error -show_entries format=duration -of csv=p=0 "$slug.mp4") words=$(node -e "console.log(require('./t_$slug/transcript.json').length)" 2>/dev/null)"
  done
done

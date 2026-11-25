---
name: avatar-batch-editor
description: tools/batch.mjs — the avatar batch editor (viral + split + clean captions) used for the 2026-11-22 batch; how to run it and where output goes
metadata:
  type: project
---

`node tools/batch.mjs <video.mp4> <body|candle|money|selfie> <AvatarName> [hook.mp4] [--render]` in `M:\Google\hyperframes\Midnight-Studio\auraly-lineart`. Built for the 2026-11-22 batch (folder `M:\Google\hyperframes\VIDEOS PARA EDITAR`, 4 scripts × 4 avatars; the "BODY" files + "hook <name>" are the hook+body set). Jobs list: `Midnight-Studio\auraly-batch\jobs.txt`; transcripts in `auraly-batch\src\t_<slug>`.

- Output: `M:\Google\hyperframes\VIDEOS EDITADOS\<Avatar>.mp4`, then `<Avatar> 2.mp4`… (avatar-name rule, see [[midnight-folder-and-md-naming]]).
- Silence cut = silencedetect ∪ transcript word gaps > 0.45 s (outdoor selfies have noise that hides pauses); NVENC encode.
- One PLAN per script (phrases matched on each avatar's own transcript, falls back to first 2 words, else the moment is skipped): glass cards on the chest (selfie: lower, cardTop 1190), 3–4 split screens, profile split at the end. Captions: word blur-in, keywords in gold serif with glow, trigger words gold.
- Sound kept sparse (cards = soft pop 0.16, splits = whoosh, hits/bells/sting only on key beats).
The 4 scripts are the same copies as line-art v14–v17 (selfie=future-you, money, candle=wish, body=seals/222).

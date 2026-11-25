---
name: kinetic-iconmap-format
description: "Edit OPTION \"Tipografia cinética + ícone-mapa\" (from the 'triple hook' reference, 2026-11-23): word-by-word sized/colored type IS the art, thin white line icons, one neon accent, a central icon that tracks the steps; breakdown in ref-saveclip2/DECUPAGEM.md; not built yet"
metadata:
  node_type: memory
  type: project
  originSessionId: f27a5dbd-4947-4230-9f38-da10d7c5300a
  modified: 2026-11-24T00:05:18.664Z
---

On 2026-11-23 the user asked to break down a reference Reel ("The triple hook") and add it to the base of style options, extracting its essence so it can be applied to other videos and copies. Breakdown: `M:/Google/hyperframes/Midnight-Studio/ref-saveclip2/DECUPAGEM.md` (+ sheet1/2.png, detail.png, transcript).

**Essence**
- Faceless, no cuts, 49 s, black background with a vignette.
- The spoken sentence builds up word by word in a left-aligned block in the top third. Each word's size and style follow its weight:
  - small sans for filler words;
  - huge black sans for load words;
  - italic serif for concept words;
  - red neon glow for impact words.
- A thin white line icon draws literally what is being said (UI cards, chart, eye, fish, arrows).
- A central "icon-map" (a 3-prong hook with labels 1/2/3) comes back at each step and the finished part turns red. This shows progress and holds retention.
- Something new on screen every 1–2 s.
- Transitions without cuts: push-in, a red vertical sweep, full blur.
- -14 LUFS, constant, fast didactic voice-over.

**How to apply**
- Any list or steps copy fits (3 signs / 3 steps / 2 signs).
- The icon-map becomes the copy's own symbol (3-flame candle, moon phases, 3 tarot cards).
- Single accent in Midnight gold #F1D29E instead of red.
- Faceless: deliver as MD n ([[lineart-motion-pipeline]]).
- Hybrid: face card at the bottom, kinetic type on top; this replaces captions ([[minimal-headline-format]]).
- Icons are always rebuilt from each copy, same rule as [[moon-ritual-lineart-format]].

**Built 2026-11-23: `auraly-lineart/tools/kinetic.mjs`, first test = MD 20 ("Make a wish" copy).**
- Voice: Kokoro af_heart 1.0, `vo/v20` (tts_lines.py takes the output name WITHOUT .wav).
- A real 5 s pause is inserted after "five seconds" for a gold countdown.
- Icon-map is the wish star with 3 rays (1 INTERACT / 2 SEND / 3 WATCH). It docks at the bottom and each tag lights gold as its step is said.
- Text spec: `"spoken=shown|style"`, where style is s / b / r / g, and `/` breaks the line.
- Music MORNING LIGHTT at voI−17; loudnorm −14 LUFS.
- Waiting for the user's verdict.

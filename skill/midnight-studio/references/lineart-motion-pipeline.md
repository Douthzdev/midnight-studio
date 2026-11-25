---
name: lineart-motion-pipeline
description: Faceless line-art motion-graphics Reels pipeline for Auraly (3 tests built 2026-11-17) — where it lives and how to regenerate
metadata:
  node_type: memory
  type: project
  originSessionId: 474ec1f9-216b-439c-b5ed-8dd68f4c7a2b
  modified: 2026-11-18T05:49:11.999Z
---

Faceless neon line-art explainer Reels (style from the 11/11 portal reference) live in `M:\Google\hyperframes\Midnight-Studio\auraly-lineart\`: `vo/*.txt` scripts (one phrase per line), `tools/tts_lines.py` (Kokoro via venv `M:\CLAUDE\tools\kokoro-venv`, set HYPERFRAMES_PYTHON to it), `tools/videos.mjs` shot lists, `tools/build.mjs vN` regenerates the HyperFrames project from Parakeet word timings. Finals: `M:\Google\hyperframes\Midnight-Studio\auraly-lineart-N-*-final.mp4`.

User chose free local TTS for tests; has ElevenLabs login but no API key yet. HeyGen CLI not installed, so no catalog music — reused music.mp3 from avatar-video-2/5/6.

Videos 4–11 (2026-11-18) use `tools/videos2.mjs` and the user's music bank `C:\Users\Vinicius\Music\Songs Auraly UGC` (user said the first 22 are good; build.mjs auto-levels music 15 dB under the voice since tracks range -30 to -9 LUFS). Per-video `trigger`, CTA `big/sub`, caption `fix` (`word#n` = n-th occurrence).

Videos 12–13 (2026-11-18, `tools/videos3.mjs`) set `fx: true`: camera punch-in/drift, blur exit, light motes, cut flash, and SFX auto-placed from scene cues (whoosh on cuts, riser into CTA, hit on bigText, tick on labels, bells on card lift, sting on CTA) using the earshot-bank kit in `sfx/kit/`. Old videos are unchanged unless they set fx. User wants new videos tested, not old ones redone.

User feedback on v12–13 (2026-11-18): liked it, wants to keep refining per batch toward richer drawings: more strokes/detail, some more "realistic" elements, less bare single-line art.

`rich: true` (v13r, 2026-11-18) adds offset echo lines, stronger glow, detailed figures (hair/collar/folds/hatching), `cardFace` tarot faces (sun/star/moon) with a flip, and a nebula + smooth ridge backdrop with parallax. `vo:` lets a variant reuse another video's voice. User chose to skip AI images (HeyGen) for now; keep visuals code-drawn.

**Why:** user asked to make more of these from the funnel brief (video → 3-card pick → VSL → checkout).
**How to apply:** for new variants, add a script + entry in videos.mjs instead of rebuilding from scratch. Follows [[auraly-video-edit-playbook]] CTA rules.

Videos 14–17 (2026-11-22, `tools/videos4.mjs`): user asked for the neon line-art "bonito, CLARO, DIFERENCIADO". New per-video flags in build.mjs: `bg` (luminous radial gradient per video — dawn violet, emerald, starry blue, royal plum — instead of near-black), `glow` (rich-mode glow colour), `calm` (drops tick/pop SFX; only whoosh/hit/bell/riser/sting — user said too many SFX was cluttered). Ridges become translucent tints when `bg` is set. Each video got its own drawings (breathing ring that expands/contracts with the voice, countdown seg7 with draining ring, brain + synapses, six "money forms" tiles, chains breaking, padlock unlock, 3 seals). Kokoro says "222" as "two two two" → transcript "too too," (fix: {"too":"222","too,":""}).

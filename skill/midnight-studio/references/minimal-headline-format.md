---
name: minimal-headline-format
description: "Edit option \"Minimal headline\" (split + clean, uncluttered) — tools/minimal.mjs + per-script JSON; first batch 2026-11-22 (12 videos, 3 scripts)"
metadata:
  node_type: memory
  type: project
  originSessionId: 06929af7-f385-4ab8-a68c-1052b70e9a30
  modified: 2026-11-23T20:08:32.512Z
---

2026-11-22: user asked for "algo mais minimalista", catchy headline, a mix of split-panel + clean kinetic, good captions, not cluttered, fluid animations. Built `auraly-lineart/tools/minimal.mjs <video> <Avatar> <slug> <script.json> [--render]` (workspace `Midnight-Studio/auraly-min/`, transcripts in auraly-min/src/t_<slug>, configs in auraly-min/scripts/{zodiac,wish,archangel}.json, jobs.txt).

Look: black top band (430px) with fixed headline (Inter 900 caps + Instrument Serif italic gold #F1D29E line, gold rule), face pushed down with feathered top edge; on 5–7 beats the band grows into a panel (one idea: small spaced label + big word/number, serif accent, drawing gold arc) while the face shrinks into a rounded card (y 800, scale .76) — at full-screen face push the captions landed on the eyes; one-line captions ≤3 words, word blur-in, accent words serif gold; slow sine camera drift; sound = voice + quiet bed + soft whoosh only on panel moves. Countdown beats use "count" (number swaps per spoken word).

Input videos arrived pre-cut ("cut by @gstalves"), still ran vad.py (~4–5 s breaths removed) + edits.json glitch drops ([[ai-avatar-glitch-cleanup]]). Output avatar-name rule ([[midnight-folder-and-md-naming]]). Avatar IDs by face: brunette long hair = Marva, buzzcut+glasses = Selena.  Related: [[clean-kinetic-format]] (its hybrid was rejected as cluttered — this one keeps one event at a time).

FEEDBACK 2026-11-22 (v1 batch): user loved the edit, captions, cuts and breath removal, but:
- **Headline must show only in the first ~5 s** (obvious hook rule, never keep it fixed) — now HEADT=5, then the face rises to full screen.
- Wanted more visuals tied to speech → v2 adds gold line icons that draw themselves inside panels (ART: sparkle, hourglass, eye, stars, spot, zodiac, wings, chain, clock, candle, heart, karma) and white stickers with icons beside the face on keywords (only while face is full, auto-skipped when clashing with panels).
- Countdown was "rushed" → spoken counts get frozen-frame pads (tpad/apad) so each number holds ~1 s, shown full screen with a draining ring + tick.
- 2026-11-23 "glow" look (`"look":"glow"` in script JSON; configs y2027/scroll/heir, jobs2.txt): user asked for a headline written on with glow near/above the avatar (no black band, still only 5 s), pretty, visible and animated captions (uppercase karaoke: word pops in, spoken word flashes gold), light glass pop-ups with sparkle bursts, and **something new on screen every ~5 s** (script prints GAP lines >5.5 s). After breath cuts videos run ~27–32 s, so prefer stickers over panels where they collide.
- FEEDBACK on the glow batch (2026-11-23, no redo asked): **the headline must be fully readable from frame 0** (no slow letter-by-letter or serif line arriving ~1 s later; at most a very fast entrance) and must be a **strong, persuasive phrase** (curiosity/payoff), not a plain topic label. **Didn't like the uppercase karaoke captions with gold flashes** → captions should be white and in a more distinctive style. Next time, propose or try a new white caption look instead of reusing that one.
- White caption lab (`Midnight-Studio/caption-lab/build.mjs`, preview legendas-brancas.jpg/.mp4, 6 styles): user's FAVORITES = **3 Editorial serif** (white Inter 600 sentence case + key word in white Instrument Serif italic, blur-up), **4 Stacked kinetic** (left-aligned small words + huge uppercase key word below, slides in), **5 Sliding underline** (white Inter 800, white bar under the spoken word). Rejected: inverted box, outline fill, mono typewriter. Use these 3 in future avatar edits.
- CTA must be stronger → "comment" CTA = Instagram comment bar typing the keyword + finger tapping Post; "stories" CTA = avatar profile pic (frame crop) with spinning story ring, NEW badge, finger tapping + ripples.

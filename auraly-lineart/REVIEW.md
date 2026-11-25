# Auraly line-art tests — review notes (2026-11-17)

Three 9:16 faceless motion-graphics tests in the style of the 11/11 reference (grammar only: neon line-art on charcoal, portal, stars, silhouette, mono labels). All end on the funnel CTA "Comment 222 → choose your three cards".

| File | Theme | Voice | Length |
|---|---|---|---|
| v1-portal-1212 | 12/12 portal + Geminids (peak Dec 13–14, parent body 3200 Phaethon) | Kokoro af_heart | 49 s |
| v2-why-222 | Why you keep seeing 222 (evergreen) | Kokoro am_michael | 49 s |
| v3-year-message | Your year has a message (road → tower → star = Fool/Tower/Star arc, unnamed) | Kokoro af_heart | 39 s |

## How it's built
- `vo/*.txt` = scripts (one line per phrase). `tools/tts_lines.py` makes the VO with pauses (Kokoro, local, free).
- `tools/videos.mjs` = shot lists; `tools/build.mjs vN` regenerates the project from the VO timings (Parakeet transcript).
- Change copy → edit `vo/vN.txt`, rerun TTS + transcribe + build. Change a picture → edit its scene in `videos.mjs`.

## Measured vs not
- `check`: 0 errors on all three. Kept warnings: TikTok/YouTube right-edge safe zone on some captions (built for FB/IG Reels), contrast warnings on outlined numerals (stroke-only text, false positive).
- Snapshots reviewed per scene. Sound was measured, not heard.
- Music = the tracks already used in avatar-video-6/5/2 (provenance not verified by me). SFX = bundled whoosh/chime.

## Weakest points / next
- Kokoro voice is clean but flat; ElevenLabs would lift emotion (needs API key).
- Each scene's first ~0.3 s is sparse while lines draw on.
- Facts to double-check before posting V1: Geminid peak date shown as "DEC 13–14".

---
name: clean-kinetic-format
description: "Apple minimal kinetic typography" edit copied from a user reference (2026-11-20) — tools/clean.mjs, word-by-word blur captions with serif italic accent, light takeovers, bottom split, red impact screen
metadata:
  type: project
---

Third talking-head style (user asked to replicate a reference Reel exactly: animations, caption behaviour, pop-ups, SFX). Built `M:/Google/hyperframes/Midnight-Studio/auraly-lineart/tools/clean.mjs` (authored per video: BLOCKS = caption lines, SEGS = screen takeovers). First output: M:/Google/hyperframes/Midnight-Studio/auraly-clean-marva-bayleaf-final.mp4.

- Captions: blocks of lead (Inter 500 small grey) + main (Inter 800) + accent word in Instrument Serif italic; each word blur-in on its spoken time. This kinetic caption IS wanted here (user's explicit reference) — the older "kinetic rejected" rule ([[caption-style-kinetic-clean]]) applies to the other formats.
- Screens: light #F2F2F4 full takeover (blur-in), bottom split panel rising (face stays on top — check where the face sits first), one red #E8262C circle-wipe impact screen; iOS-style objects (ring counters synced to spoken numbers, Settings-style rows, phone chat, story ring + tap, tarot cards).
- SFX from earshot bank in sfx/clean/ (mouth_plop, lip_pop, pop_in, swipe, punch, tick, tap, ding, whoosh_glass); reference density ~4.5 onsets/s; keep pops ~0.2 volume so voice stays on top.
- Fonts: load Instrument Serif + Inter via Google Fonts <link> (hyperframes check fails without it).
- Gotcha: tween SVG ring progress with attr:{"stroke-dashoffset"} — GSAP's CSS strokeDashoffset is not scaled by pathLength in Chrome, rings showed full.
Silence cut + punch-ins as in [[split-panel-talking-head-format]]. Sibling styles: [[viral-motion-format]].

HYBRID "viral + Apple" (user request 2026-11-21): `node tools/clean.mjs <video.mp4> <slug> <transcriptDir> --hybrid` — same Apple typography/structure, viral look (dark aurora takeovers, opaque dark-glass split panel, glass tiles with glow, gold-gradient numbers and serif accents, focus brackets "MAKE A WISH" on the opening, screen shakes on impacts, gold sparkles at the end). First: M:/Google/hyperframes/Midnight-Studio/auraly-hybrid-selena-bayleaf-final.mp4. BLOCKS are per-script; the bay-leaf copy is shared by Marva and Selena.

FEEDBACK on the hybrid (2026-11-21): user DISLIKED it — felt like copy-paste of the styles we already had, and far too cluttered: too many SFX and too much happening on screen. **Why:** mixing two styles stacked every effect instead of making something new. **How to apply:** next time a mix/new style is asked, invent a fresh look instead of merging existing components; fewer on-screen events (one idea at a time, breathing room between takeovers) and sparser SFX (only on real beats, not every word/object).

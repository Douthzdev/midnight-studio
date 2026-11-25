---
name: viral-motion-format
description: "Viral motion-design talking-head edit (glass pop-up cards, glowing gradient numbers, split screen) built by tools/viral.mjs — test started 2026-11-19"
metadata:
  node_type: memory
  type: project
  originSessionId: 474ec1f9-216b-439c-b5ed-8dd68f4c7a2b
  modified: 2026-11-20T02:26:37.533Z
---

User asked (2026-11-19) for a "viral, hyped Claude/HyperFrames" style test: motion design with colorful glowing numbers, pop-ups, split screen, "more realistic/worked" than line art. Built `node M:/Google/hyperframes/Midnight-Studio/auraly-lineart/tools/viral.mjs <hook> <body>` (first test: selena hook + marva body → M:/Google/hyperframes/Midnight-Studio/auraly-viral-selena-marva-final.mp4, preview in auraly-viral/).

- Same silence-cut + jump-cut punch-in base as [[split-panel-talking-head-format]] (user wants no silences/dead air in every edit).
- Hook trimmed to the faceless close-ups (up to the cut into the table shot) — avoids showing a different avatar's face under another avatar's voice.
- Components: glass cards over the chest zone (y≈1000–1370), top banners/notifications, split screen (face shrinks to a glowing card, graphic on top), focus brackets "PAY ATTENTION", counters (+100%, 0→100% blessing), seal cards with 1/3-2/3-3/3 progress rings, "received" gold.
- Captions kept simple outlined (kinetic captions were rejected before, see [[caption-style-kinetic-clean]]).
Awaiting the user's verdict on this style vs the line-art split panel.

viral2.mjs (2026-11-22): `node tools/viral2.mjs <hook.mp4> <body.mp4> <Avatar> <slug> [--render]` — viral puro with vad.py hard cuts, beats authored for the copy 'Keep your mouth shut… Nov 22/23… comment I BELIEVE'; phrases missing in an avatar's transcript are skipped. Renders pin `npx hyperframes@0.9.67` (an unpinned npx tried to auto-install 0.9.80 mid-batch and failed).

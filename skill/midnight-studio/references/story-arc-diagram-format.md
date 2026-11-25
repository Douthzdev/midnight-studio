---
name: story-arc-diagram-format
description: "Edit option \"Diagrama neon (story arc)\" — top neon chart that draws with the speech + face in rounded card bottom; breakdown in ref-storyarc/DECUPAGEM.md; not built yet"
metadata:
  node_type: memory
  type: project
  originSessionId: 06929af7-f385-4ab8-a68c-1052b70e9a30
  modified: 2026-11-22T05:49:39.645Z
---

2026-11-22: user had me break down a reference reel (story-arc explainer) and asked to keep it as an **edit option we offer** — no test video yet. Always list it with the other options (viral puro, split, clean, line-art) when the user asks for "nossas opções de edição".

Full breakdown: `M:/Google/hyperframes/Midnight-Studio/ref-storyarc/DECUPAGEM.md` (+ sheet1-3.png contact sheets, detail.png).

Grammar: 3 layouts alternating every ~4 s — (A ~70%) black grid bg, title bold sans + italic serif, red neon line chart drawing in sync with words, white label tags/red tags popping per spoken term, virtual camera zoom/pan across the diagram, 1-word white captions above a rounded face card at the bottom; (B ~20%) full-face close; (C) app/site mockup for hook + CTA. Sound: soft continuous bed, riser at first chart, pops on tags, few whooshes, no heavy hits.

Built 2026-11-22: `node tools/arc.mjs <video> <Avatar> <slug> [--render]` (workspace auraly-arc/). First test = Selena candle2 copy ("Make a wish in the next five seconds") with a user-requested 5 s FULL-SCREEN timer inserted after "seconds" (gap baked into body.mp4). Beats are copy-specific inside arc.mjs — new copies need new scenes. Awaiting verdict. Gotchas: CSS stroke-dashoffset overrides the SVG attr GSAP tweens (put dash attrs on the element); mapT must send words inside cut stretches to the NEXT segment.

**How to apply:** build on arc.mjs on viral2's base: vad.py cut + edits.json glitch cleanup ([[ai-avatar-glitch-cleanup]]), avatar naming ([[midnight-folder-and-md-naming]]). Ask palette (red as ref vs Midnight gold/violet) only if unclear.

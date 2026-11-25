---
name: hook-recreation-workflow
description: How to deliver reference-video hook recreations for Google Flow (OmniFlash 1.1) per avatar — format the user approved
metadata:
  node_type: memory
  type: feedback
  originSessionId: 9bcfd8e5-5fb9-4c03-b545-1b21e99691ba
  modified: 2026-11-04T19:13:39.100Z
---

When the user sends a reference Reel + avatars: extract frames with FFmpeg (M:\CLAUDE\tools\ffmpeg), find the hook→talking cut with scene detection, then deliver per avatar: (A) hook first-frame image prompt, (B) Flow/OmniFlash 1.1 hook animation prompt, (C) first frame when the avatar starts talking. Prompts in English, explanation in Portuguese, no on-screen text, adapt the setting to each avatar's context. User approved this format on 2026-11-04 ("ficou tudo perfeitamente bem").

**Why:** user confirmed the format; also said hard cuts are fine.
**How to apply:** mirror the reference's editing — if the reference hook uses hard cuts, write the animation as separate shots/clips with hard cuts instead of forcing one continuous take. Only use a continuous shot when the reference does. Use avatar names from [[avatar-roster]].

---
name: midnight-folder-and-md-naming
description: "Where video projects/tools live and how every delivered video must be named (\"MD <n>.mp4\" in M:\\Google\\hyperframes\\Midnight Videos)"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 26be0d79-df99-4b8b-a8cd-4477a21c4619
  modified: 2026-11-21T20:45:44.156Z
---

ONLY the neon line-art motion videos are named **MD <number>** and placed in `M:\Google\hyperframes\Midnight Videos\` (user rule, 2026-11-22; "MD" = the page, Midnight). Use `node tools/deliver.mjs <file.mp4> <label>` (or `deliver()` from tools/media.mjs) — it picks the next free number and records it in `M:\Google\hyperframes\Midnight-Studio\md-ledger.json`. Old line-art finals kept their numbers (MD 1, 4, 5, 7–12, 14–17); new deliveries start at MD 18. Phone previews (>30 MB finals) are temporary — make them in the scratchpad, never in Midnight Videos.

**Why:** the user wants the hyperframes folder clean, with only one folder of tools/projects and one folder of numbered deliveries.

**How to apply:** all projects and tools now live in ONE folder, `M:\Google\hyperframes\Midnight-Studio\` (auraly-lineart = all scripts/voices/SFX, auraly-split, auraly-clean, auraly-viral, `_antigos\avatar-video-2/4/5/6` kept because videos.mjs uses their music). Never create new project folders loose in `hyperframes\` — put them inside Midnight-Studio. The user's own files at the hyperframes root (1.mp4, "MD POSTED*") are theirs: don't touch.


CORRECTION 2026-11-22: "Midnight Videos" / MD naming is ONLY for the faceless neon line-art motion videos. Avatar (talking-head) edits do NOT go there — they are named with the AVATAR'S NAME only (e.g. `Grant.mp4`; a second one of the same avatar → `Grant 2.mp4`) — user update 2026-11-22, replaces the earlier 'plain numbers'. tools/edit.mjs still calls deliver() for split edits — change it before the next avatar batch.

Avatar batch style requested 2026-11-22: viral look + split screen + a touch of clean (Apple) typography, measured and high quality, NOT cluttered (see feedback in [[clean-kinetic-format]]).
Captions for avatar batches (user, 2026-11-22): the pretty DYNAMIC caption with GLOW — word-by-word blur-in (clean.mjs style) with a glowing gold-gradient accent word, as in the hybrid. Overrides the old 'simple caption' rule for these edits.
Unidentified avatar (user, 2026-11-22): don't ask — name it with a question-mark look-alike, since Windows forbids '?' in filenames: use the fullwidth ？ (e.g. '？.mp4', then '？ 2.mp4').

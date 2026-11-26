---
name: overlay-popups-format
description: "Edit OPTION \"Glass Clean\" (user-approved 2026-11-24): footage untouched + dark-glass animated pop-ups, tools/overlay.mjs; template = auraly-min/scripts/laura.json"
metadata:
  type: project
---

**Style name: "Glass Clean"** (Vidro Clean). This is one of the saved edit OPTIONS: offer it by name for talking-head or multi-shot UGC when the footage should stay untouched. To reuse it, copy `auraly-min/scripts/laura.json` as the template, rewrite `head`, `accent` and `pops` from the new copy (each pop tied to a spoken phrase), then run overlay.mjs.

On 2026-11-23 the user asked for a Laura Risely edit (multi-shot AI UGC, digestion/bloating quiz ad). The brief:
- Don't move the screen.
- Put animated things on top, "minimalista clean" but attention-grabbing.
- Music that fits.
- Captions in the white style from the caption lab.

It was built as `auraly-lineart/tools/overlay.mjs <video> <Name> <slug> <script.json> [--render]`. The config is `auraly-min/scripts/laura.json` and the output was `VIDEOS EDITADOS/Laura.mp4`.

**Look:**
- Dark smoky glass cards (blur 22) with white line icons and one sage accent (#A8E6BE), plus coral (#FF9C86) for "problem".
- Pop-up types:
  - chip
  - card
  - question
  - day (a Morning/Lunch/Dinner line whose nodes light on the words; reused 3× as a motif)
  - list (items preview at 20% and light up on their word; optional strike-through)
  - stats (count-up and timer ring)
  - pattern (dots connect into a line)
  - circle (a hand-drawn ellipse on a body detail, here the sock marks)
  - cta (button, tapping hand, bouncing down arrow)
- The headline is readable from frame 0 and gone at ~4.4 s.
- Captions use caption-lab style 3 (Editorial serif).
- Music was FKJ – Ylang Ylang.
- The script prints CLASH (same zone busy) and GAP (more than 5 s with nothing new).

**Source pitfall (fixed in overlay.mjs, port it to minimal.mjs and batch.mjs):** this mp4's audio track had timestamp jumps. The decoded wav was 0.8 s longer than the stream, and the video had PTS gaps. Cutting with `[0:a]atrim` produced 0.4–0.7 s of silence (breaths came back), and clamping to the video length clipped the last words.
- Fix:
  - Cut the audio from a decoded 48 k wav input.
  - Use `fps=30:start_time=0` on the video.
  - Snap keep boundaries to the 1/30 s grid.
  - Also cut silences over 0.14 s at −40 dB.
  - Hold the last frame when the audio runs past the video.
- Verify with `silencedetect` on `assets/voice.wav` (it should find nothing over 0.25 s), plus [[ai-avatar-glitch-cleanup]] vwav/vdiff.
- The glitch in this video: the AI read the stage direction "Pause briefly, then continue." aloud, so it was dropped in edits.json.

**Hook+body batches (2026-11-24, Midnight R01–R04 × Marva/Mateo/Selena/Sienna):**
- `auraly-min/prep_hb.sh` joins the hook and the Fala into `src/r<n>_<key>.mp4`.
- `scripts/mk_hb.mjs` generates `hb_r1..4.json`. Set `"hook"` to the silent b-roll length; the cuts start after it.
- `build_hb.sh [--render] [filter]` builds all of them.
- New pop types:
  - `letters`: an initials grid that lights up as each letter is spoken.
  - `comment`: a typing comment bar. Its text defaults to the word spoken after `at`.
  - `stories`: a profile pic with the IG ring, a NEW badge, taps, and an arrow to the real profile pic. It holds until the end.
  - `list` with `check:true`: the seals list.
- New zone `bot` (y 1060). edits.json also takes `retext:[[t,"word"|""]]` for per-word caption fixes.

**Standalone short talking heads (2026-11-26 "GPT" batch):**
- 14 videos of 12–25 s each, 4 scripts, no b-roll hook.
- Tools: `scripts/mk_g.mjs` → `g_a..g_d.json`; build with `build_g.sh` (slug|Avatar|file list).
- Settings: `hook` 0, `headDur` ~3 s, 4–6 pops per video.
- File naming: "<Name> - GPT.mp4" and "<Name> - GPT - Fala.mp4" are NOT a hook+body pair. The user wants every file edited as its own video.
- When a file name is ambiguous, ask the user.
- Spoken numbers ("five five five") → use `retext` to show "555" on the first word and hide the other two.
- The pfp crop is now 700×700 at (190, 230).

**Non-English videos (2026-11-26, Spanish "Arcángel Miguel", config `scripts/miguel.json`):**
- All on-screen copy goes in the audio's language (headline, pops, list titles).
- `S.ui {ph, post, badge}` localizes the comment bar and the stories badge, e.g. "Añade un comentario…" / "Publicar" / "NUEVO".
- `S.pfpCrop` ("w:h:x:y" on 1080×1920) aims the profile-pic crop when the face isn't centred.
- When the face sits high, use `pos` tl/ml (not top/tr) and put stats on `ml`.
- The avatar wasn't in the roster, so the file was delivered as `？ (data).mp4`.

**Verdict (2026-11-24): the user LOVED it** ("PERFEITO! DIVINO… cortes, popups, incrível qualidade"). This is now a proven format for multi-shot UGC ads: reuse overlay.mjs as is. Related: [[minimal-headline-format]], [[no-breaths-hard-cuts]], [[instagram-reels-ui-layout]].

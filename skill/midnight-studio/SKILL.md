---
name: midnight-studio
description: The Midnight / Auraly creative process for Instagram & Facebook Reels (tarot / spiritual funnel) — editing AI-avatar talking-head videos (hook + body), faceless neon line-art explainers, captions, pop-ups, music, hard cuts, glitch cleanup, naming and delivery. Use for ANY video edit, Reel, avatar batch, hook prompt or new format request from this user, even when they only say "edita esses vídeos", "faça no estilo X" or drop files in VIDEOS PARA EDITAR.
---

# Midnight Studio — how we make the videos

Everything lives in `M:\Google\hyperframes\Midnight-Studio` (this git repo, PUBLIC: github.com/Douthzdev/midnight-studio — never commit secrets, keys or media).
Inputs arrive in `M:\Google\hyperframes\VIDEOS PARA EDITAR`. The user writes in Portuguese; on-screen copy is English (the audio's language).

Detailed notes per topic are in `references/` (synced from Claude's memory). Read the one for the format you use.

**Skills to load first:** `references/required-skills.md` — always `hyperframes`, `hyperframes-core`, `hyperframes-cli`, `earshot` (+ `hyperframes-animation` for motion changes). Copies of every needed skill are in `skill/deps/`.

## 0. Ground rules (always)
- **Nothing on C:.** Tools, caches, temp → `M:\CLAUDE\tools` / `M:\CLAUDE\temp`. FFmpeg `M:\CLAUDE\tools\ffmpeg\bin` (prepend to PATH). Set `HYPERFRAMES_EXTRACT_CACHE_DIR=TMPDIR=TEMP=TMP=M:/CLAUDE/tools/hf-frames` for renders. → `references/hyperframes-setup-on-m-drive.md`
- **Only edit**, never rewrite the script or regenerate voice. Copy risks (fear, urgency, money promises, engagement bait, expiring dates) → keep the words verbatim, flag them briefly in the final message.
- **Hard cuts, zero breaths/pauses** in talking heads (`tools/vad.py` + silencedetect 0.14 s @ −40 dB). → `references/no-breaths-hard-cuts.md`
- **Remove AI glitches**: repeated sentences, garbled restarts, stage directions read aloud → `src/t_<slug>/edits.json` `{"drop":[[a,b]],"add":[…],"retext":[[t,"word"|""]]}`. Run `tools/verify/reps.py`. → `references/ai-avatar-glitch-cleanup.md`
- **Headline** readable from frame 0, one strong persuasive line (+ serif italic second line), gone by ~4–5 s (or when the hook ends).
- **Finish in one go**: build → snapshot check → render → verify audio → deliver → clean intermediates. Don't stop for approval mid-way.
- Use the HyperFrames / earshot skills automatically.

## 1. Pick the format (edit OPTIONS — offer by name)
| Format | Tool (`auraly-lineart/tools/`) | When | Note |
|---|---|---|---|
| **Glass Clean** ⭐ (user loved it) | `overlay.mjs` | talking-head / multi-shot UGC, footage untouched + dark-glass pop-ups | `references/overlay-popups-format.md` |
| Avatar batch (viral + split + glow captions) | `batch.mjs` | 4 scripts × 4 avatars | `references/avatar-batch-editor.md` |
| Minimal headline | `minimal.mjs` | panels w/ drawn icons + face card | `references/minimal-headline-format.md` |
| Story-arc diagram | `arc.mjs` | neon chart + face card | `references/story-arc-diagram-format.md` |
| Viral motion | `viral.mjs` / `viral2.mjs` | glass pop-ups, glowing numbers, split | `references/viral-motion-format.md` |
| Clean kinetic (Apple serif) | `clean.mjs` | word-by-word serif captions | `references/clean-kinetic-format.md` |
| Split-panel talking head | `split.mjs` / `edit.mjs` | top animated panel, face pushed down | `references/split-panel-talking-head-format.md` |
| Line-art neon (faceless) | `build.mjs` + `videos*.mjs` | scripts → Kokoro TTS → drawn scenes | `references/lineart-motion-pipeline.md` |
| Thread particles (faceless) | `thread.mjs` | continuous descent, karaoke captions | `references/thread-particle-format.md` |
| Moon ritual line-art | `ritual.mjs` | dotted glow, pill captions | `references/moon-ritual-lineart-format.md` |
| Kinetic type + icon map | (not built) | word-sized type, step icon-map | `references/kinetic-iconmap-format.md` |

## 2. Glass Clean, hook + body batch (the current standard workflow)
1. **Join hook + Fala** → `auraly-min/prep_hb.sh` makes `src/r<n>_<avatar>.mp4` (30 fps, 1080×1920, 48 k) + 16 k wav + Parakeet transcript (`npx hyperframes@0.9.67 transcribe`, run FROM `auraly-min/src`).
2. **Read every transcript** (dump with timestamps). Find glitches → edits.json per slug. ASR caption errors → config `fix` (word map) or `retext` (by time).
3. **Config per script** (`auraly-min/scripts/mk_hb.mjs` → `hb_r<n>.json`, template `_TEMPLATE-glass-clean.json` / `laura.json`): `hook` (silent b-roll length), `headDur`, `head`, `music`, `fix`, `accent` words, `pops` each tied to a spoken phrase (`at`, `end`/`dur`, `pos` tl|tr|top|ml|bot|cta).
   Pop types: chip, card, question, day, list (`strike`, `check`), stats (count-up, ring), pattern, circle, cta, **letters** (initials grid), **comment** (types the word spoken after `at`), **stories** (profile pic + IG ring + arrow to the real profile pic, holds to the end).
4. **Build all** `bash auraly-min/build_hb.sh` → fix every `skipped:` (phrase not said by that avatar — use words all avatars say), `CLASH` (same zone busy → change `pos`), real `GAP` > 5 s (add a pop; gaps inside a stats/stories pop are fine).
5. **Snapshot** `node auraly-min/poptimes.mjs <slug>` → `npx hyperframes@0.9.67 snapshot --at <times> --no-end -o snaps` → look at contact-sheet.jpg.
6. **Render** `bash auraly-min/build_hb.sh --render` (background; ~4–5 min each; `--workers 5`). Transient `ERR_NO_BUFFER_SPACE` → just re-run that slug.
7. **Verify**: `silencedetect=n=-40dB:d=0.25` on `<slug>/assets/voice.wav` → only the silent hook may show up.
8. **Deliver** (see §4) + SendUserFile (files > 30 MB only show in the desktop app — say so).

## 3. Look & sound rules
- Glass: `rgba(18,18,22,.46)` + blur 22, white line icons, sage accent `#A8E6BE`, coral `#FF9C86` for problems. Minimal, never cluttered.
- Captions: white Inter 600 64 px + accent words in Instrument Serif italic 94 px, top 1385 (caption-lab styles 3/4/5 are favorites). No boxes behind captions.
- Instagram UI: profile pic ≈ (180, 1550) in 1080×1920; right rail x > 880, y 880–1620; bottom ~20 % is dead. "Tap my profile picture" arrows point DOWN-LEFT. → `references/instagram-reels-ui-layout.md`
- Music from `C:/Users/Vinicius/Music/Songs Auraly UGC/` (calm/mystical: Stargazing, Snowfall, Interistelar Theme Piano, rain inside, FKJ Ylang Ylang…), ~18 dB under the voice; soft pop/tick SFX only. Final loudnorm I = −15.
- Source A/V pitfall: AI mp4s have audio timestamp jumps → cut audio from a decoded 48 k wav, `fps=30:start_time=0`, snap cuts to the 1/30 s grid, tpad last frame.

## 4. Naming & delivery
- Avatar edits → `M:\Google\hyperframes\VIDEOS EDITADOS\<Avatar>.mp4`, `<Avatar> 2.mp4`… (number = script order R01, R02…). Unknown avatar → `？.mp4`.
- **If the video mentions a date or a time-limited window** (e.g. "Nov 25/26", "before Friday"), add ` (data)` to the name: `Marva 2 (data).mp4`.
- Faceless line-art only → `M:\Google\hyperframes\Midnight Videos\MD <n>.mp4` via `tools/deliver.mjs` (ledger `md-ledger.json`).
- After delivery delete heavy intermediates, keep the light project. → `references/video-cleanup-after-render.md`, `references/midnight-folder-and-md-naming.md`

## 5. Other recurring jobs
- Hook recreation prompts from a reference Reel (A first frame / B Flow animation / C talking frame per avatar) → `references/hook-recreation-workflow.md`, avatars in `references/avatar-roster.md`.
- Feedback prompts for the video generator (MUSE): structured list of what went wrong (glitches, repeats, stage directions read aloud, pauses) + generic quality rules.
- Funnel brief and CTA rules → `references/auraly-video-edit-playbook.md`.

## 6. Keeping this skill current
After any new format, user feedback, or tool change: update the memory note, then run `bash M:/Google/hyperframes/Midnight-Studio/skill/sync.sh "<what changed>"` — it copies the memory notes into `references/`, commits and pushes. Edit this SKILL.md directly when the workflow itself changes.

---
name: split-panel-talking-head-format
description: "Reference edit the user wants to replicate on their full talking-head videos — top animated panel slides in over a pushed-down face cam, white outlined captions"
metadata:
  node_type: memory
  type: project
  originSessionId: 474ec1f9-216b-439c-b5ed-8dd68f4c7a2b
  modified: 2026-11-20T02:04:28.250Z
---

Reference analysed 2026-11-19 (Downloads "Conomon Mia Poursaie_If this message resonate...mp4", 76 s, 720x1280):
- 0–2.5 s hook B-roll (object close-ups, cuts ~0.6 s), then talking head.
- Top panel ~30% of height, dark warm brown gradient, cream stick-figure line art + gold sparkles, white bold label; changes per sentence (eye watching "YOU", gift, prosperity chart, angel with ribbon, door, phone messages, "FINAL WARNING" banner).
- Transition: panel slides down from the top in ~0.3 s while the face video slides down by the panel height (head stays in frame, bottom cropped); reverse on exit. Panel on screen most of the time (5–17, 20–31, 34–46, 50–69, 71–76 s).
- CTA section: panel shows a phone mockup of the Reel itself with like/save/send/comment and "tap the profile picture / open the Story link" steps.
- Captions: white heavy sans, black outline/shadow, one line of 3–5 words, ~62–70% height over the chest, no highlight.
- Audio: voice plus a quiet ambient synth pad, ~-14.6 LUFS.

User will send full talking-head videos for this edit; keep making the line-art Reels too ([[lineart-motion-pipeline]]). Copy in the reference uses fear/urgency, so flag it per [[auraly-video-edit-playbook]].

ONE COMMAND (user wants fast turnaround): `node tools/edit.mjs` in auraly-lineart/ processes every avatar that has a video in BOTH "M:/Google/Claude Ediçoes/hooks/" and ".../bodys/" (same name, " hook" suffix optional; tools/media.mjs; old root layout still works) (or `edit.mjs grant marva` to redo). It transcribes (cached), cuts silences >0.3 s down to 0.24 s with alternating 1.0/1.07 punch-in on each jump cut (user asked to remove pauses/non-talking parts), builds, checks, renders at 24 fps crf 20, loudnorms, writes a 720p phone preview to auraly-split/preview/ (finals are >30 MB, too big for SendUserFile to phone).
Builder details: `split.mjs <avatar>` (reads M:/Google/<AVATAR> hook.mp4 + <avatar>.mp4, transcripts in auraly-split/src/t_<avatar>_body). Panel 560px, face pushed only 300px (avatars are close-ups — panel covers the headroom so captions at y≈1405 stay under the chin). Hook 6 s full-screen, voice J-cut from 4.5 s. Beats in PLAN = [phrase, art]; null = panel off. Trigger word "received" gold. Finals: M:/Google/hyperframes/Midnight-Studio/auraly-split-<avatar>-final.mp4.

Workflow agreed 2026-11-19: user sends a hook clip + the full talking-head video (no headroom needed — the edit pushes the video down and adds the panel above). I add music, captions and the top panel following the copy, with panel in/out timing similar to the reference.

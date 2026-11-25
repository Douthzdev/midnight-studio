---
name: ai-avatar-glitch-cleanup
description: AI avatar bodies contain repeated sentences/garbled false starts — find and cut them every edit via edits.json; verify cuts with gap-padded ASR
metadata:
  node_type: memory
  type: feedback
  originSessionId: 06929af7-f385-4ab8-a68c-1052b70e9a30
  modified: 2026-11-22T04:20:28.200Z
---

User (2026-11-22): edits felt weird — cuts too dry, clipped speech, repeated lines (the AI video generator glitches). Clear repeats of the same sentence must be cut; minimize all oddities.

**How to apply:**
- Before each avatar edit, run `auraly-lineart/tools/verify/reps.py <transcript.json>` (vwav.py + vdiff.py there too) on the transcript (repeated >=3-word runs within 25 s, plus garbled lines like "So I can see that you did everything." before "If you did everything right…" — appeared in all 4 avatars of the Nov 22/23 copy).
- Put raw-second ranges in `auraly-batch/src/t_<slug>/edits.json` `{"drop":[[a,b]], "add":[caption words ASR missed]}`; vad.py (3rd arg) snaps edges to the quietest frame ±0.2 s; viral2.mjs reads it. Port to batch.mjs when reused.
- vad.py now pads 50/70 ms, bridges gaps <150 ms (less stutter), and segments get 10–12 ms audio fades (no clicks).
- Verify: Parakeet returns NOTHING for gapless jump-cut audio, so re-transcribe a verification wav with 0.35 s silence between kept segments (vwav approach), then diff words. Related: [[no-breaths-hard-cuts]], [[viral-motion-format]].

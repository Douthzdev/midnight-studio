---
name: no-breaths-hard-cuts
description: User HATES breaths/pauses in talking-head edits — always hard jump cuts, never leave the 0.24 s "breathing room"
metadata:
  type: feedback
---

Never leave breaths or pauses between phrases in avatar/talking-head edits: always hard, direct jump cuts (user, 2026-11-22: "esses respiros são intragáveis").

**Why:** the old rule kept 0.12 s each side of every pause (0.24 s breath) and only cut pauses > 0.3 s; the user found the remaining breaths unbearable.

**How to apply:** cut with `tools/vad.py <16k wav> <transcript.json>` (batch.mjs calls it). It decides from the sound, frame by frame, NOT from transcript timings (they drift ~0.3 s and stretch sentence-final words over the pause — that is why breaths survived before). Measured pattern (2026-11-22): speech -16..-30 dB, centroid 500-1200 Hz; soft word tails -32..-42 dB but low; breaths -35..-48 dB, bright (2-3.5 kHz), after a dip; fricatives bright but louder and glued to speech; outdoor selfies have a -40 dB low noise floor that looks "voiced" → all thresholds are max(ref-X, noise+Y). Transcript is only a safety net that extends a word's ending while sound stays glued to it (fixes clipped "stories"). Verify with the scratchpad recipe: cut the audio, re-transcribe (whole-file ASR sometimes drops the last sentence — re-check the tail alone), and earshot `find "a person breathing in sharply..."`. split/viral/clean.mjs still use the old cut — port vad.py before using them. Related: [[avatar-batch-editor]].

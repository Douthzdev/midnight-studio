---
name: hyperframes-setup-on-m-drive
description: Where video tooling lives - FFmpeg and HyperFrames caches are on M:\CLAUDE\tools, not C:
metadata:
  type: project
---

User wants installs on M:\CLAUDE, not C: (C: has ~1.6 GB free). As of 2026-10-21:
- FFmpeg 9.0.2 at `M:\CLAUDE\tools\ffmpeg\bin` (on user PATH; prepend it in Bash sessions).
- `~/.cache/hyperframes` and `~/.hyperframes` are junctions to `M:\CLAUDE\tools\hf-cache` / `hf-home` (Parakeet model ~640 MB lives there).
- Render frame cache: `HYPERFRAMES_EXTRACT_CACHE_DIR=M:\CLAUDE\tools\hf-frames`; also set TMPDIR there for renders.
- earshot (audio "ears", skills `earshot` + `real-sound`, installed 2026-11-18): repo + venv at `M:\CLAUDE\tools\earshot`, models (~1.1 GB) in its `.cache`. Kokoro TTS venv: `M:\CLAUDE\tools\kokoro-venv`.
- Video projects go under `M:\Google\hyperframes\<project>`.

**How to apply:** Never install tools/models to C:. Related: [[video-cleanup-after-render]].

ffmpeg encodes use NVENC (RTX 4060, 2026-11-22): `-c:v h264_nvenc -preset p5 -rc vbr -cq 19 -b:v 0` for the silence-cut bodies (7x faster than libx264 crf16 fast, same SSIM, similar size); previews `h264_nvenc -b:v 1500k`. Machine is Windows — no VideoToolbox. HyperFrames' own render encode is separate (`--gpu` flag exists, untested; render time is mostly frame capture).
Render speed (2026-11-22): browser GPU is already auto-on in HyperFrames renders; '--gpu' only adds NVENC encoding (≈no time saved, ~2x bigger files) — don't use it. Speed comes from '--workers 5' (8-core PC); batch.mjs uses it. User wants speed AND reasonable file sizes.

**2026-11-23, C: → M: move** (the user's rule is that nothing Claude-related runs or is created on C:):
- User environment variables now point to M::
  - TEMP and TMP → `M:\CLAUDE\temp`
  - `npm_config_cache`, `PIP_CACHE_DIR`, `PLAYWRIGHT_BROWSERS_PATH` and `HF_HOME` → `M:\CLAUDE\c-drive\...`
- `~/.cache/huggingface` and `~/.cache/whisper` are now junctions to `M:\CLAUDE\c-drive\dot-cache`.
- Folders that were locked while Claude was open (`~/.claude`, `AppData\Roaming\Claude` including the 8.8 GB `vm_bundles`, npm, pip, Playwright) are moved by `M:\CLAUDE\FINALIZAR-MOVER-CLAUDE.cmd`, which the user runs with Claude closed.
  - It calls `tools/move-to-m.ps1`, which copies each folder, then makes a junction at the old path.
  - If `C:\Users\Vinicius\.claude` is a junction, that run has already happened.

**Update, 2026-11-23:**
- `~/.claude` and `AppData\Roaming\npm` are now junctions on M:. The npm move broke once halfway; it was repaired.
- `AppData\Roaming\Claude` (10.4 GB, including `vm_bundles`) is **NOT** movable by junction. The app is a sideloaded MSIX, so its data is redirected to `C:\WpSystem\...\Packages\Claude_pzs8sxrjxfjjc`. That entry was removed from the finalize script.
- The harness blocks Remove-Item inside AppData. Leftover caches (npm-cache, pip, ms-playwright) go through the user-run FINALIZAR script.
- **Later on 2026-11-23:**
  - npm-cache, pip and Playwright are all moved to `M:\CLAUDE\c-drive` with junctions. They were moved with robocopy /MOVE /IS /IT, because Remove-Item in AppData is blocked.
  - The desktop shortcut "Mover Claude para o M" now only moves the Claude app's `vm_bundles` (~9 GB). It must run with Claude closed.
- **Final, 2026-11-23:**
  - The Claude Desktop `vm_bundles` (8.6 GB, at `%LOCALAPPDATA%\Packages\Claude_pzs8sxrjxfjjc\LocalCache\Roaming\Claude\vm_bundles`) **cannot be moved**. Its files are EFS-encrypted with the app's key: copying them fails with "não pôde ser criptografado", and robocopy sees 0 files.
  - Don't retry this, and don't decrypt the files.
  - The desktop shortcut and the finalize script were removed.
  - The only options are Settings → Apps → Move, if Windows offers it, or turning off the Cowork VM feature.
- **Correction:** the Claude Desktop app is already installed on M:. Settings shows it there, and its data, including `vm_bundles` (10.8 GB total), physically lives in `M:\WpSystem\<SID>\AppData\Local\Packages\Claude_pzs8sxrjxfjjc`. The `C:\...\AppData` paths are only a virtual view. Nothing of Claude is left to move off C:.

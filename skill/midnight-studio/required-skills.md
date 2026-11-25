# Skills these edits need

Load them with the Skill tool **before** the step that needs them. They are installed in `~/.claude/skills/`. A snapshot copy lives in this repo at `skill/deps/<name>/`; `sync.sh` refreshes it. On a new machine, copy `skill/deps/*` into `~/.claude/skills/` along with `midnight-studio`.

## Always: every edit (HyperFrames is our renderer)
| Skill | Load it when | What we use from it |
|---|---|---|
| `hyperframes` | first, at the start of any video job | render contract, work loop, the per-video-type checklist |
| `hyperframes-core` | before writing or changing composition HTML (overlay.mjs, batch.mjs, build.mjs output) | `class="clip"`, `data-start` / `data-duration` / `data-track-index`, sub-compositions (`compositions/caps.html`), `window.__timelines`, deterministic rules |
| `hyperframes-cli` | before check / snapshot / render / transcribe | `npx hyperframes@0.9.67 check`, `snapshot --at … --no-end -o snaps`, `render --workers 5 --fps 30 --crf 20`, `transcribe <wav> -d t_<slug> --json` (Parakeet; run from `auraly-min/src`), reading JSON reports |
| `hyperframes-animation` | when making or tuning pop-ups, headline or caption motion | GSAP seek-safe rules (`immediateRender:false`, a single paused timeline), eases, staggers, text effects |
| `earshot` | before saying how any audio sounds: music choice, checking breaths, mix, final check | `python -m earshot timeline <file> --detail low`, `find "a person breathing in…"` (venv `M:\CLAUDE\tools\earshot`) |

## Often
| Skill | Load it when |
|---|---|
| `hyperframes-audio` | ducking or crossfading music under the voice, fades, volume automation |
| `media-use` | sourcing or making music / SFX / icons, transcripts, colour grade for dark or flat footage, Kokoro TTS for line-art voices |
| `real-sound` | sound design for line-art / faceless videos (cue list, SFX kit in `auraly-lineart/sfx/kit`, loudness QA) |
| `hyperframes-creative` | a brand-new format: palette, typography, beat planning |
| `hyperframes-studio` | safe zones and timeline layout (one caption track, one element kind per track) |
| `reverse-any-video` | the user sends a reference Reel to copy the edit style (decupagem → `ref-*/DECUPAGEM.md`) |

## Sometimes
| Skill | Load it when |
|---|---|
| `hyperframes-keyframes` | punch-ins, zooms, camera moves on the footage (split / viral formats) |
| `motion-graphics` | a short standalone animated piece (sticker, stat hit, title card) |
| `talking-head-recut` / `embedded-captions` | ideas for overlay cards and caption styles (our own tools already cover the standard looks) |
| `hyperframes-registry` | before hand-building a named effect (glitch, film grain, transitions) |

## Order for a Glass Clean batch
`hyperframes` → `hyperframes-core` + `hyperframes-cli` (build / check / snapshot / render) → `hyperframes-animation` (only if you change pop-up motion) → `earshot` (verify the voice has no breaths; check the music) → deliver.

# Per-sentence Kokoro TTS with pauses; writes <out>.wav and <out>.lines.json (start/end per line)
import sys, json, re, numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
txt, voice, speed, out = sys.argv[1], sys.argv[2], float(sys.argv[3]), sys.argv[4]
k = Kokoro("M:/CLAUDE/tools/hf-cache/tts/models/kokoro-v1.0.onnx", "M:/CLAUDE/tools/hf-cache/tts/voices/voices-v1.0.bin")
lines = [l.strip() for l in open(txt, encoding="utf-8") if l.strip()]
sr = 24000; buf = [np.zeros(int(0.35*sr), dtype=np.float32)]; t = 0.35; meta = []
for l in lines:
    pause = 0.75 if l.endswith(("?", ".")) and len(l.split()) > 3 else 0.5
    a, sr = k.create(l.replace("222", "two two two").replace("888", "eight eight eight"), voice=voice, speed=speed, lang="en-us")
    a = a.astype(np.float32); d = len(a)/sr
    meta.append({"text": l, "start": round(t, 3), "end": round(t+d, 3)})
    buf += [a, np.zeros(int(pause*sr), dtype=np.float32)]; t += d + pause
sf.write(out + ".wav", np.concatenate(buf), sr)
json.dump(meta, open(out + ".lines.json", "w"), indent=1)
print(out, round(t, 2), "s")

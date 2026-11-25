# verification-only wav: the kept segments (same 10/12 ms fades) with 0.35 s silence between them,
# because Parakeet returns nothing for gapless jump-cut speech
import sys, json, numpy as np, soundfile as sf
x, sr = sf.read(sys.argv[1]); keep = json.loads(open(sys.argv[2]).read())
gap = np.zeros(int(0.35 * sr)); parts = []
for a, b in keep:
    s = x[int(a * sr):int(b * sr)].copy(); fi, fo = int(0.01 * sr), int(0.012 * sr)
    s[:fi] *= np.linspace(0, 1, fi); s[-fo:] *= np.linspace(1, 0, fo); parts += [s, gap]
sf.write(sys.argv[3], np.concatenate(parts), sr)

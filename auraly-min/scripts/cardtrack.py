# Track the two purple tarot-card backs in a hook (1080x1920 after scale): centroid + size per 0.1 s -> JSON on stdout.
# usage: python -I cardtrack.py <hook.mp4> [seconds=4.2]
import sys, json, subprocess, numpy as np
src, dur = sys.argv[1], float(sys.argv[2]) if len(sys.argv) > 2 else 4.2
W, H = 1080, 1920
raw = subprocess.run(["M:/CLAUDE/tools/ffmpeg/bin/ffmpeg", "-v", "error", "-i", src, "-t", str(dur), "-vf", f"fps=10,scale={W}:{H}", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], capture_output=True).stdout
fr = np.frombuffer(raw, np.uint8).reshape(-1, H, W, 3).astype(np.int16)
out = []
for i, f in enumerate(fr):
    r, g, b = f[..., 0], f[..., 1], f[..., 2]
    m = (r > g + 35) & (b > g + 12) & (r < 150) & (b < 120) & (g < 75)
    m[:1000] = False; m[1850:] = False; m[:, :200] = False; m[:, 960:] = False  # card zone only (amethyst sits at x<200)
    row = {"t": round(i / 10, 2)}
    for side, (x0, x1) in (("L", (200, 550)), ("R", (550, 960))):
        ys, xs = np.nonzero(m[:, x0:x1])
        if len(xs) < 4000: row[side] = None; continue
        xs = xs + x0
        row[side] = [int(xs.mean()), int(ys.mean()), int(np.percentile(xs, 97) - np.percentile(xs, 3)), int(np.percentile(ys, 97) - np.percentile(ys, 3)), len(xs)]
    out.append(row)
print(json.dumps(out))

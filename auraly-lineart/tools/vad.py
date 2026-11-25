# Speech-keep intervals for hard jump cuts, from the sound itself (transcript timings drift ~0.3 s and swallow pauses).
# Measured on the avatars (2026-11-22): speech -16..-30 dB with a low spectral centroid (500-1200 Hz); soft word tails
# -32..-42 dB but still low; breaths -35..-48 dB and bright (centroid 2-3.5 kHz), usually after a dip. Fricatives
# ("s", "t", "f") are bright too but touch voiced frames, so bright frames are kept only when they hang off speech.
# usage: python vad.py <audio.wav> [transcript.json] [edits.json] -> prints JSON [[start, end], ...] of what to KEEP
import sys, json, numpy as np, soundfile as sf

x, sr = sf.read(sys.argv[1]); x = x if x.ndim == 1 else x.mean(1)
hop, win = int(0.01 * sr), int(0.03 * sr)
n = max(0, (len(x) - win) // hop)
db = np.empty(n); cen = np.empty(n)
fr = np.fft.rfftfreq(win, 1 / sr); w = np.hanning(win)
for i in range(n):
    f = x[i * hop:i * hop + win] * w
    s = np.abs(np.fft.rfft(f)) + 1e-9
    db[i] = 20 * np.log10(np.sqrt(np.mean(f ** 2)) + 1e-9)
    cen[i] = (fr * s).sum() / s.sum()

ref = np.percentile(db[db > -70], 90)            # the speaker's loud-speech level
noise = np.percentile(db, 10)                     # room/outdoor floor: studio ~-65 dB, outdoor selfies ~-40 dB (wind is low and steady, reads as "voiced")
loud = (db > ref - 8) | ((db > ref - 14) & (cen < 2200))  # clearly speech (quiet speakers: a bright -36 dB breath is not speech)
soft = (db > max(ref - 24, noise + 7)) & (cen < 1500)              # quiet but voiced (word tails/onsets); breath tails sit at 1.7-2.2 kHz
sp = loud | soft
# bright frames (fricatives, -26..-33 dB) count as speech only when chained to speech, at most 100 ms each side;
# breaths are bright too but quieter (-35..-48 dB), so the bar is ref-17
bright = (db > max(ref - 17, noise + 9)) & ~sp
keep = sp.copy()
for direction in (1, -1):
    run = 0
    rng_ = range(n) if direction == 1 else range(n - 1, -1, -1)
    prev = False
    for i in rng_:
        if sp[i]: run = 0; prev = True; continue
        if prev and bright[i] and run < 10: keep[i] = True; run += 1
        else: prev = False; run = 0

# safety net for word endings ("stories" -> "-ries" is quiet and bright like a breath): inside each word's first 0.6 s,
# keep extending from kept speech while the sound stays above ref-30 dB without a break. A breath comes after a dip, so it stops there.
if len(sys.argv) > 2:
    for wd in json.load(open(sys.argv[2], encoding="utf8")):
        a, b = int(wd["start"] / 0.01), min(n, int(min(wd["end"], wd["start"] + 0.6) / 0.01))
        on = False
        for i in range(max(0, a), b):
            if keep[i]: on = True; continue
            if on and db[i] > max(ref - 30, noise + 5): keep[i] = True
            else: on = False
# edits.json {"drop": [[a, b], ...]}: AI-avatar glitches (repeated sentence, garbled false start) removed by hand-picked
# raw times; each edge snaps to the quietest frame within 0.2 s so the cut lands between words, not inside one
if len(sys.argv) > 3:
    for a, b in json.load(open(sys.argv[3], encoding="utf8")).get("drop", []):
        snap = lambda t: (lambda lo, hi: lo + int(np.argmin(db[lo:hi])))(max(0, int(t / 0.01) - 20), min(n, int(t / 0.01) + 20))
        keep[snap(a):snap(b) + 1] = False
# frames -> intervals; drop specks < 60 ms, bridge gaps < 150 ms (shorter jumps read as stutter, a breath is longer), pad 50/70 ms
iv, i = [], 0
while i < n:
    if keep[i]:
        j = i
        while j < n and keep[j]: j += 1
        iv.append([i * hop / sr, (j * hop + win) / sr]); i = j
    else: i += 1
iv = [v for v in iv if v[1] - v[0] >= 0.06]
out = []
for a, b in iv:
    a, b = max(0, a - 0.05), b + 0.07
    if out and a - out[-1][1] < 0.15: out[-1][1] = b
    else: out.append([a, b])
print(json.dumps([[round(a, 3), round(b, 3)] for a, b in out]))

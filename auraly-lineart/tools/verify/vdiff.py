# diff expected words (transcript - drops + adds) against a re-transcription of the cut body
import json, re, sys, difflib
src, cut = sys.argv[1], sys.argv[2]
norm = lambda s: re.sub(r"[^a-z0-9]", "", s.lower())
W = json.load(open(src + "/transcript.json", encoding="utf8"))
try: ED = json.load(open(src + "/edits.json", encoding="utf8"))
except FileNotFoundError: ED = {}
drop = lambda w: any(a < (w["start"] + w["end"]) / 2 < b for a, b in ED.get("drop", []))
exp = [norm(w["text"]) for w in sorted(W + ED.get("add", []), key=lambda w: w["start"]) if not drop(w)]
C = json.load(open(cut, encoding="utf8")); got = [norm(w["text"]) for w in C]
sm = difflib.SequenceMatcher(None, exp, got, autojunk=False)
print(f"ratio {sm.ratio():.3f}  exp {len(exp)} got {len(got)}")
for op, a, b, c, d in sm.get_opcodes():
    if op != "equal": print(f"  {op} @{C[min(c, len(C)-1)]['start']:.1f}s  expected '{' '.join(exp[a:b])}'  heard '{' '.join(got[c:d])}'")

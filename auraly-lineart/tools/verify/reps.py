import json, re, sys
p = sys.argv[1]
W = json.load(open(p, encoding="utf8"))
norm = lambda s: re.sub(r"[^a-z0-9]", "", s.lower())
t = [norm(w["text"]) for w in W]
# print text in lines, break at gaps > 0.5 or sentence punctuation
line, st = [], W[0]["start"]
for i, w in enumerate(W):
    line.append(w["text"])
    if w["text"][-1:] in ".?!" or i == len(W) - 1:
        print(f"{st:7.2f}-{w['end']:7.2f} [{i-len(line)+1}-{i}] " + " ".join(line)); line = []
        if i + 1 < len(W): st = W[i + 1]["start"]
# repeated runs of >=3 words within 25 s
print("--- repeats")
n = len(t)
for i in range(n):
    for j in range(i + 1, n):
        if W[j]["start"] - W[i]["start"] > 25: break
        k = 0
        while j + k < n and i + k < j and t[i + k] == t[j + k]: k += 1
        if k >= 3 and (i == 0 or j == 0 or t[i - 1] != t[j - 1]):
            print(f"{k} words: [{i}] {W[i]['start']:.2f} ~ [{j}] {W[j]['start']:.2f}: " + " ".join(w["text"] for w in W[i:i + k]))

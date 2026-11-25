// "Diagrama neon (story arc)" edit — ref: Midnight-Studio/ref-storyarc/DECUPAGEM.md.
// Layout A: black grid, title (bold sans + italic serif), red neon diagram drawn on the words, virtual camera, face in a rounded card.
// Layout B: full face with punch-ins. One-word captions. Hard cuts from vad.py (no breaths) + edits.json glitch drops.
// This file holds the candle2 copy ("Make a wish in the next five seconds…") incl. a 5 s full-screen timer inserted after "seconds".
// usage: node tools/arc.mjs <video.mp4> <AvatarName> <slug> [--render]
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const [RAW, NAME, SLUG] = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const RENDER = process.argv.includes("--render");
const STUDIO = "M:/Google/hyperframes/Midnight-Studio", SRC = STUDIO + "/auraly-batch/src", P = `${STUDIO}/auraly-arc/${SLUG}`;
const OUTDIR = "M:/Google/hyperframes/VIDEOS EDITADOS";
const MUSIC = "C:/Users/Vinicius/Music/Songs Auraly UGC/Snowfall.mp3";
const LK = STUDIO + "/auraly-lineart/sfx/kit/";
if (!fs.existsSync(RAW)) throw new Error("missing " + RAW);
const env = { ...process.env, PATH: "M:/CLAUDE/tools/ffmpeg/bin;" + process.env.PATH };
for (const k of ["HYPERFRAMES_EXTRACT_CACHE_DIR", "TMPDIR", "TEMP", "TMP"]) env[k] = "M:/CLAUDE/tools/hf-frames";
const ff = (args) => { const r = spawnSync("ffmpeg", args, { encoding: "utf8", env, maxBuffer: 1 << 26 }); return (r.stderr || "") + (r.stdout || ""); };
const ffp = (f) => +spawnSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f], { encoding: "utf8", env }).stdout.trim();
fs.mkdirSync(path.join(P, "assets"), { recursive: true }); fs.mkdirSync(path.join(P, "compositions"), { recursive: true });
const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
const T = (x) => (+x).toFixed(3);

// ---------- cut (vad.py) + 5 s timer gap after "seconds" ----------
const VADWAV = `${SRC}/${SLUG}.wav`, TR = `${SRC}/t_${SLUG}/transcript.json`, EDP = `${SRC}/t_${SLUG}/edits.json`;
if (!fs.existsSync(VADWAV)) ff(["-hide_banner", "-y", "-i", RAW, "-ac", "1", "-ar", "16000", VADWAV]);
if (!fs.existsSync(TR)) spawnSync("npx", ["-y", "hyperframes@0.9.67", "transcribe", VADWAV, "-d", `${SRC}/t_${SLUG}`, "--json"], { env, shell: true });
const ED = fs.existsSync(EDP) ? JSON.parse(fs.readFileSync(EDP, "utf8")) : {};
const vr = spawnSync("M:/CLAUDE/tools/kokoro-venv/Scripts/python.exe", ["-I", STUDIO + "/auraly-lineart/tools/vad.py", VADWAV, TR, ...(fs.existsSync(EDP) ? [EDP] : [])], { encoding: "utf8" });
if (vr.status !== 0) throw new Error("vad.py failed: " + vr.stderr);
const rawLen = ffp(RAW);
let keep = JSON.parse(vr.stdout).map(([a, b]) => [a, Math.min(b, rawLen)]).filter(([a, b]) => b - a > 0.04);
const RW = JSON.parse(fs.readFileSync(TR, "utf8"));
const GAP = 5;
const iSec = RW.findIndex((w) => norm(w.text) === "seconds"), gotS = RW[iSec + 1].start;
// gap goes in the silence between "seconds" and the next word; if vad kept them joined, split at the next word's onset
let gi = keep.findIndex(([, b], i) => b > RW[iSec].start && keep[i + 1] && keep[i + 1][0] >= gotS - 0.4);
if (gi < 0) { const j = keep.findIndex(([a, b]) => a < gotS && b > gotS); keep.splice(j, 1, [keep[j][0], gotS - 0.04], [gotS - 0.04, keep[j][1]]); gi = j; }
const offs = []; let acc = 0; keep.forEach(([a, b], i) => { offs.push(acc); acc += b - a; if (i === gi) acc += GAP; });
const TIMER = offs[gi] + keep[gi][1] - keep[gi][0], TOTAL = +acc.toFixed(3);
const mapT = (t) => { for (let i = keep.length - 1; i >= 0; i--) if (t >= keep[i][0]) return t > keep[i][1] && keep[i + 1] ? offs[i + 1] : offs[i] + Math.min(t, keep[i][1]) - keep[i][0]; return 0; };
const BODY = path.join(P, "assets", "body.mp4");
{ const af = "aformat=sample_rates=48000:channel_layouts=stereo";
  const seg = keep.map(([a, b], i) => `[0:v]trim=${a.toFixed(3)}:${b.toFixed(3)},setpts=PTS-STARTPTS,fps=24,format=yuv420p[v${i}];[0:a]atrim=${a.toFixed(3)}:${b.toFixed(3)},asetpts=PTS-STARTPTS,${af},afade=t=in:d=0.01,afade=t=out:st=${(b - a - 0.012).toFixed(3)}:d=0.012[a${i}];`).join("");
  const gap = `color=c=black:s=672x1216:r=24:d=${GAP},format=yuv420p[gv];anullsrc=r=48000:cl=stereo,atrim=0:${GAP}[ga];`;
  const order = keep.map((_, i) => `[v${i}][a${i}]` + (i === gi ? "[gv][ga]" : "")).join("");
  ff(["-hide_banner", "-y", "-i", RAW, "-filter_complex", seg + gap + order + `concat=n=${keep.length + 1}:v=1:a=1[v][a]`, "-map", "[v]", "-map", "[a]", "-c:v", "h264_nvenc", "-preset", "p5", "-rc", "vbr", "-cq", "19", "-b:v", "0", "-c:a", "aac", "-b:a", "192k", BODY]); }
const dropped = (w) => (ED.drop || []).some(([a, b]) => (w.start + w.end) / 2 > a && (w.start + w.end) / 2 < b);
const words = [...RW, ...(ED.add || [])].filter((w) => !dropped(w)).sort((x, y) => x.start - y.start).map((w) => ({ ...w, start: +mapT(w.start).toFixed(3), end: +mapT(w.end).toFixed(3) }));
const W = words.map((w) => norm(w.text));
const at = (phrase, after = 0) => { const p = phrase.split(" ").map(norm); for (let i = 0; i < W.length; i++) if (words[i].start >= after && p.every((x, j) => W[i + j] === x)) return words[i].start; return null; };
const wAt = (word, from, fb = from + 0.8) => { const i = words.findIndex((w) => w.start >= from - 0.05 && norm(w.text) === norm(word)); return i < 0 ? fb : words[i].start; };
const need = (ph, after) => { const t = at(ph, after); if (t == null) throw new Error(`phrase not found: "${ph}"`); return t; };

// ---------- beats ----------
let html = "", tw = ""; const cues = [];
const sfx = (kind, t) => cues.push({ kind, t });
const draw = (id, t, d = 0.8, ease = "power2.inOut") => { tw += `tl.fromTo("#${id}",{attr:{"stroke-dashoffset":1}},{attr:{"stroke-dashoffset":0},duration:${d},ease:"${ease}",immediateRender:false},${T(t)});\n`; };
const popIn = (sel, t, snd = "pop") => { tw += `tl.fromTo("${sel}",{opacity:0,scale:0.6,y:14},{opacity:1,scale:1,y:0,duration:0.32,ease:"back.out(2.6)",immediateRender:false},${T(t)});\n`; if (snd) sfx(snd, t); };
const cam = (id, t, px, py, s, d = 0.9) => { tw += `tl.to("#${id}",{x:${T(-s * (px - 540))},y:${T(-s * (py - 500))},scale:${s},duration:${d},ease:"power3.inOut"},${T(t)});\n`; };
const setTitle = (id, t, txt) => { tw += `tl.set("#${id}",{innerHTML:${JSON.stringify(txt)}},${T(t)});tl.fromTo("#${id}",{opacity:0,y:-16},{opacity:1,y:0,duration:0.3,ease:"power2.out",immediateRender:false},${T(t)});\n`; };

const t0 = 0, tGot = TIMER + GAP, tHon = need("now be honest"), tMat = need("that matters", tHon), tFirst = need("the first one is", tMat), tGo = need("if you changed", tFirst),
  tUni = need("thats the one", tGo), tCom = need("comment", tUni), tTap = need("then tap", tCom);
// layout schedule: A = diagram + face card, B = full face, X = full-screen timer
const LAY = [[t0, "A", "s1"], [TIMER, "X"], [tGot, "B"], [tHon, "A", "s2"], [tMat, "B"], [tFirst, "A", "s2"], [tUni, "B"], [tCom, "A", "s3"], [tTap, "A", "s4"]];
LAY.forEach(([t, L, sc]) => {
  tw += `tl.set("#full",{opacity:${L === "B" ? 1 : 0}},${T(t)});tl.set("#lA",{opacity:${L === "A" ? 1 : 0}},${T(t)});tl.set("#timer",{opacity:${L === "X" ? 1 : 0}},${T(t)});\n`;
  if (sc) ["s1", "s2", "s3", "s4"].forEach((s) => (tw += `tl.set("#${s}",{opacity:${s === sc ? 1 : 0}},${T(t)});\n`));
});

// s1: make a wish — five dots on a time axis, red tag
const C = (x, y, id, cls = "") => `<circle id="${id}" class="dot ${cls}" cx="${x}" cy="${y}" r="13"/>`;
html += `<div class="scene" id="s1"><div class="title" id="s1t">Make A <i>Wish</i></div>
<svg class="dia" viewBox="0 0 1080 1000"><path id="s1ax" class="axis" d="M120 640H960" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="1"/><path id="s1ln" class="neon" d="M120 640C300 640 330 380 540 380S780 640 960 640" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="1"/>
${[0, 1, 2, 3, 4].map((i) => C(160 + i * 190, 640, `s1d${i}`)).join("")}</svg>
${[0, 1, 2, 3, 4].map((i) => `<div class="tag" id="s1n${i}" style="left:${140 + i * 190}px;top:${300 + 700}px">${5 - i}</div>`).join("")}
<div class="rtag" id="s1r" style="left:540px;top:520px">In The Next 5 Seconds</div></div>`;
{ const tw1 = wAt("wish", t0, 0.9), tf = wAt("five", t0, 1.8);
  draw("s1ax", 0.05, 0.6); draw("s1ln", tw1 - 0.1, 1.1); sfx("riser", 0.0);
  [0, 1, 2, 3, 4].forEach((i) => { popIn(`#s1d${i}`, tf + i * 0.09, i ? null : "pop"); popIn(`#s1n${i}`, tf + i * 0.09, null); });
  popIn("#s1r", wAt("seconds", tf, tf + 0.4), "hit"); }

// timer (full screen, 5 s): ring drains, 5..1, tick each second, hit at the end
const timerHtml = `<div class="title tt">Make Your <i>Wish</i></div>
<svg class="tring" viewBox="0 0 800 800"><circle cx="400" cy="400" r="340" class="rbg"/><circle id="tring" cx="400" cy="400" r="340" class="rfg" pathLength="1" stroke-dasharray="1 1" transform="rotate(-90 400 400)"/></svg>
<div class="tnum" id="tnum">5</div><div class="tsub"><i>close your eyes</i></div>`;
tw += `tl.fromTo("#tring",{attr:{"stroke-dashoffset":0}},{attr:{"stroke-dashoffset":1},duration:${GAP},ease:"none",immediateRender:false},${T(TIMER)});\n`;
for (let k = 0; k < 5; k++) { const t = TIMER + k; tw += `tl.set("#tnum",{innerText:"${5 - k}"},${T(t)});tl.fromTo("#tnum",{scale:1.25,opacity:0.4},{scale:1,opacity:1,duration:0.35,ease:"back.out(2.4)",immediateRender:false},${T(t)});\n`; sfx("tick", t); }
tw += `tl.fromTo("#flash",{opacity:0},{opacity:0.75,duration:0.06,immediateRender:false},${T(tGot - 0.06)});tl.to("#flash",{opacity:0,duration:0.35},${T(tGot)});\n`; sfx("hit", tGot);

// s2: honest — branch: first thought (red) vs changed it (grey); later heart/fear tags, camera, path back
html += `<div class="scene" id="s2"><div class="title" id="s2t">Be <i>Honest</i></div><div class="win"><div class="cam" id="s2c">
<svg class="dia" viewBox="0 0 1080 1000"><path class="axis" id="s2ax" d="M110 90V900H1000" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="1"/>
<path id="s2st" class="neon" d="M150 600H420" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="1"/><path id="s2up" class="neon" d="M420 600C560 600 600 330 880 330" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="1"/>
<path id="s2lo" class="grey" d="M420 600C560 600 600 820 880 820" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="1"/>
<path id="s2bk" class="magenta" d="M900 805C1050 700 1050 430 905 350" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="1"/>
${C(150, 600, "s2d0")}${C(880, 330, "s2d1")}${C(880, 820, "s2d2", "g")}</svg>
<div class="tag" id="s2a" style="left:760px;top:420px">First Thought</div><div class="tag" id="s2b" style="left:760px;top:900px">Changed It</div>
<div class="rtag" id="s2h" style="left:700px;top:220px">What Your <i>Heart</i> Wants</div><div class="gtag" id="s2f" style="left:700px;top:870px">What Your <i>Fear</i> Allows</div>
</div></div></div>`;
{ draw("s2ax", tHon, 0.5); popIn("#s2d0", tHon + 0.1); draw("s2st", tHon + 0.25, 0.5);
  const tF = wAt("first", tHon, tHon + 1.5), tC = wAt("change", tF, tF + 2); draw("s2up", tF - 0.1, 0.7); popIn("#s2d1", tF + 0.5, null); popIn("#s2a", tF + 0.5);
  draw("s2lo", tC - 0.1, 0.7); popIn("#s2d2", tC + 0.5, null); popIn("#s2b", tC + 0.5);
  const tH = wAt("heart", tFirst, tFirst + 1.5), tS = need("the second", tFirst), tFe = wAt("fear", tS, tS + 1.2);
  cam("s2c", tFirst - 0.2, 780, 360, 1.3); sfx("whoosh", tFirst - 0.1); popIn("#s2h", tH, "hit");
  cam("s2c", tS - 0.2, 780, 780, 1.3); sfx("whoosh", tS - 0.1); popIn("#s2f", tFe);
  setTitle("s2t", tGo, "Go Back To The <i>First One</i>"); cam("s2c", tGo - 0.1, 600, 560, 0.95); sfx("whoosh", tGo);
  tw += `tl.to("#s2lo,#s2d2",{opacity:0.25,duration:0.4},${T(tGo + 0.3)});tl.to("#s2f,#s2b",{opacity:0,duration:0.4},${T(tGo + 0.3)});\n`; draw("s2bk", wAt("back", tGo, tGo + 1) - 0.1, 0.8); sfx("riser", wAt("back", tGo, tGo + 1) - 1.2); }

// s3: comment first or second
html += `<div class="scene" id="s3"><div class="title">Comment <i>Below</i></div>
<div class="big rbig" id="s3a" style="top:430px">FIRST</div><div class="or" id="s3o" style="top:650px"><i>or</i></div><div class="big obig" id="s3b" style="top:780px">SECOND</div></div>`;
{ const ta = wAt("fur", tCom, tCom + 0.5), tb = wAt("second", ta, ta + 0.6); popIn("#s3a", ta, "pop"); popIn("#s3o", ta + 0.25, null); popIn("#s3b", tb, "pop"); }

// s4: profile tap -> 3 cards in stories
const cardBack = `<svg viewBox="0 0 220 360"><rect x="6" y="6" width="208" height="348" rx="18" class="cb"/><rect x="22" y="22" width="176" height="316" rx="10" class="cbi"/><path d="M110 120L124 166H172L133 194L148 240L110 212L72 240L87 194L48 166H96Z" class="cst"/><circle cx="110" cy="290" r="18" class="cst"/></svg>`;
html += `<div class="scene" id="s4"><div class="title" id="s4t">Tap My <i>Profile</i></div>
<div class="pf" id="s4p"><div class="ring"></div><div class="pic"><svg viewBox="0 0 64 64"><circle cx="32" cy="24" r="12" fill="#eee"/><path d="M8 60C10 42 54 42 56 60Z" fill="#eee"/></svg></div><div class="tap" id="s4tap"></div></div>
${[-1, 0, 1].map((k) => `<div class="tcard" id="s4c${k + 1}" style="left:${430 + k * 230}px;--r:${k * 9}deg">${cardBack}</div>`).join("")}
<div class="rtag" id="s4r" style="left:540px;top:1110px">Already Moving Toward <i>Your Wish</i></div></div>`;
{ const tt = wAt("tap", tTap, tTap + 0.3), tc = need("the three cards", tTap), tm = wAt("moving", tc, tc + 2.5);
  popIn("#s4p", tTap, null); tw += `tl.fromTo("#s4tap",{scale:0.3,opacity:0.9},{scale:2.2,opacity:0,duration:0.7,repeat:1,ease:"power2.out",immediateRender:false},${T(tt)});\n`; sfx("bell2", tt);
  tw += `tl.to("#s4p",{scale:0.5,y:-90,duration:0.6,ease:"power3.inOut"},${T(tc - 0.3)});\n`; setTitle("s4t", tc, "3 Cards In My <i>Stories</i>");
  [0, 1, 2].forEach((i) => { tw += `tl.fromTo("#s4c${i}",{opacity:0,y:120,rotation:0},{opacity:1,y:0,rotation:${(i - 1) * 9},duration:0.5,ease:"back.out(1.8)",immediateRender:false},${T(wAt("three", tc, tc + 0.3) + i * 0.15)});\n`; sfx("pop", wAt("three", tc, tc + 0.3) + i * 0.15); });
  popIn("#s4r", tm, "bell1"); }

// ---------- captions: one word, accent words in italic serif ----------
const ACC = new Set(["wish", "honest", "first", "heart", "fear", "universe", "second", "profile", "stories", "cards", "matters"]);
const FIX = { fur: "first or" };
const caps = words.map((w, i) => { const nx = words[i + 1] ? words[i + 1].start : TOTAL, st = w.start - 0.03, en = Math.min(nx - 0.03, w.end + 0.45, st < TIMER ? TIMER : Infinity);
  const d = (FIX[norm(w.text)] ?? w.text).replace(/&/g, "&amp;"); return { id: `c${i}`, st: +st.toFixed(3), dur: +Math.max(0.12, en - st).toFixed(3), txt: ACC.has(norm(w.text)) || FIX[norm(w.text)] ? `<i>${d}</i>` : d }; });
fs.writeFileSync(path.join(P, "compositions", "caps.html"), `<template>
<style>#root{position:absolute;inset:0;} .cg{position:absolute;left:0;top:1196px;width:1080px;text-align:center;}
.cg span{display:inline-block;font-family:Inter;font-weight:800;font-size:60px;color:#fff;text-shadow:0 3px 18px rgba(0,0,0,.85),0 0 4px rgba(0,0,0,.6);} .cg i{font-family:'Instrument Serif';font-weight:400;font-size:76px;}</style>
<div id="root" data-composition-id="caps" data-width="1080" data-height="1920">
${caps.map((c) => `<div id="${c.id}" class="clip cg" data-start="${c.st}" data-duration="${c.dur}"><span id="${c.id}-t">${c.txt}</span></div>`).join("\n")}
</div><script>const tl = gsap.timeline({ paused: true });
${caps.map((c) => `tl.fromTo("#${c.id}-t",{opacity:0,y:8},{opacity:1,y:0,duration:0.1,ease:"power2.out"},${c.st});`).join("\n")}
tl.set({}, {}, ${TOTAL}); window.__timelines["caps"] = tl;</script></template>`);

// ---------- audio: voice, soft continuous bed (+6 dB while the timer runs), sparse kit sfx ----------
ff(["-hide_banner", "-y", "-i", BODY, "-vn", "-ac", "1", "-ar", "48000", path.join(P, "assets", "voice.wav")]);
const getI = (txt) => { const m = txt.match(/"input_i"\s*:\s*"(-?[\d.]+)"/); return m ? +m[1] : null; };
const voI = getI(ff(["-hide_banner", "-i", path.join(P, "assets", "voice.wav"), "-af", "loudnorm=print_format=json", "-f", "null", "-"]));
const muI = getI(ff(["-hide_banner", "-t", String(TOTAL + 1), "-i", MUSIC, "-af", "loudnorm=print_format=json", "-f", "null", "-"]));
const loops = Math.max(0, Math.ceil((TOTAL + 1) / ffp(MUSIC)) - 1);
ff(["-hide_banner", "-y", "-stream_loop", String(loops), "-i", MUSIC, "-t", String(TOTAL + 0.5), "-af", `volume=${(voI - 17 - muI).toFixed(2)}dB,volume=eval=frame:volume='if(between(t\\,${T(TIMER + 0.1)}\\,${T(tGot - 0.2)})\\,2\\,1)',afade=t=out:st=${(TOTAL - 2).toFixed(2)}:d=2`, "-ar", "48000", "-ac", "2", path.join(P, "assets", "music.wav")]);
const KIT = { whoosh: [0.265, -16.2, -13], riser: [2.389, -6.0, -17], hit: [0.0, -12.8, -11], tick: [0.002, -17.4, -12], pop: [0.0, -19.1, -13], bell1: [0.0, -13.1, -14], bell2: [0.0, -10.6, -14] };
cues.sort((a, b) => a.t - b.t);
const audio = cues.map((c, i) => { const [pk, mm, rel] = KIT[c.kind]; fs.copyFileSync(LK + c.kind + ".wav", path.join(P, "assets", "k_" + c.kind + ".wav"));
  return `<audio id="fx${i}" class="clip" src="assets/k_${c.kind}.wav" data-start="${Math.max(0, c.t - pk).toFixed(3)}" data-duration="2.4" data-track-index="${7 + (i % 4)}" data-volume="${Math.min(1, Math.pow(10, (voI + rel - mm) / 20)).toFixed(3)}"></audio>`; });

// punch-ins on the full-face layout at every jump cut
offs.slice(1).forEach((c, i) => (tw += `tl.set("#fz",{scale:${i % 2 ? 1 : 1.08}},${T(c)});\n`));

const css = `*{margin:0;padding:0;box-sizing:border-box;}
html,body{width:1080px;height:1920px;overflow:hidden;background:#050505;}
.grid{position:absolute;inset:0;background-color:#050505;background-image:linear-gradient(rgba(255,255,255,.045) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.045) 1px,transparent 1px);background-size:44px 44px;}
#full{position:absolute;inset:0;overflow:hidden;} #fz{position:absolute;inset:0;transform-origin:540px 560px;} #full video{position:absolute;left:0;top:-17px;width:1080px;height:1954px;}
#lA{position:absolute;inset:0;opacity:0;}
#card{position:absolute;left:150px;top:1300px;width:780px;height:580px;border-radius:44px;overflow:hidden;border:2px solid rgba(255,255,255,.16);box-shadow:0 20px 60px rgba(0,0,0,.7);} #card video{position:absolute;left:0;top:-85px;width:780px;height:1412px;}
.scene{position:absolute;left:0;top:0;width:1080px;height:1200px;opacity:0;}
.title{position:absolute;left:0;top:150px;width:1080px;text-align:center;font-family:Inter;font-weight:900;font-size:68px;color:#fff;letter-spacing:-.01em;}
.title i,.rtag i,.gtag i,.or i,.tsub i{font-family:'Instrument Serif';font-weight:400;font-style:italic;letter-spacing:0;} .title i{font-size:84px;}
.win{position:absolute;left:0;top:270px;width:1080px;height:900px;overflow:hidden;} .cam{position:absolute;left:0;top:-50px;width:1080px;height:1000px;transform-origin:540px 500px;}
.dia{position:absolute;left:0;top:0;width:1080px;height:1000px;overflow:visible;} #s1 .dia{top:220px;}
.axis{fill:none;stroke:rgba(255,255,255,.85);stroke-width:4;}
.neon{fill:none;stroke:#ff1f3d;stroke-width:9;stroke-linecap:round;filter:drop-shadow(0 0 8px #ff2a45) drop-shadow(0 0 26px rgba(255,20,50,.75));}
.grey{fill:none;stroke:#9a9a9a;stroke-width:7;stroke-linecap:round;filter:drop-shadow(0 0 8px rgba(255,255,255,.35));}
.magenta{fill:none;stroke:#ff2bd6;stroke-width:8;stroke-linecap:round;filter:drop-shadow(0 0 10px #ff2bd6) drop-shadow(0 0 26px rgba(255,43,214,.6));}
.dot{fill:#fff;opacity:0;transform-box:fill-box;transform-origin:center;filter:drop-shadow(0 0 10px rgba(255,255,255,.9));} .dot.g{fill:#bbb;}
.tag{position:absolute;transform:translate(-50%,0);padding:8px 16px;border-radius:8px;background:#fff;color:#0a0a0a;font-family:Inter;font-weight:800;font-size:32px;white-space:nowrap;opacity:0;box-shadow:0 6px 24px rgba(0,0,0,.6);}
.rtag,.gtag{position:absolute;transform:translate(-50%,0);padding:10px 24px;border-radius:8px;background:#e3122f;color:#fff;font-family:Inter;font-weight:800;font-size:44px;white-space:nowrap;opacity:0;box-shadow:0 0 30px rgba(255,20,50,.6);} .rtag i,.gtag i{font-size:54px;}
.gtag{background:#3a3a3a;box-shadow:0 0 24px rgba(255,255,255,.15);}
.big{position:absolute;left:50%;transform:translate(-50%,0);padding:18px 70px;border-radius:14px;font-family:Inter;font-weight:900;font-size:130px;letter-spacing:.02em;opacity:0;}
.rbig{background:#e3122f;color:#fff;box-shadow:0 0 50px rgba(255,20,50,.7);} .obig{border:5px solid #fff;color:#fff;box-shadow:0 0 30px rgba(255,255,255,.25);}
.or{position:absolute;left:0;width:1080px;text-align:center;font-size:96px;color:rgba(255,255,255,.85);opacity:0;}
.pf{position:absolute;left:390px;top:330px;width:300px;height:300px;opacity:0;} .ring{position:absolute;inset:0;border-radius:50%;background:conic-gradient(#ff1f3d,#ff2bd6,#ff9a1f,#ff1f3d);box-shadow:0 0 50px rgba(255,31,61,.6);}
.pic{position:absolute;inset:14px;border-radius:50%;background:#161616;border:8px solid #050505;overflow:hidden;padding:30px;} .pic svg,.tcard svg{width:100%;height:100%;}
.tap{position:absolute;right:10px;bottom:20px;width:90px;height:90px;border-radius:50%;border:5px solid #fff;opacity:0;}
.tcard{position:absolute;top:560px;width:220px;height:360px;margin-left:-110px;opacity:0;transform-origin:50% 120%;filter:drop-shadow(0 0 22px rgba(255,31,61,.55));}
.cb{fill:#120608;stroke:#ff1f3d;stroke-width:5;} .cbi{fill:none;stroke:rgba(255,80,100,.55);stroke-width:2;} .cst{fill:none;stroke:#ffd9de;stroke-width:4;}
#timer{position:absolute;inset:0;opacity:0;} .tt{top:300px;}
svg.tring{position:absolute;left:140px;top:560px;width:800px;height:800px;} .rbg{fill:none;stroke:rgba(255,255,255,.1);stroke-width:22;}
.rfg{fill:none;stroke:#ff1f3d;stroke-width:22;stroke-linecap:round;filter:drop-shadow(0 0 12px #ff2a45) drop-shadow(0 0 40px rgba(255,20,50,.7));}
.tnum{position:absolute;left:0;top:640px;width:1080px;text-align:center;font-family:Inter;font-weight:900;font-size:560px;line-height:640px;color:#fff;text-shadow:0 0 40px rgba(255,255,255,.35),0 0 120px rgba(255,31,61,.5);}
.tsub{position:absolute;left:0;top:1460px;width:1080px;text-align:center;font-size:80px;color:rgba(255,255,255,.8);}
#flash{position:absolute;inset:0;background:#fff;opacity:0;}`;
fs.writeFileSync(path.join(P, "index.html"), `<!doctype html>
<html lang="en"><head><meta charset="UTF-8" /><meta name="viewport" content="width=1080, height=1920" />
<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Inter:wght@700;800;900&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js"></script>
<style>${css}</style></head><body>
<div id="root" data-composition-id="main" data-start="0" data-duration="${TOTAL}" data-width="1080" data-height="1920">
<div class="grid"></div>
<div id="lA"><div id="card"><video id="vcard" class="clip" src="assets/body.mp4" data-start="0" data-duration="${TOTAL}" data-media-start="0" data-track-index="1" muted playsinline></video></div>
${html}</div>
<div id="full"><div id="fz"><video id="vfull" class="clip" src="assets/body.mp4" data-start="0" data-duration="${TOTAL}" data-media-start="0" data-track-index="2" muted playsinline></video></div></div>
<div class="grid" id="timer" style="opacity:0">${timerHtml}</div>
<div id="flash"></div>
<div id="caps" data-composition-id="caps" data-composition-src="compositions/caps.html" data-start="0" data-duration="${TOTAL}" data-track-index="3" data-track-kind="captions" data-width="1080" data-height="1920" style="z-index:50"></div>
<audio id="vo" class="clip" src="assets/voice.wav" data-start="0" data-track-index="4" data-volume="1"></audio>
<audio id="bgm" class="clip" src="assets/music.wav" data-start="0" data-duration="${TOTAL}" data-track-index="5" data-volume="1"></audio>
${audio.join("\n")}
</div>
<script>
const tl = gsap.timeline({ paused: true });
${tw}tl.set({}, {}, ${TOTAL});
window.__timelines["main"] = tl;
</script></body></html>`);
console.log(`${SLUG}: cut ${(rawLen - acc + GAP).toFixed(1)}s, timer at ${T(TIMER)}s, total ${TOTAL}s, sfx ${cues.length}`);
if (RENDER) {
  const out = `${P}-render.mp4`;
  const r = spawnSync("npx", ["hyperframes@0.9.67", "render", "--workers", "5", "--fps", "24", "--crf", "20", "-o", `"${out}"`], { cwd: P, env, encoding: "utf8", shell: true, maxBuffer: 1 << 26 });
  if (r.status !== 0) throw new Error("render failed: " + (r.stderr || r.stdout).slice(-800));
  fs.mkdirSync(OUTDIR, { recursive: true });
  let name = NAME, k = 2; while (fs.existsSync(`${OUTDIR}/${name}.mp4`)) name = `${NAME} ${k++}`;
  ff(["-hide_banner", "-y", "-i", out, "-c:v", "copy", "-af", "loudnorm=I=-15:TP=-1.5:LRA=11", "-ar", "48000", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", `${OUTDIR}/${name}.mp4`]);
  fs.rmSync(out, { force: true }); fs.rmSync(P + "/.hyperframes", { recursive: true, force: true });
  console.log("delivered " + `${OUTDIR}/${name}.mp4`);
}

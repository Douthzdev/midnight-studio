// "Fio de partículas" faceless edit — ref: Midnight-Studio/ref-tongue/DECUPAGEM.md.
// One continuous shot: a particle thread hangs from a moon, the camera keeps descending past colored isometric platforms
// (one per idea) with dotted glowing icons; 2-line karaoke captions; fixed CTA pill; ends flying back to the top (loop).
// This file holds the v18 copy ("In a few days… comment 222"). usage: node tools/thread.mjs [--render]
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const RENDER = process.argv.includes("--render");
const ROOT = "M:/Google/hyperframes/Midnight-Studio/auraly-lineart", P = ROOT + "/v18-thread-money";
const VO = ROOT + "/vo/v18.wav", TR = ROOT + "/vo/t_v18/transcript.json";
const MUSIC = "C:/Users/Vinicius/Music/Songs Auraly UGC/Stargazing.mp3", LK = ROOT + "/sfx/kit/";
const env = { ...process.env, PATH: "M:/CLAUDE/tools/ffmpeg/bin;" + process.env.PATH };
for (const k of ["HYPERFRAMES_EXTRACT_CACHE_DIR", "TMPDIR", "TEMP", "TMP"]) env[k] = "M:/CLAUDE/tools/hf-frames";
const ff = (args) => { const r = spawnSync("ffmpeg", args, { encoding: "utf8", env, maxBuffer: 1 << 26 }); return (r.stderr || "") + (r.stdout || ""); };
const ffp = (f) => +spawnSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f], { encoding: "utf8", env }).stdout.trim();
fs.mkdirSync(P + "/assets", { recursive: true }); fs.mkdirSync(P + "/compositions", { recursive: true });
const T = (x) => (+x).toFixed(3), norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
const words = JSON.parse(fs.readFileSync(TR, "utf8"));
const W = words.map((w) => norm(w.text));
const wAt = (word, from = 0) => { const i = words.findIndex((w, j) => w.start >= from - 0.05 && W[j] === norm(word)); if (i < 0) throw new Error("word not found: " + word); return words[i].start; };
const VOLEN = ffp(VO), TOTAL = +(VOLEN + 1.6).toFixed(2);
let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

// ---------- world: platforms down a thread ----------
const STAGES = [
  { key: "money", label: "MONEY", col: "#FFC94A" },
  { key: "soulmate", label: "SOULMATE", col: "#FF6FAE" },
  { key: "skip", label: "IF YOU SKIP", col: "#FF4D4D" },
  { key: "claim", label: "CLAIM IT", col: "#4FE3F0" },
  { key: "mirror", label: "MIRROR", col: "#B58CFF" },
  { key: "222", label: "AMPLIFY", col: "#FFD60A" },
];
const TOP = 420, GAP = 1500, PY = (i) => 2300 + i * GAP, SCREEN_Y = 960; // platform i sits at world y PY(i), shown at screen y SCREEN_Y
const WORLD_H = PY(STAGES.length) + 400;
let svg = "", thr = "", tw = ""; const cues = []; const sfx = (kind, t) => cues.push({ kind, t });
const dot = (c, w = 4, gap = 9) => `fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-dasharray="0.1 ${gap}"`;
// the thread: dotted, gently wavy, colored by the stage below it
STAGES.forEach((s, i) => {
  const y0 = i ? PY(i - 1) + 90 : TOP + 60, y1 = PY(i) - 90; let d = `M540 ${y0}`;
  for (let y = y0 + 60; y <= y1; y += 60) d += ` L${(540 + Math.sin(y / 140) * 6).toFixed(1)} ${y}`;
  thr += `<path d="${d}" ${dot(s.col, 5, 11)} opacity=".85" class="glow"/>`;
});
// platform: perspective quad, dotted outline + inner pattern + speckles that fly in from scatter
function platform(i, s) {
  const cy = PY(i), id = `p${i}`, q = (k, dy = 0) => `M${540 - 150 * k} ${cy - 75 * k + dy}L${540 + 150 * k} ${cy - 75 * k + dy}L${540 + 210 * k} ${cy + 75 * k + dy}L${540 - 210 * k} ${cy + 75 * k + dy}Z`;
  let g = `<g id="${id}" class="plat" style="--c:${s.col}"><g id="${id}o" opacity="0"><path d="${q(1)}" ${dot(s.col, 5, 9)}/><path d="${q(1, 16)}" ${dot(s.col, 3, 12)} opacity=".55"/>
<path d="${q(0.62)}" ${dot(s.col, 3, 10)} opacity=".8"/><ellipse cx="540" cy="${cy}" rx="95" ry="34" ${dot(s.col, 3, 9)}/><path d="M${390} ${cy - 75}L${750} ${cy + 75}M${690} ${cy - 75}L${330} ${cy + 75}" ${dot(s.col, 2, 14)} opacity=".5"/></g>`;
  for (let k = 0; k < 110; k++) { const v = rnd() * 2 - 1, u = rnd(), y = cy - 75 + u * 150, half = 150 + u * 60, x = 540 + v * half * 0.95;
    g += `<circle class="sp ${id}s" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(1.2 + rnd() * 2.2).toFixed(1)}" fill="${s.col}" opacity="0" data-dx="${((rnd() - 0.5) * 260).toFixed(0)}" data-dy="${((rnd() - 0.5) * 200).toFixed(0)}"/>`; }
  g += `<text x="${540 + 250}" y="${cy - 30}" class="lbl" fill="${s.col}">${s.label}</text></g>`;
  svg += g;
}
const build = (i, t) => { // assemble platform i at t
  tw += `tl.fromTo("#p${i}o",{opacity:0,scale:0.85,svgOrigin:"540 ${PY(i)}"},{opacity:1,scale:1,duration:0.6,ease:"power3.out",immediateRender:false},${T(t)});\n`;
  tw += `gsap.utils.toArray(".p${i}s").forEach((e,k)=>tl.fromTo(e,{opacity:0,x:+e.dataset.dx,y:+e.dataset.dy},{opacity:0.9,x:0,y:0,duration:0.7,ease:"power3.out",immediateRender:false},${T(t)}+(k%20)*0.012));\n`;
  tw += `tl.fromTo("#p${i} .lbl",{opacity:0,x:-20},{opacity:1,x:0,duration:0.4,immediateRender:false},${T(t + 0.3)});\n`;
};
STAGES.forEach((s, i) => platform(i, s));
const draw = (sel, t, d = 0.8) => { tw += `tl.fromTo("${sel}",{opacity:0,scale:0.7,filter:"blur(8px)"},{opacity:1,scale:1,filter:"blur(0px)",duration:${d},ease:"back.out(1.6)",immediateRender:false,transformOrigin:"50% 50%"},${T(t)});\n`; };
const hand = (x, y, txt, c, id, size = 96) => (svg += `<text id="${id}" x="${x}" y="${y}" class="hand" fill="${c}" font-size="${size}" opacity="0" text-anchor="middle">${txt}</text>`);

// moon + opening title (the loop returns here)
svg += `<g class="glow"><path d="M600 160A150 150 0 1 0 600 400A118 118 0 1 1 600 160Z" ${dot("#F4E9C8", 5, 8)} transform="translate(30 0)"/></g>`;

// 1 money: coins rise up the thread
{ const cy = PY(0); for (let k = 0; k < 8; k++) { const x = 540 + (k % 2 ? 1 : -1) * (40 + (k * 23) % 90); svg += `<g id="coin${k}" opacity="0"><ellipse cx="${x}" cy="${cy - 40}" rx="30" ry="30" ${dot("#FFC94A", 4, 7)} class="glow"/><ellipse cx="${x}" cy="${cy - 40}" rx="16" ry="16" ${dot("#FFC94A", 3, 8)}/></g>`; }
  hand(540, cy - 470, "a large sum", "#FFC94A", "h0"); }
// 2 soulmate: two hearts tied to the thread
const heart = (x, y, s, c, id, extra = "") => `<path id="${id}" opacity="0" ${extra} d="M${x} ${y + 60 * s}C${x - 90 * s} ${y}${'' } ${x - 60 * s} ${y - 70 * s} ${x} ${y - 30 * s}C${x + 60 * s} ${y - 70 * s} ${x + 90 * s} ${y} ${x} ${y + 60 * s}Z" ${dot(c, 5, 9)} class="glow"/>`;
{ const cy = PY(1); svg += heart(330, cy - 300, 1.3, "#FF6FAE", "hL") + heart(750, cy - 300, 1.3, "#FF6FAE", "hR");
  svg += `<path id="tie" d="M380 ${cy - 270}Q540 ${cy - 200} 700 ${cy - 270}" ${dot("#FF6FAE", 3, 10)} opacity="0"/>`; hand(540, cy - 470, "will contact you", "#FF6FAE", "h1"); }
// 3 skip: crack across the platform, then it falls apart
{ const cy = PY(2); svg += `<path id="crack" d="M360 ${cy - 60}L450 ${cy - 10}L500 ${cy + 30}L560 ${cy - 5}L620 ${cy + 40}L700 ${cy + 10}L760 ${cy + 50}" fill="none" stroke="#FF4D4D" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" opacity="0" class="glow"/>`;
  hand(540, cy - 330, "it won't happen", "#FF4D4D", "h2"); }
// 4 claim: comment bubble, paper plane loops back into you
{ const cy = PY(3); svg += `<g id="bub" opacity="0"><path d="M240 ${cy - 420}h260a40 40 0 0 1 40 40v90a40 40 0 0 1-40 40H330l-50 40v-40h-40a40 40 0 0 1-40-40v-90a40 40 0 0 1 40-40Z" ${dot("#4FE3F0", 5, 9)} class="glow"/><text x="370" y="${cy - 310}" class="hand" fill="#4FE3F0" font-size="80" text-anchor="middle">comment</text></g>`;
  svg += `<g id="plane" opacity="0"><path d="M0 0L120 -40L80 50L55 18Z M55 18L120 -40" ${dot("#4FE3F0", 4, 7)} class="glow"/></g>`; hand(540, cy + 300, "to yourself", "#4FE3F0", "h3", 84); }
// 5 mirror: heart above, its reflection below the platform
{ const cy = PY(4); svg += heart(540, cy - 250, 1.5, "#B58CFF", "mh") + `<g id="mr" opacity="0" transform="translate(0 ${2 * cy}) scale(1 -1)">${heart(540, cy - 250, 1.6, "#B58CFF", "mh2", 'opacity="1"')}</g>`;
  hand(540, cy - 470, "how you treat it", "#B58CFF", "h4", 84); }
// 6 222 + pulse rings
{ const cy = PY(5); svg += `<text id="n222" x="540" y="${cy - 170}" text-anchor="middle" class="big" ${dot("#FFD60A", 6, 9)} opacity="0">222</text>`;
  for (let k = 0; k < 3; k++) svg += `<ellipse id="ring${k}" cx="540" cy="${cy}" rx="230" ry="88" ${dot("#FFD60A", 4, 10)} opacity="0"/>`; }

// ---------- timing (all from the voice) ----------
const tMoney = wAt("sum"), tSoul = wAt("soulmate"), tCont = wAt("contact"), tSkip = wAt("skip"), tWont = wAt("won't"), tClaim = wAt("claim"),
  tCom = wAt("comment", tClaim), tSend = wAt("send"), tYour = wAt("yourself"), tHow = wAt("how"),
  tFol = wAt("follow"), t222 = wAt("222"), tAmp = wAt("amplify");
// camera: arrive just before each stage's keyword, then keep drifting down (never fully stops)
const arrive = [tMoney - 0.6, tSoul - 0.5, tSkip - 0.5, tClaim - 0.5, tHow + 0.1, tFol + 0.1];
const camY = (i) => -(PY(i) - SCREEN_Y);
tw += `tl.set("#world",{y:${-(TOP - 600)}},0);\n`;
tw += `tl.fromTo("#thread0",{scaleY:0},{scaleY:1,duration:1.2,ease:"power2.out",transformOrigin:"50% 0%"},0.1);\n`;
arrive.forEach((a, i) => {
  const from = i ? camY(i - 1) - 110 : -(TOP - 600), end = i < arrive.length - 1 ? arrive[i + 1] - 0.9 : VOLEN + 0.2;
  tw += `tl.fromTo("#world",{y:${from}},{y:${camY(i)},duration:0.9,ease:"power2.inOut",immediateRender:false},${T(a - 0.9)});\n`;
  tw += `tl.to("#world",{y:${camY(i) - 110},duration:${T(end - a)},ease:"none"},${T(a)});\n`;
  build(i, a - 0.35); sfx("whoosh", a - 0.75);
});
tw += `tl.to("#title",{opacity:0,y:-30,duration:0.4},${T(arrive[0] - 1.0)});\n`;
// loop back to the moon + title at the end
tw += `tl.to("#world",{y:${-(TOP - 600)},duration:1.0,ease:"power3.inOut"},${T(VOLEN + 0.2)});tl.to("#title",{opacity:1,y:0,duration:0.5},${T(VOLEN + 0.8)});\n`; sfx("riser", VOLEN + 0.6);
// stage animations
for (let k = 0; k < 8; k++) tw += `tl.fromTo("#coin${k}",{opacity:0,y:60},{opacity:1,y:-${260 + k * 40},duration:1.6,ease:"power1.out",immediateRender:false},${T(tMoney + k * 0.12)});tl.to("#coin${k}",{opacity:0,duration:0.4},${T(tMoney + 1.4 + k * 0.12)});\n`;
sfx("bell1", tMoney); draw("#h0", tMoney - 0.4, 0.6);
draw("#hL", tSoul); draw("#hR", tSoul + 0.2); tw += `tl.to("#tie",{opacity:1,duration:0.5},${T(tCont)});tl.to("#hL",{x:60,duration:0.6,ease:"power2.inOut"},${T(tCont)});tl.to("#hR",{x:-60,duration:0.6,ease:"power2.inOut"},${T(tCont)});\n`; draw("#h1", tCont, 0.6); sfx("bell2", tCont);
tw += `tl.fromTo("#crack",{opacity:0,scaleX:0},{opacity:1,scaleX:1,duration:0.35,transformOrigin:"0% 50%",ease:"power2.out",immediateRender:false},${T(tSkip)});\n`; sfx("hit", tSkip);
tw += `gsap.utils.toArray(".p2s").forEach((e,k)=>tl.to(e,{x:(k%2?1:-1)*(40+k%60),y:160+(k%7)*40,opacity:0,duration:0.9,ease:"power2.in"},${T(tWont)}+(k%15)*0.01));tl.to("#p2o",{opacity:0.15,duration:0.6},${T(tWont)});\n`; draw("#h2", tWont - 0.1, 0.5);
draw("#bub", tCom - 0.05, 0.5); sfx("pop", tCom);
{ const cy = PY(3); tw += `tl.set("#plane",{x:700,y:${cy - 360},rotation:0},0);tl.to("#plane",{opacity:1,duration:0.2},${T(tSend)});tl.to("#plane",{keyframes:{x:[700,860,820,620,540],y:[${cy - 360},${cy - 470},${cy - 220},${cy - 160},${cy - 20}],rotation:[0,-30,120,160,120]},duration:${T(tYour - tSend + 0.1)},ease:"sine.inOut"},${T(tSend)});tl.to("#plane",{opacity:0,scale:0.3,duration:0.2},${T(tYour + 0.05)});tl.fromTo("#p3o",{scale:1},{scale:1.08,duration:0.18,yoyo:true,repeat:1,svgOrigin:"540 ${cy}",immediateRender:false},${T(tYour + 0.1)});\n`; }
draw("#h3", tYour, 0.5); sfx("bell1", tYour + 0.1);
draw("#mh", wAt("treat", tHow) - 0.1); draw("#h4", tHow - 0.1, 0.6); tw += `tl.fromTo("#mr",{opacity:0},{opacity:0.55,duration:0.7,immediateRender:false},${T(wAt("exactly") - 0.1)});\n`; sfx("bell2", wAt("exactly"));
draw("#n222", t222 - 0.1, 0.7); sfx("sting", t222);
for (let k = 0; k < 3; k++) tw += `tl.fromTo("#ring${k}",{opacity:0.9,scale:0.6},{opacity:0,scale:1.9,duration:1.4,ease:"power2.out",transformOrigin:"50% 50%",immediateRender:false},${T(tAmp + k * 0.35)});\n`;
tw += `tl.to("#n222",{scale:1.08,duration:0.25,yoyo:true,repeat:3,transformOrigin:"50% 50%"},${T(tAmp)});\n`;
// CTA pill
tw += `tl.fromTo("#cta",{opacity:0,y:20},{opacity:1,y:0,duration:0.4,ease:"back.out(2)",immediateRender:false},${T(t222 - 0.2)});\n`;

// ---------- karaoke captions: 2 lines, dim -> white on the word, keywords yellow ----------
const KEY = new Set(["money", "soulmate", "skip", "wont", "happen", "claim", "comment", "yourself", "treat", "exactly", "manifestation", "follow", "222", "amplify", "energy"]);
const groups = []; let g = [];
words.forEach((w, i) => { g.push(w); const nx = words[i + 1]; if (!nx || (/[.,]$/.test(w.text) && g.length >= 4) || g.length >= 8 || nx.start - w.end > 0.45) { groups.push(g); g = []; } });
let cap = "", ctw = "";
groups.forEach((gr, gi) => { const st = gr[0].start - 0.12, en = gi < groups.length - 1 ? groups[gi + 1][0].start - 0.12 : VOLEN + 0.3;
  cap += `<div id="g${gi}" class="clip cg" data-start="${T(st)}" data-duration="${T(en - st)}">${gr.map((w, k) => `<span id="g${gi}w${k}" class="w${KEY.has(norm(w.text)) ? " k" : ""}">${w.text}</span>`).join(" ")}</div>\n`;
  ctw += `tl.fromTo("#g${gi}",{opacity:0,y:10},{opacity:1,y:0,duration:0.2},${T(st)});\n` + gr.map((w, k) => `tl.to("#g${gi}w${k}",{opacity:1,duration:0.08},${T(w.start)});`).join("") + "\n"; });
fs.writeFileSync(P + "/compositions/caps.html", `<template><style>#root{position:absolute;inset:0;} .cg{position:absolute;left:150px;width:780px;top:1330px;text-align:center;font-family:Poppins;font-weight:500;font-size:48px;line-height:1.3;color:#fff;}
.w{opacity:.35;} .k{color:#FFD60A;font-weight:700;}</style>
<div id="root" data-composition-id="caps" data-width="1080" data-height="1920">${cap}</div>
<script>const tl = gsap.timeline({ paused: true });
${ctw}tl.set({}, {}, ${TOTAL}); window.__timelines["caps"] = tl;</script></template>`);

// ---------- audio ----------
fs.copyFileSync(VO, P + "/assets/voice.wav");
const getI = (txt) => +(txt.match(/"input_i"\s*:\s*"(-?[\d.]+)"/) || [, -20])[1];
const voI = getI(ff(["-hide_banner", "-i", VO, "-af", "loudnorm=print_format=json", "-f", "null", "-"]));
const muI = getI(ff(["-hide_banner", "-t", String(TOTAL + 1), "-i", MUSIC, "-af", "loudnorm=print_format=json", "-f", "null", "-"]));
ff(["-hide_banner", "-y", "-i", MUSIC, "-t", String(TOTAL + 0.5), "-af", `volume=${(voI - 16 - muI).toFixed(2)}dB,afade=t=in:d=0.6,afade=t=out:st=${(TOTAL - 1.5).toFixed(2)}:d=1.5`, "-ar", "48000", "-ac", "2", P + "/assets/music.wav"]);
const KIT = { whoosh: [0.265, -16.2, -17], riser: [2.389, -6.0, -18], hit: [0.0, -12.8, -12], pop: [0.0, -19.1, -14], bell1: [0.0, -13.1, -15], bell2: [0.0, -10.6, -15], sting: [0.139, -10.1, -12] };
cues.sort((a, b) => a.t - b.t);
const audio = cues.map((c, i) => { const [pk, mm, rel] = KIT[c.kind]; fs.copyFileSync(LK + c.kind + ".wav", P + "/assets/k_" + c.kind + ".wav");
  return `<audio id="fx${i}" class="clip" src="assets/k_${c.kind}.wav" data-start="${Math.max(0, c.t - pk).toFixed(3)}" data-duration="2.4" data-track-index="${7 + (i % 4)}" data-volume="${Math.min(1, Math.pow(10, (voI + rel - mm) / 20)).toFixed(3)}"></audio>`; });

const css = `*{margin:0;padding:0;box-sizing:border-box;} html,body{width:1080px;height:1920px;overflow:hidden;background:#0b0b0d;}
#bg{position:absolute;inset:0;background:radial-gradient(70% 50% at 50% 40%,#16151b,#0b0b0d 70%,#050506);}
#noise{position:absolute;inset:0;opacity:.09;mix-blend-mode:screen;}
#world{position:absolute;left:0;top:0;width:1080px;height:${WORLD_H}px;} #world svg{position:absolute;left:0;top:0;width:1080px;height:${WORLD_H}px;overflow:visible;}
.glow,.plat{filter:drop-shadow(0 0 6px currentColor);} .plat{color:var(--c);filter:drop-shadow(0 0 8px var(--c)) drop-shadow(0 0 22px var(--c));}
.lbl{font-family:Poppins;font-weight:600;font-size:30px;letter-spacing:.22em;opacity:0;}
.hand{font-family:Caveat;font-weight:600;filter:drop-shadow(0 0 10px currentColor);}
.big{font-family:Poppins;font-weight:800;font-size:300px;letter-spacing:.04em;filter:drop-shadow(0 0 14px #FFD60A) drop-shadow(0 0 40px rgba(255,214,10,.6));}
#title{position:absolute;left:0;top:110px;width:1080px;text-align:center;font-family:Poppins;font-weight:800;font-size:76px;line-height:1.08;color:#fff;letter-spacing:.01em;} #title b{color:#FFD60A;}
#cta{position:absolute;left:0;top:1580px;width:1080px;text-align:center;opacity:0;font-family:Poppins;}
.pill{display:inline-flex;align-items:center;gap:14px;padding:16px 40px;border-radius:60px;border:3px solid #FFD60A;color:#fff;font-weight:800;font-size:38px;letter-spacing:.06em;box-shadow:0 0 30px rgba(255,214,10,.35);} .pill b{color:#FFD60A;}
.psub{margin-top:16px;font-weight:700;font-size:26px;letter-spacing:.3em;color:rgba(255,255,255,.7);}`;
fs.writeFileSync(P + "/index.html", `<!doctype html><html lang="en"><head><meta charset="UTF-8" /><meta name="viewport" content="width=1080, height=1920" />
<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Poppins:wght@500;600;700;800&family=Caveat:wght@600&display=swap" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js"></script><style>${css}</style></head><body>
<div id="root" data-composition-id="main" data-start="0" data-duration="${TOTAL}" data-width="1080" data-height="1920">
<div id="bg"></div><svg id="noise" width="1080" height="1920"><filter id="nz"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="4"/><feColorMatrix values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 .6 0"/></filter><rect width="1080" height="1920" filter="url(#nz)"/></svg>
<div id="world"><svg viewBox="0 0 1080 ${WORLD_H}"><g id="thread0">${thr}</g>${svg}</svg></div>
<div id="title">IN A FEW <b>DAYS…</b></div>
<div id="cta"><div class="pill">💬 COMMENT <b>222</b></div><div class="psub">AMPLIFY THIS ENERGY</div></div>
<div id="caps" data-composition-id="caps" data-composition-src="compositions/caps.html" data-start="0" data-duration="${TOTAL}" data-track-index="3" data-track-kind="captions" data-width="1080" data-height="1920" style="z-index:50"></div>
<audio id="vo" class="clip" src="assets/voice.wav" data-start="0" data-track-index="4" data-volume="1"></audio>
<audio id="bgm" class="clip" src="assets/music.wav" data-start="0" data-duration="${TOTAL}" data-track-index="5" data-volume="1"></audio>
${audio.join("\n")}
</div><script>const tl = gsap.timeline({ paused: true });
${tw}tl.set({}, {}, ${TOTAL}); window.__timelines["main"] = tl;</script></body></html>`);
console.log(`v18: ${TOTAL}s, ${groups.length} caption groups, sfx ${cues.length}`);
if (RENDER) {
  const out = P + "-render.mp4";
  const r = spawnSync("npx", ["hyperframes@0.9.67", "render", "--workers", "5", "--fps", "30", "--crf", "20", "-o", `"${out}"`], { cwd: P, env, encoding: "utf8", shell: true, maxBuffer: 1 << 26 });
  if (r.status !== 0) throw new Error("render failed: " + (r.stderr || r.stdout).slice(-800));
  ff(["-hide_banner", "-y", "-i", out, "-c:v", "copy", "-af", "loudnorm=I=-15:TP=-1.5:LRA=11", "-ar", "48000", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", P + "-final.mp4"]);
  fs.rmSync(out, { force: true }); fs.rmSync(P + "/.hyperframes", { recursive: true, force: true });
  console.log("final " + P + "-final.mp4");
}

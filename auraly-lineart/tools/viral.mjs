// Viral motion-design edit: silence-cut talking head + glass pop-up cards, glowing gradient numbers, split screen.
// usage: node tools/viral.mjs <hookName> <bodyName>     e.g.  node tools/viral.mjs selena marva
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { locate } from "./media.mjs";

const [hk, bk] = process.argv.slice(2).map((s) => s.toLowerCase());
const G = "M:/Google", SRC = "M:/Google/hyperframes/Midnight-Studio/auraly-split/src", P = `M:/Google/hyperframes/Midnight-Studio/auraly-viral/${hk}-${bk}`;
const MUSIC = "C:/Users/Vinicius/Music/Songs Auraly UGC/MORNING LIGHTT.MP3";
const LK = "M:/Google/hyperframes/Midnight-Studio/auraly-lineart/sfx/kit/";
const ff = (args) => { const r = spawnSync("ffmpeg", args, { encoding: "utf8" }); return (r.stderr || "") + (r.stdout || ""); };
const ffp = (f) => +spawnSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f], { encoding: "utf8" }).stdout.trim();
const HOOK = locate("hook", hk), RAW = locate("body", bk);

// hook: keep only the faceless close-ups (up to the cut into the table shot)
const hcuts = (ff(["-hide_banner", "-i", HOOK, "-vf", "select='gt(scene,0.25)',showinfo", "-f", "null", "-"]).match(/pts_time:[\d.]+/g) || []).map((s) => +s.slice(9));
const H = +(hcuts.filter((t) => t > 1.5 && t < 4).at(-1) ?? 2.5).toFixed(3);

// ---------- silence cut (same rule as split.mjs) ----------
const sil = [...ff(["-hide_banner", "-i", RAW, "-af", "silencedetect=noise=-40dB:d=0.3", "-f", "null", "-"]).matchAll(/silence_(start|end): ([\d.]+)/g)].map((m) => +m[2]);
const rawLen = ffp(RAW), PAD = 0.12, keep = []; let cur = 0;
for (let i = 0; i + 1 < sil.length; i += 2) { const [a, b] = [sil[i], sil[i + 1]]; const cs = a < 0.05 ? 0 : a + PAD, ce = b > rawLen - 0.05 ? rawLen : b - PAD; if (ce - cs < 0.15) continue; if (cs > cur) keep.push([cur, cs]); cur = ce; }
if (sil.length % 2) { const a = sil.at(-1); if (a + PAD > cur) { keep.push([cur, a + PAD]); cur = rawLen; } }
if (cur < rawLen - 0.05) keep.push([cur, rawLen]);
const offs = []; let acc = 0; for (const [a, b] of keep) { offs.push(acc); acc += b - a; }
const mapT = (t) => { for (let i = keep.length - 1; i >= 0; i--) if (t >= keep[i][0]) return offs[i] + Math.min(t, keep[i][1]) - keep[i][0]; return 0; };
const BODY = path.join(SRC, bk + "_cut.mp4");
if (!fs.existsSync(BODY) || fs.statSync(BODY).mtimeMs < fs.statSync(RAW).mtimeMs) {
  const fc = keep.map(([a, b], i) => `[0:v]trim=${a.toFixed(3)}:${b.toFixed(3)},setpts=PTS-STARTPTS[v${i}];[0:a]atrim=${a.toFixed(3)}:${b.toFixed(3)},asetpts=PTS-STARTPTS[a${i}];`).join("") + keep.map((_, i) => `[v${i}][a${i}]`).join("") + `concat=n=${keep.length}:v=1:a=1[v][a]`;
  ff(["-hide_banner", "-y", "-i", RAW, "-filter_complex", fc, "-map", "[v]", "-map", "[a]", "-c:v", "h264_nvenc", "-preset", "p5", "-rc", "vbr", "-cq", "19", "-b:v", "0", "-c:a", "aac", "-b:a", "192k", BODY]);
}
const words = JSON.parse(fs.readFileSync(`${SRC}/t_${bk}_body/transcript.json`)).map((w) => ({ ...w, start: +(H + mapT(w.start)).toFixed(3), end: +(H + mapT(w.end)).toFixed(3) }));
const TOTAL = +(H + Math.min(acc, mapT(rawLen))).toFixed(3);
const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
const W = words.map((w) => norm(w.text));
const at = (phrase, after = 0) => { const p = phrase.split(" ").map(norm); for (let i = 0; i < W.length; i++) if (words[i].start >= after && p.every((x, j) => W[i + j] === x)) return words[i].start; throw new Error(`phrase "${phrase}" not found`); };
const wAt = (word, from) => { const i = words.findIndex((w) => w.start >= from - 0.05 && norm(w.text) === norm(word)); if (i < 0) throw new Error(`word ${word} after ${from}`); return words[i].start; };

// ---------- components ----------
let html = "", tw = "", n = 0; const cues = [];
const uid = (p) => `${p}${n++}`;
const T = (x) => (+x).toFixed(3);
const sfx = (kind, t) => cues.push({ kind, t });
// card pops in (scale + blur), holds, pops out
const pop = (id, t, out, o = {}) => {
  tw += `tl.fromTo("#${id}",{opacity:0,scale:${o.s ?? 0.82},y:${o.y ?? 30},filter:"blur(10px)"},{opacity:1,scale:1,y:0,filter:"blur(0px)",duration:0.42,ease:"back.out(1.7)",immediateRender:${t < 0.01}},${T(t)});\n`;
  if (out) out = Math.min(out, t + (o.hold ?? 3.8));
  if (out) tw += `tl.to("#${id}",{opacity:0,scale:0.9,y:-20,filter:"blur(8px)",duration:0.25,ease:"power2.in"},${T(out - 0.25)});\n`;
  sfx(o.snd || "pop", t);
};
const ICON = {
  lock: `<svg viewBox="0 0 64 64"><rect x="12" y="28" width="40" height="30" rx="8" fill="url(#gGold)"/><path d="M20 28v-8a12 12 0 0 1 24 0v8" fill="none" stroke="url(#gGold)" stroke-width="6"/><circle cx="32" cy="42" r="4" fill="#2a1a08"/></svg>`,
  eye: `<svg viewBox="0 0 64 64"><path d="M4 32C14 16 50 16 60 32C50 48 14 48 4 32Z" fill="none" stroke="url(#gViolet)" stroke-width="5"/><circle cx="32" cy="32" r="10" fill="url(#gViolet)"/></svg>`,
  warn: `<svg viewBox="0 0 64 64"><path d="M32 6L60 56H4Z" fill="url(#gRed)"/><rect x="29" y="22" width="6" height="18" rx="3" fill="#fff"/><circle cx="32" cy="47" r="3.5" fill="#fff"/></svg>`,
  up: `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" fill="url(#gGreen)"/><path d="M20 40L44 18M30 18H44V32" fill="none" stroke="#06281b" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  check: `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" fill="url(#gGreen)"/><path class="ck" d="M18 33L28 43L47 22" fill="none" stroke="#06281b" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" pathLength="1" stroke-dasharray="1 1"/></svg>`,
  heart: `<svg viewBox="0 0 64 64"><path d="M32 56C10 40 4 28 10 18C16 8 28 10 32 20C36 10 48 8 54 18C60 28 54 40 32 56Z" fill="url(#gRed)"/></svg>`,
  save: `<svg viewBox="0 0 64 64"><path d="M14 6H50V58L32 44L14 58Z" fill="url(#gGold)"/></svg>`,
  send: `<svg viewBox="0 0 64 64"><path d="M4 30L60 6L44 58L32 38Z" fill="url(#gCyan)"/><path d="M32 38L60 6" stroke="#0b2233" stroke-width="3"/></svg>`,
  bell: `<svg viewBox="0 0 64 64"><path d="M16 44V28a16 16 0 0 1 32 0v16l5 6H11Z" fill="url(#gGold)"/><circle cx="32" cy="56" r="5" fill="url(#gGold)"/></svg>`,
  mail: `<svg viewBox="0 0 64 64"><rect x="4" y="12" width="56" height="40" rx="8" fill="url(#gViolet)"/><path d="M6 16L32 36L58 16" fill="none" stroke="#1d1035" stroke-width="4"/></svg>`,
};
const glass = (id, top, inner, glow = "rgba(255,180,80,.35)", extra = "") => { html += `<div id="${id}" class="card" style="top:${top}px;--glow:${glow};${extra}">${inner}</div>\n`; };

// numbered beats (phrase, builder(t, end))
const B = [];
const beat = (phrase, fn) => B.push({ phrase, fn });

beat("if youre watching", (t, e) => {
  const id = uid("date");
  glass(id, 1010, `<div class="row"><div class="lbl">ONLY FOR</div></div><div class="dates"><span class="num gold" id="${id}a">20</span><span class="amp">&amp;</span><span class="num gold" id="${id}b">21</span></div><div class="sub">NOVEMBER</div>`);
  pop(id, wAt("november", t) - 0.1, Math.min(e, wAt("november", t) + 3.2), { snd: "hit" });
  tw += `tl.fromTo("#${id}a,#${id}b",{y:40,opacity:0},{y:0,opacity:1,duration:0.5,stagger:0.12,ease:"back.out(2)"},${T(wAt("november", t) + 0.1)});\n`;
});
beat("whatever happens", (t, e) => {
  const id = uid("lock");
  glass(id, 1040, `<div class="row"><div class="ic">${ICON.lock}</div><div><div class="ttl">KEEP IT TO YOURSELF</div><div class="sub2">Whatever happens</div></div></div>`);
  pop(id, t, e - 0.05);
});
beat("do not tell your sister", (t, e) => {
  const id = uid("tell"), ppl = [["sister", "Your sister"], ["friend", "Your best friend"], ["anyone", "Anyone"]];
  glass(id, 920, `<div class="ttl sm">DO NOT TELL</div>` + ppl.map(([k, s], i) => `<div class="person" id="${id}p${i}"><div class="av" style="background:${["linear-gradient(135deg,#F472B6,#A78BFA)", "linear-gradient(135deg,#60A5FA,#5EEAD4)", "linear-gradient(135deg,#FBBF24,#F97316)"][i]}"></div><div class="pn">${s}</div><div class="x" id="${id}x${i}">✕</div><div class="strike" id="${id}s${i}"></div></div>`).join(""), "rgba(244,63,94,.35)");
  pop(id, t, e - 0.05);
  ppl.forEach(([k], i) => { const tt = wAt(k, t); tw += `tl.fromTo("#${id}x${i}",{scale:0,opacity:0},{scale:1,opacity:1,duration:0.3,ease:"back.out(3)",immediateRender:false},${T(tt)});tl.fromTo("#${id}s${i}",{scaleX:0},{scaleX:1,duration:0.25,ease:"power2.out",immediateRender:false},${T(tt)});tl.to("#${id}p${i}",{opacity:0.55,duration:0.2},${T(tt + 0.2)});\n`; sfx("tick", tt); });
});
beat("pay close attention", (t, e) => focus(t, Math.min(e, t + 2.6)));
beat("because the most", (t, e) => split(t, e, `<div class="bigword"><div class="num grad-sun" style="font-size:150px">THE DAY</div><div class="ttl">that changes everything</div></div><div class="sun" id="SUN${n}"></div>`, "rgba(251,191,36,.45)"));
beat("but if you skip", (t, e) => {
  const id = uid("skip"), tt = wAt("skip", t);
  glass(id, 1060, `<div class="row"><div class="skipbtn" id="${id}b">SKIP ▸▸<div class="slash" id="${id}l"></div></div><div class="ttl" style="font-size:52px">DON'T SKIP</div></div>`, "rgba(244,63,94,.45)");
  pop(id, tt - 0.1, e - 0.05);
  tw += `tl.fromTo("#${id}l",{scaleX:0},{scaleX:1,duration:0.25,ease:"power3.out",immediateRender:false},${T(tt + 0.35)});tl.to("#${id}",{keyframes:{x:[0,-14,12,-8,5,0]},duration:0.4},${T(tt + 0.4)});\n`;
  sfx("hit", tt + 0.35);
});
beat("not everyone will", (t, e) => {
  const id = uid("eye");
  glass(id, 1040, `<div class="row"><div class="ic">${ICON.eye}</div><div><div class="ttl">NOT EVERYONE</div><div class="sub2">will see this video</div></div></div>`, "rgba(167,139,250,.45)");
  pop(id, t, e - 0.05);
});
beat("i see wealth", (t, e) => {
  const id = uid("chart");
  const pts = [[0, 300], [90, 270], [170, 285], [250, 220], [330, 235], [420, 150], [500, 165], [600, 60]];
  const d = "M" + pts.map((p) => p.join(",")).join(" L");
  split(t, e, `<div class="chartbox"><div class="ttl sm" style="text-align:left">WEALTH &amp; PROSPERITY</div><div class="num green" style="font-size:150px;text-align:left"><span>+</span><span id="${id}n">0</span><span style="font-size:90px">%</span></div>
<svg width="640" height="320" viewBox="-10 0 620 320"><defs><linearGradient id="${id}f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#34D399" stop-opacity=".45"/><stop offset="1" stop-color="#34D399" stop-opacity="0"/></linearGradient></defs><path id="${id}a" d="${d} L600,320 L0,320Z" fill="url(#${id}f)" opacity="0"/><path id="${id}l" d="${d}" fill="none" stroke="#34D399" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" pathLength="1" stroke-dasharray="1 1" style="filter:drop-shadow(0 0 12px #34D399)"/><circle id="${id}c" cx="600" cy="60" r="14" fill="#fff" style="filter:drop-shadow(0 0 14px #34D399)" opacity="0"/></svg></div>`, "rgba(52,211,153,.45)");
  tw += `tl.fromTo("#${id}l",{strokeDashoffset:1},{strokeDashoffset:0,duration:1.6,ease:"power2.inOut",immediateRender:false},${T(t + 0.5)});tl.fromTo("#${id}a",{opacity:0},{opacity:1,duration:0.8},${T(t + 1.2)});tl.fromTo("#${id}c",{opacity:0,scale:0,transformOrigin:"50% 50%"},{opacity:1,scale:1,duration:0.3,ease:"back.out(3)",immediateRender:false},${T(t + 2.0)});\n`;
  tw += `tl.fromTo("#${id}n",{innerText:0},{innerText:100,snap:{innerText:1},duration:1.6,ease:"power2.out",immediateRender:false},${T(t + 0.5)});\n`;
  sfx("riser", t + 2.0);
});
beat("comes directly", (t, e) => {
  const id = uid("mich");
  glass(id, 1000, `<div class="halo" id="${id}h"></div><div class="num grad-sun" style="font-size:96px;letter-spacing:.02em">SAINT MICHAEL</div><div class="sub2" style="text-align:center">a message sent directly to you</div>`, "rgba(251,191,36,.55)", "text-align:center");
  pop(id, t + 0.2, t + 3.4, { snd: "bell3", hold: 4 }); // stays over the warning banner (different zone)
  tw += `tl.fromTo("#${id}h",{rotation:0},{rotation:90,duration:${T(e - t)},ease:"none"},${T(t)});\n`;
});
beat("but he also", (t, e) => {
  const id = uid("warn");
  html += `<div id="${id}" class="banner" style="--glow:rgba(244,63,94,.6)"><div class="ic sm">${ICON.warn}</div><div><div class="bt">WARNING</div><div class="bs">he also brings a warning</div></div></div>\n`;
  tw += `tl.fromTo("#${id}",{y:-260,opacity:0},{y:0,opacity:1,duration:0.45,ease:"back.out(1.6)",immediateRender:false},${T(t)});tl.to("#${id}",{y:-260,opacity:0,duration:0.3,ease:"power2.in"},${T(e - 0.3)});\n`;
  tw += `tl.to("#stage",{keyframes:{x:[0,-10,9,-6,4,0]},duration:0.35},${T(wAt("warning", t))});tl.fromTo("#redflash",{opacity:0},{opacity:0.35,duration:0.08,immediateRender:false},${T(wAt("warning", t))});tl.to("#redflash",{opacity:0,duration:0.5},${T(wAt("warning", t) + 0.08)});\n`;
  sfx("hit", wAt("warning", t)); sfx("whoosh", t);
});
beat("something is about", (t, e) => {
  const id = uid("favor");
  glass(id, 1040, `<div class="row"><div class="ic">${ICON.up}</div><div><div class="ttl green-t">IN YOUR FAVOR</div><div class="sub2">something is about to change</div></div></div>`, "rgba(52,211,153,.45)");
  pop(id, t, e - 0.05);
});
beat("a powerful blessing", (t, e) => {
  const id = uid("bless");
  split(t, e, `<div class="orb" id="${id}o"></div><div class="bigword" style="position:relative"><div class="ttl" style="font-size:44px;letter-spacing:.2em;opacity:.85">BLESSING INCOMING</div><div class="num grad-sun" style="font-size:200px"><span id="${id}n">0</span>%</div><div class="bar"><div class="fill" id="${id}f"></div></div></div>`, "rgba(251,191,36,.5)");
  tw += `tl.fromTo("#${id}n",{innerText:0},{innerText:100,snap:{innerText:1},duration:${T(Math.min(2.6, e - t - 0.8))},ease:"power1.inOut",immediateRender:false},${T(t + 0.5)});tl.fromTo("#${id}f",{scaleX:0},{scaleX:1,duration:${T(Math.min(2.6, e - t - 0.8))},ease:"power1.inOut",immediateRender:false},${T(t + 0.5)});tl.fromTo("#${id}o",{scale:0.8,rotation:0},{scale:1.15,rotation:120,duration:${T(e - t)},ease:"none"},${T(t)});\n`;
  sfx("riser", t + Math.min(2.6, e - t - 0.8) + 0.5); sfx("hit", t + Math.min(2.6, e - t - 0.8) + 0.5);
});
beat("confirm that this", (t, e) => {
  const id = uid("conf");
  glass(id, 1060, `<div class="row"><div class="ic" id="${id}c">${ICON.check}</div><div class="ttl" style="font-size:46px">THIS MESSAGE IS FOR ME</div></div>`, "rgba(52,211,153,.4)");
  pop(id, t, Math.min(e, t + 3) - 0.05);
  tw += `tl.fromTo("#${id}c .ck",{strokeDashoffset:1},{strokeDashoffset:0,duration:0.35,immediateRender:false},${T(t + 0.45)});\n`; sfx("tick", t + 0.45);
});
beat("this is the final", (t, e) => notif(t, e, ICON.mail, "UNIVERSE", "The final message 💌", "rgba(167,139,250,.5)"));
beat("now like this", (t, e) => seal(t, e, 0, ICON.heart, "LIKE", "#F43F5E", "first"));
beat("save this post", (t, e) => seal(t, e, 1, ICON.save, "SAVE", "#FBBF24", "second"));
beat("send this video", (t, e) => seal(t, e, 2, ICON.send, "SEND", "#38BDF8", "third"));
beat("comment", (t, e) => {
  const id = uid("cm"), tt = wAt("received", t);
  glass(id, 1010, `<div class="row"><div class="cbub"><span class="dots" id="${id}d">• • •</span><span class="num gold" id="${id}w" style="font-size:110px;opacity:0">received</span></div></div><div class="sub2" style="text-align:center">comment this word</div>`, "rgba(251,191,36,.6)", "text-align:center");
  pop(id, t, e - 0.05);
  tw += `tl.to("#${id}d",{opacity:0,duration:0.1},${T(tt - 0.05)});tl.fromTo("#${id}w",{opacity:0,scale:0.6},{opacity:1,scale:1,duration:0.45,ease:"back.out(2.5)",immediateRender:false},${T(tt)});\n`;
  sfx("sting", tt);
});
beat("so i know", (t, e) => {
  const id = uid("all");
  glass(id, 1000, `<div class="seals">${[0, 1, 2].map((i) => `<div class="sl on" id="${id}s${i}">${ICON.check}</div>`).join("")}</div><div class="num green" style="font-size:120px;text-align:center">3/3</div><div class="sub2" style="text-align:center">all seals complete</div>`, "rgba(52,211,153,.5)", "text-align:center");
  pop(id, t, e - 0.05);
  [0, 1, 2].forEach((i) => { tw += `tl.fromTo("#${id}s${i}",{scale:0},{scale:1,duration:0.35,ease:"back.out(3)",immediateRender:false},${T(t + 0.3 + i * 0.2)});tl.fromTo("#${id}s${i} .ck",{strokeDashoffset:1},{strokeDashoffset:0,duration:0.3,immediateRender:false},${T(t + 0.45 + i * 0.2)});\n`; sfx("bell" + (i + 1), t + 0.3 + i * 0.2); });
});
beat("tomorrow", (t, e) => {
  const id = uid("lock");
  split(t, e, `<div class="lockscr"><div class="num" style="font-size:210px;color:#fff;text-shadow:0 0 40px rgba(255,255,255,.5)">7:00</div><div class="sub2" style="text-align:center;font-size:36px">tomorrow morning</div><div class="nt" id="${id}n"><div class="ic sm">${ICON.bell}</div><div><div class="nh">GOOD NEWS</div><div class="nb">You're going to receive good news ✨</div></div></div></div>`, "rgba(255,255,255,.35)");
  const tn = wAt("good", t);
  tw += `tl.fromTo("#${id}n",{y:-60,opacity:0,scale:0.9},{y:0,opacity:1,scale:1,duration:0.45,ease:"back.out(2)",immediateRender:false},${T(tn - 0.2)});\n`; sfx("bell2", tn - 0.2);
});
beat("now pay attention", (t, e) => focus(t, e));
beat("tap my profile", (t, e) => {
  const id = uid("prof"), tt = wAt("tap", t);
  split(t, e, `<div class="pf"><div class="ring" id="${id}r"></div><div class="pic"><svg viewBox="0 0 64 64"><circle cx="32" cy="24" r="12" fill="#e9e3ff"/><path d="M8 60C10 42 54 42 56 60Z" fill="#e9e3ff"/></svg></div><div class="tap" id="${id}t"></div></div><div class="ttl" style="text-align:center">TAP MY PROFILE PICTURE</div><div class="part"><span class="sub2">part</span> <span class="num grad-violet" style="font-size:150px" id="${id}2">2</span> <span class="sub2">is in my stories</span></div>`, "rgba(244,114,182,.5)");
  tw += `tl.fromTo("#${id}r",{rotation:0},{rotation:360,duration:${T(e - t)},ease:"none"},${T(t)});tl.fromTo("#${id}t",{scale:0.3,opacity:0.9},{scale:2.2,opacity:0,duration:0.7,repeat:2,ease:"power2.out",immediateRender:false},${T(tt)});tl.fromTo("#${id}2",{scale:0,opacity:0},{scale:1,opacity:1,duration:0.5,ease:"back.out(2.5)",immediateRender:false},${T(wAt("second", t))});\n`;
  sfx("pop", tt); sfx("sting", wAt("second", t));
});

// split screen: face shrinks into a glowing card at the bottom, graphic fills the top
function split(t, e, inner, glow) {
  const id = uid("split");
  html += `<div id="${id}" class="splitTop" style="--glow:${glow}">${inner}</div>\n`;
  tw += `tl.fromTo("#face",{scale:1,y:0,borderRadius:0},{scale:0.62,y:520,borderRadius:70,duration:0.5,ease:"power3.inOut",immediateRender:false},${T(t)});tl.fromTo("#faceglow",{opacity:0},{opacity:1,duration:0.4,immediateRender:false},${T(t + 0.2)});\n`;
  tw += `tl.fromTo("#${id}",{opacity:0,y:-40,scale:0.94},{opacity:1,y:0,scale:1,duration:0.5,ease:"power3.out",immediateRender:false},${T(t + 0.15)});\n`;
  tw += `tl.to("#${id}",{opacity:0,y:-30,duration:0.3,ease:"power2.in"},${T(e - 0.35)});tl.to("#face",{scale:1,y:0,borderRadius:0,duration:0.45,ease:"power3.inOut"},${T(e - 0.4)});tl.to("#faceglow",{opacity:0,duration:0.3},${T(e - 0.4)});\n`;
  sfx("whoosh", t + 0.1); sfx("whoosh", e - 0.3);
}
function focus(t, e) {
  const id = uid("foc");
  html += `<div id="${id}" class="focus">${["tl", "tr", "bl", "br"].map((c) => `<i class="${c}"></i>`).join("")}<div class="flabel">PAY ATTENTION</div></div>\n`;
  tw += `tl.fromTo("#${id}",{opacity:0,scale:1.25},{opacity:1,scale:1,duration:0.35,ease:"power3.out",immediateRender:false},${T(t)});tl.to("#${id}",{opacity:0,duration:0.25},${T(e - 0.25)});tl.fromTo("#push",{scale:1},{scale:1.12,duration:0.5,ease:"power2.out",immediateRender:false},${T(t)});tl.to("#push",{scale:1,duration:0.4,ease:"power2.inOut"},${T(e - 0.4)});\n`;
  sfx("hit", t);
}
function notif(t, e, icon, app, msg, glow) {
  const id = uid("nt");
  html += `<div id="${id}" class="notif" style="--glow:${glow}"><div class="ic sm">${icon}</div><div style="flex:1"><div class="nh">${app} <span style="opacity:.5;font-weight:600">· now</span></div><div class="nb">${msg}</div></div></div>\n`;
  tw += `tl.fromTo("#${id}",{y:-240,opacity:0},{y:0,opacity:1,duration:0.5,ease:"back.out(1.5)",immediateRender:false},${T(t)});tl.to("#${id}",{y:-240,opacity:0,duration:0.3,ease:"power2.in"},${T(e - 0.3)});\n`;
  sfx("bell2", t + 0.1);
}
function seal(t, e, k, icon, name, col, ord) {
  const id = uid("seal"), tt = wAt(ord, t);
  glass(id, 1000, `<div class="row" style="gap:36px"><div class="bigic" id="${id}i" style="--c:${col}">${icon}</div><div style="flex:1"><div class="sub2">${["1ST", "2ND", "3RD"][k]} SEAL</div><div class="ttl" style="font-size:64px">${name}</div><div class="pips">${[0, 1, 2].map((i) => `<span class="pip${i < k ? " on" : ""}" id="${id}p${i}"></span>`).join("")}</div></div>
<div class="ringbox"><svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,.12)" stroke-width="12"/><circle id="${id}r" cx="60" cy="60" r="50" fill="none" stroke="${col}" stroke-width="12" stroke-linecap="round" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="${1 - k / 3}" transform="rotate(-90 60 60)" style="filter:drop-shadow(0 0 8px ${col})"/></svg><div class="rn" style="color:${col}">${k + 1}<small>/3</small></div></div></div>`, col + "88");
  pop(id, t, e - 0.05);
  tw += `tl.fromTo("#${id}i",{scale:0.4,rotation:-12},{scale:1,rotation:0,duration:0.5,ease:"back.out(3)",immediateRender:false},${T(t + 0.25)});tl.fromTo("#${id}r",{strokeDashoffset:${1 - k / 3}},{strokeDashoffset:${1 - (k + 1) / 3},duration:0.6,ease:"power2.out",immediateRender:false},${T(tt)});tl.fromTo("#${id}p${k}",{scale:0.5},{scale:1,backgroundColor:"${col}",duration:0.3,ease:"back.out(3)",immediateRender:false},${T(tt)});\n`;
  sfx("bell" + (k + 1), tt);
}

// resolve beat windows and build
let after = 0;
const ts = B.map((b) => { const t = at(b.phrase, after) - 0.1; after = t + 0.2; return +t.toFixed(3); });
B.forEach((b, i) => b.fn(ts[i], i < B.length - 1 ? ts[i + 1] : TOTAL));

// ---------- captions (2-4 words, white outlined, keyword gold) ----------
const groups = []; let g = [];
words.forEach((w, i) => { g.push(w); const nx = words[i + 1]; if (/[.,?!]$/.test(w.text) || g.length >= 4 || !nx || nx.start - w.end > 0.25) { groups.push(g); g = []; } });
const caps = groups.map((gr, i) => {
  const st = gr[0].start - 0.04, nx = groups[i + 1] ? groups[i + 1][0].start - 0.04 : TOTAL, en = Math.min(nx, gr.at(-1).end + 0.5);
  const txt = gr.map((w) => { const d = w.text.replace(/^St\.$/, "Saint").replace(/&/g, "&amp;"); return norm(w.text) === "received" ? `<span class="gold">${d}</span>` : d; }).join(" ");
  return { id: `c${i}`, st: +st.toFixed(3), dur: +(en - st).toFixed(3), txt };
});
fs.mkdirSync(path.join(P, "compositions"), { recursive: true }); fs.mkdirSync(path.join(P, "assets"), { recursive: true });
fs.writeFileSync(path.join(P, "compositions", "caps.html"), `<template>
<style>#root{position:absolute;inset:0;} .cg{position:absolute;left:0;top:1440px;width:1080px;padding:0 70px;text-align:center;}
.cg span.in{display:inline-block;font-family:Montserrat;font-weight:800;font-size:62px;line-height:1.15;color:#fff;text-shadow:-3px -3px 0 #000,3px -3px 0 #000,-3px 3px 0 #000,3px 3px 0 #000,0 -3px 0 #000,0 3px 0 #000,-3px 0 0 #000,3px 0 0 #000,0 4px 14px rgba(0,0,0,.6);} .gold{color:#FBBF24;}</style>
<div id="root" data-composition-id="caps" data-width="1080" data-height="1920">
${caps.map((c) => `<div id="${c.id}" class="clip cg" data-start="${c.st}" data-duration="${c.dur}"><span class="in" id="${c.id}-t">${c.txt}</span></div>`).join("\n")}
</div><script>const tl = gsap.timeline({ paused: true });
${caps.map((c) => `tl.fromTo("#${c.id}-t",{opacity:0,scale:0.92},{opacity:1,scale:1,duration:0.12,ease:"back.out(2)"},${c.st});`).join("\n")}
tl.set({}, {}, ${TOTAL}); window.__timelines["caps"] = tl;</script></template>`);

// ---------- audio ----------
fs.copyFileSync(HOOK, path.join(P, "assets", "hook.mp4")); fs.copyFileSync(BODY, path.join(P, "assets", "body.mp4"));
ff(["-hide_banner", "-y", "-i", BODY, "-vn", "-ac", "1", "-ar", "48000", path.join(P, "assets", "voice.wav")]);
const getI = (txt) => { const m = txt.match(/"input_i"\s*:\s*"(-?[\d.]+)"/); return m ? +m[1] : null; };
const voI = getI(ff(["-hide_banner", "-i", path.join(P, "assets", "voice.wav"), "-af", "loudnorm=print_format=json", "-f", "null", "-"]));
const muI = getI(ff(["-hide_banner", "-t", String(TOTAL + 1), "-i", MUSIC, "-af", "loudnorm=print_format=json", "-f", "null", "-"]));
const mlen = ffp(MUSIC), loops = Math.max(0, Math.ceil((TOTAL + 1) / mlen) - 1);
ff(["-hide_banner", "-y", "-stream_loop", String(loops), "-i", MUSIC, "-t", String(TOTAL + 0.5), "-af", `volume=${(voI - 17 - muI).toFixed(2)}dB,volume=eval=frame:volume='1+1.5*(1-min(1\\,max(0\\,(t-${H - 0.3})/0.5)))',afade=t=out:st=${(TOTAL - 2.5).toFixed(2)}:d=2.5`, "-ar", "48000", "-ac", "2", path.join(P, "assets", "music.wav")]);
hcuts.filter((t) => t < H).forEach((t) => cues.push({ kind: "whoosh", t })); cues.push({ kind: "hit", t: H });
const KIT = { whoosh: [0.265, -16.2, -11], riser: [2.389, -6.0, -15], hit: [0.0, -12.8, -10], tick: [0.002, -17.4, -14], pop: [0.0, -19.1, -11],
  bell1: [0.0, -13.1, -12], bell2: [0.0, -10.6, -12], bell3: [0.0, -10.0, -12], sting: [0.139, -10.1, -10] };
cues.sort((a, b) => a.t - b.t);
const lastT = {}, kept = [];
for (const c of cues) { if (lastT[c.kind] != null && c.t - lastT[c.kind] < 0.3) continue; if ((c.kind === "tick" || c.kind === "pop") && kept.some((k) => Math.abs(k.t - c.t) < 0.15)) continue; lastT[c.kind] = c.t; kept.push(c); }
const audio = kept.map((c, i) => { const [pk, mm, rel] = KIT[c.kind]; fs.copyFileSync(LK + c.kind + ".wav", path.join(P, "assets", "k_" + c.kind + ".wav")); return `<audio id="fx${i}" class="clip" src="assets/k_${c.kind}.wav" data-start="${Math.max(0, c.t - pk).toFixed(3)}" data-duration="2.4" data-track-index="${7 + (i % 4)}" data-volume="${Math.min(1, Math.pow(10, (voI + rel - mm) / 20)).toFixed(3)}"></audio>`; });

// jump-cut punch-ins
const CUTS = offs.slice(1).map((c) => H + c);
CUTS.forEach((c, i) => { tw += `tl.set("#zoom",{scale:${i % 2 ? 1 : 1.08}},${T(c)});\n`; });
tw += `tl.fromTo("#flash",{opacity:0.0},{opacity:0.7,duration:0.06,immediateRender:false},${T(H - 0.04)});tl.to("#flash",{opacity:0,duration:0.4},${T(H + 0.02)});\n`;

const css = `*{margin:0;padding:0;box-sizing:border-box;}
html,body{width:1080px;height:1920px;overflow:hidden;background:#07060c;}
#bgfx{position:absolute;inset:0;background:radial-gradient(60% 40% at 30% 20%,rgba(124,58,237,.45),transparent 70%),radial-gradient(50% 35% at 75% 35%,rgba(236,72,153,.32),transparent 70%),radial-gradient(70% 50% at 50% 90%,rgba(14,165,233,.22),transparent 70%),#07060c;}
#stage{position:absolute;inset:0;}
#push{position:absolute;inset:0;transform-origin:540px 620px;}
#face{position:absolute;inset:0;overflow:hidden;transform-origin:540px 600px;}
#zoom{position:absolute;inset:0;transform-origin:540px 620px;}
#zoom video,#hook{position:absolute;left:0;top:0;width:1080px;height:1920px;object-fit:cover;}
#faceglow{position:absolute;left:205px;top:748px;width:670px;height:1190px;border-radius:44px;opacity:0;box-shadow:0 0 0 3px rgba(255,255,255,.35),0 0 60px rgba(167,139,250,.6),0 0 140px rgba(236,72,153,.35);pointer-events:none;}
#vig{position:absolute;inset:0;background:radial-gradient(ellipse 75% 60% at 50% 45%,transparent 55%,rgba(0,0,0,.55));pointer-events:none;}
#flash{position:absolute;inset:0;background:#fff;opacity:0;}
#redflash{position:absolute;inset:0;background:radial-gradient(ellipse at center,transparent 30%,rgba(244,63,94,.9));opacity:0;}
.card{position:absolute;left:90px;width:900px;padding:34px 44px;border-radius:44px;background:linear-gradient(160deg,rgba(38,34,58,.80),rgba(12,12,22,.74));border:1.5px solid rgba(255,255,255,.18);box-shadow:0 24px 70px rgba(0,0,0,.55),0 0 50px var(--glow),inset 0 1px 0 rgba(255,255,255,.18);backdrop-filter:blur(18px);color:#fff;font-family:Montserrat;opacity:0;}
.row{display:flex;align-items:center;gap:30px;}
.ic{width:120px;height:120px;flex:none;filter:drop-shadow(0 0 16px rgba(255,255,255,.25));} .ic.sm{width:84px;height:84px;} .ic svg,.bigic svg,.sl svg,.pic svg{width:100%;height:100%;}
.ttl{font-weight:900;font-size:56px;letter-spacing:.01em;line-height:1.05;} .ttl.sm{font-size:40px;letter-spacing:.14em;opacity:.85;margin-bottom:14px;text-align:center;}
.sub2{font-weight:600;font-size:34px;color:rgba(255,255,255,.72);margin-top:6px;}
.lbl{font-weight:800;font-size:34px;letter-spacing:.3em;color:rgba(255,255,255,.7);width:100%;text-align:center;}
.sub{font-weight:800;font-size:40px;letter-spacing:.42em;text-align:center;color:rgba(255,255,255,.8);margin-top:-6px;}
.dates{display:flex;justify-content:center;align-items:center;gap:30px;} .amp{font-size:80px;font-weight:800;color:rgba(255,255,255,.5);}
.num{font-family:Montserrat;font-weight:900;font-size:200px;line-height:1;letter-spacing:-.02em;}
.gold{background:linear-gradient(180deg,#FFF1B8 0%,#FBBF24 45%,#F97316 100%);-webkit-background-clip:text;background-clip:text;color:transparent;filter:drop-shadow(0 0 22px rgba(251,146,60,.75));}
.green{background:linear-gradient(180deg,#D1FAE5,#34D399 50%,#059669);-webkit-background-clip:text;background-clip:text;color:transparent;filter:drop-shadow(0 0 22px rgba(52,211,153,.7));}
.green-t{color:#6EE7B7;text-shadow:0 0 24px rgba(52,211,153,.7);}
.grad-sun{background:linear-gradient(180deg,#FFFBEB,#FCD34D 40%,#F59E0B 70%,#EA580C);-webkit-background-clip:text;background-clip:text;color:transparent;filter:drop-shadow(0 0 26px rgba(251,191,36,.75));}
.grad-violet{background:linear-gradient(180deg,#FCE7F3,#F472B6 45%,#8B5CF6);-webkit-background-clip:text;background-clip:text;color:transparent;filter:drop-shadow(0 0 26px rgba(236,72,153,.75));}
.person{position:relative;display:flex;align-items:center;gap:24px;padding:14px 10px;} .av{width:74px;height:74px;border-radius:50%;flex:none;box-shadow:0 0 18px rgba(255,255,255,.2);}
.pn{font-weight:800;font-size:44px;flex:1;} .x{width:70px;height:70px;border-radius:50%;background:#F43F5E;display:flex;align-items:center;justify-content:center;font-size:40px;font-weight:900;box-shadow:0 0 24px #F43F5E;opacity:0;}
.strike{position:absolute;left:110px;right:100px;top:50%;height:6px;border-radius:3px;background:#F43F5E;transform-origin:left center;transform:scaleX(0);box-shadow:0 0 12px #F43F5E;}
.splitTop{position:absolute;left:60px;top:70px;width:960px;height:660px;border-radius:52px;background:linear-gradient(160deg,rgba(30,26,48,.82),rgba(10,10,20,.78));border:1.5px solid rgba(255,255,255,.16);box-shadow:0 0 60px var(--glow),inset 0 1px 0 rgba(255,255,255,.18);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;overflow:hidden;opacity:0;color:#fff;font-family:Montserrat;text-align:center;}
.bigword{position:relative;z-index:2;}
.sun{position:absolute;left:50%;top:50%;width:900px;height:900px;margin:-450px;background:repeating-conic-gradient(rgba(251,191,36,.18) 0 6deg,transparent 6deg 18deg);-webkit-mask-image:radial-gradient(circle,#000 10%,transparent 60%);}
.chartbox{width:840px;}
.orb{position:absolute;left:50%;top:50%;width:760px;height:760px;margin:-380px;background:repeating-conic-gradient(rgba(251,191,36,.22) 0 5deg,transparent 5deg 15deg);-webkit-mask-image:radial-gradient(circle,#000 5%,transparent 62%);}
.bar{width:700px;height:22px;border-radius:11px;background:rgba(255,255,255,.12);margin:18px auto 0;overflow:hidden;} .fill{height:100%;width:100%;background:linear-gradient(90deg,#F59E0B,#FDE68A);transform-origin:left;box-shadow:0 0 20px #FBBF24;}
.halo{position:absolute;left:50%;top:-60px;width:380px;height:380px;margin-left:-190px;border-radius:50%;background:repeating-conic-gradient(rgba(251,191,36,.22) 0 8deg,transparent 8deg 20deg);-webkit-mask-image:radial-gradient(circle,#000 20%,transparent 65%);z-index:-1;}
.banner{position:absolute;left:60px;top:90px;width:960px;display:flex;gap:26px;align-items:center;padding:28px 40px;border-radius:36px;background:linear-gradient(90deg,rgba(127,29,29,.9),rgba(60,10,20,.85));border:2px solid rgba(254,202,202,.4);box-shadow:0 0 60px var(--glow);font-family:Montserrat;color:#fff;opacity:0;}
.bt{font-weight:900;font-size:64px;letter-spacing:.12em;} .bs{font-weight:600;font-size:32px;opacity:.8;}
.skipbtn{position:relative;padding:22px 34px;border-radius:24px;background:rgba(255,255,255,.12);border:2px solid rgba(255,255,255,.3);font-weight:900;font-size:44px;letter-spacing:.08em;}
.slash{position:absolute;left:-10px;right:-10px;top:50%;height:8px;margin-top:-4px;background:#F43F5E;transform:rotate(-14deg) scaleX(0);transform-origin:left center;box-shadow:0 0 18px #F43F5E;border-radius:4px;}
.notif{position:absolute;left:60px;top:90px;width:960px;display:flex;gap:26px;align-items:center;padding:28px 36px;border-radius:40px;background:rgba(245,245,250,.16);border:1.5px solid rgba(255,255,255,.3);backdrop-filter:blur(24px);box-shadow:0 0 60px var(--glow),0 20px 60px rgba(0,0,0,.5);font-family:Montserrat;color:#fff;opacity:0;}
.nh{font-weight:900;font-size:34px;letter-spacing:.06em;} .nb{font-weight:600;font-size:38px;margin-top:4px;}
.bigic{width:170px;height:170px;flex:none;filter:drop-shadow(0 0 26px var(--c));}
.pips{display:flex;gap:12px;margin-top:16px;} .pip{width:56px;height:12px;border-radius:6px;background:rgba(255,255,255,.18);display:block;} .pip.on{background:#fff;}
.ringbox{position:relative;width:170px;height:170px;flex:none;} .ringbox svg{width:100%;height:100%;} .rn{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:64px;} .rn small{font-size:30px;opacity:.7;}
.cbub{position:relative;margin:0 auto;padding:10px 60px;border-radius:60px;background:rgba(255,255,255,.08);border:2px solid rgba(255,255,255,.25);min-width:640px;min-height:160px;display:flex;align-items:center;justify-content:center;}
.dots{position:absolute;font-size:70px;font-weight:900;letter-spacing:.1em;color:rgba(255,255,255,.7);}
.seals{display:flex;justify-content:center;gap:40px;margin-bottom:10px;} .sl{width:120px;height:120px;filter:drop-shadow(0 0 18px rgba(52,211,153,.7));}
.lockscr{display:flex;flex-direction:column;align-items:center;} .nt{display:flex;gap:22px;align-items:center;margin-top:24px;padding:22px 30px;border-radius:32px;background:rgba(255,255,255,.14);border:1.5px solid rgba(255,255,255,.28);width:820px;text-align:left;opacity:0;}
.pf{position:relative;width:300px;height:300px;margin-bottom:10px;} .ring{position:absolute;inset:0;border-radius:50%;background:conic-gradient(#F59E0B,#EC4899,#8B5CF6,#F59E0B);box-shadow:0 0 50px rgba(236,72,153,.6);}
.pic{position:absolute;inset:14px;border-radius:50%;background:#1b1530;border:8px solid #0b0a12;overflow:hidden;padding:30px;} .tap{position:absolute;right:10px;bottom:20px;width:90px;height:90px;border-radius:50%;border:5px solid #fff;opacity:0;}
.part{display:flex;align-items:center;gap:20px;margin-top:-10px;}
.focus{position:absolute;left:170px;top:160px;width:740px;height:900px;opacity:0;pointer-events:none;}
.focus i{position:absolute;width:120px;height:120px;border:8px solid #fff;filter:drop-shadow(0 0 14px rgba(255,255,255,.8));} .focus .tl{left:0;top:0;border-right:0;border-bottom:0;border-radius:30px 0 0 0;} .focus .tr{right:0;top:0;border-left:0;border-bottom:0;border-radius:0 30px 0 0;} .focus .bl{left:0;bottom:0;border-right:0;border-top:0;border-radius:0 0 0 30px;} .focus .br{right:0;bottom:0;border-left:0;border-top:0;border-radius:0 0 30px 0;}
.flabel{position:absolute;left:50%;top:-110px;transform:translateX(-50%);padding:14px 30px;border-radius:40px;background:#F43F5E;font-family:Montserrat;font-weight:900;font-size:38px;letter-spacing:.12em;color:#fff;white-space:nowrap;box-shadow:0 0 30px #F43F5E;}`;
const defs = `<svg width="0" height="0" style="position:absolute"><defs>
<linearGradient id="gGold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FEF3C7"/><stop offset=".5" stop-color="#FBBF24"/><stop offset="1" stop-color="#F97316"/></linearGradient>
<linearGradient id="gViolet" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F0ABFC"/><stop offset="1" stop-color="#7C3AED"/></linearGradient>
<linearGradient id="gRed" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FDA4AF"/><stop offset="1" stop-color="#E11D48"/></linearGradient>
<linearGradient id="gGreen" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#A7F3D0"/><stop offset="1" stop-color="#10B981"/></linearGradient>
<linearGradient id="gCyan" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#A5F3FC"/><stop offset="1" stop-color="#0EA5E9"/></linearGradient></defs></svg>`;
fs.writeFileSync(path.join(P, "index.html"), `<!doctype html>
<html lang="en"><head><meta charset="UTF-8" /><meta name="viewport" content="width=1080, height=1920" />
<script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js"></script>
<style>${css}</style></head><body>
<div id="root" data-composition-id="main" data-start="0" data-duration="${TOTAL}" data-width="1080" data-height="1920">
${defs}
<div id="bgfx"></div>
<div id="stage"><div id="push"><div id="face"><div id="zoom"><video id="body" class="clip" src="assets/body.mp4" data-start="${H}" data-duration="${T(TOTAL - H)}" data-media-start="0" data-track-index="1" muted playsinline></video></div></div><div id="faceglow"></div></div>
<div id="vig"></div>
${html}
</div>
<video id="hook" class="clip" src="assets/hook.mp4" data-start="0" data-duration="${H}" data-track-index="0" muted playsinline></video>
<div id="redflash"></div><div id="flash"></div>
<div id="caps" data-composition-id="caps" data-composition-src="compositions/caps.html" data-start="0" data-duration="${TOTAL}" data-track-index="3" data-track-kind="captions" data-width="1080" data-height="1920" style="z-index:50"></div>
<audio id="vo" class="clip" src="assets/voice.wav" data-start="${H}" data-track-index="4" data-volume="1"></audio>
<audio id="bgm" class="clip" src="assets/music.wav" data-start="0" data-duration="${TOTAL}" data-track-index="5" data-volume="1"></audio>
${audio.join("\n")}
</div>
<script>
const tl = gsap.timeline({ paused: true });
${tw}tl.set({}, {}, ${TOTAL});
window.__timelines["main"] = tl;
</script></body></html>`);
console.log(`${hk}+${bk}: hook ${H}s, cut ${(rawLen - acc).toFixed(1)}s silence, total ${TOTAL}s, beats ${B.length}, sfx ${kept.length}`);
console.log(B.map((b, i) => `${ts[i].toFixed(1)} ${b.phrase}`).join(" | "));

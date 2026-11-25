// Viral motion-design edit v2: hard-cut talking head (vad.py, no breaths) + glass pop-up cards, glowing gradient numbers, split screen.
// usage: node tools/viral2.mjs <hook.mp4> <body.mp4> <AvatarName> <transcriptSlug> [--render]
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const [HOOK, RAW, NAME, SLUG] = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const RENDER = process.argv.includes("--render");
const STUDIO = "M:/Google/hyperframes/Midnight-Studio", SRC = STUDIO + "/auraly-batch/src", P = `${STUDIO}/auraly-viral/${SLUG}`;
const OUTDIR = "M:/Google/hyperframes/VIDEOS EDITADOS";
const MUSIC = "C:/Users/Vinicius/Music/Songs Auraly UGC/MORNING LIGHTT.MP3";
const LK = STUDIO + "/auraly-lineart/sfx/kit/";
for (const f of [HOOK, RAW]) if (!fs.existsSync(f)) throw new Error("missing " + f);
const env = { ...process.env, PATH: "M:/CLAUDE/tools/ffmpeg/bin;" + process.env.PATH };
for (const k of ["HYPERFRAMES_EXTRACT_CACHE_DIR", "TMPDIR", "TEMP", "TMP"]) env[k] = "M:/CLAUDE/tools/hf-frames";
const ff = (args) => { const r = spawnSync("ffmpeg", args, { encoding: "utf8", env }); return (r.stderr || "") + (r.stdout || ""); };
const ffp = (f) => +spawnSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f], { encoding: "utf8", env }).stdout.trim();
fs.mkdirSync(path.join(P, "assets"), { recursive: true });

// hook: up to its last shot change between 1.5 and 4 s, else 2.5 s
const hcuts = (ff(["-hide_banner", "-i", HOOK, "-vf", "select='gt(scene,0.25)',showinfo", "-f", "null", "-"]).match(/pts_time:[\d.]+/g) || []).map((s) => +s.slice(9));
const H = +(hcuts.filter((t) => t > 1.5 && t < 4).at(-1) ?? Math.min(4, ffp(HOOK))).toFixed(3); // single-shot hooks with on-screen text need time to be read

// ---------- hard jump cuts from the sound (tools/vad.py): no breaths, word endings protected ----------
const VADWAV = `${SRC}/${SLUG}.wav`;
if (!fs.existsSync(VADWAV)) ff(["-hide_banner", "-y", "-i", RAW, "-ac", "1", "-ar", "16000", VADWAV]);
// edits.json: {"drop": [[a, b]] raw seconds of AI glitches (repeated sentence, garbled false start), "add": [missed caption words]}
const EDP = `${SRC}/t_${SLUG}/edits.json`, ED = fs.existsSync(EDP) ? JSON.parse(fs.readFileSync(EDP, "utf8")) : {};
const vr = spawnSync("M:/CLAUDE/tools/kokoro-venv/Scripts/python.exe", ["-I", STUDIO + "/auraly-lineart/tools/vad.py", VADWAV, `${SRC}/t_${SLUG}/transcript.json`, ...(fs.existsSync(EDP) ? [EDP] : [])], { encoding: "utf8" });
if (vr.status !== 0) throw new Error("vad.py failed: " + vr.stderr);
const rawLen = ffp(RAW), keep = JSON.parse(vr.stdout).map(([a, b]) => [a, Math.min(b, rawLen)]).filter(([a, b]) => b - a > 0.04);
const offs = []; let acc = 0; for (const [a, b] of keep) { offs.push(acc); acc += b - a; }
const mapT = (t) => { for (let i = keep.length - 1; i >= 0; i--) if (t >= keep[i][0]) return offs[i] + Math.min(t, keep[i][1]) - keep[i][0]; return 0; };
const BODY = path.join(P, "assets", "body.mp4");
{ const fc = keep.map(([a, b], i) => `[0:v]trim=${a.toFixed(3)}:${b.toFixed(3)},setpts=PTS-STARTPTS[v${i}];[0:a]atrim=${a.toFixed(3)}:${b.toFixed(3)},asetpts=PTS-STARTPTS,afade=t=in:d=0.01,afade=t=out:st=${(b - a - 0.012).toFixed(3)}:d=0.012[a${i}];`).join("") + keep.map((_, i) => `[v${i}][a${i}]`).join("") + `concat=n=${keep.length}:v=1:a=1[v][a]`;
  ff(["-hide_banner", "-y", "-i", RAW, "-filter_complex", fc, "-map", "[v]", "-map", "[a]", "-c:v", "h264_nvenc", "-preset", "p5", "-rc", "vbr", "-cq", "19", "-b:v", "0", "-c:a", "aac", "-b:a", "192k", BODY]); }
const dropped = (w) => (ED.drop || []).some(([a, b]) => (w.start + w.end) / 2 > a && (w.start + w.end) / 2 < b);
const words = [...JSON.parse(fs.readFileSync(`${SRC}/t_${SLUG}/transcript.json`)), ...(ED.add || [])].filter((w) => !dropped(w)).sort((x, y) => x.start - y.start).map((w) => ({ ...w, start: +(H + mapT(w.start)).toFixed(3), end: +(H + mapT(w.end)).toFixed(3) }));
const TOTAL = +(H + acc).toFixed(3);
const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
const W = words.map((w) => norm(w.text));
// phrase -> time; falls back to its first two words; null = beat skipped (each avatar's transcript differs a little)
const at = (phrase, after = 0) => { for (const p of [phrase.split(" ").map(norm), phrase.split(" ").map(norm).slice(0, 2)]) for (let i = 0; i < W.length; i++) if (words[i].start >= after && p.every((x, j) => W[i + j] === x)) return words[i].start; return null; };
const wAt = (word, from, fb = from + 0.8) => { const i = words.findIndex((w) => w.start >= from - 0.05 && norm(w.text) === norm(word)); return i < 0 ? fb : words[i].start; };

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
  unlock: `<svg viewBox="0 0 64 64"><rect x="12" y="28" width="40" height="30" rx="8" fill="url(#gGold)"/><path d="M20 28v-8a12 12 0 0 1 23-4" fill="none" stroke="url(#gGold)" stroke-width="6"/><circle cx="32" cy="42" r="4" fill="#2a1a08"/></svg>`,
  coin: `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="27" fill="url(#gGold)"/><text x="32" y="43" text-anchor="middle" font-family="Montserrat" font-weight="900" font-size="30" fill="#6b4306">$</text></svg>`,
  chain: `<svg viewBox="0 0 64 64"><g fill="none" stroke="url(#gGold)" stroke-width="6"><rect x="4" y="22" width="26" height="18" rx="9"/><rect x="34" y="22" width="26" height="18" rx="9" transform="rotate(18 47 31)"/></g></svg>`,
  mail: `<svg viewBox="0 0 64 64"><rect x="4" y="12" width="56" height="40" rx="8" fill="url(#gViolet)"/><path d="M6 16L32 36L58 16" fill="none" stroke="#1d1035" stroke-width="4"/></svg>`,
};
const glass = (id, top, inner, glow = "rgba(255,180,80,.35)", extra = "") => { html += `<div id="${id}" class="card" style="top:${top}px;--glow:${glow};${extra}">${inner}</div>\n`; };

// numbered beats (phrase, builder(t, end)) — copy "Keep your mouth shut… Nov 22/23… comment I BELIEVE"
const B = [];
const beat = (phrase, fn) => B.push({ phrase, fn });
const card = (t, e, icon, title, sub, glow, top = 1040, o = {}) => { const id = uid("cd"); glass(id, top, `<div class="row">${icon ? `<div class="ic">${ICON[icon]}</div>` : ""}<div><div class="ttl">${title}</div>${sub ? `<div class="sub2">${sub}</div>` : ""}</div></div>`, glow); pop(id, t, e - 0.05, o); return id; };

beat("keep your mouth", (t, e) => focus(t, Math.min(e, t + 2.2), "KEEP YOUR MOUTH SHUT"));
beat("if this video", (t, e) => {
  const id = uid("date"), tn = wAt("november", t);
  glass(id, 1010, `<div class="row"><div class="lbl">ONLY FOR</div></div><div class="dates"><span class="num gold" id="${id}a">22</span><span class="amp">&amp;</span><span class="num gold" id="${id}b">23</span></div><div class="sub">NOVEMBER</div>`);
  pop(id, tn - 0.1, Math.min(e, tn + 3.2), { snd: "hit" });
  tw += `tl.fromTo("#${id}a,#${id}b",{y:40,opacity:0},{y:0,opacity:1,duration:0.5,stagger:0.12,ease:"back.out(2)",immediateRender:false},${T(tn + 0.1)});\n`;
});
beat("do not tell", (t, e) => card(t, e, "lock", "DON'T TELL ANYONE", "what's about to happen"));
beat("the universe saw", (t, e) => split(t, e, `<div class="bigword"><div class="ic" style="width:200px;height:200px;margin:0 auto 10px">${ICON.eye}</div><div class="ttl" style="font-size:58px">THE UNIVERSE</div><div class="num grad-sun" style="font-size:120px">SAW YOUR FAITH</div></div>`, "rgba(167,139,250,.5)"));
beat("over the next", (t, e) => card(t, e, "up", "AN UNUSUAL SHIFT", "over the next few days", "rgba(52,211,153,.45)"));
beat("there is money", (t, e) => {
  const id = uid("trio"), items = [["coin", "MONEY", "money"], ["up", "PROSPERITY", "prosperity"], ["heart", "SOMEONE WONDERFUL", "someone"]];
  split(t, e, `<div class="ttl sm">ABOUT TO SHOW UP</div>${items.map(([ic, l], i) => `<div class="person" id="${id}${i}" style="opacity:0;justify-content:center"><div class="ic sm">${ICON[ic]}</div><div class="pn">${l}</div></div>`).join("")}`, "rgba(251,191,36,.45)");
  let prev = t; items.forEach(([, , w], i) => { const tt = wAt(w, prev, prev + 0.8); prev = tt; tw += `tl.fromTo("#${id}${i}",{opacity:0,x:-40},{opacity:1,x:0,duration:0.4,ease:"back.out(2)",immediateRender:false},${T(tt)});\n`; sfx("pop", tt); });
});
beat("but if you turn", (t, e) => {
  const id = uid("warn");
  html += `<div id="${id}" class="banner" style="--glow:rgba(244,63,94,.6)"><div class="ic sm">${ICON.warn}</div><div><div class="bt">WARNING</div><div class="bs">don't turn your back on this message</div></div></div>\n`;
  const out = Math.min(e, t + 4);
  tw += `tl.fromTo("#${id}",{y:-260,opacity:0},{y:0,opacity:1,duration:0.45,ease:"back.out(1.6)",immediateRender:false},${T(t)});tl.to("#${id}",{y:-260,opacity:0,duration:0.3,ease:"power2.in"},${T(out - 0.3)});tl.to("#stage",{keyframes:{x:[0,-10,9,-6,4,0]},duration:0.35},${T(t + 0.5)});\n`;
  sfx("hit", t + 0.5);
});
beat("michael the archangel", (t, e) => card(t, e, null, `<span class="grad-sun" style="-webkit-background-clip:text;background-clip:text">SAINT MICHAEL</span>`, "the Archangel has sent a warning", "rgba(251,191,36,.55)", 1010, { snd: "bell3" }));
beat("a phase of", (t, e) => card(t, e, "up", "VICTORY &amp; PROSPERITY", "a new phase is approaching", "rgba(52,211,153,.45)"));
beat("the worst is", (t, e) => card(t, e, "check", "THE WORST IS OVER", "", "rgba(52,211,153,.45)"));
beat("see the chains", (t, e) => card(t, e, "chain", "CHAINS BREAKING", "scarcity is losing its grip", "rgba(251,191,36,.45)", 1040, { snd: "hit" }));
beat("doors that wouldnt", (t, e) => card(t, e, "unlock", "DOORS OPENING", "the ones that wouldn't open", "rgba(251,191,36,.45)"));
beat("in the next seven", (t, e) => {
  const id = uid("seven");
  split(t, e, `<div class="orb" id="${id}o"></div><div class="bigword" style="position:relative"><div class="ttl" style="font-size:44px;letter-spacing:.2em;opacity:.85">IN THE NEXT</div><div class="num grad-sun" style="font-size:230px">7:00</div><div class="ttl" style="font-size:46px">MINUTES OF ABUNDANCE</div></div>`, "rgba(251,191,36,.5)");
  tw += `tl.fromTo("#${id}o",{scale:0.8,rotation:0},{scale:1.15,rotation:120,duration:${T(e - t)},ease:"none"},${T(t)});\n`; sfx("hit", t + 0.6);
});
beat("so send this", (t, e) => notif(t, Math.min(e, t + 3.6), ICON.send, "SEND IT TO YOURSELF", "come back in 7 minutes ✨", "rgba(56,189,248,.5)"));
beat("save this video", (t, e) => seal(t, e, 0, ICON.save, "SAVE", "#FBBF24", "first", 2));
beat("double tap", (t, e) => seal(t, e, 1, ICON.heart, "DOUBLE TAP", "#F43F5E", "second", 2));
beat("comment i believe", (t, e) => {
  const id = uid("cm"), tt = wAt("believe", t, t + 0.6);
  glass(id, 1010, `<div class="row"><div class="cbub"><span class="dots" id="${id}d">• • •</span><span class="num gold" id="${id}w" style="font-size:100px;opacity:0">I BELIEVE</span></div></div><div class="sub2" style="text-align:center">comment this below</div>`, "rgba(251,191,36,.6)", "text-align:center");
  pop(id, t, e - 0.05, { hold: 4.5 });
  tw += `tl.to("#${id}d",{opacity:0,duration:0.1},${T(tt - 0.05)});tl.fromTo("#${id}w",{opacity:0,scale:0.6},{opacity:1,scale:1,duration:0.45,ease:"back.out(2.5)",immediateRender:false},${T(tt)});\n`;
  sfx("sting", tt);
});
beat("if you did", (t, e) => {
  const id = uid("lk"), tn = wAt("good", t, t + 3);
  split(t, e, `<div class="lockscr"><div class="num" style="font-size:210px;color:#fff;text-shadow:0 0 40px rgba(255,255,255,.5)">10:10</div><div class="sub2" style="text-align:center;font-size:36px">tomorrow morning</div><div class="nt" id="${id}n"><div class="ic sm">${ICON.bell}</div><div><div class="nh">GOOD NEWS</div><div class="nb">The start of your new phase ✨</div></div></div></div>`, "rgba(255,255,255,.35)");
  tw += `tl.fromTo("#${id}n",{y:-60,opacity:0,scale:0.9},{y:0,opacity:1,scale:1,duration:0.45,ease:"back.out(2)",immediateRender:false},${T(tn - 0.2)});\n`; sfx("bell2", tn - 0.2);
});
beat("but the universe is", (t, e) => focus(t, Math.min(e, t + 3), "ONLY ALIGNED ENERGY"));
beat("quick free reading", (t, e) => card(t, e, "eye", "A FREE READING", "in my stories — are you one of them?", "rgba(167,139,250,.5)"));
beat("tap my profile", (t, e) => {
  const id = uid("prof"), tt = wAt("tap", t, t + 0.3);
  split(t, e, `<div class="pf"><div class="ring" id="${id}r"></div><div class="pic"><svg viewBox="0 0 64 64"><circle cx="32" cy="24" r="12" fill="#e9e3ff"/><path d="M8 60C10 42 54 42 56 60Z" fill="#e9e3ff"/></svg></div><div class="tap" id="${id}t"></div></div><div class="ttl" style="text-align:center">TAP MY PROFILE PICTURE</div><div class="sub2" style="text-align:center">the sign you've been waiting for is there</div>`, "rgba(244,114,182,.5)");
  tw += `tl.fromTo("#${id}r",{rotation:0},{rotation:360,duration:${T(e - t)},ease:"none"},${T(t)});tl.fromTo("#${id}t",{scale:0.3,opacity:0.9},{scale:2.2,opacity:0,duration:0.7,repeat:2,ease:"power2.out",immediateRender:false},${T(tt)});\n`;
  sfx("pop", tt);
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
function focus(t, e, label = "PAY ATTENTION") {
  const id = uid("foc");
  html += `<div id="${id}" class="focus">${["tl", "tr", "bl", "br"].map((c) => `<i class="${c}"></i>`).join("")}<div class="flabel">${label}</div></div>\n`;
  tw += `tl.fromTo("#${id}",{opacity:0,scale:1.25},{opacity:1,scale:1,duration:0.35,ease:"power3.out",immediateRender:false},${T(t)});tl.to("#${id}",{opacity:0,duration:0.25},${T(e - 0.25)});tl.fromTo("#push",{scale:1},{scale:1.12,duration:0.5,ease:"power2.out",immediateRender:false},${T(t)});tl.to("#push",{scale:1,duration:0.4,ease:"power2.inOut"},${T(e - 0.4)});\n`;
  sfx("hit", t);
}
function notif(t, e, icon, app, msg, glow) {
  const id = uid("nt");
  html += `<div id="${id}" class="notif" style="--glow:${glow}"><div class="ic sm">${icon}</div><div style="flex:1"><div class="nh">${app} <span style="opacity:.5;font-weight:600">· now</span></div><div class="nb">${msg}</div></div></div>\n`;
  tw += `tl.fromTo("#${id}",{y:-240,opacity:0},{y:0,opacity:1,duration:0.5,ease:"back.out(1.5)",immediateRender:false},${T(t)});tl.to("#${id}",{y:-240,opacity:0,duration:0.3,ease:"power2.in"},${T(e - 0.3)});\n`;
  sfx("bell2", t + 0.1);
}
function seal(t, e, k, icon, name, col, ord, total = 3) {
  const id = uid("seal"), tt = wAt(ord, t, t + 1.2);
  glass(id, 1000, `<div class="row" style="gap:36px"><div class="bigic" id="${id}i" style="--c:${col}">${icon}</div><div style="flex:1"><div class="sub2">${["1ST", "2ND", "3RD"][k]} SEAL</div><div class="ttl" style="font-size:64px">${name}</div><div class="pips">${[...Array(total).keys()].map((i) => `<span class="pip${i < k ? " on" : ""}" id="${id}p${i}"></span>`).join("")}</div></div>
<div class="ringbox"><svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,.12)" stroke-width="12"/><circle id="${id}r" cx="60" cy="60" r="50" fill="none" stroke="${col}" stroke-width="12" stroke-linecap="round" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="${1 - k / total}" transform="rotate(-90 60 60)" style="filter:drop-shadow(0 0 8px ${col})"/></svg><div class="rn" style="color:${col}">${k + 1}<small>/${total}</small></div></div></div>`, col + "88");
  pop(id, t, e - 0.05);
  tw += `tl.fromTo("#${id}i",{scale:0.4,rotation:-12},{scale:1,rotation:0,duration:0.5,ease:"back.out(3)",immediateRender:false},${T(t + 0.25)});tl.fromTo("#${id}r",{attr:{"stroke-dashoffset":${1 - k / total}}},{attr:{"stroke-dashoffset":${1 - (k + 1) / total}},duration:0.6,ease:"power2.out",immediateRender:false},${T(tt)});tl.fromTo("#${id}p${k}",{scale:0.5},{scale:1,backgroundColor:"${col}",duration:0.3,ease:"back.out(3)",immediateRender:false},${T(tt)});\n`;
  sfx("bell" + (k + 1), tt);
}

// resolve beat windows and build (beats whose phrase is missing in this avatar's transcript are skipped)
let after = 0;
const ts = B.map((b) => { const t = at(b.phrase, after); if (t == null) return null; after = t + 0.2; return +(Math.max(H + 0.05, t - 0.1)).toFixed(3); });
const live = B.map((b, i) => ({ b, t: ts[i] })).filter((x) => x.t != null);
live.forEach((x, i) => x.b.fn(x.t, i < live.length - 1 ? live[i + 1].t : TOTAL));

// ---------- captions (2-4 words, white outlined, keyword gold) ----------
const groups = []; let g = [];
words.forEach((w, i) => { g.push(w); const nx = words[i + 1]; if (/[.,?!]$/.test(w.text) || g.length >= 4 || !nx || nx.start - w.end > 0.25) { groups.push(g); g = []; } });
const caps = groups.map((gr, i) => {
  const st = gr[0].start - 0.04, nx = groups[i + 1] ? groups[i + 1][0].start - 0.04 : TOTAL, en = Math.min(nx, gr.at(-1).end + 0.5);
  const txt = gr.map((w) => { const d = ({ "1010": "10:10", "bac": "back" }[w.text] ?? w.text).replace(/^St\.$/, "Saint").replace(/&/g, "&amp;"); const k = norm(w.text), j = words.indexOf(w); return (k === "believe" || (k === "i" && W[j + 1] === "believe")) ? `<span class="gold">${d.toUpperCase()}</span>` : d; }).join(" ");
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
fs.copyFileSync(HOOK, path.join(P, "assets", "hook.mp4"));
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
console.log(`${SLUG}: hook ${H}s, cut ${(rawLen - acc).toFixed(1)}s, total ${TOTAL}s, beats ${live.length}/${B.length}, sfx ${kept.length}`);
const skipped = B.filter((b, i) => ts[i] == null).map((b) => b.phrase); if (skipped.length) console.log("skipped beats: " + skipped.join(" | "));
if (RENDER) {
  const out = `${P}-render.mp4`;
  const r = spawnSync("npx", ["hyperframes@0.9.67", "render", "--workers", "5", "--fps", "24", "--crf", "20", "-o", `"${out}"`], { cwd: P, env, encoding: "utf8", shell: true, maxBuffer: 1 << 26 });
  if (r.status !== 0) throw new Error("render failed: " + (r.stderr || r.stdout).slice(-800));
  fs.mkdirSync(OUTDIR, { recursive: true });
  let name = NAME, k = 2; while (fs.existsSync(`${OUTDIR}/${name}.mp4`)) name = `${NAME} ${k++}`;
  ff(["-hide_banner", "-y", "-i", out, "-c:v", "copy", "-af", "loudnorm=I=-15:TP=-1.5:LRA=11", "-ar", "48000", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", `${OUTDIR}/${name}.mp4`]);
  fs.rmSync(out, { force: true }); fs.rmSync(BODY, { force: true }); fs.rmSync(P + "/.hyperframes", { recursive: true, force: true });
  console.log("delivered " + `${OUTDIR}/${name}.mp4`);
}

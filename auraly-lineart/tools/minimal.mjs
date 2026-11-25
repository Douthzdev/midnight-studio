// Minimal headline edit: headline on a black top band for the first ~5 s, then full face; on key beats the screen opens a
// clean panel (one idea + a gold line icon that draws itself) while the face shrinks into a rounded card; sparse stickers
// on spoken keywords; countdowns go full screen at 1 s per number (frozen-frame pads); CTAs act it out (comment bar typing
// the keyword, finger tapping the profile picture with a story ring). One-line kinetic captions, slow camera drift.
// usage: node tools/minimal.mjs <video.mp4> <AvatarName> <slug> <script.json> [--render]
//   script.json: {"head":["LINE","*serif line*"], "accent":[...], "fix":{heard:shown},
//     "beats":[{"at":"phrase","label":"SMALL","big":"Big *word*","sub":"","art":"sparkle","dur":3,"end":"phrase"}
//              | {"at":..,"count":["five",..,"one"],"big":"5,4,3,2,1","label":".."}
//              | {"at":..,"cta":"comment","type":"222","label":".."} | {"at":..,"cta":"stories","label":"..","sub":".."}],
//     "stickers":[{"at":"word","icon":"heart","text":"GIVE IT A HEART","side":"l"}]}
import fs from "node:fs";
import { spawnSync } from "node:child_process";

const [RAW, NAME, SLUG, SCRIPT] = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const RENDER = process.argv.includes("--render");
const STUDIO = "M:/Google/hyperframes/Midnight-Studio", SRC = STUDIO + "/auraly-min/src", P = `${STUDIO}/auraly-min/${SLUG}`;
const OUTDIR = "M:/Google/hyperframes/VIDEOS EDITADOS";
const MUSIC = "C:/Users/Vinicius/Music/Songs Auraly UGC/MORNING LIGHTT.MP3";
const LK = STUDIO + "/auraly-lineart/sfx/kit/";
const S = JSON.parse(fs.readFileSync(SCRIPT, "utf8"));
const env = { ...process.env, PATH: "M:/CLAUDE/tools/ffmpeg/bin;" + process.env.PATH };
for (const k of ["HYPERFRAMES_EXTRACT_CACHE_DIR", "TMPDIR", "TEMP", "TMP"]) env[k] = "M:/CLAUDE/tools/hf-frames";
const ff = (args) => { const r = spawnSync("ffmpeg", args, { encoding: "utf8", env }); return (r.stderr || "") + (r.stdout || ""); };
const ffp = (f) => +spawnSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f], { encoding: "utf8", env }).stdout.trim();
const T = (x) => (+x).toFixed(3);
const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
fs.mkdirSync(P + "/assets", { recursive: true }); fs.mkdirSync(P + "/compositions", { recursive: true });

// ---------- hard cuts (vad.py: no breaths) + edits.json glitch drops + countdown pads ----------
const WAV = `${SRC}/${SLUG}.wav`, TR = `${SRC}/t_${SLUG}/transcript.json`, EDP = `${SRC}/t_${SLUG}/edits.json`;
const ED = fs.existsSync(EDP) ? JSON.parse(fs.readFileSync(EDP, "utf8")) : {};
const vr = spawnSync("M:/CLAUDE/tools/kokoro-venv/Scripts/python.exe", ["-I", STUDIO + "/auraly-lineart/tools/vad.py", WAV, TR, ...(fs.existsSync(EDP) ? [EDP] : [])], { encoding: "utf8" });
if (vr.status !== 0) throw new Error("vad.py failed: " + vr.stderr);
const rawLen = ffp(RAW);
let keep = JSON.parse(vr.stdout).map(([a, b]) => [a, Math.min(b, rawLen), 0]).filter(([a, b]) => b - a > 0.04);
const rawWords = JSON.parse(fs.readFileSync(TR, "utf8")), RW = rawWords.map((w) => norm(w.text));
// countdown: freeze the frame after each count word so every number holds ~1 s (spoken counts are rushed)
for (const b of S.beats.filter((b) => b.count)) {
  const c = b.count.map(norm), i = RW.findIndex((_, k) => c.every((x, j) => RW[k + j] === x)); if (i < 0) continue;
  c.forEach((_, j) => {
    const w = rawWords[i + j], nx = rawWords[i + j + 1], d = j < c.length - 1 ? Math.max(0, 1.0 - (nx.start - w.start)) : 0.5;
    const t = w.end + 0.02, k = keep.findLastIndex(([a]) => a <= t); if (k < 0 || d < 0.05) return;
    const [a, bb, p] = keep[k];
    if (t < bb) keep.splice(k, 1, [a, t, d], [t, bb, p]); else keep[k] = [a, bb, p + d];
  });
}
const offs = []; let acc = 0; for (const [a, b, p] of keep) { offs.push(acc); acc += b - a + p; }
// words inside a cut go to the next kept segment
const mapT = (t) => { for (let i = 0; i < keep.length; i++) { if (t < keep[i][0]) return offs[i]; if (t <= keep[i][1]) return offs[i] + t - keep[i][0]; } return acc; };
const BODY = P + "/assets/body.mp4";
{ const fc = keep.map(([a, b, p], i) => `[0:v]trim=${a.toFixed(3)}:${b.toFixed(3)},setpts=PTS-STARTPTS${p ? `,tpad=stop_mode=clone:stop_duration=${p.toFixed(3)}` : ""}[v${i}];[0:a]atrim=${a.toFixed(3)}:${b.toFixed(3)},asetpts=PTS-STARTPTS,afade=t=in:d=0.01,afade=t=out:st=${(b - a - 0.012).toFixed(3)}:d=0.012${p ? `,apad=pad_dur=${p.toFixed(3)}` : ""}[a${i}];`).join("") + keep.map((_, i) => `[v${i}][a${i}]`).join("") + `concat=n=${keep.length}:v=1:a=1[v][a]`;
  ff(["-hide_banner", "-y", "-i", RAW, "-filter_complex", fc, "-map", "[v]", "-map", "[a]", "-c:v", "h264_nvenc", "-preset", "p5", "-rc", "vbr", "-cq", "19", "-b:v", "0", "-c:a", "aac", "-b:a", "192k", BODY]); }
const dropped = (w) => (ED.drop || []).some(([a, b]) => (w.start + w.end) / 2 > a && (w.start + w.end) / 2 < b);
const words = [...rawWords, ...(ED.add || [])].filter((w) => !dropped(w)).sort((x, y) => x.start - y.start)
  .map((w) => ({ ...w, text: (S.fix || {})[w.text] ?? w.text, start: +mapT(w.start).toFixed(3), end: +mapT(w.end).toFixed(3) }));
const TOTAL = +acc.toFixed(3);
const W = words.map((w) => norm(w.text));
const at = (phrase, after = 0) => { const p = phrase.split(" ").map(norm); for (let i = 0; i < W.length; i++) if (words[i].start >= after && p.every((x, j) => W[i + j] === x)) return i; return -1; };
const ACC = new Set((S.accent || []).map(norm));
const fmt = (s) => s.replace(/&/g, "&amp;").replace(/\*([^*]+)\*/g, '<em>$1</em>');

// profile picture for the stories CTA: square crop of the face
ff(["-hide_banner", "-y", "-ss", "3", "-i", RAW, "-frames:v", "1", "-vf", "crop=iw*0.6:iw*0.6:iw*0.2:ih*0.24,scale=320:320", P + "/assets/pfp.jpg"]);

// ---------- line icons that draw themselves (gold stroke, pathLength=1) ----------
const ART = {
  sparkle: `<path d="M100 18 Q108 92 182 100 Q108 108 100 182 Q92 108 18 100 Q92 92 100 18Z"/><path d="M160 30 Q163 47 178 50 Q163 53 160 70 Q157 53 142 50 Q157 47 160 30Z"/>`,
  hourglass: `<path d="M55 20H145M55 180H145"/><path d="M65 20C65 75 100 85 100 100C100 115 65 125 65 180"/><path d="M135 20C135 75 100 85 100 100C100 115 135 125 135 180"/><path class="fill" d="M78 168Q100 140 122 168Z"/>`,
  eye: `<path d="M15 100Q100 25 185 100Q100 175 15 100Z"/><circle cx="100" cy="100" r="28"/><circle cx="100" cy="100" r="8"/>`,
  stars: `<path d="M30 150L70 90L110 120L150 50L175 95"/>${[[30, 150], [70, 90], [110, 120], [150, 50], [175, 95]].map(([x, y]) => `<circle class="dot" cx="${x}" cy="${y}" r="7"/>`).join("")}`,
  spot: `<path d="M100 20L45 170M100 20L155 170"/><ellipse cx="100" cy="172" rx="56" ry="12"/><circle cx="100" cy="20" r="8"/>`,
  zodiac: `<path d="M30 80a22 22 0 1 0 44 0a22 22 0 1 0 -44 0M52 58Q100 30 150 58"/><path d="M48 120Q100 150 150 122M126 122a22 22 0 1 0 44 0a22 22 0 1 0 -44 0"/>`,
  wings: `<path d="M100 150C70 120 30 120 15 70C45 85 70 80 90 95C80 70 85 45 100 30"/><path d="M100 150C130 120 170 120 185 70C155 85 130 80 110 95C120 70 115 45 100 30"/><circle cx="100" cy="22" r="12"/>`,
  chain: `<g class="l"><rect x="20" y="78" width="90" height="44" rx="22"/></g><g class="r"><rect x="90" y="78" width="90" height="44" rx="22"/></g>`,
  clock: `<circle cx="100" cy="100" r="78"/><path class="hand" d="M100 100V44"/><path d="M100 100L136 120"/>`,
  candle: `<rect x="72" y="90" width="56" height="95" rx="8"/><path d="M100 90V74"/><path d="M100 22C120 45 116 70 100 74C84 70 80 45 100 22Z"/>`,
  heart: `<path d="M100 172C40 130 18 96 30 64C42 32 82 32 100 62C118 32 158 32 170 64C182 96 160 130 100 172Z"/>`,
  wallet: `<rect x="25" y="55" width="150" height="110" rx="16"/><path d="M40 55L140 25L150 55"/><rect x="120" y="92" width="55" height="36" rx="10"/><circle class="dot" cx="138" cy="110" r="7"/>`,
  bill: `<rect x="20" y="55" width="160" height="90" rx="10"/><circle cx="100" cy="100" r="26"/><path d="M100 84V116M90 92Q100 84 110 92M90 108Q100 116 110 108"/><circle class="dot" cx="45" cy="78" r="6"/><circle class="dot" cx="155" cy="122" r="6"/>`,
  cards: `<rect x="22" y="50" width="62" height="100" rx="8"/><rect x="69" y="35" width="62" height="100" rx="8"/><rect x="116" y="50" width="62" height="100" rx="8"/><path d="M100 70L106 82L119 84L109 93L112 106L100 99L88 106L91 93L81 84L94 82Z"/>`,
  doc: `<path d="M50 25H125L155 55V180H50Z"/><path d="M125 25V55H155M70 80H130M70 105H130M70 130H105"/><circle class="fill-c" cx="125" cy="155" r="16"/>`,
  chest: `<path d="M30 95H170V170H30Z"/><path d="M30 95Q30 45 100 45Q170 45 170 95"/><path d="M30 115H170"/><rect x="88" y="105" width="24" height="30" rx="4"/><path d="M60 40L66 28L72 40M128 34L134 22L140 34"/>`,
  karma: `<path d="M150 70A60 60 0 0 0 45 85"/><path d="M50 130A60 60 0 0 0 155 115"/><path d="M45 60V88H73M155 140V112H127"/>`,
};
const artSvg = (k) => `<svg class="art art-${k}" viewBox="0 0 200 200" fill="none" stroke="#F1D29E" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">${ART[k].replace(/<(path|circle|rect|ellipse)(?![^>]*class="(dot|fill)")/g, '<$1 pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="1"')}</svg>`;
const ICO = {
  heart: `<path d="M12 21C5 16 2 12 3 8C4 4 9 3 12 7C15 3 20 4 21 8C22 12 19 16 12 21Z" fill="#FF4D6D"/>`,
  sparkle: `<path d="M12 2Q13 11 22 12Q13 13 12 22Q11 13 2 12Q11 11 12 2Z" fill="#E9B44C"/>`,
  send: `<path d="M2 11L22 3L15 22L11 14Z" fill="#4C8DFF"/><path d="M11 14L22 3" stroke="#fff" stroke-width="1.5"/>`,
  save: `<path d="M5 2H19V22L12 17L5 22Z" fill="#1C1C1E"/>`,
  star: `<path d="M12 2L15 9L22 9.5L16.5 14L18.5 21L12 17L5.5 21L7.5 14L2 9.5L9 9Z" fill="#E9B44C"/>`,
  moon: `<path d="M15 2A10 10 0 1 0 22 15A8 8 0 0 1 15 2Z" fill="#8E7CFF"/>`,
  lock: `<rect x="4" y="10" width="16" height="12" rx="3" fill="#1C1C1E"/><path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="#1C1C1E" stroke-width="2.5" fill="none"/>`,
  chain: `<rect x="1" y="8" width="11" height="8" rx="4" stroke="#1C1C1E" stroke-width="2.5" fill="none"/><rect x="12" y="8" width="11" height="8" rx="4" stroke="#1C1C1E" stroke-width="2.5" fill="none" transform="rotate(20 17 12)"/>`,
  clock: `<circle cx="12" cy="12" r="10" fill="#1C1C1E"/><path d="M12 6V12L16 14" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round"/>`,
  wallet: `<rect x="2" y="6" width="20" height="14" rx="3" fill="#B07A45"/><rect x="14" y="11" width="8" height="5" rx="2" fill="#E9B44C"/>`,
  money: `<rect x="1" y="6" width="22" height="12" rx="2" fill="#5BD08A"/><circle cx="12" cy="12" r="3.5" fill="#1E7A46"/>`,
  eye: `<path d="M1 12Q12 2 23 12Q12 22 1 12Z" fill="#8E7CFF"/><circle cx="12" cy="12" r="4" fill="#fff"/><circle cx="12" cy="12" r="1.8" fill="#2A1F66"/>`,
  doc: `<path d="M5 2H15L20 7V22H5Z" fill="#F1E3C4"/><circle cx="12" cy="16" r="3.5" fill="#C0392B"/>`,
  key: `<circle cx="7" cy="12" r="5" fill="none" stroke="#E9B44C" stroke-width="3"/><path d="M12 12H22M18 12V16M21 12V15" stroke="#E9B44C" stroke-width="3" fill="none"/>`,
  gift: `<rect x="3" y="9" width="18" height="13" rx="2" fill="#FF4D6D"/><rect x="2" y="6" width="20" height="5" rx="1.5" fill="#FF7A90"/><rect x="10.5" y="6" width="3" height="16" fill="#F1D29E"/>`,
  bell: `<path d="M12 2C8 2 6 5 6 9V15L3 18H21L18 15V9C18 5 16 2 12 2Z" fill="#E9B44C"/><circle cx="12" cy="21" r="2.2" fill="#E9B44C"/>`,
  chat: `<path d="M3 4H21V17H10L5 21V17H3Z" fill="#4C8DFF"/>`,
  crowd: `<circle cx="8" cy="8" r="3.5" fill="#9FB4FF"/><circle cx="16" cy="8" r="3.5" fill="#9FB4FF"/><path d="M1 20C1 14 15 14 15 20ZM9 20C9 14 23 14 23 20Z" fill="#9FB4FF"/>`,
  timer: `<circle cx="12" cy="13" r="9" fill="#8E7CFF"/><path d="M12 8V13L15 15" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round"/><rect x="9" y="1" width="6" height="2.5" rx="1" fill="#8E7CFF"/>`,
  people: `<circle cx="8" cy="8" r="3.5" fill="#1C1C1E"/><circle cx="16" cy="8" r="3.5" fill="#1C1C1E"/><path d="M1 20C1 14 15 14 15 20ZM9 20C9 14 23 14 23 20Z" fill="#1C1C1E"/>`,
};
const HAND = `<svg viewBox="0 0 64 64"><path d="M26 6c3 0 5 2 5 5v18l3-1c3-1 5 1 6 2l2-1c3-1 5 1 6 2l2-1c3-1 6 1 6 4v12c0 9-7 16-16 16h-4c-6 0-10-3-13-8L13 41c-2-3-1-6 2-7 2-1 4 0 6 2l1 2V11c0-3 2-5 4-5z" fill="#fff" stroke="#1C1C1E" stroke-width="2.5" stroke-linejoin="round"/></svg>`;

// ---------- layout ----------
const BAND = S.band ?? 430, OPEN = S.open ?? 800, HEADT = S.headDur ?? 5; // band height / face y with panel open / headline seconds
let tw = "", html = ""; const cues = [], hideCaps = [];
const GLOW = S.look === "glow"; // glow look: headline written on over the face (no band), glass pop-ups, karaoke captions
let head;
if (GLOW) {
  // line 1 types on letter by letter, the serif line is written left to right; both glow gold; gone after HEADT
  head = S.head.map((ln) => ln.startsWith("*") ? `<div class="hl ser"><span class="wr">${ln.replace(/\*/g, "")}</span></div>`
    : `<div class="hl">${[...ln].map((c) => c === " " ? " " : `<span class="hc">${c.replace(/&/g, "&amp;")}</span>`).join("")}</div>`).join("");
  tw += `tl.fromTo("#hshade",{opacity:0},{opacity:1,duration:0.5},0);\n`;
  tw += `tl.fromTo(".hc",{opacity:0,y:20,scale:1.6,filter:"blur(10px)"},{opacity:1,y:0,scale:1,filter:"blur(0px)",duration:0.35,stagger:0.045,ease:"back.out(2)"},0.2);\n`;
  const nC = S.head.filter((l) => !l.startsWith("*")).join("").length;
  tw += `tl.fromTo(".wr",{clipPath:"inset(-30% 100% -30% 0)"},{clipPath:"inset(-30% 0% -30% 0)",duration:1.1,ease:"power1.inOut"},${T(0.35 + nC * 0.045)});\n`;
  tw += `tl.fromTo("#rule",{scaleX:0},{scaleX:1,duration:0.9,ease:"expo.inOut"},${T(0.9 + nC * 0.045)});\n`;
  tw += `tl.fromTo("#head",{scale:1},{scale:1.04,duration:${T(HEADT)},ease:"sine.inOut"},0);tl.fromTo(".hl",{textShadow:"0 0 0px rgba(241,210,158,0)"},{textShadow:"0 0 26px rgba(241,210,158,.75)",duration:1.2,yoyo:true,repeat:1,ease:"sine.inOut"},${T(1.6 + nC * 0.045)});\n`;
  tw += `tl.to("#head",{y:-60,opacity:0,filter:"blur(14px)",duration:0.6,ease:"power2.in"},${T(HEADT - 0.5)});tl.to("#hshade",{opacity:0,duration:0.7},${T(HEADT - 0.4)});\n`;
  cues.push({ kind: "pop", t: 0.2 }, { kind: "whoosh", t: HEADT - 0.4 });
} else {
  head = S.head.map((ln) => `<div class="hl${ln.startsWith("*") ? " ser" : ""}">${ln.replace(/\*/g, "").split(" ").map((w) => `<span class="hw">${w.replace(/&/g, "&amp;")}</span>`).join(" ")}</div>`).join("");
  tw += `tl.set("#face",{y:${BAND}},0);tl.set("#topfade",{opacity:1},0);\n`;
  tw += `tl.fromTo(".hw",{y:46,opacity:0,filter:"blur(14px)"},{y:0,opacity:1,filter:"blur(0px)",duration:0.8,stagger:0.07,ease:"expo.out"},0.15);\n`;
  tw += `tl.fromTo("#rule",{scaleX:0},{scaleX:1,duration:1.0,ease:"expo.inOut"},0.55);\n`;
  // headline only at the start: it lifts away and the face rises to full screen
  tw += `tl.to("#head",{y:-80,opacity:0,filter:"blur(12px)",duration:0.6,ease:"power2.in"},${T(HEADT - 0.5)});tl.to("#face",{y:0,duration:0.9,ease:"expo.inOut"},${T(HEADT - 0.3)});tl.to("#topfade",{opacity:0,duration:0.6},${T(HEADT)});\n`;
  cues.push({ kind: "whoosh", t: HEADT - 0.25 });
}

// beats
let after = 0, lastEnd = HEADT + 0.6; const live = [];
for (const b of S.beats) {
  const i = [].concat(b.at).map((x) => at(x, after)).find((x) => x >= 0) ?? -1; if (i < 0) { console.log("skipped beat: " + b.at); continue; }
  const t = Math.max(lastEnd + (b.cta === "stories" ? 0.4 : 1.0), words[i].start - (b.count ? 0.9 : 0.15)); after = words[i].start + 0.2;
  let e = b.end ? (words[at(b.end, t)]?.end ?? t + (b.dur ?? 3)) + 0.3 : t + (b.dur ?? 3.2);
  if (b.count) { const li = at(b.count.at(-1), t); if (li >= 0) e = words[li].end + 0.55; }
  e = Math.min(TOTAL - 0.1, e);
  if (e - t < 1.4) { console.log("too short: " + b.at); if (b.cta === "stories" && live.length) live.at(-1).e = TOTAL - 0.1; continue; }
  live.push({ ...b, t, e, wi: i }); lastEnd = e;
}
live.forEach((b, k) => {
  const id = `pn${k}`, { t, e } = b, full = !!b.count;
  let inner = "";
  if (b.count) {
    inner = `<div class="lbl">${b.label || ""}</div><div class="cnt"><svg viewBox="0 0 400 400"><circle cx="200" cy="200" r="180" stroke="rgba(255,255,255,.12)" stroke-width="10" fill="none"/><circle class="ring" cx="200" cy="200" r="180" stroke="#F1D29E" stroke-width="10" fill="none" stroke-linecap="round" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="0" transform="rotate(-90 200 200)"/></svg><div class="big num cn">${b.big.split(",")[0]}</div></div>${b.sub ? `<div class="sub">${fmt(b.sub)}</div>` : ""}`;
  } else if (b.cta === "comment") {
    inner = `<div class="lbl">${b.label || "COMMENT"}</div><div class="cbar"><img src="assets/pfp.jpg"><div class="cin"><span class="ph">Add a comment…</span><span class="typed"></span><span class="caret"></span></div><div class="post">Post</div><div class="hand">${HAND}</div></div>${b.sub ? `<div class="sub">${fmt(b.sub)}</div>` : ""}`;
  } else if (b.cta === "stories") {
    inner = `<div class="lbl">${b.label || "TAP MY PROFILE PICTURE"}</div><div class="pf"><div class="sring"></div><img src="assets/pfp.jpg"><div class="ripple"></div><div class="badge">NEW</div><div class="hand">${HAND}</div></div>${b.big ? `<div class="big sm">${fmt(b.big)}</div>` : ""}${b.sub ? `<div class="sub">${fmt(b.sub)}</div>` : ""}`;
  } else {
    inner = `${b.art ? `<div class="artw">${artSvg(b.art)}</div>` : ""}${b.label ? `<div class="lbl">${b.label}</div>` : ""}<div class="big${/^[\d:+$%x ,]+$/i.test(b.big) ? " num" : ""}${b.art ? " wa" : ""}">${fmt(b.big)}</div>${b.sub ? `<div class="sub">${fmt(b.sub)}</div>` : ""}<div><svg class="arc" viewBox="0 0 600 40"><path d="M10 30 Q300 -6 590 30" fill="none" stroke="#E9C88F" stroke-width="3" stroke-linecap="round" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="1"/></svg></div>`;
  }
  html += `<div id="${id}" class="panel${full ? " full" : ""}">${inner}</div>\n`;
  // open: face shrinks into a rounded card (or fades away for full-screen moments)
  if (full) { tw += `tl.to("#face",{scale:0.6,y:500,opacity:0,borderRadius:60,duration:0.8,ease:"expo.inOut"},${T(t)});tl.to("#topfade",{opacity:1,duration:0.4},${T(t)});\n`; hideCaps.push([t, e]); }
  else tw += `tl.to("#face",{y:${OPEN},scale:0.76,borderRadius:44,duration:0.85,ease:"expo.inOut"},${T(t)});tl.to("#topfade",{opacity:1,duration:0.4},${T(t)});\n`;
  tw += `tl.fromTo("#${id} > div",{y:40,opacity:0,filter:"blur(12px)"},{y:0,opacity:1,filter:"blur(0px)",duration:0.7,stagger:0.1,ease:"expo.out",immediateRender:false},${T(t + 0.35)});\n`;
  tw += `tl.fromTo("#${id} .arc path",{attr:{"stroke-dashoffset":1}},{attr:{"stroke-dashoffset":0},duration:0.9,ease:"expo.inOut",immediateRender:false},${T(t + 0.7)});\n`;
  if (b.art) {
    tw += `tl.fromTo("#${id} .art [pathLength]",{attr:{"stroke-dashoffset":1}},{attr:{"stroke-dashoffset":0},duration:1.1,stagger:0.18,ease:"power2.inOut",immediateRender:false},${T(t + 0.4)});\n`;
    tw += `tl.fromTo("#${id} .art .dot,#${id} .art .fill",{scale:0,transformOrigin:"50% 50%"},{scale:1,duration:0.4,stagger:0.1,ease:"back.out(3)",immediateRender:false},${T(t + 1.0)});\n`;
    tw += `tl.fromTo("#${id} .artw",{scale:1},{scale:1.06,duration:${T(e - t)},ease:"none",immediateRender:false},${T(t)});\n`;
    if (b.art === "chain") tw += `tl.to("#${id} .art .l",{x:-26,rotation:-14,transformOrigin:"50% 50%",duration:0.5,ease:"back.out(3)"},${T(t + 1.6)});tl.to("#${id} .art .r",{x:26,rotation:14,transformOrigin:"50% 50%",duration:0.5,ease:"back.out(3)"},${T(t + 1.6)});\n`;
    if (b.art === "clock") tw += `tl.fromTo("#${id} .art .hand",{rotation:0,svgOrigin:"100 100"},{rotation:360,svgOrigin:"100 100",duration:${T(e - t)},ease:"none",immediateRender:false},${T(t)});\n`;
  }
  if (b.count) { // number swaps on each spoken count word; the ring drains once per number
    let from = t; const nums = b.big.split(",");
    b.count.forEach((w, j) => {
      const wi = at(w, from); if (wi < 0) return; const ts = words[wi].start; from = ts;
      tw += `tl.set("#${id} .cn",{textContent:"${nums[j]}"},${T(ts)});tl.fromTo("#${id} .cn",{scale:1.35,opacity:0,filter:"blur(10px)"},{scale:1,opacity:1,filter:"blur(0px)",duration:0.45,ease:"expo.out",immediateRender:false},${T(ts)});\n`;
      tw += `tl.fromTo("#${id} .ring",{attr:{"stroke-dashoffset":0}},{attr:{"stroke-dashoffset":1},duration:0.95,ease:"none",immediateRender:false},${T(ts)});\n`;
      cues.push({ kind: "tick", t: ts });
    });
  }
  if (b.cta === "comment") { // types the keyword letter by letter, then the finger taps Post
    const t0 = t + 1.0, txt = b.type, step = Math.min(0.12, 1.2 / txt.length);
    tw += `tl.to("#${id} .ph",{opacity:0,duration:0.15},${T(t0 - 0.1)});\n`;
    [...txt].forEach((_, j) => { tw += `tl.set("#${id} .typed",{textContent:${JSON.stringify(txt.slice(0, j + 1))}},${T(t0 + j * step)});\n`; });
    const tp = t0 + txt.length * step + 0.35;
    tw += `tl.fromTo("#${id} .caret",{opacity:1},{opacity:0,duration:0.3,repeat:${Math.ceil((e - t) / 0.6)},yoyo:true,ease:"steps(1)",immediateRender:false},${T(t + 0.6)});\n`;
    tw += `tl.fromTo("#${id} .hand",{x:120,y:160,opacity:0},{x:0,y:0,opacity:1,duration:0.6,ease:"expo.out",immediateRender:false},${T(tp - 0.6)});tl.to("#${id} .hand",{scale:0.85,duration:0.12,yoyo:true,repeat:1},${T(tp)});\n`;
    tw += `tl.to("#${id} .post",{color:"#F1D29E",scale:1.15,duration:0.2,yoyo:true,repeat:1},${T(tp + 0.05)});tl.to("#${id} .hand",{y:-14,duration:0.45,yoyo:true,repeat:${Math.max(1, Math.floor((e - tp - 0.8) / 0.45))},ease:"sine.inOut"},${T(tp + 0.4)});\n`;
    cues.push({ kind: "pop", t: tp });
  }
  if (b.cta === "stories") { // story ring spins, finger slides in and taps, ripples
    const tp = t + 1.1;
    tw += `tl.fromTo("#${id} .sring",{rotation:0},{rotation:360,duration:${T(e - t)},ease:"none",immediateRender:false},${T(t)});\n`;
    tw += `tl.fromTo("#${id} .hand",{x:160,y:180,opacity:0},{x:0,y:0,opacity:1,duration:0.6,ease:"expo.out",immediateRender:false},${T(tp - 0.6)});\n`;
    for (let r = tp; r < e - 0.6; r += 1.4) {
      tw += `tl.to("#${id} .hand",{scale:0.82,duration:0.12,yoyo:true,repeat:1},${T(r)});tl.fromTo("#${id} .ripple",{scale:0.6,opacity:0.9},{scale:1.8,opacity:0,duration:0.8,ease:"power2.out",immediateRender:false},${T(r + 0.1)});tl.fromTo("#${id} .pf img",{scale:1},{scale:0.94,duration:0.12,yoyo:true,repeat:1,immediateRender:false},${T(r)});\n`;
    }
    tw += `tl.fromTo("#${id} .badge",{scale:0},{scale:1,duration:0.4,ease:"back.out(3)",immediateRender:false},${T(tp + 0.2)});\n`;
    cues.push({ kind: "pop", t: tp });
  }
  tw += `tl.to("#${id} > div",{y:-30,opacity:0,filter:"blur(10px)",duration:0.4,stagger:0.05,ease:"power2.in"},${T(e - 0.45)});\n`;
  tw += `tl.to("#face",{y:0,scale:1,opacity:1,borderRadius:0,duration:0.8,ease:"expo.inOut"},${T(e - 0.2)});tl.to("#topfade",{opacity:0,duration:0.5},${T(e + 0.2)});\n`;
  cues.push({ kind: "whoosh", t: t + 0.05 }, { kind: "whoosh", t: e - 0.15 });
});
const busy = (t) => GLOW ? t < HEADT + 0.1 || live.some((b) => t > b.t - 0.15 && t < b.e + 0.1) : t < HEADT + 0.6 || live.some((b) => t > b.t - 0.2 && t < b.e + 0.3);

// stickers: small white tags that pop beside the face on a spoken word (only while the face is full screen)
let sk = 0, lastSt = 0; const evs = [];
const stk = (S.stickers || []).map((s) => ({ s, i: [].concat(s.at).map((x) => at(x, 0)).find((x) => x >= 0) ?? -1 }));
stk.filter((x) => x.i < 0).forEach((x) => console.log("skipped sticker: " + x.s.at));
for (const { s, i } of stk.filter((x) => x.i >= 0).sort((a, b) => a.i - b.i)) {
  const t = words[i].start - 0.05, nextP = Math.min(...live.map((b) => b.t).filter((x) => x > t), TOTAL), e = Math.min(t + (s.dur ?? (GLOW ? 2.1 : 1.6)), nextP - (GLOW ? 0.15 : 0.3));
  if (busy(t) || e - t < (GLOW ? 0.7 : 0.9) || t < lastSt + (GLOW ? 0.05 : 0.3)) { console.log("sticker clash: " + s.at + " @" + t.toFixed(2)); continue; }
  lastSt = e; const id = `st${sk++}`, rot = s.side === "r" ? 5 : -5;
  html += `<div id="${id}" class="stk ${s.side === "r" ? "r" : "l"}${GLOW ? " glass" : ""}" style="${s.top ? `top:${s.top}px` : ""}"><svg viewBox="0 0 24 24">${ICO[s.icon]}</svg><span>${s.text}</span>${GLOW ? "<i></i><i></i><i></i><i></i>" : ""}</div>\n`;
  tw += `tl.fromTo("#${id}",{scale:0,rotation:${rot * 4},opacity:0},{scale:1,rotation:${rot},opacity:1,duration:0.5,ease:"back.out(2.4)",immediateRender:false},${T(t)});tl.fromTo("#${id}",{y:0},{y:-16,duration:${T(e - t)},ease:"sine.inOut",immediateRender:false},${T(t)});tl.to("#${id}",{scale:0.6,opacity:0,duration:0.25,ease:"power2.in"},${T(e - 0.25)});\n`;
  if (GLOW) [[-70, -60], [80, -70], [-60, 60], [90, 55]].forEach(([x, y], j) => { tw += `tl.fromTo("#${id} i:nth-of-type(${j + 1})",{x:0,y:0,scale:0,opacity:1},{x:${x},y:${y},scale:1,opacity:0,duration:0.7,ease:"expo.out",immediateRender:false},${T(t + 0.08)});\n`; });
  cues.push({ kind: "pop", t }); evs.push(t);
}
// attention check: report any stretch longer than 5.5 s with nothing new on screen
{ const ev = [0, HEADT, ...live.flatMap((b) => [b.t, b.e]), ...evs, TOTAL].sort((a, b) => a - b);
  ev.slice(1).forEach((x, i) => { if (x - ev[i] > 5.5) console.log(`GAP ${ev[i].toFixed(1)}-${x.toFixed(1)}: "${words.filter((w) => w.start > ev[i] && w.start < x).map((w) => w.text).join(" ")}"`); }); }

// slow camera drift on the face
tw += `tl.fromTo("#zoom",{scale:1},{scale:1.06,duration:${T(TOTAL / 2)},ease:"sine.inOut",yoyo:true,repeat:1},0);\n`;

// ---------- captions: one line, <=3 words, word-by-word blur-in, accent word in serif ----------
const hidden = (t) => hideCaps.some(([a, b]) => t > a + 0.3 && t < b);
const groups = []; let g = [];
words.forEach((w, i) => { g.push(w); const nx = words[i + 1]; const len = g.map((x) => x.text).join(" ").length; if (/[.,?!]$/.test(w.text) || g.length >= 3 || len > 16 || !nx || nx.start - w.end > 0.3) { groups.push(g); g = []; } });
const caps = groups.filter((gr) => !hidden(gr[0].start)).map((gr, i, arr) => {
  const st = gr[0].start - 0.05, nx = arr[i + 1] ? arr[i + 1][0].start - 0.05 : TOTAL, en = Math.min(nx, gr.at(-1).end + 0.6, ...hideCaps.filter(([a]) => a > st).map(([a]) => a + 0.3));
  return { id: `c${i}`, st, dur: en - st, ws: gr.map((w, j) => ({ id: `c${i}w${j}`, t: w.start, txt: w.text.replace(/[.,!?;:]+$/, "").replace(/&/g, "&amp;"), acc: ACC.has(norm(w.text)) })) };
}).filter((c) => c.dur > 0.1);
fs.writeFileSync(P + "/compositions/caps.html", `<template>
<style>#root{position:absolute;inset:0;} .cg{position:absolute;left:0;top:${S.capTop ?? 1560}px;width:1080px;padding:0 60px;text-align:center;}
.cw{display:inline-block;margin:0 9px;font-family:Inter;font-weight:700;font-size:66px;letter-spacing:-.01em;color:#fff;text-shadow:0 3px 18px rgba(0,0,0,.65),0 0 2px rgba(0,0,0,.6);}
.cw.a{font-family:'Instrument Serif';font-style:italic;font-weight:400;font-size:84px;color:#F1D29E;letter-spacing:0;}
${GLOW ? `.cw{font-weight:900;font-size:74px;text-transform:uppercase;letter-spacing:-.015em;-webkit-text-stroke:10px rgba(0,0,0,.55);paint-order:stroke fill;text-shadow:0 4px 22px rgba(0,0,0,.6);}
.cw.a{text-transform:none;font-size:96px;-webkit-text-stroke:8px rgba(0,0,0,.45);text-shadow:0 0 26px rgba(241,210,158,.7),0 4px 18px rgba(0,0,0,.6);}` : ""}</style>
<div id="root" data-composition-id="caps" data-width="1080" data-height="1920">
${caps.map((c) => `<div id="${c.id}" class="clip cg" data-start="${T(c.st)}" data-duration="${T(c.dur)}">${c.ws.map((w) => `<span class="cw${w.acc ? " a" : ""}" id="${w.id}">${w.txt}</span>`).join("")}</div>`).join("\n")}
</div><script>const tl = gsap.timeline({ paused: true });
${GLOW
  // karaoke: each word pops in on its beat, the spoken word flashes gold and grows, then settles
  ? caps.map((c) => c.ws.map((w, j) => { const t0 = Math.max(c.st, w.t - 0.04), nx = c.ws[j + 1] ? c.ws[j + 1].t - 0.04 : c.st + c.dur;
    return `tl.fromTo("#${w.id}",{opacity:0,y:30,scale:0.55,rotation:${j % 2 ? 3 : -3}},{opacity:1,y:0,scale:1,rotation:0,duration:0.32,ease:"back.out(2.6)"},${T(t0)});`
      + (w.acc ? "" : `tl.fromTo("#${w.id}",{color:"#FFFFFF"},{color:"#F1D29E",duration:0.08,immediateRender:false},${T(t0)});tl.to("#${w.id}",{color:"#FFFFFF",duration:0.18},${T(Math.max(t0 + 0.2, nx))});`); }).join("")).join("\n")
  : caps.map((c) => c.ws.map((w) => `tl.fromTo("#${w.id}",{opacity:0,y:18,filter:"blur(8px)"},{opacity:1,y:0,filter:"blur(0px)",duration:0.3,ease:"expo.out"},${T(Math.max(c.st, w.t - 0.04))});`).join("")).join("\n")}
tl.set({}, {}, ${TOTAL}); window.__timelines["caps"] = tl;</script></template>`);

// ---------- audio: voice, quiet bed, whooshes + a few soft pops/ticks ----------
ff(["-hide_banner", "-y", "-i", BODY, "-vn", "-ac", "1", "-ar", "48000", P + "/assets/voice.wav"]);
const getI = (txt) => { const m = txt.match(/"input_i"\s*:\s*"(-?[\d.]+)"/); return m ? +m[1] : null; };
const voI = getI(ff(["-hide_banner", "-i", P + "/assets/voice.wav", "-af", "loudnorm=print_format=json", "-f", "null", "-"]));
const muI = getI(ff(["-hide_banner", "-t", String(TOTAL + 1), "-i", MUSIC, "-af", "loudnorm=print_format=json", "-f", "null", "-"]));
const loops = Math.max(0, Math.ceil((TOTAL + 1) / ffp(MUSIC)) - 1);
ff(["-hide_banner", "-y", "-stream_loop", String(loops), "-i", MUSIC, "-t", String(TOTAL + 0.5), "-af", `volume=${(voI - 19 - muI).toFixed(2)}dB,afade=t=in:d=0.8,afade=t=out:st=${(TOTAL - 2).toFixed(2)}:d=2`, "-ar", "48000", "-ac", "2", P + "/assets/music.wav"]);
const KIT = { whoosh: [0.265, -16.2, -15], pop: [0.0, -19.1, -17], tick: [0.002, -17.4, -16] };
const audio = cues.sort((a, b) => a.t - b.t).map((c, i) => { const [pk, mm, rel] = KIT[c.kind]; fs.copyFileSync(LK + c.kind + ".wav", P + `/assets/k_${c.kind}.wav`); return `<audio id="fx${i}" class="clip" src="assets/k_${c.kind}.wav" data-start="${T(Math.max(0, c.t - pk))}" data-duration="1.6" data-track-index="${7 + (i % 3)}" data-volume="${Math.min(1, Math.pow(10, (voI + rel - mm) / 20)).toFixed(3)}"></audio>`; });

const css = `*{margin:0;padding:0;box-sizing:border-box;}
html,body{width:1080px;height:1920px;overflow:hidden;background:#0A0A0C;}
#face{position:absolute;left:0;top:0;width:1080px;height:1920px;overflow:hidden;transform-origin:540px 0;}
#zoom{position:absolute;inset:0;transform-origin:540px 560px;}
#zoom video{position:absolute;left:0;top:0;width:1080px;height:1920px;object-fit:cover;}
#topfade{position:absolute;left:0;top:0;width:1080px;height:170px;background:linear-gradient(180deg,#0A0A0C,rgba(10,10,12,0));opacity:0;}
#shade{position:absolute;left:0;right:0;bottom:0;height:640px;background:linear-gradient(180deg,transparent,rgba(0,0,0,.55));pointer-events:none;}
#head{position:absolute;left:0;top:${S.headTop ?? (GLOW ? 200 : 96)}px;width:1080px;text-align:center;}
.hl{font-family:Inter;font-weight:900;font-size:${S.headSize ?? (GLOW ? 96 : 84)}px;line-height:1.02;letter-spacing:-.03em;color:#fff;text-transform:uppercase;}
.hl.ser{font-family:'Instrument Serif';font-style:italic;font-weight:400;font-size:${(S.headSize ?? (GLOW ? 96 : 84)) * 1.22}px;text-transform:none;letter-spacing:-.01em;color:#F1D29E;line-height:1.0;}
.hw{display:inline-block;}
#rule{width:120px;height:3px;margin:22px auto 0;background:#F1D29E;border-radius:2px;opacity:.8;}
.panel{position:absolute;left:0;top:${S.panelTop ?? 120}px;width:1080px;height:${OPEN - 150}px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;color:#fff;}
.panel.full{top:0;height:1920px;}
.panel > div{opacity:0;}
.lbl{font-family:Inter;font-weight:600;font-size:34px;letter-spacing:.34em;color:rgba(255,255,255,.62);margin-bottom:18px;}
.big{font-family:Inter;font-weight:900;font-size:120px;line-height:1.0;letter-spacing:-.035em;padding:0 60px;}
.big.wa{font-size:104px;} .big.sm{font-size:76px;margin-top:26px;}
.big em,.sub em{font-family:'Instrument Serif';font-style:italic;font-weight:400;color:#F1D29E;letter-spacing:0;font-size:1.2em;}
.big.num{font-size:260px;letter-spacing:-.05em;background:linear-gradient(180deg,#fff,#E9C88F);-webkit-background-clip:text;background-clip:text;color:transparent;}
.big.num.wa{font-size:190px;}
.sub{font-family:Inter;font-weight:500;font-size:44px;color:rgba(255,255,255,.75);margin-top:20px;padding:0 80px;}
.arc{width:520px;height:36px;margin-top:22px;}
.artw{width:210px;height:210px;margin-bottom:18px;} .art{width:100%;height:100%;overflow:visible;filter:drop-shadow(0 0 14px rgba(241,210,158,.45));} .art .dot,.art .fill{fill:#F1D29E;stroke:none;}
.cnt{position:relative;width:620px;height:620px;display:flex;align-items:center;justify-content:center;} .cnt svg{position:absolute;inset:0;width:100%;height:100%;filter:drop-shadow(0 0 18px rgba(241,210,158,.5));} .cnt .big.num{font-size:400px;padding:0;}
.cbar{position:relative;display:flex;align-items:center;gap:24px;width:920px;padding:22px 30px;border-radius:70px;background:#fff;box-shadow:0 20px 60px rgba(0,0,0,.5),0 0 0 6px rgba(241,210,158,.35);}
.cbar img{width:92px;height:92px;border-radius:50%;object-fit:cover;flex:none;}
.cin{flex:1;position:relative;text-align:left;font-family:Inter;font-size:52px;font-weight:800;color:#111;height:70px;display:flex;align-items:center;}
.ph{position:absolute;left:0;font-weight:500;color:#8e8e93;} .caret{display:inline-block;width:4px;height:58px;background:#3B82F6;margin-left:4px;}
.post{font-family:Inter;font-weight:800;font-size:44px;color:#3B82F6;flex:none;}
.hand{position:absolute;width:140px;height:140px;filter:drop-shadow(0 10px 20px rgba(0,0,0,.5));opacity:0;} .cbar .hand{right:-10px;top:70px;transform-origin:30% 10%;} .hand svg{width:100%;height:100%;}
.pf{position:relative;width:330px;height:330px;margin-top:40px;} .pf .sring{position:absolute;inset:0;border-radius:50%;background:conic-gradient(#F9CE34,#EE2A7B,#6228D7,#F9CE34);}
.pf img{position:absolute;inset:14px;width:302px;height:302px;border-radius:50%;object-fit:cover;border:10px solid #0A0A0C;}
.pf .ripple{position:absolute;inset:0;border-radius:50%;border:6px solid #fff;opacity:0;}
.pf .badge{position:absolute;left:50%;bottom:-18px;margin-left:-70px;width:140px;padding:8px 0;border-radius:14px;background:linear-gradient(90deg,#EE2A7B,#6228D7);font-family:Inter;font-weight:900;font-size:30px;letter-spacing:.12em;color:#fff;border:5px solid #0A0A0C;}
.pf .hand{right:-90px;bottom:-60px;transform-origin:30% 10%;}
.stk{position:absolute;top:${S.stickTop ?? 520}px;display:flex;align-items:center;gap:14px;padding:16px 26px 16px 18px;border-radius:26px;background:#fff;box-shadow:0 14px 34px rgba(0,0,0,.35);font-family:Inter;font-weight:800;font-size:34px;color:#111;opacity:0;letter-spacing:.02em;}
.stk.l{left:56px;transform-origin:0 50%;} .stk.r{right:56px;transform-origin:100% 50%;} .stk svg{width:52px;height:52px;}
#hshade{position:absolute;left:0;top:0;width:1080px;height:720px;background:radial-gradient(ellipse 85% 70% at 50% 12%,rgba(6,6,10,.82),rgba(6,6,10,.45) 55%,rgba(6,6,10,0) 100%);opacity:0;}
${GLOW ? `.hl{color:#fff;text-shadow:0 0 18px rgba(241,210,158,.55),0 0 50px rgba(241,210,158,.3),0 4px 20px rgba(0,0,0,.6);}
.hl.ser{color:#F6DDAE;text-shadow:0 0 20px rgba(241,210,158,.9),0 0 60px rgba(241,210,158,.45);} .hc,.wr{display:inline-block;}
#rule{box-shadow:0 0 16px rgba(241,210,158,.9);}
.stk.glass{background:rgba(18,16,26,.58);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border:2px solid rgba(241,210,158,.55);color:#fff;box-shadow:0 0 28px rgba(241,210,158,.35),0 14px 34px rgba(0,0,0,.35);font-size:38px;padding:20px 32px 20px 22px;} .stk.glass svg{width:60px;height:60px;}
.stk.glass svg path,.stk.glass svg rect,.stk.glass svg circle{filter:drop-shadow(0 0 6px rgba(241,210,158,.6));}
.stk i{position:absolute;left:50%;top:50%;width:14px;height:14px;margin:-7px;border-radius:50%;background:#F6DDAE;box-shadow:0 0 12px #F1D29E;opacity:0;}` : ""}`;
fs.writeFileSync(P + "/index.html", `<!doctype html>
<html lang="en"><head><meta charset="UTF-8" /><meta name="viewport" content="width=1080, height=1920" />
<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Inter:wght@500;600;700;800;900&family=Instrument+Serif:ital@0;1&display=block" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js"></script>
<style>${css}</style></head><body>
<div id="root" data-composition-id="main" data-start="0" data-duration="${TOTAL}" data-width="1080" data-height="1920">
<div id="face"><div id="zoom"><video id="body" class="clip" src="assets/body.mp4" data-start="0" data-duration="${TOTAL}" data-media-start="0" data-track-index="1" muted playsinline></video></div><div id="shade"></div><div id="topfade"></div></div>
<div id="hshade"></div><div id="head">${head}<div id="rule"></div></div>
${html}
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
console.log(`${SLUG}: cut ${(rawLen - acc).toFixed(1)}s of ${rawLen.toFixed(1)}s, total ${TOTAL}s, panels ${live.length}/${S.beats.length}, stickers ${sk}/${(S.stickers || []).length}, caps ${caps.length}`);
console.log("panels at " + live.map((b) => `${b.t.toFixed(1)}-${b.e.toFixed(1)}`).join(" "));
if (RENDER) {
  const out = `${P}-render.mp4`;
  const r = spawnSync("npx", ["hyperframes@0.9.67", "render", "--workers", "5", "--fps", "24", "--crf", "20", "-o", `"${out}"`], { cwd: P, env, encoding: "utf8", shell: true, maxBuffer: 1 << 26 });
  if (r.status !== 0) throw new Error("render failed: " + (r.stderr || r.stdout).slice(-800));
  const dir = S.outDir ? `${OUTDIR}/${S.outDir}` : OUTDIR; fs.mkdirSync(dir, { recursive: true });
  let name = NAME, k = 2; while (fs.existsSync(`${dir}/${name}.mp4`)) name = `${NAME} ${k++}`;
  ff(["-hide_banner", "-y", "-i", out, "-c:v", "copy", "-af", "loudnorm=I=-15:TP=-1.5:LRA=11", "-ar", "48000", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", `${dir}/${name}.mp4`]);
  fs.rmSync(out, { force: true }); fs.rmSync(BODY, { force: true }); fs.rmSync(P + "/.hyperframes", { recursive: true, force: true });
  console.log("delivered " + `${dir}/${name}.mp4`);
}

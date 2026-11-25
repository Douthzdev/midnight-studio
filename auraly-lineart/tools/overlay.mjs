// Overlay edit: the footage plays untouched (no push/zoom); clean dark-glass pop-ups animate on top on spoken words,
// one idea at a time (chips, a Morning/Lunch/Dinner day line, checklists, question card, stats, a drawn circle, CTA).
// Headline readable from frame 0 for ~4 s. Captions = white "Editorial serif" (caption-lab style 3).
// usage: node tools/overlay.mjs <video.mp4> <Name> <slug> <script.json> [--render]
//   cut pipeline (vad.py hard cuts + edits.json drops) is the same as minimal.mjs; wav + transcript in auraly-min/src.
import fs from "node:fs";
import { spawnSync } from "node:child_process";

const [RAW, NAME, SLUG, SCRIPT] = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const RENDER = process.argv.includes("--render");
const STUDIO = "M:/Google/hyperframes/Midnight-Studio", SRC = STUDIO + "/auraly-min/src", P = `${STUDIO}/auraly-min/${SLUG}`;
const OUTDIR = "M:/Google/hyperframes/VIDEOS EDITADOS", LK = STUDIO + "/auraly-lineart/sfx/kit/";
const S = JSON.parse(fs.readFileSync(SCRIPT, "utf8"));
const MUSIC = S.music || "C:/Users/Vinicius/Music/Songs Auraly UGC/MORNING LIGHTT.MP3";
const env = { ...process.env, PATH: "M:/CLAUDE/tools/ffmpeg/bin;" + process.env.PATH };
for (const k of ["HYPERFRAMES_EXTRACT_CACHE_DIR", "TMPDIR", "TEMP", "TMP"]) env[k] = "M:/CLAUDE/tools/hf-frames";
const ff = (args) => { const r = spawnSync("ffmpeg", args, { encoding: "utf8", env }); return (r.stderr || "") + (r.stdout || ""); };
const ffp = (f) => +spawnSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f], { encoding: "utf8", env }).stdout.trim();
const T = (x) => (+x).toFixed(3);
const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
const fmt = (s) => esc(s).replace(/\*([^*]+)\*/g, "<em>$1</em>");
fs.mkdirSync(P + "/assets", { recursive: true }); fs.mkdirSync(P + "/compositions", { recursive: true });

// ---------- hard cuts (no breaths) + glitch drops ----------
const WAV = `${SRC}/${SLUG}.wav`, TR = `${SRC}/t_${SLUG}/transcript.json`, EDP = `${SRC}/t_${SLUG}/edits.json`;
const ED = fs.existsSync(EDP) ? JSON.parse(fs.readFileSync(EDP, "utf8")) : {};
const vr = spawnSync("M:/CLAUDE/tools/kokoro-venv/Scripts/python.exe", ["-I", STUDIO + "/auraly-lineart/tools/vad.py", WAV, TR, ...(fs.existsSync(EDP) ? [EDP] : [])], { encoding: "utf8" });
if (vr.status !== 0) throw new Error("vad.py failed: " + vr.stderr);
const rawLen = ffp(RAW);
const audLen = ffp(WAV); // audio can run past the last video frame (then the last frame is held)
let keep = JSON.parse(vr.stdout).map(([a, b]) => [a, Math.min(b, audLen)]);
// vad.py keeps some quiet pauses inside segments (0.3-0.7 s on this voice): also cut every silence > 0.25 s
{ const sd = ff(["-hide_banner", "-i", WAV, "-af", "silencedetect=n=-40dB:d=0.14", "-f", "null", "-"]);
  const sil = [...sd.matchAll(/silence_start: ([\d.]+)[\s\S]*?silence_end: ([\d.]+)/g)].map((m) => [+m[1] + 0.05, +m[2] - 0.05]);
  for (const [s, e] of sil) keep = keep.flatMap(([a, b]) => (s >= b || e <= a) ? [[a, b]] : [[a, Math.min(b, s)], [Math.max(a, e), b]]); }
// silent b-roll hook at the start (hook+body joins): keep it whole, the cuts start after it
if (S.hook) keep = [[0, S.hook], ...keep.map(([a, b]) => [Math.max(a, S.hook), b]).filter(([a, b]) => b - a > 0.04)];
keep = keep.map(([a, b]) => [Math.round(a * 30) / 30, Math.round(b * 30) / 30]).filter(([a, b]) => b - a > 0.04); // frame grid: video and audio segments get equal lengths (else concat pads silence and drifts) fs.writeFileSync(P + "/keep.json", JSON.stringify(keep));
const offs = []; let acc = 0; for (const [a, b] of keep) { offs.push(acc); acc += b - a; }
const mapT = (t) => { for (let i = 0; i < keep.length; i++) { if (t < keep[i][0]) return offs[i]; if (t <= keep[i][1]) return offs[i] + t - keep[i][0]; } return acc; };
const BODY = P + "/assets/body.mp4";
if (!fs.existsSync(BODY) || RENDER) {
  const WAV48 = P + "/assets/full48.wav"; ff(["-hide_banner", "-y", "-i", RAW, "-vn", "-ac", "2", "-ar", "48000", WAV48]); // audio cut from the decoded wav (same timeline as the transcript); the mp4 audio track has timestamp gaps
  const fc = keep.map(([a, b], i) => `[0:v]fps=30:start_time=0,trim=${a.toFixed(3)}:${Math.min(b, rawLen - 0.04).toFixed(3)},setpts=PTS-STARTPTS${b > rawLen - 0.04 ? `,tpad=stop_mode=clone:stop_duration=${(b - rawLen + 0.04).toFixed(3)}` : ""},scale=1080:1920:flags=lanczos[v${i}];[1:a]atrim=${a.toFixed(3)}:${b.toFixed(3)},asetpts=PTS-STARTPTS,afade=t=in:d=0.01,afade=t=out:st=${(b - a - 0.012).toFixed(3)}:d=0.012[a${i}];`).join("") + keep.map((_, i) => `[v${i}][a${i}]`).join("") + `concat=n=${keep.length}:v=1:a=1[v][a]`;
  ff(["-hide_banner", "-y", "-i", RAW, "-i", WAV48, "-filter_complex", fc, "-map", "[v]", "-map", "[a]", "-c:v", "h264_nvenc", "-preset", "p5", "-rc", "vbr", "-cq", "18", "-b:v", "0", "-c:a", "aac", "-b:a", "192k", BODY]);
}
// profile picture for the stories CTA: square crop of the face, a few seconds into the body
ff(["-hide_banner", "-y", "-ss", String((S.hook ?? 0) + (S.pfpAt ?? 6)), "-i", RAW, "-frames:v", "1", "-vf", "scale=1080:1920,crop=560:560:260:280,scale=300:300", P + "/assets/pfp.jpg"]);
const rawWords = JSON.parse(fs.readFileSync(TR, "utf8"));
const dropped = (w) => (ED.drop || []).some(([a, b]) => (w.start + w.end) / 2 > a && (w.start + w.end) / 2 < b);
const retext = (w) => { const r = (ED.retext || []).find(([t]) => Math.abs(t - w.start) < 0.03); return r ? { ...w, text: r[1] } : w; }; // per-word caption fix by time, "" hides the word
const words = [...rawWords, ...(ED.add || [])].map(retext).filter((w) => w.text && !dropped(w)).sort((x, y) => x.start - y.start)
  .map((w) => ({ ...w, text: (S.fix || {})[w.text] ?? w.text, start: +mapT(w.start).toFixed(3), end: +mapT(w.end).toFixed(3) }));
const TOTAL = +acc.toFixed(3);
const W = words.map((w) => norm(w.text));
const at = (phrase, after = 0) => { const p = phrase.split(" ").map(norm); for (let i = 0; i < W.length; i++) if (words[i].start >= after && p.every((x, j) => W[i + j] === x)) return i; return -1; };
const tOf = (phrase, after = 0, end = false) => { const i = at(phrase, after); if (i < 0) return null; return end ? words[i + phrase.split(" ").length - 1].end : words[i].start; };

// ---------- white line icons (24 grid) ----------
const ICO = {
  eye: `<path d="M2 12Q12 3 22 12Q12 21 2 12Z"/><circle cx="12" cy="12" r="3.2"/>`,
  drop: `<path d="M12 3C8 9 6 12 6 15a6 6 0 0 0 12 0c0-3-2-6-6-12Z"/>`,
  leaf: `<path d="M5 19C5 9 11 5 20 4c0 9-4 15-14 15Z"/><path d="M5 19L13 11"/>`,
  bolt: `<path d="M13 2L5 14h6l-1 8 8-12h-6l1-8Z"/>`,
  bowl: `<path d="M3 11h18a9 9 0 0 1-18 0Z"/><path d="M8 8c0-2 2-3 3-3M13 8c1-3 4-3 5-2"/>`,
  cup: `<path d="M4 9h13v5a6 6 0 0 1-6 6h-1a6 6 0 0 1-6-6Z"/><path d="M17 11h1.5a2.5 2.5 0 0 1 0 5H17"/><path d="M8 2.5c-1 1.5 1 2.5 0 4M12 2.5c-1 1.5 1 2.5 0 4"/>`,
  basket: `<path d="M3 9h18l-2 11H5Z"/><path d="M8 9l3-6M16 9l-3-6M9 13v4M15 13v4"/>`,
  book: `<path d="M4 4h7a2 2 0 0 1 2 2v14a2 2 0 0 0-2-2H4Z"/><path d="M20 4h-7v16M20 4v14h-7"/>`,
  chat: `<path d="M4 4h16v11H9l-5 4Z"/>`,
  spark: `<path d="M12 3Q13 11 21 12Q13 13 12 21Q11 13 3 12Q11 11 12 3Z"/>`,
  sun: `<circle cx="12" cy="12" r="4"/><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M5 5l1.8 1.8M17.2 17.2L19 19M5 19l1.8-1.8M17.2 6.8L19 5"/>`,
  clock: `<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>`,
  moon: `<path d="M20 15A8 8 0 1 1 10 4a6.5 6.5 0 0 0 10 11Z"/>`,
  arrow: `<path d="M5 12h14M13 6l6 6-6 6"/>`,
  save: `<path d="M6 3h12v18l-6-4.5L6 21Z"/>`,
  heart: `<path d="M12 20C5 15 3 11.5 4 8.5 5 5.5 9 4.5 12 8c3-3.5 7-2.5 8 .5 1 3-1 6.5-8 11.5Z"/>`,
  send: `<path d="M21 3L3 10.5l7 2.5 2.5 7Z"/><path d="M10 13l11-10"/>`,
  lock: `<rect x="5" y="11" width="14" height="10" rx="2.5"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>`,
  unlock: `<rect x="5" y="11" width="14" height="10" rx="2.5"/><path d="M8 11V8a4 4 0 0 1 7.6-1.7"/>`,
  door: `<path d="M5 21V4a1 1 0 0 1 1-1h8v18"/><path d="M14 3l5 2v16h-5M11 12.5v.5"/>`,
  chain: `<rect x="2" y="9" width="10" height="6" rx="3"/><rect x="12" y="9" width="10" height="6" rx="3"/>`,
  wings: `<path d="M12 20C9 16 4 16 2 10c3 1.5 6 1 8 2.5C9 9 10 6 12 4c2 2 3 5 2 8.5 2-1.5 5-1 8-2.5-2 6-7 6-10 10Z"/>`,
  money: `<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M6 9.5v5M18 9.5v5"/>`,
  home: `<path d="M3 11l9-7 9 7"/><path d="M5 9.5V20h14V9.5M10 20v-5h4v5"/>`,
  calendar: `<rect x="3" y="5" width="18" height="16" rx="2.5"/><path d="M3 10h18M8 3v4M16 3v4"/>`,
  phone: `<rect x="6" y="2" width="12" height="20" rx="3"/><path d="M10.5 18.5h3"/>`,
  bell: `<path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4Z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>`,
  fist: `<path d="M7 11V7.5a1.5 1.5 0 0 1 3 0V10M10 9.5V6.5a1.5 1.5 0 0 1 3 0V10M13 9.5V7a1.5 1.5 0 0 1 3 0v3.5M16 10a1.5 1.5 0 0 1 3 0v3c0 4-2.5 7-6.5 7h-1C8 20 6 18 6 15v-2.5a1.5 1.5 0 0 1 3 0"/>`,
  shield: `<path d="M12 3l7 3v5.5c0 4.5-3 8-7 9.5-4-1.5-7-5-7-9.5V6Z"/><path d="M9 12l2 2 4-4"/>`,
  star: `<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9Z"/>`,
  portal: `<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/>`,
  question: `<circle cx="12" cy="12" r="9.5"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 1-1 1.7M12 16.5v.5"/>`,
  sprout: `<path d="M12 21v-9"/><path d="M12 12C12 7 8 5 4 5c0 4 3 7 8 7ZM12 14c0-4 3-6 8-6 0 4-3 6-8 6Z"/>`,
  check: `<path d="M5 12.5l4.5 4.5L19 7"/>`,
};
const ico = (k, cls = "ic") => `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICO[k]}</svg>`;
const HAND = `<svg viewBox="0 0 64 64"><path d="M26 6c3 0 5 2 5 5v18l3-1c3-1 5 1 6 2l2-1c3-1 5 1 6 2l2-1c3-1 6 1 6 4v12c0 9-7 16-16 16h-4c-6 0-10-3-13-8L13 41c-2-3-1-6 2-7 2-1 4 0 6 2l1 2V11c0-3 2-5 4-5z" fill="#fff" stroke="#1C1C1E" stroke-width="2.5" stroke-linejoin="round"/></svg>`;

// ---------- pop-ups ----------
const HEADT = S.headDur ?? 4.4;
let html = "", tw = ""; const cues = [], evs = [0, HEADT];
const inn = (sel, t) => { tw += `tl.fromTo("${sel}",{opacity:0,scale:0.86,y:26,filter:"blur(12px)"},{opacity:1,scale:1,y:0,filter:"blur(0px)",duration:0.55,ease:"expo.out",immediateRender:false},${T(t)});\n`; };
const out = (sel, t) => { tw += `tl.to("${sel}",{opacity:0,y:-18,scale:0.96,filter:"blur(10px)",duration:0.35,ease:"power2.in"},${T(t)});\n`; };
const slots = {}; // pos -> busy until
let after = 0;
S.pops.forEach((p, k) => {
  const id = `p${k}`, t0 = tOf(p.at, after);
  if (t0 == null) { console.log("skipped: " + p.at); return; }
  const t = Math.max(t0 - 0.12, HEADT * (p.type === "circle" ? 0 : 1) + 0.05); after = t0 + 0.1;
  let e = p.end ? (tOf(p.end, t0, true) ?? t + (p.dur ?? 3)) + 0.35 : t + (p.dur ?? 3);
  if (p.type === "cta") e = TOTAL;
  e = Math.min(e, TOTAL);
  const pos = p.pos || { day: "top", question: "top", stats: "top", cta: "cta", circle: "circle", pattern: "tr", letters: "top", comment: "bot", stories: "bot" }[p.type] || "tl";
  const zone = ["tl", "tr", "top"].includes(pos) ? "top" : pos;
  if ((slots[zone] ?? 0) > t) console.log(`CLASH ${p.type} "${p.at}" @${t.toFixed(1)} (zone ${zone} busy until ${slots[zone].toFixed(1)})`);
  slots[zone] = e;
  evs.push(t, e); cues.push({ kind: "pop", t: t + 0.02 });
  const cls = `pop ${pos}`;
  if (p.type === "chip") {
    html += `<div id="${id}" class="${cls} gl chip">${ico(p.icon)}<span>${fmt(p.text)}</span></div>\n`;
    inn(`#${id}`, t); tw += `tl.fromTo("#${id} .ic",{rotation:-25,scale:0.4},{rotation:0,scale:1,duration:0.6,ease:"back.out(3)",immediateRender:false},${T(t + 0.12)});\n`;
  } else if (p.type === "card") {
    html += `<div id="${id}" class="${cls} gl card"><div class="cic">${ico(p.icon)}</div><div><div class="ct">${fmt(p.title)}</div><div class="cs">${fmt(p.sub || "")}</div></div></div>\n`;
    inn(`#${id}`, t); tw += `tl.fromTo("#${id} .cs",{opacity:0,x:-14},{opacity:1,x:0,duration:0.45,ease:"expo.out",immediateRender:false},${T(t + 0.35)});tl.fromTo("#${id} .cic",{scale:0.5},{scale:1,duration:0.6,ease:"back.out(3)",immediateRender:false},${T(t + 0.1)});\n`;
  } else if (p.type === "question") {
    html += `<div id="${id}" class="${cls} gl qcard"><div class="qm">?</div><div class="qt">${fmt(p.text)}</div></div>\n`;
    inn(`#${id}`, t); tw += `tl.fromTo("#${id} .qm",{scale:0,rotation:-40},{scale:1,rotation:0,duration:0.6,ease:"back.out(3)",immediateRender:false},${T(t + 0.15)});tl.fromTo("#${id} .qm",{y:0},{y:-8,duration:0.8,yoyo:true,repeat:${Math.max(1, Math.floor((e - t) / 0.8) - 1)},ease:"sine.inOut",immediateRender:false},${T(t + 0.8)});\n`;
  } else if (p.type === "day") {
    const N = [["sun", "Morning"], ["clock", "Lunch"], ["moon", "Dinner"]];
    html += `<div id="${id}" class="${cls} gl day"><div class="trk"><b></b></div>${N.map(([ic, l], n) => `<div class="nd n${n}"><div class="dot">${ico(ic)}</div><div class="nl">${l}</div><div class="tag"></div></div>`).join("")}</div>\n`;
    inn(`#${id}`, t);
    let from = t0;
    for (const s of p.steps) {
      const ts = tOf(s.at, from); if (ts == null) { console.log("  day step skipped: " + s.at); continue; } from = ts;
      const col = s.warn ? "#FF9C86" : "#A8E6BE";
      tw += `tl.to("#${id} .trk b",{scaleX:${s.n / 2},duration:0.6,ease:"expo.inOut"},${T(ts - 0.1)});\n`;
      tw += `tl.to("#${id} .n${s.n} .dot",{backgroundColor:"${col}",borderColor:"${col}",scale:1.12,duration:0.35,ease:"back.out(3)"},${T(ts)});tl.to("#${id} .n${s.n} .dot svg",{stroke:"#16161A",duration:0.2},${T(ts)});tl.to("#${id} .n${s.n} .nl",{opacity:1,duration:0.3},${T(ts)});\n`;
      if (s.tag) tw += `tl.set("#${id} .n${s.n} .tag",{textContent:${JSON.stringify(s.tag)},color:"${col}"},${T(ts)});tl.fromTo("#${id} .n${s.n} .tag",{opacity:0,y:-10},{opacity:1,y:0,duration:0.4,ease:"expo.out",immediateRender:false},${T(ts + 0.1)});\n`;
      cues.push({ kind: "tick", t: ts }); evs.push(ts);
    }
  } else if (p.type === "list") {
    html += `<div id="${id}" class="${cls} gl list"><div class="lt">${esc(p.title)}</div>${p.items.map((it, j) => `<div class="li l${j}">${ico(it.icon)}<span>${esc(it.text)}</span><i class="st"></i>${p.check ? `<i class="ck">${ico("check")}</i>` : ""}</div>`).join("")}</div>\n`;
    inn(`#${id}`, t); tw += `tl.set("#${id} .li",{opacity:0.2},${T(t)});\n`;
    let from = t0;
    p.items.forEach((it, j) => {
      const ts = Math.max(t + 0.25 + j * 0.2, (tOf(it.at, from) ?? t + 0.4 + j * 0.5) - 0.08); from = ts;
      tw += `tl.fromTo("#${id} .l${j}",{opacity:0.2,x:-20},{opacity:1,x:0,duration:0.45,ease:"expo.out",immediateRender:false},${T(ts)});\n`;
      cues.push({ kind: "tick", t: ts }); evs.push(ts);
    });
    if (p.strike) {
      const ts = tOf(p.strike, t0) ?? e - 1;
      p.items.forEach((_, j) => { tw += `tl.fromTo("#${id} .l${j} .st",{scaleX:0},{scaleX:1,duration:0.35,ease:"power2.inOut",immediateRender:false},${T(ts + j * 0.15)});tl.to("#${id} .l${j}",{opacity:0.45,duration:0.3},${T(ts + j * 0.15 + 0.2)});\n`; });
      evs.push(ts);
    }
  } else if (p.type === "stats") {
    html += `<div id="${id}" class="${cls} stats">${p.items.map((it, j) => `<div class="gl sb s${j}">${it.ring ? `<svg class="ring" viewBox="0 0 100 100"><circle cx="50" cy="50" r="44" stroke="rgba(255,255,255,.18)" stroke-width="5" fill="none"/><circle class="rg" cx="50" cy="50" r="44" stroke="#A8E6BE" stroke-width="5" fill="none" stroke-linecap="round" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="1" transform="rotate(-90 50 50)"/></svg>` : ""}<div class="sbig">${esc(it.big)}</div><div class="ssm">${esc(it.small)}</div></div>`).join("")}</div>\n`;
    tw += `tl.set("#${id}",{opacity:1},${T(t)});\n`;
    let from = t0;
    p.items.forEach((it, j) => {
      const ts = Math.max(t + j * 0.3, (tOf(it.at, from) ?? t + j) - 0.1); from = ts;
      inn(`#${id} .s${j}`, ts); tw += `tl.fromTo("#${id} .s${j} .sbig",{textContent:0},{textContent:${+it.big || 0},snap:{textContent:1},duration:0.6,ease:"power2.out",immediateRender:false},${T(ts + 0.05)});\n`;
      if (it.ring) tw += `tl.fromTo("#${id} .s${j} .rg",{attr:{"stroke-dashoffset":1}},{attr:{"stroke-dashoffset":0},duration:1.2,ease:"power2.inOut",immediateRender:false},${T(ts + 0.1)});\n`;
      cues.push({ kind: "pop", t: ts }); evs.push(ts);
    });
    e = Math.max(e, t + 3.2); slots[zone] = e;
    out(`#${id} .sb`, e - 0.35); e = null;
  } else if (p.type === "pattern") {
    const pts = [[30, 110], [95, 60], [160, 95], [225, 40], [290, 75], [350, 25]];
    html += `<div id="${id}" class="${cls} gl pat"><svg viewBox="0 0 380 140"><polyline points="${pts.map((q) => q.join(",")).join(" ")}" fill="none" stroke="#A8E6BE" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="1"/>${pts.map(([x, y]) => `<circle class="pd" cx="${x}" cy="${y}" r="9" fill="#fff"/>`).join("")}</svg><div class="pl">the <em>pattern</em></div></div>\n`;
    inn(`#${id}`, t);
    tw += `tl.fromTo("#${id} .pd",{scale:0,transformOrigin:"50% 50%"},{scale:1,duration:0.35,stagger:0.12,ease:"back.out(3)",immediateRender:false},${T(t + 0.2)});tl.fromTo("#${id} polyline",{attr:{"stroke-dashoffset":1}},{attr:{"stroke-dashoffset":0},duration:1.1,ease:"power2.inOut",immediateRender:false},${T(t + 0.7)});\n`;
  } else if (p.type === "circle") {
    html += `<svg id="${id}" class="pop circ" style="left:${p.x - p.r - 20}px;top:${p.y - p.r * 0.7 - 20}px;width:${p.r * 2 + 40}px;height:${p.r * 1.4 + 40}px" viewBox="0 0 ${p.r * 2 + 40} ${p.r * 1.4 + 40}"><ellipse cx="${p.r + 20}" cy="${p.r * 0.7 + 20}" rx="${p.r}" ry="${p.r * 0.7}" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="1" transform="rotate(-8 ${p.r + 20} ${p.r * 0.7 + 20})"/></svg>
<div id="${id}l" class="pop gl chip sm" style="left:${Math.max(40, p.x + p.r * 0.6)}px;top:${p.y - p.r * 0.7 - 175}px">${esc(p.label)}</div>\n`;
    tw += `tl.set("#${id}",{opacity:1},${T(t)});tl.fromTo("#${id} ellipse",{attr:{"stroke-dashoffset":1}},{attr:{"stroke-dashoffset":0},duration:0.7,ease:"power2.inOut",immediateRender:false},${T(t)});\n`;
    inn(`#${id}l`, t + 0.3); out(`#${id},#${id}l`, e - 0.35); e = null;
  } else if (p.type === "cta") {
    html += `<div id="${id}" class="${cls}"><div class="gl btn"><span>${esc(p.text)}</span>${ico("arrow", "ic ar")}<div class="hand">${HAND}</div></div><div class="csub">${esc(p.sub || "")}</div><svg class="down" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v15M6 13l6 6 6-6"/></svg></div>\n`;
    tw += `tl.set("#${id}",{opacity:1},${T(t)});\n`; inn(`#${id} .btn`, t); tw += `tl.fromTo("#${id} .csub",{opacity:0},{opacity:1,duration:0.4,immediateRender:false},${T(t + 0.4)});tl.fromTo("#${id} .down",{opacity:0,y:-10},{opacity:1,y:0,duration:0.4,immediateRender:false},${T(t + 0.6)});tl.to("#${id} .down",{y:16,duration:0.5,yoyo:true,repeat:${Math.max(1, Math.floor((TOTAL - t - 1) / 0.5))},ease:"sine.inOut"},${T(t + 1)});\n`;
    const tp = t + 1.0;
    tw += `tl.fromTo("#${id} .hand",{x:140,y:150,opacity:0},{x:0,y:0,opacity:1,duration:0.6,ease:"expo.out",immediateRender:false},${T(tp - 0.6)});\n`;
    for (let r = tp; r < TOTAL - 0.5; r += 1.5) { tw += `tl.to("#${id} .hand",{scale:0.84,duration:0.12,yoyo:true,repeat:1},${T(r)});tl.to("#${id} .btn",{scale:0.95,duration:0.12,yoyo:true,repeat:1},${T(r)});tl.fromTo("#${id} .btn",{boxShadow:"0 0 0 0 rgba(168,230,190,.7)"},{boxShadow:"0 0 0 26px rgba(168,230,190,0)",duration:0.8,immediateRender:false},${T(r + 0.1)});\n`; cues.push({ kind: "tick", t: r }); }
    tw += `tl.fromTo("#${id} .ar",{x:0},{x:10,duration:0.45,yoyo:true,repeat:${Math.max(1, Math.floor((TOTAL - t) / 0.45))},ease:"sine.inOut",immediateRender:false},${T(t + 0.6)});\n`;
    e = null;
  } else if (p.type === "letters") { // tiles light up as each letter is spoken
    html += `<div id="${id}" class="${cls} gl lets"><div class="lt">${esc(p.title || "")}</div><div class="lg">${p.letters.map((c, j) => `<b class="lx x${j}">${c}</b>`).join("")}</div></div>\n`;
    inn(`#${id}`, t); let from = t0 - 0.2;
    p.letters.forEach((c, j) => { const ts = tOf(c, from) ?? t + 0.3 + j * 0.35; from = ts;
      tw += `tl.to("#${id} .x${j}",{backgroundColor:"#A8E6BE",color:"#16161A",scale:1.12,duration:0.25,ease:"back.out(3)"},${T(ts)});tl.to("#${id} .x${j}",{scale:1,duration:0.3},${T(ts + 0.25)});\n`; evs.push(ts); });
  } else if (p.type === "comment") { // comment bar typing the keyword (default: the word spoken after p.at), finger taps Post
    if (!p.text) { const i0 = words.findIndex((w) => w.start === t0); p.text = (words[i0 + p.at.split(" ").length]?.text || "222").replace(/[.,!?;:]+$/, ""); }
    html += `<div id="${id}" class="${cls} gl cbar"><img src="assets/pfp.jpg"><div class="cin"><span class="ph">Add a comment…</span><span class="typed"></span><span class="caret"></span></div><div class="post">Post</div><div class="hand">${HAND}</div></div>\n`;
    inn(`#${id}`, t); const t1 = t + 0.5, step = Math.min(0.14, 0.9 / p.text.length);
    tw += `tl.to("#${id} .ph",{opacity:0,duration:0.15},${T(t1 - 0.1)});\n`;
    [...p.text].forEach((_, j) => { tw += `tl.set("#${id} .typed",{textContent:${JSON.stringify(p.text.slice(0, j + 1))}},${T(t1 + j * step)});\n`; });
    const tp = t1 + p.text.length * step + 0.35;
    tw += `tl.fromTo("#${id} .caret",{opacity:1},{opacity:0,duration:0.3,repeat:${Math.ceil((e - t) / 0.6)},yoyo:true,ease:"steps(1)",immediateRender:false},${T(t)});\n`;
    tw += `tl.fromTo("#${id} .hand",{x:120,y:140,opacity:0},{x:0,y:0,opacity:1,duration:0.5,ease:"expo.out",immediateRender:false},${T(tp - 0.5)});tl.to("#${id} .hand",{scale:0.84,duration:0.12,yoyo:true,repeat:1},${T(tp)});tl.to("#${id} .post",{color:"#A8E6BE",scale:1.15,duration:0.2,yoyo:true,repeat:1},${T(tp + 0.05)});\n`;
    cues.push({ kind: "tick", t: tp });
  } else if (p.type === "stories") { // profile pic with a spinning story ring, tap, arrow down-left to Instagram's own profile pic
    const fin = !p.end && !p.dur; if (fin) e = TOTAL;
    html += `<div id="${id}" class="${cls} gl sto"><div class="pf"><div class="sring"></div><img src="assets/pfp.jpg"><div class="ripple"></div><div class="badge">NEW</div></div><div><div class="ct">${fmt(p.title || "Tap my *profile picture*")}</div><div class="cs">${fmt(p.sub || "the reading is in my stories")}</div></div><div class="hand">${HAND}</div></div>
<svg id="${id}a" class="pop parr" viewBox="0 0 400 420" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"><path d="M360 20C300 160 170 230 60 360" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="1"/><path class="hd" d="M40 300L58 364L122 350"/></svg>\n`;
    inn(`#${id}`, t); const tp = t + 0.9;
    tw += `tl.fromTo("#${id} .sring",{rotation:0},{rotation:${Math.round((e - t) * 90)},duration:${T(e - t)},ease:"none",immediateRender:false},${T(t)});tl.fromTo("#${id} .badge",{scale:0},{scale:1,duration:0.4,ease:"back.out(3)",immediateRender:false},${T(t + 0.5)});\n`;
    tw += `tl.fromTo("#${id} .hand",{x:120,y:120,opacity:0},{x:0,y:0,opacity:1,duration:0.5,ease:"expo.out",immediateRender:false},${T(tp - 0.5)});\n`;
    for (let r = tp; r < e - 0.6; r += 1.5) tw += `tl.to("#${id} .hand",{scale:0.84,duration:0.12,yoyo:true,repeat:1},${T(r)});tl.fromTo("#${id} .ripple",{scale:0.7,opacity:0.9},{scale:1.7,opacity:0,duration:0.8,ease:"power2.out",immediateRender:false},${T(r + 0.1)});\n`;
    tw += `tl.set("#${id}a",{opacity:1},${T(t + 0.6)});tl.fromTo("#${id}a path",{attr:{"stroke-dashoffset":1}},{attr:{"stroke-dashoffset":0},duration:0.8,ease:"power2.inOut",immediateRender:false},${T(t + 0.6)});tl.fromTo("#${id}a .hd",{opacity:0},{opacity:1,duration:0.2,immediateRender:false},${T(t + 1.3)});tl.to("#${id}a",{x:-14,y:14,duration:0.5,yoyo:true,repeat:${Math.max(1, Math.floor((e - t - 1.6) / 0.5))},ease:"sine.inOut"},${T(t + 1.5)});\n`;
    cues.push({ kind: "tick", t: tp });
    if (!fin) out(`#${id}a`, e - 0.35);
    if (fin) e = null;
  }
  if (p.type === "list" && p.check) p.items.forEach((_, j) => { tw += `tl.fromTo("#${id} .l${j} .ck",{scale:0,opacity:0},{scale:1,opacity:1,duration:0.4,ease:"back.out(3)",immediateRender:false},${T(Math.max(t + 0.5 + j * 0.2, (tOf(p.items[j].at, t0) ?? t) + 0.35))});\n`; });
  if (e != null) out(`#${id}`, e - 0.35);
});
{ const ev = [...new Set(evs.concat(TOTAL))].sort((a, b) => a - b);
  ev.slice(1).forEach((x, i) => { if (x - ev[i] > 5) console.log(`GAP ${ev[i].toFixed(1)}-${x.toFixed(1)}: "${words.filter((w) => w.start > ev[i] && w.start < x).map((w) => w.text).join(" ")}"`); }); }

// headline: readable at frame 0 (only a tiny settle), gone at HEADT
const head = S.head.map((ln) => `<div class="hl${ln.startsWith("*") ? " ser" : ""}">${esc(ln.replace(/\*/g, ""))}</div>`).join("");
tw += `tl.fromTo("#head",{scale:1.04},{scale:1,duration:0.6,ease:"expo.out"},0);tl.fromTo("#head .ser",{opacity:0.0,y:10},{opacity:1,y:0,duration:0.3,ease:"expo.out"},0);\n`;
tw += `tl.fromTo("#hul",{scaleX:0},{scaleX:1,duration:0.7,ease:"expo.inOut"},0.25);tl.to("#head,#hshade",{opacity:0,y:-30,filter:"blur(10px)",duration:0.45,ease:"power2.in"},${T(HEADT - 0.45)});\n`;

// ---------- captions: Editorial serif (white Inter + key word in white serif italic), word blur-up ----------
const ACC = new Set((S.accent || []).map(norm));
const groups = []; let g = [];
words.forEach((w, i) => { g.push(w); const nx = words[i + 1]; const len = g.map((x) => x.text).join(" ").length; if (/[.,?!]$/.test(w.text) || g.length >= 4 || len > 19 || !nx || nx.start - w.end > 0.3) { groups.push(g); g = []; } });
const caps = groups.map((gr, i, arr) => {
  const st = gr[0].start - 0.05, nx = arr[i + 1] ? arr[i + 1][0].start - 0.05 : TOTAL, en = Math.min(nx, gr.at(-1).end + 0.6);
  return { id: `c${i}`, st, dur: en - st, ws: gr.map((w, j) => ({ id: `c${i}w${j}`, t: w.start, txt: esc(w.text.replace(/[.,!;:]+$/, "")), acc: ACC.has(norm(w.text)) })) };
}).filter((c) => c.dur > 0.1);
fs.writeFileSync(P + "/compositions/caps.html", `<template>
<style>#root{position:absolute;inset:0;} .cg{position:absolute;left:0;top:${S.capTop ?? 1385}px;width:1080px;padding:0 60px;text-align:center;}
.cw{display:inline-block;margin:0 .13em;font:600 64px Inter;letter-spacing:-.01em;color:#fff;text-shadow:0 3px 18px rgba(0,0,0,.6),0 0 3px rgba(0,0,0,.45);}
.cw.a{font:italic 400 94px 'Instrument Serif';letter-spacing:0;}</style>
<div id="root" data-composition-id="caps" data-width="1080" data-height="1920">
${caps.map((c) => `<div id="${c.id}" class="clip cg" data-start="${T(c.st)}" data-duration="${T(c.dur)}">${c.ws.map((w) => `<span class="cw${w.acc ? " a" : ""}" id="${w.id}">${w.txt}</span>`).join("")}</div>`).join("\n")}
</div><script>const tl = gsap.timeline({ paused: true });
${caps.map((c) => c.ws.map((w) => `tl.fromTo("#${w.id}",{opacity:0,y:24,filter:"blur(10px)"},{opacity:1,y:0,filter:"blur(0px)",duration:0.4,ease:"expo.out"},${T(Math.max(c.st, w.t - 0.04))});`).join("")).join("\n")}
tl.set({}, {}, ${TOTAL}); window.__timelines["caps"] = tl;</script></template>`);

// ---------- audio: voice + music bed + soft pops/ticks ----------
ff(["-hide_banner", "-y", "-i", BODY, "-vn", "-ac", "1", "-ar", "48000", P + "/assets/voice.wav"]);
const getI = (txt) => { const m = txt.match(/"input_i"\s*:\s*"(-?[\d.]+)"/); return m ? +m[1] : null; };
const voI = getI(ff(["-hide_banner", "-i", P + "/assets/voice.wav", "-af", "loudnorm=print_format=json", "-f", "null", "-"]));
const muI = getI(ff(["-hide_banner", "-ss", String(S.musicStart ?? 0), "-t", String(TOTAL + 1), "-i", MUSIC, "-af", "loudnorm=print_format=json", "-f", "null", "-"]));
const loops = Math.max(0, Math.ceil((TOTAL + 1 + (S.musicStart ?? 0)) / ffp(MUSIC)) - 1);
ff(["-hide_banner", "-y", "-stream_loop", String(loops), "-ss", String(S.musicStart ?? 0), "-i", MUSIC, "-t", String(TOTAL + 0.5), "-af", `volume=${(voI - (S.musicDb ?? 18) - muI).toFixed(2)}dB,afade=t=in:d=0.6,afade=t=out:st=${(TOTAL - 1.8).toFixed(2)}:d=1.8`, "-ar", "48000", "-ac", "2", P + "/assets/music.wav"]);
const KIT = { pop: [0.0, -19.1, -19], tick: [0.002, -17.4, -21] };
const audio = cues.sort((a, b) => a.t - b.t).map((c, i) => { const [pk, mm, rel] = KIT[c.kind]; fs.copyFileSync(LK + c.kind + ".wav", P + `/assets/k_${c.kind}.wav`); return `<audio id="fx${i}" class="clip" src="assets/k_${c.kind}.wav" data-start="${T(Math.max(0, c.t - pk))}" data-duration="1.2" data-track-index="${7 + (i % 3)}" data-volume="${Math.min(1, Math.pow(10, (voI + rel - mm) / 20)).toFixed(3)}"></audio>`; });

const css = `*{margin:0;padding:0;box-sizing:border-box;}
html,body{width:1080px;height:1920px;overflow:hidden;background:#000;}
#body{position:absolute;left:0;top:0;width:1080px;height:1920px;object-fit:cover;}
#shade{position:absolute;left:0;right:0;bottom:0;height:720px;background:linear-gradient(180deg,transparent,rgba(0,0,0,.42));}
#hshade{position:absolute;left:0;top:0;width:1080px;height:620px;background:radial-gradient(ellipse 90% 75% at 50% 15%,rgba(0,0,0,.55),rgba(0,0,0,.2) 60%,rgba(0,0,0,0));}
#head{position:absolute;left:0;top:${S.headTop ?? 175}px;width:1080px;text-align:center;}
.hl{font:800 92px Inter;letter-spacing:-.035em;line-height:1.02;color:#fff;text-shadow:0 4px 30px rgba(0,0,0,.45);}
.hl.ser{font:italic 400 112px 'Instrument Serif';letter-spacing:-.005em;color:#fff;margin-top:2px;}
#hul{width:170px;height:4px;margin:20px auto 0;border-radius:2px;background:#A8E6BE;box-shadow:0 0 18px rgba(168,230,190,.8);}
.pop{position:absolute;opacity:0;}
.gl{background:rgba(18,18,22,.46);backdrop-filter:blur(22px) saturate(150%);-webkit-backdrop-filter:blur(22px) saturate(150%);border:1.5px solid rgba(255,255,255,.28);box-shadow:0 18px 50px rgba(0,0,0,.28),inset 0 1px 0 rgba(255,255,255,.18);color:#fff;font-family:Inter;}
.tl{left:56px;top:150px;transform-origin:0 0;} .tr{right:56px;top:150px;transform-origin:100% 0;} .ml{left:56px;top:900px;transform-origin:0 50%;}
.top{left:90px;top:140px;width:900px;transform-origin:50% 0;} .cta{left:0;width:1080px;top:1080px;display:flex;flex-direction:column;align-items:center;}
.chip{display:flex;align-items:center;gap:16px;padding:20px 30px 20px 22px;border-radius:999px;font-weight:700;font-size:40px;letter-spacing:-.01em;white-space:nowrap;}
.chip .ic{width:54px;height:54px;padding:10px;border-radius:50%;background:rgba(255,255,255,.14);} .chip.sm{font-size:32px;padding:12px 24px;font-weight:600;}
.chip em,.qt em,.pl em,.ct em{font-family:'Instrument Serif';font-style:italic;font-weight:400;font-size:1.25em;letter-spacing:0;}
.card{display:flex;align-items:center;gap:24px;padding:26px 36px 26px 26px;border-radius:34px;}
.cic{width:96px;height:96px;border-radius:26px;background:#A8E6BE;display:flex;align-items:center;justify-content:center;} .cic svg{width:60px;height:60px;stroke:#16161A;}
.ct{font:italic 400 64px 'Instrument Serif';line-height:1;} .cs{font-weight:500;font-size:32px;color:rgba(255,255,255,.75);margin-top:6px;}
.qcard{width:900px;padding:40px 50px 44px;border-radius:40px;text-align:center;} .qm{width:82px;height:82px;margin:0 auto 14px;border-radius:50%;background:#A8E6BE;color:#16161A;font:800 56px/82px Inter;}
.qt{font-weight:700;font-size:62px;line-height:1.08;letter-spacing:-.025em;}
.day{display:flex;justify-content:space-between;padding:30px 60px 26px;border-radius:40px;}
.trk{position:absolute;left:150px;right:150px;top:72px;height:4px;border-radius:2px;background:rgba(255,255,255,.22);} .trk b{position:absolute;inset:0;background:linear-gradient(90deg,#A8E6BE,#FF9C86);border-radius:2px;transform-origin:0 50%;transform:scaleX(0);}
.nd{position:relative;width:180px;display:flex;flex-direction:column;align-items:center;} .dot{width:84px;height:84px;border-radius:50%;border:2px solid rgba(255,255,255,.55);background:rgba(18,18,22,.6);display:flex;align-items:center;justify-content:center;} .dot svg{width:44px;height:44px;}
.nl{font-weight:700;font-size:32px;margin-top:12px;opacity:.6;} .tag{font:italic 400 40px 'Instrument Serif';height:44px;margin-top:2px;opacity:0;white-space:nowrap;}
.list{padding:30px 40px 34px 34px;border-radius:36px;min-width:560px;} .lt{font-weight:700;font-size:26px;letter-spacing:.24em;color:#A8E6BE;margin-bottom:14px;}
.li{position:relative;display:flex;align-items:center;gap:18px;font-weight:600;font-size:42px;padding:10px 0;} .li .ic{width:46px;height:46px;flex:none;}
.li .st{position:absolute;left:58px;right:-6px;top:50%;height:4px;border-radius:2px;background:#FF9C86;transform-origin:0 50%;transform:scaleX(0);}
.stats{display:flex;justify-content:center;gap:28px;opacity:0;} .sb{position:relative;width:300px;height:300px;border-radius:44px;display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:0;}
.sbig{font:800 150px/1 Inter;letter-spacing:-.05em;} .ssm{font:italic 400 52px 'Instrument Serif';margin-top:4px;} .ring{position:absolute;left:20px;top:20px;width:260px;height:260px;}
.pat{padding:26px 30px 22px;border-radius:36px;} .pat svg{width:380px;height:140px;display:block;overflow:visible;} .pl{font-weight:700;font-size:38px;text-align:center;margin-top:8px;}
.circ{overflow:visible;filter:drop-shadow(0 0 10px rgba(0,0,0,.4));}
.btn{position:relative;display:flex;align-items:center;gap:20px;padding:30px 50px;border-radius:999px;font-weight:800;font-size:54px;letter-spacing:-.02em;background:rgba(18,18,22,.55);border:2px solid #A8E6BE;}
.btn .ar{width:52px;height:52px;stroke:#A8E6BE;} .csub{font:italic 400 44px 'Instrument Serif';color:#fff;margin-top:16px;text-shadow:0 3px 14px rgba(0,0,0,.6);}
.down{width:80px;height:80px;margin-top:6px;filter:drop-shadow(0 4px 10px rgba(0,0,0,.5));}
.hand{position:absolute;right:-40px;top:60px;width:130px;height:130px;filter:drop-shadow(0 10px 20px rgba(0,0,0,.45));opacity:0;transform-origin:30% 10%;} .hand svg{width:100%;height:100%;}
.li .ck{display:flex;margin-left:auto;padding-left:22px;opacity:0;} .li .ck svg{width:44px;height:44px;padding:7px;border-radius:50%;background:#A8E6BE;stroke:#16161A;stroke-width:3;}
.lets{padding:28px 34px 34px;border-radius:38px;text-align:center;} .lets .lt{margin-bottom:18px;} .lg{display:flex;flex-wrap:wrap;justify-content:center;gap:14px;} .lx{width:104px;height:104px;border-radius:26px;background:rgba(255,255,255,.12);border:1.5px solid rgba(255,255,255,.3);font:800 60px/104px Inter;color:#fff;}
.cbar{display:flex;align-items:center;gap:22px;width:900px;padding:20px 30px 20px 20px;border-radius:999px;} .cbar img{width:86px;height:86px;border-radius:50%;object-fit:cover;flex:none;}
.cin{flex:1;position:relative;display:flex;align-items:center;height:70px;font-weight:800;font-size:54px;} .ph{position:absolute;left:0;font-weight:500;font-size:44px;color:rgba(255,255,255,.55);} .caret{display:inline-block;width:4px;height:56px;background:#A8E6BE;margin-left:6px;}
.post{font-weight:800;font-size:42px;color:#7FB2FF;flex:none;} .cbar .hand{right:-20px;top:56px;}
.sto{display:flex;align-items:center;gap:30px;padding:28px 44px 28px 28px;border-radius:44px;} .sto .ct{font-size:58px;} .sto .ct em{font-size:1em;}
.pf{position:relative;width:190px;height:190px;flex:none;} .sring{position:absolute;inset:0;border-radius:50%;background:conic-gradient(#F9CE34,#EE2A7B,#6228D7,#F9CE34);}
.pf img{position:absolute;inset:9px;width:172px;height:172px;border-radius:50%;object-fit:cover;border:7px solid #141418;} .ripple{position:absolute;inset:0;border-radius:50%;border:5px solid #fff;opacity:0;}
.badge{position:absolute;left:50%;bottom:-14px;margin-left:-52px;width:104px;padding:5px 0;border-radius:12px;background:linear-gradient(90deg,#EE2A7B,#6228D7);font:900 24px Inter;letter-spacing:.12em;color:#fff;text-align:center;border:4px solid #141418;}
.sto .hand{left:120px;right:auto;top:110px;} .parr{left:70px;top:1270px;width:330px;height:350px;overflow:visible;filter:drop-shadow(0 4px 12px rgba(0,0,0,.55));}
.bot{left:90px;width:900px;top:1060px;transform-origin:50% 100%;}`;
fs.writeFileSync(P + "/index.html", `<!doctype html>
<html lang="en"><head><meta charset="UTF-8" /><meta name="viewport" content="width=1080, height=1920" />
<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Inter:wght@500;600;700;800&family=Instrument+Serif:ital@0;1&display=block" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js"></script>
<style>${css}</style></head><body>
<div id="root" data-composition-id="main" data-start="0" data-duration="${TOTAL}" data-width="1080" data-height="1920">
<video id="body" class="clip" src="assets/body.mp4" data-start="0" data-duration="${TOTAL}" data-media-start="0" data-track-index="1" muted playsinline></video>
<div id="shade"></div><div id="hshade"></div><div id="head">${head}<div id="hul"></div></div>
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
console.log(`${SLUG}: cut ${(rawLen - acc).toFixed(1)}s of ${rawLen.toFixed(1)}s, total ${TOTAL}s, pops ${S.pops.length}, caps ${caps.length}`);
if (RENDER) {
  const o = `${P}-render.mp4`;
  const r = spawnSync("npx", ["hyperframes@0.9.67", "render", "--workers", "5", "--fps", "30", "--crf", "20", "-o", `"${o}"`], { cwd: P, env, encoding: "utf8", shell: true, maxBuffer: 1 << 26 });
  if (r.status !== 0) throw new Error("render failed: " + (r.stderr || r.stdout).slice(-800));
  fs.mkdirSync(OUTDIR, { recursive: true });
  let name = NAME, k = 2; while (fs.existsSync(`${OUTDIR}/${name}.mp4`)) name = `${NAME} ${k++}`;
  ff(["-hide_banner", "-y", "-i", o, "-c:v", "copy", "-af", "loudnorm=I=-15:TP=-1.5:LRA=11", "-ar", "48000", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", `${OUTDIR}/${name}.mp4`]);
  fs.rmSync(o, { force: true }); fs.rmSync(BODY, { force: true }); fs.rmSync(P + "/.hyperframes", { recursive: true, force: true });
  console.log("delivered " + `${OUTDIR}/${name}.mp4`);
}

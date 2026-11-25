// Split-panel talking-head edit: hook b-roll, then the face cam pushed down under an animated line-art panel.
// usage: node tools/split.mjs isaiah|grant|selena|marva
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { Scene, C, rng, figure, cardBack } from "./lib.mjs";
import { locate } from "./media.mjs";

const MUS = "C:/Users/Vinicius/Music/Songs Auraly UGC/";
const AV = {
  isaiah: { music: "Stargazing.mp3" }, grant: { music: "Aglow.mp3" },
  selena: { music: "Snowfall.mp3" }, marva: { music: "a distant memory.m4a" },
};
const ROT = ["Stargazing.mp3", "Aglow.mp3", "Snowfall.mp3", "a distant memory.m4a", "Grounded.mp3", "MORNING LIGHTT.MP3"];
const key = process.argv[2], A = AV[key] || { music: ROT[[...key].reduce((h, c) => h + c.charCodeAt(0), 0) % ROT.length] };
const BASE = "M:/Google/hyperframes/Midnight-Studio/auraly-split", SRC = BASE + "/src", P = path.join(BASE, key);
const HOOK = locate("hook", key), RAW = locate("body", key);
const PH = 560, PUSH = 300;          // panel height; face moves down this much (the panel hides the headroom)
const VO = 4.5, HOOKEND = 6.0;       // voice starts under the last hook shot (J cut); picture cuts at 6 s
const CAPY = 1405;                   // caption band top (~73 %, under the chin when pushed)
const ff = (args) => { const r = spawnSync("ffmpeg", args, { encoding: "utf8" }); return (r.stderr || "") + (r.stdout || ""); };
const ffp = (f) => +spawnSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f], { encoding: "utf8" }).stdout.trim();

// ---------- silence cut: every pause longer than ~0.3 s is shortened to 0.24 s (0.12 s kept each side) ----------
const sil = [...ff(["-hide_banner", "-i", RAW, "-af", "silencedetect=noise=-40dB:d=0.3", "-f", "null", "-"]).matchAll(/silence_(start|end): ([\d.]+)/g)].map((m) => +m[2]);
const rawLen = ffp(RAW), PAD = 0.12, keep = [];
let cur = 0;
for (let i = 0; i + 1 < sil.length; i += 2) {
  const [a, b] = [sil[i], sil[i + 1]];
  const cs = a < 0.05 ? 0 : a + PAD, ce = b > rawLen - 0.05 ? rawLen : b - PAD;
  if (ce - cs < 0.15) continue;
  if (cs > cur) keep.push([cur, cs]);
  cur = ce;
}
if (sil.length % 2) { const a = sil.at(-1); if (a + PAD > cur) { keep.push([cur, a + PAD]); cur = rawLen; } } // trailing silence never ends
if (cur < rawLen - 0.05) keep.push([cur, rawLen]);
const offs = []; let acc = 0; for (const [a, b] of keep) { offs.push(acc); acc += b - a; }
const mapT = (t) => { for (let i = keep.length - 1; i >= 0; i--) if (t >= keep[i][0]) return offs[i] + Math.min(t, keep[i][1]) - keep[i][0]; return 0; };
const CUTS = offs.slice(1); // cut points in body time
const BODY = path.join(SRC, key + "_cut.mp4");
if (!fs.existsSync(BODY) || fs.statSync(BODY).mtimeMs < fs.statSync(RAW).mtimeMs) {
  const fc = keep.map(([a, b], i) => `[0:v]trim=${a.toFixed(3)}:${b.toFixed(3)},setpts=PTS-STARTPTS[v${i}];[0:a]atrim=${a.toFixed(3)}:${b.toFixed(3)},asetpts=PTS-STARTPTS[a${i}];`).join("") + keep.map((_, i) => `[v${i}][a${i}]`).join("") + `concat=n=${keep.length}:v=1:a=1[v][a]`;
  ff(["-hide_banner", "-y", "-i", RAW, "-filter_complex", fc, "-map", "[v]", "-map", "[a]", "-c:v", "h264_nvenc", "-preset", "p5", "-rc", "vbr", "-cq", "19", "-b:v", "0", "-c:a", "aac", "-b:a", "192k", BODY]);
}
console.log(`${key}: cut ${(rawLen - acc).toFixed(1)} s of silence in ${keep.length - 1} cuts (${rawLen.toFixed(1)} -> ${acc.toFixed(1)} s)`);
const words = JSON.parse(fs.readFileSync(`${SRC}/t_${key}_body/transcript.json`)).map((w) => ({ ...w, start: +mapT(w.start).toFixed(3), end: +mapT(w.end).toFixed(3) }));
const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
const W = words.map((w) => norm(w.text));
// global time of the first occurrence of a phrase (after `after` seconds of body time)
const at = (phrase, after = 0) => {
  const p = phrase.split(" ").map(norm);
  for (let i = 0; i < W.length; i++) if (words[i].start >= after && p.every((x, j) => W[i + j] === x)) return +(VO + words[i].start).toFixed(3);
  throw new Error(`${key}: phrase "${phrase}" not found`);
};
const bodyLen = ffp(BODY);
const TOTAL = +Math.min(VO + bodyLen, VO + words.at(-1).end + 1.4).toFixed(3);

// ---------- panel art ----------
const spark = (S, x, y, s, t, col = C.gold) => S.path(`M${x},${y - s} Q${x},${y} ${x + s},${y} Q${x},${y} ${x},${y + s} Q${x},${y} ${x - s},${y} Q${x},${y} ${x},${y - s}Z`, { color: col, w: 2, t, dur: 0.4, fill: col });
const sparkles = (S, seed, t, n = 7) => { const r = rng(seed); for (let i = 0; i < n; i++) { const x = 90 + r() * 900, y = 50 + r() * 330; if (Math.abs(x - 540) < 230 && y > 90) continue; spark(S, +x.toFixed(0), +y.toFixed(0), 6 + r() * 9, t + r() * 0.8); } };
const label = (S, txt, t) => S.text(540, 515, txt, { font: "Montserrat", weight: 800, size: 44, ls: 0.02, t });
const rrect = (x, y, w, h, r) => `M${x + r},${y} H${x + w - r} Q${x + w},${y} ${x + w},${y + r} V${y + h - r} Q${x + w},${y + h} ${x + w - r},${y + h} H${x + r} Q${x},${y + h} ${x},${y + h - r} V${y + r} Q${x},${y} ${x + r},${y}Z`;
const circ = (cx, cy, r) => `M${cx},${cy - r} a${r},${r} 0 1,1 -0.1,0`;
const phone = (S, cx, t) => { S.path(rrect(cx - 105, 40, 210, 400, 30), { t, dur: 0.7 }); S.path(`M${cx - 30},60 H${cx + 30}`, { t: t + 0.3, w: 2, op: 0.6 }); };
const seals = (S, k, t) => [140, 250, 360].forEach((y, i) => {
  S.path(circ(780, y, 40), { color: i < k ? C.gold : C.dim, w: 3, t: i < k ? 0 : t, dur: 0.5 });
  S.text(780, y + 13, String(i + 1), { font: "League Gothic", size: 40, color: i < k ? C.gold : C.dim });
});
const sealOn = (S, k, t) => { S.path(circ(780, [140, 250, 360][k], 40), { color: C.gold, w: 4, t, dur: 0.5 }); spark(S, 830, [140, 250, 360][k] - 40, 12, t + 0.3); S.sfx("bell" + (k + 1), t); };

const ART = {
  shh(S, t) {
    figure(S, { cx: 540, cy: 265, scale: 0.5, t });
    S.path(`M566,250 Q600,190 548,140`, { t: t + 0.6, w: 3 });   // finger to the lips
    S.path(`M610,120 q22,6 30,-12 M622,150 q26,0 36,-16`, { t: t + 0.9, color: C.gold, w: 2.5 });
    sparkles(S, 11, t + 0.4); label(S, "KEEP IT TO YOURSELF", t + 0.2);
  },
  tellNo(S, t) {
    [270, 540, 810].forEach((x, i) => { figure(S, { cx: x, cy: 255, scale: 0.32, t: t + i * 0.15 }); S.text(x, 395, ["SISTER", "BEST FRIEND", "ANYONE"][i], { size: 28, color: C.dim }); });
    ["sister", "friend", "anyone"].forEach((w, i) => { const x = [270, 540, 810][i], tt = S.w(w); S.path(`M${x - 70},150 L${x + 70},340 M${x + 70},150 L${x - 70},340`, { color: C.coral, w: 6, t: tt, dur: 0.3 }); S.sfx("pop", tt); });
    label(S, "DO NOT TELL ANYONE", t + 0.2);
  },
  sunrise(S, t) {
    S.path(`M120,350 H960`, { t, dur: 0.6 });
    S.path(`M430,350 A110,110 0 0,1 650,350`, { color: C.gold, w: 4, t: t + 0.3, dur: 0.8 });
    let r = ""; for (let i = 0; i < 9; i++) { const a = Math.PI + (i + 0.5) * Math.PI / 9; r += `M${(540 + Math.cos(a) * 140).toFixed(0)},${(350 + Math.sin(a) * 140).toFixed(0)} L${(540 + Math.cos(a) * 215).toFixed(0)},${(350 + Math.sin(a) * 215).toFixed(0)} `; }
    S.path(r, { color: C.gold, w: 3, t: t + 0.7, dur: 0.6 });
    S.path(`M120,395 Q330,370 540,395 T960,395`, { t: t + 0.5, w: 2, op: 0.6 });
    S.sfx("hit", t + 0.3); sparkles(S, 21, t + 0.6); label(S, "THE MOST IMPORTANT DAY", t + 0.3);
  },
  skip(S, t) {
    S.path(rrect(330, 80, 420, 260, 22), { t, dur: 0.6 });
    S.path(`M505,160 L600,210 L505,260Z`, { color: C.gold, w: 4, t: t + 0.3, dur: 0.5 });
    S.path(`M800,170 L840,210 L800,250 M840,170 L880,210 L840,250 M890,165 V255`, { color: C.dim, w: 4, t: t + 0.5, dur: 0.4 });
    const tt = S.w("skip"); S.path(`${circ(845, 210, 62)} M802,253 L888,167`, { color: C.coral, w: 6, t: tt, dur: 0.4 }); S.sfx("hit", tt);
    label(S, "DON'T SKIP THIS VIDEO", t + 0.2);
  },
  calendar(S, t) {
    [[400, "20"], [680, "21"]].forEach(([x, d], i) => {
      S.path(rrect(x - 110, 70, 220, 280, 18), { t: t + i * 0.15, dur: 0.6 });
      S.path(`M${x - 110},130 H${x + 110}`, { t: t + 0.2 + i * 0.15, w: 2 });
      S.path(`M${x - 50},55 V85 M${x + 50},55 V85`, { t: t + 0.3, w: 4 });
      S.text(x, 115, "NOV", { size: 34, color: C.dim, weight: 600 });
      S.text(x, 300, d, { font: "League Gothic", size: 170, color: C.ink, t: t + 0.4 + i * 0.15 });
    });
    S.path(`M400,90 C200,95 230,350 400,360 C560,370 600,110 400,90 M680,90 C860,95 850,350 680,360 C520,365 500,110 690,92`, { color: C.gold, w: 4, t: t + 1.0, dur: 0.9 });
    sparkles(S, 31, t + 0.8); label(S, "NOT EVERYONE WILL SEE THIS", t + 0.2);
  },
  wealth(S, t) {
    S.path(`M300,380 H780 M300,380 V80`, { t, dur: 0.6, w: 2.5 });
    [90, 140, 200, 250, 300].forEach((h, i) => { const x = 330 + i * 84; S.path(rrect(x, 380 - h, 56, h, 6), { color: i === 4 ? C.gold : C.ink, t: t + 0.3 + i * 0.12, dur: 0.5 }); });
    S.path(`M320,300 L420,250 L500,270 L600,170 L720,90 M680,88 L722,88 L722,128`, { color: C.gold, w: 5, t: t + 0.9, dur: 0.8 });
    [0, 1, 2, 3].forEach((i) => S.path(`M810,${360 - i * 26} a52,14 0 1,0 104,0 a52,14 0 1,0 -104,0 M810,${360 - i * 26} v14 M914,${360 - i * 26} v14`, { color: C.gold, w: 3, t: t + 1.1 + i * 0.12, dur: 0.4 }));
    S.sfx("hit", t + 0.9); sparkles(S, 41, t + 1); label(S, "WEALTH & PROSPERITY", t + 0.2);
  },
  angel(S, t) {
    S.path(`M520,170 C420,60 250,70 190,150 C260,150 300,170 330,200 C270,205 240,230 220,270 C300,250 360,260 420,290 C450,250 490,220 520,215`, { color: C.lilac, t: t + 0.3, dur: 1.0 });
    S.path(`M560,170 C660,60 830,70 890,150 C820,150 780,170 750,200 C810,205 840,230 860,270 C780,250 720,260 660,290 C630,250 590,220 560,215`, { color: C.lilac, t: t + 0.3, dur: 1.0 });
    S.path(`M300,140 Q360,150 400,180 M280,215 Q350,220 410,250 M780,140 Q720,150 680,180 M800,215 Q730,220 670,250`, { color: C.lilac, w: 1.6, t: t + 0.9, op: 0.7, noEcho: true });
    figure(S, { cx: 540, cy: 275, scale: 0.46, t });
    S.path(`M500,52 a40,10 0 1,0 80,0 a40,10 0 1,0 -80,0`, { color: C.gold, w: 4, t: t + 0.8, dur: 0.5 });
    S.path(`M640,110 V330 M615,150 H665`, { color: C.gold, w: 5, t: t + 1.0, dur: 0.6 });
    S.sfx("bell3", t + 0.8); sparkles(S, 51, t + 0.6, 9); label(S, "SAINT MICHAEL", t + 0.2);
  },
  warning(S, t) {
    S.path(`M540,70 L700,350 H380Z`, { color: C.coral, w: 6, t, dur: 0.7 });
    S.path(`M540,150 V270`, { color: C.ink, w: 9, t: t + 0.5, dur: 0.3 });
    S.path(circ(540, 312, 7), { color: C.ink, w: 8, t: t + 0.7, dur: 0.2, fill: C.ink });
    S.sfx("hit", t + 0.1); label(S, "HE ALSO BRINGS A WARNING", t + 0.2);
  },
  favor(S, t) {
    figure(S, { cx: 380, cy: 270, scale: 0.44, t });
    S.path(`M470,360 C600,350 640,260 690,190 C730,135 780,110 840,100 M795,72 L842,100 L800,138`, { color: C.gold, w: 6, t: t + 0.5, dur: 0.9 });
    S.sfx("whoosh", t + 0.5); sparkles(S, 61, t + 0.9); label(S, "IT CHANGES IN YOUR FAVOR", t + 0.2);
  },
  blessing(S, t) {
    S.path(rrect(420, 210, 240, 170, 8), { t, dur: 0.6 });
    S.path(rrect(400, 165, 280, 50, 8), { t: t + 0.2, dur: 0.5 });
    S.path(`M540,165 V380`, { color: C.gold, w: 5, t: t + 0.4, dur: 0.4 });
    S.path(`M540,165 C490,110 450,140 470,160 C490,175 520,170 540,165 C560,170 590,175 610,160 C630,140 590,110 540,165`, { color: C.gold, w: 4, t: t + 0.6, dur: 0.6 });
    let r = ""; for (let i = 0; i < 11; i++) { const a = Math.PI * (1.08 + i * 0.084); r += `M${(540 + Math.cos(a) * 170).toFixed(0)},${(170 + Math.sin(a) * 120).toFixed(0)} L${(540 + Math.cos(a) * 250).toFixed(0)},${(170 + Math.sin(a) * 170).toFixed(0)} `; }
    S.path(r, { color: C.gold, w: 3, t: t + 0.9, dur: 0.5 });
    S.sfx("hit", t + 0.9); sparkles(S, 71, t + 1); label(S, "A POWERFUL BLESSING", t + 0.2);
  },
  finalMsg(S, t) {
    S.path(rrect(340, 110, 400, 250, 12), { t, dur: 0.6 });
    S.path(`M340,120 L540,250 L740,120 M340,350 L480,215 M740,350 L600,215`, { t: t + 0.3, dur: 0.7, w: 2.5 });
    S.path(circ(540, 250, 34), { color: C.gold, w: 4, t: t + 0.8, dur: 0.4, fill: C.gold });
    S.stars(28, 81, [80, 40, 1000, 420], t + 0.3);
    S.sfx("bell2", t + 0.8); label(S, "THE FINAL MESSAGE", t + 0.2);
  },
  like(S, t) {
    phone(S, 420, t); seals(S, 0, t);
    const tt = Math.max(t + 0.3, S.w("like"));
    S.path(`M420,300 C330,240 340,160 395,170 C410,173 418,185 420,195 C422,185 430,173 445,170 C500,160 510,240 420,300Z`, { color: C.coral, w: 5, t: tt, dur: 0.6, fill: C.coral });
    sealOn(S, 0, S.w("first")); label(S, "1ST SEAL: LIKE", t + 0.2);
  },
  save(S, t) {
    phone(S, 420, t); seals(S, 1, t);
    S.path(`M370,150 H470 V320 L420,280 L370,320Z`, { color: C.gold, w: 5, t: t + 0.3, dur: 0.6, fill: C.gold });
    sealOn(S, 1, S.w("second")); label(S, "2ND SEAL: SAVE", t + 0.2);
  },
  send(S, t) {
    phone(S, 420, t); seals(S, 2, t);
    S.path(`M335,240 L510,160 L450,320 L425,255Z M425,255 L510,160`, { color: C.ink, w: 5, t: t + 0.3, dur: 0.6 });
    sealOn(S, 2, S.w("third")); label(S, "3RD SEAL: SEND", t + 0.2);
  },
  comment(S, t) {
    S.path(`M300,80 H780 Q820,80 820,120 V300 Q820,340 780,340 H470 L390,400 L405,340 H300 Q260,340 260,300 V120 Q260,80 300,80Z`, { t, dur: 0.7 });
    const tt = S.w("received");
    S.text(540, 260, "RECEIVED", { font: "League Gothic", size: 150, color: C.gold, t: tt, ls: 0.03 });
    S.sfx("sting", tt); sparkles(S, 91, tt + 0.2, 9); label(S, "COMMENT THIS WORD", t + 0.2);
  },
  allThree(S, t) {
    [360, 540, 720].forEach((x, i) => {
      S.path(circ(x, 220, 72), { color: C.gold, w: 4, t: t + i * 0.25, dur: 0.5 });
      S.path(`M${x - 32},222 L${x - 8},248 L${x + 36},190`, { color: C.ink, w: 7, t: t + 0.3 + i * 0.25, dur: 0.3 });
      S.sfx("bell" + (i + 1), t + 0.3 + i * 0.25);
    });
    sparkles(S, 101, t + 0.8); label(S, "ALL 3 SEALS COMPLETE", t + 0.2);
  },
  goodNews(S, t) {
    phone(S, 540, t);
    S.path(rrect(455, 110, 170, 74, 14), { color: C.gold, w: 3, t: t + 0.5, dur: 0.5 });
    S.path(`M475,135 a12,12 0 0,1 24,0 v12 h-24z M508,135 H600 M508,158 H580`, { color: C.gold, w: 2.5, t: t + 0.7, dur: 0.5 });
    S.sfx("bell2", t + 0.5); sparkles(S, 111, t + 0.6); label(S, "YOU'LL RECEIVE GOOD NEWS", t + 0.2);
  },
  profile(S, t) {
    S.path(circ(540, 210, 115), { color: C.ink, w: 3, t, dur: 0.6 });
    S.path(circ(540, 210, 135), { color: C.coral, w: 6, t: t + 0.3, dur: 0.8 });
    S.path(circ(540, 180, 38), { t: t + 0.4, dur: 0.5 });
    S.path(`M465,300 Q470,235 540,235 Q610,235 615,300`, { t: t + 0.5, dur: 0.5 });
    const tt = S.w("tap");
    S.path(`${circ(640, 290, 22)} ${circ(640, 290, 44)}`, { color: C.gold, w: 3, t: tt, dur: 0.4 });
    S.path(circ(640, 290, 66), { color: C.gold, w: 2, t: tt + 0.15, dur: 0.4, op: 0.5 });
    S.sfx("pop", tt); label(S, "TAP MY PROFILE PICTURE", t + 0.2);
  },
  stories(S, t) {
    [340, 540, 740].forEach((x, i) => {
      S.path(rrect(x - 80, 80, 160, 290, 16), { color: i === 1 ? C.gold : C.dim, w: i === 1 ? 4 : 2.5, t: t + i * 0.15, dur: 0.6 });
      S.path(`M${x - 62},100 H${x + 62}`, { color: i === 0 ? C.ink : C.dim, w: 3, t: t + 0.3, dur: 0.3 });
    });
    S.push(`<g transform="translate(540,240)">`); cardBack(S, 96, 160, { t: t + 0.6 }); S.push(`</g>`);
    S.sfx("bell1", t + 0.6); sparkles(S, 121, t + 0.8); label(S, "PART 2 IS IN MY STORIES", t + 0.2);
  },
};

// [phrase that starts the beat, art] ; null art = panel off from that phrase
const PLAN = [
  ["whatever happens", "shh"], ["do not tell your sister", "tellNo"], ["pay close attention", null],
  ["because the most", "sunrise"], ["but if you skip", "skip"], ["not everyone will", "calendar"], ["i dont know who", null],
  ["i see wealth", "wealth"], ["comes directly", "angel"], ["but he also", "warning"], ["something is about", "favor"], ["a powerful blessing", "blessing"],
  ["confirm that this", null], ["this is the final", "finalMsg"], ["now like this", "like"], ["save this post", "save"], ["send this video", "send"],
  ["comment", "comment"], ["so i know", "allThree"], ["tomorrow", null], ["youre going to receive", "goodNews"], ["now pay attention", null],
  ["tap my profile", "profile"], ["because the second", "stories"],
];
let after = 0;
const beats = PLAN.map(([ph, art]) => { const t = at(ph, after) - 0.12; after = t - VO; return { t: +t.toFixed(3), art }; });
beats.forEach((b, i) => { b.end = i < beats.length - 1 ? beats[i + 1].t : TOTAL; });
// a panel segment = run of consecutive art beats
const segs = [];
beats.forEach((b, i) => { if (!b.art) return; if (i && beats[i - 1].art) segs.at(-1).end = b.end; else segs.push({ start: b.t, end: b.end }); b.first = !(i && beats[i - 1].art); });
const SLIDE = 0.35;

fs.rmSync(path.join(P, "compositions"), { recursive: true, force: true });
fs.mkdirSync(path.join(P, "compositions"), { recursive: true });
fs.mkdirSync(path.join(P, "assets"), { recursive: true });

const sceneCss = `#root{position:absolute;inset:0;} .wrap{position:absolute;inset:0;} svg.art{position:absolute;inset:0;width:1080px;height:${PH}px;overflow:visible;filter:drop-shadow(0 0 6px rgba(255,236,214,0.25));}`;
const cues = [];
const hosts = beats.filter((b) => b.art).map((b, i) => {
  const id = `b${i}-${b.art}`, dur = +(b.end - b.t).toFixed(3);
  const local = words.filter((w) => VO + w.start >= b.t - 0.1 && VO + w.start < b.end);
  const S = new Scene(id, dur, null);
  S.w = (word) => { const m = local.find((w) => norm(w.text) === norm(word)); if (!m) throw new Error(`${id}: "${word}" not in ${local.map((w) => w.text).join(" ")}`); return +(VO + m.start - b.t).toFixed(3); };
  ART[b.art](S, b.first ? SLIDE * 0.7 : 0.08);
  cues.push(...S.cues.map((c) => ({ kind: c.kind, t: +(b.t + c.t).toFixed(3) })));
  const last = b.end === segs.find((s) => s.start <= b.t && s.end >= b.end)?.end;
  const out = last ? "" : `tl.to("#${id}-w",{opacity:0,duration:0.16,ease:"power1.in"},${(dur - 0.16).toFixed(3)});`;
  fs.writeFileSync(path.join(P, "compositions", id + ".html"), `<template>
<style>${sceneCss}</style>
<div id="root" data-composition-id="${id}" data-width="1080" data-height="${PH}">
<div class="wrap" id="${id}-w"><svg class="art" viewBox="0 0 1080 ${PH}" xmlns="http://www.w3.org/2000/svg">
${S.svg.join("\n")}
</svg></div>
</div>
<script>
const tl = gsap.timeline({ paused: true });
${S.tw.join("\n")}
tl.fromTo("#${id}-w",{scale:1},{scale:1.04,duration:${dur},ease:"none",transformOrigin:"540px 250px"},0);
${out}
tl.set({}, {}, ${dur});
window.__timelines["${id}"] = tl;
</script>
</template>
`);
  return `<div id="${id}" data-composition-id="${id}" data-composition-src="compositions/${id}.html" data-start="${b.t}" data-duration="${dur}" data-track-index="2" data-track-kind="graphics" data-width="1080" data-height="${PH}"></div>`;
});

// ---------- captions (body words, 2–4 per line) ----------
const groups = []; let g = [];
words.forEach((w, i) => {
  g.push(w);
  const nx = words[i + 1];
  if (/[.,?!]$/.test(w.text) || g.length >= 4 || !nx || nx.start - w.end > 0.25) { groups.push(g); g = []; }
});
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
const caps = groups.map((gr, i) => {
  const st = VO + gr[0].start - 0.04, nx = groups[i + 1] ? VO + groups[i + 1][0].start - 0.04 : TOTAL;
  const en = Math.min(nx, VO + gr.at(-1).end + 0.5);
  const txt = gr.map((w) => { const d = esc(w.text.replace(/^St\.$/, "Saint")); return norm(w.text) === "received" ? `<span class="gold">${d}</span>` : d; }).join(" ");
  return { id: `c${i}`, st: +st.toFixed(3), dur: +(en - st).toFixed(3), txt };
});
fs.writeFileSync(path.join(P, "compositions", "caps.html"), `<template>
<style>
#root{position:absolute;inset:0;}
.cg{position:absolute;left:0;top:${CAPY}px;width:1080px;padding:0 70px;text-align:center;}
.cg span.in{display:inline-block;font-family:Montserrat;font-weight:800;font-size:62px;line-height:1.15;color:#FFFFFF;
 text-shadow:-3px -3px 0 #000,3px -3px 0 #000,-3px 3px 0 #000,3px 3px 0 #000,0 -3px 0 #000,0 3px 0 #000,-3px 0 0 #000,3px 0 0 #000,0 4px 14px rgba(0,0,0,.6);}
.gold{color:#F4B860;}
</style>
<div id="root" data-composition-id="caps" data-width="1080" data-height="1920">
${caps.map((c) => `<div id="${c.id}" class="clip cg" data-start="${c.st}" data-duration="${c.dur}"><span class="in" id="${c.id}-t">${c.txt}</span></div>`).join("\n")}
</div>
<script>
const tl = gsap.timeline({ paused: true });
${caps.map((c) => `tl.fromTo("#${c.id}-t",{opacity:0,scale:0.92},{opacity:1,scale:1,duration:0.12,ease:"back.out(2)"},${c.st});`).join("\n")}
tl.set({}, {}, ${TOTAL});
window.__timelines["caps"] = tl;
</script>
</template>
`);

// ---------- audio ----------
fs.copyFileSync(HOOK, path.join(P, "assets", "hook.mp4"));
fs.copyFileSync(BODY, path.join(P, "assets", "body.mp4"));
ff(["-hide_banner", "-y", "-i", BODY, "-vn", "-ac", "1", "-ar", "48000", path.join(P, "assets", "voice.wav")]);
const getI = (txt) => { const m = txt.match(/"input_i"\s*:\s*"(-?[\d.]+)"/); return m ? +m[1] : null; };
const voI = getI(ff(["-hide_banner", "-i", path.join(P, "assets", "voice.wav"), "-af", "loudnorm=print_format=json", "-f", "null", "-"]));
const muI = getI(ff(["-hide_banner", "-t", String(TOTAL + 1), "-i", MUS + A.music, "-af", "loudnorm=print_format=json", "-f", "null", "-"]));
const gain = voI - 19 - muI; // quiet pad under the voice, like the reference
const mlen = ffp(MUS + A.music), loops = Math.max(0, Math.ceil((TOTAL + 1) / mlen) - 1);
ff(["-hide_banner", "-y", "-stream_loop", String(loops), "-i", MUS + A.music, "-t", String(TOTAL + 0.5), "-af",
  `volume=${gain.toFixed(2)}dB,volume=eval=frame:volume='1+1.5*(1-min(1\\,max(0\\,(t-${VO - 0.6})/0.8)))',afade=t=in:d=0.4,afade=t=out:st=${(TOTAL - 2.5).toFixed(2)}:d=2.5`,
  "-ar", "48000", "-ac", "2", path.join(P, "assets", "music.wav")]);
console.log(`voice ${voI} LUFS, music ${muI} LUFS -> gain ${gain.toFixed(1)} dB, loops ${loops}`);

// hook cuts get a whoosh; panel in/out get a whoosh; riser into the last panel
const hookCuts = (ff(["-hide_banner", "-i", HOOK, "-vf", "select='gt(scene,0.25)',showinfo", "-f", "null", "-"]).match(/pts_time:[\d.]+/g) || []).map((s) => +s.slice(9));
hookCuts.forEach((t) => cues.push({ kind: "whoosh", t }));
cues.push({ kind: "hit", t: HOOKEND });
segs.forEach((s, i) => { cues.push({ kind: "whoosh", t: s.start + 0.1 }); if (s.end < TOTAL - 0.5) cues.push({ kind: "whoosh", t: s.end - 0.15 }); });
cues.push({ kind: "riser", t: segs.at(-1).start + 0.1 });
const KIT = { whoosh: [0.265, -16.2, -12], riser: [2.389, -6.0, -16], hit: [0.0, -12.8, -12], tick: [0.002, -17.4, -18], pop: [0.0, -19.1, -14],
  bell1: [0.0, -13.1, -13], bell2: [0.0, -10.6, -13], bell3: [0.0, -10.0, -13], sting: [0.139, -10.1, -11] };
cues.sort((a, b) => a.t - b.t);
const lastT = {}, kept = [];
for (const c of cues) {
  if (lastT[c.kind] != null && c.t - lastT[c.kind] < 0.35) continue;
  if ((c.kind === "tick" || c.kind === "pop") && kept.some((k) => Math.abs(k.t - c.t) < 0.2)) continue;
  lastT[c.kind] = c.t; kept.push(c);
}
const LK = "M:/Google/hyperframes/Midnight-Studio/auraly-lineart/sfx/kit/";
const sfx = kept.map((c, i) => {
  const [pk, mm, rel] = KIT[c.kind], vol = Math.min(1, Math.pow(10, (voI + rel - mm) / 20));
  fs.copyFileSync(LK + c.kind + ".wav", path.join(P, "assets", "k_" + c.kind + ".wav"));
  return `<audio id="fx${i}" class="clip" src="assets/k_${c.kind}.wav" data-start="${Math.max(0, c.t - pk).toFixed(3)}" data-duration="2.4" data-track-index="${7 + (i % 3)}" data-volume="${vol.toFixed(3)}"></audio>`;
});

// ---------- root ----------
let tw = `tl.set("#panel",{y:${-PH}},0);
`;
segs.forEach((s) => {
  tw += `tl.fromTo("#panel",{y:${-PH}},{y:0,duration:${SLIDE},ease:"power3.out",immediateRender:false},${s.start});\n`;
  tw += `tl.fromTo("#face",{y:0},{y:${PUSH},duration:${SLIDE},ease:"power3.out",immediateRender:false},${s.start});\n`;
  if (s.end < TOTAL - 0.2) {
    tw += `tl.to("#panel",{y:${-PH},duration:0.3,ease:"power2.in"},${(s.end - 0.3).toFixed(3)});\n`;
    tw += `tl.to("#face",{y:0,duration:0.3,ease:"power2.in"},${(s.end - 0.3).toFixed(3)});\n`;
  }
});
CUTS.forEach((c, i) => { const t = VO + c; if (t > HOOKEND) tw += `tl.set("#zoom",{scale:${i % 2 ? 1 : 1.07}},${t.toFixed(3)});
`; });
const sp = rng(7), motes = [];
for (let i = 0; i < 16; i++) motes.push(`<div class="mote" id="m${i}" style="left:${(sp() * 1060).toFixed(0)}px;top:${(20 + sp() * 500).toFixed(0)}px;width:${(2 + sp() * 3).toFixed(1)}px;height:${(2 + sp() * 3).toFixed(1)}px;opacity:${(0.2 + sp() * 0.4).toFixed(2)}"></div>`);
for (let i = 0; i < 16; i++) tw += `tl.fromTo("#m${i}",{y:0,x:0},{y:${-(30 + sp() * 60).toFixed(0)},x:${((sp() - 0.5) * 40).toFixed(0)},duration:${TOTAL},ease:"none"},0);\n`;
fs.writeFileSync(path.join(P, "index.html"), `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=1080, height=1920" />
<script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js"></script>
<style>
*{margin:0;padding:0;box-sizing:border-box;}
html,body{margin:0;width:1080px;height:1920px;overflow:hidden;background:#000;}
#face,#zoom{position:absolute;inset:0;}
#zoom{transform-origin:540px 700px;}
#face video,#hook{position:absolute;left:0;top:0;width:1080px;height:1920px;object-fit:cover;}
#panel{position:absolute;left:0;top:0;width:1080px;height:${PH}px;z-index:10;overflow:hidden;
 background:linear-gradient(180deg,#1E1712 0%,#2E241C 60%,#3A2E23 100%);box-shadow:0 6px 24px rgba(0,0,0,.55);}
#panel .edge{position:absolute;left:0;bottom:0;width:100%;height:2px;background:linear-gradient(90deg,transparent,#F4B860 30%,#F4B860 70%,transparent);opacity:.55;}
#grain{position:absolute;inset:0;opacity:0.06;}
.mote{position:absolute;border-radius:50%;background:#F4B860;box-shadow:0 0 8px #F4B860;}
</style>
</head>
<body>
<div id="root" data-composition-id="main" data-start="0" data-duration="${TOTAL}" data-width="1080" data-height="1920">
<div id="face"><div id="zoom"><video id="body" class="clip" src="assets/body.mp4" data-start="${HOOKEND}" data-duration="${(TOTAL - HOOKEND).toFixed(3)}" data-media-start="${(HOOKEND - VO).toFixed(3)}" data-track-index="1" muted playsinline></video></div></div>
<video id="hook" class="clip" src="assets/hook.mp4" data-start="0" data-duration="${HOOKEND}" data-track-index="0" muted playsinline></video>
<div id="panel"><svg id="grain" width="1080" height="${PH}" xmlns="http://www.w3.org/2000/svg"><filter id="nz"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7"/><feColorMatrix type="saturate" values="0"/></filter><rect width="1080" height="${PH}" filter="url(#nz)"/></svg>${motes.join("")}
${hosts.join("\n")}
<div class="edge"></div></div>
<div id="caps" data-composition-id="caps" data-composition-src="compositions/caps.html" data-start="0" data-duration="${TOTAL}" data-track-index="3" data-track-kind="captions" data-width="1080" data-height="1920" style="z-index:50"></div>
<audio id="vo" class="clip" src="assets/voice.wav" data-start="${VO}" data-track-index="4" data-volume="1"></audio>
<audio id="bgm" class="clip" src="assets/music.wav" data-start="0" data-duration="${TOTAL}" data-track-index="5" data-volume="1"></audio>
${sfx.join("\n")}
</div>
<script>
const tl = gsap.timeline({ paused: true });
${tw}tl.set({}, {}, ${TOTAL});
window.__timelines["main"] = tl;
</script>
</body>
</html>
`);
console.log(key, "total", TOTAL, "beats", hosts.length, "segs", segs.map((s) => `${s.start.toFixed(1)}-${s.end.toFixed(1)}`).join(" "), "captions", caps.length, "sfx", kept.length);

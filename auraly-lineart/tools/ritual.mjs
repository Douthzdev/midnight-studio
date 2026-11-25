// "Moon ritual" faceless edit — ref: Midnight-Studio/ref-saveclip/DECUPAGEM.md.
// Black grainy sky, thin glowing DOTTED line art that draws itself, one literal metaphor per sentence (scenes built from the
// copy), 1-line grey captions with a pill on the spoken word, small section titles, blank underlines at the top that fill
// with the ritual phrase, calm CTA card. Copy-specific: this file holds v19 ("One, two, three, four, five… comment 888").
// usage: node tools/ritual.mjs [--render]
import fs from "node:fs";
import { spawnSync } from "node:child_process";

const RENDER = process.argv.includes("--render");
const ROOT = "M:/Google/hyperframes/Midnight-Studio/auraly-lineart", P = ROOT + "/v19-ritual-888";
const VO = ROOT + "/vo/v19.wav", TR = ROOT + "/vo/t_v19/transcript.json", LINES = ROOT + "/vo/v19.lines.json";
const MUSIC = "C:/Users/Vinicius/Music/Songs Auraly UGC/øneheart x antent - rain inside.mp3", LK = ROOT + "/sfx/kit/";
const env = { ...process.env, PATH: "M:/CLAUDE/tools/ffmpeg/bin;" + process.env.PATH };
for (const k of ["HYPERFRAMES_EXTRACT_CACHE_DIR", "TMPDIR", "TEMP", "TMP"]) env[k] = "M:/CLAUDE/tools/hf-frames";
const ff = (args) => { const r = spawnSync("ffmpeg", args, { encoding: "utf8", env, maxBuffer: 1 << 26 }); return (r.stderr || "") + (r.stdout || ""); };
const ffp = (f) => +spawnSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f], { encoding: "utf8", env }).stdout.trim();
fs.mkdirSync(P + "/assets", { recursive: true }); fs.mkdirSync(P + "/compositions", { recursive: true });
const T = (x) => (+x).toFixed(3), norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

// ---------- words (ASR merged "One, two, three, four, five" into "12345." -> spread over line 1) ----------
let words = JSON.parse(fs.readFileSync(TR, "utf8"));
const L1 = JSON.parse(fs.readFileSync(LINES, "utf8"))[0];
if (/^\d{5}/.test(words[0].text)) { const d = (L1.end - L1.start) / 5; words.splice(0, 1, ...["One,", "two,", "three,", "four,", "five!"].map((x, i) => ({ text: x, start: +(L1.start + i * d).toFixed(3), end: +(L1.start + (i + 0.8) * d).toFixed(3) }))); }
words = words.map((w) => ({ ...w, text: w.text === "St." ? "Saint" : w.text === "888" ? "“888”" : w.text }));
const W = words.map((w) => norm(w.text));
const at = (phrase, from = 0) => { const p = phrase.split(" ").map(norm); const i = W.findIndex((_, k) => words[k].start >= from - 0.05 && p.every((x, j) => W[k + j] === x)); if (i < 0) throw new Error("phrase not found: " + phrase); return words[i].start; };
const VOLEN = ffp(VO), TOTAL = +(VOLEN + 1.4).toFixed(2);
let seed = 11; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

// ---------- drawing helpers ----------
const LAV = "#DCD8F5", AMB = "#F2B66B", AQUA = "#86E3D3";
let html = "", tw = ""; const cues = [];
const sfx = (kind, t, rel) => cues.push({ kind, t, rel });
const person = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><circle cx="0" cy="-330" r="44"/><path d="M-62 -262Q0 -284 62 -262Q84 -250 86 -200L92 -70Q92 -52 74 -52L66 -52L60 0L18 0L8 -120L-8 -120L-18 0L-60 0L-66 -52L-74 -52Q-92 -52 -92 -70L-86 -200Q-84 -250 -62 -262Z"/></g>`;
const orb = (id, x, y, r, g = "gLav") => `<circle id="${id}" cx="${x}" cy="${y}" r="${r}" fill="url(#${g})"/>`;
const moonFill = (id, x, y, r) => `<g id="${id}"><circle cx="${x}" cy="${y}" r="${r * 1.5}" fill="url(#gHalo)"/><circle cx="${x}" cy="${y}" r="${r}" fill="url(#gMoon)" filter="url(#tex)"/></g>`;
const ring = (x, y, rx, ry, rot = -14) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" transform="rotate(${rot} ${x} ${y})"/>`;
// one scene: `lines` (dotted strokes, revealed by a mask that draws on), `fills` (orbs/text, faded in), `fx(id, t, e)` extra tweens
const scenes = [];
const scene = (at_, o) => scenes.push({ t: at_, ...o });
const maskify = (s) => s.replace(/<(path|circle|rect|ellipse|line|polyline)(?=[\s/])/g, '<$1 pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="1"');

// ---------- the copy, scene by scene (each picture is literally what the sentence says) ----------
const t0 = words[0].start;
// 1 "One, two, three, four, five!" — the moon, and five dots light up one per count
scene(0, { lines: ring(540, 640, 230, 46) + [0, 1, 2, 3, 4].map((k) => `<circle cx="${340 + k * 100}" cy="940" r="26"/>`).join(""),
  fills: moonFill("m1", 540, 640, 130) + [0, 1, 2, 3, 4].map((k) => orb(`c1d${k}`, 340 + k * 100, 940, 20, "gAmb")).join(""),
  fx: (id) => { words.slice(0, 5).forEach((w, k) => { tw += `tl.fromTo("#c1d${k}",{scale:0,svgOrigin:"${340 + k * 100} 940"},{scale:1.3,duration:0.35,ease:"back.out(3)",immediateRender:true},${T(w.start)});\n`; sfx("tick", w.start, -18); }); } });
// 2 "start a new season before this year ends" — the year as a ring of 12 months, the arc reaches the last one, a sprout grows
scene(at("thats all you need"), { title: "BEFORE THIS YEAR ENDS",
  lines: `<circle cx="540" cy="760" r="240"/>` + [...Array(12).keys()].map((k) => { const a = (k / 12) * 2 * Math.PI - Math.PI / 2; return `<line x1="${540 + Math.cos(a) * 262}" y1="${760 + Math.sin(a) * 262}" x2="${540 + Math.cos(a) * 296}" y2="${760 + Math.sin(a) * 296}"/>`; }).join("")
    + `<path class="aq" d="M540 900C540 840 540 800 540 740"/><path class="aq" d="M540 800C500 790 470 760 466 720C506 724 534 750 540 800Z"/><path class="aq" d="M540 770C580 760 612 730 618 690C576 694 546 722 540 770Z"/>`,
  fills: `<path id="c2arc" d="M540 520A240 240 0 1 1 332 640" fill="none" stroke="${AMB}" stroke-width="7" stroke-linecap="round" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="1"/>` + orb("c2dot", 332, 640, 22, "gAmb"),
  fx: (id, t) => { tw += `tl.to("#c2arc",{attr:{"stroke-dashoffset":0},duration:2.2,ease:"power2.inOut"},${T(t + 0.3)});tl.fromTo("#c2dot",{scale:0,svgOrigin:"332 640"},{scale:1.4,duration:0.5,ease:"back.out(3)",immediateRender:true},${T(t + 2.4)});\n`; } });
// 3 "don't you dare scroll past this" — a phone feed scrolling, then it stops dead
scene(at("and listen dont"), {
  lines: `<rect x="390" y="470" width="300" height="600" rx="46"/><line x1="500" y1="500" x2="580" y2="500"/>`,
  fills: `<g clip-path="url(#phoneClip)"><g id="c3feed">${[...Array(16).keys()].map((k) => `<rect x="420" y="${530 + k * 90}" width="240" height="20" rx="10" fill="rgba(220,216,245,.18)"/><rect x="420" y="${560 + k * 90}" width="${120 + (k * 37) % 110}" height="14" rx="7" fill="rgba(220,216,245,.10)"/>`).join("")}</g></g><g id="c3stop" opacity="0"><circle cx="540" cy="770" r="110" fill="none" stroke="${AMB}" stroke-width="6"/><line x1="462" y1="848" x2="618" y2="692" stroke="${AMB}" stroke-width="6" stroke-linecap="round"/></g>`,
  fx: (id, t) => { const ts = at("dare", t); tw += `tl.fromTo("#c3feed",{y:0},{y:-600,duration:${T(ts - t)},ease:"none",immediateRender:true},${T(t)});tl.to("#c3feed",{y:-630,duration:0.25,ease:"back.out(3)"},${T(ts)});tl.fromTo("#c3stop",{opacity:0,scale:1.4,svgOrigin:"540 770"},{opacity:1,scale:1,duration:0.4,ease:"back.out(2)",immediateRender:false},${T(ts + 0.1)});\n`; } });
// 4 "the universe might skip your blessing" — a blessing falls toward you, then curves away past you
scene(at("the universe might"), { lines: person(540, 1040, 0.95) + `<path d="M120 1040H960"/>` + `<path d="M860 380C700 520 620 600 600 640C580 700 300 640 160 520"/>`,
  fills: orb("c4o", 860, 380, 34),
  fx: (id, t) => { const ts = at("skip", t); tw += `tl.fromTo("#c4o",{x:0,y:0},{keyframes:[{x:-170,y:180,duration:${T(ts - t - 0.2)},ease:"sine.in"},{x:-260,y:260,duration:0.4,ease:"none"},{x:-700,y:140,opacity:0.2,duration:1.0,ease:"sine.out"}],immediateRender:true},${T(t + 0.2)});\n`; } });
// 5 "Close your right hand right now" — an open hand, fingers fold into a fist around a warm orb
const hand = `<rect x="440" y="770" width="210" height="220" rx="60"/>${[[455, 150], [505, 185], [555, 178], [605, 140]].map(([x, h], k) => `<rect class="fg" data-k="${k}" x="${x}" y="${790 - h}" width="40" height="${h + 20}" rx="20"/>`).join("")}<path class="th1" d="M450 930L382 838Q370 816 390 804Q410 794 424 814L470 880"/><path class="th2" d="M452 900Q470 870 520 872L600 876Q622 880 620 900Q618 918 598 918L470 918"/>`;
const handFx = (sel, t, close) => { const [a, b] = close ? [1, 0.3] : [0.3, 1]; tw += `${[0, 1, 2, 3].map((k) => { const x = [455, 505, 555, 605][k] + 20; return `tl.fromTo("${sel} .fg[data-k='${k}']",{scaleY:${a},svgOrigin:"${x} 810"},{scaleY:${b},svgOrigin:"${x} 810",duration:0.55,ease:"power3.inOut",immediateRender:true},${T(t + k * 0.05)});`; }).join("")}tl.fromTo("${sel} .th1",{opacity:${close ? 1 : 0}},{opacity:${close ? 0 : 1},duration:0.4,immediateRender:true},${T(t)});tl.fromTo("${sel} .th2",{opacity:${close ? 0 : 1}},{opacity:${close ? 1 : 0},duration:0.4,immediateRender:true},${T(t + 0.15)});\n`; };
scene(at("close your right"), { title: "CLOSE YOUR RIGHT HAND", lines: hand, fills: orb("c5o", 545, 860, 48, "gAmb"),
  fx: (id, t) => { handFx(`#${id}`, at("right now", t), true); tw += `tl.fromTo("#c5o",{opacity:1},{opacity:0.55,duration:0.5,immediateRender:false},${T(at("right now", t))});\n`; } });
// 6 "this energy could turn against you and send everything down the drain" — a spiral drain swallows the light
scene(at("because if you"), {
  lines: [[300, 70, 0], [225, 54, 34], [158, 38, 62], [98, 24, 84], [46, 12, 100]].map(([rx, ry, dy]) => `<ellipse cx="540" cy="${700 + dy}" rx="${rx}" ry="${ry}"/>`).join(""),
  fills: `<g id="c6sw">${[...Array(36).keys()].map((k) => { const a = rnd() * 6.28, r = 60 + rnd() * 240; return `<circle cx="${540 + Math.cos(a) * r}" cy="${740 + Math.sin(a) * r * 0.24}" r="${3 + rnd() * 5}" fill="${k % 4 ? LAV : AMB}" opacity=".9"/>`; }).join("")}</g>`,
  fx: (id, t) => { const ts = at("drain", t); tw += `tl.fromTo("#c6sw",{rotation:0,scale:1,svgOrigin:"540 740"},{rotation:-420,scale:0.05,svgOrigin:"540 800",duration:${T(ts - t + 0.3)},ease:"power2.in",immediateRender:true},${T(t)});\n`; sfx("hit", ts, -16); } });
// 7 "I see wealth and prosperity coming into your life" — an eye opens, warm gold rains down
scene(at("i see wealth"), {
  lines: `<g class="lid"><path d="M290 700Q540 500 790 700Q540 900 290 700Z"/><circle cx="540" cy="700" r="92"/></g>`,
  fills: orb("c7p", 540, 700, 34) + `<g id="c7rain">${[...Array(26).keys()].map(() => `<circle cx="${260 + rnd() * 560}" cy="${880 + rnd() * 60}" r="${4 + rnd() * 6}" fill="${AMB}"/>`).join("")}</g>`,
  fx: (id, t) => { tw += `tl.fromTo("#${id} .lid,#c7p",{scaleY:0.04,svgOrigin:"540 700"},{scaleY:1,svgOrigin:"540 700",duration:0.8,ease:"expo.out",immediateRender:true},${T(t + 0.1)});tl.fromTo("#c7rain circle",{y:-300,opacity:0},{y:140,opacity:1,duration:1.6,stagger:0.08,ease:"sine.in",immediateRender:true},${T(at("prosperity", t))});\n`; } });
// 8 "this message comes directly from Saint Michael" — wings and a sword
const wingL = `M520 660C440 560 320 520 230 560C300 600 340 650 360 710C310 690 270 710 250 750C320 752 380 770 430 810C380 810 350 830 340 860C410 860 470 850 520 820`;
scene(at("and this message"), { title: "SAINT MICHAEL",
  lines: `<path d="${wingL}"/><path d="${wingL}" transform="matrix(-1 0 0 1 1080 0)"/><path d="M300 640Q380 640 440 700M330 760Q400 760 460 790"/><path d="M300 640Q380 640 440 700M330 760Q400 760 460 790" transform="matrix(-1 0 0 1 1080 0)"/>`
    + `<g class="am"><path d="M540 600V1010"/><path d="M490 640H590"/><circle cx="540" cy="580" r="16"/></g>`,
  fills: orb("c8g", 540, 640, 60, "gAmb"), fx: (id, t) => { tw += `tl.fromTo("#c8g",{scale:0.6,svgOrigin:"540 640"},{scale:1.2,duration:1.2,yoyo:true,repeat:2,ease:"sine.inOut",immediateRender:true},${T(t + 0.6)});\n`; } });
// 9 "he also brings a warning" — a warning sign that pulses
scene(at("but listen carefully"), { title: "A WARNING",
  lines: `<g class="am"><path d="M540 540L780 960H300Z"/><path d="M540 680V840"/><circle cx="540" cy="895" r="10"/></g>`,
  fills: [0, 1].map((k) => `<path id="c9r${k}" d="M540 540L780 960H300Z" fill="none" stroke="${AMB}" stroke-width="3" opacity="0"/>`).join(""),
  fx: (id, t) => { const ts = at("warning", t); [0, 1].forEach((k) => { tw += `tl.fromTo("#c9r${k}",{scale:1,opacity:0.8,svgOrigin:"540 820"},{scale:1.5,opacity:0,duration:1.1,ease:"power2.out",immediateRender:false},${T(ts + k * 0.35)});\n`; }); } });
// 10 "Something is about to change in your favor" — the scale tips to your side
scene(at("something is about"), {
  lines: `<path d="M540 640V1000M440 1000H640"/><g class="beam"><path d="M320 640H760"/><path d="M340 640L300 820M340 640L380 820M290 820Q340 870 390 820Z"/><path d="M740 640L700 820M740 640L780 820M690 820Q740 870 790 820Z"/></g><circle cx="540" cy="632" r="12"/>`,
  fills: `<g class="beam">${orb("c10o", 740, 800, 26, "gAmb")}</g>`,
  fx: (id, t) => { const ts = at("change", t); tw += `tl.fromTo("#${id} .beam",{rotation:-12,svgOrigin:"540 640"},{rotation:-12,svgOrigin:"540 640",duration:0.01,immediateRender:true},${T(t)});tl.to("#${id} .beam",{rotation:12,svgOrigin:"540 640",duration:1.1,ease:"elastic.out(1,0.5)"},${T(ts)});\n`; } });
// 11 "A powerful blessing is coming your way with incredible force" — a comet of light strikes you, burst
scene(at("a powerful blessing"), {
  lines: person(540, 1040, 0.95) + `<path d="M120 1040H960"/>` + `<path class="am" d="M940 300L590 690"/>`,
  fills: orb("c11c", 940, 300, 40, "gAmb") + `<g id="c11b" opacity="0">${[...Array(14).keys()].map((k) => { const a = (k / 14) * 6.283; return `<line x1="${540 + Math.cos(a) * 90}" y1="${700 + Math.sin(a) * 90}" x2="${540 + Math.cos(a) * (170 + (k % 3) * 40)}" y2="${700 + Math.sin(a) * (170 + (k % 3) * 40)}" stroke="${AMB}" stroke-width="5" stroke-linecap="round"/>`; }).join("")}${orb("c11h", 540, 700, 80, "gAmb")}</g>`,
  fx: (id, t) => { const ts = at("force", t); tw += `tl.fromTo("#c11c",{x:0,y:0},{x:-400,y:400,duration:${T(ts - t - 0.1)},ease:"power2.in",immediateRender:true},${T(t + 0.1)});tl.to("#c11c",{opacity:0,duration:0.1},${T(ts)});tl.fromTo("#c11b",{opacity:1,scale:0.2,svgOrigin:"540 700"},{scale:1.25,opacity:1,duration:0.6,ease:"expo.out",immediateRender:false},${T(ts)});tl.to("#c11b",{opacity:0.45,duration:0.8},${T(ts + 0.6)});\n`; sfx("riser", ts - 2.4, -20); sfx("hit", ts, -14); } });
// 12 "This is the final message from the universe" — a sealed letter under the moon
scene(at("this is the final"), { title: "THE FINAL MESSAGE",
  lines: `<rect x="340" y="700" width="400" height="270" rx="16"/><path d="M340 700L540 860L740 700"/>` + ring(540, 470, 150, 30),
  fills: moonFill("m12", 540, 470, 80) + orb("c12s", 540, 860, 40, "gAmb"),
  fx: (id, t) => { tw += `tl.fromTo("#c12s",{scale:0,svgOrigin:"540 860"},{scale:1,duration:0.5,ease:"back.out(3)",immediateRender:true},${T(at("seriously", t))});\n`; } });
// 13 "open your right hand and send this video to yourself" — the fist opens, the orb lifts, a paper plane loops back to you
const blanksAt = at("open your right hand");
scene(blanksAt - 0.4, { lines: hand + `<path class="pl" d="M0 0L60 20L0 40L12 20Z"/>`, fills: orb("c13o", 545, 860, 48, "gAmb"),
  fx: (id, t) => { handFx(`#${id}`, blanksAt, false); const ts = at("send this video", t);
    tw += `tl.to("#c13o",{y:-140,scale:1.2,svgOrigin:"545 860",duration:1.0,ease:"expo.out"},${T(at("hand", t))});\n`;
    tw += `tl.fromTo("#${id} .pl",{x:520,y:600,rotation:-30,opacity:0},{keyframes:[{opacity:1,x:700,y:480,rotation:-20,duration:0.5},{x:860,y:620,rotation:90,duration:0.5},{x:700,y:760,rotation:170,duration:0.5},{x:560,y:700,rotation:250,opacity:0.6,duration:0.5}],ease:"none",immediateRender:true},${T(ts)});\n`; } });
// 14 "in just seven minutes… confirm this energetic shift" — a clock sweeps seven minutes
scene(at("because in just"), { title: "7 MINUTES",
  lines: `<circle cx="540" cy="760" r="220"/>` + [...Array(12).keys()].map((k) => { const a = (k / 12) * 6.283 - 1.5708; return `<line x1="${540 + Math.cos(a) * 190}" y1="${760 + Math.sin(a) * 190}" x2="${540 + Math.cos(a) * 205}" y2="${760 + Math.sin(a) * 205}"/>`; }).join(""),
  fills: `<path id="c14a" d="M540 600A160 160 0 0 1 647 641" fill="none" stroke="${AMB}" stroke-width="10" stroke-linecap="round" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="1"/><line id="c14h" x1="540" y1="760" x2="540" y2="590" stroke="${LAV}" stroke-width="6" stroke-linecap="round"/>${orb("c14c", 540, 760, 16)}`,
  fx: (id, t) => { const ts = at("seven", t); tw += `tl.fromTo("#c14h",{rotation:0,svgOrigin:"540 760"},{rotation:42,svgOrigin:"540 760",duration:1.4,ease:"power2.inOut",immediateRender:true},${T(ts)});tl.to("#c14a",{attr:{"stroke-dashoffset":0},duration:1.4,ease:"power2.inOut"},${T(ts)});tl.fromTo("#c14c",{scale:1,svgOrigin:"540 760"},{scale:4,opacity:0,duration:1.0,ease:"power2.out",immediateRender:false},${T(at("shift", t))});\n`; } });
// 15-17 three seals: save, follow, comment 888
const SX = [300, 540, 780];
scene(at("save this video"), { title: "SEAL 1 · SAVE", titles: [["tap the follow", "SEAL 2 · FOLLOW"], ["comment", "SEAL 3 · COMMENT 888"]],
  lines: SX.map((x) => `<circle cx="${x}" cy="740" r="100"/>`).join("") + `<path d="M270 690H330V790L300 768L270 790Z"/><g transform="translate(540 740)"><circle cx="0" cy="-22" r="22"/><path d="M-46 48Q-46 8 0 8Q46 8 46 48M50 -10H82M66 -26V6"/></g>`,
  fills: SX.map((x, k) => orb(`c15g${k}`, x, 740, 130, "gAmb")).join("") + `<text id="c15t" x="780" y="768" text-anchor="middle" font-family="Inter" font-weight="700" font-size="78" fill="${LAV}" opacity="0">888</text>`
    + `<g id="c15card" opacity="0"><line x1="200" y1="930" x2="880" y2="930" stroke="${LAV}" stroke-width="3" stroke-dasharray="0.5 9" stroke-linecap="round"/><text x="540" y="995" text-anchor="middle" font-family="Inter" font-weight="500" font-size="44" fill="#A9A6BD">Comment <tspan fill="#fff" font-weight="700">“888”</tspan></text><text x="540" y="1050" text-anchor="middle" font-family="Inter" font-weight="500" font-size="36" fill="#7E7B92">so I can see you did everything</text><line x1="200" y1="1090" x2="880" y2="1090" stroke="${LAV}" stroke-width="3" stroke-dasharray="0.5 9" stroke-linecap="round"/></g>`,
  fx: (id, t) => {
    const ss = [at("first seal", t), at("second seal", t), at("888", t)];
    ss.forEach((ts, k) => { tw += `tl.fromTo("#c15g${k}",{opacity:0,scale:0.4,svgOrigin:"${SX[k]} 740"},{opacity:0.75,scale:1,duration:0.6,ease:"back.out(2)",immediateRender:true},${T(ts)});\n`; sfx("bell" + (k + 1), ts, -20); });
    tw += `tl.fromTo("#c15t",{opacity:0,scale:0.5,svgOrigin:"780 740"},{opacity:1,scale:1,duration:0.5,ease:"back.out(3)",immediateRender:true},${T(ss[2] - 0.2)});tl.fromTo("#c15card",{opacity:0,y:20},{opacity:1,y:0,duration:0.7,ease:"expo.out",immediateRender:true},${T(at("comment", t) - 0.1)});\n`;
  } });
// 18 "tomorrow, when you wake up" — sunrise over the horizon
scene(at("and if you did"), { title: "TOMORROW MORNING",
  lines: `<path d="M140 980H940"/>` + [...Array(9).keys()].map((k) => { const a = Math.PI + (k + 1) * (Math.PI / 10); return `<line class="ry" x1="${540 + Math.cos(a) * 250}" y1="${980 + Math.sin(a) * 250}" x2="${540 + Math.cos(a) * 330}" y2="${980 + Math.sin(a) * 330}"/>`; }).join(""),
  fills: `<g clip-path="url(#horizon)"><g id="c18s"><circle cx="540" cy="980" r="210" fill="url(#gSun)"/></g></g>`,
  fx: (id, t) => { tw += `tl.fromTo("#c18s",{y:240},{y:0,duration:${T(Math.max(1.5, at("wake up", t) - t + 0.4))},ease:"sine.out",immediateRender:true},${T(t + 0.2)});\n`; } });
// 18b "receive incredibly good news on your phone" — a phone lights up with a notification
scene(at("receive incredibly"), {
  lines: `<rect x="390" y="470" width="300" height="600" rx="46"/><line x1="500" y1="500" x2="580" y2="500"/><g class="am"><rect x="410" y="560" width="260" height="96" rx="24"/><path d="M448 628V604a14 14 0 0 1 28 0v24l5 6h-38z"/></g>`,
  fills: `<rect x="500" y="586" width="150" height="16" rx="8" fill="rgba(242,182,107,.55)"/><rect x="500" y="614" width="100" height="12" rx="6" fill="rgba(242,182,107,.35)"/>` + orb("c18g", 540, 610, 160, "gAmb"),
  fx: (id, t) => { tw += `tl.fromTo("#c18g",{opacity:0},{opacity:0.5,duration:0.6,yoyo:true,repeat:3,immediateRender:true},${T(at("good news", t))});\n`; sfx("bell2", at("good news", t), -20); } });
// 19 "Now, pay close attention" — a point of light with focusing rings
scene(at("now pay close"), { lines: [70, 140, 210].map((r) => `<circle cx="540" cy="760" r="${r}"/>`).join(""), fills: orb("c19o", 540, 760, 36),
  fx: (id, t) => { tw += `tl.fromTo("#${id} .ln circle",{scale:1.6,svgOrigin:"540 760"},{scale:1,svgOrigin:"540 760",duration:1.2,stagger:0.12,ease:"expo.out",immediateRender:true},${T(t)});\n`; } });
// 20 "Tap my profile picture and watch my latest Story before it disappears… the exact sign" — story ring, tap, ring fades, a sign appears
scene(at("tap my profile"), { title: "MY LATEST STORY",
  lines: `<circle cx="540" cy="700" r="150"/>` + `<g transform="translate(540 760)"><circle cx="0" cy="-90" r="42"/><path d="M-88 40Q-88 -36 0 -36Q88 -36 88 40"/></g>`,
  fills: `<circle id="c20ring" cx="540" cy="700" r="178" fill="none" stroke="url(#gStory)" stroke-width="9" stroke-linecap="round" stroke-dasharray="0.5 10" pathLength="0" opacity="0"/><circle id="c20rp" cx="540" cy="700" r="150" fill="none" stroke="#fff" stroke-width="4" opacity="0"/>`
    + `<path id="c20st" d="M700 520Q706 554 740 560Q706 566 700 600Q694 566 660 560Q694 554 700 520Z" fill="${AMB}" opacity="0"/>`
    + `<g id="c20card" opacity="0"><line x1="200" y1="930" x2="880" y2="930" stroke="${LAV}" stroke-width="3" stroke-dasharray="0.5 9" stroke-linecap="round"/><text x="540" y="995" text-anchor="middle" font-family="Inter" font-weight="500" font-size="44" fill="#A9A6BD">Tap my <tspan fill="#fff" font-weight="700">profile picture</tspan></text><text x="540" y="1052" text-anchor="middle" font-family="Inter" font-weight="500" font-size="40" fill="#7E7B92">watch my latest Story before it disappears</text><line x1="200" y1="1090" x2="880" y2="1090" stroke="${LAV}" stroke-width="3" stroke-dasharray="0.5 9" stroke-linecap="round"/></g>`,
  fx: (id, t) => {
    tw += `tl.fromTo("#c20ring",{opacity:0,rotation:0,svgOrigin:"540 700"},{opacity:1,rotation:120,svgOrigin:"540 700",duration:${T(TOTAL - t)},ease:"none",immediateRender:true},${T(t + 0.2)});tl.to("#c20ring",{opacity:0.25,duration:1.2},${T(at("disappears", t))});\n`;
    for (let r = t + 0.6; r < t + 4; r += 1.3) tw += `tl.fromTo("#c20rp",{scale:1,opacity:0.9,svgOrigin:"540 700"},{scale:1.45,opacity:0,duration:0.9,ease:"power2.out",immediateRender:false},${T(r)});\n`;
    tw += `tl.fromTo("#c20st",{opacity:0,scale:0.2,svgOrigin:"700 560"},{opacity:1,scale:1,svgOrigin:"700 560",duration:0.6,ease:"back.out(3)",immediateRender:true},${T(at("exact sign", t))});tl.fromTo("#c20card",{opacity:0,y:20},{opacity:1,y:0,duration:0.7,ease:"expo.out",immediateRender:true},${T(t + 0.5)});\n`;
    sfx("pop", t + 0.6, -20); sfx("sting", at("exact sign", t), -20);
  } });

// ---------- build scenes: dotted strokes revealed by a mask that draws on; previous scene dissolves (blur + drift) ----------
scenes.forEach((s, i) => {
  const id = `sc${i}`, e = i < scenes.length - 1 ? scenes[i + 1].t : TOTAL;
  html += `<g id="${id}" opacity="0"><mask id="mk${i}" maskUnits="userSpaceOnUse" x="0" y="0" width="1080" height="1920"><g fill="none" stroke="#fff" stroke-width="22" stroke-linecap="round" stroke-linejoin="round">${maskify(s.lines)}</g></mask>
<g class="ln" mask="url(#mk${i})">${s.lines}</g>${s.fills || ""}</g>\n`;
  const ti = Math.max(0, s.t - 0.15);
  tw += `tl.fromTo("#${id}",{opacity:0,y:18,filter:"blur(8px)"},{opacity:1,y:0,filter:"blur(0px)",duration:0.7,ease:"expo.out",immediateRender:${i === 0}},${T(ti)});\n`;
  tw += `tl.fromTo("#mk${i} [pathLength]",{attr:{"stroke-dashoffset":1}},{attr:{"stroke-dashoffset":0},duration:1.4,stagger:${Math.min(0.12, 1.2 / (s.lines.match(/<(path|circle|rect|ellipse|line)/g) || [1]).length)},ease:"power2.inOut",immediateRender:${i === 0}},${T(ti)});\n`;
  if (i < scenes.length - 1) tw += `tl.to("#${id}",{opacity:0,y:-24,filter:"blur(10px)",duration:0.55,ease:"power2.in"},${T(e - 0.5)});\n`;
  // section title (small caps at the top), with optional title changes inside the scene
  const tts = [[s.t, s.title], ...(s.titles || []).map(([p, x]) => [at(p, s.t), x])].filter(([, x]) => x);
  tts.forEach(([ts, x], k) => {
    const tid = `${id}t${k}`, te = k < tts.length - 1 ? tts[k + 1][0] : e;
    html += `<text id="${tid}" class="ttl" x="540" y="262" text-anchor="middle" opacity="0">${x}</text>\n`;
    tw += `tl.fromTo("#${tid}",{opacity:0,y:14,filter:"blur(6px)"},{opacity:1,y:0,filter:"blur(0px)",duration:0.6,ease:"expo.out",immediateRender:false},${T(ts + 0.1)});tl.to("#${tid}",{opacity:0,duration:0.4},${T(te - 0.45)});\n`;
  });
  s.fx?.(id, s.t, e);
  sfx("whoosh", s.t - 0.1, -30);
});

// blanks at the top fill with the ritual phrase when it is spoken
const PH = [["OPEN", "open"], ["YOUR", "your"], ["RIGHT", "right"], ["HAND.", "hand"]];
const BW = PH.map(([x]) => x.length * 40 + 30), BX = []; { let x = 540 - (BW.reduce((a, b) => a + b) + 28 * 3) / 2; BW.forEach((w) => { BX.push(x); x += w + 28; }); }
html += PH.map(([x], k) => `<line x1="${BX[k]}" y1="150" x2="${BX[k] + BW[k]}" y2="150" stroke="#8C88A6" stroke-width="3"/><text id="bl${k}" class="blank" x="${BX[k] + BW[k] / 2}" y="134" text-anchor="middle" opacity="0">${x}</text>`).join("") + "\n";
let bf = blanksAt; PH.forEach(([, w], k) => { const ts = at(w, bf); bf = ts; tw += `tl.fromTo("#bl${k}",{opacity:0,y:10,filter:"blur(8px)"},{opacity:1,y:0,filter:"blur(0px)",duration:0.45,ease:"expo.out",immediateRender:false},${T(ts)});\n`; });
sfx("hit", blanksAt, -18);

// ---------- captions: one line (<=5 words), grey, the spoken word gets a dark pill ----------
const groups = []; let g = [];
words.forEach((w, i) => { g.push(w); const nx = words[i + 1]; if (/[.,?!]$/.test(w.text) || g.length >= 5 || !nx || nx.start - w.end > 0.35) { groups.push(g); g = []; } });
const caps = groups.map((gr, i) => { const st = gr[0].start - 0.05, en = Math.min(groups[i + 1] ? groups[i + 1][0].start - 0.05 : TOTAL, gr.at(-1).end + 0.7); return { id: `c${i}`, st, dur: en - st, ws: gr.map((w, j) => ({ id: `c${i}w${j}`, t: w.start, e: gr[j + 1] ? gr[j + 1].start : en, txt: w.text.replace(/&/g, "&amp;") })) }; });
fs.writeFileSync(P + "/compositions/caps.html", `<template>
<style>#root{position:absolute;inset:0;} .cg{position:absolute;left:0;top:1170px;width:1080px;text-align:center;}
.cw{display:inline-block;margin:0 3px;padding:4px 12px;border-radius:12px;font-family:Inter;font-weight:500;font-size:44px;color:#8F8CA3;letter-spacing:.01em;}</style>
<div id="root" data-composition-id="caps" data-width="1080" data-height="1920">
${caps.map((c) => `<div id="${c.id}" class="clip cg" data-start="${T(c.st)}" data-duration="${T(c.dur)}">${c.ws.map((w) => `<span class="cw" id="${w.id}">${w.txt}</span>`).join("")}</div>`).join("\n")}
</div><script>const tl = gsap.timeline({ paused: true });
${caps.map((c) => `tl.fromTo("#${c.id}",{opacity:0,y:8},{opacity:1,y:0,duration:0.3,ease:"expo.out"},${T(c.st)});` + c.ws.map((w) => `tl.to("#${w.id}",{backgroundColor:"rgba(58,56,72,.95)",color:"#ffffff",duration:0.08},${T(w.t - 0.03)});tl.to("#${w.id}",{backgroundColor:"rgba(58,56,72,0)",color:"#8F8CA3",duration:0.12},${T(w.e - 0.03)});`).join("")).join("\n")}
tl.set({}, {}, ${TOTAL}); window.__timelines["caps"] = tl;</script></template>`);

// ---------- audio: voice, ambient bed, a few soft accents ----------
ff(["-hide_banner", "-y", "-i", VO, "-ac", "1", "-ar", "48000", P + "/assets/voice.wav"]);
const getI = (txt) => { const m = txt.match(/"input_i"\s*:\s*"(-?[\d.]+)"/); return m ? +m[1] : null; };
const voI = getI(ff(["-hide_banner", "-i", P + "/assets/voice.wav", "-af", "loudnorm=print_format=json", "-f", "null", "-"]));
const muI = getI(ff(["-hide_banner", "-t", String(TOTAL), "-i", MUSIC, "-af", "loudnorm=print_format=json", "-f", "null", "-"]));
const loops = Math.max(0, Math.ceil(TOTAL / ffp(MUSIC)) - 1);
ff(["-hide_banner", "-y", "-stream_loop", String(loops), "-i", MUSIC, "-t", String(TOTAL), "-af", `volume=${(voI - 15 - muI).toFixed(2)}dB,afade=t=in:d=1,afade=t=out:st=${(TOTAL - 2.5).toFixed(2)}:d=2.5`, "-ar", "48000", "-ac", "2", P + "/assets/music.wav"]);
const KIT = { whoosh: [0.265, -16.2], riser: [2.389, -6.0], hit: [0.0, -12.8], tick: [0.002, -17.4], pop: [0.0, -19.1], bell1: [0, -13.1], bell2: [0, -10.6], bell3: [0, -10.0], sting: [0.139, -10.1] };
const audio = cues.filter((c) => c.t >= 0).sort((a, b) => a.t - b.t).map((c, i) => { const [pk, mm] = KIT[c.kind]; fs.copyFileSync(LK + c.kind + ".wav", P + `/assets/k_${c.kind}.wav`); return `<audio id="fx${i}" class="clip" src="assets/k_${c.kind}.wav" data-start="${T(Math.max(0, c.t - pk))}" data-duration="2.6" data-track-index="${6 + (i % 4)}" data-volume="${Math.min(1, Math.pow(10, (voI + c.rel - mm) / 20)).toFixed(3)}"></audio>`; });

// ---------- stars + page ----------
const stars = [...Array(70).keys()].map(() => `<circle cx="${(rnd() * 1080).toFixed(0)}" cy="${(rnd() * 1920).toFixed(0)}" r="${(0.8 + rnd() * 1.8).toFixed(1)}" fill="#fff" opacity="${(0.15 + rnd() * 0.5).toFixed(2)}"/>`).join("");
fs.writeFileSync(P + "/index.html", `<!doctype html>
<html lang="en"><head><meta charset="UTF-8" /><meta name="viewport" content="width=1080, height=1920" />
<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Inter:wght@500;600;700&display=block" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js"></script>
<style>*{margin:0;padding:0;box-sizing:border-box;} html,body{width:1080px;height:1920px;overflow:hidden;background:#050507;}
#sky{position:absolute;inset:0;background:radial-gradient(ellipse 70% 50% at 50% 40%,#0E0D16 0%,#050507 70%);}
svg#art{position:absolute;inset:0;}
.ln *{fill:none;stroke:${LAV};stroke-width:4.5;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:0.5 8;}
.ln .am,.ln .am *,.ln .pl{stroke:${AMB};} .ln .aq{stroke:${AQUA};}
.ln{filter:drop-shadow(0 0 5px rgba(220,216,245,.85)) drop-shadow(0 0 16px rgba(170,160,255,.35));}
.ttl{font-family:Inter;font-weight:600;font-size:36px;letter-spacing:.2em;fill:#B9B4D6;}
.blank{font-family:Inter;font-weight:700;font-size:58px;letter-spacing:.08em;fill:#EDEAFB;}
#grain{position:absolute;inset:0;opacity:.10;mix-blend-mode:screen;pointer-events:none;}</style></head><body>
<div id="root" data-composition-id="main" data-start="0" data-duration="${TOTAL}" data-width="1080" data-height="1920">
<div id="sky"></div>
<svg id="art" viewBox="0 0 1080 1920"><defs>
<radialGradient id="gLav"><stop offset="0" stop-color="#fff"/><stop offset=".35" stop-color="#C9BCFF"/><stop offset=".7" stop-color="rgba(150,130,255,.35)"/><stop offset="1" stop-color="rgba(150,130,255,0)"/></radialGradient>
<radialGradient id="gAmb"><stop offset="0" stop-color="#FFF3D6"/><stop offset=".35" stop-color="#F7C27A"/><stop offset=".7" stop-color="rgba(242,163,58,.35)"/><stop offset="1" stop-color="rgba(242,163,58,0)"/></radialGradient>
<radialGradient id="gSun"><stop offset="0" stop-color="#FFF1D0"/><stop offset=".55" stop-color="rgba(242,182,107,.65)"/><stop offset="1" stop-color="rgba(242,182,107,0)"/></radialGradient>
<radialGradient id="gMoon" cx=".42" cy=".38"><stop offset="0" stop-color="#E6E3F5"/><stop offset=".7" stop-color="#9C98B8"/><stop offset="1" stop-color="#6C6888"/></radialGradient>
<radialGradient id="gHalo"><stop offset=".55" stop-color="rgba(200,190,255,.22)"/><stop offset="1" stop-color="rgba(200,190,255,0)"/></radialGradient>
<linearGradient id="gStory" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${AMB}"/><stop offset="1" stop-color="#B9A6FF"/></linearGradient>
<filter id="tex"><feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="2" seed="3" result="n"/><feColorMatrix in="n" type="saturate" values="0" result="g"/><feComposite in="g" in2="SourceGraphic" operator="in" result="gm"/><feBlend in="SourceGraphic" in2="gm" mode="multiply"/></filter>
<clipPath id="phoneClip"><rect x="400" y="520" width="280" height="540" rx="36"/></clipPath><clipPath id="horizon"><rect x="0" y="0" width="1080" height="980"/></clipPath>
</defs>${stars}
${html}</svg>
<svg id="grain" viewBox="0 0 1080 1920"><filter id="gr"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="9"/><feColorMatrix type="saturate" values="0"/></filter><rect width="1080" height="1920" filter="url(#gr)"/></svg>
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
console.log(`v19: ${TOTAL}s, scenes ${scenes.length}, caps ${caps.length}, sfx ${audio.length}`);
if (RENDER) {
  const out = P + "/../v19-ritual-888-final.mp4", tmp = P + "-render.mp4";
  const r = spawnSync("npx", ["hyperframes@0.9.67", "render", "--workers", "5", "--fps", "30", "--crf", "20", "-o", `"${tmp}"`], { cwd: P, env, encoding: "utf8", shell: true, maxBuffer: 1 << 26 });
  if (r.status !== 0) throw new Error("render failed: " + (r.stderr || r.stdout).slice(-800));
  ff(["-hide_banner", "-y", "-i", tmp, "-c:v", "copy", "-af", "loudnorm=I=-15:TP=-1.5:LRA=11", "-ar", "48000", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", out]);
  fs.rmSync(tmp, { force: true }); fs.rmSync(P + "/.hyperframes", { recursive: true, force: true });
  console.log("rendered " + out);
}

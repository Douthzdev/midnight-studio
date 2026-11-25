// "Apple minimal kinetic typography" edit: silence-cut talking head, word-by-word blur captions (lead / bold / serif accent),
// full-screen light takeovers, bottom split panels, one red impact screen. Authored per video (BLOCKS + SEGS below).
// usage: node tools/clean.mjs [video.mp4 slug transcriptDir] [--hybrid]
//   --hybrid = same structure/typography, but the viral look: dark aurora + glass + glow + gradient numbers, focus brackets, shakes
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const ARGS = process.argv.slice(2).filter((a) => !a.startsWith("--")), HYB = process.argv.includes("--hybrid");
const SRC = "M:/Google/hyperframes/Midnight-Studio/auraly-split/src";
const RAW = ARGS[0] || "M:/Google/marva_bay_leaf_FINAL.mp4", SLUG = (ARGS[1] || "marva-bayleaf") + (HYB ? "-hybrid" : "");
const TR = (ARGS[2] || SRC + "/t_marva_bay_leaf_final_body") + "/transcript.json";
if (!fs.existsSync(RAW)) throw new Error("video not found: " + RAW);
const P = "M:/Google/hyperframes/Midnight-Studio/auraly-clean/" + SLUG;
const MUSIC = "C:/Users/Vinicius/Music/Songs Auraly UGC/MORNING LIGHTT.MP3";
const SFXD = "M:/Google/hyperframes/Midnight-Studio/auraly-lineart/sfx/clean/";
const ff = (args) => { const r = spawnSync("ffmpeg", args, { encoding: "utf8" }); return (r.stderr || "") + (r.stdout || ""); };
const ffp = (f) => +spawnSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f], { encoding: "utf8" }).stdout.trim();
const T = (x) => (+x).toFixed(3);

// ---------- silence cut ----------
const sil = [...ff(["-hide_banner", "-i", RAW, "-af", "silencedetect=noise=-40dB:d=0.3", "-f", "null", "-"]).matchAll(/silence_(start|end): ([\d.]+)/g)].map((m) => +m[2]);
const rawLen = ffp(RAW), PAD = 0.12, keep = []; let cur = 0;
for (let i = 0; i + 1 < sil.length; i += 2) { const [a, b] = [sil[i], sil[i + 1]]; const cs = a < 0.05 ? 0 : a + PAD, ce = b > rawLen - 0.05 ? rawLen : b - PAD; if (ce - cs < 0.15) continue; if (cs > cur) keep.push([cur, cs]); cur = ce; }
if (sil.length % 2) { const a = sil.at(-1); if (a + PAD > cur) { keep.push([cur, a + PAD]); cur = rawLen; } }
if (cur < rawLen - 0.05) keep.push([cur, rawLen]);
const offs = []; let acc = 0; for (const [a, b] of keep) { offs.push(acc); acc += b - a; }
const mapT = (t) => { for (let i = keep.length - 1; i >= 0; i--) if (t >= keep[i][0]) return offs[i] + Math.min(t, keep[i][1]) - keep[i][0]; return 0; };
fs.mkdirSync(P + "/assets", { recursive: true });
const BODY = P + "/assets/body.mp4";
const fc = keep.map(([a, b], i) => `[0:v]trim=${a.toFixed(3)}:${b.toFixed(3)},setpts=PTS-STARTPTS[v${i}];[0:a]atrim=${a.toFixed(3)}:${b.toFixed(3)},asetpts=PTS-STARTPTS[a${i}];`).join("") + keep.map((_, i) => `[v${i}][a${i}]`).join("") + `concat=n=${keep.length}:v=1:a=1[v][a]`;
ff(["-hide_banner", "-y", "-i", RAW, "-filter_complex", fc, "-map", "[v]", "-map", "[a]", "-c:v", "h264_nvenc", "-preset", "p5", "-rc", "vbr", "-cq", "19", "-b:v", "0", "-c:a", "aac", "-b:a", "192k", BODY]);
const words = JSON.parse(fs.readFileSync(TR)).map((w) => ({ ...w, start: +mapT(w.start).toFixed(3), end: +mapT(w.end).toFixed(3) }));
const TOTAL = +(Math.min(acc, words.at(-1).end + 1.0)).toFixed(3);

// ---------- authored copy: blocks of lines ("~" = small lead line, *word* = serif italic accent) ----------
const BLOCKS = [
  ["~Make a wish", "in the next", "*five* *seconds.*"],
  { hide: 5 },                                   // "One, two, three, four, five." -> the counter is the caption
  ["Got *it?*"],
  ["~Now, to make sure", "that wish comes *true,*"],
  ["~interact with this video", "three *times.*"],
  ["~Send it to", "a *friend,*"],
  ["~and watch what happens", "in the next *two* *days.*"],
  ["~Then tap my", "profile *picture*"],
  ["~and check", "my *stories.*"],
  ["~Because I left a", "special three card", "*reading* *there*"],
  ["~to help you", "explore what", "the *universe*"],
  ["~may be revealing", "about your *wish.*"],
];
let wi = 0;
const blocks = BLOCKS.map((b) => {
  if (b.hide) { const ws = words.slice(wi, wi + b.hide); wi += b.hide; return { hide: true, ws, t: ws[0].start }; }
  const lines = b.map((ln) => { const lead = ln.startsWith("~"); const toks = (lead ? ln.slice(1) : ln).split(" "); return { lead, toks: toks.map((tk) => ({ txt: tk.replace(/\*/g, ""), acc: tk.startsWith("*"), w: words[wi++] })) }; });
  return { lines, t: lines[0].toks[0].w.start };
});
if (wi !== words.length) console.warn(`copy uses ${wi} words, transcript has ${words.length}`);
blocks.forEach((b, i) => { b.end = i < blocks.length - 1 ? blocks[i + 1].t : TOTAL; });
const tb = (i) => blocks[i].t;      // block start
const wt = (bi, txt) => { const b = blocks[bi]; const all = b.hide ? b.ws : b.lines.flatMap((l) => l.toks.map((k) => k.w)); const m = all.find((w) => w.text.toLowerCase().replace(/[^a-z0-9]/g, "") === txt); if (!m) throw new Error(`word ${txt} in block ${bi}`); return m.start; };

// screen modes: over (face), full (light takeover), panel (bottom split), red (impact)
const SEGS = [
  { mode: "full", from: 1, to: 2, art: "counter" },
  { mode: "panel", from: 3, to: 5, art: "starChips" },
  { mode: "full", from: 5, to: 7, art: "phoneCal" },
  { mode: "panel", from: 7, to: 9, art: "profile" },
  { mode: "red", from: 9, to: 10, art: "cards" },
];
const modeOf = (bi) => (SEGS.find((s) => bi >= s.from && bi < s.to) || { mode: "over" }).mode;
SEGS.forEach((s) => { s.t = tb(s.from) - 0.25; s.e = s.to < blocks.length ? tb(s.to) - 0.12 : TOTAL; });

let html = "", tw = ""; const cues = []; let n = 0;
const uid = (p) => p + n++;
const sfx = (k, t) => cues.push({ k, t });

// ---------- captions ----------
blocks.forEach((b, bi) => {
  if (b.hide) return;
  const id = `blk${bi}`, mode = modeOf(bi);
  html += `<div id="${id}" class="blk m-${mode}">${b.lines.map((l) => `<div class="ln ${l.lead ? "lead" : "main"}">${l.toks.map((k, j) => `<span class="w${k.acc ? " acc" : ""}" id="${id}w${n++}">${k.txt}</span>`).join(" ")}</div>`).join("")}</div>\n`;
  let j0 = n - b.lines.reduce((s, l) => s + l.toks.length, 0);
  b.lines.forEach((l) => l.toks.forEach((k) => {
    const t = Math.max(0, k.w.start - 0.06);
    tw += `tl.fromTo("#${id}w${j0++}",{opacity:0,y:14,filter:"blur(12px)"},{opacity:1,y:0,filter:"blur(0px)",duration:0.28,ease:"power3.out",immediateRender:${t < 0.01}},${T(t)});\n`;
    if (k.acc) sfx("lip", k.w.start);
  }));
  tw += `tl.set("#${id}",{opacity:1},${T(Math.max(0, b.t - 0.08))});`;
  tw += `tl.to("#${id}",{opacity:0,y:-10,filter:"blur(10px)",duration:0.2,ease:"power2.in"},${T(b.end - 0.16)});\n`;
  sfx("plop", b.t);
});

// ---------- art per segment ----------
const ART = {
  counter(s) {
    const id = uid("cnt"), num = [1, 2, 3, 4, 5], ws = blocks[1].ws;
    html += `<div class="hdr" id="${id}h"><div class="ln lead dk">Make a wish</div><div class="ln main dk">in <span class="acc">five</span> <span class="acc">seconds.</span></div></div>
<div class="tile" id="${id}" style="left:290px;top:760px;width:500px;height:500px"><svg viewBox="0 0 200 200" class="ring"><circle cx="100" cy="100" r="80" class="trk"/><circle id="${id}r" cx="100" cy="100" r="80" class="prg" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="1"/></svg><div class="bignum" id="${id}n">0</div></div>
<div class="burst" id="${id}b">${[...Array(10)].map((_, i) => `<i style="transform:rotate(${i * 36}deg) translateY(-300px)"></i>`).join("")}</div>`;
    tw += `tl.fromTo("#${id}h .ln",{opacity:0,y:14,filter:"blur(12px)"},{opacity:1,y:0,filter:"blur(0px)",duration:0.3,stagger:0.12,immediateRender:false},${T(s.t + 0.2)});\n`;
    tw += `tl.fromTo("#${id}",{opacity:0,scale:0.7},{opacity:1,scale:1,duration:0.45,ease:"back.out(1.8)",immediateRender:false},${T(s.t + 0.25)});\n`;
    sfx("popin", s.t + 0.25);
    ws.forEach((w, k) => {
      tw += `tl.set("#${id}n",{innerText:"${num[k]}"},${T(w.start)});tl.fromTo("#${id}n",{scale:1.25},{scale:1,duration:0.3,ease:"back.out(3)",immediateRender:false},${T(w.start)});tl.fromTo("#${id}r",{attr:{"stroke-dashoffset":${1 - k / 5}}},{attr:{"stroke-dashoffset":${1 - (k + 1) / 5}},duration:0.35,ease:"power2.out",immediateRender:false},${T(w.start)});\n`;
      sfx("tick", w.start);
    });
    const t5 = ws[4].start;
    tw += `tl.fromTo("#${id}b i",{opacity:0,scaleY:0.2},{opacity:1,scaleY:1,duration:0.25,ease:"power2.out",immediateRender:false},${T(t5 + 0.05)});tl.to("#${id}b i",{opacity:0,duration:0.4},${T(t5 + 0.35)});tl.to("#${id}",{boxShadow:"0 30px 80px rgba(232,38,44,.35)",duration:0.3},${T(t5)});\n`;
    sfx("punch", t5 + 0.05);
  },
  starChips(s) {
    const id = uid("star");
    html += `<div class="obj" id="${id}" style="left:390px;top:1180px;width:300px;height:300px"><svg viewBox="0 0 100 100" width="300" height="300"><defs><radialGradient id="${id}g" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#FFF8D6"/><stop offset=".45" stop-color="#FFC93C"/><stop offset="1" stop-color="#E08A00"/></radialGradient></defs><path d="M50 4 C54 38 62 46 96 50 C62 54 54 62 50 96 C46 62 38 54 4 50 C38 46 46 38 50 4Z" fill="url(#${id}g)" style="filter:drop-shadow(0 8px 18px rgba(224,138,0,.45))"/><path d="M50 14 C52 40 58 46 80 50" fill="none" stroke="#fff" stroke-width="2" opacity=".7"/></svg></div>`;
    const tTrue = wt(3, "true");
    tw += `tl.fromTo("#${id}",{opacity:0,scale:0.3,rotation:-30},{opacity:1,scale:1,rotation:0,duration:0.55,ease:"back.out(2)",immediateRender:false},${T(s.t + 0.6)});tl.to("#${id}",{rotation:12,duration:${T(tb(4) - s.t)},ease:"none"},${T(s.t + 1.1)});tl.fromTo("#${id}",{filter:"brightness(1)"},{filter:"brightness(1.35)",duration:0.15,yoyo:true,repeat:1,immediateRender:false},${T(tTrue)});tl.to("#${id}",{opacity:0,scale:0.6,filter:"blur(12px)",duration:0.25},${T(tb(4) - 0.2)});\n`;
    sfx("popin", s.t + 0.6); sfx("ding", tTrue);
    const rows = [["#FF3B30", "Like", "M12 21C5 15 2 12 2 8a5 5 0 0 1 10-2 5 5 0 0 1 10 2c0 4-3 7-10 13Z"], ["#FF9500", "Save", "M6 3h12v18l-6-4-6 4Z"], ["#007AFF", "Share", "M2 11L22 3L15 21L11 13Z"]];
    const t4 = tb(4), tThree = wt(4, "three"), tTimes = wt(4, "times");
    rows.forEach(([c, lbl, d], i) => {
      const rid = uid("row");
      html += `<div class="row" id="${rid}" style="top:${1150 + i * 150}px"><div class="ri" style="background:${c}"><svg viewBox="0 0 24 24"><path d="${d}" fill="#fff"/></svg></div><div class="rl">${lbl}</div><div class="rn" id="${rid}n">0</div></div>`;
      const tin = t4 + 0.15 + i * 0.32;
      tw += `tl.fromTo("#${rid}",{opacity:0,y:40,scale:0.92},{opacity:1,y:0,scale:1,duration:0.4,ease:"back.out(1.7)",immediateRender:false},${T(tin)});tl.set("#${rid}n",{innerText:"1"},${T(tThree + i * 0.16)});tl.fromTo("#${rid}n",{scale:1.4,color:"${c}"},{scale:1,color:"${HYB ? "rgba(0,0,0,0)" : "#111"}",duration:0.35,ease:"back.out(3)",immediateRender:false},${T(tThree + i * 0.16)});\n`;
      sfx("popin", tin); sfx("tick", tThree + i * 0.16);
    });
    sfx("punch", tTimes);
  },
  phoneCal(s) {
    const id = uid("ph"), tSend = wt(5, "send"), tFr = wt(5, "friend"), t7 = tb(6), tTwo = wt(6, "two");
    html += `<div class="phone" id="${id}"><div class="isl"></div><div class="chead"><div class="cav"></div><div class="cname" id="${id}nm">Bestie</div></div>
<div class="bub in">did you see this? 👀</div><div class="bub out" id="${id}b">✨ make a wish, trust me</div><div class="dlv" id="${id}d">Delivered</div></div>
<div class="tile" id="${id}c" style="left:290px;top:880px;width:500px;height:500px"><svg viewBox="0 0 200 200" class="ring"><circle cx="100" cy="100" r="80" class="trk"/><circle id="${id}r" cx="100" cy="100" r="80" class="prg" style="stroke:#007AFF" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="1"/></svg><div class="bignum" style="font-size:150px;margin-top:-30px" id="${id}n">0</div><div class="unit">HOURS</div></div>`;
    tw += `tl.fromTo("#${id}",{opacity:0,y:200,scale:0.9},{opacity:1,y:0,scale:1,duration:0.55,ease:"back.out(1.4)",immediateRender:false},${T(s.t + 0.25)});\n`;
    tw += `tl.fromTo("#${id}b",{opacity:0,y:60,scale:0.6},{opacity:1,y:0,scale:1,duration:0.4,ease:"back.out(2)",immediateRender:false},${T(tSend + 0.1)});tl.fromTo("#${id}d",{opacity:0},{opacity:1,duration:0.2,immediateRender:false},${T(tFr)});\n`;
    tw += `tl.to("#${id}",{opacity:0,scale:0.85,y:-60,filter:"blur(14px)",duration:0.3,ease:"power2.in"},${T(t7 - 0.1)});\n`;
    tw += `tl.fromTo("#${id}c",{opacity:0,scale:0.7},{opacity:1,scale:1,duration:0.45,ease:"back.out(1.8)",immediateRender:false},${T(t7 + 0.1)});tl.fromTo("#${id}r",{attr:{"stroke-dashoffset":1}},{attr:{"stroke-dashoffset":0},duration:0.9,ease:"power2.inOut",immediateRender:false},${T(tTwo - 0.1)});tl.fromTo("#${id}n",{innerText:0},{innerText:48,snap:{innerText:1},duration:0.9,ease:"power2.inOut",immediateRender:false},${T(tTwo - 0.1)});\n`;
    sfx("swish", s.t + 0.25); sfx("send", tSend + 0.1); sfx("ding", tFr); sfx("popin", t7 + 0.1); sfx("punch", tTwo + 0.8);
  },
  profile(s) {
    const id = uid("pf"), tTap = wt(7, "tap"), tSt = wt(8, "stories");
    html += `<div class="pf" id="${id}"><div class="pring" id="${id}r"></div><div class="ppic"><svg viewBox="0 0 64 64"><circle cx="32" cy="25" r="12" fill="#C7C7CC"/><path d="M9 60C11 43 53 43 55 60Z" fill="#C7C7CC"/></svg></div><div class="tapr" id="${id}t"></div><div class="tapr" id="${id}t2"></div></div>
<div class="pill" id="${id}p">● 1 new story</div>`;
    tw += `tl.fromTo("#${id}",{opacity:0,scale:0.5},{opacity:1,scale:1,duration:0.5,ease:"back.out(1.8)",immediateRender:false},${T(s.t + 0.5)});tl.fromTo("#${id}r",{rotation:0},{rotation:300,duration:${T(s.e - s.t)},ease:"none"},${T(s.t)});\n`;
    tw += `tl.fromTo("#${id}t",{scale:0.3,opacity:0.9},{scale:1.9,opacity:0,duration:0.6,ease:"power2.out",immediateRender:false},${T(tTap)});tl.fromTo("#${id}t2",{scale:0.3,opacity:0.9},{scale:1.9,opacity:0,duration:0.6,ease:"power2.out",immediateRender:false},${T(tTap + 0.2)});tl.fromTo("#${id}",{scale:1},{scale:0.94,duration:0.1,yoyo:true,repeat:1,immediateRender:false},${T(tTap)});\n`;
    tw += `tl.fromTo("#${id}p",{opacity:0,y:20,scale:0.8},{opacity:1,y:0,scale:1,duration:0.4,ease:"back.out(2.5)",immediateRender:false},${T(tSt)});\n`;
    sfx("popin", s.t + 0.5); sfx("tap", tTap); sfx("ding", tSt);
  },
  cards(s) {
    const id = uid("cards"), tThree = wt(9, "three"), tCard = wt(9, "card"), tRead = wt(9, "reading");
    [-1, 0, 1].forEach((k, i) => {
      html += `<div class="tcard" id="${id}${i}" style="left:${400 + k * 230}px;top:1080px"><div class="tin"><svg viewBox="0 0 40 40"><path d="M20 4 L23 17 L36 20 L23 23 L20 36 L17 23 L4 20 L17 17Z" fill="#F4C66B"/></svg></div></div>`;
      const t = [tThree, tCard, tRead][i];
      tw += `tl.fromTo("#${id}${i}",{opacity:0,y:420,rotation:${k * 30},scale:0.8},{opacity:1,y:${k === 0 ? -30 : 10},rotation:${k * 12},scale:1,duration:0.5,ease:"back.out(1.6)",immediateRender:false},${T(t)});\n`;
      sfx("plop", t);
    });
  },
};

// segment containers + transitions
SEGS.forEach((s, i) => {
  const before = html.length; ART[s.art](s);
  html = html.slice(0, before) + `<div class="sa s${i}">` + html.slice(before) + `</div>
`;
  if (s.mode === "full") {
    tw += `tl.fromTo("#bgL${i}",{opacity:0,scale:1.04,filter:"blur(30px)"},{opacity:1,scale:1,filter:"blur(0px)",duration:0.35,ease:"power2.out",immediateRender:false},${T(s.t)});tl.to("#bgL${i}",{opacity:0,filter:"blur(30px)",duration:0.3,ease:"power2.in"},${T(s.e - 0.25)});\n`;
    html = `<div class="full" id="bgL${i}"></div>\n` + html;
    sfx("swipe", s.t);
  } else if (s.mode === "panel") {
    html = `<div class="panel" id="bgL${i}"></div>\n` + html;
    tw += `tl.fromTo("#bgL${i}",{y:1100},{y:0,duration:0.5,ease:"back.out(1.15)",immediateRender:false},${T(s.t)});tl.to("#bgL${i}",{y:1100,duration:0.35,ease:"power2.in"},${T(s.e - 0.3)});tl.fromTo("#face",{filter:"brightness(1)"},{filter:"brightness(0.8)",duration:0.4,immediateRender:false},${T(s.t)});tl.to("#face",{filter:"brightness(1)",duration:0.3},${T(s.e - 0.3)});\n`;
    sfx("swipe", s.t);
  } else if (s.mode === "red") {
    html = `<div class="red" id="bgL${i}"></div>\n` + html;
    tw += `tl.fromTo("#bgL${i}",{clipPath:"circle(0% at 50% 42%)"},{clipPath:"circle(120% at 50% 42%)",duration:0.55,ease:"power3.in",immediateRender:false},${T(s.t)});tl.to("#bgL${i}",{opacity:0,filter:"blur(20px)",duration:0.35},${T(s.e - 0.3)});\n`;
    sfx("whoosh", s.t + 0.2); sfx("punch", s.t + 0.55);
  }
});
// art elements fade with their segment: tag by segment via wrapper is simpler — fade all .obj-like children at segment end
SEGS.forEach((s, i) => { tw += `tl.to(${JSON.stringify(`.s${i}`)},{opacity:0,filter:"blur(12px)",duration:0.25},${T(s.e - 0.28)});\n`; });

if (HYB) {
  const e0 = SEGS[0].t;
  html += `<div id="foc" class="focus">${["tl", "tr", "bl", "br"].map((c) => `<i class="${c}"></i>`).join("")}<div class="flabel">MAKE A WISH</div></div>
`;
  tw += `tl.fromTo("#foc",{opacity:0,scale:1.25},{opacity:1,scale:1,duration:0.35,ease:"power3.out"},0.05);tl.to("#foc",{opacity:0,scale:0.95,duration:0.25},${T(e0 - 0.05)});tl.fromTo("#zoom",{scale:1.12},{scale:1,duration:${T(Math.max(0.5, e0))},ease:"power1.out"},0);
`;
  sfx("punch", 0.08);
  const shake = (t) => { tw += `tl.to("#root",{keyframes:{x:[0,-12,10,-7,4,0]},duration:0.35},${T(t)});
`; };
  shake(blocks[1].ws[4].start + 0.05); shake(SEGS[4].t + 0.55);
  const tEnd = tb(10), sp = [];
  for (let i = 0; i < 22; i++) { const x = 80 + ((i * 397) % 920), y = 700 + ((i * 211) % 900), sz = 4 + (i % 4) * 3; sp.push(`<i class="spk" id="spk${i}" style="left:${x}px;top:${y}px;width:${sz}px;height:${sz}px"></i>`); tw += `tl.fromTo("#spk${i}",{opacity:0,y:0},{opacity:0.9,y:-${120 + (i % 5) * 40},duration:2.4,ease:"sine.out",immediateRender:false},${T(tEnd + (i % 7) * 0.25)});tl.to("#spk${i}",{opacity:0,duration:0.6},${T(tEnd + 2.4 + (i % 7) * 0.25)});
`; }
  html += `<div id="endglow"></div>${sp.join("")}
`;
  tw += `tl.fromTo("#endglow",{opacity:0},{opacity:1,duration:1.2,immediateRender:false},${T(tEnd)});
`;
  sfx("ding", tEnd); sfx("whoosh", tEnd - 0.3);
}
// punch-ins on the jump cuts + soft end glow
offs.slice(1).forEach((c, i) => { tw += `tl.set("#zoom",{scale:${i % 2 ? 1 : 1.08}},${T(c)});\n`; });

// ---------- audio ----------
ff(["-hide_banner", "-y", "-i", BODY, "-vn", "-ac", "1", "-ar", "48000", P + "/assets/voice.wav"]);
const getI = (txt) => { const m = txt.match(/"input_i"\s*:\s*"(-?[\d.]+)"/); return m ? +m[1] : null; };
const voI = getI(ff(["-hide_banner", "-i", P + "/assets/voice.wav", "-af", "loudnorm=print_format=json", "-f", "null", "-"]));
const muI = getI(ff(["-hide_banner", "-t", String(TOTAL + 1), "-i", MUSIC, "-af", "loudnorm=print_format=json", "-f", "null", "-"]));
ff(["-hide_banner", "-y", "-i", MUSIC, "-t", String(TOTAL + 0.5), "-af", `volume=${(voI - 15 - muI).toFixed(2)}dB,afade=t=in:d=0.3,afade=t=out:st=${(TOTAL - 1.5).toFixed(2)}:d=1.5`, "-ar", "48000", "-ac", "2", P + "/assets/music.wav"]);
// [peak time in file, volume]
const KIT = { plop: [0.015, 0.2], lip: [0.009, 0.19], popin: [0.019, 0.26], swipe: [0.131, 0.34], swish: [0.155, 0.3], punch: [0.058, 0.5], tick: [0.004, 0.22], tap: [0.013, 0.42], ding: [0.005, 0.22], send: [0.3, 0.3], whoosh: [0.35, 0.4] };
cues.sort((a, b) => a.t - b.t);
const last = {}, kept = [];
for (const c of cues) { if (last[c.k] != null && c.t - last[c.k] < 0.12) continue; last[c.k] = c.t; kept.push(c); }
const audio = kept.map((c, i) => { fs.copyFileSync(SFXD + c.k + ".wav", P + "/assets/s_" + c.k + ".wav"); return `<audio id="fx${i}" class="clip" src="assets/s_${c.k}.wav" data-start="${T(Math.max(0, c.t - KIT[c.k][0]))}" data-duration="${T(Math.min(2.0, ffp(SFXD + c.k + ".wav")))}" data-track-index="${7 + (i % 4)}" data-volume="${KIT[c.k][1]}"></audio>`; });

// segment class tagging: art html was appended in order; wrap each segment's art in a div
// (done by re-building: simpler to tag every element id created inside ART[s.art] — see seg wrappers below)
const css = `*{margin:0;padding:0;box-sizing:border-box;}
html,body{width:1080px;height:1920px;overflow:hidden;background:#000;}
#face,#zoom{position:absolute;inset:0;} #zoom{transform-origin:540px 560px;}
#zoom video{position:absolute;left:0;top:0;width:1080px;height:1920px;object-fit:cover;}
.full{position:absolute;inset:0;background:#F2F2F4;opacity:0;}
.panel{position:absolute;left:0;top:860px;width:1080px;height:1100px;background:#F2F2F4;border-radius:56px 56px 0 0;box-shadow:0 -20px 60px rgba(0,0,0,.25);transform:translateY(1100px);}
.red{position:absolute;inset:0;background:#E8262C;clip-path:circle(0% at 50% 42%);}
.blk{position:absolute;left:60px;width:960px;text-align:center;opacity:0;}
.blk.m-over{top:1250px;} .blk.m-full{top:300px;} .blk.m-panel{top:930px;} .blk.m-red{top:560px;}
.ln{line-height:1.08;} .ln.lead{font-family:Inter;font-weight:500;font-size:46px;margin-bottom:8px;} .ln.main{font-family:Inter;font-weight:800;font-size:80px;letter-spacing:-.02em;}
.w{display:inline-block;} .acc{font-family:'Instrument Serif',serif;font-style:italic;font-weight:400;font-size:1.18em;letter-spacing:0;}
.ln.lead .acc{font-size:1.1em;}
.m-over .ln{color:#fff;text-shadow:0 4px 24px rgba(0,0,0,.45),0 1px 3px rgba(0,0,0,.35);} .m-over .lead{color:rgba(255,255,255,.85);}
.m-full .ln,.m-panel .ln{color:#111;} .m-full .lead,.m-panel .lead{color:#8E8E93;}
.m-red .ln{color:#fff;} .m-red .lead{color:rgba(255,255,255,.85);} .m-red .main{font-size:92px;} .m-red .acc{font-size:1.25em;}
.hdr .ln{opacity:0;}
.hdr{position:absolute;left:60px;top:300px;width:960px;text-align:center;} .hdr .dk{color:#111;} .hdr .lead.dk{color:#8E8E93;}
.tile{position:absolute;background:#fff;border-radius:96px;box-shadow:0 30px 80px rgba(0,0,0,.12);display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:0;}
.ring{position:absolute;inset:50px;width:400px;height:400px;transform:rotate(-90deg);} .trk{fill:none;stroke:#EBEBEF;stroke-width:14;} .prg{fill:none;stroke:#E8262C;stroke-width:14;stroke-linecap:round;}
.bignum{position:relative;font-family:Inter;font-weight:800;font-size:200px;color:#111;letter-spacing:-.04em;} .unit{position:relative;font-family:Inter;font-weight:700;font-size:34px;letter-spacing:.2em;color:#8E8E93;margin-top:-10px;}
.burst{position:absolute;left:540px;top:1010px;width:0;height:0;} .burst i{position:absolute;left:-5px;top:-40px;width:10px;height:80px;border-radius:5px;background:#E8262C;opacity:0;transform-origin:5px 40px;}
.obj{position:absolute;opacity:0;}
.sa{position:absolute;inset:0;}
.row{position:absolute;left:150px;width:780px;height:124px;background:#fff;border-radius:34px;box-shadow:0 14px 40px rgba(0,0,0,.08);display:flex;align-items:center;padding:0 40px;gap:30px;opacity:0;}
.ri{width:72px;height:72px;border-radius:20px;display:flex;align-items:center;justify-content:center;} .ri svg{width:42px;height:42px;}
.rl{flex:1;font-family:Inter;font-weight:700;font-size:46px;color:#111;} .rn{font-family:Inter;font-weight:800;font-size:72px;color:#111;}
.phone{position:absolute;left:330px;top:640px;width:420px;height:840px;border-radius:72px;background:#0B0B0F;border:10px solid #1C1C22;box-shadow:0 40px 90px rgba(0,0,0,.3);padding:90px 26px 0;opacity:0;font-family:Inter;}
.isl{position:absolute;left:50%;top:22px;width:130px;height:38px;margin-left:-65px;border-radius:20px;background:#000;}
.chead{display:flex;flex-direction:column;align-items:center;gap:10px;margin-bottom:40px;} .cav{width:90px;height:90px;border-radius:50%;background:linear-gradient(135deg,#FF9A9E,#A18CD1);} .cname{color:#fff;font-weight:600;font-size:28px;}
.bub{max-width:320px;padding:18px 24px;border-radius:30px;font-size:28px;font-weight:500;margin-bottom:14px;line-height:1.25;} .bub.in{background:#26262B;color:#fff;} .bub.out{background:#007AFF;color:#fff;margin-left:auto;opacity:0;}
.dlv{text-align:right;color:#8E8E93;font-size:22px;opacity:0;}
.pf{position:absolute;left:390px;top:1200px;width:300px;height:300px;opacity:0;} .pring{position:absolute;inset:0;border-radius:50%;background:conic-gradient(#FEDA75,#FA7E1E,#D62976,#962FBF,#4F5BD5,#FEDA75);}
.ppic{position:absolute;inset:14px;border-radius:50%;background:#fff;border:8px solid #F2F2F4;padding:34px;} .ppic svg{width:100%;height:100%;}
.tapr{position:absolute;left:190px;top:190px;width:120px;height:120px;border-radius:50%;border:6px solid #007AFF;opacity:0;}
.pill{position:absolute;left:390px;top:1540px;width:300px;padding:16px 0;text-align:center;border-radius:40px;background:#fff;box-shadow:0 10px 30px rgba(0,0,0,.1);font-family:Inter;font-weight:700;font-size:32px;color:#D62976;opacity:0;}
.tcard{position:absolute;width:280px;height:440px;border-radius:28px;background:linear-gradient(160deg,#4A1020,#22060E);box-shadow:0 30px 70px rgba(0,0,0,.4);padding:16px;opacity:0;}
.tin{width:100%;height:100%;border-radius:18px;border:3px solid #F4C66B;display:flex;align-items:center;justify-content:center;background:radial-gradient(circle at 50% 45%,rgba(244,198,107,.25),transparent 60%);} .tin svg{width:120px;height:120px;filter:drop-shadow(0 0 14px rgba(244,198,107,.7));}`;

const HCSS = `
.full{background:radial-gradient(60% 40% at 30% 20%,rgba(124,58,237,.55),transparent 70%),radial-gradient(50% 35% at 75% 40%,rgba(236,72,153,.38),transparent 70%),radial-gradient(70% 50% at 50% 95%,rgba(14,165,233,.28),transparent 70%),#07060c;}
.panel{background:linear-gradient(180deg,#1C182E,#0A0912);border-top:1.5px solid rgba(255,255,255,.22);box-shadow:0 -10px 60px rgba(167,139,250,.45),0 -30px 80px rgba(0,0,0,.4);}
.m-full .ln,.m-panel .ln,.hdr .dk{color:#fff;} .m-full .lead,.m-panel .lead,.hdr .lead.dk{color:rgba(255,255,255,.66);}
.m-full .acc,.m-panel .acc,.hdr .acc,.m-over .acc{background:linear-gradient(180deg,#FFF1B8,#FBBF24 50%,#F97316);-webkit-background-clip:text;background-clip:text;color:transparent;filter:drop-shadow(0 0 16px rgba(251,146,60,.7));text-shadow:none;}
.tile{background:linear-gradient(160deg,rgba(40,34,64,.85),rgba(12,12,22,.8));border:1.5px solid rgba(255,255,255,.18);box-shadow:0 0 70px rgba(167,139,250,.45),inset 0 1px 0 rgba(255,255,255,.2);backdrop-filter:blur(18px);}
.trk{stroke:rgba(255,255,255,.12);} .prg{filter:drop-shadow(0 0 10px rgba(255,255,255,.55));} 
.bignum{background:linear-gradient(180deg,#FFF1B8,#FBBF24 45%,#F97316);-webkit-background-clip:text;background-clip:text;color:transparent;filter:drop-shadow(0 0 24px rgba(251,146,60,.75));}
.unit{color:rgba(255,255,255,.7);}
.row{background:linear-gradient(160deg,rgba(40,34,64,.85),rgba(14,13,24,.82));border:1.5px solid rgba(255,255,255,.16);box-shadow:0 0 34px rgba(167,139,250,.3);} .rl{color:#fff;}
.rn{background:linear-gradient(180deg,#D1FAE5,#34D399 50%,#059669);-webkit-background-clip:text;background-clip:text;color:transparent;filter:drop-shadow(0 0 14px rgba(52,211,153,.7));}
.ri{box-shadow:0 0 22px currentColor;}
.phone{box-shadow:0 0 80px rgba(0,122,255,.45),0 40px 90px rgba(0,0,0,.5);border-color:#2a2a35;}
.ppic{background:#14121f;border-color:#0b0a12;} .pring{box-shadow:0 0 60px rgba(214,41,118,.6);}
.pill{background:linear-gradient(160deg,rgba(40,34,64,.9),rgba(14,13,24,.9));border:1.5px solid rgba(255,255,255,.2);color:#F472B6;box-shadow:0 0 30px rgba(244,114,182,.5);}
.red{background:radial-gradient(ellipse at 50% 40%,#FF4D4F 0%,#E8262C 45%,#8E0E14 100%);}
.tcard{box-shadow:0 0 50px rgba(244,198,107,.45),0 30px 70px rgba(0,0,0,.45);}
.burst i{background:#FBBF24;box-shadow:0 0 14px #FBBF24;}
.focus{position:absolute;left:250px;top:40px;width:580px;height:640px;opacity:0;pointer-events:none;}
.focus i{position:absolute;width:110px;height:110px;border:8px solid #fff;filter:drop-shadow(0 0 14px rgba(255,255,255,.85));} .focus .tl{left:0;top:0;border-right:0;border-bottom:0;border-radius:30px 0 0 0;} .focus .tr{right:0;top:0;border-left:0;border-bottom:0;border-radius:0 30px 0 0;} .focus .bl{left:0;bottom:0;border-right:0;border-top:0;border-radius:0 0 0 30px;} .focus .br{right:0;bottom:0;border-left:0;border-top:0;border-radius:0 0 30px 0;}
.flabel{position:absolute;left:50%;bottom:-86px;transform:translateX(-50%);padding:12px 30px;border-radius:40px;background:linear-gradient(90deg,#8B5CF6,#EC4899);font-family:Inter;font-weight:800;font-size:34px;letter-spacing:.14em;color:#fff;white-space:nowrap;box-shadow:0 0 34px rgba(236,72,153,.8);}
#endglow{position:absolute;inset:0;background:radial-gradient(ellipse 80% 45% at 50% 75%,rgba(251,191,36,.28),transparent 70%);opacity:0;pointer-events:none;}
.spk{position:absolute;border-radius:50%;background:#FDE68A;box-shadow:0 0 12px #FBBF24,0 0 24px #FBBF24;opacity:0;}`;
fs.writeFileSync(P + "/index.html", `<!doctype html>
<html lang="en"><head><meta charset="UTF-8" /><meta name="viewport" content="width=1080, height=1920" />
<script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js"></script>
<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@500;700;800&display=swap" rel="stylesheet">
<style>${css}${HYB ? HCSS : ""}</style></head><body>
<div id="root" data-composition-id="main" data-start="0" data-duration="${TOTAL}" data-width="1080" data-height="1920">
<div id="face"><div id="zoom"><video id="body" class="clip" src="assets/body.mp4" data-start="0" data-duration="${TOTAL}" data-media-start="0" data-track-index="1" muted playsinline></video></div></div>
${html}
<audio id="vo" class="clip" src="assets/voice.wav" data-start="0" data-track-index="4" data-volume="1"></audio>
<audio id="bgm" class="clip" src="assets/music.wav" data-start="0" data-duration="${TOTAL}" data-track-index="5" data-volume="1"></audio>
${audio.join("\n")}
</div>
<script>
const tl = gsap.timeline({ paused: true });
${tw}tl.set({}, {}, ${TOTAL});
window.__timelines["main"] = tl;
</script></body></html>`);
console.log(`${SLUG}: cut ${(rawLen - acc).toFixed(1)}s, total ${TOTAL}s, blocks ${blocks.length}, sfx ${kept.length}`);
console.log(SEGS.map((s) => `${s.mode} ${s.t.toFixed(1)}-${s.e.toFixed(1)}`).join(" | "));

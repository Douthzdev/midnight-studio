// "Kinetic type + icon-map" faceless edit — ref: Midnight-Studio/ref-saveclip2/DECUPAGEM.md.
// The spoken sentence builds word by word (small filler / huge black load words / serif concept words / gold glow impact),
// thin white line icons draw what is said, and one icon-map (here: the wish star with 3 rays = the 3 steps) docks at the
// bottom and lights up as each step is said. Single accent: Midnight gold. Copy-specific: this file holds v20 ("Make a wish").
// usage: node tools/kinetic.mjs [--render]
import fs from "node:fs";
import { spawnSync } from "node:child_process";

const RENDER = process.argv.includes("--render");
const ROOT = "M:/Google/hyperframes/Midnight-Studio/auraly-lineart", P = ROOT + "/v20-kinetic-wish";
const VO = ROOT + "/vo/v20.wav", TR = ROOT + "/vo/t_v20/transcript.json";
const MUSIC = "C:/Users/Vinicius/Music/Songs Auraly UGC/MORNING LIGHTT.MP3", LK = ROOT + "/sfx/kit/";
const env = { ...process.env, PATH: "M:/CLAUDE/tools/ffmpeg/bin;" + process.env.PATH };
for (const k of ["HYPERFRAMES_EXTRACT_CACHE_DIR", "TMPDIR", "TEMP", "TMP"]) env[k] = "M:/CLAUDE/tools/hf-frames";
const ff = (args) => { const r = spawnSync("ffmpeg", args, { encoding: "utf8", env, maxBuffer: 1 << 26 }); return (r.stderr || "") + (r.stdout || ""); };
const ffp = (f) => +spawnSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f], { encoding: "utf8", env }).stdout.trim();
fs.mkdirSync(P + "/assets", { recursive: true });
const T = (x) => (+x).toFixed(3), norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
const GOLD = "#F1D29E";

// ---------- voice: open a real 5 s wishing pause after line 1 (countdown 5..1) ----------
const CUT = 2.45, PAUSE = 5.0;
ff(["-hide_banner", "-y", "-i", VO, "-filter_complex", `[0]atrim=0:${CUT},asetpts=PTS-STARTPTS[a];[0]atrim=${CUT},asetpts=PTS-STARTPTS[b];anullsrc=r=24000:cl=mono,atrim=0:${PAUSE}[s];[a][s][b]concat=n=3:v=0:a=1,aresample=48000`, "-ac", "1", P + "/assets/voice.wav"]);
const words = JSON.parse(fs.readFileSync(TR, "utf8")).map((w) => w.start > CUT ? { ...w, start: w.start + PAUSE, end: w.end + PAUSE } : w);
const W = words.map((w) => norm(w.text));
const at = (phrase, from = 0) => { const p = phrase.split(" ").map(norm); const i = W.findIndex((_, k) => words[k].start >= from - 0.05 && p.every((x, j) => W[k + j] === x)); if (i < 0) throw new Error("phrase not found: " + phrase); return words[i].start; };
const TOTAL = +(ffp(P + "/assets/voice.wav") + 1.8).toFixed(2);

let tw = "", html = "", svg = ""; const cues = [];
const sfx = (kind, t) => cues.push({ kind, t });
const draw = (sel, t, d = 0.8, st = 0.08) => { tw += `tl.fromTo("${sel}",{attr:{"stroke-dashoffset":1}},{attr:{"stroke-dashoffset":0},duration:${d},stagger:${st},ease:"power2.inOut",immediateRender:true},${T(t)});\n`; };
const pop = (sel, t, origin) => { tw += `tl.fromTo("${sel}",{scale:0,opacity:0${origin ? `,svgOrigin:"${origin}"` : ""}},{scale:1,opacity:1,duration:0.4,ease:"back.out(2.6)",immediateRender:true},${T(t)});\n`; };
const showG = (id, a, b) => { tw += `tl.fromTo("#${id}",{opacity:0,filter:"blur(12px)"},{opacity:1,filter:"blur(0px)",duration:0.35,ease:"power2.out",immediateRender:true},${T(a)});tl.to("#${id}",{opacity:0,filter:"blur(14px)",duration:0.3,ease:"power2.in"},${T(b - 0.3)});\n`; };
const D = (s) => s.replace(/<(path|circle|rect|line|ellipse|polyline)(?=[\s/])(?![^>]*class="(f|nod)")/g, '<$1 pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="1"');

// ---------- kinetic text blocks: "spoken=shown|style", "/" = new line; s small, b black, r serif, g gold glow ----------
const blocks = [];
const block = (spec, from, opts = {}) => blocks.push({ spec, from, ...opts });
block("Make|s a|s wish|r / in|s the|s next|s / five=5|g seconds|b", 0, { until: 2.5 });
block("Got|b it?|r", at("got"));
block("Now,|s to|s make|s sure|s / that|s wish|r / comes|s true.|g", at("now to"));
block("interact|b / with|s this|s video|s / three=3|g times|b", at("interact"));
block("send|b it|s to|s a|s / friend|r", at("send it"));
block("and|s watch|b what|s happens|s / in|s the|s next|s / two=2|g days|b", at("and watch"));
block("Then|s tap|b my|s / profile|r picture|r / and|s check|s my|s / stories|g", at("then tap"));
block("because|s I|s left|s a|s / special|s / three-card=3-card|g reading|r there|s", at("because"));
block("to|s help|s you|s explore|s / what|s the|s universe|r / may|s be|s revealing|b / about|s your|s wish!|g", at("to help"));
blocks.forEach((bk, bi) => {
  const end = bk.until ?? (bi < blocks.length - 1 ? blocks[bi + 1].from - 0.12 : TOTAL);
  let k = words.findIndex((w) => w.start >= bk.from - 0.05), inner = "";
  bk.spec.split(" ").forEach((tok, j) => {
    if (tok === "/") { inner += "<br>"; return; }
    const [txt, st] = tok.split("|"), [spoken, shown] = txt.includes("=") ? txt.split("=") : [txt, txt];
    while (k < words.length && W[k] !== norm(spoken)) k++;
    const t = k < words.length ? words[k].start : bk.from; k++;
    const id = `b${bi}w${j}`; inner += `<span id="${id}" class="w ${st}">${shown.replace(/^(.*?)[,]$/, "$1")}</span>`;
    tw += `tl.fromTo("#${id}",{opacity:0,y:${st === "s" ? 16 : 34},scale:${st === "g" ? 1.5 : 1},filter:"blur(10px)"},{opacity:1,y:0,scale:1,filter:"blur(0px)",duration:${st === "s" ? 0.22 : 0.34},ease:"${st === "g" ? "back.out(2.2)" : "expo.out"}",immediateRender:true},${T(Math.max(bk.from, t - 0.05))});\n`;
  });
  html += `<div id="blk${bi}" class="blk">${inner}</div>`;
  tw += `tl.to("#blk${bi}",{opacity:0,y:-30,filter:"blur(12px)",duration:0.25,ease:"power2.in"},${T(end - 0.25)});\n`;
  if (bi) sfx("whoosh", bk.from - 0.1);
});

// ---------- icons, literally from each sentence ----------
const STAR = (cx, cy, r) => { const p = []; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.42 : r; p.push(`${(cx + Math.cos(a) * rr).toFixed(1)} ${(cy + Math.sin(a) * rr).toFixed(1)}`); } return `M${p.join("L")}Z`; };
const tCount = 2.5, tGot = at("got"), tNow = at("now to"), tInt = at("interact"), tSend = at("send it"), tWatch = at("and watch"), tTap = at("then tap"), tBec = at("because"), tHelp = at("to help");

// 1 "make a wish in the next five seconds" + the real 5 s pause: the wish star draws itself, a ring drains once per second
svg += `<g id="s1">${D(`<path class="ln" d="${STAR(540, 1060, 190)}"/>`)}<path id="s1fill" class="f" d="${STAR(540, 1060, 190)}" fill="url(#gGold)" opacity="0"/>
<circle class="f" cx="540" cy="1060" r="330" fill="none" stroke="rgba(255,255,255,.1)" stroke-width="8"/><circle id="s1ring" class="f" cx="540" cy="1060" r="330" fill="none" stroke="${GOLD}" stroke-width="8" stroke-linecap="round" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="1" transform="rotate(-90 540 1060)" style="filter:drop-shadow(0 0 12px rgba(241,210,158,.7))"/></g>`;
draw("#s1 [pathLength]:not(#s1ring)", 0.25, 1.2);
tw += `tl.to("#s1fill",{opacity:0.25,duration:1},1.2);\n`;
html += `<div id="cd"><div class="cdl">MAKE YOUR WISH NOW</div><div class="cdn">5</div></div>`;
tw += `tl.fromTo("#cd",{opacity:0},{opacity:1,duration:0.3,immediateRender:true},${T(tCount)});tl.to("#cd",{opacity:0,filter:"blur(12px)",duration:0.3},${T(tCount + PAUSE - 0.2)});\n`;
[5, 4, 3, 2, 1].forEach((n, k) => {
  const t = tCount + k; sfx("tick", t);
  tw += `tl.set("#cd .cdn",{textContent:"${n}"},${T(t)});tl.fromTo("#cd .cdn",{scale:1.4,opacity:0,filter:"blur(10px)"},{scale:1,opacity:1,filter:"blur(0px)",duration:0.45,ease:"expo.out",immediateRender:false},${T(t)});\n`;
  tw += `tl.fromTo("#s1ring",{attr:{"stroke-dashoffset":0}},{attr:{"stroke-dashoffset":1},duration:0.97,ease:"none",immediateRender:false},${T(t)});tl.to("#s1fill",{opacity:${(0.35 + k * 0.13).toFixed(2)},duration:0.5},${T(t)});\n`;
});
// "Got it?" — the star flashes full gold (wish made)
tw += `tl.to("#s1fill",{opacity:1,duration:0.3},${T(tGot)});tl.fromTo("#s1",{scale:1,svgOrigin:"540 1060"},{scale:1.08,duration:0.3,yoyo:true,repeat:1,immediateRender:false},${T(tGot)});\n`; sfx("pop", tGot);
tw += `tl.to("#s1",{opacity:0,duration:0.3},${T(tNow - 0.05)});\n`;

// 2 the icon-map: the wish star with 3 rays -> 1 INTERACT, 2 SEND, 3 WATCH; big first, then docked at the bottom, lights per step
const tags = [["1", "INTERACT", 300, 1250], ["2", "SEND", 540, 1320], ["3", "WATCH", 780, 1250]];
svg += `<g id="map">${D(`<path class="ln" d="${STAR(540, 980, 120)}"/>` + tags.map(([, , x, y], i) => `<line id="ray${i}" class="ln" x1="540" y1="1060" x2="${x}" y2="${y - 34}"/>`).join(""))}
<path id="mapfill" class="f" d="${STAR(540, 980, 120)}" fill="url(#gGold)" opacity="0"/>
${tags.map(([n, l, x, y], i) => `<g id="tag${i}"><rect id="tagbg${i}" class="f" x="${x - 120}" y="${y - 34}" width="240" height="68" rx="14" fill="rgba(0,0,0,.6)" stroke="#fff" stroke-width="3"/><text id="tagtx${i}" x="${x}" y="${y + 12}" text-anchor="middle" class="tg"><tspan class="tn">${n}</tspan> ${l}</text></g>`).join("")}</g>`;
tw += `tl.fromTo("#map",{opacity:0},{opacity:1,duration:0.3,immediateRender:true},${T(tNow)});\n`;
draw("#map [pathLength]", tNow + 0.1, 0.9, 0.15);
tags.forEach((_, i) => pop(`#tag${i}`, tNow + 0.7 + i * 0.25, `${tags[i][2]} ${tags[i][3]}`));
tw += `tl.to("#mapfill",{opacity:0.3,duration:0.6},${T(at("true") - 0.1)});\n`;
tw += `tl.to("#map",{scale:0.8,y:420,x:0,svgOrigin:"540 1100",duration:0.7,ease:"expo.inOut"},${T(tInt - 0.35)});\n`; // dock at the bottom
const lit = (i, t) => { tw += `tl.to("#tagbg${i}",{attr:{fill:"${GOLD}",stroke:"${GOLD}"},duration:0.25},${T(t)});tl.to("#tagtx${i}, #tagtx${i} .tn",{fill:"#14110B",duration:0.25},${T(t)});tl.to("#ray${i}",{stroke:"${GOLD}",duration:0.25},${T(t)});tl.fromTo("#tag${i}",{scale:1,svgOrigin:"${tags[i][2]} ${tags[i][3]}"},{scale:1.18,duration:0.18,yoyo:true,repeat:1,immediateRender:false},${T(t)});tl.to("#mapfill",{opacity:${(0.3 + (i + 1) * 0.23).toFixed(2)},duration:0.3},${T(t)});\n`; sfx("pop", t); };
lit(0, at("times") + 0.1); lit(1, at("friend") + 0.1); lit(2, at("days") + 0.15);
tw += `tl.to("#mapfill",{opacity:1,duration:0.3},${T(at("days") + 0.4)});tl.fromTo("#map",{scale:0.8},{scale:0.88,svgOrigin:"540 1100",duration:0.25,yoyo:true,repeat:1,immediateRender:false},${T(at("days") + 0.5)});tl.to("#map",{opacity:0,filter:"blur(14px)",duration:0.3},${T(tTap - 0.2)});\n`;

// 3 "interact with this video three times" — heart, comment, save light up one after another (3 taps)
const ICX = [330, 540, 750], ICY = 860;
svg += `<g id="s3">${D(`<path class="ln" d="M330 920C270 878 250 850 258 822C266 794 300 790 330 818C360 790 394 794 402 822C410 850 390 878 330 920Z"/><path class="ln" d="M480 800H600V890H530L500 920V890H480Z"/><path class="ln" d="M712 796H788V924L750 896L712 924Z"/>`)}
${ICX.map((x, i) => `<circle id="s3r${i}" class="f" cx="${x}" cy="${ICY}" r="80" fill="none" stroke="${GOLD}" stroke-width="5" opacity="0"/>`).join("")}</g>`;
showG("s3", tInt - 0.1, tSend - 0.05); draw("#s3 [pathLength]", tInt, 0.6, 0.12);
const tThree = at("three"); [0, 1, 2].forEach((i) => { const t = tThree - 0.25 + i * 0.32; tw += `tl.to("#s3 path:nth-of-type(${i + 1})",{stroke:"${GOLD}",fill:"rgba(241,210,158,.28)",duration:0.15},${T(t)});tl.fromTo("#s3r${i}",{scale:0.5,opacity:1,svgOrigin:"${ICX[i]} ${ICY}"},{scale:1.5,opacity:0,duration:0.6,ease:"power2.out",immediateRender:false},${T(t)});\n`; sfx("pop", t); });

// 4 "send it to a friend" — a paper plane flies from your phone to a friend along a dotted arc
svg += `<g id="s4">${D(`<rect class="ln" x="200" y="760" width="150" height="260" rx="26"/><circle class="ln" cx="840" cy="810" r="44"/><path class="ln" d="M772 1000Q776 880 840 876Q904 880 908 1000"/>`)}
<path id="s4arc" class="f" d="M300 860Q560 640 790 860" fill="none" stroke="rgba(255,255,255,.55)" stroke-width="5" stroke-dasharray="2 16" stroke-linecap="round"/>
<g id="s4p"><path class="f" d="M-34 -6L36 -30L12 34L2 6Z" fill="${GOLD}" style="filter:drop-shadow(0 0 10px rgba(241,210,158,.8))"/></g></g>`;
showG("s4", tSend - 0.05, tWatch - 0.05); draw("#s4 [pathLength]", tSend, 0.5, 0.1);
tw += `tl.fromTo("#s4arc",{opacity:0},{opacity:1,duration:0.3,immediateRender:true},${T(tSend + 0.2)});tl.fromTo("#s4p",{motionPath:{path:"#s4arc",align:"#s4arc",alignOrigin:[0.5,0.5],autoRotate:true,start:0,end:0}},{motionPath:{path:"#s4arc",align:"#s4arc",alignOrigin:[0.5,0.5],autoRotate:true,start:0,end:1},duration:0.9,ease:"power1.inOut",immediateRender:true},${T(tSend + 0.25)});\n`;
sfx("whoosh", tSend + 0.2);

// 5 "watch what happens in the next two days" — an eye opens, two day cards tick
svg += `<g id="s5">${D(`<path class="ln" d="M380 800Q540 690 700 800Q540 910 380 800Z"/><circle class="ln" cx="540" cy="800" r="46"/>` + [0, 1].map((i) => `<rect class="ln" x="${360 + i * 200}" y="930" width="160" height="150" rx="18"/><line class="ln" x1="${360 + i * 200}" y1="970" x2="${520 + i * 200}" y2="970"/>`).join(""))}
<circle id="s5pupil" class="f" cx="540" cy="800" r="18" fill="${GOLD}"/>${[0, 1].map((i) => `<text class="day f" x="${440 + i * 200}" y="1066" text-anchor="middle">DAY ${i + 1}</text><path id="s5ck${i}" class="f" d="M${412 + i * 200} 1010L${434 + i * 200} 1032L${470 + i * 200} 988" fill="none" stroke="${GOLD}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="1" opacity="0"/>`).join("")}</g>`;
showG("s5", tWatch - 0.05, tTap - 0.1); draw("#s5 [pathLength]:not([id^=s5ck])", tWatch, 0.6, 0.08); pop("#s5pupil", at("watch") + 0.2, "540 800");
const tTwo = at("two", tWatch); [0, 1].forEach((i) => { const t = tTwo + i * 0.35; tw += `tl.set("#s5ck${i}",{opacity:1},${T(t)});tl.fromTo("#s5ck${i}",{attr:{"stroke-dashoffset":1}},{attr:{"stroke-dashoffset":0},duration:0.3,ease:"power2.out",immediateRender:false},${T(t)});\n`; sfx("tick", t); });

// 6 "tap my profile picture and check my Stories" — profile with a dashed story ring that spins, a tap, then the ring turns gold
svg += `<g id="s6">${D(`<circle class="ln" cx="540" cy="1000" r="170"/><circle class="ln" cx="540" cy="950" r="58"/><path class="ln" d="M440 1100Q445 1020 540 1018Q635 1020 640 1100"/>`)}
<circle id="s6ring" class="f" cx="540" cy="1000" r="205" fill="none" stroke="rgba(255,255,255,.7)" stroke-width="7" stroke-dasharray="18 14"/>
<circle id="s6rip" class="f" cx="540" cy="1000" r="170" fill="none" stroke="#fff" stroke-width="5" opacity="0"/>
<g id="s6new"><rect class="f" x="480" y="1180" width="120" height="50" rx="12" fill="${GOLD}"/><text class="tg f" x="540" y="1215" text-anchor="middle" style="fill:#14110B">NEW</text></g></g>`;
showG("s6", tTap - 0.05, tBec - 0.05); draw("#s6 [pathLength]", tTap, 0.7, 0.12);
tw += `tl.fromTo("#s6ring",{rotation:0,svgOrigin:"540 1000",opacity:0},{rotation:140,opacity:1,duration:${T(tBec - tTap)},ease:"none",immediateRender:true},${T(tTap)});\n`;
const tTapW = at("tap"); tw += `tl.fromTo("#s6rip",{scale:1,opacity:1,svgOrigin:"540 1000"},{scale:1.45,opacity:0,duration:0.6,ease:"power2.out",immediateRender:false},${T(tTapW)});\n`; sfx("pop", tTapW);
const tSt = at("stories"); tw += `tl.to("#s6ring",{stroke:"${GOLD}",attr:{"stroke-dasharray":"1290 0"},duration:0.3},${T(tSt)});tl.to("#s6ring",{filter:"drop-shadow(0 0 16px rgba(241,210,158,.9))",duration:0.3},${T(tSt)});\n`; pop("#s6new", tSt + 0.1, "540 1205"); sfx("pop", tSt);

// 7 "a special three-card reading there … what the universe may be revealing about your wish" — 3 cards fan out and flip,
// stars gather, and the wish star from the start comes back on the middle card
const CX = [330, 540, 750], ROT = [-10, 0, 10], CY = 1020;
const sym = [`<circle class="f" cx="0" cy="0" r="30" fill="none" stroke="${GOLD}" stroke-width="5"/>${[...Array(8).keys()].map((k) => { const a = (k * Math.PI) / 4; return `<line class="f" x1="${(Math.cos(a) * 44).toFixed(1)}" y1="${(Math.sin(a) * 44).toFixed(1)}" x2="${(Math.cos(a) * 58).toFixed(1)}" y2="${(Math.sin(a) * 58).toFixed(1)}" stroke="${GOLD}" stroke-width="5" stroke-linecap="round"/>`; }).join("")}`,
  `<path class="f" d="${STAR(0, 0, 58)}" fill="url(#gGold)"/>`,
  `<path class="f" d="M12 -50A52 52 0 1 0 12 50A40 40 0 1 1 12 -50Z" fill="none" stroke="${GOLD}" stroke-width="5"/>`];
svg += `<g id="s7">${CX.map((x, i) => `<g transform="translate(${x} ${CY}) rotate(${ROT[i]})"><g id="cd${i}"><g class="flip"><rect class="f" x="-95" y="-155" width="190" height="310" rx="18" fill="rgba(10,10,12,.9)" stroke="#fff" stroke-width="4"/><rect class="f" x="-78" y="-138" width="156" height="276" rx="12" fill="none" stroke="rgba(255,255,255,.35)" stroke-width="2"/><g class="sy">${sym[i]}</g></g></g></g>`).join("")}
${[...Array(14).keys()].map((k) => `<circle class="f sp" cx="${(120 + ((k * 137) % 840)).toFixed(0)}" cy="${(760 + ((k * 89) % 520)).toFixed(0)}" r="${3 + (k % 3) * 2}" fill="${GOLD}" opacity="0"/>`).join("")}</g>`;
showG("s7", tBec - 0.05, TOTAL + 1);
CX.forEach((x, i) => { tw += `tl.fromTo("#cd${i} .flip",{y:260,opacity:0},{y:0,opacity:1,duration:0.6,ease:"expo.out",immediateRender:true},${T(tBec + 0.1 + i * 0.12)});\n`; });
const tCard = at("threecard"); CX.forEach((x, i) => { const t = tCard + i * 0.22; tw += `tl.fromTo("#cd${i} .sy",{scale:0,opacity:0},{scale:1,opacity:1,duration:0.45,ease:"back.out(2.4)",immediateRender:true},${T(t)});tl.fromTo("#cd${i} .flip",{scaleX:1},{scaleX:0.15,duration:0.12,yoyo:true,repeat:1,immediateRender:false},${T(t - 0.12)});\n`; sfx("pop", t); });
tw += `tl.to("#s7 .sp",{opacity:0.9,duration:0.4,stagger:0.05},${T(at("universe") - 0.1)});tl.to("#s7 .sp",{y:-40,duration:${T(TOTAL - at("universe"))},ease:"none"},${T(at("universe"))});\n`;
const tWish = at("wish", tHelp); tw += `tl.to("#cd1",{scale:1.12,svgOrigin:"0 0",duration:0.5,ease:"back.out(2)"},${T(tWish)});tl.to("#cd1 rect",{stroke:"${GOLD}",duration:0.3},${T(tWish)});tl.to("#cd1 .sy",{filter:"drop-shadow(0 0 22px rgba(241,210,158,1))",duration:0.4},${T(tWish)});\n`; sfx("pop", tWish);
html += `<div id="end">TAP MY PROFILE PICTURE ↑</div>`;
tw += `tl.fromTo("#end",{opacity:0,y:20},{opacity:1,y:0,duration:0.4,immediateRender:true},${T(tWish + 0.6)});tl.to("#end",{scale:1.05,duration:0.5,yoyo:true,repeat:3,ease:"sine.inOut"},${T(tWish + 1.0)});\n`;

// ---------- audio: voice + quiet bed + kit sfx ----------
const getI = (txt) => { const m = txt.match(/"input_i"\s*:\s*"(-?[\d.]+)"/); return m ? +m[1] : null; };
const voI = getI(ff(["-hide_banner", "-i", P + "/assets/voice.wav", "-af", "loudnorm=print_format=json", "-f", "null", "-"]));
const muI = getI(ff(["-hide_banner", "-t", String(TOTAL), "-i", MUSIC, "-af", "loudnorm=print_format=json", "-f", "null", "-"]));
const loops = Math.max(0, Math.ceil(TOTAL / ffp(MUSIC)) - 1);
ff(["-hide_banner", "-y", "-stream_loop", String(loops), "-i", MUSIC, "-t", String(TOTAL), "-af", `volume=${(voI - 17 - muI).toFixed(2)}dB,afade=t=in:d=0.6,afade=t=out:st=${(TOTAL - 1.6).toFixed(2)}:d=1.6`, "-ar", "48000", "-ac", "2", P + "/assets/music.wav"]);
const KIT = { whoosh: [0.265, -16.2, -17], pop: [0.0, -19.1, -18], tick: [0.002, -17.4, -15] };
const audio = cues.sort((a, b) => a.t - b.t).map((c, i) => { const [pk, mm, rel] = KIT[c.kind]; fs.copyFileSync(LK + c.kind + ".wav", P + `/assets/k_${c.kind}.wav`); return `<audio id="fx${i}" class="clip" src="assets/k_${c.kind}.wav" data-start="${T(Math.max(0, c.t - pk))}" data-duration="1.6" data-track-index="${6 + (i % 3)}" data-volume="${Math.min(1, Math.pow(10, (voI + rel - mm) / 20)).toFixed(3)}"></audio>`; });

const css = `*{margin:0;padding:0;box-sizing:border-box}html,body{width:1080px;height:1920px;overflow:hidden;background:#000}
#bgv{position:absolute;inset:0;background:radial-gradient(ellipse 70% 45% at 50% 52%,#1b1b1f 0%,#0b0b0d 55%,#000 100%)}
#art{position:absolute;inset:0;width:1080px;height:1920px;overflow:visible}
#art .ln{fill:none;stroke:#fff;stroke-width:5;stroke-linecap:round;stroke-linejoin:round;filter:drop-shadow(0 0 6px rgba(255,255,255,.35))}
.tg{font:800 30px Inter;fill:#fff;letter-spacing:.06em} .tn{fill:${GOLD}} .day{font:800 30px Inter;fill:rgba(255,255,255,.8);letter-spacing:.08em}
.blk{position:absolute;left:84px;top:170px;width:930px;line-height:1.02;color:#fff}
.w{display:inline-block;margin-right:.22em;vertical-align:baseline}
.w.s{font:600 52px Inter;color:rgba(255,255,255,.88)}
.w.b{font:900 112px Inter;letter-spacing:-.04em}
.w.r{font:italic 400 134px 'Instrument Serif';letter-spacing:-.01em}
.w.g{font:900 112px Inter;letter-spacing:-.04em;color:${GOLD};text-shadow:0 0 22px rgba(241,210,158,.75),0 0 60px rgba(241,210,158,.35)}
#cd{position:absolute;left:0;top:170px;width:1080px;text-align:center;opacity:0}
.cdl{font:800 40px Inter;letter-spacing:.3em;color:rgba(255,255,255,.6)} .cdn{font:900 300px Inter;line-height:1;letter-spacing:-.05em;color:${GOLD};text-shadow:0 0 40px rgba(241,210,158,.6)}
#end{position:absolute;left:0;width:1080px;top:1520px;text-align:center;font:800 40px Inter;letter-spacing:.14em;color:${GOLD};text-shadow:0 0 18px rgba(241,210,158,.6);opacity:0}`;
fs.writeFileSync(P + "/index.html", `<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=1080, height=1920">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@600;800;900&family=Instrument+Serif:ital@0;1&display=block" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js"></script><script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/MotionPathPlugin.min.js"></script>
<style>${css}</style></head><body>
<div id="root" data-composition-id="main" data-start="0" data-duration="${TOTAL}" data-width="1080" data-height="1920">
<div id="bgv"></div>
<svg id="art" viewBox="0 0 1080 1920"><defs><radialGradient id="gGold"><stop offset="0" stop-color="#FFF4DA"/><stop offset=".6" stop-color="${GOLD}"/><stop offset="1" stop-color="#C9A46A"/></radialGradient></defs>${svg}</svg>
${html}
<audio id="vo" class="clip" src="assets/voice.wav" data-start="0" data-track-index="4" data-volume="1"></audio>
<audio id="bgm" class="clip" src="assets/music.wav" data-start="0" data-duration="${TOTAL}" data-track-index="5" data-volume="1"></audio>
${audio.join("\n")}
</div><script>gsap.registerPlugin(MotionPathPlugin);const tl=gsap.timeline({paused:true});
${tw}tl.set({},{},${TOTAL});window.__timelines.main=tl;</script></body></html>`);
console.log(`v20: total ${TOTAL}s, ${blocks.length} text blocks, ${cues.length} sfx`);

if (RENDER) {
  const tmp = P + "-render.mp4", out = P + "/../v20-kinetic-wish-final.mp4";
  const r = spawnSync("npx", ["hyperframes@0.9.67", "render", "--workers", "5", "--fps", "30", "--crf", "20", "-o", `"${tmp}"`], { cwd: P, env, encoding: "utf8", shell: true, maxBuffer: 1 << 26 });
  if (r.status !== 0) throw new Error("render failed: " + (r.stderr || r.stdout).slice(-800));
  ff(["-hide_banner", "-y", "-i", tmp, "-c:v", "copy", "-af", "loudnorm=I=-14:TP=-1.5:LRA=11", "-ar", "48000", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", out]);
  fs.rmSync(tmp, { force: true }); fs.rmSync(P + "/.hyperframes", { recursive: true, force: true });
  console.log("rendered " + out);
}

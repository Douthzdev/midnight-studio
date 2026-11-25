// Builds the HyperFrames projects (scenes, captions, root) from the voiceover timings.
// usage: node tools/build.mjs v1|v2|v3
import fs from "node:fs";
import path from "node:path";
import { Scene, C, rng, smooth, poly, portal, figure, rock, cardBack, cardArc, headline, ctaScene } from "./lib.mjs";
import { spawnSync } from "node:child_process";
import { VIDEOS as V1 } from "./videos.mjs";
import { VIDEOS as V2 } from "./videos2.mjs";
import { VIDEOS as V3 } from "./videos3.mjs";
import { VIDEOS as V4 } from "./videos4.mjs";
const VIDEOS = { ...V1, ...V2, ...V3, ...V4 };

const key = process.argv[2];
const V = VIDEOS[key];
if (!V) throw new Error("unknown video " + key);
const BASE = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1")), "..");
const P = path.join(BASE, V.dir);
const vk = V.vo || key; // a variant can reuse another video's voiceover
const lines = JSON.parse(fs.readFileSync(path.join(BASE, "vo", vk + ".lines.json")));
const words = JSON.parse(fs.readFileSync(path.join(BASE, "vo", "t" + vk.slice(1), "transcript.json")));
const voEnd = lines[lines.length - 1].end;
const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

// scene windows
const sc = V.scenes.map((s, i) => ({ ...s, start: i === 0 ? 0 : +(lines[s.lines[0]].start - 0.3).toFixed(3) }));
sc.forEach((s, i) => { s.end = i < sc.length - 1 ? sc[i + 1].start : +(voEnd + 1.6).toFixed(3); s.dur = +(s.end - s.start).toFixed(3); });
const TOTAL = sc[sc.length - 1].end;

fs.mkdirSync(path.join(P, "compositions"), { recursive: true });
fs.mkdirSync(path.join(P, "assets"), { recursive: true });

const sceneCss = `
#root{position:absolute;inset:0;}
.wrap{position:absolute;inset:0;}
.cam{position:absolute;inset:0;transform-origin:540px 760px;}
svg.art{position:absolute;inset:0;width:1080px;height:1920px;overflow:visible;filter:drop-shadow(0 0 7px rgba(255,236,214,0.28));}
.hl{position:absolute;top:330px;left:0;width:1080px;text-align:center;font-family:Montserrat;font-weight:800;font-size:50px;letter-spacing:0.03em;color:#F2EFE8;text-shadow:0 2px 12px rgba(0,0,0,.85);}
.cta{position:absolute;top:300px;left:0;width:1080px;text-align:center;font-family:Montserrat;font-weight:800;font-size:96px;letter-spacing:0.02em;color:#F2EFE8;text-shadow:0 2px 14px rgba(0,0,0,.9);}
.cta .gold{color:#F4B860;}
.ctasub{position:absolute;top:430px;left:0;width:1080px;text-align:center;font-family:Montserrat;font-weight:600;font-size:42px;color:#CFCBC4;}
`;

for (const s of sc) {
  const lo = lines[s.lines[0]].start - 0.3, hi = lines[s.lines[s.lines.length - 1]].end + 0.3;
  const local = words.filter((w) => w.start >= lo && w.start <= hi);
  const cue = (word, nth = 0) => {
    const m = local.filter((w) => norm(w.text) === norm(word));
    if (!m[nth]) throw new Error(`${s.id}: cue "${word}" not found in: ${local.map((w) => w.text).join(" ")}`);
    return +(m[nth].start - s.start).toFixed(3);
  };
  const S = new Scene(s.id, s.dur, cue);
  S.fx = !!V.fx; S.rich = !!V.rich;
  S.line = (k) => +(lines[k].start - s.start).toFixed(3);
  s.draw(S, { C, rng, smooth, poly, portal, figure, rock, cardBack, cardArc, headline, ctaScene });
  const last = s === sc[sc.length - 1], si = sc.indexOf(s);
  s.cues = S.cues.map((c) => ({ kind: c.kind, t: +(s.start + c.t).toFixed(3) }));
  let out = last ? "" : `tl.to("#${s.id}-w",{opacity:0,duration:0.2,ease:"power1.in"},${(s.dur - 0.22).toFixed(3)});`;
  if (V.fx) { // camera: punch-in on entry, slow drift (alternating direction), blur-zoom on exit
    const dir = si % 2 ? -1 : 1, cam = `#${s.id}-cam`;
    out += `\ntl.fromTo("${cam}",{scale:1.09},{scale:1,duration:0.5,ease:"power3.out"},0);`;
    out += `\ntl.to("${cam}",{scale:1.045,x:${dir * 14},y:-10,duration:${Math.max(0.1, s.dur - 0.5).toFixed(3)},ease:"sine.inOut"},0.5);`;
    if (!last) out += `\ntl.to("#${s.id}-w",{scale:1.06,filter:"blur(8px)",duration:0.22,ease:"power2.in"},${(s.dur - 0.22).toFixed(3)});`;
  }
  const html = `<template>
<style>${sceneCss}${V.rich ? `svg.art{filter:drop-shadow(0 0 3px rgba(255,236,214,0.55)) drop-shadow(0 0 ${V.bg ? 22 : 16}px ${V.glow || "rgba(183,156,240,0.32)"});}` : ""}</style>
<div id="root" data-composition-id="${s.id}" data-width="1080" data-height="1920">
<div class="wrap" id="${s.id}-w">${V.fx ? `<div class="cam" id="${s.id}-cam">` : ""}
<svg class="art" viewBox="0 0 1080 1920" xmlns="http://www.w3.org/2000/svg">
${S.svg.join("\n")}
</svg>
${S.html.join("\n")}
${V.fx ? "</div>" : ""}</div>
</div>
<script>
const tl = gsap.timeline({ paused: true });
${S.tw.join("\n")}
${out}
tl.set({}, {}, ${s.dur});
window.__timelines["${s.id}"] = tl;
</script>
</template>
`;
  fs.writeFileSync(path.join(P, "compositions", s.id + ".html"), html);
}

// ---------- captions ----------
const fix = V.fix || {};
const groups = [];
// each word belongs to the last line that starts (minus slack) at or before it: no word is dropped or doubled
const lineOf = (w) => { let k = 0; lines.forEach((l, j) => { if (l.start - 0.35 <= w.start) k = j; }); return k; };
const seen = {};
words.forEach((w) => { const n = norm(w.text); seen[n] = (seen[n] || 0) + 1; w.nth = seen[n]; });
lines.forEach((ln, li) => {
  const ws = words.filter((w) => lineOf(w) === li);
  let g = [];
  ws.forEach((w, i) => {
    g.push(w);
    const brk = /[.,?!]$/.test(w.text) || g.length >= 4;
    const nextGap = ws[i + 1] ? ws[i + 1].start - w.end : 1;
    if (brk || nextGap > 0.15 || i === ws.length - 1) {
      if (g.length === 1 && groups.length && groups[groups.length - 1].li === li && groups[groups.length - 1].ws.length < 4 && !/[.?!]$/.test(groups[groups.length - 1].ws.at(-1).text)) groups[groups.length - 1].ws.push(w);
      else groups.push({ li, ws: g });
      g = [];
    }
  });
});
// fix keys: "word" (every occurrence) or "word#n" (only the n-th occurrence of that word)
const disp = (w) => {
  if (fix[`${w.text}#${w.nth}`] !== undefined) return fix[`${w.text}#${w.nth}`];
  if (fix[w.text] !== undefined) return fix[w.text];
  return w.text;
};
const TRIGS = [].concat(V.trigger || "222");
const capItems = groups.map((g, i) => {
  const st = Math.max(0.15, g.ws[0].start - 0.05);
  const nx = groups[i + 1] ? groups[i + 1].ws[0].start - 0.05 : TOTAL;
  const en = Math.min(nx, g.ws.at(-1).end + 0.6);
  const txt = g.ws.map((w) => disp(w)).filter(Boolean).map((d) => TRIGS.reduce((acc, tg) => acc.includes(tg) && !acc.includes("gold") ? acc.replace(tg, `<span class="gold">${tg}</span>`) : acc, d)).join(" ");
  return { id: `cap${i}`, st: +st.toFixed(3), dur: +(en - st).toFixed(3), txt };
});
const capHtml = `<template>
<style>
#root{position:absolute;inset:0;}
.cg{position:absolute;left:0;top:1090px;width:1080px;padding:0 150px;text-align:center;}
.cg span.in{display:inline-block;font-family:Montserrat;font-weight:600;font-size:58px;line-height:1.16;color:#F2EFE8;text-shadow:0 2px 3px rgba(0,0,0,.9),0 0 18px rgba(0,0,0,.75);}
.gold{color:#F4B860;}
</style>
<div id="root" data-composition-id="caps" data-width="1080" data-height="1920">
${capItems.map((c) => `<div id="${c.id}" class="clip cg" data-start="${c.st}" data-duration="${c.dur}"><span class="in" id="${c.id}-t">${c.txt}</span></div>`).join("\n")}
</div>
<script>
const tl = gsap.timeline({ paused: true });
${capItems.map((c) => `tl.fromTo("#${c.id}-t",{opacity:0,y:6},{opacity:1,y:0,duration:0.14,ease:"power2.out"},${c.st});`).join("\n")}
tl.set({}, {}, ${TOTAL});
window.__timelines["caps"] = tl;
</script>
</template>
`;
fs.writeFileSync(path.join(P, "compositions", "caps.html"), capHtml);

// ---------- audio ----------
fs.copyFileSync(path.join(BASE, "vo", vk + ".wav"), path.join(P, "assets", "vo.wav"));
// music: cut the used section and level it so it sits MUSIC_UNDER dB below the voice (tracks differ a lot in loudness)
const ff = (args) => { const r = spawnSync("ffmpeg", args, { encoding: "utf8" }); return (r.stderr || "") + (r.stdout || ""); };
const getI = (txt) => { const m = txt.match(/"input_i"\s*:\s*"(-?[\d.]+)"/); return m ? +m[1] : null; };
const voI = getI(ff(["-hide_banner", "-i", path.join(BASE, "vo", vk + ".wav"), "-af", "loudnorm=print_format=json", "-f", "null", "-"]));
const ms = V.musicStart || 0, mdur = TOTAL + 0.5;
const muI = getI(ff(["-hide_banner", "-ss", String(ms), "-t", String(mdur), "-i", V.music, "-af", "loudnorm=print_format=json", "-f", "null", "-"]));
const gain = (voI - (V.musicUnder ?? 15)) - muI;
ff(["-hide_banner", "-y", "-ss", String(ms), "-t", String(mdur), "-i", V.music, "-af", `volume=${gain.toFixed(2)}dB,afade=t=in:d=0.6,afade=t=out:st=${(mdur - 2).toFixed(2)}:d=2`, "-ar", "48000", "-ac", "2", path.join(P, "assets", "music.wav")]);
console.log(`voice ${voI} LUFS, music ${muI} LUFS -> gain ${gain.toFixed(1)} dB`);
for (const f of ["whoosh.mp3", "chime.mp3"]) fs.copyFileSync(path.join(BASE, "sfx", f), path.join(P, "assets", f));
const sfx = (V.sfx || []).map((x, i) => {
  const t = typeof x.at === "function" ? x.at(sc) : x.at;
  const st = Math.max(0, t - (x.file === "whoosh.mp3" ? 2.5 : 0.418));
  return `<audio id="sfx${i}" class="clip" src="assets/${x.file}" data-start="${st.toFixed(3)}" data-duration="${x.file === "whoosh.mp3" ? 5.5 : 2.5}" data-track-index="5" data-volume="${x.vol}"></audio>`;
});

// fx videos: sounds placed automatically from the scene cues (kit rendered from the earshot bank into sfx/kit)
const fxRoot = { html: "", tw: "", back: "" };
if (V.fx) {
  // [peak s (lands on the cue), momentary-max LUFS measured at render, dB under the voice]
  const KIT = { whoosh: [0.265, -16.2, -9], riser: [2.389, -6.0, -12], hit: [0.0, -12.8, -9], tick: [0.002, -17.4, -15], pop: [0.0, -19.1, -13],
    bell1: [0.0, -13.1, -11], bell2: [0.0, -10.6, -11], bell3: [0.0, -10.0, -11], sting: [0.139, -10.1, -9] };
  const cues = [];
  sc.forEach((s, i) => { if (i > 0) cues.push({ kind: i === sc.length - 1 ? "riser" : "whoosh", t: s.start }); cues.push(...s.cues); });
  cues.sort((a, b) => a.t - b.t);
  const lastT = {}, kept = [];
  if (V.calm) for (let i = cues.length - 1; i >= 0; i--) if (cues[i].kind === "tick" || cues[i].kind === "pop") cues.splice(i, 1);
  for (const c of cues) { // no repeat of a kind within 0.35 s; small ticks/pops never stack on another sound
    if (lastT[c.kind] != null && c.t - lastT[c.kind] < 0.35) continue;
    if ((c.kind === "tick" || c.kind === "pop") && kept.some((k) => Math.abs(k.t - c.t) < 0.15)) continue;
    lastT[c.kind] = c.t; kept.push(c);
  }
  const vI = voI ?? -20;
  kept.forEach((c, i) => {
    const [pk, mm, rel] = KIT[c.kind];
    const vol = Math.min(1, Math.pow(10, (vI + rel - mm) / 20));
    fs.copyFileSync(path.join(BASE, "sfx", "kit", c.kind + ".wav"), path.join(P, "assets", "k_" + c.kind + ".wav"));
    sfx.push(`<audio id="fx${i}" class="clip" src="assets/k_${c.kind}.wav" data-start="${Math.max(0, c.t - pk).toFixed(3)}" data-duration="2.4" data-track-index="${6 + (i % 3)}" data-volume="${vol.toFixed(3)}"></audio>`);
  });
  console.log("fx sounds:", kept.map((c) => `${c.kind}@${c.t.toFixed(2)}`).join(" "));
  // drifting light motes + a soft flash on every cut
  const r = rng(1234), H = [];
  for (let i = 0; i < 34; i++) {
    const x = (r() * 1080).toFixed(0), y = (300 + r() * 1500).toFixed(0), sz = (2 + r() * 4).toFixed(1), op = (0.15 + r() * 0.4).toFixed(2), per = 3 + r() * 4;
    const col = [C.ink, C.gold, C.lilac, C.blue][i % 4];
    H.push(`<div class="mote" id="m${i}" style="left:${x}px;top:${y}px;width:${sz}px;height:${sz}px;background:${col};opacity:${op};box-shadow:0 0 ${(sz * 3).toFixed(0)}px ${col}"></div>`);
    fxRoot.tw += `tl.fromTo("#m${i}",{y:0},{y:${-(120 + r() * 260).toFixed(0)},duration:${TOTAL},ease:"none"},0);\n`;
    fxRoot.tw += `tl.fromTo("#m${i}",{x:-12},{x:12,duration:${per.toFixed(2)},yoyo:true,repeat:${Math.ceil(TOTAL / per)},ease:"sine.inOut"},0);\n`;
  }
  sc.forEach((s, i) => { if (i > 0) fxRoot.tw += `tl.fromTo("#flash",{opacity:0},{opacity:0.16,duration:0.08,ease:"power1.out",immediateRender:false},${(s.start - 0.02).toFixed(3)});tl.to("#flash",{opacity:0,duration:0.35,ease:"power2.out"},${(s.start + 0.06).toFixed(3)});\n`; });
  fxRoot.html = `<div id="motes">${H.join("")}</div><div id="flash"></div>`;
  if (V.rich) { // backdrop: drifting nebula + three mountain ridges with parallax, all under the line art
    const ridge = (y0, amp, seed) => { const rr = rng(seed), pts = []; for (let x = -200; x <= 1300; x += 150) pts.push([x, +(y0 - rr() * amp).toFixed(0)]); return "M-200,1920 L" + smooth(pts, false).slice(1) + " L1300,1920 Z"; };
    const R3 = [[1500, 150, 5, "#15141F", 0.5, 50], [1610, 120, 8, "#110F18", 0.4, 90], [1730, 90, 13, "#0C0B12", 0.3, 140]];
    fxRoot.back = `<svg id="neb" width="1080" height="1920" viewBox="0 0 1080 1920"><filter id="nebf" x="0" y="0" width="1" height="1"><feTurbulence type="fractalNoise" baseFrequency="0.0035 0.005" numOctaves="4" seed="11"/><feColorMatrix type="matrix" values="0 0 0 0 0.62  0 0 0 0 0.50  0 0 0 0 0.95  2.2 0 0 0 -1.05"/></filter><filter id="nebg" x="0" y="0" width="1" height="1"><feTurbulence type="fractalNoise" baseFrequency="0.006 0.004" numOctaves="3" seed="29"/><feColorMatrix type="matrix" values="0 0 0 0 0.96  0 0 0 0 0.72  0 0 0 0 0.38  2.4 0 0 0 -1.35"/></filter><g id="nebA"><rect x="-200" y="-200" width="1480" height="2000" filter="url(#nebf)"/></g><g id="nebB" opacity="0.35"><rect x="-200" y="-100" width="1480" height="1800" filter="url(#nebg)"/></g></svg>`
      + `<svg id="ridges" width="1080" height="1920" viewBox="0 0 1080 1920">${R3.map(([y, a, sd, fill, op], i) => `<g id="rg${i}"><path d="${ridge(y, a, sd)}" fill="${V.bg ? `rgba(6,4,14,${0.22 + i * 0.14})` : fill}"/><path d="${ridge(y, a, sd).replace(/ L1300,1920 Z$/, "").replace(/^M-200,1920 L/, "M")}" fill="none" stroke="${C.lilac}" stroke-width="1.5" opacity="${op}"/></g>`).join("")}</svg>`
;
    fxRoot.tw += `tl.fromTo("#nebA",{x:0,y:0,scale:1,svgOrigin:"540 900"},{x:-60,y:-40,scale:1.12,duration:${TOTAL},ease:"none"},0);\ntl.fromTo("#nebB",{x:0,y:0},{x:70,y:30,duration:${TOTAL},ease:"none"},0);\n`;
    R3.forEach(([, , , , , px], i) => { fxRoot.tw += `tl.fromTo("#rg${i}",{x:0},{x:${-px},duration:${TOTAL},ease:"none"},0);\n`; });
  }
}

// ---------- root ----------
const root = `<!doctype html>
<html lang="en" data-composition-variables='[
 {"id":"color-ground","type":"color","label":"Background","default":"${C.ground}"},
 {"id":"color-ink","type":"color","label":"Text","default":"${C.ink}"},
 {"id":"color-accent","type":"color","label":"Accent","default":"${C.gold}"}
]'>
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=1080, height=1920" />
<script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js"></script>
<style>
:root{--color-ground:${C.ground};--color-ink:${C.ink};--color-accent:${C.gold};}
*{margin:0;padding:0;box-sizing:border-box;}
html,body{margin:0;width:1080px;height:1920px;overflow:hidden;background:var(--color-ground);}
#bg{position:absolute;inset:0;background:${V.bg || "radial-gradient(ellipse 70% 45% at 50% 40%, #1A1A1F 0%, #0E0E10 70%)"};}
#grain{position:absolute;inset:0;opacity:0.07;}
.mote{position:absolute;border-radius:50%;}
#motes{position:absolute;inset:0;z-index:2;}
#neb{position:absolute;inset:0;opacity:0.28;-webkit-mask-image:radial-gradient(ellipse 80% 60% at 50% 40%,#000 30%,transparent 80%);}
#ridges{position:absolute;inset:0;}
#flash{position:absolute;inset:0;opacity:0;z-index:40;background:radial-gradient(ellipse 60% 40% at 50% 42%, rgba(255,238,214,0.9), rgba(255,238,214,0) 70%);pointer-events:none;}
</style>
</head>
<body>
<div id="root" data-composition-id="main" data-start="0" data-duration="${TOTAL}" data-width="1080" data-height="1920">
<div id="bg"></div>
<svg id="grain" width="1080" height="1920" xmlns="http://www.w3.org/2000/svg"><filter id="nz"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7"/><feColorMatrix type="saturate" values="0"/></filter><rect width="1080" height="1920" filter="url(#nz)"/></svg>
${fxRoot.back}
${sc.map((s) => `<div id="${s.id}" data-composition-id="${s.id}" data-composition-src="compositions/${s.id}.html" data-start="${s.start}" data-duration="${s.dur}" data-track-index="1" data-track-kind="graphics" data-width="1080" data-height="1920"></div>`).join("\n")}
<div id="caps" data-composition-id="caps" data-composition-src="compositions/caps.html" data-start="0" data-duration="${TOTAL}" data-track-index="2" data-track-kind="captions" data-width="1080" data-height="1920" style="z-index:50"></div>
<audio id="vo" class="clip" src="assets/vo.wav" data-start="0" data-track-index="3" data-volume="1"></audio>
<audio id="bgm" class="clip" src="assets/music.wav" data-start="0" data-duration="${TOTAL}" data-track-index="4" data-volume="1"></audio>
${fxRoot.html}
${sfx.join("\n")}
</div>
<script>
const tl = gsap.timeline({ paused: true });
${fxRoot.tw}tl.set({}, {}, ${TOTAL});
window.__timelines["main"] = tl;
</script>
</body>
</html>
`;
fs.writeFileSync(path.join(P, "index.html"), root);
console.log(key, "scenes", sc.length, "captions", capItems.length, "total", TOTAL.toFixed(2));
console.log(sc.map((s) => `${s.id} ${s.start}-${s.end}`).join("\n"));

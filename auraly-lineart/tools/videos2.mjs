// Shot lists for the 8 copy-driven videos (v4..v11). Same toolkit as videos.mjs.
import { C, rng, smooth, poly, portal, figure, rock, cardBack, cardArc, headline, ctaScene } from "./lib.mjs";
import { seg7, threeCards, envelope } from "./videos.mjs";

const M = "C:/Users/Vinicius/Music/Songs Auraly UGC/";
const G = (s) => `<span class="gold">${s}</span>`;
const small = (s, px = 72) => `<span style="font-size:${px}px">${s}</span>`;

// ---------- motifs ----------
const HAND = [[-70, 200], [-80, 40], [-150, -30], [-168, -72], [-136, -84], [-72, -24], [-78, -120], [-60, -232], [-30, -236], [-22, -130],
  [-14, -146], [4, -266], [30, -266], [38, -140], [46, -136], [62, -246], [88, -244], [94, -124], [100, -108], [118, -190], [140, -184], [140, -88], [126, 40], [92, 200]];
function hand(S, cx, cy, o = {}) { // open palm; o.flip mirrors (left hand)
  const k = o.scale ?? 1, f = o.flip ? -1 : 1;
  const pts = HAND.map(([x, y]) => [+(cx + f * x * k).toFixed(1), +(cy + y * k).toFixed(1)]);
  const id = S.path(smooth(pts, false), { t: o.t ?? 0, dur: o.dur ?? 1.2, color: o.color || C.ink, w: 3, from: o.from });
  S.path(`M${cx + f * -60 * k},${cy + 20 * k} Q${cx + f * 10 * k},${cy - 40 * k} ${cx + f * 100 * k},${cy - 50 * k} M${cx + f * -50 * k},${cy + 80 * k} Q${cx + f * 20 * k},${cy + 10 * k} ${cx + f * 90 * k},${cy + 10 * k}`,
    { t: (o.t ?? 0) + 0.5, dur: 0.6, color: o.lines || C.lilac, w: 2, from: o.from });
  return id;
}
function coin(S, cx, cy, r, t, o = {}) {
  const id = S.uid("coin"); S.push(`<g id="${id}">`);
  S.path(`M${cx},${cy - r} a${r},${r} 0 1,1 -0.1,0`, { t, dur: 0.5, color: C.gold, w: 3 });
  S.path(`M${cx},${cy - r * 0.72} a${r * 0.72},${r * 0.72} 0 1,1 -0.1,0`, { t: t + 0.1, dur: 0.5, color: C.gold, w: 1.5 });
  S.text(cx, cy + r * 0.32, "$", { font: "League Gothic", size: r * 0.95, color: C.gold, t: t + 0.25 });
  S.push(`</g>`); return id;
}
function eye(S, cx, cy, w, t, col = C.ink, from = 0) {
  S.path(`M${cx - w},${cy} Q${cx},${cy - w * 0.75} ${cx + w},${cy} Q${cx},${cy + w * 0.75} ${cx - w},${cy} Z`, { t, dur: 1, color: col, w: 3, from });
  S.path(`M${cx},${cy - w * 0.32} a${w * 0.32},${w * 0.32} 0 1,1 -0.1,0`, { t: t + 0.3, dur: 0.7, color: C.lilac, w: 3, from });
  const p = S.uid("pupil"); S.push(`<circle id="${p}" cx="${cx}" cy="${cy}" r="${w * 0.1}" fill="${C.gold}"/>`); S.fade(p, t + (from ? 0 : 0.7), 0.3);
}
function shield(S, cx, cy, s, t, col = C.gold) {
  return S.path(`M${cx},${cy - s} L${cx + s * 0.85},${cy - s * 0.65} V${cy} Q${cx + s * 0.8},${cy + s * 0.75} ${cx},${cy + s * 1.05} Q${cx - s * 0.8},${cy + s * 0.75} ${cx - s * 0.85},${cy} V${cy - s * 0.65} Z`, { t, dur: 1.1, color: col, w: 4 });
}
function moon(S, cx, cy, r, t, from = 0) {
  return S.path(`M${cx + r * 0.2},${cy - r} A${r},${r} 0 1,0 ${cx + r * 0.2},${cy + r} A${r * 0.78},${r * 0.78} 0 1,1 ${cx + r * 0.2},${cy - r} Z`, { t, dur: 1.1, color: C.gold, w: 3, from });
}
function waves(S, y, t, n = 3) {
  for (let k = 0; k < n; k++) {
    let d = `M-40,${y + k * 60}`; for (let x = -40; x <= 1120; x += 40) d += ` Q${x + 20},${y + k * 60 + (x / 40 % 2 ? 26 : -26)} ${x + 40},${y + k * 60}`;
    S.path(d, { t: t + k * 0.15, dur: 1.2, color: k === 1 ? C.lilac : C.blue, w: 3 });
  }
}
function elder(S, cx, cy, t, from = 0) { // robed old man with a staff, cy = feet
  S.path(`M${cx},${cy - 560} a46,46 0 1,1 -0.1,0`, { t, dur: 0.8, w: 3, from });
  S.path(`M${cx - 30},${cy - 488} Q${cx},${cy - 380} ${cx + 30},${cy - 488}`, { t: t + 0.2, dur: 0.6, w: 3, color: C.ink, from });
  S.path(smooth([[cx - 40, cy - 470], [cx - 110, cy - 430], [cx - 150, cy - 250], [cx - 175, cy], [cx + 175, cy], [cx + 150, cy - 250], [cx + 110, cy - 430], [cx + 40, cy - 470]], false), { t: t + 0.3, dur: 1.3, w: 3, from });
  S.path(`M${cx - 20},${cy - 380} V${cy}`, { t: t + 0.6, dur: 0.8, w: 1.5, color: C.lilac, from });
  S.path(`M${cx + 210},${cy} V${cy - 520} Q${cx + 210},${cy - 570} ${cx + 250},${cy - 560}`, { t: t + 0.5, dur: 0.9, color: C.gold, w: 4, from });
}
function scroll(S, cx, cy, t, o = {}) {
  const w = o.w ?? 300, h = o.h ?? 380, col = o.color || C.ink;
  S.path(`M${cx - w / 2},${cy - h / 2} H${cx + w / 2} M${cx - w / 2},${cy + h / 2} H${cx + w / 2} M${cx - w / 2 + 10},${cy - h / 2} V${cy + h / 2} M${cx + w / 2 - 10},${cy - h / 2} V${cy + h / 2}`, { t, dur: 0.9, color: col, w: 3 });
  S.path(`M${cx - w / 2 - 20},${cy - h / 2 - 18} H${cx + w / 2 + 20} V${cy - h / 2 + 18} H${cx - w / 2 - 20} Z M${cx - w / 2 - 20},${cy + h / 2 - 18} H${cx + w / 2 + 20} V${cy + h / 2 + 18} H${cx - w / 2 - 20} Z`, { t: t + 0.2, dur: 0.8, color: C.gold, w: 3 });
  for (let i = 0; i < 4; i++) S.path(`M${cx - w / 2 + 40},${cy - h / 2 + 70 + i * 50} H${cx + w / 2 - 40 - (i % 2) * 50}`, { t: t + 0.4 + i * 0.08, dur: 0.4, color: C.dim, w: 3 });
  S.path(`M${cx + w / 2 - 70},${cy + h / 2 - 90} a28,28 0 1,1 -0.1,0`, { t: t + 0.7, dur: 0.5, color: C.coral, w: 3 });
}
function chest(S, cx, cy, t) {
  S.path(`M${cx - 110},${cy} H${cx + 110} V${cy + 120} H${cx - 110} Z`, { t, dur: 0.6, w: 3 });
  S.path(`M${cx - 110},${cy} Q${cx},${cy - 110} ${cx + 110},${cy}`, { t: t + 0.2, dur: 0.6, w: 3 });
  S.path(`M${cx - 18},${cy - 10} H${cx + 18} V${cy + 34} H${cx - 18} Z`, { t: t + 0.4, dur: 0.4, color: C.gold, w: 3 });
  for (let i = 0; i < 5; i++) S.path(`M${cx - 60 + i * 30},${cy - 60} L${cx - 80 + i * 40},${cy - 110}`, { t: t + 0.7 + i * 0.05, dur: 0.3, color: C.gold, w: 2 });
}
function parcel(S, cx, cy, t) {
  const pts = [[cx - 140, cy + 80], [cx + 140, cy + 80], [cx + 90, cy - 60], [cx - 90, cy - 60]];
  S.path(poly(pts), { t, dur: 0.7, w: 3 });
  for (let i = 1; i < 4; i++) { const f = i / 4; S.path(`M${(cx - 140 + 50 * f).toFixed(1)},${(cy + 80 - 140 * f).toFixed(1)} H${(cx + 140 - 50 * f).toFixed(1)}`, { t: t + 0.3 + i * 0.05, dur: 0.3, color: C.blue, w: 1.5 }); }
  S.path(`M${cx},${cy + 80} L${cx},${cy - 60}`, { t: t + 0.4, dur: 0.4, color: C.blue, w: 1.5 });
  S.path(`M${cx + 40},${cy - 60} V${cy - 150} L${cx + 100},${cy - 130} L${cx + 40},${cy - 110}`, { t: t + 0.6, dur: 0.4, color: C.gold, w: 3 });
}
function phone(S, cx, cy, t, h = 380) {
  const w = h * 0.52;
  return S.path(`M${cx - w / 2 + 24},${cy - h / 2} H${cx + w / 2 - 24} Q${cx + w / 2},${cy - h / 2} ${cx + w / 2},${cy - h / 2 + 24} V${cy + h / 2 - 24} Q${cx + w / 2},${cy + h / 2} ${cx + w / 2 - 24},${cy + h / 2} H${cx - w / 2 + 24} Q${cx - w / 2},${cy + h / 2} ${cx - w / 2},${cy + h / 2 - 24} V${cy - h / 2 + 24} Q${cx - w / 2},${cy - h / 2} ${cx - w / 2 + 24},${cy - h / 2} Z M${cx - 30},${cy - h / 2 + 18} H${cx + 30}`, { t, dur: 0.8, w: 3 });
}
function starGlyph(S, cx, cy, s, t, col = C.gold) {
  return S.path(`M${cx},${cy - s} L${cx + s * 0.22},${cy - s * 0.22} L${cx + s},${cy} L${cx + s * 0.22},${cy + s * 0.22} L${cx},${cy + s} L${cx - s * 0.22},${cy + s * 0.22} L${cx - s},${cy} L${cx - s * 0.22},${cy - s * 0.22} Z`, { t, dur: 0.8, color: col, w: 3 });
}
function tower(S, cx, base, t, o = {}) { // returns top group id
  const s = o.scale ?? 1, X = (v) => (cx + v * s).toFixed(1), Y = (v) => (base + v * s).toFixed(1);
  S.path(`M${X(-110)},${Y(0)} V${Y(-300)} M${X(90)},${Y(0)} V${Y(-300)} M${X(-110)},${Y(-300)} H${X(90)}`, { t, dur: 0.7, w: 3, from: o.from });
  const top = S.uid("top"); S.push(`<g id="${top}">`);
  S.path(`M${X(-100)},${Y(-300)} V${Y(-500)} H${X(-80)} V${Y(-530)} H${X(-50)} V${Y(-500)} H${X(-25)} V${Y(-530)} H${X(5)} V${Y(-500)} H${X(30)} V${Y(-530)} H${X(60)} V${Y(-500)} H${X(80)} V${Y(-300)}`, { t: t + 0.2, dur: 0.8, w: 3, from: o.from });
  S.path(`M${X(-30)},${Y(-420)} V${Y(-460)} Q${X(-10)},${Y(-480)} ${X(10)},${Y(-460)} V${Y(-420)} Z`, { t: t + 0.4, dur: 0.4, color: C.blue, w: 2, from: o.from });
  S.push(`</g>`); return top;
}
function crowd(S, y, t, n = 7, hi = []) {
  const ids = [];
  for (let i = 0; i < n; i++) { const x = 540 + (i - (n - 1) / 2) * 130; ids.push(figure(S, { cx: x, cy: y, scale: 0.32, t: t + i * 0.06, dur: 0.6, color: hi.includes(i) ? C.ink : C.dim, w: hi.includes(i) ? 3 : 2 })); }
  return ids;
}
const ARIES = (cx, cy, s) => `M${cx},${cy + 70 * s} V${cy - 10 * s} M${cx},${cy - 10 * s} C${cx - 8 * s},${cy - 80 * s} ${cx - 90 * s},${cy - 90 * s} ${cx - 90 * s},${cy - 30 * s} C${cx - 90 * s},${cy} ${cx - 60 * s},${cy + 10 * s} ${cx - 45 * s},${cy} M${cx},${cy - 10 * s} C${cx + 8 * s},${cy - 80 * s} ${cx + 90 * s},${cy - 90 * s} ${cx + 90 * s},${cy - 30 * s} C${cx + 90 * s},${cy} ${cx + 60 * s},${cy + 10 * s} ${cx + 45 * s},${cy}`;
const LEO = (cx, cy, s) => `M${cx - 40 * s},${cy + 20 * s} a32,32 0 1,1 0.1,0 M${cx - 10 * s},${cy + 10 * s} C${cx - 30 * s},${cy - 60 * s} ${cx + 10 * s},${cy - 90 * s} ${cx + 40 * s},${cy - 70 * s} C${cx + 80 * s},${cy - 40 * s} ${cx + 30 * s},${cy + 10 * s} ${cx + 40 * s},${cy + 50 * s} C${cx + 46 * s},${cy + 80 * s} ${cx + 80 * s},${cy + 80 * s} ${cx + 90 * s},${cy + 60 * s}`;

export const VIDEOS = {
  // ------------------------------------------------------------ V4: personal year number
  v4: {
    dir: "v4-personal-year", music: M + "analog_mannequin - milk cassette.mp3", musicStart: 8, trigger: "NUMBER",
    fix: { "birthday.": "birth day.", "two,": "2,", "zero,": "0,", "seven.": "7.", "one#4": "1", "eight": "8", "nine": "9", "number#3": "NUMBER" },
    sfx: [{ file: "whoosh.mp3", vol: 0.28, at: (sc) => sc[3].start }, { file: "chime.mp3", vol: 0.4, at: (sc) => sc[2].start + 2.4 }, { file: "chime.mp3", vol: 0.4, at: (sc) => sc[5].start + 5.3 }],
    scenes: [
      { id: "year", lines: [0], draw(S) {
        headline(S, "YOUR NUMBER FOR 2027", { t: 0.1, out: 4.6 });
        S.bigText(540, 860, "2027", { size: 360, t: 0, dur: 1.3, from: 0.55 });
        S.path(`M540,470 a250,250 0 1,1 -0.1,0`, { t: S.w("number"), dur: 1.4, color: C.gold, w: 2 });
        S.text(540, 1020, "ONE NUMBER", { size: 30, color: C.gold, t: S.w("number") });
      } },
      { id: "digits", lines: [1, 2], draw(S) {
        S.text(540, 470, "EXAMPLE · BORN JULY 14", { size: 28, color: C.dim, t: 0.1 });
        S.bigText(330, 720, "07", { size: 220, t: S.w("month"), dur: 0.8 });
        S.bigText(750, 720, "14", { size: 220, t: S.w("birthday"), dur: 0.8 });
        S.text(330, 790, "MONTH", { size: 28, color: C.blue, t: S.w("month") + 0.3 });
        S.text(750, 790, "DAY", { size: 28, color: C.blue, t: S.w("birthday") + 0.3 });
        S.text(540, 920, "0 + 7 + 1 + 4", { size: 56, weight: 600, t: S.w("digit") });
        S.text(540, 1010, "+ 2 + 0 + 2 + 7", { size: 56, weight: 600, color: C.gold, t: S.w("plus") });
      } },
      { id: "reduce", lines: [3, 4], draw(S) {
        S.text(540, 520, "= 23", { size: 90, weight: 600, t: 0.05 });
        S.text(540, 640, "2 + 3", { size: 70, weight: 600, color: C.dim, t: S.w("digit") });
        S.path(`M540,670 V720`, { t: S.w("digit") + 0.3, dur: 0.3, color: C.dim, w: 3 });
        S.path(`M540,750 a150,150 0 1,1 -0.1,0`, { t: S.w("left"), dur: 1, color: C.gold, w: 3 });
        S.bigText(540, 1000, "5", { size: 300, t: S.w("left"), dur: 0.9, c1: C.gold, c2: C.gold });
        S.text(540, 1060, "YOUR PERSONAL YEAR", { size: 30, color: C.gold, t: S.w("personal") });
      } },
      { id: "themes", lines: [5, 6, 7], draw(S) {
        const t1 = S.w("one"), t8 = S.w("eight"), t9 = S.w("nine");
        S.bigText(220, 780, "1", { size: 260, t: t1, dur: 0.7 });
        S.path(`M220,860 a46,46 0 1,1 -40,24 M180,884 l-6,-26 M180,884 l24,-8`, { t: t1 + 0.3, dur: 0.6, color: C.blue, w: 3 });
        S.text(220, 990, "NEW START", { size: 28, color: C.blue, t: t1 + 0.4 });
        S.bigText(540, 780, "8", { size: 260, t: t8, dur: 0.7, c1: C.gold, c2: C.gold });
        coin(S, 540, 905, 44, t8 + 0.3);
        S.text(540, 990, "MONEY", { size: 28, color: C.gold, t: t8 + 0.4 });
        S.bigText(860, 780, "9", { size: 260, t: t9, dur: 0.7 });
        S.path(`M820,950 V850 H900 V950 M820,950 H900`, { t: t9 + 0.3, dur: 0.5, color: C.lilac, w: 3 });
        S.text(860, 990, "CLOSURE", { size: 28, color: C.lilac, t: t9 + 0.4 });
      } },
      { id: "door", lines: [8], draw(S) {
        S.path(`M380,1040 V480 H700 V1040`, { t: 0, dur: 0.8, w: 3 });
        S.path(`M380,480 L520,530 V1000 L380,1040`, { t: 0.3, dur: 0.7, color: C.blue, w: 3 });
        for (let i = 0; i < 4; i++) S.dotted(`M${560 + i * 34},500 L${560 + i * 30},1040`, { t: S.w("door") - 0.6, color: C.gold, gap: 9, op: 0.6 });
        S.text(540, 430, "THE THEME", { size: 30, color: C.dim, t: S.w("theme") });
        const f = figure(S, { cx: 610, cy: 880, scale: 0.42, t: S.w("walking"), dur: 0.9, color: C.gold });
        S.bigText(780, 640, "?", { size: 200, t: S.w("door"), dur: 0.6, c1: C.gold, c2: C.gold });
      } },
      { id: "cta", lines: [9, 10, 11], draw(S) { ctaScene(S, { cta: 0.25, lift: S.w("three"), big: small(`COMMENT ${G("YOUR NUMBER")}`, 58), sub: "3 cards are waiting in my Stories" }); } },
    ],
  },

  // ------------------------------------------------------------ V5: itchy palm
  v5: {
    dir: "v5-itchy-palm", music: M + "Apathy.mp3", musicStart: 0, trigger: ["LEFT", "RIGHT"],
    fix: { "lately.": "lately?", "tell": "tells", "left#3": "LEFT", "right.#3": "RIGHT." },
    sfx: [{ file: "whoosh.mp3", vol: 0.28, at: (sc) => sc[2].start }, { file: "chime.mp3", vol: 0.4, at: (sc) => sc[3].start + 1.2 }, { file: "chime.mp3", vol: 0.4, at: (sc) => sc[6].start + 5.4 }],
    scenes: [
      { id: "hands", lines: [0, 1], draw(S) {
        headline(S, "WHICH PALM ITCHES?", { t: 0.1, out: 4.4 });
        hand(S, 330, 830, { flip: true, scale: 0.95, t: 0, dur: 1.1, from: 0.55 });
        hand(S, 750, 830, { scale: 0.95, t: 0, dur: 1.1, from: 0.55 });
        const tI = S.w("itching");
        [[300, 820], [760, 840]].forEach(([x, y], k) => { for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; const id = S.path(`M${(x + Math.cos(a) * 40).toFixed(1)},${(y + Math.sin(a) * 40).toFixed(1)} L${(x + Math.cos(a) * 62).toFixed(1)},${(y + Math.sin(a) * 62).toFixed(1)}`, { t: tI + k * 0.2, dur: 0.15, color: C.coral, w: 3 }); S.t(`tl.to("#${id}",{opacity:0.2,duration:0.12,repeat:5,yoyo:true},${(tI + 0.4).toFixed(2)});`); } });
      } },
      { id: "belief", lines: [2], draw(S) {
        hand(S, 330, 830, { flip: true, scale: 0.95, t: 0, dur: 0.8 });
        hand(S, 750, 830, { scale: 0.95, t: 0, dur: 0.8 });
        const tR = S.w("receives"), tG = S.w("gives");
        S.path(`M330,500 V600 M300,570 L330,605 L360,570`, { t: tR, dur: 0.6, color: C.gold, w: 4 });
        S.text(330, 470, "RECEIVES", { size: 30, color: C.gold, t: tR });
        S.path(`M750,600 V500 M720,535 L750,500 L780,535`, { t: tG, dur: 0.6, color: C.coral, w: 4 });
        S.text(750, 470, "GIVES", { size: 30, color: C.coral, t: tG });
      } },
      { id: "right", lines: [3], draw(S) {
        hand(S, 540, 820, { scale: 1.15, t: 0, dur: 0.9 });
        S.text(540, 440, "RIGHT PALM", { size: 32, color: C.coral, t: 0.2 });
        const c = coin(S, 560, 780, 54, S.w("money"));
        S.t(`tl.to("#${c}",{x:260,y:-300,opacity:0,duration:1.4,ease:"power2.in"},${(S.w("leave")).toFixed(2)});`);
      } },
      { id: "left", lines: [4], draw(S) {
        hand(S, 540, 820, { flip: true, scale: 1.15, t: 0, dur: 0.9 });
        S.text(540, 440, "LEFT PALM", { size: 32, color: C.gold, t: 0.2 });
        const g = S.uid("inc"); S.push(`<g id="${g}">`); starGlyph(S, 540, 780, 50, S.w("something")); S.push(`</g>`);
        S.t(`tl.fromTo("#${g}",{y:-320},{y:0,duration:1.6,ease:"power2.out"},${S.w("something").toFixed(2)});`);
      } },
      { id: "miss", lines: [5, 6], draw(S) {
        hand(S, 540, 860, { flip: true, scale: 0.9, t: 0, dur: 0.9 });
        S.path(`M440,520 H640 V700 H440 Z M440,520 L540,470 L640,520`, { t: S.w("coming"), dur: 0.8, color: C.lilac, w: 3 });
        S.bigText(540, 680, "?", { size: 170, t: S.w("never"), dur: 0.6, c1: C.gold, c2: C.gold });
      } },
      { id: "what", lines: [7], draw(S) {
        coin(S, 250, 760, 80, S.w("money"));
        S.text(250, 940, "MONEY", { size: 28, color: C.gold, t: S.w("money") });
        figure(S, { cx: 540, cy: 790, scale: 0.42, t: S.w("person"), dur: 0.7 });
        S.text(540, 940, "A PERSON", { size: 28, color: C.blue, t: S.w("person") });
        starGlyph(S, 830, 760, 80, S.w("answer"));
        S.text(830, 940, "THE ANSWER", { size: 28, color: C.lilac, t: S.w("answer") });
      } },
      { id: "cta", lines: [8, 9, 10], draw(S) { ctaScene(S, { cta: 0.25, lift: S.w("three"), big: small(`COMMENT ${G("LEFT")} OR ${G("RIGHT")}`, 56), sub: "Your 3 cards are in my Stories" }); } },
    ],
  },

  // ------------------------------------------------------------ V6: 3AM
  v6: {
    dir: "v6-3am", music: M + "Aglow.mp3", musicStart: 0, trigger: "3AM",
    fix: { "3#2": "Comment 3AM,", "a.m.": "" },
    sfx: [{ file: "whoosh.mp3", vol: 0.28, at: (sc) => sc[1].start }, { file: "chime.mp3", vol: 0.4, at: (sc) => sc[4].start + 2.3 }, { file: "chime.mp3", vol: 0.4, at: (sc) => sc[5].start + 3.6 }],
    scenes: [
      { id: "clock", lines: [0], draw(S) {
        headline(S, "AWAKE AT 3AM?", { t: 0.1, out: 4.6 });
        S.path(`M250,600 H830 Q870,600 870,640 V860 Q870,900 830,900 H250 Q210,900 210,860 V640 Q210,600 250,600 Z`, { t: 0, dur: 0.5, w: 3 });
        seg7(S, "3", 290, 660, 110, 180, 0, C.gold);
        const d1 = S.uid("c"); S.push(`<g id="${d1}"><circle cx="455" cy="715" r="9" fill="${C.gold}"/><circle cx="455" cy="785" r="9" fill="${C.gold}"/></g>`); S.fade(d1, 0.1, 0.2);
        seg7(S, "3", 510, 660, 110, 180, 0.15, C.gold); seg7(S, "3", 670, 660, 110, 180, 0.3, C.gold);
        moon(S, 820, 500, 50, 0.2);
        const tP = S.w("phone");
        phone(S, 540, 1020, tP, 140);
        S.path(`M470,960 L610,1080`, { t: tP + 0.4, dur: 0.3, color: C.coral, w: 4 });
      } },
      { id: "thin", lines: [1], draw(S) {
        S.stars(70, 33, [60, 380, 1020, 1060], 0);
        moon(S, 540, 640, 150, 0);
        const tT = S.w("thinnest");
        S.path(`M60,900 C300,860 780,940 1020,900`, { t: tT, dur: 1.2, color: C.lilac, w: 2 });
        S.path(`M60,912 C300,872 780,952 1020,912`, { t: tT + 0.1, dur: 1.2, color: C.blue, w: 1.5 });
      } },
      { id: "quiet", lines: [2], draw(S) {
        const r = rng(9), ids = [];
        for (let i = 0; i < 9; i++) { const x = 120 + r() * 840, y = 420 + r() * 300; let d = `M${x.toFixed(0)},${y.toFixed(0)}`; for (let k = 1; k < 6; k++) d += ` l${12 + r() * 10},${(k % 2 ? -1 : 1) * (10 + r() * 14)}`; ids.push(S.path(d, { t: 0.05 + i * 0.05, dur: 0.4, color: C.dim, w: 2 })); }
        const tG = S.w("gone");
        ids.forEach((id) => S.t(`tl.to("#${id}",{opacity:0,duration:0.5},${tG.toFixed(2)});`));
        figure(S, { cx: 540, cy: 940, scale: 0.55, t: 0.2, dur: 1 });
        const tH = S.w("hears");
        [70, 120, 170].forEach((r2, i) => S.path(`M${540 - r2},${940 - 165 - r2 * 0.4} A${r2},${r2} 0 0,1 ${540 + r2},${940 - 165 - r2 * 0.4}`, { t: tH + i * 0.2, dur: 0.6, color: C.gold, w: 2 }));
      } },
      { id: "thought", lines: [3, 4], draw(S) {
        figure(S, { cx: 380, cy: 960, scale: 0.6, t: 0, dur: 0.9 });
        [[470, 720, 10], [510, 670, 16], [570, 610, 24]].forEach(([x, y, r2], i) => S.path(`M${x},${y - r2} a${r2},${r2} 0 1,1 -0.1,0`, { t: S.w("thought") + i * 0.15, dur: 0.3, w: 2 }));
        S.path(`M560,420 Q560,360 640,360 H900 Q980,360 980,440 V540 Q980,600 900,600 H640 Q560,600 560,540 Z`, { t: S.w("thought") + 0.4, dur: 0.8, w: 3 });
        const tP = S.w("person"), tD = S.w("decision"), tM = S.w("money");
        const a = S.uid("tp"); S.push(`<g id="${a}">`); figure(S, { cx: 770, cy: 545, scale: 0.26, t: tP, dur: 0.5, color: C.blue }); S.push(`</g>`);
        S.t(`tl.to("#${a}",{opacity:0,duration:0.2},${(tD - 0.15).toFixed(2)});`);
        const b = S.uid("td"); S.push(`<g id="${b}">`); S.path(`M770,560 V490 M770,490 L720,420 M770,490 L820,420`, { t: tD, dur: 0.5, color: C.lilac, w: 4 }); S.push(`</g>`);
        S.t(`tl.to("#${b}",{opacity:0,duration:0.2},${(tM - 0.15).toFixed(2)});`);
        coin(S, 770, 480, 60, tM);
      } },
      { id: "question", lines: [5, 6, 7], draw(S) {
        const q = S.bigText(540, 960, "?", { size: 520, t: S.w("question"), dur: 1 });
        S.text(540, 440, "NOT RANDOM", { size: 32, color: C.dim, t: S.w("random") });
        const tA = S.w("answer");
        S.t(`tl.to("#${q[2]}",{attr:{stroke:"${C.gold}"},duration:0.5},${tA.toFixed(2)});`);
        starGlyph(S, 800, 560, 60, tA);
        S.text(540, 1050, "AN ANSWER IS WAITING", { size: 30, color: C.gold, t: S.w("wakes") });
      } },
      { id: "cta", lines: [8, 9], draw(S) { ctaScene(S, { cta: 0.25, lift: S.w("three"), big: `COMMENT ${G("3AM")}`, sub: "Your 3 cards are in my Stories" }); } },
    ],
  },

  // ------------------------------------------------------------ V7: money flowing
  v7: {
    dir: "v7-money-flow", music: M + "Far More Other.mp3", musicStart: 10, trigger: "Amen",
    fix: {},
    sfx: [{ file: "chime.mp3", vol: 0.4, at: (sc) => sc[1].start + 0.9 }, { file: "chime.mp3", vol: 0.4, at: (sc) => sc[4].start + 2.2 }],
    scenes: [
      { id: "flow", lines: [0], draw(S) {
        headline(S, "MONEY IS FLOWING TO YOU", { t: 0.1, out: 2.5 });
        waves(S, 780, 0);
        [[260, 0.1], [540, 0.3], [820, 0.5]].forEach(([x, t]) => { const c = coin(S, x, 700, 46, t); S.t(`tl.fromTo("#${c}",{x:-120},{x:120,duration:2.6,ease:"sine.inOut"},0);`); });
      } },
      { id: "jar", lines: [1], draw(S) {
        S.path(`M420,520 H660 M440,520 V560 Q360,600 360,700 V1000 Q360,1040 400,1040 H680 Q720,1040 720,1000 V700 Q720,600 640,560 V520`, { t: 0, dur: 1, w: 3 });
        const lvl = S.uid("lvl"), clip = S.uid("jc");
        S.push(`<defs><clipPath id="${clip}"><rect x="364" y="560" width="352" height="478" rx="36"/></clipPath></defs><g clip-path="url(#${clip})"><rect id="${lvl}" x="364" y="1040" width="352" height="480" fill="${C.gold}" opacity="0.22"/></g>`);
        S.t(`tl.fromTo("#${lvl}",{y:0},{y:-400,duration:1.6,ease:"power2.out"},${S.w("never").toFixed(2)});`);
        coin(S, 540, 860, 60, S.w("money"));
      } },
      { id: "loved", lines: [2], draw(S) {
        const tL = S.w("love"), tY = S.w("yourself");
        const me = figure(S, { cx: 540, cy: 900, scale: 0.7, t: 0, dur: 1, core: true });
        figure(S, { cx: 250, cy: 960, scale: 0.45, t: tL, dur: 0.7, color: C.blue });
        figure(S, { cx: 830, cy: 960, scale: 0.45, t: tL + 0.15, dur: 0.7, color: C.blue });
        S.path(`M330,800 Q430,700 470,760 M750,800 Q650,700 610,760`, { t: tL + 0.4, dur: 0.6, color: C.gold, w: 2 });
        S.t(`tl.to("#${me.body}, #${me.head}",{attr:{stroke:"${C.gold}"},duration:0.6},${tY.toFixed(2)});`);
        coin(S, 540, 460, 48, S.w("abundance"));
      } },
      { id: "days", lines: [3], draw(S) {
        const tF = S.w("four");
        for (let i = 0; i < 4; i++) { const x = 170 + i * 190, last = i === 3; S.path(`M${x},620 h170 v200 h-170 Z M${x},670 h170`, { t: tF + i * 0.12, dur: 0.4, color: last ? C.gold : C.blue, w: last ? 3.5 : 2 }); S.text(x + 85, 770, `DAY ${i + 1}`, { size: 30, color: last ? C.gold : C.dim, t: tF + i * 0.12 + 0.2 }); }
        coin(S, 740, 940, 56, S.w("receive"));
        phone(S, 300, 950, S.w("friend"), 170);
        S.path(`M360,950 H460 M440,930 L462,950 L440,970`, { t: S.w("friend") + 0.3, dur: 0.4, color: C.gold, w: 3 });
      } },
      { id: "amen", lines: [4], draw(S) {
        S.bigText(540, 900, "AMEN", { size: 280, t: S.w("amen"), dur: 1, c1: C.gold, c2: C.gold });
        S.path(`M540,470 a90,90 0 1,1 -0.1,0`, { t: 0.1, dur: 0.8, color: C.lilac, w: 2 });
        S.path(`M540,500 V620 M480,560 H600`, { t: 0.4, dur: 0.6, color: C.gold, w: 3 });
      } },
      { id: "cta", lines: [5, 6], draw(S) { ctaScene(S, { cta: 0.2, lift: S.w("story"), big: `COMMENT ${G("AMEN")}`, sub: "Something is waiting in my Stories" }); } },
    ],
  },

  // ------------------------------------------------------------ V8: protection
  v8: {
    dir: "v8-protection", music: M + "Insensible - Ominous.mp3", musicStart: 0, trigger: "222",
    fix: {},
    sfx: [{ file: "whoosh.mp3", vol: 0.3, at: (sc) => sc[1].start }, { file: "chime.mp3", vol: 0.4, at: (sc) => sc[4].start + 1.4 }],
    scenes: [
      { id: "eye", lines: [0], draw(S) { headline(S, "BE CAREFUL", { t: 0.1, out: 1.6 }); eye(S, 540, 760, 260, 0, C.ink, 0.6); } },
      { id: "shadow", lines: [1], draw(S) {
        figure(S, { cx: 640, cy: 900, scale: 0.75, t: 0, dur: 1 });
        const sh = S.uid("sh"); S.push(`<g id="${sh}" opacity="0.85">`); figure(S, { cx: 360, cy: 860, scale: 0.75, t: S.w("person"), dur: 1.2, color: C.coral, w: 2 }); S.push(`</g>`);
        S.bigText(360, 520, "?", { size: 160, t: S.w("reveal"), dur: 0.6, c1: C.coral, c2: C.coral });
      } },
      { id: "send", lines: [2], draw(S) {
        phone(S, 540, 760, 0, 520);
        S.path(`M640,620 A120,120 0 1,0 660,780 M640,620 l-34,-4 M640,620 l4,34`, { t: S.w("yourself"), dur: 0.8, color: C.gold, w: 4 });
        figure(S, { cx: 540, cy: 830, scale: 0.3, t: 0.4, dur: 0.6 });
      } },
      { id: "blocked", lines: [3], draw(S) {
        const tB = S.w("blocking");
        S.path(`M160,620 H920`, { t: tB, dur: 0.4, color: C.coral, w: 6 });
        for (let i = 0; i < 5; i++) { const x = 220 + i * 160; const g = S.uid("sp"); S.push(`<g id="${g}">`); starGlyph(S, x, 900, 26, 0.1 + i * 0.1, i % 2 ? C.lilac : C.gold); S.push(`</g>`); S.t(`tl.fromTo("#${g}",{y:120},{y:-200,duration:${(tB + 0.3).toFixed(2)},ease:"power1.out"},0);`); S.t(`tl.to("#${g}",{opacity:0.3,duration:0.3},${(tB + 0.3).toFixed(2)});`); }
        S.text(540, 560, "BLOCKED", { size: 32, color: C.coral, t: tB });
      } },
      { id: "protect", lines: [4], draw(S) {
        figure(S, { cx: 540, cy: 960, scale: 0.55, t: 0, dur: 0.8 });
        shield(S, 540, 780, 260, S.w("protection"));
        S.text(540, 470, "COMMENT 222", { size: 40, weight: 700, color: C.gold, t: S.w("222") });
      } },
      { id: "cta", lines: [5, 6], draw(S) { ctaScene(S, { cta: 0.2, lift: S.w("story"), big: `COMMENT ${G("222")}`, sub: "Then check my Stories" }); } },
    ],
  },

  // ------------------------------------------------------------ V9: old man inheritance
  v9: {
    dir: "v9-old-man", music: M + "Distorded Memories.mp3", musicStart: 0, trigger: "YES",
    fix: { "yes#2": "YES" },
    sfx: [{ file: "whoosh.mp3", vol: 0.28, at: (sc) => sc[2].start }, { file: "chime.mp3", vol: 0.4, at: (sc) => sc[3].start + 1.3 }, { file: "chime.mp3", vol: 0.4, at: (sc) => sc[5].start + 1.0 }],
    scenes: [
      { id: "elder", lines: [0, 1], draw(S) {
        headline(S, "SOMEONE IS THINKING OF YOU", { t: 0.1, out: 5.0 });
        elder(S, 460, 1040, 0, 0.55);
        const tT = S.w("thinking");
        [[640, 560, 10], [690, 510, 16], [760, 450, 24]].forEach(([x, y, r2], i) => S.path(`M${x},${y - r2} a${r2},${r2} 0 1,1 -0.1,0`, { t: tT + i * 0.15, dur: 0.3, w: 2 }));
        figure(S, { cx: 860, cy: 520, scale: 0.2, t: tT + 0.5, dur: 0.5, color: C.gold });
      } },
      { id: "doc", lines: [2], draw(S) {
        const g = S.uid("doc"); S.push(`<g id="${g}">`); scroll(S, 540, 600, 0.1, { w: 240, h: 300 }); S.push(`</g>`);
        hand(S, 540, 920, { flip: true, scale: 0.55, t: S.w("hands"), dur: 0.8 });
        S.t(`tl.to("#${g}",{y:120,duration:0.8,ease:"power2.inOut"},${(S.w("hands") + 0.2).toFixed(2)});`);
      } },
      { id: "gifts", lines: [3], draw(S) {
        const tI = S.w("inheritance"), tL = S.w("land"), tT = S.w("treasure");
        scroll(S, 220, 760, tI, { w: 150, h: 200 });
        S.text(220, 960, "INHERITANCE", { size: 28, color: C.gold, t: tI });
        parcel(S, 540, 780, tL);
        S.text(540, 960, "LAND", { size: 28, color: C.blue, t: tL });
        chest(S, 860, 720, tT);
        S.text(860, 960, "TREASURE", { size: 28, color: C.gold, t: tT });
      } },
      { id: "fortune", lines: [4, 5], draw(S) {
        S.stars(50, 91, [60, 360, 1020, 900], 0);
        S.path(`M60,920 H1020`, { t: 0, dur: 0.6, w: 2 });
        const st = S.uid("st"); S.push(`<g id="${st}">`); starGlyph(S, 540, 660, 90, 0.1); S.push(`</g>`);
        S.t(`tl.fromTo("#${st}",{y:280},{y:0,duration:2,ease:"power2.out"},0.1);`);
        const tF = S.w("fortune");
        for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; S.path(`M${(540 + Math.cos(a) * 130).toFixed(1)},${(660 + Math.sin(a) * 130).toFixed(1)} L${(540 + Math.cos(a) * 210).toFixed(1)},${(660 + Math.sin(a) * 210).toFixed(1)}`, { t: tF + i * 0.03, dur: 0.4, color: C.gold, w: 2 }); }
        S.text(540, 1020, "GOOD FORTUNE", { size: 32, color: C.gold, t: tF });
      } },
      { id: "receive", lines: [6], draw(S) {
        hand(S, 400, 900, { flip: true, scale: 0.85, t: 0, dur: 0.9 });
        hand(S, 680, 900, { scale: 0.85, t: 0.1, dur: 0.9 });
        S.bigText(540, 620, "?", { size: 200, t: S.w("willing"), dur: 0.7, c1: C.gold, c2: C.gold });
      } },
      { id: "yes", lines: [7], draw(S) {
        S.bigText(540, 870, "YES", { size: 330, t: 0.15, dur: 1.2, c1: C.gold, c2: C.gold });
        S.path(`M540,470 a60,60 0 1,1 -0.1,0`, { t: S.w("seal"), dur: 0.6, color: C.coral, w: 3 });
        starGlyph(S, 540, 530, 30, S.w("seal") + 0.3, C.coral);
      } },
      { id: "cta", lines: [8, 9], draw(S) { ctaScene(S, { cta: 0.2, lift: S.w("stories"), big: `WRITE ${G("YES")}`, sub: "The message is in my Stories" }); } },
    ],
  },

  // ------------------------------------------------------------ V10: lucky signs 2027
  v10: {
    dir: "v10-lucky-signs", music: M + "Grounded.mp3", musicStart: 20, musicUnder: 16, trigger: "222",
    fix: { "227": "2027", "Ares": "Aries" },
    sfx: [{ file: "whoosh.mp3", vol: 0.28, at: (sc) => sc[5].start }, { file: "chime.mp3", vol: 0.4, at: (sc) => sc[8].start + 2.6 }, { file: "chime.mp3", vol: 0.4, at: (sc) => sc[9].start + 6.2 }],
    scenes: [
      { id: "hook", lines: [0], draw(S) {
        headline(S, "LUCKIEST SIGNS OF 2027", { t: 0.1, out: 7.2 });
        S.bigText(540, 870, "2027", { size: 330, t: 0, dur: 1.3, from: 0.55 });
        const tT = S.w("two");
        [330, 750].forEach((x, i) => { S.path(`M${x},940 a70,70 0 1,1 -0.1,0`, { t: tT + i * 0.2, dur: 0.7, color: C.gold, w: 3 }); S.text(x, 1040, "?", { font: "League Gothic", size: 70, color: C.gold, t: tT + i * 0.2 + 0.3 }); });
      } },
      { id: "overlooked", lines: [1, 2], draw(S) {
        crowd(S, 900, 0, 7, []);
        const tO = S.w("overlooked");
        S.path(`M235,1000 a40,40 0 1,1 -0.1,0 M755,1000 a40,40 0 1,1 -0.1,0`, { t: tO, dur: 0.6, color: C.gold, w: 2 });
        S.text(540, 470, "OVERLOOKED", { size: 32, color: C.dim, t: tO });
        S.path(`M60,560 H1020`, { t: S.w("moment"), dur: 0.8, w: 2 });
        const sun = S.uid("sun"); S.push(`<g id="${sun}">`); S.path(`M440,560 A100,100 0 0,1 640,560`, { t: S.w("moment"), dur: 0.8, color: C.gold, w: 3 }); S.push(`</g>`);
      } },
      { id: "background", lines: [3, 4, 5], draw(S) {
        crowd(S, 760, 0, 5, [1, 3]);
        const tW = S.w("hard");
        [410, 670].forEach((x, i) => { for (let k = 0; k < 3; k++) S.path(`M${x - 50},${1010 - k * 40} h100 v36 h-100 Z`, { t: tW + i * 0.2 + k * 0.12, dur: 0.3, color: C.lilac, w: 2 }); });
        S.text(540, 470, "BEHIND THE SCENES", { size: 30, color: C.dim, t: S.w("background") });
        S.path(`M540,520 V600 M515,575 L540,600 L565,575`, { t: S.w("underestimated"), dur: 0.5, color: C.coral, w: 3 });
      } },
      { id: "everyone", lines: [6], draw(S) {
        const hubs = [[400, 760], [680, 760]];
        hubs.forEach(([x, y], i) => figure(S, { cx: x, cy: y + 120, scale: 0.4, t: 0.05 + i * 0.1, dur: 0.6 }));
        const r = rng(6);
        for (let i = 0; i < 12; i++) { const a = r() * Math.PI * 2, d = 260 + r() * 120, [hx, hy] = hubs[i % 2]; const x = 540 + Math.cos(a) * d * 1.1, y = 760 + Math.sin(a) * d * 0.8; S.path(`M${hx},${hy} L${x.toFixed(1)},${y.toFixed(1)}`, { t: S.w("everyone") + i * 0.06, dur: 0.4, color: C.dim, w: 1.5 }); S.path(`M${x.toFixed(1)},${(y - 10).toFixed(1)} a10,10 0 1,1 -0.1,0`, { t: S.w("everyone") + i * 0.06 + 0.3, dur: 0.2, color: C.dim, w: 2 }); }
        S.text(540, 470, "NO RECOGNITION", { size: 30, color: C.coral, t: S.w("recognition") });
      } },
      { id: "portal", lines: [7], draw(S) {
        portal(S, { top: 430, bot: 1010, w: 600, t: 0, plaque: "2027", speed: 0.7 });
        S.path(`M540,560 a170,170 0 1,1 -0.1,0`, { t: S.w("everything"), dur: 1.4, color: C.gold, w: 3 });
      } },
      { id: "spotlight", lines: [8], draw(S) {
        const tS = S.w("spotlight");
        S.path(`M470,380 L300,1000 M610,380 L780,1000`, { t: tS, dur: 0.6, color: C.gold, w: 2, op: 0.8 });
        S.path(`M540,1000 m-240,0 a240,50 0 1,0 480,0 a240,50 0 1,0 -480,0`, { t: tS + 0.3, dur: 0.7, color: C.gold, w: 2 });
        const f = figure(S, { cx: 540, cy: 940, scale: 0.6, t: 0, dur: 1 });
        S.t(`tl.to("#${f.body}, #${f.head}",{attr:{stroke:"${C.gold}"},duration:0.6},${S.w("worth").toFixed(2)});`);
      } },
      { id: "betting", lines: [9, 10], draw(S) {
        crowd(S, 960, 0, 7, [2, 4]);
        S.text(540, 470, "NOBODY BET ON THEM", { size: 30, color: C.dim, t: S.w("betting") });
        const tL = S.w("luckiest"), r = rng(13);
        for (let i = 0; i < 10; i++) { const x = 300 + r() * 480, y = 560 + r() * 160; starGlyph(S, +x.toFixed(0), +y.toFixed(0), 14 + r() * 18, tL + i * 0.08, i % 2 ? C.lilac : C.gold); }
      } },
      { id: "signs", lines: [11, 12], draw(S) {
        const tA = S.w("ares"), tL = S.w("leo");
        S.path(`M320,520 a160,160 0 1,1 -0.1,0`, { t: tA, dur: 0.8, color: C.lilac, w: 2 });
        S.path(ARIES(320, 680, 1.4), { t: tA + 0.1, dur: 1, color: C.gold, w: 5 });
        S.text(320, 920, "ARIES", { size: 34, color: C.gold, t: tA + 0.4 });
        S.path(`M760,520 a160,160 0 1,1 -0.1,0`, { t: tL, dur: 0.8, color: C.lilac, w: 2 });
        S.path(LEO(760, 680, 1.4), { t: tL + 0.1, dur: 1, color: C.gold, w: 5 });
        S.text(760, 920, "LEO", { size: 34, color: C.gold, t: tL + 0.4 });
        S.text(540, 1030, "CONGRATULATIONS", { size: 32, color: C.ink, t: S.w("congratulations") });
      } },
      { id: "comment", lines: [13], draw(S) {
        S.path(ARIES(330, 560, 0.7), { t: 0, dur: 0.6, color: C.gold, w: 4 });
        S.path(LEO(750, 560, 0.7), { t: 0.1, dur: 0.6, color: C.gold, w: 4 });
        S.bigText(540, 1000, "222", { size: 300, t: S.w("222") - 0.3, dur: 0.9, c1: C.gold, c2: C.gold });
      } },
      { id: "cta", lines: [14, 15, 16], draw(S) { ctaScene(S, { cta: 0.25, lift: S.w("stories"), big: `COMMENT ${G("222")}`, sub: "Your reading is in my Stories" }); } },
    ],
  },

  // ------------------------------------------------------------ V11: falling apart -> tower -> star
  v11: {
    dir: "v11-falling-apart", music: M + "green to blue.m4a", musicStart: 6, trigger: "CLAIM",
    fix: { "card#1": "cards", "claim,": "CLAIM," },
    sfx: [{ file: "whoosh.mp3", vol: 0.28, at: (sc) => sc[2].start }, { file: "whoosh.mp3", vol: 0.28, at: (sc) => sc[6].start }, { file: "chime.mp3", vol: 0.45, at: (sc) => sc[6].start + 4.3 }],
    scenes: [
      { id: "tower", lines: [0, 1, 2], draw(S) {
        headline(S, "IF IT'S ALL FALLING APART", { t: 0.1, out: 4.3 });
        S.path(`M300,1040 H780`, { t: 0, dur: 0.4, w: 2, from: 0.6 });
        const top = tower(S, 540, 1040, 0, { from: 0.6 });
        const tA = S.w("apart");
        S.path(`M560,520 L535,590 L575,650 L520,730 L560,790`, { t: tA - 0.2, dur: 0.35, color: C.coral, w: 4, ease: "power3.in" });
        S.t(`tl.to("#${top}",{x:-60,y:70,rotation:-14,svgOrigin:"440 740",duration:0.6,ease:"power2.in"},${(tA + 0.1).toFixed(2)});`);
        starGlyph(S, 820, 520, 40, S.w("congratulations"));
        const ring = S.uid("ring"); S.push(`<circle id="${ring}" cx="820" cy="760" r="60" fill="none" stroke="${C.gold}" stroke-width="3" pathLength="1" stroke-dasharray="1 1"/>`);
        S.t(`tl.fromTo("#${ring}",{strokeDashoffset:0},{strokeDashoffset:1,duration:${(S.dur - S.w("30")).toFixed(2)},ease:"none"},${S.w("30").toFixed(2)});`);
        S.text(820, 772, "30s", { size: 30, color: C.gold, t: S.w("30") });
      } },
      { id: "losses", lines: [3, 4, 5], draw(S) {
        const tM = S.w("money"), tP = S.w("person"), tJ = S.w("job");
        const c = coin(S, 220, 700, 70, tM); S.t(`tl.to("#${c}",{y:300,opacity:0,duration:1,ease:"power2.in"},${(tM + 0.6).toFixed(2)});`);
        S.text(220, 1040, "MONEY", { size: 28, color: C.gold, t: tM });
        const p = S.uid("pp"); S.push(`<g id="${p}">`); figure(S, { cx: 540, cy: 860, scale: 0.4, t: tP, dur: 0.6 }); S.push(`</g>`);
        S.t(`tl.to("#${p}",{x:120,opacity:0.15,duration:1.2,ease:"power1.in"},${(tP + 0.5).toFixed(2)});`);
        S.text(540, 1040, "A PERSON", { size: 28, color: C.blue, t: tP });
        S.path(`M790,640 h140 v100 h-140 Z M830,640 v-24 h60 v24`, { t: tJ, dur: 0.6, w: 3 });
        const bat = S.uid("bat"); S.push(`<rect id="${bat}" x="800" y="770" width="120" height="30" fill="${C.coral}" opacity="0.8"/>`); S.fade(bat, tJ + 0.3, 0.2, 0.8);
        S.path(`M796,766 h128 v38 h-128 Z`, { t: tJ + 0.3, dur: 0.3, color: C.coral, w: 2 });
        S.t(`tl.to("#${bat}",{attr:{width:12},duration:1.2},${(tJ + 0.5).toFixed(2)});`);
        S.text(860, 1040, "THE JOB", { size: 28, color: C.coral, t: tJ });
      } },
      { id: "cleared", lines: [6, 7], draw(S) {
        S.dotted(`M300,520 H780 V1000 H300 Z`, { t: 0.05, color: C.ink, gap: 12, w: 3 });
        const rs = [[400, 640, 40, 3], [650, 700, 50, 5], [480, 880, 46, 7], [700, 900, 36, 8]].map(([x, y, r2, sd]) => { const g = S.uid("rk"); S.push(`<g id="${g}">`); rock(S, x, y, r2, sd, { t: 0.1, color: C.coral }); S.push(`</g>`); return g; });
        const tC = S.w("cleared");
        S.path(`M280,500 V1020`, { t: tC - 0.3, dur: 0.01, color: C.gold, w: 4 });
        rs.forEach((g, i) => S.t(`tl.to("#${g}",{x:600,opacity:0,duration:0.7,ease:"power2.in"},${(tC - 0.2 + i * 0.05).toFixed(2)});`));
        S.text(540, 470, "SPACE", { size: 32, color: C.gold, t: tC });
      } },
      { id: "choose", lines: [8, 9], draw(S) {
        S.path(`M300,520 H780 V1000 H300 Z`, { t: 0, dur: 0.6, color: C.dim, w: 2 });
        figure(S, { cx: 180, cy: 900, scale: 0.42, t: S.w("you"), dur: 0.7, color: C.gold });
        const tD = S.w("days");
        for (let i = 0; i < 5; i++) S.path(`M${360 + i * 76},1060 h60 v50 h-60 Z`, { t: tD + i * 0.08, dur: 0.3, color: i < 2 ? C.gold : C.blue, w: 2 });
      } },
      { id: "fill", lines: [10], draw(S) {
        S.path(`M300,520 H780 V1000 H300 Z`, { t: 0, dur: 0.5, color: C.dim, w: 2 });
        const r = rng(44);
        for (let i = 0; i < 26; i++) { const x = 330 + r() * 420, y = 550 + r() * 420, id = S.uid("f"); S.push(`<circle id="${id}" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="7" fill="${i % 3 ? C.lilac : C.gold}"/>`); S.t(`tl.fromTo("#${id}",{opacity:0,x:${(r() > 0.5 ? 1 : -1) * 500}},{opacity:1,x:0,duration:0.7,ease:"power2.out"},${(0.4 + i * 0.07).toFixed(2)});`); }
      } },
      { id: "cards", lines: [11, 12, 13], draw(S) {
        S.push(`<g transform="translate(360,760) rotate(-6)">`); cardBack(S, 260, 420, { t: 0.1, glyph: false, inner: C.coral }); S.push(`</g>`);
        tower(S, 360, 900, S.w("fears"), { scale: 0.42 });
        S.text(360, 1020, "THE TOWER", { size: 28, color: C.coral, t: S.w("fears") });
        const tP = S.w("prays");
        S.path(`M520,760 H600 M580,740 L602,760 L580,780`, { t: S.w("after"), dur: 0.4, color: C.gold, w: 3 });
        S.push(`<g transform="translate(740,760) rotate(6)">`); cardBack(S, 260, 420, { t: S.w("card", 1), glyph: false, inner: C.gold }); S.push(`</g>`);
        starGlyph(S, 740, 760, 80, tP);
        S.text(740, 1020, "THE STAR", { size: 28, color: C.gold, t: tP });
      } },
      { id: "cta", lines: [14, 15], draw(S) { ctaScene(S, { cta: 0.25, lift: S.w("three"), big: `COMMENT ${G("CLAIM")}`, sub: "Pull your 3 cards in my Stories" }); } },
    ],
  },
};
export { hand, coin, eye, shield, moon, waves, phone, starGlyph, tower, crowd, scroll, parcel };

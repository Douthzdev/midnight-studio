// Shot lists for the three test videos. Each draw(S) gets scene-local cue times via S.w(word) / S.line(k).
import { C, rng, smooth, poly, portal, figure, rock, cardBack, cardArc, headline, ctaScene } from "./lib.mjs";

const MUSIC = "M:/Google/hyperframes/Midnight-Studio/_antigos/avatar-video-6/assets/music.mp3";
const MUSIC2 = "M:/Google/hyperframes/Midnight-Studio/_antigos/avatar-video-5/assets/music.mp3";
const MUSIC3 = "M:/Google/hyperframes/Midnight-Studio/_antigos/avatar-video-2/assets/music.mp3";

// seven-segment digit at (x,y) top-left, w x h
export function seg7(S, ch, x, y, w, h, t, col) {
  const on = { "0": "abcdef", "1": "bc", "2": "abged", "3": "abgcd", "4": "fgbc", "5": "afgcd", "6": "afgedc", "7": "abc", "8": "abcdefg", "9": "abcdfg", ":": "" }[ch];
  const m = y + h / 2, g = 8, d = {
    a: `M${x + g},${y} H${x + w - g}`, b: `M${x + w},${y + g} V${m - g}`, c: `M${x + w},${m + g} V${y + h - g}`,
    d: `M${x + g},${y + h} H${x + w - g}`, e: `M${x},${m + g} V${y + h - g}`, f: `M${x},${y + g} V${m - g}`, g: `M${x + g},${m} H${x + w - g}`,
  };
  [...on].forEach((k, i) => S.path(d[k], { t: t + i * 0.07, dur: 0.3, color: col, w: 9 }));
}

// three upright cards with custom glyphs
export function threeCards(S, t, o = {}) {
  const xs = [290, 540, 790], rots = [-10, 0, 10], ids = [];
  xs.forEach((x, i) => {
    S.push(`<g transform="translate(${x},${o.y ?? 740}) rotate(${rots[i]})">`);
    const id = S.uid("tc"); S.push(`<g id="${id}">`);
    cardBack(S, o.w ?? 200, o.h ?? 320, { t: t + i * 0.15, glyph: false, inner: C.lilac });
    S.push(`</g></g>`); ids.push(id);
  });
  return { ids, xs, rots };
}

export const VIDEOS = {
  // ------------------------------------------------------------ V1: 12/12 portal
  v1: {
    dir: "v1-portal-1212", music: MUSIC, musicStart: 0,
    fix: { "1212,": "12/12,", "Fethon.": "Phaethon,", "Meteor": "meteor", "Shower": "shower" },
    sfx: [
      { file: "whoosh.mp3", vol: 0.3, at: (sc) => sc[2].start },
      { file: "whoosh.mp3", vol: 0.3, at: (sc) => sc[8].start },
      { file: "chime.mp3", vol: 0.45, at: (sc) => sc[8].start + 1.9 },
    ],
    scenes: [
      { id: "date", lines: [0, 1], draw(S) {
        headline(S, "THE 12/12 PORTAL", { t: 0.1, out: 5.4 });
        S.text(540, 480, "DECEMBER 12", { color: C.gold, size: 32, t: 0.2 });
        S.bigText(540, 860, "12/12", { size: 340, t: 0, dur: 1.3, from: 0.55 });
        const tDay = S.w("day"), tMonth = S.w("month");
        for (let i = 0; i < 12; i++) {
          const x = 126 + i * 70, last = i === 11;
          S.path(`M${x},960 h60 v60 h-60 Z`, { t: tDay + i * 0.05, dur: 0.3, color: last ? C.gold : C.blue, w: last ? 3.5 : 2 });
          S.text(x + 30, 1000, String(i + 1), { size: 28, color: last ? C.gold : C.dim, t: tDay + i * 0.05 + 0.15 });
        }
        S.path(`M${896},946 h88 v88 h-88 Z`, { t: tMonth, dur: 0.5, color: C.gold, w: 2 });
      } },
      { id: "cycle", lines: [2, 3], draw(S) {
        portal(S, { top: 430, bot: 1010, w: 600, t: 0, plaque: "12", speed: 0.8 });
        S.text(540, 380, "NUMEROLOGY · 12 = COMPLETION", { size: 28, color: C.gold, t: S.w("completion") });
        S.path(`M540,560 a170,170 0 1,1 -0.1,0`, { t: S.w("cycle"), dur: 1.8, color: C.gold, w: 4 });
        const id = S.uid("arc");
        S.push(`<path id="${id}" d="M540,620 a110,110 0 1,1 -0.1,0" fill="none" stroke="${C.lilac}" stroke-width="4" stroke-linecap="round" pathLength="1" stroke-dasharray="1 1"/>`);
        S.t(`tl.fromTo("#${id}",{strokeDashoffset:1},{strokeDashoffset:0.62,duration:1.1,ease:"power2.out"},${S.w("new")});`);
      } },
      { id: "sky", lines: [4, 5], draw(S) {
        S.stars(70, 12, [60, 300, 1020, 1100], 0);
        const tS = S.w("sky");
        const pts = { castor: [440, 470], pollux: [560, 500], a: [410, 610], b: [380, 760], c: [350, 920], d: [530, 640], e: [520, 790], f: [500, 940] };
        const P = (k) => pts[k].join(",");
        S.path(`M${P("castor")} L${P("a")} L${P("b")} L${P("c")} M${P("pollux")} L${P("d")} L${P("e")} L${P("f")} M${P("a")} L${P("d")} M${P("b")} L${P("e")}`, { t: tS, dur: 1.4, color: C.blue, w: 2 });
        Object.values(pts).forEach(([x, y], i) => { const id = S.uid("st"); S.push(`<circle id="${id}" cx="${x}" cy="${y}" r="${i < 2 ? 9 : 5}" fill="${C.ink}"/>`); S.fade(id, tS + 0.1 * i, 0.3); });
        S.text(420, 450, "CASTOR", { anchor: "end", size: 28, color: C.blue, t: tS + 0.6 });
        S.text(585, 490, "POLLUX", { anchor: "start", size: 28, color: C.blue, t: tS + 0.7 });
        S.text(330, 990, "GEMINI", { size: 28, color: C.dim, t: tS + 0.9 });
        const tM = S.w("meteor"), r = rng(5), [rx, ry] = [470, 455];
        const gid = S.uid("grad");
        S.push(`<defs><linearGradient id="${gid}" gradientUnits="objectBoundingBox" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${C.gold}" stop-opacity="0"/><stop offset="1" stop-color="#FFF6E6"/></linearGradient></defs>`);
        for (let i = 0; i < 11; i++) {
          const a = (i / 11) * Math.PI * 2 + r() * 0.3, r0 = 60 + r() * 60, r1 = r0 + 140 + r() * 120;
          const x0 = rx + Math.cos(a) * r0, y0 = ry + Math.sin(a) * r0, x1 = rx + Math.cos(a) * r1, y1 = ry + Math.sin(a) * r1;
          const id = S.path(`M${x0.toFixed(1)},${y0.toFixed(1)} L${x1.toFixed(1)},${y1.toFixed(1)}`, { t: tM + i * 0.28, dur: 0.35, color: C.gold, w: 3, ease: "power1.in" });
          S.t(`tl.to("#${id}",{opacity:0,duration:0.5},${(tM + i * 0.28 + 0.55).toFixed(2)});`);
        }
        const rad = S.uid("rad"); S.push(`<circle id="${rad}" cx="${rx}" cy="${ry}" r="34" fill="none" stroke="${C.gold}" stroke-width="2" stroke-dasharray="4 7"/>`); S.fade(rad, tM, 0.4);
        S.text(680, 380, "GEMINIDS", { size: 32, color: C.gold, t: S.w("geminid") });
        S.text(540, 1080, "PEAK · DEC 13–14", { size: 30, color: C.gold, t: S.w("meteor") });
      } },
      { id: "orbit", lines: [6], draw(S) {
        S.stars(40, 3, [60, 360, 1020, 1100], 0);
        const sx = 380, sy = 720;
        S.path(`M${sx},${sy - 22} a22,22 0 1,1 -0.1,0`, { t: 0, dur: 0.5, color: C.gold, w: 3 });
        for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; S.path(`M${(sx + Math.cos(a) * 32).toFixed(1)},${(sy + Math.sin(a) * 32).toFixed(1)} L${(sx + Math.cos(a) * 46).toFixed(1)},${(sy + Math.sin(a) * 46).toFixed(1)}`, { t: 0.2, dur: 0.3, color: C.gold, w: 2 }); }
        S.text(sx, sy + 90, "SUN", { size: 28, color: C.gold, t: 0.3 });
        S.dotted(`M${sx},${sy - 170} a170,170 0 1,1 -0.1,0`, { t: 0.2, color: C.blue, gap: 10 });
        S.text(sx - 150, sy - 150, "EARTH", { size: 28, color: C.blue, t: 0.4, anchor: "end" });
        const a = 300, b = 135, c = Math.sqrt(a * a - b * b);
        const id = S.uid("orb");
        S.push(`<g transform="rotate(-24 ${sx} ${sy})"><ellipse id="${id}" cx="${(sx + c).toFixed(1)}" cy="${sy}" rx="${a}" ry="${b}" fill="none" stroke="${C.lilac}" stroke-width="3" pathLength="1" stroke-dasharray="1 1"/>`);
        const dust = S.uid("dust");
        S.push(`<ellipse id="${dust}" cx="${(sx + c).toFixed(1)}" cy="${sy}" rx="${a}" ry="${b}" fill="none" stroke="${C.gold}" stroke-width="4" stroke-linecap="round" stroke-dasharray="0.1 14"/>`);
        const ph = S.uid("ph"); S.push(`<circle id="${ph}" cx="${(sx + c + a).toFixed(1)}" cy="${sy}" r="11" fill="${C.ink}"/></g>`);
        S.t(`tl.fromTo("#${id}",{strokeDashoffset:1},{strokeDashoffset:0,duration:1.3,ease:"power2.inOut"},${S.w("dust")});`);
        S.fade(dust, S.w("dust") + 0.6, 0.6, 0.8); S.fade(ph, S.w("rock"), 0.3);
        S.text(760, 420, "3200 PHAETHON", { size: 30, color: C.lilac, t: S.w("fethon") });
      } },
      { id: "burn", lines: [7, 8], draw(S) {
        S.stars(40, 9, [60, 300, 1020, 520], 0);
        S.path(`M-60,1130 Q540,880 1140,1130`, { t: 0, dur: 1, color: C.blue, w: 4 });
        S.dotted(`M60,560 H1020`, { t: 0.1, color: C.dim, gap: 12 });
        S.dotted(`M60,860 H1020`, { t: 0.2, color: C.dim, gap: 12 });
        S.text(900, 545, "120 KM", { anchor: "end", size: 28, color: C.dim, t: 0.3 });
        S.text(900, 845, "70 KM", { anchor: "end", size: 28, color: C.dim, t: 0.4 });
        const r = rng(21), tB = S.w("burning"), tL = S.w("becoming");
        for (let i = 0; i < 7; i++) {
          const x1 = 160 + i * 120 + r() * 40, y1 = 640 + r() * 200, len = 260 + r() * 140;
          const x0 = x1 + len * 0.62, y0 = y1 - len * 0.78;
          S.path(`M${x0.toFixed(1)},${y0.toFixed(1)} L${x1.toFixed(1)},${y1.toFixed(1)}`, { t: tB + i * 0.22, dur: 0.45, color: i % 2 ? C.gold : C.ink, w: 3, ease: "power1.in" });
          const f = S.uid("fl"); S.push(`<circle id="${f}" cx="${x1.toFixed(1)}" cy="${y1.toFixed(1)}" r="9" fill="#FFF6E6"/>`);
          S.t(`tl.fromTo("#${f}",{opacity:0,scale:0.2,svgOrigin:"${x1.toFixed(1)} ${y1.toFixed(1)}"},{opacity:1,scale:1.6,duration:0.35,ease:"power2.out"},${(tL + i * 0.08).toFixed(2)});`);
        }
      } },
      { id: "you", lines: [9, 10], draw(S) {
        figure(S, { cx: 540, cy: 770, scale: 1, t: 0, dur: 1.2 });
        const tA = S.w("asked");
        [[330, 560, 60, 1], [760, 520, 52, 2], [770, 840, 66, 3], [300, 880, 48, 4]].forEach(([x, y, rr, sd], i) => {
          const id = rock(S, x, y, rr, sd, { t: tA + i * 0.18, color: i % 2 ? C.coral : C.gold });
        });
      } },
      { id: "teach", lines: [11], draw(S) {
        const p = portal(S, { top: 430, bot: 1010, w: 600, t: 0, plaque: "12/12", speed: 0.6 });
        const f = figure(S, { cx: 540, cy: 805, scale: 0.6, t: 0.4, dur: 1, core: true });
        const tT = S.w("teach");
        S.t(`tl.to("#${f.body}, #${f.head}",{attr:{stroke:"${C.gold}"},duration:0.6},${tT});`);
      } },
      { id: "cards", lines: [12, 13], draw(S) {
        const c = threeCards(S, 0.1);
        const tW = S.w("where"), tB = S.w("break"), tN = S.w("next");
        // glyphs drawn in absolute coords inside each card's rotated frame
        const glyph = (i, d, t, col) => { S.push(`<g transform="translate(${c.xs[i]},740) rotate(${c.rots[i]})">`); S.path(d, { t, dur: 0.6, color: col, w: 4 }); S.push(`</g>`); };
        glyph(0, `M0,-40 a40,40 0 1,1 -0.1,0 M0,-6 a6,6 0 1,1 -0.1,0`, tW, C.gold);
        glyph(1, `M14,-70 L-22,4 H10 L-14,70`, tB, C.coral);
        glyph(2, `M0,-62 L14,-14 L62,0 L14,14 L0,62 L-14,14 L-62,0 L-14,-14 Z`, tN, C.gold);
        S.text(290, 960, "NOW", { size: 30, color: C.gold, t: tW });
        S.text(540, 960, "BREAK", { size: 30, color: C.coral, t: tB });
        S.text(790, 960, "NEXT", { size: 30, color: C.gold, t: tN });
      } },
      { id: "cta", lines: [14], draw(S) { ctaScene(S, { cta: 0.3, lift: S.w("choose") }); } },
    ],
  },

  // ------------------------------------------------------------ V2: why 222
  v2: {
    dir: "v2-why-222", music: MUSIC2, musicStart: 0,
    fix: { "clack,": "clock,", "two": "222,", "two,": "" },
    sfx: [
      { file: "whoosh.mp3", vol: 0.3, at: (sc) => sc[1].start },
      { file: "whoosh.mp3", vol: 0.3, at: (sc) => sc[5].start },
      { file: "chime.mp3", vol: 0.45, at: (sc) => sc[8].start + 3.2 },
    ],
    scenes: [
      { id: "hook", lines: [0], draw(S) {
        headline(S, "WHY YOU KEEP SEEING 222", { t: 0.1, out: 3.4 });
        S.bigText(540, 960, "222", { size: 520, t: 0, dur: 1.3, from: 0.55 });
      } },
      { id: "clock", lines: [1], draw(S) {
        S.path(`M250,560 H830 Q870,560 870,600 V860 Q870,900 830,900 H250 Q210,900 210,860 V600 Q210,560 250,560 Z`, { t: 0, dur: 0.6, w: 3 });
        S.path(`M232,582 H848 V878 H232 Z`, { t: 0.1, dur: 0.6, color: C.blue, w: 1.5, op: 0.7 });
        seg7(S, "2", 300, 630, 110, 200, 0.3, C.gold);
        const d1 = S.uid("c"), d2 = S.uid("c");
        S.push(`<circle id="${d1}" cx="470" cy="690" r="9" fill="${C.gold}"/><circle id="${d2}" cx="470" cy="770" r="9" fill="${C.gold}"/>`);
        S.fade(d1, 0.5, 0.2); S.fade(d2, 0.5, 0.2);
        seg7(S, "2", 530, 630, 110, 200, 0.55, C.gold); seg7(S, "2", 680, 630, 110, 200, 0.75, C.gold);
      } },
      { id: "receipt", lines: [2], draw(S) {
        let zig = ""; for (let i = 0; i <= 10; i++) zig += ` L${710 - i * 34},${i % 2 ? 1010 : 990}`;
        S.path(`M370,440 H710 V990${zig} L370,990 Z`, { t: 0, dur: 0.8, w: 3 });
        [520, 580, 640, 700, 760].forEach((y, i) => S.path(`M410,${y} H${560 + (i * 37) % 100} M620,${y} H670`, { t: 0.2 + i * 0.06, dur: 0.3, color: C.dim, w: 3 }));
        S.dotted(`M410,830 H670`, { t: 0.5, color: C.dim, gap: 8 });
        S.text(410, 900, "TOTAL", { anchor: "start", size: 30, t: 0.6 });
        S.text(670, 905, "$2.22", { anchor: "end", size: 44, weight: 700, color: C.gold, t: 0.75 });
      } },
      { id: "plate", lines: [3, 4], draw(S) {
        S.path(`M220,560 H860 Q890,560 890,590 V870 Q890,900 860,900 H220 Q190,900 190,870 V590 Q190,560 220,560 Z`, { t: 0, dur: 0.6, w: 3 });
        S.path(`M214,584 H866 V876 H214 Z`, { t: 0.1, dur: 0.6, color: C.lilac, w: 1.5, op: 0.7 });
        [[250, 610], [830, 610], [250, 850], [830, 850]].forEach(([x, y]) => S.path(`M${x},${y - 9} a9,9 0 1,1 -0.1,0`, { t: 0.3, dur: 0.3, w: 2 }));
        S.bigText(540, 820, "222·ARC", { size: 200, t: 0.25, dur: 0.9, c1: C.gold, c2: C.gold });
        const tA = S.w("again"), r = rng(222);
        [[200, 420], [860, 400], [140, 1020], [900, 1060], [560, 380], [330, 1090], [760, 990]].forEach(([x, y], i) =>
          S.text(x, y, "222", { size: 30 + Math.floor(r() * 28), color: i % 2 ? C.gold : C.dim, t: tA + i * 0.13, weight: 600 }));
      } },
      { id: "connect", lines: [5, 6], draw(S) {
        const cx = 540, cy = 760, R = 230, pairs = [];
        [-90, 30, 150].forEach((deg, k) => {
          const a = deg * Math.PI / 180, px = cx + Math.cos(a) * R, py = cy + Math.sin(a) * R, ox = -Math.sin(a) * 70, oy = Math.cos(a) * 70;
          pairs.push([[px - ox, py - oy], [px + ox, py + oy]]);
        });
        const tT = S.w("2"), t3 = S.w("three"), tR = S.w("repeated");
        pairs.forEach(([[x0, y0], [x1, y1]], k) => {
          const t = k === 0 ? tT : t3 + (k - 1) * 0.3;
          S.path(`M${x0.toFixed(1)},${y0.toFixed(1)} L${x1.toFixed(1)},${y1.toFixed(1)}`, { t: t + 0.25, dur: 0.5, color: C.gold, w: 3 });
          [[x0, y0], [x1, y1]].forEach(([x, y]) => S.path(`M${x.toFixed(1)},${(y - 24).toFixed(1)} a24,24 0 1,1 -0.1,0`, { t, dur: 0.5, w: 3 }));
        });
        S.text(540, 420, "2 = CONNECTION", { size: 30, color: C.gold, t: S.w("connection") });
        [1, 1.35, 1.7].forEach((k, i) => {
          const pts = [-90, 30, 150].map((d) => [+(cx + Math.cos(d * Math.PI / 180) * R * 0.45 * k).toFixed(1), +(cy + Math.sin(d * Math.PI / 180) * R * 0.45 * k).toFixed(1)]);
          S.path(poly(pts), { t: tR + i * 0.2, dur: 0.6, color: i % 2 ? C.lilac : C.blue, w: 2 });
        });
      } },
      { id: "pattern", lines: [7, 8], draw(S) {
        const r = rng(8), cx = 540, cy = 760, tP = S.w("pattern"), tA = S.w("attention");
        const targets = [];
        [[90, 0], [180, 30], [270, 0]].forEach(([rad, off]) => { for (let i = 0; i < 6; i++) { const a = (off + i * 60 - 90) * Math.PI / 180; targets.push([cx + Math.cos(a) * rad, cy + Math.sin(a) * rad]); } });
        targets.forEach(([tx, ty], i) => {
          const x = 120 + r() * 840, y = 420 + r() * 700, id = S.uid("dot");
          S.push(`<circle id="${id}" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="10" fill="${i < 6 ? C.gold : C.ink}"/>`);
          S.fade(id, 0.05 + i * 0.04, 0.3);
          S.t(`tl.to("#${id}",{attr:{cx:${tx.toFixed(1)},cy:${ty.toFixed(1)}},duration:1.1,ease:"power3.inOut"},${(tP + i * 0.02).toFixed(2)});`);
        });
        const hexA = [0, 2, 4].map((i) => targets[12 + i]), hexB = [1, 3, 5].map((i) => targets[12 + i]);
        S.path(poly(hexA.map((p) => p.map((v) => +v.toFixed(1)))), { t: tA, dur: 0.8, color: C.blue, w: 2 });
        S.path(poly(hexB.map((p) => p.map((v) => +v.toFixed(1)))), { t: tA + 0.2, dur: 0.8, color: C.lilac, w: 2 });
        S.path(`M${cx},${cy - 180} a180,180 0 1,1 -0.1,0`, { t: tA + 0.4, dur: 1, color: C.gold, w: 2 });
      } },
      { id: "scroll", lines: [9], draw(S) {
        const clip = S.uid("clip");
        S.push(`<defs><clipPath id="${clip}"><rect x="362" y="430" width="356" height="640" rx="18"/></clipPath></defs>`);
        S.path(`M390,400 H690 Q740,400 740,450 V1050 Q740,1100 690,1100 H390 Q340,1100 340,1050 V450 Q340,400 390,400 Z`, { t: 0, dur: 0.7, w: 3 });
        S.path(`M500,418 H580`, { t: 0.3, dur: 0.3, w: 4 });
        const feed = S.uid("feed"); S.push(`<g clip-path="url(#${clip})"><g id="${feed}">`);
        for (let i = 0; i < 9; i++) {
          const y = 450 + i * 230;
          S.push(`<rect x="386" y="${y}" width="308" height="200" rx="12" fill="none" stroke="${i === 4 ? C.gold : C.dim}" stroke-width="${i === 4 ? 3 : 2}"/>`);
          S.push(i === 4 ? `<text x="540" y="${y + 125}" text-anchor="middle" style="font-family:'IBM Plex Mono'" font-size="64" font-weight="700" fill="${C.gold}">222</text>`
            : `<path d="M410,${y + 150} H${560 + (i * 41) % 110} M410,${y + 172} H520" stroke="${C.dim}" stroke-width="3"/>`);
        }
        S.push(`</g></g>`);
        S.t(`tl.fromTo("#${feed}",{y:0},{y:-1520,duration:${(S.dur - 0.2).toFixed(2)},ease:"power1.in"},0.1);`);
      } },
      { id: "ask", lines: [10, 11], draw(S) {
        S.stars(50, 31, [60, 300, 1020, 520], 0);
        const f = figure(S, { cx: 540, cy: 830, scale: 0.85, t: 0, dur: 1.1, core: true });
        const tQ = S.w("question");
        S.bigText(770, 640, "?", { size: 260, t: tQ, dur: 0.8, c1: C.gold, c2: C.gold });
        const tR = S.w("reach"), r = rng(4);
        for (let i = 0; i < 6; i++) {
          const x = 120 + i * 168 + r() * 40, y = 330 + r() * 160;
          S.path(`M${x.toFixed(1)},${y.toFixed(1)} L540,${(830 - 120 * 0.85).toFixed(1)}`, { t: tR - 0.6 + i * 0.1, dur: 0.8, color: C.gold, w: 1.6, op: 0.75 });
        }
        S.t(`tl.to("#${f.body}, #${f.head}",{attr:{stroke:"${C.gold}"},duration:0.5},${tR});`);
      } },
      { id: "cta", lines: [12, 13, 14], draw(S) { ctaScene(S, { cta: S.line(14), lift: S.w("three") }); } },
    ],
  },

  // ------------------------------------------------------------ V3: your year has a message
  v3: {
    dir: "v3-year-message", music: MUSIC3, musicStart: 0,
    fix: {},
    sfx: [
      { file: "whoosh.mp3", vol: 0.3, at: (sc) => sc[5].start },
      { file: "whoosh.mp3", vol: 0.3, at: (sc) => sc[9].start },
      { file: "chime.mp3", vol: 0.45, at: (sc) => sc[9].start + 1.6 },
    ],
    scenes: [
      { id: "letter", lines: [0], draw(S) {
        headline(S, "YOUR YEAR HAS A MESSAGE", { t: 0.1, out: 3.2 });
        envelope(S, 0, 0.55);
      } },
      { id: "ring", lines: [1], draw(S) {
        const cx = 540, cy = 760, R = 260;
        S.path(`M${cx},${cy - R} a${R},${R} 0 1,1 -0.1,0`, { t: 0, dur: 0.8, w: 3 });
        S.dotted(`M${cx},${cy - R + 30} a${R - 30},${R - 30} 0 1,1 -0.1,0`, { t: 0.2, color: C.blue, gap: 10 });
        "JFMAMJJASOND".split("").forEach((m, i) => {
          const a = (i * 30 - 90) * Math.PI / 180;
          S.path(`M${(cx + Math.cos(a) * (R - 14)).toFixed(1)},${(cy + Math.sin(a) * (R - 14)).toFixed(1)} L${(cx + Math.cos(a) * (R + 14)).toFixed(1)},${(cy + Math.sin(a) * (R + 14)).toFixed(1)}`, { t: 0.1 + i * 0.03, dur: 0.2, w: 2 });
          S.text((cx + Math.cos(a) * (R + 50)).toFixed(1), (cy + Math.sin(a) * (R + 50) + 10).toFixed(1), m, { size: 30, color: i === 10 ? C.gold : C.dim, t: 0.2 + i * 0.03 });
        });
        const hand = S.uid("hand");
        S.push(`<g id="${hand}"><path d="M${cx},${cy} L${cx},${cy - R + 50}" stroke="${C.gold}" stroke-width="5" stroke-linecap="round"/><circle cx="${cx}" cy="${cy}" r="10" fill="${C.gold}"/></g>`);
        S.t(`tl.fromTo("#${hand}",{rotation:300,svgOrigin:"${cx} ${cy}"},{rotation:-30,duration:1.3,ease:"power2.inOut"},${S.w("back")});`);
      } },
      { id: "doors", lines: [2], draw(S) {
        S.path(`M240,1000 V520 H480 V1000`, { t: 0, dur: 0.6, w: 3 });
        S.path(`M600,1000 V520 H840 V1000`, { t: 0.1, dur: 0.6, w: 3 });
        S.path(`M120,1000 H960`, { t: 0, dur: 0.6, w: 2 });
        const tO = S.w("opened"), tC = S.w("closed");
        S.path(`M240,520 L370,575 V965 L240,1000`, { t: tO, dur: 0.6, color: C.blue, w: 3 });
        for (let i = 0; i < 5; i++) S.dotted(`M${300 + i * 34},560 L${380 + i * 26},1000`, { t: tO + 0.3, color: C.gold, gap: 9, op: 0.6 });
        const dg = S.uid("door"); S.push(`<g id="${dg}">`);
        S.path(`M612,532 H828 V1000 H612 Z`, { t: tC, dur: 0.25, color: C.coral, w: 3, ease: "power3.in" });
        S.path(`M800,770 a8,8 0 1,1 -0.1,0`, { t: tC + 0.2, dur: 0.2, color: C.coral, w: 2 });
        S.push(`</g>`);
        [[870, 600, 920, 570], [880, 760, 940, 760], [870, 920, 920, 950], [570, 600, 520, 570], [560, 920, 510, 950]].forEach(([a, b, c2, d]) => S.path(`M${a},${b} L${c2},${d}`, { t: tC + 0.25, dur: 0.15, color: C.coral, w: 3 }));
        S.t(`tl.fromTo("#${dg}",{x:0},{x:6,duration:0.05,repeat:5,yoyo:true,ease:"none"},${(tC + 0.25).toFixed(2)});`);
      } },
      { id: "why", lines: [3, 4], draw(S) {
        const hg = S.uid("hg"); S.push(`<g id="${hg}">`);
        S.path(`M400,480 H680 M400,1040 H680 M420,480 C420,640 530,700 530,760 C530,820 420,880 420,1040 M660,480 C660,640 550,700 550,760 C550,820 660,880 660,1040`, { t: 0, dur: 1, w: 3 });
        S.path(`M450,1030 Q540,930 630,1030`, { t: 0.6, dur: 0.6, color: C.gold, w: 3 });
        S.dotted(`M540,770 V1000`, { t: 0.7, color: C.gold, gap: 10 });
        S.path(`M470,560 Q540,600 610,560`, { t: 0.6, dur: 0.5, color: C.gold, w: 2 });
        S.push(`</g>`);
        const tW = S.line(4);
        S.t(`tl.to("#${hg}",{opacity:0,duration:0.3},${(tW - 0.2).toFixed(2)});`);
        S.bigText(540, 1000, "?", { size: 560, t: tW, dur: 1, c1: C.gold, c2: C.lilac });
      } },
      { id: "three", lines: [5], draw(S) { threeCards(S, 0.05); } },
      { id: "road", lines: [6], draw(S) {
        S.stars(30, 66, [60, 320, 1020, 540], 0);
        S.path(`M60,600 H1020`, { t: 0, dur: 0.6, w: 2 });
        S.path(`M60,600 L220,500 L330,560 L470,450 L600,580 L760,480 L1020,600`, { t: 0.1, dur: 1, color: C.lilac, w: 2 });
        S.path(`M140,1100 L520,606`, { t: 0.2, dur: 0.9, w: 3 }); S.path(`M940,1100 L560,606`, { t: 0.2, dur: 0.9, w: 3 });
        S.dotted(`M540,1100 L540,612`, { t: 0.5, color: C.gold, gap: 18, w: 5 });
        figure(S, { cx: 540, cy: 1000, scale: 0.24, t: 0.6, dur: 0.8 });
      } },
      { id: "tower", lines: [7], draw(S) {
        S.path(`M300,1020 H780`, { t: 0, dur: 0.5, w: 2 });
        S.path(`M440,1020 V720 M640,1020 V720 M440,720 H640`, { t: 0, dur: 0.7, w: 3 });
        S.path(`M520,1020 V940 Q540,915 560,940 V1020`, { t: 0.3, dur: 0.4, w: 2 });
        const top = S.uid("top"); S.push(`<g id="${top}">`);
        S.path(`M450,720 V520 H470 V490 H500 V520 H525 V490 H555 V520 H580 V490 H610 V520 H630 V720`, { t: 0.2, dur: 0.8, w: 3 });
        S.path(`M520,600 V560 Q540,540 560,560 V600 Z`, { t: 0.5, dur: 0.4, color: C.blue, w: 2 });
        S.push(`</g>`);
        const tA = S.w("apart"), tS = S.w("stand");
        S.path(`M560,490 L535,560 L575,620 L520,700 L560,760 L530,840`, { t: tA - 0.2, dur: 0.35, color: C.coral, w: 4, ease: "power3.in" });
        S.t(`tl.to("#${top}",{x:-60,y:70,rotation:-14,svgOrigin:"450 720",duration:0.6,ease:"power2.in"},${(tA + 0.1).toFixed(2)});`);
        S.path(`M760,1020 V560 M840,1020 V560 M740,560 H860 M740,540 H860`, { t: tS, dur: 0.8, color: C.gold, w: 4 });
      } },
      { id: "light", lines: [8], draw(S) {
        S.stars(50, 88, [60, 300, 1020, 860], 0);
        S.path(`M60,920 H1020`, { t: 0, dur: 0.6, w: 2 });
        const st = S.uid("star"); S.push(`<g id="${st}">`);
        S.path(`M540,560 L560,640 L640,660 L560,680 L540,760 L520,680 L440,660 L520,640 Z`, { t: 0.1, dur: 0.8, color: C.gold, w: 4 });
        S.path(`M540,600 L548,652 L600,660 L548,668 L540,720 L532,668 L480,660 L532,652 Z`, { t: 0.3, dur: 0.6, color: C.lilac, w: 2 });
        S.push(`</g>`);
        S.t(`tl.fromTo("#${st}",{y:300},{y:0,duration:2.2,ease:"power2.out"},0.1);`);
        const tL = S.w("light");
        for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; S.path(`M${(540 + Math.cos(a) * 130).toFixed(1)},${(660 + Math.sin(a) * 130).toFixed(1)} L${(540 + Math.cos(a) * 210).toFixed(1)},${(660 + Math.sin(a) * 210).toFixed(1)}`, { t: tL + i * 0.03, dur: 0.4, color: C.gold, w: 2, op: 0.8 }); }
      } },
      { id: "reveal", lines: [9, 10], draw(S) {
        envelope(S, 0, 0.7, S.w("message"));
        const tT = S.w("three");
        [[-150, -8], [0, 0], [150, 8]].forEach(([dx, rot], i) => {
          S.push(`<g transform="translate(${540 + dx},${700}) rotate(${rot})">`);
          const id = S.uid("rc"); S.push(`<g id="${id}">`);
          cardBack(S, 130, 210, { t: tT + i * 0.12, inner: C.lilac, gcol: C.gold });
          S.push(`</g></g>`);
          S.t(`tl.fromTo("#${id}",{y:120,opacity:0},{y:-150,opacity:1,duration:0.8,ease:"power3.out"},${(tT + i * 0.12).toFixed(2)});`);
        });
      } },
      { id: "cta", lines: [11], draw(S) { ctaScene(S, { cta: 0.3, lift: S.w("choose") }); } },
    ],
  },
};

// sealed envelope; opens (flap flips up) at tOpen
export function envelope(S, t, from = 0, tOpen) {
  const L = 230, R = 850, T = 560, B = 980, cx = 540;
  S.path(`M${L},${T} H${R} V${B} H${L} Z`, { t, dur: 1, from });
  S.path(`M${L},${B} L${cx},${T + 230} L${R},${B}`, { t: t + 0.1, dur: 0.9, color: C.blue, w: 2, from });
  const flap = S.uid("flap");
  S.push(`<path id="${flap}" d="M${L},${T} L${cx},${T + 250} L${R},${T}" fill="none" stroke="${C.ink}" stroke-width="3" stroke-linejoin="round" pathLength="1" stroke-dasharray="1 1"/>`);
  S.t(`tl.fromTo("#${flap}",{strokeDashoffset:${1 - from}},{strokeDashoffset:0,duration:0.9,ease:"power2.inOut"},${t + 0.1});`);
  const seal = S.uid("seal");
  S.push(`<g id="${seal}"><circle cx="${cx}" cy="${T + 250}" r="40" fill="${C.ground}" stroke="${C.gold}" stroke-width="3"/><path d="M${cx},${T + 222} L${cx + 8},${T + 242} L${cx + 28},${T + 250} L${cx + 8},${T + 258} L${cx},${T + 278} L${cx - 8},${T + 258} L${cx - 28},${T + 250} L${cx - 8},${T + 242} Z" fill="none" stroke="${C.gold}" stroke-width="2"/></g>`);
  S.fade(seal, t + (from > 0 ? 0 : 0.6), 0.3);
  if (tOpen != null) {
    S.t(`tl.to("#${seal}",{opacity:0,duration:0.25},${tOpen});`);
    S.t(`tl.to("#${flap}",{attr:{d:"M${L},${T} L${cx},${T - 230} L${R},${T}"},duration:0.6,ease:"power2.inOut"},${tOpen});`);
  }
}

// v14-v17: brighter, "clear" neon look — each video has its own luminous background (V.bg), rich detail,
// and calm sound (only real beats get SFX: whoosh on cuts, hits, bells, sting).
import { C, smooth, figure, portal, cardBack, headline, ctaScene } from "./lib.mjs";
import { seg7 } from "./videos.mjs";
import { hand, coin, eye, shield, waves, phone, starGlyph, crowd, scroll, parcel } from "./videos2.mjs";

const M = "C:/Users/Vinicius/Music/Songs Auraly UGC/";
const G = (s) => `<span class="gold">${s}</span>`;
const T = (x) => (+x).toFixed(2);
const label = (S, s, t, col = C.gold) => S.text(540, 430, s, { font: "Montserrat", weight: 800, size: 46, color: col, t, ls: 0.06 });
const circle = (cx, cy, r) => `M${cx},${cy - r} a${r},${r} 0 1,1 -0.1,0`;
// sun-burst of n rays between radii r1..r2
const rays = (S, cx, cy, r1, r2, n, t, col = C.gold, w = 3) => {
  let d = ""; for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2; d += `M${(cx + Math.cos(a) * r1).toFixed(1)},${(cy + Math.sin(a) * r1).toFixed(1)} L${(cx + Math.cos(a) * r2).toFixed(1)},${(cy + Math.sin(a) * r2).toFixed(1)} `; }
  return S.path(d, { t, dur: 0.6, color: col, w, noEcho: true });
};
const group = (S, inner) => { const id = S.uid("g"); S.push(`<g id="${id}">`); inner(); S.push(`</g>`); return id; };
const out = (S, id, t, o = {}) => S.t(`tl.to("#${id}",{opacity:0,${o.y != null ? `y:${o.y},` : ""}duration:0.3,ease:"power2.in"},${T(t)});`);
const strike = (S, x1, y1, x2, y2, t) => S.path(`M${x1},${y1} L${x2},${y2}`, { t, dur: 0.3, color: C.coral, w: 6, noEcho: true });
// figure with both arms raised (praise)
const praise = (S, cx, cy, k, t, col = C.ink, tArms = t + 0.6) => {
  const f = figure(S, { cx, cy, scale: k, t, dur: 1, color: col, core: true });
  const X = (v) => (cx + v * k).toFixed(1), Y = (v) => (cy + v * k).toFixed(1);
  S.path(`M${X(-70)},${Y(-180)} Q${X(-170)},${Y(-300)} ${X(-150)},${Y(-430)} M${X(70)},${Y(-180)} Q${X(170)},${Y(-300)} ${X(150)},${Y(-430)}`, { t: tArms, dur: 0.6, color: col, w: 3 });
  return f;
};
const padlock = (S, cx, cy, s, t, col = C.gold) => {
  S.path(`M${cx - s},${cy - s * 0.2} H${cx + s} V${cy + s * 1.1} H${cx - s} Z`, { t, dur: 0.6, color: col, w: 4 });
  S.path(circle(cx, cy + s * 0.35, s * 0.16), { t: t + 0.3, dur: 0.3, color: col, w: 3 });
  const sh = S.uid("shackle");
  S.push(`<g id="${sh}">`); S.path(`M${cx - s * 0.65},${cy - s * 0.2} V${cy - s * 0.7} A${s * 0.65},${s * 0.65} 0 0,1 ${cx + s * 0.65},${cy - s * 0.7} V${cy - s * 0.2}`, { t: t + 0.2, dur: 0.6, color: col, w: 4 }); S.push(`</g>`);
  return sh;
};
const plane = (S, cx, cy, s, t, col = C.blue) => S.path(`M${cx - s},${cy} L${cx + s},${cy - s * 0.7} L${cx + s * 0.3},${cy + s * 0.8} L${cx - s * 0.1},${cy + s * 0.15} Z M${cx - s * 0.1},${cy + s * 0.15} L${cx + s},${cy - s * 0.7}`, { t, dur: 0.6, color: col, w: 3 });
const heartPath = (cx, cy, s) => `M${cx},${cy + s * 0.9} C${cx - s * 1.4},${cy} ${cx - s * 0.9},${cy - s * 1.1} ${cx},${cy - s * 0.4} C${cx + s * 0.9},${cy - s * 1.1} ${cx + s * 1.4},${cy} ${cx},${cy + s * 0.9} Z`;

export const VIDEOS = {
  // ------------------------------------------------------------ V14: the future version of you
  v14: {
    dir: "v14-future-you", music: M + "Stargazing.mp3", musicStart: 0, trigger: "RECEIVED", fx: true, rich: true, calm: true,
    bg: "radial-gradient(ellipse 85% 55% at 50% 30%, #4A3470 0%, #2A1F48 45%, #150F26 100%)", glow: "rgba(244,184,96,0.35)",
    fix: { "received": "RECEIVED" },
    scenes: [
      { id: "win", lines: [0], draw(S) {
        headline(S, "YOU'RE ABOUT TO WIN BIG", { t: 0.1, out: S.line(0) + 3.6 });
        S.stars(50, 141, [60, 440, 1020, 1000], 0);
        figure(S, { cx: 540, cy: 1050, scale: 0.6, t: 0.3, dur: 1, core: true });
        const tB = S.w("big");
        starGlyph(S, 540, 560, 90, tB - 0.3);
        rays(S, 540, 560, 120, 200, 16, tB);
        S.sfx("hit", tB);
      } },
      { id: "now", lines: [1], draw(S) {
        const tS = S.w("someday."), tN = S.w("now.");
        const a = group(S, () => { S.text(540, 700, "SOMEDAY", { font: "Montserrat", weight: 800, size: 110, color: C.dim, t: tS - 0.1 }); strike(S, 260, 720, 820, 640, tS + 0.5); });
        out(S, a, tN - 0.25, { y: -30 });
        S.bigText(540, 860, "NOW", { size: 380, t: tN, dur: 0.9, c1: C.gold, c2: C.coral });
      } },
      { id: "blessings", lines: [2], draw(S) {
        label(S, "BLESSING AFTER BLESSING", 0.15);
        [270, 540, 810].forEach((x, i) => { const t = S.w("blessing", i); parcel(S, x, 760, t); S.sfx("bell" + (i + 1), t); });
        S.text(540, 1000, "YOU DESERVE IT", { font: "Montserrat", weight: 800, size: 52, color: C.gold, t: S.w("deserve") });
      } },
      { id: "doors", lines: [3], draw(S) {
        const tO = S.w("open");
        portal(S, { cx: 700, top: 470, bot: 1000, w: 360, t: 0.1, speed: 0.8 });
        const me = group(S, () => figure(S, { cx: 260, cy: 1050, scale: 0.5, t: 0.3, dur: 0.9, core: true }));
        S.t(`tl.fromTo("#${me}",{x:0},{x:210,duration:${T(S.dur - 0.6)},ease:"sine.inOut"},0.6);`);
        rays(S, 700, 720, 60, 140, 12, tO, C.gold, 2.5);
        S.text(260, 880, "KNOCK?", { size: 30, color: C.dim, t: S.w("knocking.") });
        S.sfx("hit", tO);
      } },
      { id: "future", lines: [4, 5], draw(S) {
        const tF = S.w("future");
        figure(S, { cx: 290, cy: 1050, scale: 0.5, t: 0.1, dur: 1, color: C.ink, core: true });
        S.text(290, 520, "YOU", { size: 34, color: C.ink, t: 0.4 });
        S.dotted(`M360,760 C470,640 610,640 720,760`, { t: tF, color: C.gold, gap: 14 });
        figure(S, { cx: 790, cy: 1050, scale: 0.56, t: tF + 0.2, dur: 1, color: C.gold, core: true });
        S.text(790, 500, "FUTURE YOU", { size: 34, color: C.gold, t: tF + 0.4 });
        const tD = S.w("dream");
        [[700, 400], [790, 370], [880, 400]].forEach(([x, y], i) => starGlyph(S, x, y, 22, tD + i * 0.12));
        S.sfx("bell2", tF + 0.2);
      } },
      { id: "faith", lines: [6, 7], draw(S) {
        eye(S, 540, 600, 230, 0.15, C.gold);
        S.text(540, 430, "LOOKING AT YOU", { size: 32, color: C.lilac, t: S.w("looking") });
        const tF = S.w("faith."), tB = S.w("believe");
        figure(S, { cx: 540, cy: 1060, scale: 0.36, t: 0.4, dur: 0.8, core: true });
        [70, 110, 150].forEach((r, i) => S.path(circle(540, 880, r), { t: tB + i * 0.2, dur: 0.6, color: C.gold, w: 2, op: 0.9 - i * 0.25, noEcho: true }));
        S.text(540, 1000, "A LITTLE MORE FAITH", { font: "Montserrat", weight: 800, size: 44, color: C.gold, t: tF });
      } },
      { id: "coming", lines: [8, 9], draw(S) {
        S.bigText(540, 720, "IT'S COMING", { size: 190, t: S.w("coming.") - 0.1, dur: 1.1, c1: C.gold, c2: C.lilac });
        const tB = S.w("bigger,"), tF = S.w("faster");
        [100, 170, 240].forEach((r, i) => S.path(circle(540, 900, r * 0.6), { t: tB + i * 0.12, dur: 0.5, color: C.blue, w: 2, noEcho: true }));
        for (let i = 0; i < 6; i++) S.path(`M${120 + i * 30},${960 + i * 14} H${380 + i * 60}`, { t: tF + i * 0.05, dur: 0.25, color: C.gold, w: 3, noEcho: true });
        S.sfx("riser", tF + 1);
      } },
      { id: "destiny", lines: [10], draw(S) {
        const tL = S.w("luck,"), tD = S.w("destiny.");
        const a = group(S, () => { S.text(540, 640, "LUCK?", { font: "Montserrat", weight: 800, size: 120, color: C.dim, t: tL }); strike(S, 330, 660, 750, 580, tL + 0.6); });
        out(S, a, tD - 0.9, { y: -40 });
        const pts = [[220, 900], [360, 780], [470, 850], [600, 700], [720, 760], [860, 560]];
        pts.forEach(([x, y], i) => starGlyph(S, x, y, i === pts.length - 1 ? 40 : 14, tD - 0.8 + i * 0.12, i === pts.length - 1 ? C.gold : C.ink));
        S.dotted("M" + pts.map((p) => p.join(",")).join(" L"), { t: tD - 0.2, color: C.lilac, gap: 12 });
        S.text(540, 470, "DESTINY", { font: "Montserrat", weight: 800, size: 72, color: C.gold, t: tD });
        S.sfx("hit", tD);
      } },
      { id: "breathe", lines: [11, 12, 13], draw(S) {
        // the ring breathes with the voice: expands on the inhale, contracts on the exhale
        const tI = S.line(12), tE = S.line(13), ring = S.uid("breath"), cx = 540, cy = 720;
        S.push(`<g id="${ring}">`);
        S.path(circle(cx, cy, 200), { t: 0.1, dur: 1, color: C.blue, w: 4 });
        S.path(circle(cx, cy, 160), { t: 0.3, dur: 1, color: C.lilac, w: 2, op: 0.7, noEcho: true });
        S.push(`</g>`);
        S.t(`tl.fromTo("#${ring}",{scale:0.75,svgOrigin:"${cx} ${cy}"},{scale:1.2,duration:${T(tE - tI)},ease:"sine.inOut",immediateRender:false},${T(tI)});tl.to("#${ring}",{scale:0.75,svgOrigin:"${cx} ${cy}",duration:${T(S.dur - (tE - 0.05) - 0.2)},ease:"sine.inOut"},${T(tE)});`);
        const a = S.text(cx, cy + 16, "INHALE", { font: "Montserrat", weight: 800, size: 54, color: C.ink, t: tI });
        S.t(`tl.to("#${a}",{opacity:0,duration:0.2},${T(tE - 0.2)});`);
        S.text(cx, cy + 16, "EXHALE", { font: "Montserrat", weight: 800, size: 54, color: C.gold, t: tE });
        S.text(cx, 430, "BREATHE WITH ME", { size: 32, color: C.lilac, t: 0.2, ls: 0.25 });
      } },
      { id: "yours", lines: [14], draw(S) {
        const tY = S.w("yours.");
        figure(S, { cx: 540, cy: 1050, scale: 0.6, t: 0.1, dur: 1, core: true });
        starGlyph(S, 540, 560, 70, tY - 0.4);
        rays(S, 540, 560, 100, 170, 12, tY);
        S.text(540, 430, "IT'S ALREADY YOURS", { font: "Montserrat", weight: 800, size: 50, color: C.gold, t: tY });
        S.sfx("bell3", tY);
      } },
      { id: "cta", lines: [15, 16, 17, 18], draw(S) { ctaScene(S, { cta: 0.25, lift: S.line(18) + 1, big: `<span style="font-size:84px">COMMENT ${G("RECEIVED")}</span>`, sub: "A 3-card reading is in my Stories" }); } },
    ],
  },

  // ------------------------------------------------------------ V15: notice money everywhere
  v15: {
    dir: "v15-notice-money", music: M + "Grounded.mp3", musicStart: 0, trigger: "MONEY", fx: true, rich: true, calm: true,
    bg: "radial-gradient(ellipse 85% 55% at 50% 30%, #1F5A4C 0%, #123A34 45%, #0A1D1B 100%)", glow: "rgba(244,184,96,0.4)",
    fix: { "money,": "MONEY," },
    scenes: [
      { id: "question", lines: [0, 1, 2], draw(S) {
        headline(S, "MONEY OUT OF NOWHERE?", { t: 0.1, out: S.line(2) - 0.2 });
        const tM = S.w("millions,");
        [[260, 620, 40], [420, 520, 52], [640, 580, 46], [820, 680, 38], [360, 800, 44], [720, 860, 50]].forEach(([x, y, r], i) => coin(S, x, y, r, tM + i * 0.14));
        const tA = S.w("absolutely!");
        S.path(`M380,760 L500,880 L740,600`, { t: tA, dur: 0.5, color: C.gold, w: 14 });
        S.sfx("hit", tA);
      } },
      { id: "experiment", lines: [3, 4], draw(S) {
        label(S, "THE EXPERIMENT", 0.1);
        S.path(`M470,520 V640 L340,920 Q330,960 380,960 H700 Q750,960 740,920 L610,640 V520 Z M450,520 H630`, { t: 0.2, dur: 1, w: 3 });
        S.path(`M380,860 Q540,820 700,860`, { t: 0.7, dur: 0.6, color: C.gold, w: 3 });
        [[500, 800, 12], [570, 760, 9], [540, 700, 7]].forEach(([x, y, r], i) => { const b = S.uid("bub"); S.push(`<g id="${b}">`); S.path(circle(x, y, r), { t: 0.9 + i * 0.15, dur: 0.3, color: C.gold, w: 2, noEcho: true }); S.push(`</g>`); S.t(`tl.to("#${b}",{y:-220,opacity:0,duration:2.2,ease:"sine.in"},${T(1.2 + i * 0.3)});`); });
        S.text(540, 1020, "SAY IT ALL DAY", { size: 32, color: C.lilac, t: S.w("today:") });
      } },
      { id: "phrase", lines: [5], draw(S) {
        scroll(S, 540, 730, 0.1, { w: 640, h: 460, color: C.ink });
        ["MONEY COMES TO ME", "FREELY & ABUNDANTLY", "I NOTICE IT", "EVERYWHERE"].forEach((s, i) => S.text(540, 600 + i * 70, s, { font: "Montserrat", weight: 800, size: 40, color: i > 1 ? C.gold : C.ink, t: S.w(["comes", "freely", "notice", "everywhere."][i]) - 0.1 }));
      } },
      { id: "key", lines: [6], draw(S) {
        const tK = S.w("key");
        S.path(`${circle(330, 720, 80)} M410,720 H800 M720,720 V790 M770,720 V770`, { t: tK, dur: 1, color: C.gold, w: 5 });
        S.text(540, 470, "THE KEY", { font: "Montserrat", weight: 800, size: 54, color: C.gold, t: tK });
        S.text(540, 950, "I NOTICE IT EVERYWHERE", { font: "Montserrat", weight: 800, size: 44, color: C.ink, t: S.w("notice") });
        S.path(`M260,975 H820`, { t: S.w("everywhere.") , dur: 0.5, color: C.gold, w: 4, noEcho: true });
        S.sfx("bell2", tK);
      } },
      { id: "brain", lines: [7, 8], draw(S) {
        const tA = S.w("amount."), tB = S.w("brain");
        const a = group(S, () => { S.text(540, 700, "$ 1,000,000?", { font: "Montserrat", weight: 800, size: 96, color: C.dim, t: S.w("specific") }); strike(S, 220, 720, 860, 640, tA); });
        out(S, a, tB - 0.3, { y: -30 });
        S.path(smooth([[540, 520], [640, 500], [740, 560], [790, 660], [760, 780], [660, 860], [540, 840], [420, 860], [320, 780], [290, 660], [340, 560], [440, 500]]), { t: tB, dur: 1.2, w: 4, color: C.ink });
        S.path(`M540,520 V840 M440,600 Q500,640 460,700 M640,600 Q580,650 630,720 M380,720 Q440,740 420,800 M700,720 Q650,760 680,810`, { t: tB + 0.5, dur: 0.9, color: C.lilac, w: 2, noEcho: true });
        const tF = S.w("form.");
        [[400, 620], [680, 640], [480, 780], [620, 790], [540, 680]].forEach(([x, y], i) => { const d = S.uid("syn"); S.push(`<circle id="${d}" cx="${x}" cy="${y}" r="9" fill="${C.gold}" opacity="0"/>`); S.t(`tl.fromTo("#${d}",{opacity:0,scale:0,svgOrigin:"${x} ${y}"},{opacity:1,scale:1.6,duration:0.25,yoyo:true,repeat:3,immediateRender:false},${T(tF + i * 0.1)});`); });
        S.text(540, 1000, "TRAINING YOUR BRAIN", { size: 32, color: C.gold, t: tB + 0.3, ls: 0.2 });
      } },
      { id: "forms", lines: [9, 10], draw(S) {
        // six tiles, each drawn on the word that names it
        const cells = [[290, 600, "coin"], [540, 600, "refund,"], [790, 600, "client"], [290, 880, "bonus,"], [540, 880, "gift,"], [790, 880, "coffee."]];
        cells.forEach(([x, y, w]) => S.path(`M${x - 105},${y - 105} H${x + 105} V${y + 105} H${x - 105} Z`, { t: S.w(w) - 0.15, dur: 0.5, color: C.dim, w: 2, noEcho: true }));
        const t = (w) => S.w(w);
        coin(S, 290, 590, 50, t("coin"));
        S.path(`M490,540 H590 V650 L575,640 L560,650 L545,640 L530,650 L515,640 L500,650 L490,640 Z M510,575 H570 M510,605 H555`, { t: t("refund,"), dur: 0.6, color: C.ink, w: 3 });
        S.path(`M740,560 H840 V630 H790 L765,655 V630 H740 Z`, { t: t("client"), dur: 0.6, color: C.blue, w: 3 });
        S.text(290, 905, "+$", { font: "League Gothic", size: 110, color: C.gold, t: t("bonus,") });
        parcel(S, 540, 900, t("gift,"));
        S.path(`M745,840 H835 L825,940 H755 Z M835,860 Q875,870 835,905 M765,820 Q775,800 765,785 M795,820 Q805,800 795,785`, { t: t("coffee."), dur: 0.7, color: C.ink, w: 3 });
        const labels = ["COIN", "REFUND", "CLIENT", "BONUS", "GIFT", "COFFEE"];
        cells.forEach(([x, y, w], i) => S.text(x, y + 88, labels[i], { size: 22, color: C.dim, t: S.w(w) + 0.2 }));
      } },
      { id: "flow", lines: [11, 12], draw(S) {
        figure(S, { cx: 760, cy: 1050, scale: 0.55, t: 0.1, dur: 1, core: true });
        const river = `M80,520 C300,520 360,700 560,720 S700,800 700,820`;
        S.dotted(river, { t: 0.3, color: C.blue, gap: 12 });
        for (let i = 0; i < 5; i++) { const c = S.uid("fc"); S.push(`<g id="${c}">`); coin(S, 80, 520, 26, 0.5 + i * 0.2); S.push(`</g>`); S.t(`tl.to("#${c}",{x:${560 + i * 20},y:${200 + i * 10},opacity:0,duration:1.8,ease:"sine.in"},${T(0.8 + i * 0.45)});`); }
        const tR = S.w("attract");
        [140, 200].forEach((r, i) => S.path(circle(760, 760, r * 0.7), { t: tR + i * 0.15, dur: 0.5, color: C.gold, w: 2, noEcho: true }));
        S.text(540, 430, "WHAT YOU REINFORCE, YOU ATTRACT", { size: 30, color: C.gold, t: S.w("reinforce"), ls: 0.08 });
        S.sfx("bell3", tR);
      } },
      { id: "science", lines: [13], draw(S) {
        const tM = S.w("magic."), tN = S.w("neuroscience.");
        const a = group(S, () => { S.path(`M330,860 L620,570 M600,550 L650,600`, { t: tM - 0.2, dur: 0.5, color: C.lilac, w: 6 }); [[650, 520], [700, 590], [610, 470]].forEach(([x, y], i) => starGlyph(S, x, y, 16, tM + i * 0.08, C.lilac)); S.text(540, 470, "MAGIC?", { font: "Montserrat", weight: 800, size: 70, color: C.dim, t: tM }); strike(S, 380, 490, 700, 430, tM + 0.5); });
        out(S, a, tN - 0.3, { y: -30 });
        S.bigText(540, 760, "SCIENCE", { size: 230, t: tN, dur: 1, c1: C.blue, c2: C.gold });
        S.sfx("hit", tN);
      } },
      { id: "cta", lines: [14, 15, 16], draw(S) { ctaScene(S, { cta: 0.25, lift: S.line(16) + 1, big: `COMMENT ${G("MONEY")}`, sub: "A 3-card reading is in my Stories" }); } },
    ],
  },

  // ------------------------------------------------------------ V16: make a wish (countdown)
  v16: {
    dir: "v16-make-a-wish", music: M + "Snowfall.mp3", musicStart: 0, trigger: ["THANK", "YOU", "UNIVERSE"], fx: true, rich: true, calm: true,
    bg: "radial-gradient(ellipse 85% 55% at 50% 30%, #2C4482 0%, #1A2754 45%, #0C1130 100%)", glow: "rgba(121,182,232,0.45)",
    fix: { "thank": "THANK", "you,": "YOU,", "universe,": "UNIVERSE," },
    scenes: [
      { id: "wish", lines: [0, 1], draw(S) {
        headline(S, "MAKE A WISH", { t: 0.1, out: S.line(1) + 0.6 });
        S.stars(80, 161, [60, 420, 1020, 1000], 0);
        figure(S, { cx: 540, cy: 1050, scale: 0.55, t: 0.2, dur: 1, core: true });
        const st = S.uid("shoot"); S.push(`<g id="${st}">`); starGlyph(S, 200, 520, 26, 0.6); S.path(`M200,520 L60,460`, { t: 0.6, dur: 0.4, color: C.gold, w: 2, noEcho: true }); S.push(`</g>`);
        S.t(`tl.fromTo("#${st}",{x:0,y:0},{x:700,y:200,duration:1.6,ease:"power1.in"},0.7);`);
        S.text(540, 600, "READY?", { font: "Montserrat", weight: 800, size: 90, color: C.gold, t: S.w("ready?") });
      } },
      { id: "count", lines: [2, 3, 4, 5, 6], draw(S) {
        const cx = 540, cy = 720, ring = S.uid("ring");
        S.path(circle(cx, cy, 230), { t: 0, dur: 0.01, color: C.dim, w: 3, op: 0.4, noEcho: true });
        S.push(`<path id="${ring}" d="${circle(cx, cy, 230)}" fill="none" stroke="${C.gold}" stroke-width="8" stroke-linecap="round" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="0"/>`);
        [2, 3, 4, 5, 6].forEach((k, i) => {
          const t = S.line(k), nx = i < 4 ? S.line(k + 1) : S.dur;
          const g = S.uid("d"); S.push(`<g id="${g}">`); seg7(S, String(5 - i), cx - 70, cy - 120, 140, 240, t - 0.05, i === 4 ? C.gold : C.ink); S.push(`</g>`);
          if (i < 4) S.t(`tl.to("#${g}",{opacity:0,duration:0.12},${T(nx - 0.12)});`);
          S.t(`tl.to("#${ring}",{attr:{"stroke-dashoffset":${(i + 1) / 5}},duration:0.5,ease:"power2.out"},${T(t)});`);
          S.sfx(i === 4 ? "hit" : "bell1", t);
        });
        rays(S, cx, cy, 260, 360, 20, S.line(6) + 0.2);
      } },
      { id: "smile", lines: [7], draw(S) {
        S.path(`${circle(540, 640, 170)}`, { t: 0.1, dur: 0.8, color: C.gold, w: 4 });
        S.path(`M470,600 V620 M610,600 V620`, { t: 0.5, dur: 0.3, color: C.ink, w: 8, noEcho: true });
        S.path(`M450,690 Q540,770 630,690`, { t: S.w("smile,"), dur: 0.5, color: C.ink, w: 6 });
        S.text(540, 930, "THANK YOU, UNIVERSE", { font: "Montserrat", weight: 800, size: 52, color: C.gold, t: S.w("thank") });
        S.path(`M400,990 H680 Q700,990 700,1010 V1030 Q700,1050 680,1050 H400 Q380,1050 380,1030 V1010 Q380,990 400,990 Z`, { t: S.w("follow"), dur: 0.5, color: C.blue, w: 3 });
        S.text(540, 1032, "+ FOLLOW", { font: "Montserrat", weight: 800, size: 30, color: C.blue, t: S.w("follow") + 0.1 });
        S.sfx("bell2", S.w("thank"));
      } },
      { id: "share", lines: [8], draw(S) {
        figure(S, { cx: 540, cy: 1050, scale: 0.5, t: 0.1, dur: 0.9, core: true });
        const tT = S.w("three");
        [[230, 760], [540, 560], [850, 760]].forEach(([x, y], i) => {
          S.dotted(`M540,800 Q${(540 + x) / 2},${y - 120} ${x},${y + 40}`, { t: tT + i * 0.15, color: C.gold, gap: 12 });
          S.path(heartPath(x, y, 34), { t: tT + 0.3 + i * 0.15, dur: 0.5, color: C.coral, w: 3 });
          S.sfx("bell" + (i + 1), tT + 0.3 + i * 0.15);
        });
        S.text(540, 430, "SPREAD GOOD ENERGY", { size: 34, color: C.gold, t: S.w("spread"), ls: 0.15 });
      } },
      { id: "karma", lines: [9, 10], draw(S) {
        const cx = 540, cy = 730, R = 220, loop = S.uid("loop");
        S.push(`<g id="${loop}">`);
        S.path(`M${cx - R},${cy} A${R},${R} 0 0,1 ${cx + R},${cy} M${cx + R - 30},${cy - 40} L${cx + R},${cy} L${cx + R + 30},${cy - 40}`, { t: S.w("spread"), dur: 0.9, color: C.gold, w: 5 });
        S.path(`M${cx + R},${cy} A${R},${R} 0 0,1 ${cx - R},${cy} M${cx - R + 30},${cy + 40} L${cx - R},${cy} L${cx - R - 30},${cy + 40}`, { t: S.w("receive"), dur: 0.9, color: C.blue, w: 5 });
        S.push(`</g>`);
        S.t(`tl.fromTo("#${loop}",{rotation:0,svgOrigin:"${cx} ${cy}"},{rotation:360,duration:${T(S.dur)},ease:"none"},0);`);
        S.text(cx, cy - 20, "GIVE", { size: 34, color: C.gold, t: S.w("spread") + 0.3 });
        S.text(cx, cy + 50, "RECEIVE", { size: 34, color: C.blue, t: S.w("receive") + 0.3 });
        const tK = S.w("karma");
        S.text(540, 460, "KARMA IS REAL", { font: "Montserrat", weight: 800, size: 64, color: C.gold, t: tK });
        S.sfx("hit", tK);
      } },
      { id: "cta", lines: [11, 12], draw(S) { ctaScene(S, { cta: 0.25, lift: S.line(12) + 1, big: `<span style="font-size:62px;line-height:1.15">COMMENT<br>${G("THANK YOU, UNIVERSE")}</span>`, sub: "" }); } },
    ],
  },

  // ------------------------------------------------------------ V17: chosen in her place (seals + protection)
  v17: {
    dir: "v17-chosen-seals", music: M + "Last Hope.MP3", musicStart: 0, trigger: "222", fx: true, rich: true, calm: true,
    bg: "radial-gradient(ellipse 85% 55% at 50% 30%, #5A2E5E 0%, #34193D 45%, #170B1C 100%)", glow: "rgba(244,184,96,0.4)",
    fix: { "too": "222", "too,": "" }, // TTS says "two two two", transcribed as "too too,"
    scenes: [
      { id: "warn", lines: [0], draw(S) {
        headline(S, "DON'T IGNORE THIS", { t: 0.1, out: S.dur - 0.3 });
        S.path(`M540,500 L780,920 H300 Z`, { t: 0.2, dur: 0.9, color: C.coral, w: 6 });
        S.path(`M540,620 V790`, { t: 0.8, dur: 0.3, color: C.ink, w: 14, noEcho: true });
        S.path(circle(540, 850, 9), { t: 1.0, dur: 0.2, color: C.ink, w: 10, noEcho: true });
        S.sfx("hit", S.w("mistake"));
      } },
      { id: "woman", lines: [1, 2], draw(S) {
        const her = group(S, () => { figure(S, { cx: 300, cy: 1050, scale: 0.5, t: 0.1, dur: 0.9, color: C.lilac, w: 2.5 }); phone(S, 360, 800, 0.5, 120); });
        S.t(`tl.to("#${her}",{x:-420,duration:${T(S.dur - 0.5)},ease:"sine.in"},0.8);`);
        const tW = S.w("wave");
        const wv = group(S, () => waves(S, 620, tW - 0.3, 2));
        S.t(`tl.fromTo("#${wv}",{x:0},{x:240,duration:${T(S.dur - tW + 0.3)},ease:"none"},${T(tW - 0.3)});`);
        S.text(540, 470, "SHE SCROLLED PAST", { size: 32, color: C.lilac, t: S.w("scrolled"), ls: 0.15 });
        S.text(760, 560, "ABUNDANCE", { size: 30, color: C.gold, t: tW });
      } },
      { id: "praise", lines: [3, 4, 5], draw(S) {
        const tH = S.w("hands");
        praise(S, 540, 1050, 0.62, 0.1, C.ink, tH);
        rays(S, 540, 560, 120, 230, 18, S.w("thanks."));
        const tC = S.w("chosen");
        S.path(`M380,380 L300,1060 M700,380 L780,1060`, { t: tC, dur: 0.6, color: C.gold, w: 2, op: 0.6, noEcho: true });
        S.text(540, 430, "CHOSEN", { font: "Montserrat", weight: 800, size: 70, color: C.gold, t: tC });
        S.sfx("bell3", tC);
      } },
      { id: "fist", lines: [6], draw(S) {
        const tC = S.w("close");
        const h = group(S, () => hand(S, 540, 820, { scale: 1.1, t: 0.1 }));
        S.t(`tl.to("#${h}",{scaleY:0.45,svgOrigin:"540 1000",duration:0.4,ease:"power2.in"},${T(tC + 0.2)});`);
        S.text(540, 470, "CLOSE YOUR RIGHT HAND", { size: 34, color: C.gold, t: tC, ls: 0.12 });
        S.sfx("hit", tC + 0.5);
      } },
      { id: "month", lines: [7, 8], draw(S) {
        const tB = S.w("biggest");
        S.path(`M300,480 H780 V820 H300 Z M300,560 H780 M380,450 V510 M700,450 V510`, { t: tB - 0.2, dur: 0.9, color: C.ink, w: 3 });
        for (let r = 0; r < 4; r++) for (let c = 0; c < 7; c++) { const d = S.uid("day"); S.push(`<circle id="${d}" cx="${340 + c * 67}" cy="${600 + r * 55}" r="7" fill="${r * 7 + c > 20 ? C.gold : C.dim}"/>`); S.fade(d, tB + (r * 7 + c) * 0.02, 0.2); }
        const tW = S.w("wave");
        waves(S, 900, tW, 2);
        S.text(540, 430, "THE BIGGEST MONTH", { font: "Montserrat", weight: 800, size: 46, color: C.gold, t: S.w("month") });
        S.sfx("riser", tW + 1.2);
      } },
      { id: "chains", lines: [9], draw(S) {
        figure(S, { cx: 540, cy: 1050, scale: 0.6, t: 0.1, dur: 1, core: true });
        const tD = S.w("destroyed."), links = [];
        for (let i = 0; i < 7; i++) { const x = 250 + i * 97, y = 960 + (i % 2 ? 0 : 8); const l = S.uid("lnk"); links.push(l); S.push(`<g id="${l}">`); S.path(`M${x - 46},${y} a46,26 0 1,1 92,0 a46,26 0 1,1 -92,0`, { t: S.w("chains") + i * 0.08, dur: 0.4, color: C.dim, w: 5, noEcho: true }); S.push(`</g>`); }
        links.forEach((l, i) => S.t(`tl.to("#${l}",{x:${(i - 3) * 90},y:${-150 - (i % 3) * 80},rotation:${(i - 3) * 40},opacity:0,duration:0.7,ease:"power2.out"},${T(tD)});`));
        rays(S, 540, 900, 80, 200, 14, tD + 0.05);
        S.sfx("hit", tD);
      } },
      { id: "doors", lines: [10, 11], draw(S) {
        const tW = S.w("wealth");
        for (let i = 0; i < 5; i++) coin(S, 220 + i * 160, 560 - (i % 2) * 50, 34, tW + i * 0.12);
        const tU = S.w("unlocked.");
        const sh = padlock(S, 540, 840, 90, S.w("doors"));
        S.t(`tl.to("#${sh}",{y:-50,duration:0.35,ease:"back.out(2)"},${T(tU)});`);
        S.sfx("bell2", tU);
      } },
      { id: "scarcity", lines: [12], draw(S) {
        const cloud = group(S, () => S.path(smooth([[320, 640], [380, 560], [470, 540], [540, 480], [640, 500], [720, 560], [780, 640], [700, 700], [380, 700]]), { t: 0.1, dur: 1, color: C.dim, w: 4 }));
        figure(S, { cx: 540, cy: 1050, scale: 0.42, t: 0.3, dur: 0.9, core: true });
        const t5 = S.w("five");
        const tm = group(S, () => { seg7(S, "5", 400, 440, 60, 100, t5, C.gold); S.text(500, 540, ":", { font: "League Gothic", size: 90, color: C.gold, t: t5 }); seg7(S, "0", 530, 440, 60, 100, t5 + 0.1, C.gold); seg7(S, "0", 610, 440, 60, 100, t5 + 0.15, C.gold); });
        const tR = S.w("removed");
        S.t(`tl.to("#${cloud}",{opacity:0,scale:1.4,svgOrigin:"540 620",filter:"blur(10px)",duration:0.8},${T(tR)});`);
        rays(S, 540, 860, 60, 150, 12, tR + 0.3);
        S.sfx("hit", tR);
      } },
      { id: "send", lines: [13, 14], draw(S) {
        const tO = S.w("open");
        hand(S, 330, 860, { scale: 0.75, t: tO - 0.2 });
        phone(S, 720, 760, S.w("send") - 0.2, 420);
        const p = S.uid("pl"); S.push(`<g id="${p}">`); plane(S, 720, 760, 60, S.w("send") + 0.2); S.push(`</g>`);
        S.t(`tl.to("#${p}",{x:220,y:-420,rotation:-20,opacity:0,duration:0.9,ease:"power2.in"},${T(S.w("yourself") + 0.3)});`);
        S.text(540, 440, "SEND IT TO YOURSELF", { size: 34, color: C.gold, t: S.w("send"), ls: 0.12 });
        S.sfx("whoosh", S.w("yourself") + 0.3);
      } },
      { id: "seals", lines: [15, 16, 17, 18], draw(S) {
        const xs = [260, 540, 820], cy = 700, ts = [S.w("first"), S.w("second"), S.w("everything.")];
        xs.forEach((x, i) => S.path(circle(x, cy, 110), { t: 0.1 + i * 0.1, dur: 0.6, color: C.dim, w: 2, noEcho: true }));
        S.path(`M225,640 H295 V770 L260,740 L225,770 Z`, { t: S.line(15), dur: 0.6, color: C.gold, w: 4 });
        S.path(`${circle(525, 660, 26)} M475,760 Q525,690 575,760 M600,680 V740 M570,710 H630`, { t: S.line(16), dur: 0.7, color: C.gold, w: 4 });
        S.text(820, 735, "222", { font: "League Gothic", size: 110, color: C.gold, t: S.w("comment") + 0.3 });
        ts.forEach((t, i) => { S.path(circle(xs[i], cy, 110), { t, dur: 0.5, color: C.gold, w: 5 }); S.text(xs[i], cy + 160, ["SEAL 1", "SEAL 2", "SEAL 3"][i], { size: 30, color: C.gold, t }); S.sfx("bell" + (i + 1), t); });
        const tL = S.w("locked");
        const sh = padlock(S, 540, 960, 50, tL - 0.6);
        S.t(`tl.fromTo("#${sh}",{y:-30},{y:0,duration:0.3,ease:"power2.in",immediateRender:false},${T(tL)});`);
        S.sfx("hit", tL);
      } },
      { id: "protect", lines: [19, 20], draw(S) {
        const tS = S.w("sensitive,");
        const orb = S.uid("orb"); S.push(`<circle id="${orb}" cx="540" cy="730" r="70" fill="${C.gold}" opacity="0.85"/>`); S.fade(orb, 0.2, 0.5, 0.85);
        S.t(`tl.to("#${orb}",{attr:{r:82},duration:0.8,yoyo:true,repeat:${Math.ceil(S.dur / 1.6)},ease:"sine.inOut"},0.7);`);
        shield(S, 540, 720, 230, tS);
        const tB = S.w("break");
        [[140, 480], [940, 520], [160, 1000], [930, 980]].forEach(([x, y], i) => { const z = S.uid("zz"); S.push(`<g id="${z}">`); S.path(`M${x},${y} l${x < 540 ? 60 : -60},30 l${x < 540 ? -20 : 20},30 l${x < 540 ? 70 : -70},30`, { t: S.w("negative") + i * 0.1, dur: 0.3, color: C.coral, w: 4, noEcho: true }); S.push(`</g>`); S.t(`tl.to("#${z}",{x:${x < 540 ? 120 : -120},duration:0.4,ease:"power2.in"},${T(tB - 0.2)});tl.to("#${z}",{x:${x < 540 ? -80 : 80},opacity:0,duration:0.5,ease:"power2.out"},${T(tB + 0.2)});`); });
        S.text(540, 430, "PROTECT IT", { font: "Montserrat", weight: 800, size: 56, color: C.gold, t: S.w("unprotected,") });
        S.sfx("hit", tB);
      } },
      { id: "cta", lines: [21, 22], draw(S) { ctaScene(S, { cta: 0.25, lift: S.line(22), big: `COMMENT ${G("222")}`, sub: "The sign is in my latest Story" }); } },
    ],
  },
};

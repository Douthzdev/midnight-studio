// v12-v13: new copies with the fx layer on (camera moves, motes, flashes, auto sound effects from sfx/kit).
import { C, figure, portal, cardBack, cardFace, headline, ctaScene } from "./lib.mjs";
import { seg7, threeCards } from "./videos.mjs";
import { eye, moon, starGlyph } from "./videos2.mjs";

const M = "C:/Users/Vinicius/Music/Songs Auraly UGC/";
const G = (s) => `<span class="gold">${s}</span>`;
const label = (S, s, t) => S.text(540, 420, s, { size: 34, color: C.gold, t, ls: 0.3 });
const colon = (S, x, y, t, col) => { const id = S.uid("col"); S.push(`<g id="${id}"><circle cx="${x}" cy="${y}" r="8" fill="${col}"/><circle cx="${x}" cy="${y + 60}" r="8" fill="${col}"/></g>`); S.fade(id, t, 0.2); return id; };
const bubble = (S, cx, cy, t, col = C.ink) => S.path(`M${cx - 150},${cy - 80} H${cx + 150} Q${cx + 190},${cy - 80} ${cx + 190},${cy - 40} V${cy + 30} Q${cx + 190},${cy + 70} ${cx + 150},${cy + 70} H${cx - 40} L${cx - 100},${cy + 130} L${cx - 90},${cy + 70} H${cx - 150} Q${cx - 190},${cy + 70} ${cx - 190},${cy + 30} V${cy - 40} Q${cx - 190},${cy - 80} ${cx - 150},${cy - 80} Z`, { t, dur: 0.7, color: col, w: 3 });

export const VIDEOS = {
  // ------------------------------------------------------------ V12: three signs before a big change
  v12: {
    dir: "v12-three-signs", music: M + "Jacob and the Stone.mp3", musicStart: 0, trigger: "SIGN", fx: true,
    fix: { "111": "11:11.", "22.": "2:22.", "sign#4": "SIGN" },
    scenes: [
      { id: "door", lines: [0], draw(S) {
        headline(S, "3 SIGNS BEFORE A BIG CHANGE", { t: 0.1, out: 4.3 });
        S.stars(50, 21, [60, 420, 1020, 1000], 0);
        portal(S, { cx: 540, top: 470, bot: 960, w: 420, t: 0.2, speed: 0.8 });
        figure(S, { cx: 540, cy: 1040, scale: 0.42, t: 0.9, dur: 1, core: true });
        const tT = S.w("three");
        [380, 540, 700].forEach((x, i) => starGlyph(S, x, 560, 34, tT + i * 0.2));
      } },
      { id: "numbers", lines: [1, 2, 3], draw(S) {
        label(S, "SIGN 01 · NUMBERS", 0.1);
        const cx = 540, cy = 720, R = 200, clock = S.uid("clk");
        S.push(`<g id="${clock}">`);
        S.path(`M${cx},${cy - R} a${R},${R} 0 1,1 -0.1,0`, { t: 0.1, dur: 0.8, w: 3 });
        S.dotted(`M${cx},${cy - R + 26} a${R - 26},${R - 26} 0 1,1 -0.1,0`, { t: 0.3, color: C.blue, gap: 10 });
        const hand = S.uid("hand");
        S.push(`<g id="${hand}"><path d="M${cx},${cy} L${cx},${cy - R + 40}" stroke="${C.gold}" stroke-width="5" stroke-linecap="round"/><circle cx="${cx}" cy="${cy}" r="10" fill="${C.gold}"/></g>`);
        S.push(`</g>`);
        S.t(`tl.fromTo("#${hand}",{rotation:0,svgOrigin:"${cx} ${cy}"},{rotation:1080,duration:3,ease:"power1.inOut"},${S.w("hours")});`);
        const t1 = S.line(3);
        S.t(`tl.to("#${clock}",{opacity:0,scale:0.8,svgOrigin:"${cx} ${cy}",duration:0.3},${(t1 - 0.3).toFixed(2)});`);
        const a = S.uid("n1"); S.push(`<g id="${a}">`);
        seg7(S, "1", 230, 620, 100, 170, t1, C.gold); seg7(S, "1", 360, 620, 100, 170, t1 + 0.05, C.gold);
        colon(S, 540, 675, t1 + 0.1, C.gold);
        seg7(S, "1", 620, 620, 100, 170, t1 + 0.15, C.gold); seg7(S, "1", 750, 620, 100, 170, t1 + 0.2, C.gold);
        S.push(`</g>`);
        S.sfx("hit", t1);
        const t2 = S.w("22.");
        S.t(`tl.to("#${a}",{opacity:0,duration:0.2},${(t2 - 0.2).toFixed(2)});`);
        seg7(S, "2", 300, 620, 100, 170, t2, C.lilac); colon(S, 470, 675, t2 + 0.05, C.lilac);
        seg7(S, "2", 540, 620, 100, 170, t2 + 0.1, C.lilac); seg7(S, "2", 680, 620, 100, 170, t2 + 0.15, C.lilac);
        S.sfx("hit", t2);
      } },
      { id: "people", lines: [4, 5], draw(S) {
        label(S, "SIGN 02 · PEOPLE", 0.1);
        const me = figure(S, { cx: 380, cy: 1040, scale: 0.62, t: 0.1, dur: 1, core: true });
        const tP = S.w("past");
        figure(S, { cx: 760, cy: 1000, scale: 0.48, t: tP, dur: 1, color: C.lilac, w: 2 });
        S.dotted(`M450,620 Q600,480 740,640`, { t: tP + 0.6, color: C.gold, gap: 12 });
        const tM = S.w("mind");
        [[440, 560, 9], [470, 520, 14], [520, 470, 20]].forEach(([x, y, r], i) => S.path(`M${x},${y - r} a${r},${r} 0 1,1 -0.1,0`, { t: tM - 0.4 + i * 0.12, dur: 0.3, w: 2, color: C.gold }));
        S.t(`tl.to("#${me.head}",{attr:{stroke:"${C.gold}"},duration:0.4},${tM.toFixed(2)});`);
      } },
      { id: "fit", lines: [6, 7], draw(S) {
        label(S, "SIGN 03 · THE HARDEST", 0.1);
        // a round opening in your life, and a square piece that no longer goes in
        S.path(`M260,520 H820 V980 H260 Z`, { t: 0.15, dur: 0.9, w: 3 });
        S.path(`M640,750 m-110,0 a110,110 0 1,1 220,0 a110,110 0 1,1 -220,0`, { t: 0.4, dur: 0.8, color: C.blue, w: 4 });
        const sq = S.uid("sq"); S.push(`<g id="${sq}">`);
        S.path(`M310,670 H470 V830 H310 Z`, { t: S.w("things"), dur: 0.6, color: C.gold, w: 4 });
        S.push(`</g>`);
        const tS = S.w("stop");
        S.t(`tl.to("#${sq}",{x:150,duration:0.35,ease:"power2.in"},${(tS - 0.35).toFixed(2)});`);
        S.t(`tl.to("#${sq}",{x:20,rotation:-8,svgOrigin:"390 750",duration:0.6,ease:"back.out(2)"},${tS.toFixed(2)});`);
        S.sfx("hit", tS);
        S.path(`M590,700 L690,800 M690,700 L590,800`, { t: S.w("fitting.") , dur: 0.3, color: C.coral, w: 5 });
      } },
      { id: "all", lines: [8], draw(S) {
        const tA = S.w("three");
        ["01", "02", "03"].forEach((n, i) => {
          const x = 300 + i * 240;
          starGlyph(S, x, 680, 80, 0.1 + i * 0.12, C.dim);
          const g = starGlyph(S, x, 680, 80, tA + i * 0.18, C.gold);
          S.text(x, 820, n, { size: 34, color: C.ink, t: 0.3 + i * 0.12 });
          S.sfx("bell" + (i + 1), tA + i * 0.18);
        });
        S.text(540, 470, "NOT A COINCIDENCE", { font: "Montserrat", weight: 800, size: 54, color: C.gold, t: S.w("coincidence.") });
      } },
      { id: "cta", lines: [9, 10], draw(S) { ctaScene(S, { cta: 0.25, lift: S.w("three"), big: `COMMENT ${G("SIGN")}`, sub: "Your 3 cards are in my Stories" }); } },
    ],
  },

  // ------------------------------------------------------------ V13: someone from your past
  v13: {
    dir: "v13-someone-past", music: M + "I Was Only Temporary.mp3", musicStart: 0, trigger: "READY", fx: true,
    fix: { "card": "cards", "ready,": "READY," },
    scenes: [
      { id: "thread", lines: [0], draw(S) {
        headline(S, "SOMEONE IS THINKING OF YOU", { t: 0.1, out: 3.1 });
        figure(S, { cx: 300, cy: 1040, scale: 0.55, t: 0.2, dur: 1, color: C.lilac, w: 2 });
        figure(S, { cx: 780, cy: 1040, scale: 0.55, t: 0.4, dur: 1, core: true });
        const d = `M330,640 C460,470 620,470 750,640`;
        S.dotted(d, { t: 0.9, color: C.gold, gap: 12 });
        const dot = S.uid("dot"); S.push(`<circle id="${dot}" cx="330" cy="640" r="9" fill="${C.gold}"/>`);
        S.fade(dot, 1.1, 0.2);
        S.t(`tl.to("#${dot}",{attr:{cx:540,cy:512},duration:0.8,ease:"sine.in"},1.2);tl.to("#${dot}",{attr:{cx:750,cy:640},duration:0.8,ease:"sine.out"},2.0);`);
        S.text(300, 500, "PAST", { size: 28, color: C.dim, t: S.w("past") });
        S.text(780, 500, "YOU", { size: 28, color: C.gold, t: S.w("you") });
      } },
      { id: "loop", lines: [1, 2], draw(S) {
        const cx = 540, cy = 730, R = 250, ring = S.uid("ring");
        S.push(`<g id="${ring}">`);
        S.path(`M${cx + R},${cy} A${R},${R} 0 1,1 ${cx + R * 0.7},${cy - R * 0.71}`, { t: 0.1, dur: 0.9, color: C.blue, w: 4 });
        S.path(`M${cx + R * 0.7 - 34},${cy - R * 0.71 - 10} L${cx + R * 0.7},${cy - R * 0.71} L${cx + R * 0.7 - 6},${cy - R * 0.71 + 36}`, { t: 0.8, dur: 0.3, color: C.blue, w: 4 });
        S.push(`</g>`);
        S.t(`tl.fromTo("#${ring}",{rotation:0,svgOrigin:"${cx} ${cy}"},{rotation:-720,duration:4,ease:"none"},${S.w("replaying")});`);
        // the shared moment inside the loop: two small figures facing each other
        figure(S, { cx: 470, cy: 860, scale: 0.34, t: S.w("moment"), dur: 0.7 });
        figure(S, { cx: 610, cy: 860, scale: 0.34, t: S.w("moment") + 0.15, dur: 0.7, color: C.lilac });
        S.text(540, 440, "OVER AND OVER", { size: 32, color: C.gold, t: S.w("over") });
      } },
      { id: "moments", lines: [3], draw(S) {
        const tC = S.w("conversation,"), tL = S.w("look,"), tN = S.w("never");
        const a = S.uid("a"); S.push(`<g id="${a}">`); bubble(S, 540, 700, tC); S.push(`</g>`);
        S.t(`tl.to("#${a}",{opacity:0,y:-30,duration:0.25},${(tL - 0.2).toFixed(2)});`);
        const b = S.uid("b"); S.push(`<g id="${b}">`); eye(S, 540, 720, 200, tL); S.push(`</g>`);
        S.t(`tl.to("#${b}",{opacity:0,y:-30,duration:0.25},${(tN - 0.45).toFixed(2)});`);
        bubble(S, 540, 700, tN - 0.3, C.lilac);
        [470, 540, 610].forEach((x, i) => { const d = S.uid("dt"); S.push(`<circle id="${d}" cx="${x}" cy="690" r="12" fill="${C.gold}"/>`); S.fade(d, tN + i * 0.15, 0.2); S.sfx("pop", tN + i * 0.15); });
        S.text(540, 470, "NEVER SAID", { size: 34, color: C.coral, t: S.w("said.") });
      } },
      { id: "tonight", lines: [4], draw(S) {
        S.stars(70, 44, [60, 400, 1020, 1040], 0);
        moon(S, 780, 520, 90, 0.1);
        const me = figure(S, { cx: 400, cy: 1040, scale: 0.6, t: 0.2, dur: 1 });
        const tS = S.w("stronger");
        [60, 110, 160].forEach((r, i) => S.path(`M${400 - r},${700 - r * 0.5} A${r},${r} 0 0,1 ${400 + r},${700 - r * 0.5}`, { t: tS + i * 0.15, dur: 0.5, color: C.gold, w: 3 }));
        S.t(`tl.to("#${me.body}, #${me.head}",{attr:{stroke:"${C.gold}"},duration:0.5},${tS.toFixed(2)});`);
        S.sfx("hit", tS);
      } },
      { id: "who", lines: [5, 6], draw(S) {
        const who = S.uid("who"); S.push(`<g id="${who}">`);
        figure(S, { cx: 540, cy: 1040, scale: 0.62, t: 0.1, dur: 1, color: C.dim, w: 2 });
        const q = S.bigText(540, 600, "?", { size: 300, t: S.w("who"), dur: 0.8 });
        S.push(`</g>`);
        const tC = S.w("card");
        S.t(`tl.to("#${who}",{opacity:0,scale:0.9,svgOrigin:"540 760",duration:0.3},${(tC - 0.25).toFixed(2)});`);
        const cards = threeCards(S, tC, { y: 760 });
        cards.ids.forEach((id, i) => S.t(`tl.to("#${id} path",{attr:{stroke:"${C.gold}"},duration:0.3},${(tC + 0.4 + i * 0.12).toFixed(2)});`));
      } },
      { id: "cta", lines: [7, 8], draw(S) { ctaScene(S, { cta: 0.25, lift: S.w("three"), big: `<span style="font-size:80px">COMMENT ${G("READY")}</span>`, sub: "Pick your 3 cards in my Stories" }); } },
    ],
  },
};

// v13r: same copy and voice as v13, with the richer look (double lines, detailed figures, tarot faces, nebula + ridges backdrop)
VIDEOS.v13r = {
  ...VIDEOS.v13, dir: "v13r-someone-past-rich", vo: "v13", rich: true,
  scenes: VIDEOS.v13.scenes.map((sc) => sc.id !== "who" ? sc : { id: "who", lines: [5, 6], draw(S) {
    const who = S.uid("who"); S.push(`<g id="${who}">`);
    figure(S, { cx: 540, cy: 1040, scale: 0.62, t: 0.1, dur: 1, color: C.dim, w: 2.5 });
    S.bigText(540, 600, "?", { size: 300, t: S.w("who"), dur: 0.8 });
    S.push(`</g>`);
    const tC = S.w("card");
    S.t(`tl.to("#${who}",{opacity:0,scale:0.9,svgOrigin:"540 760",duration:0.3},${(tC - 0.75).toFixed(2)});`);
    [[290, -10, "sun"], [540, 0, "star"], [790, 10, "moon"]].forEach(([x, rot, kind], i) => {
      const tf = tC + 0.15 + i * 0.15;
      S.push(`<g transform="translate(${x},760) rotate(${rot})">`);
      const b = S.uid("bk"); S.push(`<g id="${b}">`); cardBack(S, 200, 320, { t: tC - 0.6 + i * 0.1, inner: C.lilac }); S.push(`</g>`);
      const f = S.uid("fc"); S.push(`<g id="${f}" opacity="0">`); cardFace(S, kind, 200, 320, { t: tf + 0.12 }); S.push(`</g>`);
      S.push(`</g>`);
      S.t(`tl.to("#${b}",{scaleX:0,svgOrigin:"0 0",duration:0.14,ease:"power2.in"},${tf.toFixed(2)});`);
      S.t(`tl.fromTo("#${f}",{opacity:1,scaleX:0,svgOrigin:"0 0"},{scaleX:1,duration:0.18,ease:"power2.out",immediateRender:false},${(tf + 0.14).toFixed(2)});`);
      S.sfx("pop", tf);
    });
  } }),
};


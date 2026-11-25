// Line-art scene toolkit: emits static SVG markup + GSAP tween source for one scene.
export const C = {
  ink: "#F2EFE8", dim: "#8C8A86", blue: "#79B6E8", lilac: "#B79CF0",
  gold: "#F4B860", coral: "#EF7F6B", ground: "#0E0E10",
};

export function rng(seed) { // mulberry32, deterministic
  return () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

// Catmull-Rom through points -> smooth cubic path
export function smooth(pts, closed = true) {
  const p = closed ? [pts[pts.length - 1], ...pts, pts[0], pts[1]] : [pts[0], ...pts, pts[pts.length - 1]];
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 1; i < p.length - 2; i++) {
    const [p0, p1, p2, p3] = [p[i - 1], p[i], p[i + 1], p[i + 2]];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0]},${p2[1]}`;
  }
  return closed ? d + "Z" : d;
}
export const poly = (pts, closed = true) => "M" + pts.map((p) => p.join(",")).join(" L") + (closed ? "Z" : "");

export class Scene {
  constructor(id, dur, cue) { this.id = id; this.dur = dur; this.cue = cue; this.svg = []; this.html = []; this.tw = []; this.n = 0; this.defs = []; this.cues = []; this.fx = false; this.rich = false; }
  sfx(kind, t) { this.cues.push({ kind, t: +t }); } // sound cues, used only when the video has fx on
  uid(p = "e") { return `${this.id}-${p}${this.n++}`; }
  w(word, nth = 0) { return this.cue(word, nth); }
  push(s) { this.svg.push(s); }

  // stroke path drawn on at t
  path(d, o = {}) {
    const id = o.id || this.uid("p");
    const col = o.color || C.ink, sw = o.w ?? 3, t = o.t ?? 0, dd = o.dur ?? 0.8;
    const fill = o.fill || "none";
    // rich mode: an offset echo line in a second colour under every main stroke (hand-inked double line)
    const echo = this.rich && fill === "none" && sw >= 2.5 && !o.noEcho;
    if (echo) this.push(`<path id="${id}e" d="${d}" fill="none" stroke="${o.echo || (col === C.gold ? C.coral : col === C.ink ? C.lilac : C.blue)}" stroke-width="${(sw * 0.6).toFixed(1)}" stroke-linecap="round" stroke-linejoin="round" pathLength="1" stroke-dasharray="1 1" opacity="0.5" transform="translate(4,3)"/>`);
    const sel = echo ? `#${id}, #${id}e` : `#${id}`;
    this.push(`<path id="${id}" d="${d}" fill="${fill}" stroke="${col}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" pathLength="1" stroke-dasharray="1 1"${o.op != null ? ` opacity="${o.op}"` : ""}/>`);
    const from = 1 - (o.from ?? 0);
    if (fill !== "none") this.tw.push(`tl.fromTo("#${id}",{fillOpacity:0},{fillOpacity:1,duration:${dd},ease:"power1.in"},${t.toFixed(3)});`);
    if (t <= 0 && dd <= 0) this.tw.push(`tl.set("${sel}",{strokeDashoffset:0},0);`);
    else this.tw.push(`tl.fromTo("${sel}",{strokeDashoffset:${from}},{strokeDashoffset:0,duration:${dd},ease:"${o.ease || "power2.out"}"},${t.toFixed(3)});`);
    return id;
  }
  dotted(d, o = {}) { // stipple line, fades in
    const id = this.uid("s");
    this.push(`<path id="${id}" d="${d}" fill="none" stroke="${o.color || C.ink}" stroke-width="${o.w ?? 3}" stroke-linecap="round" stroke-dasharray="0.1 ${o.gap ?? 9}"/>`);
    this.fade(id, o.t ?? 0, o.dur ?? 0.5, o.op ?? 0.7);
    return id;
  }
  fade(id, t, dur = 0.4, to = 1) { this.tw.push(`tl.fromTo("#${id}",{opacity:0},{opacity:${to},duration:${dur},ease:"power2.out"},${t.toFixed(3)});`); }
  text(x, y, s, o = {}) {
    const id = o.id || this.uid("t");
    const font = o.font || "IBM Plex Mono", size = o.size ?? 28;
    const ls = o.ls ?? (font.includes("Mono") ? 0.12 : 0);
    this.push(`<text id="${id}" x="${x}" y="${y}" text-anchor="${o.anchor || "middle"}" style="font-family:'${font}'" font-size="${size}" font-weight="${o.weight ?? 500}" letter-spacing="${ls}em" fill="${o.color || C.ink}"${o.stroke ? ` stroke="${o.stroke}" stroke-width="${o.sw ?? 3}" fill-opacity="0"` : ""}>${s}</text>`);
    if (o.t != null) { this.fade(id, o.t, o.dur ?? 0.35, o.op ?? 1); this.sfx("tick", o.t); }
    return id;
  }
  // outlined numerals drawn on (double line like hand-inked neon)
  bigText(x, y, s, o = {}) {
    const size = o.size ?? 420, t = o.t ?? 0, dd = o.dur ?? 1.4, fam = o.font || "League Gothic";
    const ids = [];
    const mk = (dx, col, sw, op) => {
      const id = this.uid("b");
      this.push(`<text id="${id}" data-layout-allow-overlap x="${x + dx}" y="${y}" text-anchor="middle" style="font-family:'${fam}'" font-size="${size}" fill="none" stroke="${col}" stroke-width="${sw}" stroke-dasharray="2600 2600" opacity="${op}" stroke-linejoin="round">${s}</text>`);
      const from = 2600 * (1 - (o.from ?? 0));
      this.tw.push(`tl.fromTo("#${id}",{strokeDashoffset:${from}},{strokeDashoffset:0,duration:${dd},ease:"power2.inOut"},${t.toFixed(3)});`);
      ids.push(id);
    };
    this.sfx("hit", t);
    mk(-7, o.c1 || C.blue, 2.5, 0.75); mk(7, o.c2 || C.lilac, 2.5, 0.75); mk(0, C.ink, 3.2, 1);
    return ids;
  }
  g(inner, o = {}) { // group with optional transform attr; returns id
    const id = o.id || this.uid("g");
    this.push(`<g id="${id}"${o.tr ? ` transform="${o.tr}"` : ""}${o.op != null ? ` opacity="${o.op}"` : ""}>`);
    inner(); this.push(`</g>`); return id;
  }
  t(src) { this.tw.push(src); }

  stars(n, seed, box = [60, 300, 1020, 1100], t = 0) {
    const r = rng(seed); const id = this.uid("stars"); const parts = [];
    for (let i = 0; i < n; i++) {
      const x = box[0] + r() * (box[2] - box[0]), y = box[1] + r() * (box[3] - box[1]), s = 2 + r() * 5;
      parts.push(r() < 0.25 ? `<path d="M${x - s},${y}H${x + s}M${x},${y - s}V${y + s}" stroke="${C.ink}" stroke-width="1.6" opacity="${(0.4 + r() * 0.6).toFixed(2)}"/>`
        : `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(1 + r() * 1.6).toFixed(1)}" fill="${C.ink}" opacity="${(0.25 + r() * 0.6).toFixed(2)}"/>`);
    }
    this.push(`<g id="${id}">${parts.join("")}</g>`); this.fade(id, t, 0.8); return id;
  }
}

// ---------- reusable drawings ----------
export function portal(S, o = {}) {
  const cx = o.cx ?? 540, top = o.top ?? 380, bot = o.bot ?? 1000, w = o.w ?? 560, t = o.t ?? 0, sp = o.speed ?? 1;
  const L = cx - w / 2, R = cx + w / 2, pw = 78;
  const lint = S.path(`M${L - 40},${top} H${R + 40} V${top + 44} H${L - 40} Z`, { t, dur: 0.7 * sp });
  S.path(`M${L - 26},${top + 44} V${top + 62} H${R + 26} V${top + 44}`, { t: t + 0.2 * sp, dur: 0.6 * sp, w: 2 });
  const pl = S.path(`M${L},${top + 62} H${L + pw} V${bot} H${L} Z`, { t: t + 0.3 * sp, dur: 0.8 * sp });
  const pr = S.path(`M${R - pw},${top + 62} H${R} V${bot} H${R - pw} Z`, { t: t + 0.3 * sp, dur: 0.8 * sp });
  S.path(`M${L + 22},${top + 80} V${bot - 14}`, { t: t + 0.6 * sp, dur: 0.7 * sp, color: C.blue, w: 4 });
  S.path(`M${R - 22},${top + 80} V${bot - 14}`, { t: t + 0.6 * sp, dur: 0.7 * sp, color: C.lilac, w: 4 });
  S.dotted(`M${L + 48},${top + 80} V${bot - 10}`, { t: t + 0.8 * sp, gap: 10 });
  S.dotted(`M${R - 48},${top + 80} V${bot - 10}`, { t: t + 0.8 * sp, gap: 10 });
  S.path(`M${L - 70},${bot} H${R + 70}`, { t: t + 0.4 * sp, dur: 0.7 * sp, w: 2 });
  // stair of light under the portal
  for (let i = 0; i < 6; i++) {
    const hw = 90 + i * 14, y = bot + 14 + i * 14;
    S.path(`M${cx - hw},${y} H${cx + hw}`, { t: t + 0.7 * sp + i * 0.06, dur: 0.4, color: C.blue, w: 3, op: 0.9 - i * 0.1 });
  }
  let plaque = null;
  if (o.plaque) {
    S.path(`M${cx - 44},${top + 4} H${cx + 44} L${cx + 34},${top + 52} H${cx - 34} Z`, { t: t + 0.5 * sp, dur: 0.5, w: 2.5 });
    plaque = S.text(cx, top + 40, o.plaque, { font: "League Gothic", size: 40, t: t + 0.8 * sp, ls: 0.04 });
  }
  return { lint, pl, pr, plaque, inner: [L + pw, R - pw, top + 62, bot] };
}

const FIG = [[16, -222], [60, -205], [92, -182], [104, -120], [108, -40], [104, 30], [96, 62], [84, 58], [82, 10], [80, -60], [66, -140],
  [60, -80], [54, -10], [62, 40], [58, 120], [50, 190], [42, 280], [52, 300], [14, 302], [14, 280], [16, 190], [12, 100], [0, 70]];
export function figure(S, o = {}) {
  const cx = o.cx ?? 540, k = o.scale ?? 1, t = o.t ?? 0, cy = Math.min(o.cy ?? 700, 1060 - 302 * k); // feet stay above the caption band
  const right = FIG.map(([x, y]) => [cx + x * k, cy + y * k]);
  const left = FIG.slice(0, -1).reverse().map(([x, y]) => [cx - x * k, cy + y * k]);
  const body = S.path(smooth([...right, ...left]), { t, dur: o.dur ?? 1.4, color: o.color || C.ink, w: o.w ?? 3, id: o.id });
  const head = S.path(`M${cx},${cy - 298 * k} a${36 * k},${36 * k} 0 1,1 0,${72 * k} a${36 * k},${36 * k} 0 1,1 0,${-72 * k}`, { t, dur: (o.dur ?? 1.4) * 0.6, color: o.color || C.ink, w: o.w ?? 3 });
  let core = null;
  if (S.rich && k >= 0.3) { // hair, collar, folds, belt and hatched shading on the right side
    const X = (v) => (cx + v * k).toFixed(1), Y = (v) => (cy + v * k).toFixed(1), c2 = o.color || C.ink, t2 = t + (o.dur ?? 1.4) * 0.5, sub = { color: c2, w: 1.6, noEcho: true, dur: 0.6 };
    S.path(`M${X(-38)},${Y(-252)} Q${X(-50)},${Y(-312)} ${X(0)},${Y(-310)} Q${X(52)},${Y(-310)} ${X(40)},${Y(-250)} M${X(-30)},${Y(-296)} Q${X(0)},${Y(-282)} ${X(30)},${Y(-300)}`, { ...sub, t: t2, w: 2 });
    S.path(`M${X(-40)},${Y(-212)} L${X(0)},${Y(-170)} L${X(40)},${Y(-212)}`, { ...sub, t: t2 + 0.1 });
    S.path(`M${X(-34)},${Y(-160)} Q${X(-22)},${Y(-60)} ${X(-30)},${Y(40)} M${X(28)},${Y(-150)} Q${X(36)},${Y(-70)} ${X(24)},${Y(30)} M${X(-60)},${Y(-30)} Q${X(0)},${Y(-18)} ${X(60)},${Y(-30)}`, { ...sub, t: t2 + 0.2, op: 0.7 });
    S.path(`M${X(-28)},${Y(70)} Q${X(-34)},${Y(180)} ${X(-28)},${Y(290)} M${X(26)},${Y(70)} Q${X(32)},${Y(180)} ${X(26)},${Y(290)}`, { ...sub, t: t2 + 0.3, op: 0.5 });
    let h = ""; for (let i = 0; i < 9; i++) h += `M${X(52)},${Y(-176 + i * 24)} l${(22 * k).toFixed(1)},${(-14 * k).toFixed(1)} `;
    S.path(h, { color: C.dim, w: 1.4, noEcho: true, t: t2 + 0.3, dur: 0.8, op: 0.6 });
  }
  if (o.core) { core = S.uid("core"); S.push(`<circle id="${core}" cx="${cx}" cy="${cy - 120 * k}" r="${6 * k}" fill="${C.gold}"/>`); S.fade(core, t + 0.9, 0.4); }
  return { body, head, core };
}

export function rock(S, cx, cy, r, seed, o = {}) {
  const R = rng(seed), pts = [];
  for (let i = 0; i < 7; i++) { const a = (i / 7) * Math.PI * 2 + R() * 0.4, rr = r * (0.7 + R() * 0.45); pts.push([+(cx + Math.cos(a) * rr).toFixed(1), +(cy + Math.sin(a) * rr).toFixed(1)]); }
  const id = S.path(poly(pts), { t: o.t ?? 0, dur: 0.6, color: o.color || C.gold, w: 3 });
  S.path(`M${pts[0].join(",")} L${cx},${cy} L${pts[3].join(",")} M${cx},${cy} L${pts[5].join(",")}`, { t: (o.t ?? 0) + 0.3, dur: 0.5, color: o.color || C.gold, w: 1.5, op: 0.7 });
  return id;
}

// tarot card back, drawn around (0,0) inside a group the caller positions
export function cardBack(S, w, h, o = {}) {
  const t = o.t ?? 0, col = o.color || C.ink;
  const ids = [];
  ids.push(S.path(`M${-w / 2 + 14},${-h / 2} H${w / 2 - 14} Q${w / 2},${-h / 2} ${w / 2},${-h / 2 + 14} V${h / 2 - 14} Q${w / 2},${h / 2} ${w / 2 - 14},${h / 2} H${-w / 2 + 14} Q${-w / 2},${h / 2} ${-w / 2},${h / 2 - 14} V${-h / 2 + 14} Q${-w / 2},${-h / 2} ${-w / 2 + 14},${-h / 2} Z`, { t, dur: 0.7, color: col, w: 3, fill: C.ground }));
  ids.push(S.path(`M${-w / 2 + 14},${-h / 2 + 14} H${w / 2 - 14} V${h / 2 - 14} H${-w / 2 + 14} Z`, { t: t + 0.15, dur: 0.6, color: o.inner || C.lilac, w: 1.6, op: 0.8 }));
  if (o.glyph !== false) {
    const s = Math.min(w, h) * 0.22;
    ids.push(S.path(`M0,${-s} L${s * 0.28},${-s * 0.28} L${s},0 L${s * 0.28},${s * 0.28} L0,${s} L${-s * 0.28},${s * 0.28} L${-s},0 L${-s * 0.28},${-s * 0.28} Z`, { t: t + 0.35, dur: 0.6, color: o.gcol || C.blue, w: 2 }));
    ids.push(S.path(`M0,${-h / 2 + 30} V${-s - 14} M0,${s + 14} V${h / 2 - 30}`, { t: t + 0.4, dur: 0.5, color: col, w: 1.2, op: 0.6 }));
  }
  return ids;
}

// seven cards in an arc; returns group ids (index 0..6)
export function cardArc(S, o = {}) {
  const cx = 540, cy = o.cy ?? 1080, R = 620, t = o.t ?? 0, ids = [];
  for (let i = 0; i < 7; i++) {
    const a = (-30 + i * 10) * Math.PI / 180, x = cx + Math.sin(a) * R, y = cy - Math.cos(a) * R, rot = -30 + i * 10;
    S.push(`<g transform="translate(${x.toFixed(1)},${y.toFixed(1)}) rotate(${rot})">`);
    const gid = S.uid("card"); S.push(`<g id="${gid}">`);
    cardBack(S, 132, 214, { t: t + i * 0.08, inner: C.lilac, gcol: i % 2 ? C.blue : C.lilac });
    S.push(`</g></g>`); ids.push(gid);
  }
  return ids;
}

export function headline(S, txt, o = {}) {
  const id = S.uid("hl");
  S.html.push(`<div id="${id}" class="hl">${txt}</div>`);
  S.t(`tl.fromTo("#${id}",{opacity:0,y:-10},{opacity:1,y:0,duration:0.35,ease:"power3.out"},${o.t ?? 0.12});`);
  S.sfx("pop", o.t ?? 0.12);
  if (o.out) S.t(`tl.to("#${id}",{opacity:0,duration:0.3,ease:"power2.in"},${o.out});`);
  return id;
}

export function cta(S, t, big = 'COMMENT <span class="gold">222</span>', sub = "Get the link by message") {
  const a = S.uid("cta"), b = S.uid("ctasub");
  S.html.push(`<div id="${a}" class="cta">${big}</div><div id="${b}" class="ctasub">${sub}</div>`);
  S.t(`tl.fromTo("#${a}",{opacity:0,scale:0.94},{opacity:1,scale:1,duration:0.45,ease:"back.out(1.6)"},${t});`);
  S.t(`tl.fromTo("#${b}",{opacity:0,y:8},{opacity:1,y:0,duration:0.35,ease:"power2.out"},${t + 0.25});`);
  S.sfx("sting", t);
  if (S.fx) S.t(`tl.to("#${a}",{scale:1.04,duration:0.55,yoyo:true,repeat:7,ease:"sine.inOut"},${t + 1.2});`);
}

// standard ending: arc of 7 cards, 3 rise in gold, CTA text above
export function ctaScene(S, o = {}) {
  S.stars(40, 777, [60, 560, 1020, 1100], 0);
  const cards = cardArc(S, { t: 0.05, cy: 1290 });
  [1, 3, 5].forEach((k, j) => {
    const tt = (o.lift ?? 1.4) + j * 0.22;
    S.t(`tl.to("#${cards[k]}",{y:-70,duration:0.45,ease:"back.out(1.5)"},${tt.toFixed(2)});`);
    S.t(`tl.to("#${cards[k]} path",{attr:{stroke:"${C.gold}"},duration:0.3},${tt.toFixed(2)});`);
    S.sfx("bell" + (j + 1), tt);
  });
  cta(S, o.cta ?? 0.25, o.big, o.sub);
}

// tarot card face (THE SUN / THE STAR / THE MOON), drawn around (0,0) like cardBack
export function cardFace(S, kind, w, h, o = {}) {
  const t = o.t ?? 0, s = Math.min(w, h);
  cardBack(S, w, h, { t, glyph: false, inner: C.gold });
  const sub = { w: 2, noEcho: true };
  if (kind === "sun") {
    S.path(`M0,${-s * 0.42} a${s * 0.2},${s * 0.2} 0 1,1 -0.1,0`, { ...sub, t: t + 0.2, color: C.gold, w: 3 });
    let r = ""; for (let i = 0; i < 16; i++) { const a = i * Math.PI / 8, r1 = s * 0.27, r2 = s * (i % 2 ? 0.36 : 0.42); r += `M${(Math.cos(a) * r1).toFixed(1)},${(-s * 0.22 + Math.sin(a) * r1).toFixed(1)} L${(Math.cos(a) * r2).toFixed(1)},${(-s * 0.22 + Math.sin(a) * r2).toFixed(1)} `; }
    S.path(r, { ...sub, t: t + 0.35, color: C.gold, dur: 0.6 });
    S.path(`M${-w * 0.36},${h * 0.18} H${w * 0.36} M${-w * 0.3},${h * 0.26} H${w * 0.3}`, { ...sub, t: t + 0.5, color: C.lilac });
  } else if (kind === "star") {
    const P = (cx, cy, r) => `M${cx},${cy - r} L${cx + r * 0.25},${cy - r * 0.25} L${cx + r},${cy} L${cx + r * 0.25},${cy + r * 0.25} L${cx},${cy + r} L${cx - r * 0.25},${cy + r * 0.25} L${cx - r},${cy} L${cx - r * 0.25},${cy - r * 0.25} Z`;
    S.path(P(0, -h * 0.16, s * 0.24), { ...sub, t: t + 0.2, color: C.gold, w: 3 });
    S.path([[-0.28, -0.32], [0.3, -0.3], [-0.3, 0.02], [0.28, 0.0]].map(([x, y]) => P(x * w, y * h, s * 0.05)).join(" "), { ...sub, t: t + 0.4, color: C.ink, w: 1.5 });
    S.path(`M${-w * 0.36},${h * 0.16} q${w * 0.09},-12 ${w * 0.18},0 t${w * 0.18},0 t${w * 0.18},0 t${w * 0.18},0 M${-w * 0.36},${h * 0.24} q${w * 0.09},-12 ${w * 0.18},0 t${w * 0.18},0 t${w * 0.18},0 t${w * 0.18},0`, { ...sub, t: t + 0.5, color: C.blue });
  } else {
    S.path(`M${s * 0.06},${-h * 0.3} A${s * 0.2},${s * 0.2} 0 1,0 ${s * 0.06},${-h * 0.3 + s * 0.4} A${s * 0.16},${s * 0.16} 0 1,1 ${s * 0.06},${-h * 0.3}`, { ...sub, t: t + 0.2, color: C.gold, w: 3 });
    S.path(`M${-w * 0.36},${h * 0.22} V${h * 0.02} H${-w * 0.22} V${h * 0.22} M${w * 0.36},${h * 0.22} V${h * 0.02} H${w * 0.22} V${h * 0.22}`, { ...sub, t: t + 0.4, color: C.ink, w: 1.6 });
    S.path(`M0,${h * 0.06} Q${-w * 0.06},${h * 0.16} 0,${h * 0.3}`, { ...sub, t: t + 0.5, color: C.lilac, w: 1.6 });
  }
  S.text(0, h / 2 - 24, { sun: "THE SUN", star: "THE STAR", moon: "THE MOON" }[kind], { size: Math.round(s * 0.075), color: C.gold, t: t + 0.5, ls: 0.15 });
}

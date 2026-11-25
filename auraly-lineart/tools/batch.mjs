// Avatar batch editor: silence cut + punch-ins, dynamic glow captions (word-by-word, gold serif accents),
// viral glass pop-up cards and a few split screens — measured, not cluttered. One PLAN per script, reused by every avatar.
// usage: node tools/batch.mjs <video.mp4> <script: body|candle|money|selfie> <outName> [hook.mp4] [--render]
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const [RAW, SCRIPT, OUTNAME, HOOKARG] = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const RENDER = process.argv.includes("--render");
const STUDIO = "M:/Google/hyperframes/Midnight-Studio", WS = STUDIO + "/auraly-batch", SRC = WS + "/src";
const OUTDIR = "M:/Google/hyperframes/VIDEOS EDITADOS";
const MUS = "C:/Users/Vinicius/Music/Songs Auraly UGC/";
const SFX = STUDIO + "/auraly-lineart/sfx/";
const slug = path.basename(RAW, ".mp4").toLowerCase().replace(/ /g, "_");
const P = `${WS}/${slug}`;
if (!fs.existsSync(RAW)) throw new Error("video not found: " + RAW);
const env = { ...process.env, PATH: "M:/CLAUDE/tools/ffmpeg/bin;" + process.env.PATH };
for (const k of ["HYPERFRAMES_EXTRACT_CACHE_DIR", "TMPDIR", "TEMP", "TMP"]) env[k] = "M:/CLAUDE/tools/hf-frames";
const ff = (args) => { const r = spawnSync("ffmpeg", args, { encoding: "utf8", env }); return (r.stderr || "") + (r.stdout || ""); };
const ffp = (f) => +spawnSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f], { encoding: "utf8", env }).stdout.trim();
const T = (x) => (+x).toFixed(3);

// ---------- silence cut ----------
fs.mkdirSync(P + "/assets", { recursive: true }); fs.mkdirSync(P + "/compositions", { recursive: true });
// hard jump cuts from the sound itself (tools/vad.py): keeps speech + soft word tails + fricatives attached to speech,
// drops silence and breaths (quiet, bright, detached). Transcript timings are NOT used: they drift ~0.3 s and swallow pauses.
const VADWAV = `${SRC}/${slug}.wav`;
if (!fs.existsSync(VADWAV)) ff(["-hide_banner", "-y", "-i", RAW, "-ac", "1", "-ar", "16000", VADWAV]);
const vr = spawnSync("M:/CLAUDE/tools/kokoro-venv/Scripts/python.exe", ["-I", STUDIO + "/auraly-lineart/tools/vad.py", VADWAV, `${SRC}/t_${slug}/transcript.json`], { encoding: "utf8" });
if (vr.status !== 0) throw new Error("vad.py failed: " + vr.stderr);
const rawLen = ffp(RAW), keep = JSON.parse(vr.stdout).map(([a, b]) => [a, Math.min(b, rawLen)]).filter(([a, b]) => b - a > 0.04);
const offs = []; let acc = 0; for (const [a, b] of keep) { offs.push(acc); acc += b - a; }
const mapT = (t) => { for (let i = keep.length - 1; i >= 0; i--) if (t >= keep[i][0]) return offs[i] + Math.min(t, keep[i][1]) - keep[i][0]; return 0; };
const BODY = P + "/assets/body.mp4";
const fc = keep.map(([a, b], i) => `[0:v]trim=${a.toFixed(3)}:${b.toFixed(3)},setpts=PTS-STARTPTS[v${i}];[0:a]atrim=${a.toFixed(3)}:${b.toFixed(3)},asetpts=PTS-STARTPTS[a${i}];`).join("") + keep.map((_, i) => `[v${i}][a${i}]`).join("") + `concat=n=${keep.length}:v=1:a=1[v][a]`;
ff(["-hide_banner", "-y", "-i", RAW, "-filter_complex", fc, "-map", "[v]", "-map", "[a]", "-c:v", "h264_nvenc", "-preset", "p5", "-rc", "vbr", "-cq", "19", "-b:v", "0", "-c:a", "aac", "-b:a", "192k", BODY]);
const H = HOOKARG ? +ffp(HOOKARG).toFixed(3) : 0;
if (HOOKARG) fs.copyFileSync(HOOKARG, P + "/assets/hook.mp4");
const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
const words = JSON.parse(fs.readFileSync(`${SRC}/t_${slug}/transcript.json`)).map((w) => ({ ...w, start: +(H + mapT(w.start)).toFixed(3), end: +(H + mapT(w.end)).toFixed(3) }));
const TOTAL = +(H + Math.min(acc, words.at(-1).end - H + 1.2)).toFixed(3); // words are already in output time
const W = words.map((w) => norm(w.text));
// phrase -> global time; falls back to its first two words, else null (moment skipped)
const find = (phrase, after = 0) => {
  for (const p of [phrase.split(" ").map(norm), phrase.split(" ").map(norm).slice(0, 2)]) {
    for (let i = 0; i < W.length; i++) if (words[i].start >= after && p.every((x, j) => W[i + j] === x)) return words[i].start;
  }
  return null;
};
const wAt = (word, from, fallback) => { const i = words.findIndex((w) => w.start >= from - 0.05 && norm(w.text) === norm(word)); return i < 0 ? fallback : words[i].start; };

// ---------- components ----------
let html = "", tw = ""; const cues = []; let n = 0;
const uid = (p) => p + n++;
const sfx = (k, t, v) => cues.push({ k, t, v });
const ICON = {
  warn: `<path d="M32 6L60 56H4Z" fill="url(#gRed)"/><rect x="29" y="22" width="6" height="18" rx="3" fill="#fff"/><circle cx="32" cy="47" r="3.5" fill="#fff"/>`,
  sun: `<circle cx="32" cy="32" r="12" fill="url(#gGold)"/><g stroke="#FBBF24" stroke-width="4" stroke-linecap="round"><path d="M32 4v8M32 52v8M4 32h8M52 32h8M12 12l6 6M46 46l6 6M52 12l-6 6M18 46l-6 6"/></g>`,
  fist: `<rect x="14" y="20" width="36" height="30" rx="10" fill="url(#gGold)"/><path d="M22 20v-6M30 20v-8M38 20v-8M46 22v-6" stroke="#FBBF24" stroke-width="7" stroke-linecap="round"/>`,
  chain: `<g fill="none" stroke="url(#gGold)" stroke-width="6"><rect x="4" y="22" width="26" height="18" rx="9"/><rect x="34" y="22" width="26" height="18" rx="9" transform="rotate(18 47 31)"/></g>`,
  unlock: `<rect x="12" y="28" width="40" height="30" rx="8" fill="url(#gGold)"/><path d="M20 28v-8a12 12 0 0 1 23-4" fill="none" stroke="url(#gGold)" stroke-width="6"/><circle cx="32" cy="42" r="4" fill="#2a1a08"/>`,
  lock: `<rect x="12" y="28" width="40" height="30" rx="8" fill="url(#gGold)"/><path d="M20 28v-8a12 12 0 0 1 24 0v8" fill="none" stroke="url(#gGold)" stroke-width="6"/><circle cx="32" cy="42" r="4" fill="#2a1a08"/>`,
  shield: `<path d="M32 4L56 12V30C56 46 44 56 32 60C20 56 8 46 8 30V12Z" fill="url(#gViolet)"/><path d="M22 32l7 7 13-14" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round"/>`,
  send: `<path d="M4 30L60 6L44 58L32 38Z" fill="url(#gCyan)"/><path d="M32 38L60 6" stroke="#0b2233" stroke-width="3"/>`,
  star: `<path d="M32 2C34 22 42 30 62 32C42 34 34 42 32 62C30 42 22 34 2 32C22 30 30 22 32 2Z" fill="url(#gGold)"/>`,
  smile: `<circle cx="32" cy="32" r="28" fill="url(#gGold)"/><circle cx="23" cy="26" r="3.5" fill="#3b2206"/><circle cx="41" cy="26" r="3.5" fill="#3b2206"/><path d="M20 38Q32 50 44 38" fill="none" stroke="#3b2206" stroke-width="4" stroke-linecap="round"/>`,
  bubble: `<path d="M8 10H56Q60 10 60 14V40Q60 44 56 44H28L16 56V44H8Q4 44 4 40V14Q4 10 8 10Z" fill="url(#gGold)"/>`,
  heart: `<path d="M32 56C10 40 4 28 10 18C16 8 28 10 32 20C36 10 48 8 54 18C60 28 54 40 32 56Z" fill="url(#gRed)"/>`,
  coin: `<circle cx="32" cy="32" r="27" fill="url(#gGold)"/><circle cx="32" cy="32" r="20" fill="none" stroke="#8a5a0a" stroke-width="2"/><text x="32" y="42" text-anchor="middle" font-family="Montserrat" font-weight="900" font-size="28" fill="#6b4306">$</text>`,
  check: `<circle cx="32" cy="32" r="28" fill="url(#gGreen)"/><path d="M18 33L28 43L47 22" fill="none" stroke="#06281b" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>`,
  key: `<circle cx="18" cy="32" r="12" fill="none" stroke="url(#gGold)" stroke-width="6"/><path d="M30 32H60M50 32V42M57 32V39" stroke="#FBBF24" stroke-width="6" stroke-linecap="round"/>`,
  eye: `<path d="M4 32C14 16 50 16 60 32C50 48 14 48 4 32Z" fill="none" stroke="url(#gViolet)" stroke-width="5"/><circle cx="32" cy="32" r="10" fill="url(#gViolet)"/>`,
  up: `<circle cx="32" cy="32" r="28" fill="url(#gGreen)"/><path d="M20 40L44 18M30 18H44V32" fill="none" stroke="#06281b" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>`,
  door: `<rect x="16" y="6" width="32" height="54" rx="3" fill="none" stroke="url(#gGold)" stroke-width="5"/><path d="M16 6L40 12V58L16 60" fill="url(#gGold)" opacity=".5"/><circle cx="36" cy="34" r="3" fill="#FBBF24"/>`,
  gift: `<rect x="8" y="24" width="48" height="34" rx="4" fill="url(#gViolet)"/><rect x="4" y="16" width="56" height="12" rx="3" fill="url(#gGold)"/><path d="M32 16V58" stroke="#FBBF24" stroke-width="5"/>`,
};
const svg = (k) => `<svg viewBox="0 0 64 64">${ICON[k]}</svg>`;
// glass pop-up card over the chest: icon + title (+ sub)
function card(t, e, icon, title, sub = "", glow = "rgba(251,191,36,.45)", snd = "popin") {
  if (t == null) return;
  const id = uid("card"), out = Math.min(e, t + 3.6);
  html += `<div id="${id}" class="card" style="--glow:${glow}"><div class="row">${icon ? `<div class="ic">${svg(icon)}</div>` : ""}<div><div class="ttl">${title}</div>${sub ? `<div class="sub">${sub}</div>` : ""}</div></div></div>\n`;
  tw += `tl.fromTo("#${id}",{opacity:0,scale:0.86,y:24,filter:"blur(10px)"},{opacity:1,scale:1,y:0,filter:"blur(0px)",duration:0.45,ease:"back.out(1.6)",immediateRender:false},${T(t)});tl.to("#${id}",{opacity:0,scale:0.94,y:-14,filter:"blur(8px)",duration:0.25,ease:"power2.in"},${T(out - 0.25)});\n`;
  if (snd) sfx(snd, t);
  return id;
}
// split screen: face shrinks into a glowing card at the bottom, glass panel with the graphic on top
function split(t, e, inner, glow = "rgba(167,139,250,.5)") {
  if (t == null) return;
  const id = uid("split");
  html += `<div id="${id}" class="splitTop" style="--glow:${glow}">${inner}</div>\n`;
  tw += `tl.fromTo("#face",{scale:1,y:0,borderRadius:0},{scale:0.62,y:520,borderRadius:70,duration:0.5,ease:"power3.inOut",immediateRender:false},${T(t)});tl.fromTo("#faceglow",{opacity:0},{opacity:1,duration:0.4,immediateRender:false},${T(t + 0.2)});\n`;
  tw += `tl.fromTo("#${id}",{opacity:0,y:-40,scale:0.95},{opacity:1,y:0,scale:1,duration:0.5,ease:"power3.out",immediateRender:false},${T(t + 0.15)});\n`;
  tw += `tl.to("#${id}",{opacity:0,y:-30,duration:0.3,ease:"power2.in"},${T(e - 0.35)});tl.to("#face",{scale:1,y:0,borderRadius:0,duration:0.45,ease:"power3.inOut"},${T(e - 0.4)});tl.to("#faceglow",{opacity:0,duration:0.3},${T(e - 0.4)});\n`;
  sfx("whoosh", t + 0.1); sfx("swish", e - 0.3, 0.2);
  return id;
}
const big = (txt, cls = "gold", size = 170) => `<div class="num ${cls}" style="font-size:${size}px">${txt}</div>`;
const lbl = (s) => `<div class="lbl">${s}</div>`;
const ring = (id, col, inner) => `<div class="ringbox"><svg viewBox="0 0 200 200"><circle cx="100" cy="100" r="84" class="trk"/><circle id="${id}" cx="100" cy="100" r="84" fill="none" stroke="${col}" stroke-width="12" stroke-linecap="round" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="1" transform="rotate(-90 100 100)" style="filter:drop-shadow(0 0 10px ${col})"/></svg><div class="rn">${inner}</div></div>`;
const fillRing = (id, from, to, t, d = 0.5) => { tw += `tl.fromTo("#${id}",{attr:{"stroke-dashoffset":${from}}},{attr:{"stroke-dashoffset":${to}},duration:${d},ease:"power2.out",immediateRender:false},${T(t)});\n`; };
const popIn = (sel, t) => { tw += `tl.fromTo("${sel}",{opacity:0,scale:0.5},{opacity:1,scale:1,duration:0.4,ease:"back.out(2.4)",immediateRender:false},${T(t)});\n`; };
function profile(t, e, line2) {
  const id = uid("pf");
  split(t, e, `<div class="pf"><div class="pring" id="${id}r"></div><div class="ppic"><svg viewBox="0 0 64 64"><circle cx="32" cy="24" r="12" fill="#e9e3ff"/><path d="M8 60C10 42 54 42 56 60Z" fill="#e9e3ff"/></svg></div><div class="tapr" id="${id}t"></div></div>${lbl("TAP MY PROFILE PICTURE")}<div class="sub2">${line2}</div>`, "rgba(236,72,153,.5)");
  tw += `tl.fromTo("#${id}r",{rotation:0},{rotation:360,duration:${T(e - t)},ease:"none"},${T(t)});tl.fromTo("#${id}t",{scale:0.3,opacity:0.9},{scale:2,opacity:0,duration:0.7,repeat:2,ease:"power2.out",immediateRender:false},${T(t + 0.9)});\n`;
  sfx("tap", t + 0.9);
}

// ---------- plans (one per script; phrases are matched on each avatar's own transcript) ----------
const PLANS = {
  body: { music: "Last Hope.MP3", trig: ["222"], acc: ["mistake", "abundance", "thanks", "chosen", "month", "destroyed", "unlocked", "forever", "seal", "locked", "sensitive", "disappears", "breakthrough"],
    fix: {},
    build() {
      card(find("make a huge mistake"), find("a woman before"), "warn", "DON'T IGNORE THIS", "", "rgba(244,63,94,.5)", "punch");
      { const t = find("a woman before"), e = find("if you stopped"); split(t, e, `${lbl("SHE SCROLLED PAST")}${big("ABUNDANCE", "dim", 120)}<div class="sub2">and missed it</div>`, "rgba(148,163,184,.4)"); }
      card(find("raise your hands"), find("chosen you") ?? find("universe has already"), "sun", "GIVE THANKS");
      { const t = find("chosen you") ?? find("universe has already"), e = find("close your right"); if (t) { split(t, e, `<div class="rays"></div>${big("CHOSEN", "gold", 190)}<div class="sub2">to receive the blessing in her place</div>`, "rgba(251,191,36,.55)"); sfx("hit", t + 0.6); } }
      card(find("close your right"), find("the biggest and"), "fist", "CLOSE YOUR RIGHT HAND");
      card(find("the biggest and"), find("i can already"), null, `<span class="gold-t">THE BIGGEST MONTH</span>`, "of your life is about to begin");
      { const t = wAt("destroyed", find("i can already") ?? 0, null); card(t ? t - 0.3 : null, t + 4, "chain", "CHAINS DESTROYED", "", "rgba(251,191,36,.45)", "punch"); }
      card(wAt("unlocked", find("the doors") ?? 0, null), Infinity, "unlock", "DOORS UNLOCKED");
      card(find("in the next five minutes"), Infinity, null, `<span class="gold-t">5:00</span>`, "scarcity removed forever");
      card(find("open your right"), find("save this video"), "send", "SEND IT TO YOURSELF", "", "rgba(56,189,248,.45)", "swish");
      { const t = find("save this video"), e = find("if you did"); if (t) {
        const r = uid("sealr"), id = uid("seal");
        split(t, e ?? t + 12, `${lbl("YOUR 3 SEALS")}<div class="seals" id="${id}">${["save", "follow", "222"].map((s, i) => `<div class="sl" id="${id}${i}"><div class="slc">${i === 2 ? "222" : ["SAVE", "FOLLOW"][i]}</div></div>`).join("")}</div>${ring(r, "#FBBF24", `<span id="${r}n">0</span><small>/3</small>`)}`, "rgba(251,191,36,.5)");
        [t + 0.3, find("tap the follow") ?? t + 4, find("comment") ?? t + 8].forEach((tt, i) => { tw += `tl.fromTo("#${id}${i}",{opacity:0.25,scale:0.9},{opacity:1,scale:1,duration:0.35,ease:"back.out(2.5)",immediateRender:false},${T(tt)});tl.set("#${r}n",{innerText:"${i + 1}"},${T(tt)});\n`; fillRing(r, 1 - i / 3, 1 - (i + 1) / 3, tt); sfx("bell" + (i + 1), tt); });
      } }
      card(wAt("locked", find("if you did") ?? 0, null), Infinity, "lock", "BLESSING LOCKED IN", "", "rgba(251,191,36,.5)", "hit");
      card(find("this energy is highly"), find("so tap my"), "shield", "PROTECT THIS ENERGY", "", "rgba(167,139,250,.5)");
      profile(find("so tap my") ?? find("tap my profile"), TOTAL, "watch my latest Story before it disappears");
    } },
  candle: { music: "Snowfall.mp3", trig: ["THANK", "YOU", "UNIVERSE"], acc: ["wish", "smile", "three", "energy", "karma", "real", "stories"],
    fix: { "tnq": "THANK YOU,", "thank": "THANK", "you,": "YOU,", "universe.": "UNIVERSE.", "universe,": "UNIVERSE,", "two.": "one.", "me.": "follow me." },
    build() {
      card(find("make a wish"), find("ready"), "star", "MAKE A WISH", "in the next five seconds");
      { const t0 = find("ready") ?? find("five four"), e = find("now i want") ?? (t0 + 8); if (t0) {
        const r = uid("cd"), nums = ["five", "four", "three", "two", "one"];
        split(t0, e, `${lbl("MAKE YOUR WISH")}${ring(r, "#FBBF24", `<span class="num gold" id="${r}n" style="font-size:150px">5</span>`)}`, "rgba(251,191,36,.5)");
        let prev = t0 + 0.6;
        nums.forEach((w, i) => { let tt = wAt(w, prev, null); if (tt == null || tt > e) tt = Math.min(e - 0.4, prev + 0.9); prev = tt + 0.1; tw += `tl.set("#${r}n",{innerText:"${5 - i}"},${T(tt)});tl.fromTo("#${r}n",{scale:1.3},{scale:1,duration:0.3,ease:"back.out(3)",immediateRender:false},${T(tt)});\n`; fillRing(r, i / 5, (i + 1) / 5, tt, 0.4); sfx(i === 4 ? "hit" : "tick", tt); });
      } }
      card(wAt("smile", find("now i want") ?? 0, null), find("comment") ?? Infinity, "smile", "SMILE");
      { const t = find("comment"); card(t, find("and send") ?? t + 4, "bubble", `<span class="gold-t">THANK YOU, UNIVERSE</span>`, "comment it below", "rgba(251,191,36,.6)", "sting"); }
      card(find("three people") ?? find("send this video"), find("when you spread"), "heart", "SEND TO 3 PEOPLE", "spread the good energy", "rgba(244,63,94,.45)");
      { const t = find("when you spread"), e = find("and before you"); if (t) { const id = uid("loop"); split(t, e, `<div class="loop" id="${id}"><div class="la">GIVE</div><div class="lb">RECEIVE</div></div>${big("KARMA IS REAL", "gold", 90)}`, "rgba(56,189,248,.45)"); tw += `tl.fromTo("#${id}",{rotation:0},{rotation:360,duration:${T(e - t)},ease:"none"},${T(t)});\n`; sfx("hit", wAt("karma", t, t + 2)); } }
      profile(find("tap my profile"), TOTAL, "a 3-card reading about your wish is waiting");
    } },
  money: { music: "Grounded.mp3", trig: ["MONEY"], acc: ["money", "everywhere", "experiment", "key", "brain", "attract", "neuroscience", "abundance"],
    fix: { "money.": "MONEY." },
    build() {
      card(find("manifest money"), find("absolutely"), "coin", "MONEY OUT OF NOWHERE?");
      card(find("absolutely"), find("here's the experiment") ?? find("heres the"), "check", "ABSOLUTELY", "", "rgba(52,211,153,.45)", "hit");
      { const t = find("say this phrase"), e = find("the key is"); split(t, e, `${lbl("SAY IT ALL DAY")}<div class="quote">“Money comes to me <i>freely</i> and <i>abundantly</i>, and I notice it <i class="gold-t">everywhere</i>.”</div>`, "rgba(251,191,36,.45)"); }
      card(find("the key is"), find("youre not looking"), "key", "THE KEY", "I notice it everywhere");
      card(find("training your brain"), find("a coin on"), "eye", "TRAIN YOUR BRAIN", "to notice money in every form", "rgba(167,139,250,.5)");
      { const t = find("a coin on"), e = find("every time you"); if (t) {
        const id = uid("tiles"), items = [["coin", "COIN", "coin"], ["send", "REFUND", "refund"], ["bubble", "CLIENT", "client"], ["up", "BONUS", "bonus"], ["gift", "GIFT", "gift"], ["star", "COFFEE", "coffee"]];
        split(t, e, `${lbl("MONEY IN EVERY FORM")}<div class="tiles">${items.map(([ic, l], i) => `<div class="tile" id="${id}${i}"><div class="ic sm">${svg(ic)}</div><div class="tl">${l}</div></div>`).join("")}</div>`, "rgba(251,191,36,.45)");
        let prev = t; items.forEach(([, , w], i) => { const tt = wAt(w, prev, prev + 0.7); prev = tt; popIn(`#${id}${i}`, tt); });
      } }
      card(find("you attract"), find("thats not magic"), "up", "YOU ATTRACT MORE", "", "rgba(52,211,153,.45)");
      card(wAt("neuroscience", find("thats not magic") ?? 0, null), find("comment the word"), null, `<span class="gold-t">NEUROSCIENCE</span>`, "not magic", "rgba(56,189,248,.45)", "hit");
      { const t = find("comment the word"); card(t, find("then tap") ?? t + 4, "bubble", `COMMENT <span class="gold-t">MONEY</span>`, "", "rgba(251,191,36,.6)", "sting"); }
      profile(find("tap my profile"), TOTAL, "a 3-card reading on your path to abundance");
    } },
  selfie: { cardTop: 1190, music: "Stargazing.mp3", trig: ["RECEIVED"], acc: ["big", "now", "blessing", "deserve", "faith", "coming", "destiny", "yours", "chapter"],
    fix: { "received": "RECEIVED" },
    build() {
      card(find("about to win"), find("and thats not"), "star", "YOU'RE ABOUT TO WIN BIG");
      card(find("thats now") ?? wAt("now", find("and thats not") ?? 0, null), find("from now on"), null, `<span class="gold-t">NOW</span>`, "not someday", "rgba(251,191,36,.5)", "hit");
      { const t = find("from now on"), e = find("because you deserve") ?? find("doors are going"); if (t) { const id = uid("bl");
        card(t, e, "gift", `BLESSING <span class="gold-t" id="${id}">×1</span>`);
        let prev = t; [1, 2, 3].forEach((k) => { const tt = wAt("blessing", prev, prev + 0.8); prev = tt + 0.1; tw += `tl.set("#${id}",{innerText:"×${k}"},${T(tt)});\n`; });
      } }
      card(find("doors are going"), find("the reason youre"), "door", "DOORS WILL OPEN", "before you even knock");
      { const t = find("future version"), e = find("asking you to believe") ?? find("its the future"); if (t) split(t, e, `${lbl("THE FUTURE VERSION OF YOU")}<div class="fy"><span class="you">YOU</span><span class="dots"></span><span class="you gold-t">FUTURE YOU</span></div><div class="sub2">already living the dream life</div>`, "rgba(251,191,36,.45)"); }
      card(find("believe just"), find("its the future"), "heart", "BELIEVE A LITTLE MORE", "", "rgba(244,63,94,.4)");
      card(find("telling you"), find("and its going to"), null, `<span class="gold-t">IT'S COMING</span>`, "", "rgba(251,191,36,.5)", "hit");
      card(wAt("destiny", find("call it luck") ?? 0, null), find("so breathe"), "star", `NOT LUCK. <span class="gold-t">DESTINY</span>`);
      { const t = find("so breathe"), e = find("comment the word") ?? find("and decide"); if (t) { const id = uid("br");
        split(t, e, `${lbl("BREATHE WITH ME")}<div class="breath" id="${id}"><span id="${id}t">INHALE</span></div>`, "rgba(56,189,248,.5)");
        const ti = wAt("nose", t, t + 2) - 0.8, te = wAt("exhale", t, ti + 3);
        tw += `tl.fromTo("#${id}",{scale:0.7},{scale:1.15,duration:${T(Math.max(0.6, te - ti))},ease:"sine.inOut",immediateRender:false},${T(ti)});tl.to("#${id}",{scale:0.75,duration:2.2,ease:"sine.inOut"},${T(te)});tl.set("#${id}t",{innerText:"EXHALE"},${T(te)});\n`;
      } }
      { const t = find("comment the word"); card(t, find("then i want") ?? t + 4, "bubble", `COMMENT <span class="gold-t">RECEIVED</span>`, "to seal it", "rgba(251,191,36,.6)", "sting"); }
      profile(find("tap my profile"), TOTAL, "a 3-card reading about your next chapter");
    } },
};
const PL = PLANS[SCRIPT];
if (!PL) throw new Error("unknown script " + SCRIPT);
PL.build();

// ---------- captions: 2-4 word chunks, each word blurs in on its time; keywords in glowing gold serif ----------
const disp = (w) => PL.fix[w.text.toLowerCase()] ?? w.text.replace(/^St\.$/, "Saint");
const groups = []; let g = [];
words.forEach((w, i) => { g.push(w); const nx = words[i + 1]; if (/[.,?!]$/.test(w.text) || g.length >= 4 || !nx || nx.start - w.end > 0.25) { groups.push(g); g = []; } });
let cap = "";
groups.forEach((gr, gi) => {
  const id = `cp${gi}`, st = gr[0].start - 0.05, en = Math.min(groups[gi + 1] ? groups[gi + 1][0].start - 0.03 : TOTAL, gr.at(-1).end + 0.7);
  cap += `<div id="${id}" class="cg">${gr.map((w, j) => { const d = disp(w), k = norm(d); const trig = PL.trig.some((x) => d.includes(x)); const acc = !trig && PL.acc.includes(k); return `<span class="w${trig ? " trig" : acc ? " acc" : ""}" id="${id}w${j}">${d.replace(/&/g, "&amp;")}</span>`; }).join(" ")}</div>`;
  gr.forEach((w, j) => { tw += `tl.fromTo("#${id}w${j}",{opacity:0,y:12,filter:"blur(10px)"},{opacity:1,y:0,filter:"blur(0px)",duration:0.26,ease:"power3.out",immediateRender:false},${T(Math.max(0, w.start - 0.05))});`; });
  tw += `tl.set("#${id}",{opacity:1},${T(Math.max(0, st))});tl.to("#${id}",{opacity:0,filter:"blur(8px)",duration:0.15},${T(en - 0.15)});\n`;
});

// jump-cut punch-ins
offs.slice(1).forEach((c, i) => { tw += `tl.set("#zoom",{scale:${i % 2 ? 1 : 1.07}},${T(H + c)});\n`; });
if (H) { tw += `tl.fromTo("#flash",{opacity:0},{opacity:0.6,duration:0.06,immediateRender:false},${T(H - 0.04)});tl.to("#flash",{opacity:0,duration:0.4},${T(H + 0.02)});\n`; sfx("whoosh", H - 0.2); }

// ---------- audio ----------
ff(["-hide_banner", "-y", "-i", BODY, "-vn", "-ac", "1", "-ar", "48000", P + "/assets/voice.wav"]);
const getI = (txt) => { const m = txt.match(/"input_i"\s*:\s*"(-?[\d.]+)"/); return m ? +m[1] : null; };
const voI = getI(ff(["-hide_banner", "-i", P + "/assets/voice.wav", "-af", "loudnorm=print_format=json", "-f", "null", "-"]));
const MUSIC = MUS + PL.music, muI = getI(ff(["-hide_banner", "-t", String(TOTAL + 1), "-i", MUSIC, "-af", "loudnorm=print_format=json", "-f", "null", "-"]));
const loops = Math.max(0, Math.ceil((TOTAL + 1) / ffp(MUSIC)) - 1);
ff(["-hide_banner", "-y", "-stream_loop", String(loops), "-i", MUSIC, "-t", String(TOTAL + 0.5), "-af", `volume=${(voI - 17 - muI).toFixed(2)}dB${H ? `,volume=eval=frame:volume='1+1.5*(1-min(1\\,max(0\\,(t-${H - 0.3})/0.5)))'` : ""},afade=t=out:st=${(TOTAL - 2.5).toFixed(2)}:d=2.5`, "-ar", "48000", "-ac", "2", P + "/assets/music.wav"]);
// [file, peak s, volume]
const KIT = { popin: ["clean/popin", 0.019, 0.16], swish: ["clean/swish", 0.155, 0.22], whoosh: ["clean/whoosh", 0.35, 0.3], punch: ["clean/punch", 0.058, 0.4], hit: ["kit/hit", 0, 0.35], tick: ["clean/tick", 0.004, 0.18], tap: ["clean/tap", 0.013, 0.35],
  bell1: ["kit/bell1", 0, 0.28], bell2: ["kit/bell2", 0, 0.25], bell3: ["kit/bell3", 0, 0.25], sting: ["kit/sting", 0.139, 0.32] };
cues.sort((a, b) => a.t - b.t);
const kept = []; for (const c of cues) { if (c.t == null || isNaN(c.t) || c.t > TOTAL - 0.2) continue; if (kept.some((k) => Math.abs(k.t - c.t) < 0.25)) continue; kept.push(c); }
const audio = kept.map((c, i) => { const [f, pk, v] = KIT[c.k]; const src = SFX + f + ".wav"; fs.copyFileSync(src, `${P}/assets/s_${c.k}.wav`); return `<audio id="fx${i}" class="clip" src="assets/s_${c.k}.wav" data-start="${T(Math.max(0, c.t - pk))}" data-duration="${T(Math.min(2.4, ffp(src)))}" data-track-index="${7 + (i % 4)}" data-volume="${(c.v ?? v).toFixed(3)}"></audio>`; });

// ---------- page ----------
const css = fs.readFileSync(STUDIO + "/auraly-lineart/tools/batch.css", "utf8");
fs.writeFileSync(P + "/index.html", `<!doctype html>
<html lang="en"><head><meta charset="UTF-8" /><meta name="viewport" content="width=1080, height=1920" />
<script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js"></script>
<link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Montserrat:wght@600;800;900&display=swap" rel="stylesheet">
<style>${css}${PL.cardTop ? `.card{top:${PL.cardTop}px;}` : ""}</style></head><body>
<div id="root" data-composition-id="main" data-start="0" data-duration="${TOTAL}" data-width="1080" data-height="1920">
<svg width="0" height="0" style="position:absolute"><defs>
<linearGradient id="gGold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FEF3C7"/><stop offset=".5" stop-color="#FBBF24"/><stop offset="1" stop-color="#F97316"/></linearGradient>
<linearGradient id="gViolet" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F0ABFC"/><stop offset="1" stop-color="#7C3AED"/></linearGradient>
<linearGradient id="gRed" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FDA4AF"/><stop offset="1" stop-color="#E11D48"/></linearGradient>
<linearGradient id="gGreen" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#A7F3D0"/><stop offset="1" stop-color="#10B981"/></linearGradient>
<linearGradient id="gCyan" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#A5F3FC"/><stop offset="1" stop-color="#0EA5E9"/></linearGradient></defs></svg>
<div id="bgfx"></div>
<div id="push"><div id="face"><div id="zoom"><video id="body" class="clip" src="assets/body.mp4" data-start="${H}" data-duration="${T(TOTAL - H)}" data-media-start="0" data-track-index="1" muted playsinline></video></div></div><div id="faceglow"></div></div>
<div id="vig"></div>
${html}
${H ? `<video id="hook" class="clip" src="assets/hook.mp4" data-start="0" data-duration="${H}" data-track-index="0" muted playsinline></video>` : ""}
<div id="caps">${cap}</div>
<div id="flash"></div>
<audio id="vo" class="clip" src="assets/voice.wav" data-start="${H}" data-track-index="4" data-volume="1"></audio>
<audio id="bgm" class="clip" src="assets/music.wav" data-start="0" data-duration="${TOTAL}" data-track-index="5" data-volume="1"></audio>
${audio.join("\n")}
</div>
<script>
const tl = gsap.timeline({ paused: true });
${tw}tl.set({}, {}, ${TOTAL});
window.__timelines["main"] = tl;
</script></body></html>`);
console.log(`${slug} [${SCRIPT}] cut ${(rawLen - acc).toFixed(1)}s, total ${TOTAL}s, captions ${groups.length}, sfx ${kept.length}`);

// ---------- render + deliver ----------
if (RENDER) {
  const out = `${WS}/${slug}-render.mp4`;
  const r = spawnSync("npx", ["hyperframes@0.9.67", "render", "--workers", "5", "--fps", "24", "--crf", "20", "-o", `"${out}"`], { cwd: P, env, encoding: "utf8", shell: true, maxBuffer: 1 << 26 });
  if (r.status !== 0) throw new Error("render failed: " + (r.stderr || r.stdout).slice(-800));
  fs.mkdirSync(OUTDIR, { recursive: true });
  let name = OUTNAME, k = 2; while (fs.existsSync(`${OUTDIR}/${name}.mp4`)) name = `${OUTNAME} ${k++}`;
  ff(["-hide_banner", "-y", "-i", out, "-c:v", "copy", "-af", "loudnorm=I=-15:TP=-1.5:LRA=11", "-ar", "48000", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", `${OUTDIR}/${name}.mp4`]);
  fs.rmSync(out, { force: true }); fs.rmSync(P + "/assets/body.mp4", { force: true }); fs.rmSync(P + "/.hyperframes", { recursive: true, force: true });
  console.log("delivered " + `${OUTDIR}/${name}.mp4`);
}

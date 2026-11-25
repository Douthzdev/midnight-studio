import fs from "node:fs";
const D = 2.1, G = [["Money", "doesn't", "stay"], ["where", "there's", "no", "room."]], KEY = new Set(["stay", "room."]);
const styles = [["inv", "1 · Caixa invertida"], ["hol", "2 · Contorno que preenche"], ["ser", "3 · Editorial serifada"], ["stk", "4 · Empilhada cinética"], ["und", "5 · Sublinhado deslizante"], ["mono", "6 · Máquina de escrever"]];
let html = "", tw = "";
styles.forEach(([k, label], si) => {
  const t0 = si * D;
  html += `<div id="lb${si}" class="clip lbl" data-start="${t0}" data-duration="${D}" data-track-index="2">${label}</div>`;
  G.forEach((g, gi) => {
    const gs = t0 + gi * (D / 2), id = `g${si}_${gi}`;
    html += `<div id="${id}" class="clip cap ${k}" data-start="${gs.toFixed(2)}" data-duration="${(D / 2).toFixed(2)}" data-track-index="${3 + gi}">` +
      g.map((w, wi) => `<span class="w${KEY.has(w) ? " k" : ""}" id="${id}w${wi}">${k === "mono" ? w.toLowerCase() : w}${k === "und" ? "<i class=\"ul\"></i>" : ""}</span>`).join(k === "stk" ? "" : " ") + `${k === "mono" ? '<span class="cur"></span>' : ""}</div>`;
    g.forEach((w, wi) => {
      const t = (gs + 0.05 + wi * 0.22).toFixed(2), s = `#${id}w${wi}`, nx = (gs + 0.05 + (wi + 1) * 0.22).toFixed(2);
      if (k === "inv") tw += `tl.fromTo("${s}",{opacity:0,y:20},{opacity:1,y:0,duration:.2,ease:"expo.out"},${t});tl.fromTo("${s}",{backgroundColor:"rgba(255,255,255,0)",color:"#fff",scale:1},{backgroundColor:"rgba(255,255,255,1)",color:"#111",scale:1.08,duration:.08,immediateRender:false},${t});` + (wi < g.length - 1 ? `tl.to("${s}",{backgroundColor:"rgba(255,255,255,0)",color:"#fff",scale:1,duration:.1},${nx});` : "");
      if (k === "hol") tw += `tl.fromTo("${s}",{opacity:0,scale:.8},{opacity:1,scale:1,duration:.2,ease:"back.out(2)"},${(gs + 0.02).toFixed(2)});tl.fromTo("${s}",{color:"rgba(255,255,255,0)"},{color:"rgba(255,255,255,1)",duration:.12,immediateRender:false},${t});`;
      if (k === "ser") tw += `tl.fromTo("${s}",{opacity:0,y:24,filter:"blur(10px)"},{opacity:1,y:0,filter:"blur(0px)",duration:.4,ease:"expo.out"},${t});`;
      if (k === "stk") tw += `tl.fromTo("${s}",{opacity:0,x:-60},{opacity:1,x:0,duration:.35,ease:"expo.out"},${t});`;
      if (k === "und") tw += `tl.fromTo("${s}",{opacity:0,y:14},{opacity:1,y:0,duration:.25,ease:"expo.out"},${(gs + 0.02 + wi * 0.03).toFixed(2)});tl.fromTo("${s} .ul",{scaleX:0,opacity:1},{scaleX:1,opacity:1,duration:.16,ease:"expo.out",immediateRender:false},${t});` + (wi < g.length - 1 ? `tl.to("${s} .ul",{opacity:0,duration:.12},${nx});` : "") + ``;
      if (k === "mono") tw += `tl.fromTo("${s}",{opacity:0},{opacity:1,duration:.01},${t});`;
    });
    if (k === "mono") tw += `tl.fromTo("#${id} .cur",{opacity:1},{opacity:0,duration:.25,repeat:3,yoyo:true,ease:"steps(1)"},${gs.toFixed(2)});`;
  });
});
const T = styles.length * D;
fs.writeFileSync("index.html", `<!doctype html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=1080, height=1920">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@500;600;800;900&family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@500&display=block" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js"></script>
<style>*{margin:0;padding:0;box-sizing:border-box}html,body{width:1080px;height:1920px;overflow:hidden;background:#000}
#bg{position:absolute;inset:0;width:1080px;height:1920px;object-fit:cover}
.lbl{position:absolute;top:110px;left:0;width:1080px;text-align:center;font:800 40px Inter;color:#fff;letter-spacing:.04em}
.lbl::before{content:"";}
.cap{position:absolute;left:60px;right:60px;top:1440px;text-align:center;color:#fff}
.w{display:inline-block;margin:0 .13em}
.inv .w{font:800 70px Inter;padding:4px 16px;margin:0 2px;border-radius:16px;text-shadow:0 3px 14px rgba(0,0,0,.5)}
.hol .w{font:900 84px Inter;text-transform:uppercase;letter-spacing:-.02em;-webkit-text-stroke:3px #fff;text-shadow:0 0 24px rgba(255,255,255,.35)}
.ser .w{font:600 66px Inter;letter-spacing:-.01em;text-shadow:0 3px 18px rgba(0,0,0,.6)} .ser .w.k{font:italic 400 98px 'Instrument Serif';letter-spacing:0}
.stk{text-align:left;top:1330px;display:flex;flex-direction:column;align-items:flex-start;gap:0} .stk .w{font:600 50px Inter;text-shadow:0 3px 14px rgba(0,0,0,.6);line-height:1.05;margin-right:14px} .stk .w.k{font:900 150px Inter;letter-spacing:-.05em;line-height:.95;text-transform:uppercase}
.und .w{font:800 68px Inter;margin:0 6px;text-shadow:0 3px 16px rgba(0,0,0,.6)} .und{} .und .w{position:relative} .und .ul{position:absolute;bottom:-12px;left:0;right:0;height:9px;transform-origin:0 50%;border-radius:5px;background:#fff;box-shadow:0 0 14px rgba(255,255,255,.6)}
.mono{left:110px;right:110px;padding:22px 30px;border-radius:18px;background:rgba(10,10,14,.55);backdrop-filter:blur(10px)} .mono .w{font:500 54px 'JetBrains Mono';letter-spacing:-.02em}
.cur{display:inline-block;width:26px;height:56px;background:#fff;vertical-align:-8px;margin-left:8px}
</style></head><body><div id="root" data-composition-id="main" data-start="0" data-duration="${T}" data-width="1080" data-height="1920">
<video id="bg" class="clip" src="assets/bg.mp4" data-start="0" data-duration="${T}" data-track-index="1" muted playsinline></video>
${html}</div><script>const tl=gsap.timeline({paused:true});${tw}tl.set({},{},${T});window.__timelines.main=tl;</script></body></html>`);

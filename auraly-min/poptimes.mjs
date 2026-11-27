// prints snapshot times (pop start + 1.6 s) for the pop kinds worth eyeballing: node poptimes.mjs <slug>
import fs from "node:fs";
const h = fs.readFileSync(new URL(process.argv[2] + "/index.html", import.meta.url), "utf8");
const out = [0.3], seen = {};
for (const [, id, k] of h.matchAll(/<div id="(p\d+)" class="pop [^"]*?gl (\w+)/g)) {
  const m = h.match(new RegExp(`tl\\.fromTo\\("#${id}",.*?,([\\d.]+)\\);`));
  if (!m || (seen[k] = (seen[k] || 0) + 1) > 2) continue;
  out.push(+(+m[1] + 1.6).toFixed(1));
}
console.log(out.sort((a, b) => a - b).slice(0, 10).join(","));

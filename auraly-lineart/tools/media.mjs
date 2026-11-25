// Where the avatar videos live: "M:/Google/Claude Ediçoes/hooks/<NAME>[ hook].mp4" and ".../bodys/<name>.mp4"
// (old layout "M:/Google/<NAME> hook.mp4" + "M:/Google/<name>.mp4" still works).
import fs from "node:fs";

const G = "M:/Google";
const ED = G + "/Claude Ediçoes";
const DIRS = { hook: [ED + "/hooks", G], body: [ED + "/bodys", G] };
const nameOf = (f) => f.toLowerCase().replace(/\.(mp4|mov|m4v)$/, "").replace(/\s*hook$/, "").trim();
const isVid = (f) => /\.(mp4|mov|m4v)$/i.test(f);

// avatar names available for one kind
export function list(kind) {
  const out = new Map();
  for (const d of DIRS[kind]) {
    if (!fs.existsSync(d)) continue;
    for (const f of fs.readdirSync(d)) {
      if (!isVid(f)) continue;
      if (d === G && (kind === "hook") !== / hook\.[a-z0-9]+$/i.test(f)) continue; // root: hook files end in " hook"
      if (!out.has(nameOf(f))) out.set(nameOf(f), `${d}/${f}`);
    }
  }
  return out;
}
export function locate(kind, name) {
  const p = list(kind).get(name.toLowerCase());
  if (!p) throw new Error(`no ${kind} video for "${name}" in ${DIRS[kind].join(" or ")}`);
  return p;
}

// Deliveries: every finished video goes to "M:/Google/hyperframes/Midnight Videos/MD <n>.mp4" (user's naming rule, 2026-11-22).
// The ledger remembers which source became which MD number, so batch runs can skip what was already delivered.
const OUT = "M:/Google/hyperframes/Midnight Videos", LEDGER = "M:/Google/hyperframes/Midnight-Studio/md-ledger.json";
const ledger = () => (fs.existsSync(LEDGER) ? JSON.parse(fs.readFileSync(LEDGER, "utf8")) : []);
export const delivered = (label) => ledger().find((e) => e.label === label);
export function deliver(src, label) {
  fs.mkdirSync(OUT, { recursive: true });
  const used = [...fs.readdirSync(OUT).map((f) => +(f.match(/^MD (\d+)\b/) || [])[1] || 0), ...ledger().map((e) => e.n || 0)];
  const n = Math.max(17, ...used) + 1, dst = `${OUT}/MD ${n}.mp4`;
  fs.renameSync(src, dst);
  fs.writeFileSync(LEDGER, JSON.stringify([...ledger(), { n, label, date: new Date().toISOString().slice(0, 10) }], null, 1));
  return dst;
}

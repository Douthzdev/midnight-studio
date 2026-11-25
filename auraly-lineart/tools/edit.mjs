// One command for the split-panel talking-head edits.
//   node tools/edit.mjs                -> every avatar with a video in "M:/Google/Claude Ediçoes/hooks" AND ".../bodys" (same name) without a final yet
//   node tools/edit.mjs grant marva    -> just these (rebuilt even if a final exists)
// Steps per avatar: transcribe body (cached) -> silence cut + build (split.mjs) -> check -> render -> loudnorm final -> phone preview.
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { list, locate, deliver, delivered } from "./media.mjs";

const G = "M:/Google", HF = G + "/hyperframes/Midnight-Studio", BASE = HF + "/auraly-split", SRC = BASE + "/src", LINE = HF + "/auraly-lineart";
const env = { ...process.env, PATH: "M:/CLAUDE/tools/ffmpeg/bin;" + process.env.PATH };
for (const k of ["HYPERFRAMES_EXTRACT_CACHE_DIR", "TMPDIR", "TEMP", "TMP"]) env[k] = "M:/CLAUDE/tools/hf-frames";
const run = (cmd, args, cwd = LINE) => {
  const r = spawnSync(cmd, args, { cwd, env, encoding: "utf8", shell: cmd === "npx", maxBuffer: 1 << 26 });
  if (r.status !== 0) throw new Error(`${cmd} ${args.join(" ")} failed:\n${(r.stderr || r.stdout || "").slice(-1500)}`);
  return r.stdout || "";
};
const final = (k) => `${BASE}/${k}-final.mp4`; // temporary; deliver() moves it to "Midnight Videos/MD <n>.mp4"

const bodies = list("body"), all = [...list("hook").keys()].filter((k) => bodies.has(k));
const todo = process.argv.length > 2 ? process.argv.slice(2).map((s) => s.toLowerCase()) : all.filter((k) => !delivered("split-" + k));
if (!todo.length) { console.log("nothing to do (pairs found: " + all.join(", ") + ")"); process.exit(0); }
fs.mkdirSync(SRC, { recursive: true }); fs.mkdirSync(BASE + "/preview", { recursive: true });

for (const k of todo) {
  const t0 = Date.now(), body = locate("body", k);
  const tdir = `${SRC}/t_${k}_body`, wav = `${SRC}/${k}_body.wav`;
  if (!fs.existsSync(tdir + "/transcript.json") || fs.statSync(tdir + "/transcript.json").mtimeMs < fs.statSync(body).mtimeMs) {
    run("ffmpeg", ["-v", "error", "-y", "-i", body, "-ac", "1", "-ar", "16000", wav]);
    run("npx", ["hyperframes", "transcribe", `"${wav}"`, "-d", `"${tdir}"`, "--json"]);
  }
  console.log(run("node", ["tools/split.mjs", k]).trim());
  const P = `${BASE}/${k}`, out = `${BASE}/${k}-render.mp4`;
  const chk = spawnSync("npx", ["hyperframes", "check"], { cwd: P, env, encoding: "utf8", shell: true }).stdout || "";
  if (/✗/.test(chk)) throw new Error(k + ": check failed\n" + chk.split("\n").filter((l) => l.includes("✗")).join("\n"));
  run("npx", ["hyperframes", "render", "--fps", "24", "--crf", "20", "-o", `"${out}"`], P);
  run("ffmpeg", ["-v", "error", "-y", "-i", out, "-c:v", "copy", "-af", "loudnorm=I=-15:TP=-1.5:LRA=11", "-ar", "48000", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", final(k)]);
  run("ffmpeg", ["-v", "error", "-y", "-i", final(k), "-vf", "scale=720:1280", "-c:v", "h264_nvenc", "-b:v", "1500k", "-maxrate", "1800k", "-bufsize", "3000k", "-c:a", "aac", "-b:a", "128k", "-movflags", "+faststart", `${BASE}/preview/${k}.mp4`]);
  const md = deliver(final(k), "split-" + k);
  fs.rmSync(out, { force: true });
  for (const f of ["body.mp4", "hook.mp4"]) fs.rmSync(`${P}/assets/${f}`, { force: true });
  fs.rmSync(`${P}/.hyperframes`, { recursive: true, force: true });
  console.log(`${k}: done in ${((Date.now() - t0) / 60000).toFixed(1)} min -> ${md}`);
}

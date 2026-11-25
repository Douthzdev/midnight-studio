// Builds assets/base.mp4: hook (scaled to 1080x1920@25) + avatar with silences removed.
// usage: node scripts/cut-silences.mjs <hook.mp4> <avatar.mp4> [hookEndSeconds]
import { execFileSync, spawnSync } from "node:child_process";
import { mkdirSync } from "node:fs";

const [hook, avatar, hookEnd = "6"] = process.argv.slice(2);
const PAD = 0.06; // keep a little air so word edges are not clipped

const probe = (f) => Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]).toString());
const { stderr } = spawnSync("ffmpeg", ["-hide_banner", "-i", avatar, "-af", "silencedetect=n=-35dB:d=0.3", "-f", "null", "-"], { encoding: "utf8" });
const starts = [...stderr.matchAll(/silence_start: ([\d.]+)/g)].map((m) => +m[1]);
const ends = [...stderr.matchAll(/silence_end: ([\d.]+)/g)].map((m) => +m[1]);
const dur = probe(avatar);

const keep = [];
let cur = 0;
starts.forEach((s, i) => {
  const e = ends[i] ?? dur;
  if (s > cur) keep.push([cur, Math.min(s + PAD, dur)]);
  cur = Math.max(e - PAD, 0);
});
if (cur < dur) keep.push([cur, dur]);
const segs = keep.filter(([a, b]) => b - a > 0.05);
console.error(`${segs.length} segments, ${segs.reduce((t, [a, b]) => t + b - a, 0).toFixed(2)}s kept of ${dur.toFixed(2)}s`);

const f = [`[0:v]trim=0:${hookEnd},setpts=PTS-STARTPTS,scale=1080:1920:flags=lanczos,fps=25,setsar=1,format=yuv420p[hv];[0:a]atrim=0:${hookEnd},asetpts=PTS-STARTPTS,aresample=48000[ha]`];
segs.forEach(([a, b], i) => {
  f.push(`[1:v]trim=${a}:${b},setpts=PTS-STARTPTS,format=yuv420p[v${i}];[1:a]atrim=${a}:${b},asetpts=PTS-STARTPTS,afade=t=in:d=0.01,afade=t=out:st=${(b - a - 0.01).toFixed(3)}:d=0.01[a${i}]`);
});
f.push(`[hv][ha]${segs.map((_, i) => `[v${i}][a${i}]`).join("")}concat=n=${segs.length + 1}:v=1:a=1[v][a]`);

mkdirSync("assets", { recursive: true });
execFileSync("ffmpeg", ["-y", "-v", "error", "-i", hook, "-i", avatar, "-filter_complex", f.join(";"), "-map", "[v]", "-map", "[a]",
  "-c:v", "libx264", "-crf", "16", "-preset", "medium", "-r", "25", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", "assets/base.mp4"], { stdio: "inherit" });
console.error(`assets/base.mp4 = ${probe("assets/base.mp4").toFixed(2)}s`);

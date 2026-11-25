// usage: node tools/deliver.mjs <finished.mp4> <label>  -> moves it to "Midnight Videos/MD <next>.mp4" and prints the new path
import { deliver } from "./media.mjs";
const [src, label] = process.argv.slice(2);
if (!src || !label) throw new Error("usage: node tools/deliver.mjs <file.mp4> <label>");
console.log(deliver(src, label));

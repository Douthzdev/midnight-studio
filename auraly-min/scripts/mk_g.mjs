// Glass Clean configs for the 2026-11-26 "GPT" batch: 4 standalone talking-head scripts (no b-roll hook)
import fs from "node:fs";
const M = "C:/Users/Vinicius/Music/Songs Auraly UGC/";
const fix = { "twenty": "24", "four": "" };
const C = {
 g_a: { headDur: 3.2, music: M + "Stargazing.mp3", head: ["All your debts paid", "*and money left over*"], fix: {},
  accent: ["debts", "money", "coming", "rice", "yourself", "blessing", "activated", "1111", "111", "stories", "surprise", "hours"],
  pops: [
   { type: "card", at: "money is coming", icon: "money", title: "Money is coming", sub: "a lot, a lot of it", dur: 2.8 },
   { type: "chip", at: "grains of rice", pos: "ml", icon: "sprout", text: "Like *grains of rice*", dur: 2.4 },
   { type: "chip", at: "send this video", icon: "send", text: "Send it to *yourself*", dur: 2.4 },
   { type: "chip", at: "blessing will be activated", pos: "ml", icon: "spark", text: "Blessing *activated*", dur: 2 },
   { type: "comment", at: "Comment", dur: 2.6 },
   { type: "stories", at: "look on my stories", title: "Look at my *stories*", sub: "a surprise · next 24 hours" } ] },
 g_b: { headDur: 3.4, music: M + "Snowfall.mp3", head: ["How much money", "*do you really need?*"], fix: {},
  accent: ["money", "problems?", "comments", "answer", "answer.", "333", "stories"],
  pops: [
   { type: "chip", at: "Let me know", icon: "chat", text: "Tell me in the *comments*", dur: 2.2 },
   { type: "chip", at: "might just have", pos: "ml", icon: "spark", text: "I might have *your answer*", dur: 2 },
   { type: "comment", at: "Comment", dur: 2.4 },
   { type: "stories", at: "check my stories", title: "Check my *stories*", sub: "your answer is there" } ] },
 g_c: { headDur: 2.8, music: M + "Interistelar Theme Piano.mp3", head: ["An ultimatum", "*from the universe*"], fix: {},
  accent: ["ultimatum", "today", "reject", "blessing", "bloodline", "save", "share", "news", "seven", "555", "5555", "claim"],
  pops: [
   { type: "card", at: "Skipping this", icon: "lock", title: "Skip it?", sub: "you reject the blessing", dur: 2.6 },
   { type: "card", at: "biggest financial blessing", pos: "ml", icon: "money", title: "The biggest blessing", sub: "meant for your bloodline", dur: 2.4 },
   { type: "chip", at: "save or share", pos: "ml", icon: "save", text: "Save or *share*", dur: 2 },
   { type: "stats", at: "seven", dur: 3, items: [{ at: "seven", big: "7", small: "minutes", ring: true }] },
   { type: "comment", at: "Type", dur: 2.8 } ] },
 g_d: { headDur: 3.0, music: M + "øneheart x antent - rain inside.mp3", head: ["Your guardian angels", "*are watching right now*"], fix: {},
  accent: ["angels", "staring", "drought", "home", "save", "share", "best", "news", "seven", "777", "7777", "claim"],
  pops: [
   { type: "card", at: "Ignore this", pos: "ml", icon: "eye", title: "Ignore this?", sub: "a drought at home", dur: 2.8 },
   { type: "chip", at: "save and share", pos: "ml", icon: "save", text: "Save & *share*", dur: 2.2 },
   { type: "card", at: "best news", pos: "ml", icon: "bell", title: "The best news", sub: "of your life", dur: 2 },
   { type: "stats", at: "seven minutes", dur: 3, items: [{ at: "seven minutes", big: "7", small: "minutes", ring: true }] },
   { type: "comment", at: "Type", dur: 2.8 } ] },
};
for (const [k, v] of Object.entries(C)) fs.writeFileSync(new URL(k + ".json", import.meta.url), JSON.stringify(v, null, 1));

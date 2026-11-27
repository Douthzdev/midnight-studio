// Glass Clean + colour tones for the 2026-11-27 "pick a card" batch: p1 lottery, p2 name letters, p3 Archangel Michael, p4 tarot hook (pick 1/2) + body.
// tones: gold = abundance/blessings/luck, green = money/good news, red = warnings/scarcity, pink = love. "tones": true also colours caption accent words.
import fs from "node:fs";
const M = "C:/Users/Vinicius/Music/Songs Auraly UGC/";
const chip = (at, icon, text, o = {}) => ({ type: "chip", at, icon, text, dur: 2.4, ...o });
const card = (at, icon, title, sub, o = {}) => ({ type: "card", at, icon, title, sub, dur: 3, ...o });
const seals = (third) => ({ type: "list", at: "Like this video", title: "3 MAGNETIC SEALS", check: true, end: "third seal", tone: "gold", items: [
  { at: "Like this video", icon: "heart", text: "Like · 1st seal" }, { at: "Save this video", icon: "save", text: "Save · 2nd seal" }, { at: third + " this video", icon: "send", text: third + " · 3rd seal" }] });
const money = [ // the shared "scarcity -> frequency" close of p1 / p2 / p4
  card("frequency is still", "chain", "Still in scarcity", "your frequency is off", { tone: "red" }),
  card("money gets close", "money", "Money comes… and goes", "it slips through your fingers", { tone: "red", pos: "ml" }),
];
const lotteryBody = (activator) => [
  chip("seal all these blessings", "lock", "Blessings *sealed*", { pos: "ml", tone: "gold" }),
  chip("The worst is", "sun", "The worst is *behind you*", { tone: "gold" }),
  chip("seen your faith", "eye", "The universe *saw your faith*", { pos: "ml", tone: "gold" }),
  card("unexpected money", "money", "Unexpected money", "landing in your bank account", { tone: "green" }),
  chip("someone very special", "heart", "Someone *special* is coming", { pos: "ml", tone: "pink" }),
  chip("meant for just anyone", "eye", "Not meant for *just anyone*", { pos: "ml", dur: 2.2 }),
  chip("universe has chosen", "spark", "The universe *chose you*", { tone: "gold" }),
  chip("scroll to the next", "arrow", "Don't *scroll* away", { pos: "ml", tone: "red" }),
  card("portal is still open", "portal", "The portal is open", "still open in your life", { tone: "gold" }),
  { type: "stats", at: "33 minutes", pos: "ml", dur: 3.2, tone: "green", items: [{ at: "33 minutes", big: "33", small: "minutes", ring: true }] },
  chip("three magnetic seals", "lock", "Activate *3 magnetic seals*", { tone: "gold" }),
  seals("Share"),
  { type: "comment", at: "comment", text: "222", dur: 3 },
  chip("good news in", "bell", "Good news in *33 minutes*", { tone: "green" }),
  chip("three seals activated", "shield", "All 3 seals *activated*", { pos: "ml", tone: "green", dur: 2.4 }), chip("one detail", "question", "But there's *one detail*", { dur: 2 }),
  ...money,
  chip("work harder", "sun", "No need to *work harder*", { pos: "ml", dur: 2.2 }),
  chip("adjust your frequency", "spark", "Adjust your *frequency*", { tone: "gold" }),
  chip("all by yourself", "heart", "You don't have to do it *alone*", { pos: "ml", dur: 1.9, tone: "none" }),
  card("frequency activator", "bolt", activator, "all you need", { tone: "gold", pos: "ml" }),
  { type: "stories", at: "Tap my profile picture", title: "Tap my *profile picture*", sub: "the activator is in my stories" },
  chip("portal is about to close", "clock", "Your portal is *closing*", { tone: "red" }),
];
const C = {
 p1: { headDur: 2.9, headTone: "gold", music: M + "Stargazing.mp3", tones: true, head: ["You're going to", "*win the lottery*"],
  accent: ["lottery.", "celebration", "careful", "silent", "coincidence", "luckiest", "ready?", "important", "warning.", "wealthy,", "illegal.", "mistake", "blessings.", "worst", "faith.", "money", "special", "chosen", "portal", "33", "seals", "222", "scarcity.", "frequency.", "activator.", "stories.", ],
  pops: [
   card("kind of celebration", "spark", "A celebration", "you'll organize or receive", { tone: "gold" }),
   card("Be very careful", "calendar", "DATES", "if this video found you", { tone: "red", end: "watching it" }),
   chip("Don't tell your friends", "lock", "Tell *no one*", { pos: "ml" }),
   chip("no coincidence", "clock", "Before *December 1st*", { tone: "red" }),
   card("luckiest days", "star", "The luckiest days", "of your entire life", { tone: "gold" }),
   chip("final warning", "bell", "Your *final warning*", { pos: "ml", tone: "red" }),
   card("so wealthy", "money", "So wealthy, so fast", "people will wonder how", { tone: "green" }),
   chip("huge mistake", "arrow", "Don't *skip* this video", { pos: "ml", tone: "red" }),
   chip("immediately share", "send", "Share it with *yourself*", { dur: 2.4 }),
   ...lotteryBody("A frequency activator") ] },
 p2: { headDur: 2.4, headTone: "red", music: M + "Snowfall.mp3", tones: true, head: ["Does your name start", "*with one of these?*"],
  accent: ["careful.", "coincidence.", "warning", "secret", "fast.", "luckiest", "wealthy", "illegal.", "mistake", "end", "blessings", "worst", "faith.", "money", "special", "chosen", "portal", "33", "seals", "222", "scarcity.", "frequency,", "activator.", "stories.", ],
  pops: [
   { type: "letters", at: "letter", title: "YOUR NAME STARTS WITH", letters: ["A", "J", "M", "K", "C", "E", "S", "L", "R", "T", "H"], end: "be very careful", tone: "gold" },
   card("found you before", "calendar", "DATES", "it's not a coincidence", { tone: "red" }),
   chip("final warning", "bell", "Your *final warning*", { pos: "ml", tone: "red" }),
   chip("Keep your mouth shut", "lock", "Keep it *secret*"),
   chip("in your life before", "calendar", "Before *Nov 29*", { pos: "ml", tone: "red", dur: 2.4 }),
   card("Everything you've been asking", "star", "Everything you asked for", "is on its way", { tone: "gold", dur: 2.6 }),
   chip("coming fast", "spark", "It's coming *fast*", { pos: "ml", tone: "gold" }),
   card("luckiest days", "star", "The luckiest days", "of your entire life", { tone: "gold" }),
   card("so wealthy", "money", "So wealthy, so fast", "people will wonder how", { tone: "green", pos: "ml" }),
   chip("huge mistake", "arrow", "Don't *skip* this video", { tone: "red" }),
   chip("watch until the end", "eye", "Watch *until the end*", { pos: "ml" }),
   ...lotteryBody("A frequency activator") ] },
 p3: { headDur: 3.2, headTone: "gold", music: M + "Interistelar Theme Piano.mp3", tones: true, head: ["Archangel Michael", "*has a message for you*"],
  accent: ["Michael", "message", "ready.", "faith,", "turning", "abundance,", "prosperity,", "wonderful", "blessings", "seriously.", "warning.", "victory", "worst", "scarcity,", "Doors", "seven", "abundance", "yourself", "seal.", "believe", "10", "news.", "chapter.", "stories.", "free", "cry", "forever."],
  pops: [
   card("Archangel Michael asked", "wings", "Archangel Michael", "a very important message", { tone: "gold" }),
   chip("get ready", "spark", "Get *ready*", { pos: "ml", tone: "gold", dur: 2 }),
   chip("universe saw your faith", "eye", "The universe *saw your faith*", { tone: "gold", dur: 2.2 }),
   chip("massive turning point", "spark", "A massive *turning point*", { pos: "ml", tone: "gold" }),
   { type: "list", at: "Financial abundance", title: "COMING INTO YOUR LIFE", check: true, end: "unexpectedly", tone: "gold", items: [
     { at: "Financial abundance", icon: "money", text: "Financial abundance" }, { at: "true prosperity", icon: "star", text: "True prosperity" }, { at: "someone incredibly wonderful", icon: "heart", text: "Someone wonderful" }] },
   card("turn your back", "lock", "Turn your back?", "your blessings turn theirs", { tone: "red", pos: "ml" }),
   chip("sent a warning", "bell", "A *warning* from Michael", { tone: "red" }),
   chip("season of victory", "star", "A season of *victory*", { pos: "ml", tone: "gold" }),
   card("chains and scars", "unlock", "The chains are breaking", "no more scarcity", { tone: "green" }),
   chip("Doors that wouldn't open", "door", "Closed doors *open*", { pos: "ml", tone: "green" }),
   { type: "stats", at: "next seven minutes", dur: 3.4, tone: "gold", items: [{ at: "seven minutes", big: "7", small: "minutes", ring: true }] },
   chip("send this video to yourself", "send", "Send it to *yourself*", { pos: "ml" }),
   chip("come back and confirm", "clock", "Come back in *7 minutes*", { tone: "gold", dur: 2.4 }),
   { type: "list", at: "save this video", title: "2 SEALS", check: true, end: "second seal", tone: "gold", items: [
     { at: "save this video", icon: "save", text: "Save · 1st seal" }, { at: "Double tap", icon: "heart", text: "Double tap · 2nd seal" }] },
   { type: "comment", at: "type", text: "I believe", dur: 3.2 },
   card("tomorrow morning", "clock", "Tomorrow · 10 a.m.", "unbelievably good news", { tone: "green" }),
   chip("new chapter", "book", "A *new chapter* begins", { pos: "ml", tone: "gold" }),
   { type: "stories", at: "tap my profile picture", title: "Tap my *profile picture*", sub: "a free card reading is there" },
   card("free card reading", "book", "A free card reading", "starts with a 2-minute test", { tone: "gold" }),
   chip("lot of people cry", "heart", "Many people *cry*", { pos: "tl", tone: "pink" }),
   chip("won't wait for you", "clock", "It won't wait *forever*", { tone: "red" }) ] },
 p4: { hook: 6.0, music: M + "Great Fairy's Fountain.mp3", tones: true, head: ["Pick a card."], pick: { cards: "CARDS", corner: "222" },
  accent: ["important", "scroll", "money", "celebration", "careful.", "silent", "coincidence", "chosen", "luckiest", "worst", "faith.", "rich", "illegal.", "portal", "33", "seals", "222", "scarcity.", "frequency.", "aligner", "stories"],
  pops: [
   { type: "question", at: "Are you ready", text: "Are you *ready?*", dur: 1.6, tone: "gold" },
   chip("extremely important message", "bell", "An *important* message", { pos: "ml" }),
   chip("Don't you dare scroll", "arrow", "Don't *scroll* past this", { tone: "red" }),
   card("large amount of money", "money", "A large amount of money", "and a celebration", { tone: "green", pos: "ml" }),
   card("Be very careful", "calendar", "Nov 28 · 29", "stay completely silent", { tone: "red", end: "watching it" }),
   chip("no coincidence", "spark", "No *coincidence*", { pos: "ml", tone: "gold" }),
   card("luckiest days", "star", "The luckiest days", "of your entire life", { tone: "gold" }),
   chip("worst is finally behind", "sun", "The worst is *behind you*", { pos: "ml", tone: "gold" }),
   chip("seen your faith", "eye", "The universe *saw your faith*", { tone: "gold" }),
   card("so rich", "money", "So rich, so fast", "people will wonder how", { tone: "green" }),
   card("portal has just opened", "portal", "The portal is open", "it just opened in your life", { tone: "gold", pos: "ml" }),
   { type: "stats", at: "33 minutes", dur: 3.2, tone: "green", items: [{ at: "33 minutes", big: "33", small: "minutes", ring: true }] },
   seals("Send"),
   { type: "comment", at: "comment", text: "222", dur: 3 },
   chip("three seals activated", "shield", "All 3 seals *activated*", { pos: "ml", tone: "green", dur: 2.4 }), chip("one detail", "question", "But there's *one detail*", { dur: 2 }),
   ...money,
   chip("almost in your hands", "money", "Almost in your *hands*…", { tone: "red", dur: 2.4 }),
   chip("work harder", "sun", "No need to *work harder*", { pos: "ml", dur: 2.2 }),
   chip("realign your frequency", "spark", "Realign your *frequency*", { tone: "gold" }),
   card("frequency aligner", "bolt", "My frequency aligner", "5 years using it", { tone: "gold", pos: "ml" }),
   chip("helped me manifest", "spark", "It helped me *manifest*", { tone: "gold" }),
   { type: "stories", at: "my profile picture", title: "Tap my *profile picture*", sub: "the aligner is in my stories" } ] },
};
// per-avatar differences (dates said, card tracks): written as p<n>_<avatar>.json
const DATES = { p1: { marva: "Nov 27 · 29 · 30" }, p2: { marva: "Before Nov 29" } };
for (const av of ["marva", "mateo", "selena", "sienna"]) for (const [k, v] of Object.entries(C)) {
  const o = JSON.parse(JSON.stringify(v).replaceAll("CARDS", `scripts/cards_${av}.json`));
  for (const p of o.pops) if (p.title === "DATES") p.title = DATES[k]?.[av] ?? DATES[k]?.marva;
  fs.writeFileSync(new URL(`${k}_${av}.json`, import.meta.url), JSON.stringify(o, null, 1));
}

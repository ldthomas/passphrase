import fs from "fs";

// --- Step 1: load all noun lemmas ---
const nounLines = fs.readFileSync("data/index.noun", "utf8").split("\n");
const nouns = new Set();

for (const line of nounLines) {
  if (!line || line.startsWith(" ")) continue;
  const lemma = line.split(" ")[0];
  nouns.add(lemma.replace(/_/g, " "));
}

// --- Step 2: accumulate tag counts from index.sense ---
const senseLines = fs.readFileSync("data/index.sense", "utf8").split("\n");
const freq = new Map();

for (const line of senseLines) {
  if (!line) continue;

  const [senseKey, , , tagCountStr] = line.split(" ");
  const tagCount = parseInt(tagCountStr, 10);

  const lemma = senseKey.split("%")[0].replace(/_/g, " ");

  if (!nouns.has(lemma)) continue; // only nouns

  freq.set(lemma, (freq.get(lemma) || 0) + tagCount);
}

// --- Step 3: sort nouns by frequency ---
const sorted = [...freq.entries()].sort((a, b) => b[1] - a[1]); // highest tag_count first

// --- Step 4: keep top 6000 (or whatever you want) ---
const top6000 = sorted.slice(0, 6000).map(([lemma]) => lemma);

// Save it
fs.writeFileSync("data/nouns-top6000.txt", top6000.join("\n"));

console.log("Done:", top6000.length, "nouns");

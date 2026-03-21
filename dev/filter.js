// filter-adjectives.js
// Input: wordnet-adjectives.txt (one adjective per line)
// Output: adjectives-filtered.txt

import fs from "fs";

// Input file (change if needed)
const INPUT = "./data/nouns-top6000.txt";
const OUTPUT = "./data/nouns-top6000-3-6.txt";

// Read file
const raw = fs.readFileSync(INPUT, "utf8");

// Split into lines
const words = raw.split(/\r?\n/);

// Apply filters
const filtered = words.filter((word) => {
  if (!word) return false;

  // Remove words with spaces or hyphens
  if (word.includes(" ") || word.includes("-") || word.includes("."))
    return false;

  // Enforce length constraints
  if (word.length < 3) return false;
  if (word.length > 6) return false;

  return true;
});

// Sort and dedupe
const unique = Array.from(new Set(filtered)).sort();

// Write output
fs.writeFileSync(OUTPUT, unique.join("\n"), "utf8");

console.log(`Original count: ${words.length}`);
console.log(`Filtered count: ${unique.length}`);
console.log(`Saved to ${OUTPUT}`);

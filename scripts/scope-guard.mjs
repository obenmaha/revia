// scripts/scope-guard.mjs
import fs from "fs";
import glob from "fast-glob";

const banned = /(cabinet|patient|rdv|facturation|invoice|ordonnance)/i;
const files = await glob(["src/**/*.{ts,tsx,js,jsx}"]);

let bad = [];

for (const f of files) {
  const s = fs.readFileSync(f, "utf8");
  if (banned.test(s)) bad.push(f);
}

if (bad.length) {
  console.error("Forbidden scope terms found:\n" + bad.join("\n"));
  process.exit(1);
}
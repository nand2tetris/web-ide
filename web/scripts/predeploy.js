const fs = require("fs-extra");
const path = require("path");

const scriptDir = path.dirname(__filename);
const buildDir = path.resolve(scriptDir, "..", "build");

fs.ensureDirSync(buildDir);
process.chdir(buildDir);

const folders = [
  "chip",
  "cpu",
  "asm",
  "vm",
  "compiler",
  "bitmap",
  "guide",
  "util",
  "about",
];

for (const folder of folders) {
  fs.ensureDirSync(folder);
  fs.copyFileSync("index.html", path.join(folder, "index.html"));
}

console.log("Predeploy tasks completed.");

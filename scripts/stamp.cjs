#!/usr/bin/env node

const fs = require("fs");

function compareVersions(current, next) {
  if (current < next) {
    return next;
  }

  const [year, week, rev] = current.split(".").map(Number);
  return `${year}.${week}.${rev + 1}`;
}

function getNextBaseVersion(date = new Date()) {
  const start = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const now = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
  const days = Math.floor((now - start) / 86400000);
  const week = Math.floor(days / 7);

  return `${date.getUTCFullYear()}.${String(week).padStart(2, "0")}.0`;
}

function updateMetaVersion(path, current, version) {
  const contents = fs.readFileSync(path, "utf8");
  const pattern = /<meta name="version" content="[^"]*" \/>/; 
  const updated = contents.replace(pattern, (meta) => meta.replace(current, version));
  fs.writeFileSync(path, updated);
}

function main() {
  const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
  const current = pkg.version;
  const next = getNextBaseVersion();
  const version = compareVersions(current, next);

  updateMetaVersion("web/index.html", current, version);

  console.log(`${version}`);
}

main();

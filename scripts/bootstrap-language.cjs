#!/usr/bin/env node
// Keep the source dependency outside this checkout, as web/package.json specifies.
const { execFileSync } = require("node:child_process");
const { existsSync, lstatSync, readlinkSync, symlinkSync } = require("node:fs");
const path = require("node:path");

const project = path.resolve(__dirname, "..");
const companion = path.resolve(project, "../ohm");
const revision = "8f82747b5fa9b1e8fa0b911556f693ffe8eb98b5";
const engine = "d1f1f64cde7fc02fa9bdfb0e01bcd8833b45a100";
const run = (command, args, cwd = project) =>
  execFileSync(command, args, { cwd, stdio: "inherit" });
const git = (...args) => execFileSync("git", args, { cwd: companion, encoding: "utf8" }).trim();

if (!existsSync(companion)) {
  run("git", ["clone", "--no-checkout", "https://github.com/davidsouther/ohm.git", companion]);
  run("git", ["checkout", "--detach", revision], companion);
}
if (git("rev-parse", "HEAD") !== revision || git("status", "--porcelain", "--untracked-files=no")) {
  throw new Error(`Expected a clean companion at ${revision}: ${companion}. Existing checkouts are never reset.`);
}
const manifest = require(path.join(project, "package.json"));
if (manifest.devDependencies["ohm-js"] !== `github:davidsouther/ohm#${engine}`) {
  throw new Error("The application engine pin differs from the reviewed revision.");
}

const dependencies = path.join(companion, "node_modules");
const projectDependencies = path.join(project, "node_modules");
const installed = lstatSync(dependencies, { throwIfNoEntry: false });
if (installed && (!installed.isSymbolicLink() || path.resolve(companion, readlinkSync(dependencies)) !== projectDependencies)) {
  throw new Error(`Refusing to replace existing companion dependencies: ${dependencies}. Use an isolated sibling layout for this checkout.`);
}
run("npm", ["ci"]);
if (!installed) symlinkSync(projectDependencies, dependencies, "dir");
run("npm", ["run", "build", "--prefix", path.join(companion, "packages/language")]);
console.log(`Prepared @ohm-js/language ${revision} with ohm-js ${engine}.`);

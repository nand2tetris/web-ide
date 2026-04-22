#!/usr/bin/env node
// Verify that the modernize migration (Phases 1–4) is complete.
// Run: node scripts/verify-modernize.mjs
// This script currently FAILS because the migration has not been performed.

import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
let failures = 0;

function pass(msg) {
  console.log(`  PASS  ${msg}`);
}
function fail(msg) {
  console.error(`  FAIL  ${msg}`);
  failures++;
}
function check(cond, msg) {
  cond ? pass(msg) : fail(msg);
}

function readPkg(name) {
  return JSON.parse(readFileSync(join(ROOT, name, "package.json"), "utf8"));
}

function readTsconfig(dir, file = "tsconfig.json") {
  const path = join(ROOT, dir, file);
  if (!existsSync(path)) return {};
  const raw = readFileSync(path, "utf8").replace(/\/\/[^\n]*/g, "").replace(/,(\s*[}\]])/g, "$1");
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

const ALL_PACKAGES = ["simulator", "cli", "components", "web", "runner", "projects", "extension"];

const FORBIDDEN_DEPS = [
  "react-scripts",
  "babel-jest",
  "@babel/preset-typescript",
  "raw-loader",
  "raw.macro",
  "identity-obj-proxy",
  "jest-ts-webcompat-resolver",
  "@types/jest",
];

// Phase 1+2+3+4: No legacy deps in any package
console.log("\n=== Forbidden dependencies ===");
for (const name of ALL_PACKAGES) {
  const p = readPkg(name);
  const allDeps = { ...p.dependencies, ...p.devDependencies };
  for (const dep of FORBIDDEN_DEPS) {
    check(!allDeps[dep], `${name}: no ${dep}`);
  }
  check(!p.jest, `${name}: no jest config block in package.json`);
}

// Phase 1: No misplaced deps in web and extension
console.log("\n=== Misplaced deps removed ===");
{
  const webP = readPkg("web");
  const webD = { ...webP.dependencies, ...webP.devDependencies };
  check(!webD["@types/vscode"], "web: no @types/vscode");
  check(!webD["@vscode/vsce"], "web: no @vscode/vsce");
  check(!webD["gh-pages"], "web: no gh-pages (moved to extension)");

  const extP = readPkg("extension");
  const extD = { ...extP.dependencies, ...extP.devDependencies };
  check(!extD["react-scripts"], "extension: no react-scripts");
}

// Phase 1: tsconfig — no moduleResolution: "node" or baseUrl
console.log("\n=== tsconfig: no deprecated settings ===");
for (const name of ALL_PACKAGES) {
  const tc = readTsconfig(name);
  const co = tc.compilerOptions ?? {};
  check(co.moduleResolution !== "node", `${name}: moduleResolution != "node"`);
  check(!co.baseUrl, `${name}: no baseUrl`);
}
{
  const base = readTsconfig(".", "tsconfig.base.json");
  const co = base.compilerOptions ?? {};
  check(co.moduleResolution !== "node", "tsconfig.base.json: moduleResolution != \"node\"");
  check(!co.allowSyntheticDefaultImports, "tsconfig.base.json: no allowSyntheticDefaultImports");
}

// Phase 3+4: Bundler packages have moduleResolution: "bundler" and vite.config.ts
console.log("\n=== Bundler packages use Vite ===");
for (const name of ["components", "web"]) {
  check(existsSync(join(ROOT, name, "vite.config.ts")), `${name}: has vite.config.ts`);
  const tc = readTsconfig(name);
  const co = tc.compilerOptions ?? {};
  check(co.moduleResolution === "bundler", `${name}: moduleResolution = "bundler"`);
}

// Phase 4: Lingui v5
console.log("\n=== Lingui v5 ===");
{
  const webP = readPkg("web");
  const webD = { ...webP.dependencies, ...webP.devDependencies };
  const v = webD["@lingui/react"] ?? "(missing)";
  check(/^\^?5\./.test(v), `web: @lingui/react is v5 (found: ${v})`);
  check(!webD["web-vitals"], "web: no unused web-vitals");
}

// CI suite — these must all exit 0
console.log("\n=== CI commands ===");
for (const cmd of ["npm run check", "npm test", "npm run build"]) {
  try {
    execSync(cmd, { cwd: ROOT, stdio: "inherit" });
    pass(cmd);
  } catch {
    fail(`${cmd} exited non-zero`);
  }
}

console.log(
  `\n${failures === 0 ? "✓ ALL CHECKS PASSED — migration complete" : `✗ ${failures} check(s) FAILED — migration incomplete`}`,
);
if (failures > 0) process.exit(1);

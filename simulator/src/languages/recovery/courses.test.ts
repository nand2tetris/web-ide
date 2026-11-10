import * as full from "@nand2tetris/projects/full.js";
import * as samples from "@nand2tetris/projects/samples/index.js";
import * as testing from "@nand2tetris/projects/testing/index.js";
import { expect, it } from "vitest";

import { isValid, type Outcome, type ParseOptions } from "../base.js";
import { rawCMP } from "../cmp.js";
import { describeDiagnostic } from "../diagnostic.js";
import { TST } from "../tst.js";

interface Language {
  parse: (source: string, options?: ParseOptions) => Outcome<unknown>;
}

const LANGUAGES: Record<string, Language> = {
  tst: TST,
  cmp: rawCMP,
  out: rawCMP,
};

function courseFiles(): Map<string, string> {
  const files = new Map<string, string>();
  const seen = new Set<unknown>();
  const walk = (value: unknown, path: string) => {
    if (typeof value !== "object" || value === null || seen.has(value)) return;
    seen.add(value);
    for (const [key, child] of Object.entries(value)) {
      if (typeof child === "string" && /\.(tst|cmp|out)$/.test(key)) {
        files.set(`${path}/${key}`, child);
      } else {
        walk(child, `${path}/${key}`);
      }
    }
  };
  walk(full, "full");
  walk(testing, "testing");
  walk(samples, "samples");
  return files;
}

const extension = (name: string) => name.slice(name.lastIndexOf(".") + 1);

const RECOVER = { attemptRecovery: true };

it("recovery accepts the valid TST, CMP and OUT course corpus", () => {
  const files = courseFiles();
  expect(files.size).toBeGreaterThan(0);
  for (const [name, source] of files) {
    expect(
      LANGUAGES[extension(name)].parse(source, RECOVER).diagnostics,
      name,
    ).toEqual([]);
  }
});

it.each([
  ["a malformed command", TST, "set in,\neval;"],
  ["a missing final block join", TST, "repeat 2 { tick;"],
  ["a malformed table row", rawCMP, "| in | out |\nxyz\n"],
] as [string, Language, string][])(
  "recovery preserves the strict first error for %s",
  (_name, language, source) => {
    const strict = language.parse(source);
    const recovering = language.parse(source, RECOVER);
    if (isValid(strict) || isValid(recovering))
      throw new Error("malformed source parsed without diagnostics");
    expect(describeDiagnostic(recovering.diagnostics[0])).toBe(
      describeDiagnostic(strict.diagnostics[0]),
    );
    expect(recovering.diagnostics[0].span?.line).toBe(
      strict.diagnostics[0].span?.line,
    );
  },
);

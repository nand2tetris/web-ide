import { unwrap } from "@davidsouther/jiffies/result.ts";
import { Programs } from "@nand2tetris/projects/samples/project_11/index.js";
import { describe, expect, it } from "vitest";
import { validOf } from "./base.js";
import { describeDiagnostic } from "./diagnostic.js";
import { JACK } from "./jack.js";

describe("jack language", () => {
  it.each([false, true])(
    "suggests a misspelled subroutine keyword with recovery %s",
    (attemptRecovery) => {
      const source = "class Main {\n  fucntion void main() { return; }\n}";
      const diagnostics = JACK.parse(source, {
        attemptRecovery,
      }).diagnostics.map((diagnostic) => describeDiagnostic(diagnostic));
      expect(diagnostics).toContain(
        "Line 2: unknown fucntion; did you mean function?",
      );
    },
  );
  describe.each([undefined, { attemptRecovery: true }])(
    "recovery %j",
    (options) => {
      describe.each(Object.keys(Programs))("Program %s", (program) => {
        it.each(Object.keys(Programs[program]))("File %s", (filename) => {
          const parsed = validOf(
            JACK.parse(Programs[program][filename].jack, options),
          );
          expect(parsed).toBeOk();
          expect(unwrap(parsed)).toEqual(Programs[program][filename].parsed);
        });
      });
    },
  );
});

import {
  article,
  code,
  details,
  div,
  header,
  p,
  pre,
  summary,
} from "@davidsouther/jiffies/dom/html.js";
import {
  execute,
  flattenResults,
} from "@davidsouther/jiffies/scope/execute.js";
import { TestResult } from "@davidsouther/jiffies/scope/scope.js";
import { onConsole } from "@davidsouther/jiffies/scope/display/console.js";
import { getTotalCases } from "@davidsouther/jiffies/scope/describe.js";
import { display } from "@davidsouther/jiffies/display.js";

import "../util/asm.test.js";
import "../util/twos.test.js";
import "../languages/test.js";
import "../languages/parser/test.js";
import "../simulator/chip/chip.test.js";
import "../simulator/chip/builder.test.js";
import "../simulator/cpu/alu.test.js";
import "../simulator/cpu/cpu.test.js";
import "../simulator/compare.test.js";
import "../simulator/output.test.js";
import "../simulator/tst.test.js";

function displayStatistics(results: TestResult, root: Element) {
  const { executed, failed } = results;
  root.appendChild(
    div(`Executed ${executed} of ${getTotalCases()}; ${failed} failed.`)
  );

  const flat = flattenResults(results);
  for (const { test, stack } of flat) {
    if (stack) {
      root.appendChild(
        details(
          summary(code({ style: { width: "calc(100% - 1.5rem)" } }, test)),
          pre(code(display(stack)))
        )
      );
    }
  }
}

export const Test = () => {
  const root = article(header("Tests"));
  (async function test() {
    const results = await execute();
    displayStatistics(results, root);
    onConsole(results);
  })();
  return root;
};

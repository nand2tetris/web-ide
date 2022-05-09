import { article, header } from "@davidsouther/jiffies/dom/html.js";
import { execute } from "@davidsouther/jiffies/scope/execute.js";
import { displayStatistics } from "@davidsouther/jiffies/scope/display/dom.js";
import { onConsole } from "@davidsouther/jiffies/scope/display/console.js";

import "../util/asm.test.js";
import "../util/twos.test.js";
import "../languages/test.js";
import "../languages/parser/test.js";
import "../simulator/chip/chip.test.js";
import "../simulator/chip/busses.test.js";
import "../simulator/cpu/alu.test.js";
import "../simulator/cpu/cpu.test.js";
import "../simulator/output.test.js";
import "../simulator/tst.test.js";

export const Test = () => {
  const root = article(header("Tests"));
  (async function test() {
    const results = await execute();
    displayStatistics(results, root);
    onConsole(results);
  })();
  return root;
};

import { article, header } from "@jefri/jiffies/dom/html.js";
import { execute } from "@jefri/jiffies/scope/execute.js";
import { displayStatistics } from "@jefri/jiffies/scope/display/dom.js";
import { onConsole } from "@jefri/jiffies/scope/display/console.js";

import "../util/twos.test.js";
import "../util/asm.test.js";
import "../simulator/chip/chip.test.js";
import "../simulator/cpu/alu.test.js";
import "../simulator/cpu/cpu.test.js";

export const Test = () => {
  const root = article(header("Tests"));
  (async function test() {
    const results = await execute();
    displayStatistics(results, root);
    onConsole(results);
  })();
  return root;
};

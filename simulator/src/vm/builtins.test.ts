import { unwrap } from "@davidsouther/jiffies/lib/esm/result.js";
import { Vm } from "./vm.js";

describe("builtins", () => {
  describe("Math", () => {
    test("multiply", () => {
      const vm = unwrap(
        Vm.build([
          { op: "push", segment: "constant", offset: 7 },
          { op: "push", segment: "constant", offset: 8 },
          { op: "call", name: "Math.multiply", nArgs: 2 },
        ])
      );

      vm.step();
      vm.step();
      vm.step();
      expect(vm.read([0, 256])).toEqual([257, 56]);
    });
  });
});

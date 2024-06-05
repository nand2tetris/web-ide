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
        ]),
      );

      vm.step();
      vm.step();
      vm.step();
      expect(vm.read([0, 256])).toEqual([257, 56]);
    });
    test("divide", () => {
      const vm = unwrap(
        Vm.build([
          { op: "push", segment: "constant", offset: 10 },
          { op: "push", segment: "constant", offset: 5 },
          { op: "call", name: "Math.divide", nArgs: 2 },
        ]),
      );

      vm.step();
      vm.step();
      vm.step();
      expect(vm.read([0, 256])).toEqual([257, 2]);
    });
    test("min", () => {
      const vm = unwrap(
        Vm.build([
          { op: "push", segment: "constant", offset: 11 },
          { op: "push", segment: "constant", offset: 4 },
          { op: "call", name: "Math.min", nArgs: 2 },
        ]),
      );

      vm.step();
      vm.step();
      vm.step();
      expect(vm.read([0, 256])).toEqual([257, 4]);
    });
    test("max", () => {
      const vm = unwrap(
        Vm.build([
          { op: "push", segment: "constant", offset: 11 },
          { op: "push", segment: "constant", offset: 4 },
          { op: "call", name: "Math.max", nArgs: 2 },
        ]),
      );

      vm.step();
      vm.step();
      vm.step();
      expect(vm.read([0, 256])).toEqual([257, 11]);
    });
    test("sqrt", () => {
      const vm = unwrap(
        Vm.build([
          { op: "push", segment: "constant", offset: 36 },
          { op: "call", name: "Math.sqrt", nArgs: 1 },
        ]),
      );

      vm.step();
      vm.step();
      expect(vm.read([0, 256])).toEqual([257, 6]);
    });
  });
});

import { unwrap } from "@davidsouther/jiffies/result.ts";
import { describe, expect, test } from "vitest";
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
    test.each([
      [100, 7, 14],
      [-100, 7, -14],
      [100, -7, -14],
      [-100, -7, 14],
      [-7, 2, -3],
      [50, -7, -7],
      [-6, 3, -2],
    ])("divide %i / %i truncates toward zero", (x, y, expected) => {
      const push = (value: number) => [
        { op: "push", segment: "constant", offset: Math.abs(value) } as const,
        ...(value < 0 ? [{ op: "neg" } as const] : []),
      ];
      const vm = unwrap(
        Vm.build([
          ...push(x),
          ...push(y),
          { op: "call", name: "Math.divide", nArgs: 2 },
        ]),
      );

      const steps = 3 + (x < 0 ? 1 : 0) + (y < 0 ? 1 : 0);
      for (let i = 0; i < steps; i++) vm.step();
      const [sp, result] = vm.read([0, 256]);
      expect(sp).toBe(257);
      expect(result & 0xffff).toBe(expected & 0xffff);
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

import {
  FileSystem,
  ObjectFileSystemAdapter,
} from "@davidsouther/jiffies/fs.ts";
import { CMP } from "@nand2tetris/simulator/languages/cmp.js";
import { afterEach, expect, it, vi } from "vitest";
import { makeChipStore } from "./chip.store.js";
import { makeCpuStore } from "./cpu.store.js";
import { comparisonStatus, statusActions } from "./status.js";
import { makeVmStore } from "./vm.store.js";

const table = "| a |\nxyz\nuvw\n";
afterEach(() => vi.restoreAllMocks());

it.each([undefined, false, true])(
  "comparison status uses recovery %s",
  (attemptRecovery) => {
    const status = comparisonStatus(table, "", { attemptRecovery });
    expect(status.heading?.count).toBe(attemptRecovery === true ? 2 : 1);
  },
);

it("every test store forwards its current comparison recovery value", () => {
  const parsed = vi.spyOn(CMP, "parse");
  const fs = new FileSystem(new ObjectFileSystemAdapter({}));
  const status = statusActions(vi.fn());
  let recovery = false;
  const chip = makeChipStore(
    fs,
    status,
    {},
    { current: vi.fn() },
    false,
    () => recovery,
  );
  const cpu = makeCpuStore(
    fs,
    status,
    {},
    { current: vi.fn() },
    () => recovery,
  );
  const vm = makeVmStore(fs, status, {}, { current: vi.fn() }, () => recovery);
  chip.initialState.files.cmp = table;
  cpu.initialState.test.cmp = table;
  vm.initialState.files.cmp = table;

  for (const enabled of [false, true]) {
    recovery = enabled;
    chip.reducers.testFinished(chip.initialState);
    cpu.reducers.testFinished(cpu.initialState);
    vm.reducers.testFinished(vm.initialState);
    expect(parsed.mock.calls.slice(-3).map(([, options]) => options)).toEqual([
      { attemptRecovery: enabled },
      { attemptRecovery: enabled },
      { attemptRecovery: enabled },
    ]);
  }
});

import {
  FileSystem,
  ObjectFileSystemAdapter,
} from "@davidsouther/jiffies/fs.ts";
import {
  DiagnosticCode,
  describeDiagnostic,
} from "@nand2tetris/simulator/languages/diagnostic.js";
import { describe, expect, it, vi } from "vitest";
import { statusActions } from "./status.js";
import { makeVmStore, VmStoreDispatch } from "./vm.store.js";

describe("test script diagnostics", () => {
  it("lists a block correction and the missing load, with only syntax when recovery is off", () => {
    let recovery = true;
    const setStatus = vi.fn();
    const { actions } = makeVmStore(
      new FileSystem(new ObjectFileSystemAdapter({})),
      statusActions(setStatus),
      {},
      { current: vi.fn() as unknown as VmStoreDispatch },
      () => recovery,
    );

    expect(actions.loadTest("/proj/T.tst", "repeat 1 { vmstep; ? }")).toBe(
      false,
    );
    expect(setStatus).toHaveBeenLastCalledWith({
      severity: "ERROR",
      heading: { source: "tst", count: 2, semantic: 1 },
      diagnostics: [
        {
          diagnostic: expect.objectContaining({
            code: DiagnosticCode.Syntax.EXPECTED,
          }),
        },
        {
          diagnostic: expect.objectContaining({
            code: DiagnosticCode.Tst.MISSING_LOAD,
          }),
        },
      ],
    });

    recovery = false;
    actions.loadTest("/proj/T.tst", "repeat 1 { vmstep; ? }");
    expect(setStatus).toHaveBeenLastCalledWith({
      severity: "ERROR",
      heading: { source: "tst", count: 1 },
      diagnostics: [
        {
          diagnostic: expect.objectContaining({
            code: DiagnosticCode.Syntax.EXPECTED,
            args: { expected: expect.arrayContaining(['"}"']) },
          }),
        },
      ],
    });
  });
});

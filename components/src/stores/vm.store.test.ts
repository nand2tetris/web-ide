import {
  FileSystem,
  ObjectFileSystemAdapter,
} from "@davidsouther/jiffies/fs.ts";
import { describeEnglish } from "@nand2tetris/simulator/languages/base.js";
import { produce } from "immer";
import { describe, expect, it, vi } from "vitest";
import { makeVmStore, VmStoreDispatch } from "./vm.store.js";

function mk(attemptRecovery?: () => boolean) {
  const fs = new FileSystem(new ObjectFileSystemAdapter({}));
  const dispatch = { current: vi.fn() as unknown as VmStoreDispatch };
  const setStatus = vi.fn();
  const { initialState, actions, reducers } = makeVmStore(
    fs,
    setStatus,
    {},
    dispatch,
    attemptRecovery,
  );
  const store = { state: initialState, actions, setStatus };
  dispatch.current = ((c: {
    action: keyof typeof reducers;
    payload: never;
  }) => {
    store.state = produce(store.state, (draft: typeof initialState) => {
      reducers[c.action](draft, c.payload);
    });
  }) as unknown as VmStoreDispatch;
  return store;
}

const lines = (...l: string[]) => l.join("\n");

// Line 2 is a syntax error; line 4 redeclares the label of line 3.
const TWO_MISTAKES = lines(
  "function Main.main 0",
  "push nowhere 1",
  "label A",
  "label A",
  "return",
);

describe("compiling a single VM buffer", () => {
  it("lists a syntax and a label diagnostic together, the earliest in the status", () => {
    const s = mk();
    s.actions.setVm(TWO_MISTAKES);
    expect(s.state.controls.diagnostics.map(({ span }) => span?.line)).toEqual([
      2, 4,
    ]);
    expect(s.state.controls.valid).toBe(false);
    expect(s.setStatus).toHaveBeenLastCalledWith({
      severity: "ERROR",
      heading: { file: "VM code", count: 2 },
      diagnostics: [{ diagnostic: s.state.controls.diagnostics[0] }],
    });
    expect(s.state.controls.diagnostics[0].span?.line).toBe(2);
  });

  it("accepts a valid function whose class is not the buffer's name", () => {
    const s = mk();
    s.actions.setVm("function Foo.bar 0\npush constant 1\nreturn\n");
    expect(s.state.controls.diagnostics).toEqual([]);
    expect(s.state.controls.valid).toBe(true);
  });

  it("recovers while Attempt Recovery is on, and recompiles when it changes", () => {
    let recovery = true;
    const s = mk(() => recovery);
    s.actions.setVm(TWO_MISTAKES);
    expect(s.state.controls.diagnostics).toHaveLength(2);

    recovery = false;
    s.actions.recompile();

    expect(s.state.controls.diagnostics).toHaveLength(1);
    expect(s.setStatus).toHaveBeenLastCalledWith({
      severity: "ERROR",
      heading: { file: "VM code", count: 1 },
      diagnostics: [{ diagnostic: s.state.controls.diagnostics[0] }],
    });
  });
});

describe("loading several VM files", () => {
  const FILES = [
    { name: "Sys", content: "function Sys.init 0\nreturn\n" },
    { name: "Main", content: "function Main.main 0\ngoto END\nreturn" },
  ];

  it("shows each diagnostic where the joined buffer holds it", () => {
    const s = mk();
    s.actions.loadVm(FILES);
    const [diagnostic, ...rest] = s.state.controls.diagnostics;
    expect(rest).toEqual([]);
    // Sys is 27 characters and 2 newlines; Main's goto is its local line 2.
    expect(diagnostic.span).toEqual({ start: 28 + 21, end: 28 + 29, line: 5 });
    expect(diagnostic).toMatchObject({
      code: "vm.undeclaredLabel",
      args: { label: "END" },
    });
    expect(describeEnglish(diagnostic)).toBe("Line 5: Undeclared label END");
    expect(s.state.files.vm.split("\n")[4]).toBe("goto END");
  });

  it("still checks a function's class against its file's name", () => {
    const s = mk();
    s.actions.loadVm([{ name: "Other", content: FILES[0].content }]);
    expect(s.state.controls.diagnostics[0]).toMatchObject({
      code: "vm.fileNameMismatch",
      args: { file: "Other", className: "Sys" },
    });
  });
});

describe("test script diagnostics", () => {
  it("lists a block correction and the missing load, with only syntax when recovery is off", () => {
    let recovery = true;
    const s = mk(() => recovery);

    expect(s.actions.loadTest("/proj/T.tst", "repeat 1 { vmstep; ? }")).toBe(
      false,
    );
    expect(s.setStatus).toHaveBeenLastCalledWith({
      severity: "ERROR",
      heading: { file: "Test script", count: 2 },
      diagnostics: [
        { diagnostic: expect.objectContaining({ code: "syntax.expected" }) },
        { diagnostic: expect.objectContaining({ code: "tst.missingLoad" }) },
      ],
    });

    recovery = false;
    s.actions.loadTest("/proj/T.tst", "repeat 1 { vmstep; ? }");
    expect(s.setStatus).toHaveBeenLastCalledWith({
      severity: "ERROR",
      heading: { file: "Test script", count: 1 },
      diagnostics: [
        {
          diagnostic: expect.objectContaining({
            code: "syntax.expected",
            args: { expected: expect.arrayContaining(['"}"']) },
          }),
        },
      ],
    });
  });
});

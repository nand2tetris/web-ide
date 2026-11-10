import {
  FileSystem,
  ObjectFileSystemAdapter,
} from "@davidsouther/jiffies/fs.ts";
import {
  DiagnosticCode,
  describeDiagnostic,
} from "@nand2tetris/simulator/languages/diagnostic.js";
import { produce } from "immer";
import { describe, expect, it, vi } from "vitest";
import { statusActions } from "./status.js";
import { makeVmStore, VmStoreDispatch } from "./vm.store.js";

function mk(attemptRecovery: () => boolean = () => true) {
  const fs = new FileSystem(new ObjectFileSystemAdapter({}));
  const dispatch = { current: vi.fn() as unknown as VmStoreDispatch };
  const setStatus = vi.fn();
  const { initialState, actions, reducers } = makeVmStore(
    fs,
    statusActions(setStatus),
    {},
    dispatch,
    attemptRecovery,
  );
  const store = { state: initialState, actions, setStatus, fs };
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
      heading: { source: "vm", count: 2, semantic: 1 },
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

  it("checks a named-file request after the identical single buffer and retains it for recompile", () => {
    const s = mk();
    const content = "function Foo.bar 0\npush constant 1\nreturn\n";
    expect(s.actions.setVm(content)).toBe(true);

    expect(s.actions.loadVm([{ name: "Other.vm", content }])).toBe(false);
    expect(s.state.controls.diagnostics[0]).toMatchObject({
      code: DiagnosticCode.Vm.FILE_NAME_MISMATCH,
      args: { file: "Other.vm", className: "Foo" },
    });
    s.actions.recompile();
    expect(s.state.controls.valid).toBe(false);
    expect(s.state.controls.diagnostics[0].code).toBe(
      DiagnosticCode.Vm.FILE_NAME_MISMATCH,
    );
    expect(s.actions.setVm(content)).toBe(true);
    expect(s.state.controls.valid).toBe(true);
    expect(s.actions.setVm(content)).toBe(true);
  });

  it("checks unchanged text with the current recovery setting", () => {
    let recovery = true;
    const s = mk(() => recovery);
    expect(s.actions.setVm(TWO_MISTAKES)).toBe(false);
    expect(s.state.controls.diagnostics).toHaveLength(2);

    recovery = false;
    expect(s.actions.setVm(TWO_MISTAKES)).toBe(false);
    expect(s.state.controls.diagnostics).toHaveLength(1);
    expect(s.actions.setVm(TWO_MISTAKES)).toBe(false);
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
      heading: { source: "vm", count: 1 },
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
      code: DiagnosticCode.Vm.UNDECLARED_LABEL,
      args: { label: "END" },
    });
    expect(describeDiagnostic(diagnostic)).toBe("Line 5: Undeclared label END");
    expect(s.state.files.vm.split("\n")[4]).toBe("goto END");
  });

  it("checks changed filenames and file boundaries even when the joined text is unchanged", () => {
    const s = mk();
    const header = "function Foo.bar 0";
    const body = "push constant 1\nreturn\n";
    const content = `${header}\n${body}`;
    expect(s.actions.loadVm([{ name: "Foo.vm", content }])).toBe(true);
    expect(s.actions.loadVm([{ name: "Other.vm", content }])).toBe(false);
    expect(s.state.controls.diagnostics[0].code).toBe(
      DiagnosticCode.Vm.FILE_NAME_MISMATCH,
    );
    expect(
      s.actions.loadVm([
        { name: "Foo.vm", content: header },
        { name: "Foo.vm", content: body },
      ]),
    ).toBe(false);
    expect(s.state.files.vm).toBe(content);
    expect(s.state.controls.diagnostics[0].code).toBe(
      DiagnosticCode.Vm.DUPLICATE_FILE,
    );
  });

  it("checks file order when equal contents keep the joined text unchanged", () => {
    const s = mk();
    const content = "function Foo.bar 0\nreturn\n";
    s.actions.loadVm([
      { name: "Foo.vm", content },
      { name: "Other.vm", content },
    ]);
    const mismatch = () =>
      s.state.controls.diagnostics.find(
        ({ code }) => code === DiagnosticCode.Vm.FILE_NAME_MISMATCH,
      );
    expect(mismatch()?.span?.line).toBe(4);

    s.actions.loadVm([
      { name: "Other.vm", content },
      { name: "Foo.vm", content },
    ]);
    expect(mismatch()?.span?.line).toBe(1);
  });

  it("keeps failed filesystem loads invalid and retains their diagnostic status", async () => {
    const s = mk();
    expect(
      s.actions.loadVm([
        {
          name: "Main.vm",
          content: "function Main.main 0\npush constant 7\nreturn\n",
        },
      ]),
    ).toBe(true);
    s.actions.step();
    s.actions.step();
    const previousProgram = s.state.vm.Prog;
    const stackPointer = s.state.vm.RAM.get(0);
    await s.fs.writeFile("/Main.vm", TWO_MISTAKES);

    await s.actions.load("/Main.vm");

    expect(s.state.controls.valid).toBe(false);
    expect(s.state.controls.diagnostics).toHaveLength(2);
    expect(s.setStatus).toHaveBeenLastCalledWith(
      expect.objectContaining({
        severity: "ERROR",
        heading: { source: "vm", count: 2, semantic: 1 },
      }),
    );
    expect(s.state.vm.Prog).toBe(previousProgram);
    expect(s.state.vm.RAM.get(0)).toBe(stackPointer);
  });

  it("keeps the intentional bare-load route for valid uploaded files", async () => {
    const s = mk();
    expect(s.actions.loadVm([FILES[0]])).toBe(true);
    await expect(s.actions.load("")).resolves.toBeUndefined();
    expect(s.state.controls.valid).toBe(true);
    expect(s.state.controls.diagnostics).toEqual([]);
  });

  it("still checks a function's class against its file's name", () => {
    const s = mk();
    s.actions.loadVm([{ name: "Other", content: FILES[0].content }]);
    expect(s.state.controls.diagnostics[0]).toMatchObject({
      code: DiagnosticCode.Vm.FILE_NAME_MISMATCH,
      args: { file: "Other", className: "Sys" },
    });
  });
});

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

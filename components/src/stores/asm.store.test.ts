import {
  FileSystem,
  ObjectFileSystemAdapter,
} from "@davidsouther/jiffies/fs.ts";
import { produce } from "immer";
import { describe, expect, it, vi } from "vitest";
import { AsmStoreDispatch, makeAsmStore } from "./asm.store.js";

function mk(attemptRecovery?: () => boolean) {
  const fs = new FileSystem(new ObjectFileSystemAdapter({}));
  const dispatch = { current: vi.fn() as unknown as AsmStoreDispatch };
  const setStatus = vi.fn();
  const { initialState, reducers, actions } = makeAsmStore(
    fs,
    setStatus,
    dispatch,
    false,
    attemptRecovery,
  );
  const store = { state: initialState, actions, fs, setStatus };
  dispatch.current = ((c: {
    action: keyof typeof reducers;
    payload: unknown;
  }) => {
    store.state = produce(store.state, (d: typeof initialState) => {
      reducers[c.action].call(reducers, d, c.payload as never);
    });
  }) as AsmStoreDispatch;
  return store;
}

const TWO_MISTAKES = "(A)\n@1\nD=Q\n(A)\n";

describe("compiling asm source", () => {
  it("counts the syntax errors of ASM code that does not parse", () => {
    const s = mk();
    s.actions.compileAsm("@@");
    expect(s.state.diagnostics).toHaveLength(1);
    expect(s.setStatus).toHaveBeenLastCalledWith({
      severity: "ERROR",
      heading: { file: "ASM code", count: 1 },
      diagnostics: [{ diagnostic: s.state.diagnostics[0] }],
    });
    expect(s.state.diagnostics[0].span?.line).toBe(1);
  });

  it("lists a syntax and a label diagnostic together, the earliest in the status", () => {
    const s = mk();
    s.actions.compileAsm(TWO_MISTAKES);
    expect(s.state.diagnostics.map(({ span }) => span?.line)).toEqual([3, 4]);
    expect(s.setStatus).toHaveBeenLastCalledWith({
      severity: "ERROR",
      heading: { file: "ASM code", count: 2 },
      diagnostics: [{ diagnostic: s.state.diagnostics[0] }],
    });
  });

  it("compiles a program with no diagnostic to its symbols and lines", () => {
    const s = mk();
    s.actions.compileAsm("(TOP)\n@x\n@TOP\n");
    expect(s.state.diagnostics).toEqual([]);
    expect(s.setStatus).toHaveBeenLastCalledWith("");
    expect(s.state.lineNumbers.slice(2)).toEqual([0, 1]);
  });

  it("recovers while Attempt Recovery is on, and recompiles when it changes", () => {
    let recovery = true;
    const s = mk(() => recovery);
    s.actions.setAsm(TWO_MISTAKES);
    s.actions.compileAsm(TWO_MISTAKES);
    expect(s.state.diagnostics).toHaveLength(2);

    recovery = false;
    s.actions.recompile();

    expect(s.state.diagnostics).toHaveLength(1);
    expect(s.setStatus).toHaveBeenLastCalledWith({
      severity: "ERROR",
      heading: { file: "ASM code", count: 1 },
      diagnostics: [{ diagnostic: s.state.diagnostics[0] }],
    });
    expect(s.state.diagnostics[0].span?.line).toBe(3);
  });
});

describe("loading asm source (#602)", () => {
  it("loads a Path from the fs, remembering its path", async () => {
    const s = mk();
    await s.fs.writeFile("/a.asm", "@1");
    await s.actions.loadAsm("/a.asm");
    expect(s.state.asm).toBe("@1");
    expect(s.state.path).toBe("/a.asm");
  });

  it("loads uploaded source without a path and never writes it to fs", async () => {
    const s = mk();
    await s.fs.writeFile("/a.asm", "@1");
    await s.actions.loadAsm("/a.asm");

    await s.actions.loadAsm(undefined, "@2");

    expect(s.state.asm).toBe("@2");
    expect(s.state.path).toBeUndefined();
    expect(await s.fs.readFile("/a.asm")).toBe("@1");
  });
});

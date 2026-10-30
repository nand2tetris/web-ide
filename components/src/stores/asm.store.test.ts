import {
  FileSystem,
  ObjectFileSystemAdapter,
} from "@davidsouther/jiffies/fs.ts";
import { produce } from "immer";
import { describe, expect, it, vi } from "vitest";
import { AsmStoreDispatch, makeAsmStore } from "./asm.store.js";

function mk() {
  const fs = new FileSystem(new ObjectFileSystemAdapter({}));
  const dispatch = { current: vi.fn() as unknown as AsmStoreDispatch };
  const setStatus = vi.fn();
  const { initialState, reducers, actions } = makeAsmStore(
    fs,
    setStatus,
    dispatch,
    false,
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

describe("compiling asm source", () => {
  it("counts the syntax errors of ASM code that does not parse", () => {
    const s = mk();
    s.actions.compileAsm("@@");
    expect(s.state.diagnostics).toHaveLength(1);
    expect(s.setStatus).toHaveBeenLastCalledWith({
      severity: "ERROR",
      heading: { file: "ASM code", count: 1 },
      diagnostics: [],
    });
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

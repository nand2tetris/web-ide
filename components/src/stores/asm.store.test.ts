import {
  FileSystem,
  ObjectFileSystemAdapter,
} from "@davidsouther/jiffies/lib/esm/fs.js";
import { produce } from "immer";
import { describe, expect, it, vi } from "vitest";
import { AsmStoreDispatch, makeAsmStore } from "./asm.store.js";

function mk() {
  const fs = new FileSystem(new ObjectFileSystemAdapter({}));
  const dispatch = { current: vi.fn() as unknown as AsmStoreDispatch };
  const { initialState, reducers, actions } = makeAsmStore(
    fs,
    vi.fn(),
    dispatch,
    false,
  );
  const store = { state: initialState, actions, fs };
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

    s.actions.loadLocalAsm("@2");

    expect(s.state.asm).toBe("@2");
    expect(s.state.path).toBeUndefined();
    expect(await s.fs.readFile("/a.asm")).toBe("@1");
  });
});

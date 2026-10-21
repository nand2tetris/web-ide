vi.mock("@nand2tetris/simulator/jack/compiler.js", async (orig) => {
  const mod =
    await orig<typeof import("@nand2tetris/simulator/jack/compiler.js")>();
  return { ...mod, compile: vi.fn(mod.compile) };
});
const compileSpy = vi.mocked(simCompiler.compile);

import {
  FileSystem,
  ObjectFileSystemAdapter,
} from "@davidsouther/jiffies/lib/esm/fs.js";
import * as simCompiler from "@nand2tetris/simulator/jack/compiler.js";
import { produce } from "immer";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CompilerStoreDispatch, makeCompilerStore } from "./compiler.store.js";

function mk() {
  const dispatch = { current: vi.fn() as unknown as CompilerStoreDispatch };
  const { initialState, reducers, actions } = makeCompilerStore(
    vi.fn(),
    dispatch,
  );
  const store = { state: initialState, reducers, actions, dispatch };
  dispatch.current = ((c: {
    action: keyof typeof reducers;
    payload: unknown;
  }) => {
    store.state = produce(store.state, (d: typeof initialState) => {
      reducers[c.action].call(reducers, d, c.payload as never);
    });
  }) as CompilerStoreDispatch;
  return store;
}

describe("keystroke edits (#447)", () => {
  afterEach(() => vi.useRealTimers());

  it("does not recompile every file per keystroke; compiles once when idle", async () => {
    vi.useFakeTimers();
    const s = mk();
    s.dispatch.current({
      action: "setFiles",
      payload: { Big: "class Big {\n}\n", Small: "class Small {\n}\n" },
    });
    compileSpy.mockClear();
    for (const text of ["c", "cl", "cla"]) {
      await s.actions.writeFile("Small", text);
    }
    expect(compileSpy).not.toHaveBeenCalled();
    expect(s.state.files.Small).toBe("cla");
    expect(s.state.isCompiled).toBe(false);
    vi.advanceTimersByTime(1000);
    expect(compileSpy).toHaveBeenCalledTimes(1);
    expect(s.state.compiled.Small.valid).toBe(false);
    expect(s.state.compiled.Big.valid).toBe(true);
  });

  it("compile action flushes a pending debounced compile first", async () => {
    vi.useFakeTimers();
    const s = mk();
    s.dispatch.current({
      action: "setFiles",
      payload: { Main: "class Main {\n}\n" },
    });
    await s.actions.writeFile(
      "Main",
      "class Main {\n  function void f() { return; }\n}\n",
    );
    await s.actions.compile();
    expect(s.state.compiled.Main.vm).toContain("function Main.f");
    expect(s.state.isCompiled).toBe(true);
  });

  it("compiles immediately for a new file", async () => {
    const s = mk();
    await s.actions.writeFile("Fresh");
    expect(s.state.compiled.Fresh.valid).toBe(true);
  });
});

describe("overlapping fs writes (#363)", () => {
  it("slow older write cannot overwrite newer content on disk", async () => {
    const s = mk();
    const disk: Record<string, string> = {};
    const adapter = new ObjectFileSystemAdapter(disk);
    const fs = new FileSystem(adapter);
    // First write is slow, second is fast -> slow one lands last.
    const orig = fs.writeFile.bind(fs);
    let n = 0;
    fs.writeFile = (async (p: string, c: string) => {
      const delay = n++ === 0 ? 30 : 0;
      await new Promise((r) => setTimeout(r, delay));
      return orig(p, c);
    }) as typeof fs.writeFile;
    await s.actions.loadProject(fs, "t");
    await Promise.all([
      s.actions.writeFile("Main", "class Main {}"), // older keystroke
      s.actions.writeFile("Main", "class Main {} // newest"),
    ]);
    expect(s.state.files.Main).toBe("class Main {} // newest");
    expect(await fs.readFile("Main.jack")).toBe("class Main {} // newest"); // fails if race
  });
});

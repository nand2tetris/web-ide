// Repro sketches for #447 (lag) and #363 (lost trailing characters).
import {
  FileSystem,
  ObjectFileSystemAdapter,
} from "@davidsouther/jiffies/lib/esm/fs.js";
import { produce } from "immer";
import { describe, expect, it, vi } from "vitest";
import {
  CompilerStoreDispatch,
  makeCompilerStore,
} from "./compiler.store.js";

function mk() {
  const dispatch = { current: vi.fn() as unknown as CompilerStoreDispatch };
  const { initialState, reducers, actions } = makeCompilerStore(
    vi.fn(),
    dispatch,
  );
  const store = { state: initialState, reducers, actions, dispatch };
  dispatch.current = ((c: { action: keyof typeof reducers; payload: unknown }) => {
    store.state = produce(store.state, (d: typeof initialState) => {
      reducers[c.action].call(reducers, d, c.payload as never);
    });
  }) as CompilerStoreDispatch;
  return store;
}

describe("#447 every keystroke recompiles ALL files synchronously", () => {
  it("setFile cost scales with project size (no debounce / no per-file cache)", () => {
    const s = mk();
    // Trail-like file: thousands of statements.
    const body = Array.from(
      { length: 3000 },
      (_, i) => `    do Screen.drawPixel(${i % 512}, ${i % 256});`,
    ).join("\n");
    const big = `class Big {\n  function void draw() {\n${body}\n    return;\n  }\n}\n`;
    s.state = produce(s.state, (d) => {
      d.files = { Big: big, Small: "class Small {\n}\n" };
    });
    const t0 = performance.now();
    s.dispatch.current({ action: "setFile", payload: { name: "Small", content: "class Small {\n}\n " } });
    const dt = performance.now() - t0;
    console.log(`editing tiny file with 3000-stmt sibling: ${dt.toFixed(0)}ms`);
    // Editing Small re-compiled Big too:
    expect(Object.keys(s.state.compiled)).toContain("Big");
    // Informational threshold; a single keystroke should be << one frame (16ms).
    expect(dt).toBeLessThan(16);
  });
});

describe("#363 unserialised fs writes", () => {
  it("out-of-order completion of overlapping writes leaves stale content on disk", async () => {
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

vi.mock("@nand2tetris/simulator/jack/compiler.js", async (orig) => {
  const mod =
    await orig<typeof import("@nand2tetris/simulator/jack/compiler.js")>();
  return { ...mod, compile: vi.fn(mod.compile) };
});
const compileSpy = vi.mocked(simCompiler.compile);

import {
  FileSystem,
  ObjectFileSystemAdapter,
} from "@davidsouther/jiffies/fs.ts";
import * as simCompiler from "@nand2tetris/simulator/jack/compiler.js";
import { act, renderHook } from "@testing-library/react";
import { produce } from "immer";
import { createElement, ReactNode, useContext } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { BaseContext } from "./base.context.js";
import {
  CompilerStoreDispatch,
  makeCompilerStore,
  useCompilerPageStore,
} from "./compiler.store.js";

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

describe("Jack diagnostics by editor path", () => {
  const lines = (...l: string[]) => l.join("\n");
  const main = lines(
    "class Main {",
    "  function void a() {",
    "    return;",
    "    let x = 1", // line 4: syntax error, no semicolon
    "  }",
    "  function void b() {",
    "    let y = 2;", // line 7: y is not declared
    "    return;",
    "  }",
    "}",
  );
  const util = lines(
    "class Util {",
    "  function void c() {",
    "    let z = 3;", // line 3: z is not declared
    "    return;",
    "  }",
    "}",
  );

  it("files each list under the path its editor shows, with offsets local to the file", () => {
    const s = mk();

    s.dispatch.current({
      action: "setFiles",
      payload: { "proj/Main": main, "proj/Util": util },
    });

    const [syntax, semantic, ...rest] =
      s.state.compiled["proj/Main"].diagnostics;
    expect(rest).toEqual([]);
    expect([4, 5]).toContain(syntax.span?.line);
    expect(semantic).toMatchObject({
      message: "Line 7: Undeclared variable y",
      span: { start: main.indexOf("let y") + 4, line: 7 },
    });
    expect(s.state.compiled["proj/Util"].diagnostics).toMatchObject([
      {
        message: "Line 3: Undeclared variable z",
        span: { start: util.indexOf("let z") + 4 },
      },
    ]);
  });
});

describe("Jack files that share a class name", () => {
  it("compiles the first and reports the repeat, so every path has a result", () => {
    const s = mk();
    const empty = "class Main {\n}\n";

    s.dispatch.current({
      action: "setFiles",
      payload: { "a/Main": empty, "b/Main": empty },
    });

    expect(s.state.compiled["a/Main"].valid).toBe(true);
    expect(s.state.compiled["b/Main"]).toMatchObject({
      valid: false,
      diagnostics: [{ message: "b/Main repeats the class file a/Main" }],
    });
    expect(s.state.isValid).toBe(false);
  });
});

describe("Attempt Recovery setting in the compiler store", () => {
  it("reaches the next compile, so only the syntax error remains once it is off", () => {
    let recover = true;
    const dispatch = { current: vi.fn() as unknown as CompilerStoreDispatch };
    const { initialState, reducers } = makeCompilerStore(
      vi.fn(),
      dispatch,
      () => recover,
    );
    let state = initialState;
    dispatch.current = ((c: {
      action: keyof typeof reducers;
      payload: unknown;
    }) => {
      state = produce(state, (d: typeof initialState) => {
        reducers[c.action].call(reducers, d, c.payload as never);
      });
    }) as CompilerStoreDispatch;
    const files = {
      Main: "class Main {\n  function void a() {\n    return;\n    let x = 1\n  }\n  function void b() {\n    let y = 2;\n    return;\n  }\n}\n",
    };
    dispatch.current({ action: "setFiles", payload: files });
    expect(state.compiled.Main.diagnostics).toHaveLength(2);

    recover = false;
    dispatch.current({ action: "compile" });

    expect(state.compiled.Main.diagnostics).toHaveLength(1);
  });
});

describe("Attempt Recovery setting changed while the compiler page is open", () => {
  it("recompiles the files already loaded under the new setting", () => {
    let attemptRecovery = true;
    const wrapper = ({ children }: { children: ReactNode }) =>
      createElement(
        BaseContext.Provider,
        { value: { ...useContext(BaseContext), attemptRecovery } },
        children,
      );
    const view = renderHook(() => useCompilerPageStore(), { wrapper });
    const Main =
      "class Main {\n  function void a() {\n    return;\n    let x = 1\n  }\n  function void b() {\n    let y = 2;\n    return;\n  }\n}\n";
    act(() =>
      view.result.current.dispatch.current({
        action: "setFiles",
        payload: { Main },
      }),
    );
    expect(view.result.current.state.compiled.Main.diagnostics).toHaveLength(2);

    attemptRecovery = false;
    view.rerender();
    act(() => view.result.current.actions.recompile());

    expect(view.result.current.state.compiled.Main.diagnostics).toHaveLength(1);
  });
});

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

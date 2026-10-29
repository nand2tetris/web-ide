import {
  FileSystem,
  ObjectFileSystemAdapter,
} from "@davidsouther/jiffies/fs.ts";
import * as not from "@nand2tetris/projects/project_01/01_not.js";
import { act, renderHook } from "@testing-library/react";
import { produce } from "immer";
import { createElement, MutableRefObject, ReactNode, useContext } from "react";
import { cleanState } from "../clean_state.js";
import { ImmPin } from "../pinout.js";
import { BaseContext } from "./base.context.js";
import {
  ChipStoreDispatch,
  makeChipStore,
  useChipPageStore,
} from "./chip.store.js";

function testChipStore(
  fs: Record<string, string> = {
    "projects/01/Not.hdl": not.hdl,
    "projects/01/Not.tst": not.tst,
    "projects/01/Not.cmp": not.cmp,
  },
  storage: Record<string, string> = {},
  attemptRecovery?: () => boolean,
) {
  const dispatch: MutableRefObject<ChipStoreDispatch> = { current: vi.fn() };

  const setStatus = vi.fn();

  const { initialState, actions, reducers } = makeChipStore(
    new FileSystem(new ObjectFileSystemAdapter(fs)),
    setStatus,
    storage,
    dispatch,
    false,
    attemptRecovery,
  );
  const store = { state: initialState, actions, reducers, dispatch, setStatus };
  dispatch.current = vi.fn().mockImplementation(
    // biome-ignore lint/suspicious/noExplicitAny: covariants are hard
    (command: { action: keyof typeof reducers; payload: any }) => {
      store.state = produce(store.state, (draft: typeof initialState) => {
        reducers[command.action](draft, command.payload);
      });
    },
  );

  return store;
}

const chipWith = (name: string, ...parts: string[]) =>
  [`CHIP ${name} {`, "  IN a;", "  OUT out;", "  PARTS:", ...parts, "}"].join(
    "\n",
  );

describe("test script diagnostics", () => {
  it("lists a missing closer and the missing load, and only the closer with recovery off", () => {
    let recovery = true;
    const store = testChipStore(undefined, {}, () => recovery);

    expect(store.actions.compileTest("repeat 1 { eval;", "projects/01")).toBe(
      false,
    );
    expect(store.setStatus).toHaveBeenLastCalledWith({
      message:
        'Test script: 2 syntax errors. Line 1: expected "}". Line 1: A test script must have a load command',
      severity: "ERROR",
    });

    recovery = false;
    store.actions.compileTest("repeat 1 { eval;", "projects/01");
    expect(store.setStatus).toHaveBeenLastCalledWith({
      message: 'Test script: 1 syntax error. Line 1: expected "}"',
      severity: "ERROR",
    });
  });
});

describe("HDL diagnostics by file", () => {
  it("keeps a dependency's diagnostics out of the editor's markers", async () => {
    const child = chipWith(
      "Child",
      "  Not(in=a out=x);", // line 5: syntax error, no comma
      "  Not(in=a, out=out);",
    );
    const top = chipWith("Top", "  Child(a=a, out=out);");
    const store = testChipStore({ "projects/01/Child.hdl": child });

    await store.actions.compileChip(top, "projects/01", "Top");

    expect(store.state.controls.diagnostics).toEqual([]);
    expect(
      store.state.controls.dependencyDiagnostics["projects/01/Child.hdl"],
    ).toMatchObject([{ span: { line: 5 } }]);
    expect(store.setStatus).toHaveBeenLastCalledWith({
      message: expect.stringMatching(
        /^HDL code: 1 syntax error\. projects\/01\/Child\.hdl: Line 5: /,
      ),
      severity: "ERROR",
    });
  });
});

describe("HDL syntax and semantic diagnostics", () => {
  const source = chipWith(
    "Top",
    "  Nand(a=a b=a, out=x);", // line 5: syntax error, no comma
    "  Nope(a=x, out=out);", // line 6: grammatical, but Nope is not a chip
  );
  const offsetOf = (text: string) => source.indexOf(text);

  it("marks both at their own offsets in source order, and names the first in the status", async () => {
    const store = testChipStore();

    await store.actions.compileChip(source, "projects/01", "Top");

    const [syntax, semantic, ...rest] = store.state.controls.diagnostics;
    expect(rest).toEqual([]);
    expect(syntax.span).toEqual({
      start: offsetOf("b=a"),
      end: offsetOf("b=a"),
      line: 5,
    });
    expect(semantic).toMatchObject({
      message: "Line 6: Undefined chip name: Nope",
      span: { start: offsetOf("Nope"), line: 6 },
    });
    expect(store.setStatus).toHaveBeenLastCalledWith({
      message: `HDL code: 2 syntax errors. ${syntax.message}`,
      severity: "ERROR",
    });
  });

  it("reports only the syntax error once Attempt Recovery is turned off", async () => {
    let recover = true;
    const store = testChipStore(undefined, undefined, () => recover);
    await store.actions.compileChip(source, "projects/01", "Top");
    expect(store.state.controls.diagnostics).toHaveLength(2);

    recover = false;
    await store.actions.compileChip(source, "projects/01", "Top");

    expect(store.state.controls.diagnostics).toMatchObject([
      { span: { line: 5 } },
    ]);
  });
});

describe("Attempt Recovery setting in the chip page store", () => {
  const source = chipWith(
    "Top",
    "  Nand(a=a b=a, out=x);", // line 5: syntax error
    "  Nope(a=x, out=out);", // line 6: semantic error
  );

  it("reaches the next compile of a store that outlives the setting's change", async () => {
    let attemptRecovery = true;
    const wrapper = ({ children }: { children: ReactNode }) =>
      createElement(
        BaseContext.Provider,
        { value: { ...useContext(BaseContext), attemptRecovery } },
        children,
      );
    const view = renderHook(() => useChipPageStore(), { wrapper });
    await act(() => view.result.current.actions.compileChip(source));
    expect(view.result.current.state.controls.diagnostics).toHaveLength(2);

    attemptRecovery = false;
    view.rerender();
    await act(() => view.result.current.actions.compileChip(source));

    expect(view.result.current.state.controls.diagnostics).toHaveLength(1);
  });
});

describe("ChipStore", () => {
  describe("initialization", () => {
    it("loads chip", async () => {
      const store = testChipStore({
        "projects/01/Not.hdl": not.hdl,
        "projects/01/Not.tst": not.tst,
        "projects/01/Not.cmp": not.cmp,
      });

      await store.actions.initialize();
      await store.actions.loadChip("projects/01/Not.hdl");

      expect(store.state.controls.project).toBe("01");
      expect(store.state.controls.chipName).toBe("Not");
      expect(store.state.files.hdl).toBe(not.hdl);
      expect(store.state.files.tst).toBe(not.tst);
      expect(store.state.files.cmp).toBe("");
      expect(store.state.files.out).toBe("");
    });

    it("keeps the auto-loaded chip selected after initialize", async () => {
      const store = testChipStore({
        "projects/01/Not.hdl": not.hdl,
        "projects/01/Not.tst": not.tst,
        "projects/01/Not.cmp": not.cmp,
      });

      await store.actions.initialize();

      expect(store.state.controls.project).toBe("01");
      expect(store.state.controls.chipName).not.toBe("");
      expect(store.state.controls.chips.length).toBeGreaterThan(0);
    });

    it("clears chip name when no projects are present", async () => {
      const store = testChipStore({
        "projects/README.md": "no chips here",
      });

      await store.actions.initialize();

      expect(store.state.controls.chipName).toBe("");
      expect(store.state.controls.chips).toEqual([]);
    });
  });

  describe("behavior", () => {
    const state = cleanState(async () => {
      const store = testChipStore({
        "projects/01/Not.hdl": not.hdl,
        "projects/01/Not.tst": not.tst,
        "projects/01/Not.cmp": not.cmp,
      });
      await store.actions.initialize();
      await store.actions.loadChip("projects/01/Not.hdl");
      return { store };
    }, beforeEach);

    it.todo("loads projects and chips");

    it("toggles bits", async () => {
      state.store.actions.toggle(state.store.state.sim.chip[0].in(), 0);
      expect(state.store.state.sim.chip[0].in().busVoltage).toBe(1);
      expect(state.store.dispatch.current).toHaveBeenCalledWith({
        action: "updateChip",
        payload: { pending: true },
      });
      expect(state.store.state.sim.pending).toBe(true);

      state.store.actions.eval();
      expect(state.store.dispatch.current).toHaveBeenCalledWith({
        action: "updateChip",
        payload: { pending: false },
      });
      expect(state.store.state.sim.pending).toBe(false);
      expect(state.store.state.sim.chip[0].out().busVoltage).toBe(0);
    });
  });

  describe("execution", () => {
    const state = cleanState(async () => {
      const store = testChipStore({
        "projects/01/Not.hdl": not.hdl,
        "projects/01/Not.tst": not.tst,
        "projects/01/Not.cmp": not.cmp,
      });
      await store.actions.initialize();
      await store.actions.loadChip("projects/01/Not.hdl");
      return { store };
    }, beforeEach);

    it.todo("compiles chips");

    it("counts the syntax errors of HDL code that does not compile, and names the first", async () => {
      await state.store.actions.compileChip("CHIP Not {", "projects/01", "Not");
      expect(state.store.setStatus).toHaveBeenLastCalledWith({
        message:
          'HDL code: 1 syntax error. Line 1: expected "PARTS:" or "BUILTIN"',
        severity: "ERROR",
      });
    });

    it("lists the syntax errors of a test script that does not parse", () => {
      state.store.actions.compileTest("set in", "projects/01");
      expect(state.store.setStatus).toHaveBeenLastCalledWith({
        message: expect.stringMatching(
          /^Test script: 1 syntax error\. Line 1: expected /,
        ),
        severity: "ERROR",
      });
    });

    it("steps tests", async () => {
      const bits = (pins: ImmPin[]) =>
        pins.map((pin) => pin.bits.map((bit) => bit[1]));

      expect(bits(state.store.state.sim.inPins)).toEqual([[0]]);
      expect(bits(state.store.state.sim.outPins)).toEqual([[0]]);

      await state.store.actions.toggleBuiltin();

      expect(bits(state.store.state.sim.inPins)).toEqual([[0]]);
      expect(bits(state.store.state.sim.outPins)).toEqual([[1]]);

      await state.store.actions.stepTest(); // Load, Compare To and Output List

      await state.store.actions.stepTest(); // Set in 0
      expect(bits(state.store.state.sim.inPins)).toEqual([[0]]);
      expect(bits(state.store.state.sim.outPins)).toEqual([[1]]);

      await state.store.actions.stepTest(); // Set in 1
      expect(bits(state.store.state.sim.inPins)).toEqual([[1]]);
      expect(bits(state.store.state.sim.outPins)).toEqual([[0]]);

      await state.store.actions.stepTest(); // No change (after end)
      expect(bits(state.store.state.sim.inPins)).toEqual([[1]]);
      expect(bits(state.store.state.sim.outPins)).toEqual([[0]]);
    });

    it("starts the cursor on the first instruction", () => {
      expect(state.store.state.files.tst).toBe(not.tst);
      expect(state.store.state.controls.span).toEqual({
        start: 167,
        end: 220,
        line: 6,
      });
    });

    it("leaves the cursor on the final character", async () => {
      // Not.tst has 3 commands
      await state.store.actions.stepTest();
      await state.store.actions.stepTest();
      await state.store.actions.stepTest();

      // Past the end of the test
      await state.store.actions.stepTest();

      expect(state.store.state.controls.span).toEqual({
        start: 269,
        end: 270,
        line: 16,
      });
    });
  });
});

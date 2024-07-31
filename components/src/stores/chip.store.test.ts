import {
  FileSystem,
  ObjectFileSystemAdapter,
} from "@davidsouther/jiffies/lib/esm/fs.js";
import { cleanState } from "@davidsouther/jiffies/lib/esm/scope/state.js";
import * as not from "@nand2tetris/projects/project_01/01_not.js";
import * as bit from "@nand2tetris/projects/project_03/01_bit.js";
import { produce } from "immer";
import { MutableRefObject } from "react";
import { ImmPin } from "src/pinout.js";
import { ChipStoreDispatch, makeChipStore } from "./chip.store.js";

function testChipStore(
  fs: Record<string, string> = {
    "projects/01/Not/Not.hdl": not.hdl,
    "projects/01/Not/Not.tst": not.tst,
    "projects/01/Not/Not.cmp": not.cmp,
  },
  storage: Record<string, string> = {},
) {
  const dispatch: MutableRefObject<ChipStoreDispatch> = { current: jest.fn() };

  const setStatus = jest.fn();

  const { initialState, actions, reducers } = makeChipStore(
    new FileSystem(new ObjectFileSystemAdapter(fs)),
    setStatus,
    storage,
    dispatch,
  );
  const store = { state: initialState, actions, reducers, dispatch, setStatus };
  dispatch.current = jest.fn().mockImplementation(
    (command: {
      action: keyof typeof reducers;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      payload: any;
    }) => {
      store.state = produce(store.state, (draft: typeof initialState) => {
        reducers[command.action](draft, command.payload);
      });
    },
  );

  return store;
}

describe("ChipStore", () => {
  describe("initialization", () => {
    it("starts on project 01 not", async () => {
      const { state } = testChipStore({});

      expect(state.controls.project).toBe("01");
      expect(state.controls.chipName).toBe("Not");
      expect(state.files.hdl).toBe("");
      expect(state.files.tst).toBe("");
      expect(state.files.cmp).toBe("");
      expect(state.files.out).toBe("");
    });

    it("reloads initial chip not", async () => {
      const store = testChipStore({
        "projects/01/Not/Not.hdl": not.hdl,
        "projects/01/Not/Not.tst": not.tst,
        "projects/01/Not/Not.cmp": not.cmp,
      });

      await store.actions.initialize();

      expect(store.state.controls.project).toBe("01");
      expect(store.state.controls.chipName).toBe("Not");
      expect(store.state.files.hdl).toBe(not.hdl);
      expect(store.state.files.tst).toBe(not.tst);
      expect(store.state.files.cmp).toBe(not.cmp);
      expect(store.state.files.out).toBe("");
    });

    it("loads saved state", () => {
      const { state } = testChipStore(
        {
          "projects/01/Not/Not.hdl": not.hdl,
          "projects/01/Not/Not.tst": not.tst,
          "projects/01/Not/Not.cmp": not.cmp,
          "projects/03/Bit/Bit.hdl": bit.hdl,
          "projects/03/Bit/Bit.tst": bit.tst,
          "projects/03/Bit/Bit.cmp": bit.cmp,
        },
        {
          "/chip/project": "03",
          "/chip/chip": "Bit",
        },
      );
      expect(state.controls.project).toBe("03");
      expect(state.controls.chipName).toBe("Bit");
    });
  });

  describe("behavior", () => {
    const state = cleanState(() => ({ store: testChipStore() }), beforeEach);

    it.todo("loads projects and chips");

    it("toggles bits", async () => {
      await state.store.actions.initialize();
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
        "projects/01/Not/Not.hdl": not.hdl,
        "projects/01/Not/Not.tst": not.tst,
        "projects/01/Not/Not.cmp": not.cmp,
      });
      await store.actions.initialize();
      return { store };
    }, beforeEach);

    it.todo("compiles chips");

    it("steps tests", async () => {
      const bits = (pins: ImmPin[]) =>
        pins.map((pin) => pin.bits.map((bit) => bit[1]));

      expect(bits(state.store.state.sim.inPins)).toEqual([[0]]);
      expect(bits(state.store.state.sim.outPins)).toEqual([[0]]);

      await state.store.actions.useBuiltin();

      expect(bits(state.store.state.sim.inPins)).toEqual([[0]]);
      expect(bits(state.store.state.sim.outPins)).toEqual([[1]]);

      await state.store.actions.stepTest(); // Output List

      await state.store.actions.stepTest(); // Set in 0
      expect(bits(state.store.state.sim.inPins)).toEqual([[0]]);
      expect(bits(state.store.state.sim.outPins)).toEqual([[1]]);

      await state.store.actions.stepTest(); // Set in 1
      expect(bits(state.store.state.sim.inPins)).toEqual([[1]]);
      expect(bits(state.store.state.sim.outPins)).toEqual([[0]]);

      await state.store.actions.stepTest(); // No change (afte end)
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

import * as not from "@nand2tetris/projects/project_01/01_not.js";
import * as bit from "@nand2tetris/projects/project_03/01_bit.js";
import {
  FileSystem,
  ObjectFileSystemAdapter,
} from "@davidsouther/jiffies/lib/esm/fs.js";
import { cleanState } from "@davidsouther/jiffies/lib/esm/scope/state.js";
import { MutableRefObject } from "react";
import { ChipStoreDispatch, makeChipStore } from "./chip.store.js";
import produce from "immer";

function testChipStore(
  fs: Record<string, string> = {
    "/projects/01/Not/Not.hdl": not.hdl,
    "/projects/01/Not/Not.tst": not.tst,
    "/projects/01/Not/Not.cmp": not.cmp,
  },
  storage: Record<string, string> = {}
) {
  const dispatch: MutableRefObject<ChipStoreDispatch> = { current: jest.fn() };

  const setStatus = jest.fn();

  const { initialState, actions, reducers } = makeChipStore(
    new FileSystem(new ObjectFileSystemAdapter(fs)),
    setStatus,
    storage,
    dispatch
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
    }
  );

  return store;
}

describe("ChipStore", () => {
  describe("initialization", () => {
    it("starts on project 01 not", () => {
      const { state } = testChipStore({});

      expect(state.controls.project).toBe("01");
      expect(state.controls.chipName).toBe("Not");
      expect(state.files.hdl).toBe(not.hdl);
      expect(state.files.tst).toBe(not.tst);
      expect(state.files.cmp).toBe(not.cmp);
      expect(state.files.out).toBe("");
    });

    it("loads saved state", () => {
      const { state } = testChipStore(
        {
          "/projects/01/Not/Not.hdl": not.hdl,
          "/projects/01/Not/Not.tst": not.tst,
          "/projects/01/Not/Not.cmp": not.cmp,
          "/projects/03/Bit/Bit.hdl": bit.hdl,
          "/projects/03/Bit/Bit.tst": bit.tst,
          "/projects/03/Bit/Bit.cmp": bit.cmp,
        },
        {
          "/chip/project": "03",
          "/chip/chip": "Bit",
        }
      );
      expect(state.controls.project).toBe("03");
      expect(state.controls.chipName).toBe("Bit");
    });
  });

  describe("behavior", () => {
    const state = cleanState(() => ({ store: testChipStore() }), beforeEach);

    it.todo("loads projects and chips");

    it("toggles bits", () => {
      const { store } = state;
      expect(store.state.sim.chip[0].out().busVoltage).toBe(1);
      store.actions.toggle(store.state.sim.chip[0].in(), 0);
      expect(store.state.sim.chip[0].in().busVoltage).toBe(1);
      expect(store.dispatch.current).toHaveBeenCalledWith({
        action: "updateChip",
        payload: { pending: true },
      });
      expect(store.state.sim.pending).toBe(true);
      store.actions.eval();
      expect(store.dispatch.current).toHaveBeenCalledWith({
        action: "updateChip",
        payload: { pending: false },
      });
      expect(store.state.sim.pending).toBe(false);
      expect(store.state.sim.chip[0].out().busVoltage).toBe(0);
    });
  });

  describe("execution", () => {
    const state = cleanState(() => ({ store: testChipStore() }), beforeEach);

    it.todo("compiles chips");
    it.todo("steps tests");

    it("starts the cursor on the first instruction", () => {
      state.store.state.files.tst; //?
      expect(state.store.state.files.tst);
    });

    it.todo("leaves the cursor on the final character ");
  });
});

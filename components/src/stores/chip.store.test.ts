import * as not from "@computron5k/simulator/projects/project_01/01_not.js";
import * as bit from "@computron5k/simulator/projects/project_03/01_bit.js";
import {
  FileSystem,
  ObjectFileSystemAdapter,
} from "@davidsouther/jiffies/lib/esm/fs.js";
import { MutableRefObject } from "react";
import { ChipStoreDispatch, makeChipStore } from "./chip.store.js";

function testChipStore(
  fs: Record<string, string> = {},
  storage: Record<string, string> = {}
) {
  const dispatch: MutableRefObject<ChipStoreDispatch> = {
    current: jest.fn(),
  };

  const setStatus = jest.fn();

  const { initialState, actions, reducers } = makeChipStore(
    new FileSystem(new ObjectFileSystemAdapter(fs)),
    setStatus,
    storage,
    dispatch
  );
  return { initialState, actions, reducers, dispatch, setStatus };
}

describe("ChipStore", () => {
  describe("initialization", () => {
    it("starts on project 01 not", () => {
      const { initialState: state } = testChipStore();

      expect(state.controls.project).toBe("01");
      expect(state.controls.chipName).toBe("Not");
    });

    it("loads saved state", () => {
      const { initialState: store } = testChipStore(
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
      expect(store.controls.project).toBe("03");
      expect(store.controls.chipName).toBe("Bit");
    });
  });

  describe.skip("behavior", () => {
    it("toggles bits", () => undefined);
    it("increments registers", () => undefined);
    it("saves chips", () => undefined);
    it("loads projects and chips", () => undefined);
    it("adds custom chips to the current project dropdown", () => undefined);
  });

  describe.skip("execution", () => {
    it("compiles chips", () => undefined);
    it("runs tests", () => undefined);
  });
});

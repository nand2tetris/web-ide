import {
  FileSystem,
  ObjectFileSystemAdapter,
} from "@davidsouther/jiffies/lib/esm/fs";
import { MutableRefObject } from "react";
import * as not from "../../projects/project_01/01_not";
import * as bit from "../../projects/project_03/01_bit";
import { ChipStoreDispatch, makeChipStore } from "./chip.store";

function testChipStore(
  fs: Record<string, string> = {},
  storage: Record<string, string> = {}
) {
  let dispatch: MutableRefObject<ChipStoreDispatch> = {
    current: jest.fn(),
  };

  let setStatus = jest.fn();

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
    it("toggles bits", () => {});
    it("increments registers", () => {});
    it("saves chips", () => {});
    it("loads projects and chips", () => {});
    it("adds custom chips to the current project dropdown", () => {});
  });

  describe.skip("execution", () => {
    it("compiles chips", () => {});
    it("runs tests", () => {});
  });
});

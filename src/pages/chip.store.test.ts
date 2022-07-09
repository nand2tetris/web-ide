import {
  FileSystem,
  ObjectFileSystemAdapter,
} from "@davidsouther/jiffies/lib/esm/fs";
import { ChipPageStore } from "./chip.store";
import * as not from "../projects/project_01/01_not";
import * as bit from "../projects/project_03/01_bit";

describe("ChipStore", () => {
  describe("initialization", () => {
    it("starts on project 01 not", () => {
      const store = new ChipPageStore();

      expect(store.project).toBe("01");
      expect(store.chipName).toBe("Not");
    });

    it("loads saved state", () => {
      const store = new ChipPageStore(
        new FileSystem(
          new ObjectFileSystemAdapter({
            "/projects/01/Not/Not.hdl": not.hdl,
            "/projects/01/Not/Not.tst": not.tst,
            "/projects/01/Not/Not.cmp": not.cmp,
            "/projects/03/Bit/Bit.hdl": bit.hdl,
            "/projects/03/Bit/Bit.tst": bit.tst,
            "/projects/03/Bit/Bit.cmp": bit.cmp,
          })
        ),
        {
          "chip/project": "03",
          "chip/chip": "Bit",
        }
      );

      expect(store.project).toBe("03");
      expect(store.chipName).toBe("Bit");
    });
  });

  describe.skip("behavior", () => {
    it("toggles bits", () => {});
    it("increments registers", () => {});
    it("saves chips", () => {});
    it("loads projects and chips", () => {});
  });

  describe.skip("execution", () => {
    it("compiles chips", () => {});
    it("runs tests", () => {});
  });
});
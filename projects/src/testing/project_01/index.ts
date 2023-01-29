import { FileSystem, reset } from "@davidsouther/jiffies/lib/esm/fs.js";

import * as Not from "./01_not.js";
import * as And from "./02_and.js";
import * as Or from "./03_or.js";
import * as Xor from "./04_xor.js";
import * as Mux from "./05_mux.js";
import * as DMux from "./06_dmux.js";
import * as Not16 from "./07_not16.js";
import * as And16 from "./08_and16.js";
import * as Or16 from "./09_or16.js";
import * as Mux16 from "./10_mux16.js";
import * as Mux4Way16 from "./11_mux4way16.js";
import * as Mux8Way16 from "./12_mux8way16.js";
import * as DMux4Way from "./13_dmux4way.js";
import * as DMux8Way from "./14_dmux8way.js";
import * as Or8Way from "./15_or8way.js";

export const SOLS = {
  Not: {
    "Not.hdl": Not.sol,
  },
  And: {
    "And.hdl": And.sol,
  },
  Or: {
    "Or.hdl": Or.sol,
  },
  XOr: {
    "XOr.hdl": Xor.sol,
  },
  Mux: {
    "Mux.hdl": Mux.sol,
  },
  DMux: {
    "DMux.hdl": DMux.sol,
  },
  Not16: {
    "Not16.hdl": Not16.sol,
  },
  And16: {
    "And16.hdl": And16.sol,
  },
  Or16: {
    "Or16.hdl": Or16.sol,
  },
  Mux16: {
    "Mux16.hdl": Mux16.sol,
  },
  Mux4Way16: {
    "Mux4Way16.hdl": Mux4Way16.sol,
  },
  Mux8Way16: {
    "Mux8Way16.hdl": Mux8Way16.sol,
  },
  DMux4Way: {
    "DMux4Way.hdl": DMux4Way.sol,
  },
  DMux8Way: {
    "DMux8Way.hdl": DMux8Way.sol,
  },
  Or8Way: {
    "Or8Way.hdl": Or8Way.sol,
  },
};

export async function loadSolutions(fs: FileSystem): Promise<void> {
  await fs.pushd("/projects/01");
  await reset(fs, SOLS);
  await fs.popd();
}

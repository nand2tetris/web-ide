import { FileSystem, reset } from "@davidsouther/jiffies/lib/esm/fs";

import * as Not from "./01_not";
import * as And from "./02_and";
import * as Or from "./03_or";
import * as Xor from "./04_xor";
import * as Mux from "./05_mux";
import * as DMux from "./06_dmux";
import * as Not16 from "./07_not16";
import * as And16 from "./08_and16";
import * as Or16 from "./09_or16";
import * as Mux16 from "./10_mux16";
import * as Mux4Way16 from "./11_mux4way16";
import * as Mux8Way16 from "./12_mux8way16";
import * as DMux4Way from "./13_dmux4way";
import * as DMux8Way from "./14_dmux8way";
import * as Or8Way from "./15_or8way";

export async function resetFiles(fs: FileSystem): Promise<void> {
  await fs.pushd("/projects/01");
  await reset(fs, {
    Not: {
      "Not.hdl": Not.hdl,
      "Not.tst": Not.tst,
      "Not.cmp": Not.cmp,
    },
    And: {
      "And.hdl": And.hdl,
      "And.tst": And.tst,
      "And.cmp": And.cmp,
    },
    Or: {
      "Or.hdl": Or.hdl,
      "Or.tst": Or.tst,
      "Or.cmp": Or.cmp,
    },
    XOr: {
      "XOr.hdl": Xor.hdl,
      "XOr.tst": Xor.tst,
      "XOr.cmp": Xor.cmp,
    },
    Mux: {
      "Mux.hdl": Mux.hdl,
      "Mux.tst": Mux.tst,
      "Mux.cmp": Mux.cmp,
    },
    DMux: {
      "DMux.hdl": DMux.hdl,
      "DMux.tst": DMux.tst,
      "DMux.cmp": DMux.cmp,
    },
    Not16: {
      "Not16.hdl": Not16.hdl,
      "Not16.tst": Not16.tst,
      "Not16.cmp": Not16.cmp,
    },
    And16: {
      "And16.hdl": And16.hdl,
      "And16.tst": And16.tst,
      "And16.cmp": And16.cmp,
    },
    Or16: {
      "Or16.hdl": Or16.hdl,
      "Or16.tst": Or16.tst,
      "Or16.cmp": Or16.cmp,
    },
    Mux16: {
      "Mux16.hdl": Mux16.hdl,
      "Mux16.tst": Mux16.tst,
      "Mux16.cmp": Mux16.cmp,
    },
    Mux4way16: {
      "Mux4Way16.hdl": Mux4Way16.hdl,
      "Mux4Way16.tst": Mux4Way16.tst,
      "Mux4Way16.cmp": Mux4Way16.cmp,
    },
    Mux8Way16: {
      "Mux8Way16.hdl": Mux8Way16.hdl,
      "Mux8Way16.tst": Mux8Way16.tst,
      "Mux8Way16.cmp": Mux8Way16.cmp,
    },
    DMux4Way: {
      "DMux4Way.hdl": DMux4Way.hdl,
      "DMux4Way.tst": DMux4Way.tst,
      "DMux4Way.cmp": DMux4Way.cmp,
    },
    DMux8Way: {
      "DMux8Way.hdl": DMux8Way.hdl,
      "DMux8Way.tst": DMux8Way.tst,
      "DMux8Way.cmp": DMux8Way.cmp,
    },
    Or8Way: {
      "Or8Way.hdl": Or8Way.hdl,
      "Or8Way.tst": Or8Way.tst,
      "Or8Way.cmp": Or8Way.cmp,
    },
  });
  await fs.popd();
}

export async function loadSolutions(fs: FileSystem): Promise<void> {
  await fs.pushd("/projects/01");
  await reset(fs, {
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
  });
  await fs.popd();
}

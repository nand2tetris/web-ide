import { FileSystem, reset } from "@davidsouther/jiffies/fs.js";

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
import * as Mux4way16 from "./11_mux4way16.js";
import * as Mux8way16 from "./12_mux8way16.js";
import * as DMux4way from "./13_dmux4way.js";
import * as DMux8way from "./14_dmux8way.js";

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
    Xor: {
      "Xor.hdl": Xor.hdl,
      "Xor.tst": Xor.tst,
      "Xor.cmp": Xor.cmp,
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
      "Mux4way16.hdl": Mux4way16.hdl,
      "Mux4way16.tst": Mux4way16.tst,
      "Mux4way16.cmp": Mux4way16.cmp,
    },
    Mux8way16: {
      "Mux8way16.hdl": Mux8way16.hdl,
      "Mux8way16.tst": Mux8way16.tst,
      "Mux8way16.cmp": Mux8way16.cmp,
    },
    DMux4way: {
      "DMux4way.hdl": DMux4way.hdl,
      "DMux4way.tst": DMux4way.tst,
      "DMux4way.cmp": DMux4way.cmp,
    },
    DMux8way: {
      "DMux8way.hdl": DMux8way.hdl,
      "DMux8way.tst": DMux8way.tst,
      "DMux8way.cmp": DMux8way.cmp,
    },
  });
  await fs.popd();
}

import {
  FileSystem,
  ObjectFileSystemAdapter,
} from "@davidsouther/jiffies/fs.ts";
import { describe, expect, it } from "vitest";
import { customChipOf } from "./customChips";

const chip = (name: string, ...parts: string[]) =>
  [
    `CHIP ${name} {`,
    "  IN a, b;",
    "  OUT out;",
    "  PARTS:",
    ...parts,
    "}",
  ].join("\n");

const projectWith = (files: Record<string, string>) =>
  new FileSystem(new ObjectFileSystemAdapter(files));

describe("custom chips from the final call", () => {
  it("offers a chip that builds, with the pins the built chip declares", async () => {
    const source = chip("Gate", "  Nand(a=a, b=b, out=out);");

    expect(await customChipOf(source, "p", projectWith({}))).toEqual({
      name: "Gate",
      signature: "Gate(a= , b= , out= );",
    });
  });

  it("does not offer a chip that names a chip that does not exist", async () => {
    const source = chip("Gate", "  Nope(a=a, b=b, out=out);");

    expect(await customChipOf(source, "p", projectWith({}))).toBeUndefined();
  });

  it("does not offer a chip whose own syntax is broken", async () => {
    const source = chip("Gate", "  Nand(a=a b=b, out=out);");

    expect(await customChipOf(source, "p", projectWith({}))).toBeUndefined();
  });

  it("does not offer a chip that loads a damaged chip", async () => {
    const damaged = chip("Child", "  Nand(a=a b=b, out=out);");
    const source = chip("Gate", "  Child(a=a, b=b, out=out);");

    expect(
      await customChipOf(source, "p", projectWith({ "p/Child.hdl": damaged })),
    ).toBeUndefined();
  });
});

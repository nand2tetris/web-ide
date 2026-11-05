import {
  FileSystem,
  ObjectFileSystemAdapter,
} from "@davidsouther/jiffies/fs.ts";
import { describe, expect, it, vi } from "vitest";
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

function boundedProject(files: Record<string, string>) {
  const fs = projectWith(files);
  const readFile = fs.readFile.bind(fs);
  const reads: string[] = [];
  vi.spyOn(fs, "readFile").mockImplementation(async (...args) => {
    reads.push(args[0]);
    // Stop a broken cycle guard without leaving recursion running after the test.
    if (reads.length > Object.keys(files).length) {
      throw new Error("Repeated dependency load");
    }
    return readFile(...args);
  });
  return { fs, reads };
}

describe("custom chip completions", () => {
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

  it("offers a chip whose custom dependency builds", async () => {
    const child = chip("Child", "  Nand(a=a, b=b, out=out);");
    const source = chip("Gate", "  Child(a=a, b=b, out=out);");

    expect(
      await customChipOf(source, "p", projectWith({ "p/Child.hdl": child })),
    ).toEqual({ name: "Gate", signature: "Gate(a= , b= , out= );" });
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

  const cycles: {
    name: string;
    files: Record<string, string>;
    reads: string[];
  }[] = [
    {
      name: "Cycle",
      files: { "p/Cycle.hdl": chip("Cycle", "  Cycle(a=a, b=b, out=out);") },
      reads: [],
    },
    {
      name: "First",
      files: {
        "p/First.hdl": chip("First", "  Second(a=a, b=b, out=out);"),
        "p/Second.hdl": chip("Second", "  First(a=a, b=b, out=out);"),
      },
      reads: ["p/Second.hdl"],
    },
  ];

  it.each(cycles)(
    "rejects the cycle rooted at $name before offering the next valid chip",
    async ({ name, files, reads }) => {
      const project = boundedProject(files);

      expect(
        await customChipOf(files[`p/${name}.hdl`], "p", project.fs),
      ).toBeUndefined();
      expect(project.reads).toEqual(reads);
      expect(
        await customChipOf(
          chip("Gate", "  Nand(a=a, b=b, out=out);"),
          "p",
          project.fs,
        ),
      ).toEqual({ name: "Gate", signature: "Gate(a= , b= , out= );" });
    },
  );

  it("offers a chip whose independent dependencies share a chip", async () => {
    const source = chip(
      "Gate",
      "  Left(a=a, b=b, out=middle);",
      "  Right(a=middle, b=b, out=out);",
    );
    const fs = projectWith({
      "p/Left.hdl": chip("Left", "  Shared(a=a, b=b, out=out);"),
      "p/Right.hdl": chip("Right", "  Shared(a=a, b=b, out=out);"),
      "p/Shared.hdl": chip("Shared", "  Nand(a=a, b=b, out=out);"),
    });

    expect(await customChipOf(source, "p", fs)).toEqual({
      name: "Gate",
      signature: "Gate(a= , b= , out= );",
    });
  });

  it("offers concurrent candidates that share a custom dependency", async () => {
    const fs = projectWith({
      "p/Shared.hdl": chip("Shared", "  Nand(a=a, b=b, out=out);"),
    });

    expect(
      await Promise.all(
        ["First", "Second"].map((name) =>
          customChipOf(chip(name, "  Shared(a=a, b=b, out=out);"), "p", fs),
        ),
      ),
    ).toEqual([
      { name: "First", signature: "First(a= , b= , out= );" },
      { name: "Second", signature: "Second(a= , b= , out= );" },
    ]);
  });
});

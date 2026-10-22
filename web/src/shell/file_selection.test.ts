import { FileSelectionRef } from "./file_select";
import { baseName, readFirstSelection, readSelection } from "./file_selection";

const entry = (name: string, dir = false) => ({
  name,
  isFile: () => !dir,
  isDirectory: () => dir,
});

function makeFs(files: Record<string, string>, dirs: Record<string, string[]>) {
  return {
    readFile: vi.fn(async (path: string) => {
      if (!(path in files)) throw new Error(`no ${path}`);
      return files[path];
    }),
    scandir: vi.fn(async (path: string) =>
      (dirs[path] ?? []).map((n) => entry(n, n.indexOf(".") < 0)),
    ),
  } as never;
}

describe("file selection", () => {
  const fs = makeFs(
    { "/p/A.vm": "a", "/p/B.vm": "b", "/p/C.tst": "c" },
    { "/p": ["A.vm", "B.vm", "C.tst", "sub"] },
  );

  it("takes the base name", () => {
    expect(baseName("/a/b/c.asm")).toBe("c.asm");
    expect(baseName("c.asm")).toBe("c.asm");
  });

  it("reads a file Path from the fs", async () => {
    const ref: FileSelectionRef = { path: "/p/A.vm", isDir: false };
    expect(await readSelection(fs, ref)).toEqual([
      { name: "A.vm", path: "/p/A.vm", content: "a" },
    ]);
  });

  it("does not suffix-filter an explicitly chosen file", async () => {
    const ref: FileSelectionRef = { path: "/p/C.tst", isDir: false };
    expect((await readSelection(fs, ref, ".vm")).length).toBe(1);
  });

  it("scans a folder Path, filtering by suffix and skipping dirs", async () => {
    const ref: FileSelectionRef = { path: "/p", isDir: true };
    const files = await readSelection(fs, ref, [".vm"]);
    expect(files.map((f) => f.name)).toEqual(["A.vm", "B.vm"]);
    expect(files.map((f) => f.path)).toEqual(["/p/A.vm", "/p/B.vm"]);
  });

  it("passes a LocalFile through without touching the fs", async () => {
    const readFile = vi.fn();
    const scandir = vi.fn();
    const files = await readSelection({ readFile, scandir } as never, {
      name: "X.asm",
      content: "x",
    });
    expect(files).toEqual([{ name: "X.asm", content: "x" }]);
    expect(readFile).not.toHaveBeenCalled();
    expect(scandir).not.toHaveBeenCalled();
  });

  it("filters a LocalFile[] by suffix", async () => {
    const files = await readSelection(
      fs,
      [
        { name: "A.vm", content: "a" },
        { name: "A.tst", content: "t" },
      ],
      ".vm",
    );
    expect(files).toEqual([{ name: "A.vm", content: "a" }]);
  });

  it("returns the first file, or undefined when nothing matches", async () => {
    expect(
      (await readFirstSelection(fs, { path: "/p", isDir: true }, ".vm"))?.name,
    ).toBe("A.vm");
    expect(await readFirstSelection(fs, [], ".vm")).toBeUndefined();
  });
});

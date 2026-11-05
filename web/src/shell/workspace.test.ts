import {
  FileSystem,
  ObjectFileSystemAdapter,
} from "@davidsouther/jiffies/fs.ts";
import { describe, expect, it } from "vitest";
import {
  folderOf,
  projectVfs,
  recordVfs,
  setWorkspaceFileSystem,
  workspacePath,
} from "./workspace";

const listed = (vfs: ReturnType<typeof projectVfs>) =>
  Array.fromAsync(vfs.list());

describe("projectVfs", () => {
  it("streams hdl files of project folders in either layout, as editor URIs", async () => {
    setWorkspaceFileSystem(
      new FileSystem(
        new ObjectFileSystemAdapter({
          projects: {
            "01": { "And.hdl": "class", "And.tst": "x" },
            "02": { "Or.hdl": "y" },
          },
          "03": { "Not.hdl": "z" },
        }),
      ),
    );
    const vfs = projectVfs(".hdl");

    expect((await listed(vfs)).sort()).toEqual([
      "file:///01/And.hdl",
      "file:///02/Or.hdl",
      "file:///03/Not.hdl",
    ]);
    expect(await vfs.read("file:///01/And.hdl")).toBe("class");
    expect(await vfs.read("file:///03/Not.hdl")).toBe("z");
    expect(await vfs.read("file:///01/Nope.hdl")).toBeUndefined();
    expect(await workspacePath("file:///01/And.hdl")).toBe(
      "/projects/01/And.hdl",
    );
    expect(await workspacePath("file:///03/Not.hdl")).toBe("/03/Not.hdl");
    expect(await workspacePath("file:///01/Nope.hdl")).toBeUndefined();
  });

  it("names a file's folder as its group", () => {
    expect(folderOf("file:///01/And.hdl")).toBe("file:///01");
  });
});

describe("recordVfs", () => {
  it("serves files by editor URI and tells listeners about a replacement", async () => {
    const files = recordVfs();
    let changes = 0;
    files.onChange(() => changes++);

    files.set({ Main: "class Main {}", "lib/Util": "class Util {}" });

    expect(await Array.fromAsync(files.vfs.list())).toEqual([
      "file:///Main",
      "file:///lib/Util",
    ]);
    expect(await files.vfs.read("file:///Main")).toBe("class Main {}");
    expect(changes).toBe(1);
  });
});

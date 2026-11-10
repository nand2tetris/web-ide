import {
  FileSystem,
  ObjectFileSystemAdapter,
} from "@davidsouther/jiffies/fs.ts";
import * as Monaco from "monaco-editor";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  attachLanguageServices,
  setLanguageServiceRecovery,
} from "./languageServices";
import {
  jackFiles,
  registerWorkspaceNavigation,
  setWorkspaceFileSystem,
  takeWorkspaceSelection,
} from "./workspace";

const registrations: Monaco.IDisposable[] = [];

function harness() {
  vi.stubGlobal("matchMedia", () => ({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
  for (const id of ["hdl", "jack"]) {
    if (!Monaco.languages.getLanguages().some((language) => language.id === id))
      Monaco.languages.register({ id });
  }
  const providers = {
    definition: vi.spyOn(Monaco.languages, "registerDefinitionProvider"),
    references: vi.spyOn(Monaco.languages, "registerReferenceProvider"),
    rename: vi.spyOn(Monaco.languages, "registerRenameProvider"),
    symbols: vi.spyOn(Monaco.languages, "registerDocumentSymbolProvider"),
    completion: vi.spyOn(Monaco.languages, "registerCompletionItemProvider"),
  };
  const opener = vi.spyOn(Monaco.editor, "registerEditorOpener");
  registrations.push(attachLanguageServices(Monaco));
  return {
    monaco: Monaco,
    opener,
    model: (uri: string, text: string, language = "hdl") =>
      Monaco.editor.createModel(text, language, Monaco.Uri.parse(uri)),
    provider: <T>(language: string, kind: keyof typeof providers) =>
      providers[kind].mock.calls.find(([id]) => id === language)?.[1] as T,
    markers: (model: Monaco.editor.ITextModel, owner = "ohm-semantic") =>
      Monaco.editor.getModelMarkers({ resource: model.uri, owner }),
  };
}

const flush = async () => {
  await vi.advanceTimersByTimeAsync(1000);
};
const custom =
  "CHIP Custom { IN input; OUT output; PARTS: Not(in=input, out=wire); Not(in=wire, out=output); }";
const top = "CHIP Top { IN a; OUT out; PARTS: Custom(input=a, output=out); }";
const fs = (files: Record<string, string>) =>
  setWorkspaceFileSystem(
    new FileSystem(new ObjectFileSystemAdapter({ projects: { "01": files } })),
  );
afterEach(() => {
  for (const registration of registrations.splice(0)) registration.dispose();
  for (const model of Monaco.editor.getModels()) model.dispose();
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe("language service adapter", () => {
  it("publishes delayed diagnostics using the live recovery flag and disposes pending work", async () => {
    vi.useFakeTimers();
    fs({});
    const h = harness();
    const model = h.model(
      "file:///01/Top.hdl",
      "CHIP Top { IN a; OUT out; PARTS: Not(in=a, out=out); }",
    );
    await flush();
    expect(h.markers(model)).toEqual([]);
    model.setValue(
      "CHIP Top { IN a; OUT out; PARTS: ???; Missing(in=a, out=out); }",
    );
    await vi.advanceTimersByTimeAsync(149);
    expect(h.markers(model)).toEqual([]);
    setLanguageServiceRecovery(model, true);
    await vi.advanceTimersByTimeAsync(1);
    expect(h.markers(model).some((m) => m.message.includes("Missing"))).toBe(
      true,
    );
    setLanguageServiceRecovery(model, false);
    expect(h.markers(model)).toEqual([]);
    setLanguageServiceRecovery(model, true);
    expect(h.markers(model).some((m) => m.message.includes("Missing"))).toBe(
      true,
    );
    h.monaco.editor.setModelMarkers(model, "hdl", [
      {
        message: "simulator",
        severity: 8,
        startLineNumber: 1,
        startColumn: 37,
        endLineNumber: 1,
        endColumn: 40,
      },
    ]);
    expect(h.markers(model, "hdl").map((m) => m.message)).toEqual([
      "simulator",
    ]);
    model.setValue("CHIP Top { PARTS: Other(); }");
    model.dispose();
    await flush();
    expect(h.markers(model)).toEqual([]);
    expect(h.markers(model, "hdl").map((m) => m.message)).toEqual([
      "simulator",
    ]);
  });

  it("routes a known closed target through the page opener with its selection", async () => {
    vi.useFakeTimers();
    fs({ "Custom.hdl": custom, "Top.hdl": top });
    const h = harness();
    const open = vi.fn(() => true);
    const unregister = registerWorkspaceNavigation("hdl", open);
    const opener = h.opener.mock.calls[0][0] as Monaco.editor.ICodeEditorOpener;
    const resource = { toString: () => "file:///01/Custom.hdl" } as Monaco.Uri;
    const selection = { lineNumber: 1, column: 18 };
    expect(await opener.openCodeEditor({} as never, resource, selection)).toBe(
      true,
    );
    expect(open).toHaveBeenCalledWith(resource.toString());
    expect(takeWorkspaceSelection(resource.toString())).toEqual(selection);
    unregister();
    expect(await opener.openCodeEditor({} as never, resource)).toBe(false);
  });

  it("keeps closed locations and refreshes public member changes and removed workspace files", async () => {
    vi.useFakeTimers();
    fs({ "Custom.hdl": custom, "Top.hdl": top });
    const h = harness();
    const model = h.model("file:///01/Top.hdl", top);
    await flush();
    const definition = h.provider<Monaco.languages.DefinitionProvider>(
      "hdl",
      "definition",
    );
    const locations = (await definition.provideDefinition(
      model,
      model.getPositionAt(top.indexOf("input")) as Monaco.Position,
      {} as never,
    )) as Monaco.languages.Location[];
    expect(locations.map((l) => l.uri.toString())).toEqual([
      "file:///01/Custom.hdl",
    ]);
    const child = h.model("file:///01/Custom.hdl", custom);
    await flush();
    const refs = h.provider<Monaco.languages.ReferenceProvider>(
      "hdl",
      "references",
    );
    model.dispose();
    await flush();
    const uses = await refs.provideReferences(
      child,
      child.getPositionAt(custom.indexOf("input")) as Monaco.Position,
      { includeDeclaration: false },
      {} as never,
    );
    expect(uses?.map((l) => l.uri.toString())).toContain("file:///01/Top.hdl");
    const reopened = h.model("file:///01/Top.hdl", top);
    child.setValue(custom.replaceAll("input", "other"));
    await flush();
    expect(h.markers(reopened).some((m) => m.message.includes("input"))).toBe(
      true,
    );
    const removed = await definition.provideDefinition(
      reopened,
      reopened.getPositionAt(top.indexOf("input")) as Monaco.Position,
      {} as never,
    );
    expect(removed).toEqual([]);
    child.setValue(custom.replaceAll("Custom", "Other"));
    await flush();
    expect(h.markers(reopened).some((m) => m.message.includes("Custom"))).toBe(
      true,
    );
    child.setValue(custom);
    await flush();
    expect(h.markers(reopened)).toEqual([]);
    child.dispose();
    await flush();
    expect(h.markers(reopened)).toEqual([]);
    fs({ "Top.hdl": top });
    await flush();
    expect(h.markers(reopened).some((m) => m.message.includes("Custom"))).toBe(
      true,
    );
  });

  it("synchronizes a second model before rename and guards identifiers, file identity and closed edits", async () => {
    vi.useFakeTimers();
    fs({ "Custom.hdl": custom, "Top.hdl": top });
    const h = harness();
    const child = h.model("file:///01/Custom.hdl", custom);
    const parent = h.model("file:///01/Top.hdl", top);
    await flush();
    parent.setValue(`// moved\n${top}`);
    const rename = h.provider<Monaco.languages.RenameProvider>("hdl", "rename");
    const at = child.getPositionAt(custom.indexOf("input")) as Monaco.Position;
    const run = (name: string) =>
      rename.provideRenameEdits(child, at, name, {} as never);
    const edits = await run("other");
    const use = edits?.edits.find(
      (edit) =>
        "textEdit" in edit &&
        edit.resource.toString() === parent.uri.toString(),
    ) as Monaco.languages.IWorkspaceTextEdit;
    expect(use.textEdit.range.startLineNumber).toBe(2);
    expect(parent.getValueInRange(use.textEdit.range)).toBe("input");
    expect(use.versionId).toBe(parent.getVersionId());
    await flush();
    expect((await run("other"))?.edits).toEqual(edits?.edits);
    const pending = run("other");
    parent.setValue(`// changed again\n${top}`);
    expect((await pending)?.rejectReason).toBeTruthy();
    await flush();
    expect((await run("a-b"))?.rejectReason).toBeTruthy();
    expect((await run("wire_name"))?.rejectReason).toBeTruthy();
    const identity = await rename.provideRenameEdits(
      child,
      child.getPositionAt(custom.indexOf("Custom")) as Monaco.Position,
      "Other",
      {} as never,
    );
    expect(identity?.rejectReason).toBeTruthy();
    parent.dispose();
    await flush();
    expect((await run("other"))?.rejectReason).toBeTruthy();
  });

  it("replaces the wholesale Jack workspace and uses variable completion kinds", async () => {
    vi.useFakeTimers();
    jackFiles.set({
      Main: "class Main { function void f() { var Helper h; return; } }",
      Helper: "class Helper {}",
    });
    const h = harness();
    const model = h.model(
      "file:///Main",
      "class Main { function void f() { var Helper h; return; } }",
      "jack",
    );
    await flush();
    expect(h.markers(model)).toEqual([]);
    const completion = h.provider<Monaco.languages.CompletionItemProvider>(
      "jack",
      "completion",
    );
    const items = await completion.provideCompletionItems(
      model,
      model.getPositionAt(
        model.getValue().indexOf("return"),
      ) as Monaco.Position,
      {} as never,
      {} as never,
    );
    expect(items?.suggestions.find((item) => item.label === "h")?.kind).toBe(
      h.monaco.languages.CompletionItemKind.Variable,
    );
    const rename = h.provider<Monaco.languages.RenameProvider>(
      "jack",
      "rename",
    );
    expect(
      (
        await rename.provideRenameEdits(
          model,
          model.getPositionAt(
            model.getValue().indexOf("Main"),
          ) as Monaco.Position,
          "Other",
          {} as never,
        )
      )?.rejectReason,
    ).toBeTruthy();
    jackFiles.set({ Main: model.getValue() });
    await flush();
    expect(h.markers(model).some((m) => m.message.includes("Helper"))).toBe(
      true,
    );
  });
});

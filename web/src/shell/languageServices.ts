// Connects the role based language services of HDL and Jack to Monaco: each
// open model of the language is analyzed as it changes, and Monaco asks the
// service for outline, definition, references, rename and completion.

import { REGISTRY } from "@nand2tetris/simulator/chip/builtins/index.js";
import type {
  Analysis,
  Definition,
  LanguageService,
  Offset,
  ReadonlyVfs,
} from "@ohm-js/language";
import type * as monacoT from "monaco-editor";
import { hdlCandidates, hdlSlot } from "../languages/hdlCompletion";
import {
  builtinChipPins,
  hdlLanguage,
  jackLanguage,
} from "../languages/service";
import {
  folderOf,
  jackFiles,
  onWorkspaceFileSystem,
  projectVfs,
} from "./workspace";

type Monaco = typeof monacoT;

const MARKER_OWNER = "ohm-semantic";
const ANALYSIS_DELAY_MS = 150;
const DEPENDENTS_DELAY_MS = 300;

/**
 * The simulator reports syntax and compile errors itself, so the service adds
 * only what it alone knows: unresolved names, duplicates and bad imports.
 */
const isSemantic = (code: string) => !code.startsWith("syntax.");

const SYMBOL_KIND: Record<string, number> = {
  class: 4,
  chip: 4,
  method: 5,
  constructor: 8,
  function: 11,
  field: 7,
  static: 13,
  local: 12,
  parameter: 12,
  pin: 12,
};

const COMPLETION_KIND: Record<string, number> = {
  class: 5,
  chip: 5,
  method: 1,
  constructor: 3,
  function: 2,
  field: 4,
  static: 14,
  local: 5,
  parameter: 5,
  pin: 5,
};

const HDL_KIND = { chip: 5, pin: 4, keyword: 17 } as const;

const SEVERITY = { error: 8, warning: 4, information: 2, hint: 1 } as const;

const attached = new WeakSet<Monaco>();

export function attachLanguageServices(monaco: Monaco) {
  if (attached.has(monaco)) return;
  attached.add(monaco);
  const hdl = projectVfs(".hdl");
  attach(
    monaco,
    "hdl",
    hdlLanguage({ vfs: hdl, group: folderOf }).service(),
    hdl,
    onWorkspaceFileSystem,
  );
  attach(
    monaco,
    "jack",
    jackLanguage({ vfs: jackFiles.vfs }).service(),
    jackFiles.vfs,
    jackFiles.onChange,
  );
}

function attach(
  monaco: Monaco,
  languageId: string,
  service: LanguageService,
  workspace: ReadonlyVfs,
  onWorkspaceChange: (listener: () => void) => () => void,
) {
  const analyzed = new Map<string, number>();
  const timers = new Map<string, ReturnType<typeof setTimeout>>();
  const semantic = new Map<string, monacoT.editor.IMarkerData[]>();
  const published = new Map<string, string>();

  const sync = (model: monacoT.editor.ITextModel) => {
    const key = model.uri.toString();
    if (analyzed.get(key) === model.getVersionId()) return;
    analyzed.set(key, model.getVersionId());
    showMarkers(
      model,
      service.change(key, model.getVersionId(), model.getValue()),
    );
    refreshDependents(key);
  };

  const showMarkers = (
    model: monacoT.editor.ITextModel,
    analysis: Analysis,
  ) => {
    semantic.set(
      model.uri.toString(),
      analysis.diagnostics
        .filter((d) => isSemantic(d.code))
        .map((d) => {
          const start = model.getPositionAt(d.span.start);
          const end = model.getPositionAt(d.span.end);
          return {
            message: d.message,
            severity: SEVERITY[d.severity],
            startLineNumber: start.lineNumber,
            startColumn: start.column,
            endLineNumber: end.lineNumber,
            endColumn: Math.max(end.column, start.column + 1),
          };
        }),
    );
    publishMarkers(model);
  };

  /** Shows the current analysis of `uri` when an editor has it open. */
  const showOpen = (uri: string) => {
    const model = monaco.editor.getModel(monaco.Uri.parse(uri));
    const found = service.analysis(uri);
    if (model && found && model.getLanguageId() === languageId) {
      showMarkers(model, found.analysis);
    }
  };

  /**
   * Other files whose names resolve through `uri` change when it does, so they
   * are reanalyzed once typing pauses.
   */
  const dependentTimers = new Map<string, ReturnType<typeof setTimeout>>();
  const refreshDependents = (uri: string) => {
    clearTimeout(dependentTimers.get(uri));
    dependentTimers.set(
      uri,
      setTimeout(async () => {
        dependentTimers.delete(uri);
        for (const other of service.affected(uri)) {
          await service.refresh(other);
          showOpen(other);
        }
      }, DEPENDENTS_DELAY_MS),
    );
  };

  /** Loads the workspace's files, then shows the editors that were waiting for them. */
  const scan = async () => {
    for await (const uri of service.scan()) showOpen(uri);
  };

  /** Rereads every workspace file after the app swaps its files, then catches up. */
  const reload = async () => {
    for await (const uri of workspace.list()) await service.refresh(uri);
    await scan();
    for (const model of monaco.editor.getModels()) {
      if (model.getLanguageId() === languageId) showOpen(model.uri.toString());
    }
  };
  onWorkspaceChange(() => void reload());
  void scan();

  /**
   * The service's markers, less any that the simulator already reports at the
   * same start (it checks undefined chips and pins itself). The simulator's
   * markers arrive on their own schedule, so this reruns when markers change.
   */
  const publishMarkers = (model: monacoT.editor.ITextModel) => {
    const key = model.uri.toString();
    const reported = monaco.editor.getModelMarkers({
      resource: model.uri,
      owner: languageId,
    });
    const own = (semantic.get(key) ?? []).filter(
      (m) =>
        !reported.some(
          (r) =>
            r.startLineNumber === m.startLineNumber &&
            r.startColumn === m.startColumn,
        ),
    );
    const signature = JSON.stringify(own);
    if (published.get(key) === signature) return;
    published.set(key, signature);
    monaco.editor.setModelMarkers(model, MARKER_OWNER, own);
  };
  monaco.editor.onDidChangeMarkers((uris) => {
    for (const uri of uris) {
      const model = monaco.editor.getModel(uri);
      if (model && semantic.has(uri.toString())) publishMarkers(model);
    }
  });

  const track = (model: monacoT.editor.ITextModel) => {
    if (model.getLanguageId() !== languageId) return;
    const key = model.uri.toString();
    sync(model);
    const changes = model.onDidChangeContent(() => {
      clearTimeout(timers.get(key));
      timers.set(
        key,
        setTimeout(() => sync(model), ANALYSIS_DELAY_MS),
      );
    });
    model.onWillDispose(() => {
      changes.dispose();
      clearTimeout(timers.get(key));
      timers.delete(key);
      analyzed.delete(key);
      semantic.delete(key);
      published.delete(key);
      void service.close(key);
    });
  };
  monaco.editor.getModels().forEach(track);
  monaco.editor.onDidCreateModel(track);
  monaco.editor.onDidChangeModelLanguage(({ model }) => track(model));

  const offsetAt = (
    model: monacoT.editor.ITextModel,
    position: monacoT.Position,
  ) => model.getOffsetAt(position) as Offset;

  const rangeOf = (
    model: monacoT.editor.ITextModel,
    span: { start: number; end: number },
  ) => {
    const start = model.getPositionAt(span.start);
    const end = model.getPositionAt(span.end);
    return new monaco.Range(
      start.lineNumber,
      start.column,
      end.lineNumber,
      end.column,
    );
  };

  /** The model that holds a service URI, when it is open. */
  const modelOf = (uri: string) =>
    monaco.editor.getModel(monaco.Uri.parse(uri));

  const locations = (
    spans: { uri: string; span: { start: number; end: number } }[],
  ) =>
    spans.flatMap(({ uri, span }) => {
      const target = modelOf(uri);
      return target ? [{ uri: target.uri, range: rangeOf(target, span) }] : [];
    });

  monaco.languages.registerDefinitionProvider(languageId, {
    provideDefinition(model, position) {
      sync(model);
      const found = service.definition(
        model.uri.toString(),
        offsetAt(model, position),
      );
      return locations(found.map((d) => ({ uri: d.uri, span: d.nameSpan })));
    },
  });

  monaco.languages.registerReferenceProvider(languageId, {
    provideReferences(model, position, context) {
      sync(model);
      return locations(
        service.references(
          model.uri.toString(),
          offsetAt(model, position),
          context.includeDeclaration,
        ),
      );
    },
  });

  monaco.languages.registerRenameProvider(languageId, {
    resolveRenameLocation(model, position) {
      sync(model);
      const prepared = service.prepareRename(
        model.uri.toString(),
        offsetAt(model, position),
      );
      if (!prepared) {
        return {
          range: new monaco.Range(1, 1, 1, 1),
          text: "",
          rejectReason: "Nothing to rename here.",
        };
      }
      return {
        range: rangeOf(model, prepared.span),
        text: prepared.placeholder,
      };
    },
    provideRenameEdits(model, position, newName) {
      sync(model);
      const edits = service.rename(
        model.uri.toString(),
        offsetAt(model, position),
        newName,
      );
      if (edits.length === 0) {
        return { edits: [], rejectReason: `Cannot rename to '${newName}'.` };
      }
      // Another file that is not open cannot be edited from here, and a rename
      // that leaves some uses behind would break that file.
      if (edits.some((e) => !modelOf(e.uri))) {
        return {
          edits: [],
          rejectReason:
            "This name is also used in files that are not open. Open them to rename it everywhere.",
        };
      }
      return {
        edits: edits.flatMap((e) => {
          const target = modelOf(e.uri);
          return target
            ? [
                {
                  resource: target.uri,
                  versionId: undefined,
                  textEdit: { range: rangeOf(target, e.span), text: e.newText },
                },
              ]
            : [];
        }),
      };
    },
  });

  monaco.languages.registerDocumentSymbolProvider(languageId, {
    provideDocumentSymbols(model) {
      sync(model);
      const definitions = service.documentSymbols(model.uri.toString());
      const isMember = (d: Definition) => d.members && d.members !== d.scope;
      const children = (d: Definition) =>
        isMember(d)
          ? definitions.filter((c) => c !== d && c.scope === d.members)
          : [];
      const nested = new Set(definitions.flatMap(children));
      const symbol = (d: Definition): monacoT.languages.DocumentSymbol => ({
        name: d.name,
        detail: d.kind,
        kind: SYMBOL_KIND[d.kind] ?? 12,
        tags: [],
        range: rangeOf(model, d.span ?? d.nameSpan),
        selectionRange: rangeOf(model, d.nameSpan),
        children: children(d).map(symbol),
      });
      return definitions.filter((d) => !nested.has(d)).map(symbol);
    },
  });

  monaco.languages.registerCompletionItemProvider(languageId, {
    provideCompletionItems(model, position) {
      sync(model);
      const word = model.getWordUntilPosition(position);
      const range = new monaco.Range(
        position.lineNumber,
        word.startColumn,
        position.lineNumber,
        word.endColumn,
      );
      const uri = model.uri.toString();
      const definitions = service.completion(uri, offsetAt(model, position));
      if (languageId === "hdl") {
        const before = model.getValueInRange(
          new monaco.Range(1, 1, position.lineNumber, position.column),
        );
        return {
          suggestions: hdlCandidates(hdlSlot(before), {
            definitions,
            uri,
            builtinChips: [...REGISTRY.keys()],
            builtinPins: builtinChipPins,
          }).map((c) => ({
            label: c.label,
            kind: HDL_KIND[c.kind],
            detail: c.kind,
            insertText: c.label,
            range,
          })),
        };
      }
      return {
        suggestions: definitions.map((d) => ({
          label: d.name,
          kind: COMPLETION_KIND[d.kind] ?? 5,
          detail: d.kind,
          insertText: d.name,
          range,
        })),
      };
    },
  });
}

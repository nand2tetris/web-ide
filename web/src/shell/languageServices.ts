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
  validIdentifier,
} from "../languages/service";
import {
  folderOf,
  jackFiles,
  onWorkspaceFileSystem,
  openWorkspaceDocument,
  projectVfs,
  takeWorkspaceSelection,
} from "./workspace";

type Monaco = typeof monacoT;

const MARKER_OWNER = "ohm-semantic";
const ANALYSIS_DELAY_MS = 150;
const DEPENDENTS_DELAY_MS = 300;

/** Syntax markers come from the simulator; semantic markers yield to its same-start markers. */
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

const SEVERITY = { error: 8, warning: 4, information: 2, hint: 1 } as const;

const attached = new WeakMap<Monaco, monacoT.IDisposable>();
const recovery = new WeakMap<monacoT.editor.ITextModel, boolean>();
const recoveryListeners = new Set<(model: monacoT.editor.ITextModel) => void>();

/** Changes publication policy without restricting completion or navigation analysis. */
export function setLanguageServiceRecovery(
  model: monacoT.editor.ITextModel,
  enabled: boolean,
) {
  recovery.set(model, enabled);
  for (const listener of recoveryListeners) listener(model);
}

export function attachLanguageServices(monaco: Monaco) {
  const existing = attached.get(monaco);
  if (existing) return existing;
  const opener = monaco.editor.registerEditorOpener({
    async openCodeEditor(_source, resource, selection) {
      const opened = await openWorkspaceDocument(
        resource.toString(),
        selection,
      );
      if (!opened) return false;
      for (const editor of monaco.editor.getEditors()) {
        if (editor.getModel()?.uri.toString() !== resource.toString()) continue;
        const range =
          selection &&
          ("endLineNumber" in selection
            ? selection
            : new monaco.Range(
                selection.lineNumber,
                selection.column,
                selection.lineNumber,
                selection.column,
              ));
        if (range) {
          editor.setSelection(range);
          editor.revealRangeInCenter(range);
        }
        takeWorkspaceSelection(resource.toString());
        editor.focus();
        return true;
      }
      return true;
    },
  });
  const hdl = projectVfs(".hdl");
  const hdlAdapter = attach(
    monaco,
    "hdl",
    hdlLanguage({ vfs: hdl, group: folderOf }).service(),
    hdl,
    onWorkspaceFileSystem,
  );
  const jackAdapter = attach(
    monaco,
    "jack",
    jackLanguage({ vfs: jackFiles.vfs }).service(),
    jackFiles.vfs,
    jackFiles.onChange,
  );
  const registration = {
    dispose() {
      opener.dispose();
      hdlAdapter.dispose();
      jackAdapter.dispose();
      attached.delete(monaco);
    },
  };
  attached.set(monaco, registration);
  return registration;
}

function attach(
  monaco: Monaco,
  languageId: string,
  service: LanguageService,
  workspace: ReadonlyVfs,
  onWorkspaceChange: (listener: () => void) => () => void,
) {
  const subscriptions: monacoT.IDisposable[] = [];
  const cleanupModels = new Map<monacoT.editor.ITextModel, () => void>();
  let disposed = false;
  const completion = monaco.languages.CompletionItemKind;
  const completionKind: Record<string, monacoT.languages.CompletionItemKind> = {
    class: completion.Class,
    chip: completion.Class,
    method: completion.Method,
    constructor: completion.Constructor,
    function: completion.Function,
    field: completion.Field,
    static: completion.Variable,
    local: completion.Variable,
    parameter: completion.Variable,
    pin: completion.Variable,
  };
  const hdlKind = {
    chip: completion.Class,
    pin: completion.Field,
    keyword: completion.Keyword,
  };
  const modelOf = (uri: string) =>
    monaco.editor.getModel(monaco.Uri.parse(uri));
  const known = new Set<string>();
  const latest = new Map<string, Analysis>();
  const analyzed = new Map<string, number>();
  const timers = new Map<string, ReturnType<typeof setTimeout>>();
  const semantic = new Map<string, monacoT.editor.IMarkerData[]>();
  const published = new Map<string, string>();

  const sync = (model: monacoT.editor.ITextModel) => {
    const key = model.uri.toString();
    if (analyzed.get(key) === model.getVersionId()) return;
    known.add(key);
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
    latest.set(model.uri.toString(), analysis);
    semantic.set(
      model.uri.toString(),
      analysis.diagnostics
        .filter(
          (d) =>
            isSemantic(d.code) &&
            (!analysis.hasSkippedInput || recovery.get(model)),
        )
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

  const showOpen = (uri: string) => {
    const model = monaco.editor.getModel(monaco.Uri.parse(uri));
    const found = service.analysis(uri);
    if (
      !disposed &&
      model &&
      found &&
      !found.stale &&
      model.getLanguageId() === languageId
    ) {
      showMarkers(model, found.analysis);
    }
  };

  /** Recheck dependents after typing pauses so they see current declarations. */
  const dependentTimers = new Map<string, ReturnType<typeof setTimeout>>();
  const refreshDependents = (uri: string) => {
    clearTimeout(dependentTimers.get(uri));
    dependentTimers.set(
      uri,
      setTimeout(async () => {
        dependentTimers.delete(uri);
        await refreshProject(uri);
      }, DEPENDENTS_DELAY_MS),
    );
  };

  // The pinned companion tracks top-level export identity, not public members.
  // Refresh this project's known documents for both kinds of changes.
  const refreshProject = async (uri: string) => {
    service.affected(uri);
    const others = [...known].filter(
      (other) =>
        other !== uri &&
        (languageId === "jack" || folderOf(other) === folderOf(uri)),
    );
    for (const other of others) await service.refresh(other);
    for (const other of others) showOpen(other);
  };

  const scan = async () => {
    for await (const uri of service.scan()) {
      if (disposed) return;
      known.add(uri);
      showOpen(uri);
    }
  };

  const reload = async () => {
    const present = new Set<string>();
    for await (const uri of workspace.list()) present.add(uri);
    for (const uri of new Set([...known, ...present])) {
      await service.refresh(uri);
      if (present.has(uri) || modelOf(uri)) known.add(uri);
      else known.delete(uri);
    }
    await scan();
    // Existing documents must see the replacement's complete export index.
    for (const uri of known) await service.refresh(uri);
    for (const model of monaco.editor.getModels()) {
      if (model.getLanguageId() === languageId) showOpen(model.uri.toString());
    }
  };
  const unsubscribeWorkspace = onWorkspaceChange(() => void reload());
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
  subscriptions.push(
    monaco.editor.onDidChangeMarkers((uris) => {
      for (const uri of uris) {
        const model = monaco.editor.getModel(uri);
        if (model && semantic.has(uri.toString())) publishMarkers(model);
      }
    }),
  );

  const recoveryChanged = (model: monacoT.editor.ITextModel) => {
    const analysis = latest.get(model.uri.toString());
    if (model.getLanguageId() === languageId && analysis)
      showMarkers(model, analysis);
  };
  recoveryListeners.add(recoveryChanged);

  const tracked = new WeakSet<monacoT.editor.ITextModel>();
  const track = (model: monacoT.editor.ITextModel) => {
    if (model.getLanguageId() !== languageId || tracked.has(model)) return;
    tracked.add(model);
    const key = model.uri.toString();
    sync(model);
    const changes = model.onDidChangeContent(() => {
      clearTimeout(timers.get(key));
      timers.set(
        key,
        setTimeout(() => sync(model), ANALYSIS_DELAY_MS),
      );
    });
    const cleanup = () => {
      cleanupModels.delete(model);
      changes.dispose();
      clearTimeout(timers.get(key));
      timers.delete(key);
      analyzed.delete(key);
      semantic.delete(key);
      latest.delete(key);
      published.delete(key);
      clearTimeout(dependentTimers.get(key));
      dependentTimers.delete(key);
      monaco.editor.setModelMarkers(model, MARKER_OWNER, []);
      void service.close(key).then(async () => {
        if (!disposed) await refreshProject(key);
      });
    };
    cleanupModels.set(model, cleanup);
    subscriptions.push(model.onWillDispose(cleanup));
  };
  monaco.editor.getModels().forEach(track);
  subscriptions.push(monaco.editor.onDidCreateModel(track));
  subscriptions.push(
    monaco.editor.onDidChangeModelLanguage(({ model }) => track(model)),
  );

  const offsetAt = (
    model: monacoT.editor.ITextModel,
    position: monacoT.Position,
  ) => model.getOffsetAt(position) as Offset;

  const rangeOf = (
    model: { getPositionAt(offset: number): monacoT.IPosition },
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

  const locations = (
    spans: { uri: string; span: { start: number; end: number } }[],
  ) =>
    spans.flatMap(({ uri, span }) => {
      const target = modelOf(uri);
      const text = service.analysis(uri)?.analysis.text;
      const source =
        target ??
        (text === undefined
          ? undefined
          : {
              getPositionAt(offset: number) {
                const lines = text.slice(0, offset).split("\n");
                return {
                  lineNumber: lines.length,
                  column: (lines.at(-1)?.length ?? 0) + 1,
                };
              },
            });
      return source
        ? [{ uri: monaco.Uri.parse(uri), range: rangeOf(source, span) }]
        : [];
    });

  subscriptions.push(
    monaco.languages.registerDefinitionProvider(languageId, {
      provideDefinition(model, position) {
        sync(model);
        const found = service.definition(
          model.uri.toString(),
          offsetAt(model, position),
        );
        return locations(found.map((d) => ({ uri: d.uri, span: d.nameSpan })));
      },
    }),
  );

  subscriptions.push(
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
    }),
  );

  const renameBlocked = (
    model: monacoT.editor.ITextModel,
    position: monacoT.Position,
  ) => {
    const [target] = service.definition(
      model.uri.toString(),
      offsetAt(model, position),
    );
    return target?.kind === "chip" || target?.kind === "class";
  };

  subscriptions.push(
    monaco.languages.registerRenameProvider(languageId, {
      resolveRenameLocation(model, position) {
        sync(model);
        const prepared = service.prepareRename(
          model.uri.toString(),
          offsetAt(model, position),
        );
        if (!prepared || renameBlocked(model, position)) {
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
      async provideRenameEdits(model, position, newName) {
        if (!validIdentifier(languageId, newName)) {
          return {
            edits: [],
            rejectReason: `Invalid ${languageId} identifier '${newName}'.`,
          };
        }
        const models = monaco.editor
          .getModels()
          .filter((m) => m.getLanguageId() === languageId);
        const versions = new Map(models.map((m) => [m, m.getVersionId()]));
        models.forEach(sync);
        await refreshProject(model.uri.toString());
        if (
          models.some(
            (m) => m.isDisposed() || m.getVersionId() !== versions.get(m),
          )
        ) {
          return {
            edits: [],
            rejectReason: "Files changed during rename. Try again.",
          };
        }
        if (renameBlocked(model, position)) {
          return {
            edits: [],
            rejectReason:
              "Renaming a class or chip also requires renaming its file.",
          };
        }
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
                    versionId: target.getVersionId(),
                    textEdit: {
                      range: rangeOf(target, e.span),
                      text: e.newText,
                    },
                  },
                ]
              : [];
          }),
        };
      },
    }),
  );

  subscriptions.push(
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
    }),
  );

  subscriptions.push(
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
              kind: hdlKind[c.kind],
              detail: c.kind,
              insertText: c.label,
              range,
            })),
          };
        }
        return {
          suggestions: definitions.map((d) => ({
            label: d.name,
            kind: completionKind[d.kind] ?? completion.Variable,
            detail: d.kind,
            insertText: d.name,
            range,
          })),
        };
      },
    }),
  );
  return {
    dispose() {
      disposed = true;
      unsubscribeWorkspace();
      recoveryListeners.delete(recoveryChanged);
      for (const timer of [...timers.values(), ...dependentTimers.values()])
        clearTimeout(timer);
      for (const cleanup of cleanupModels.values()) cleanup();
      for (const subscription of subscriptions) subscription.dispose();
    },
  };
}

import MonacoEditor, { type OnMount } from "@monaco-editor/react";
import { Diagnostic, Span } from "@nand2tetris/simulator/languages/base";
import { Action } from "@nand2tetris/simulator/types";
import * as monacoT from "monaco-editor";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { AppContext } from "../App.context";
import { describeDiagnostic } from "./diagnostics";
import { Decoration, HighlightType } from "./editor";
import "./monacoSetup";

const isRangeVisible = (
  editor: monacoT.editor.IStandaloneCodeEditor | undefined,
  range: monacoT.Range,
) => {
  for (const visibleRange of editor?.getVisibleRanges() ?? []) {
    if (visibleRange.containsRange(range)) {
      return true;
    }
  }
  return false;
};

export const makeDecorations = (
  monaco: typeof monacoT | null,
  editor: monacoT.editor.IStandaloneCodeEditor | undefined,
  highlight: Span | undefined,
  additionalDecorations: Decoration[],
  decorations: string[],
  type: HighlightType = "highlight",
  alwaysCenter = true,
): string[] => {
  if (!(editor && highlight)) return decorations;
  const model = editor.getModel();
  if (!model) return decorations;
  const start = model.getPositionAt(highlight.start);
  const end = model.getPositionAt(highlight.end);
  const range = monaco?.Range.fromPositions(start, end);
  const nextDecoration: monacoT.editor.IModelDeltaDecoration[] = [];
  if (range) {
    nextDecoration.push({
      range,
      options: {
        inlineClassName: type == "error" ? "error-highlight" : "highlight",
      },
    });
    if (highlight.start != highlight.end) {
      if (alwaysCenter || !isRangeVisible(editor, range)) {
        editor.revealRangeInCenter(range);
      }
    }
  }
  for (const decoration of additionalDecorations) {
    const range = monaco?.Range.fromPositions(
      model.getPositionAt(decoration.span.start),
      model.getPositionAt(decoration.span.end),
    );
    if (range) {
      nextDecoration.push({
        range,
        options: { inlineClassName: decoration.cssClass },
      });
    }
  }
  return editor.deltaDecorations(decorations, nextDecoration);
};

export const MONACO_LIGHT_THEME = "vs";
export const MONACO_DARK_THEME = "vs-dark";
const NO_DIAGNOSTICS: readonly Diagnostic[] = [];

export const Monaco = ({
  value,
  onChange,
  onCursorPositionChange,
  language,
  path,
  diagnostics = NO_DIAGNOSTICS,
  disabled = false,
  highlight: currentHighlight,
  highlightType = "highlight",
  customDecorations: currentCustomDecorations = [],
  dynamicHeight = false,
  alwaysRecenter = true,
  lineNumberTransform,
}: {
  value: string;
  onChange: Action<string>;
  onCursorPositionChange?: (index: number) => void;
  language: string;
  path: string;
  diagnostics?: readonly Diagnostic[];
  disabled?: boolean;
  highlight?: Span | number;
  highlightType?: HighlightType;
  customDecorations?: Decoration[];
  dynamicHeight?: boolean;
  alwaysRecenter?: boolean;
  lineNumberTransform?: (n: number) => string;
}) => {
  const { theme } = useContext(AppContext);
  const monaco = useRef<typeof monacoT | undefined>(undefined);
  const [height, setHeight] = useState(0);
  const [editorReady, setEditorReady] = useState(false);

  const editor = useRef<monacoT.editor.IStandaloneCodeEditor | undefined>(
    undefined,
  );
  const decorations = useRef<string[]>([]);
  const highlight = useRef<Span | number | undefined>(undefined);
  const customDecorations = useRef<Decoration[]>([]);

  const codeTheme = useCallback(() => {
    const isDark =
      theme === "system"
        ? window.matchMedia("(prefers-color-scheme: dark)").matches
        : theme === "dark";
    return isDark ? MONACO_DARK_THEME : MONACO_LIGHT_THEME;
  }, [theme]);

  const doDecorations = useCallback(() => {
    let newHighlight: Span | undefined;
    if (typeof highlight.current == "number") {
      const lineCount = editor.current?.getModel()?.getLineCount() ?? 0;
      if (highlight.current <= lineCount) {
        const start =
          editor.current
            ?.getModel()
            ?.getOffsetAt({ lineNumber: highlight.current, column: 0 }) ?? 0;
        const end =
          highlight.current == lineCount
            ? (editor.current?.getModel()?.getValueLength() ?? 0)
            : (editor.current?.getModel()?.getOffsetAt({
                lineNumber: highlight.current + 1,
                column: 0,
              }) ?? 1) - 1;
        newHighlight = { start: start, end: end, line: highlight.current };
      }
    } else {
      newHighlight = highlight.current;
    }
    decorations.current = makeDecorations(
      monaco.current || null,
      editor.current,
      // The empty span is load bearing. Removing it hides the initial
      // first-statement highlight in the test view, and setting it to [0, 1]
      // draws a 1-character highlight in the editor view.
      newHighlight ?? { start: 0, end: 0, line: 0 },
      customDecorations.current,
      decorations.current,
      highlightType,
      alwaysRecenter,
    );
  }, [decorations, monaco, editor, highlight, highlightType]);

  const calculateHeight = () => {
    if (dynamicHeight) {
      const contentHeight = editor.current?.getContentHeight();
      if (contentHeight) {
        setHeight(contentHeight);
      }
    }
  };

  // Mark and center highlighted spans
  useEffect(() => {
    highlight.current = currentHighlight;
    doDecorations();
  }, [currentHighlight]);

  useEffect(() => {
    customDecorations.current = currentCustomDecorations;
    doDecorations();
  }, [currentCustomDecorations]);

  const onMount: OnMount = useCallback(
    (ed, mon) => {
      monaco.current = mon;
      editor.current = ed;
      editor.current?.updateOptions({
        fontFamily: `"JetBrains Mono", source-code-pro, Menlo, Monaco,
      Consolas, "Roboto Mono", "Ubuntu Monospace", "Noto Mono", "Oxygen Mono",
      "Liberation Mono", monospace, "Apple Color Emoji", "Segoe UI Emoji",
      "Segoe UI Symbol", "Noto Color Emoji"`,
        fontSize: 16,
        minimap: {
          enabled: false,
        },
        theme: codeTheme(),
        scrollBeyondLastLine: false,
        readOnly: disabled,
        lineNumbers: lineNumberTransform ?? "on",
        renderValidationDecorations: "on",
        folding: false,
        quickSuggestions: {
          other: "inline",
        },
      });

      document.fonts.ready.then(() => {
        monaco.current?.editor.remeasureFonts();
      });

      doDecorations();
      calculateHeight();
      editor.current?.onDidChangeCursorPosition((e) => {
        const index = editor.current?.getModel()?.getOffsetAt(e.position);
        if (index !== undefined) {
          onCursorPositionChange?.(index);
        }
      });
      const model = editor.current?.getModel();
      model?.setEOL(monacoT.editor.EndOfLineSequence.LF);
      setEditorReady(true);
    },
    [codeTheme],
  );

  useEffect(() => {
    if (editor.current === undefined) return;
    editor.current.updateOptions({ lineNumbers: lineNumberTransform ?? "on" });
  }, [lineNumberTransform]);

  useEffect(() => {
    if (editor.current === undefined) return;
    editor.current.updateOptions({ theme: codeTheme() });
  }, [editor, codeTheme]);

  useEffect(() => {
    if (editor.current === undefined) return;
    editor.current.updateOptions({
      readOnly: disabled,
      renderValidationDecorations: "on",
    });
  }, [editor, disabled]);

  useEffect(() => {
    if (!editor.current) return;
    if (!monaco.current) return;
    const model = editor.current.getModel();
    if (model === null) return;
    const markers = diagnostics.flatMap((e) => {
      if (e.span === undefined) return [];
      const startPos = model.getPositionAt(e.span.start);
      const endPos = model.getPositionAt(e.span.end);
      return [
        {
          message: describeDiagnostic(e),
          startColumn: startPos.column,
          startLineNumber: startPos.lineNumber,
          endColumn: endPos.column,
          endLineNumber: endPos.lineNumber,
          severity: 8, // monacoT.MarkerSeverity.Error,
        },
      ];
    });
    monaco.current.editor.setModelMarkers(model, language, markers);
  }, [diagnostics, language, editorReady]);

  const onValueChange = (v = "") => {
    calculateHeight();
    onChange(v);
  };

  return (
    <MonacoEditor
      options={{ readOnly: disabled }}
      value={value}
      language={language}
      path={path}
      onChange={onValueChange}
      onMount={onMount}
      height={dynamicHeight ? height : undefined}
    />
  );
};

export default Monaco;

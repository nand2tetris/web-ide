import MonacoEditor, { type OnMount } from "@monaco-editor/react";
import { CompilationError, Span } from "@nand2tetris/simulator/languages/base";
import { Action } from "@nand2tetris/simulator/types";
import { MonacoBreakpoint } from "monaco-breakpoints";
import * as monacoT from "monaco-editor/esm/vs/editor/editor.api";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { AppContext } from "../App.context";
import { Decoration, HighlightType } from "./editor";

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
      // editor.getSc
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
export const Monaco = ({
  value,
  onChange,
  onCursorPositionChange,
  language,
  error,
  disabled = false,
  highlight: currentHighlight,
  highlightType = "highlight",
  customDecorations: currentCustomDecorations = [],
  dynamicHeight = false,
  alwaysRecenter = true,
  lineNumberTransform,
  setBreakpoints,
}: {
  value: string;
  onChange: Action<string>;
  onCursorPositionChange?: (index: number) => void;
  language: string;
  error?: CompilationError;
  disabled?: boolean;
  highlight?: Span | number;
  highlightType?: HighlightType;
  customDecorations?: Decoration[];
  dynamicHeight?: boolean;
  alwaysRecenter?: boolean;
  lineNumberTransform?: (n: number) => string;
  setBreakpoints?: (n: number[]) => void;
}) => {
  const { theme } = useContext(AppContext);
  const monaco = useRef<typeof monacoT>();
  const [height, setHeight] = useState(0);

  const editor = useRef<monacoT.editor.IStandaloneCodeEditor>();
  const decorations = useRef<string[]>([]);
  const highlight = useRef<Span | number | undefined>(undefined);
  const customDecorations = useRef<Decoration[]>([]);
  const [instance, setInstace] = useState<MonacoBreakpoint>();
  const [b, setB] = useState<boolean>(false);
  const bCallback = useCallback((breakpoints: number[]) => {
    console.log("breakpointChanged: ", breakpoints);
    if (setBreakpoints !== undefined) {
      setBreakpoints(breakpoints);
    }
  }, []);
  useEffect(() => {
    if (instance && !b) {
      console.log("add callback for breakpoints");
      instance.on("breakpointChanged", bCallback);
      setB(true);
    }
  }, [instance, bCallback]);
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
      // I'm not sure why this makes things work, but it is load bearing.
      // Removing the empty span will cause the initial first-statement
      // highlight in the test view to not show. Setting it to [0, 1] will
      // cause a 1-character highlight in the editor view, so don't do that
      // either.
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

  // Set options when mounting
  const onMount: OnMount = useCallback(
    (ed, mon) => {
      if (instance === undefined) {
        setInstace(new MonacoBreakpoint({ editor: ed }));
      }
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
        glyphMargin: true,
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
    },
    [codeTheme],
  );

  useEffect(() => {
    if (editor.current === undefined) return;
    editor.current.updateOptions({ lineNumbers: lineNumberTransform ?? "on" });
  }, [lineNumberTransform]);

  // Set themes
  useEffect(() => {
    if (editor.current === undefined) return;
    editor.current.updateOptions({ theme: codeTheme() });
  }, [editor, codeTheme]);

  // Prevent editing disabled editors
  useEffect(() => {
    if (editor.current === undefined) return;
    editor.current.updateOptions({
      readOnly: disabled,
      renderValidationDecorations: "on",
    });
  }, [editor, disabled]);

  // Add error markers on parse failure
  useEffect(() => {
    if (!editor.current) return;
    if (!monaco.current) return;
    const model = editor.current.getModel();
    if (model === null) return;
    if (error === undefined || error.span === undefined) {
      monaco.current.editor.setModelMarkers(model, language, []);
      return;
    }

    const startPos = model.getPositionAt(error.span.start);
    const endPos = model.getPositionAt(error.span.end);

    monaco.current.editor.setModelMarkers(model, language, [
      {
        message: error.message,
        startColumn: startPos.column,
        startLineNumber: startPos.lineNumber,
        endColumn: endPos.column,
        endLineNumber: endPos.lineNumber,
        severity: 8, // monacoT.MarkerSeverity.Error,
      },
    ]);
  }, [error, editor, monaco, language]);

  const onValueChange = (v = "") => {
    calculateHeight();
    onChange(v);
  };

  return (
    <MonacoEditor
      value={value}
      onChange={onValueChange}
      language={language}
      onMount={onMount}
      height={dynamicHeight ? height : undefined}
    />
  );
};

export default Monaco;

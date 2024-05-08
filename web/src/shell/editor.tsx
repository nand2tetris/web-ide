import { Trans } from "@lingui/macro";
import MonacoEditor, { OnMount, useMonaco } from "@monaco-editor/react";
import type * as monacoT from "monaco-editor/esm/vs/editor/editor.api";
import ohm from "ohm-js";
import {
  CSSProperties,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { AppContext } from "../App.context";

import {
  CompilationError,
  Span,
} from "@nand2tetris/simulator/languages/base.js";

import "./editor.scss";

export const ErrorPanel = ({ error }: { error?: CompilationError }) => {
  return error ? (
    <details className="ErrorPanel" open>
      <summary role="button" className="secondary">
        <Trans>Parse Error</Trans>
      </summary>
      <pre>
        <code>{error?.message}</code>
      </pre>
    </details>
  ) : (
    <></>
  );
};

const Textarea = ({
  value,
  onChange,
  language,
  disabled = false,
}: {
  value: string;
  onChange: (value: string) => void;
  language: string;
  disabled?: boolean;
}) => {
  const [text, setText] = useState(value);
  return (
    <textarea
      data-testid={`editor-${language}`}
      disabled={disabled}
      value={text}
      onChange={(e) => {
        const value = e.target?.value;
        setText(value);
        onChange(value);
      }}
    />
  );
};

const MONACO_LIGHT_THEME = "vs";
const MONACO_DARK_THEME = "vs-dark";

export interface Decoration {
  span: Span;
  cssClass: string;
}

const isRangeVisible = (
  editor: monacoT.editor.IStandaloneCodeEditor | undefined,
  range: monacoT.Range
) => {
  for (const visibleRange of editor?.getVisibleRanges() ?? []) {
    if (visibleRange.containsRange(range)) {
      return true;
    }
  }
  return false;
};

export type HighlightType = "highlight" | "error";

const makeDecorations = (
  monaco: typeof monacoT | null,
  editor: monacoT.editor.IStandaloneCodeEditor | undefined,
  highlight: Span | undefined,
  additionalDecorations: Decoration[],
  decorations: string[],
  type: HighlightType = "highlight",
  alwaysCenter = true
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
      model.getPositionAt(decoration.span.end)
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

const Monaco = ({
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
}: {
  value: string;
  onChange: (value: string) => void;
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
}) => {
  const { theme } = useContext(AppContext);
  const monaco = useMonaco();
  const [height, setHeight] = useState(0);

  const editor = useRef<monacoT.editor.IStandaloneCodeEditor>();
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
            ? editor.current?.getModel()?.getValueLength() ?? 0
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
      monaco,
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
      alwaysRecenter
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
    (ed) => {
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
        folding: false,
        quickSuggestions: {
          other: "inline",
        },
      });
      doDecorations();
      calculateHeight();
      editor.current?.onDidChangeCursorPosition((e) => {
        const index = editor.current?.getModel()?.getOffsetAt(e.position);
        if (index !== undefined) {
          onCursorPositionChange?.(index);
        }
      });
    },
    [codeTheme]
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
    editor.current.updateOptions({ readOnly: disabled });
  }, [editor, disabled]);

  // Add error markers on parse failure
  useEffect(() => {
    if (editor.current === undefined) return;
    if (monaco === null) return;
    const model = editor.current.getModel();
    if (model === null) return;
    if (error === undefined || error.span === undefined) {
      monaco.editor.setModelMarkers(model, language, []);
      return;
    }

    const startPos = model.getPositionAt(error.span.start);
    const endPos = model.getPositionAt(error.span.end);

    monaco.editor.setModelMarkers(model, language, [
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
    <>
      <MonacoEditor
        value={value}
        onChange={onValueChange}
        language={language}
        onMount={onMount}
        height={dynamicHeight ? height : undefined}
      />
    </>
  );
};

export const Editor = ({
  className = "",
  style = {},
  disabled = false,
  value,
  error,
  onChange,
  onCursorPositionChange,
  grammar,
  language,
  highlight,
  highlightType = "highlight",
  customDecorations = [],
  dynamicHeight = false,
  alwaysRecenter = true,
  lineNumberTransform,
}: {
  className?: string;
  style?: CSSProperties;
  disabled?: boolean;
  value: string;
  error?: CompilationError;
  onChange: (source: string) => void;
  onCursorPositionChange?: (index: number) => void;
  grammar?: ohm.Grammar;
  language: string;
  highlight?: Span | number;
  highlightType?: HighlightType;
  customDecorations?: Decoration[];
  dynamicHeight?: boolean;
  alwaysRecenter?: boolean;
  lineNumberTransform?: (n: number) => string;
}) => {
  const { monaco } = useContext(AppContext);

  return (
    <div
      className={`Editor ${dynamicHeight ? "dynamic-height" : ""} ${className}`}
      style={style}
    >
      {monaco.canUse && monaco.wants ? (
        <Monaco
          value={value}
          onChange={onChange}
          onCursorPositionChange={onCursorPositionChange}
          language={language}
          error={error}
          disabled={disabled}
          highlight={highlight}
          highlightType={highlightType}
          customDecorations={customDecorations}
          dynamicHeight={dynamicHeight}
          alwaysRecenter={alwaysRecenter}
          lineNumberTransform={lineNumberTransform}
        />
      ) : (
        <>
          <Textarea
            value={value}
            onChange={onChange}
            language={language}
            disabled={disabled}
          />
          <ErrorPanel error={error} />
        </>
      )}
    </div>
  );
};

import { debounce } from "@davidsouther/jiffies/lib/esm/debounce";
import { Trans } from "@lingui/macro";
import MonacoEditor, { OnMount, useMonaco } from "@monaco-editor/react";
import type * as monacoT from "monaco-editor/esm/vs/editor/editor.api";
import ohm from "ohm-js";
import {
  CSSProperties,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AppContext } from "../App.context";

import {
  Span,
  UNKNOWN_PARSE_ERROR,
} from "@nand2tetris/simulator/languages/base.js";

import "./editor.scss";

export const ErrorPanel = ({ error }: { error?: ohm.MatchResult }) => {
  return error?.failed() ? (
    <details className="ErrorPanel" open>
      <summary role="button" className="secondary">
        <Trans>Parse Error</Trans>
      </summary>
      <pre>
        <code>
          {error?.message ?? error?.shortMessage ?? UNKNOWN_PARSE_ERROR}
        </code>
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

const makeHighlight = (
  monaco: typeof monacoT | null,
  editor: monacoT.editor.IStandaloneCodeEditor | undefined,
  highlight: Span | undefined,
  decorations: string[]
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
      options: { inlineClassName: "highlight" },
    });
    if (highlight.start != highlight.end) {
      editor.revealRangeInCenter(range);
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
  dynamicHeight = false,
  lineNumberTransform,
}: {
  value: string;
  onChange: (value: string) => void;
  onCursorPositionChange?: (index: number) => void;
  language: string;
  error?: ohm.MatchResult | undefined;
  disabled?: boolean;
  highlight?: Span;
  dynamicHeight?: boolean;
  lineNumberTransform?: (n: number) => string;
}) => {
  const { theme } = useContext(AppContext);
  const monaco = useMonaco();
  const [height, setHeight] = useState(0);

  const editor = useRef<monacoT.editor.IStandaloneCodeEditor>();
  const decorations = useRef<string[]>([]);
  const highlight = useRef<Span | undefined>(undefined);

  const codeTheme = useCallback(() => {
    const isDark =
      theme === "system"
        ? window.matchMedia("(prefers-color-scheme: dark)").matches
        : theme === "dark";
    return isDark ? MONACO_DARK_THEME : MONACO_LIGHT_THEME;
  }, [theme]);

  const doHighlight = useCallback(() => {
    decorations.current = makeHighlight(
      monaco,
      editor.current,
      // I'm not sure why this makes things work, but it is load bearing.
      // Removing the empty span will cause the initial first-statement
      // highlight in the test view to not show. Setting it to [0, 1] will
      // cause a 1-character highlight in the editor view, so don't do that
      // either.
      highlight.current ?? { start: 0, end: 0, line: 0 },
      decorations.current
    );
  }, [decorations, monaco, editor, highlight]);

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
    doHighlight();
  }, [currentHighlight]);

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
      });
      doHighlight();
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
    if (error === undefined || error.succeeded()) {
      monaco.editor.setModelMarkers(model, language, []);
      return;
    }
    // Line 7, col 5:
    const { line, column, message } =
      /Line (?<line>\d+), col (?<column>\d+): (?<message>.*)/.exec(
        error.shortMessage ?? ""
      )?.groups ?? { line: 1, column: 1, message: "could not parse error" };
    const startLineNumber = Number(line);
    const endLineNumber = startLineNumber;
    const startColumn = Number(column);
    const restOfLine = model
      .getLineContent(startLineNumber)
      .substring(startColumn - 1);
    let endColumn =
      startColumn + (restOfLine.match(/([^\s]+)/)?.[0].length ?? 1);
    if (endColumn <= startColumn) {
      endColumn = startColumn + 1;
    }

    monaco.editor.setModelMarkers(model, language, [
      {
        message,
        startColumn,
        startLineNumber,
        endColumn,
        endLineNumber,
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
  onChange,
  onCursorPositionChange,
  grammar,
  language,
  highlight,
  dynamicHeight = false,
  lineNumberTransform,
}: {
  className?: string;
  style?: CSSProperties;
  disabled?: boolean;
  value: string;
  onChange: (source: string) => void;
  onCursorPositionChange?: (index: number) => void;
  grammar?: ohm.Grammar;
  language: string;
  highlight?: Span;
  dynamicHeight?: boolean;
  lineNumberTransform?: (n: number) => string;
}) => {
  const [error, setError] = useState<ohm.MatchResult>();
  const { monaco } = useContext(AppContext);

  const parse = useCallback(
    (text = "") => {
      if (grammar) {
        const parsed = grammar.match(text);
        setError(parsed.failed() ? parsed : undefined);
      }
    },
    [setError, grammar]
  );

  useEffect(() => parse(value), [parse, value]);
  const doParse = useMemo(() => debounce(parse, 500), [parse]);

  const onChangeCB = useCallback(
    (text = "") => {
      onChange(text);
      doParse(text);
    },
    [doParse, onChange]
  );

  return (
    <div
      className={`Editor ${dynamicHeight ? "dynamic-height" : ""} ${className}`}
      style={style}
    >
      {monaco.canUse && monaco.wants ? (
        <Monaco
          value={value}
          onChange={onChangeCB}
          onCursorPositionChange={onCursorPositionChange}
          language={language}
          error={error}
          disabled={disabled}
          highlight={highlight}
          dynamicHeight={dynamicHeight}
          lineNumberTransform={lineNumberTransform}
        />
      ) : (
        <>
          <Textarea
            value={value}
            onChange={onChangeCB}
            language={language}
            disabled={disabled}
          />
          <ErrorPanel error={error} />
        </>
      )}
    </div>
  );
};

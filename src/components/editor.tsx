import { debounce } from "@davidsouther/jiffies/lib/esm/debounce";
import { Trans } from "@lingui/macro";
import MonacoEditor, { Monaco } from "@monaco-editor/react";
import * as monacoT from "monaco-editor/esm/vs/editor/editor.api";
import { OnMount } from "@monaco-editor/react";
import ohm from "ohm-js";
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AppContext } from "../App.context";

import { UNKNOWN_PARSE_ERROR } from "../languages/base";

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

export const Editor = ({
  className = "",
  value,
  onChange,
  grammar,
  language,
}: {
  className?: string;
  value: string;
  onChange: (source: string) => void;
  grammar: ohm.Grammar;
  language: string;
}) => {
  const [error, setError] = useState<ohm.MatchResult>();
  const { theme } = useContext(AppContext);

  const parse = useCallback(
    (text: string = "") => {
      const parsed = grammar.match(text);
      setError(parsed.failed() ? parsed : undefined);
    },
    [setError, grammar]
  );

  useEffect(() => parse(value), [parse, value]);
  const doParse = useMemo(() => debounce(parse, 500), [parse]);

  const onChangeCB = useCallback(
    (text: string = "") => {
      onChange(text);
      doParse(text);
    },
    [doParse, onChange]
  );

  const editor = useRef<monacoT.editor.IStandaloneCodeEditor>();
  const monaco = useRef<Monaco>();

  useEffect(() => {
    const isDark =
      theme === "system"
        ? window.matchMedia("prefers-color-scheme: dark").matches
        : theme === "dark";
    editor.current?.updateOptions({
      theme: isDark ? "vs-dark" : "vs",
    });
  }, [editor, theme]);

  useEffect(() => {
    if (editor.current === undefined) return;
    if (monaco.current === undefined) return;
    const model = editor.current.getModel();
    if (model === null) return;
    if (error === undefined || error.succeeded()) {
      monaco.current.editor.setModelMarkers(model, language, []);
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

    monaco.current.editor.setModelMarkers(model, language, [
      {
        message,
        startColumn,
        startLineNumber,
        endColumn,
        endLineNumber,
        severity: monacoT.MarkerSeverity.Error,
      },
    ]);
  }, [error, editor, monaco, language]);

  const onMount: OnMount = useCallback((ed, mon) => {
    editor.current = ed;
    monaco.current = mon;
    editor.current?.updateOptions({
      fontFamily: `"JetBrains Mono", source-code-pro, Menlo, Monaco,
      Consolas, "Roboto Mono", "Ubuntu Monospace", "Noto Mono", "Oxygen Mono",
      "Liberation Mono", monospace, "Apple Color Emoji", "Segoe UI Emoji",
      "Segoe UI Symbol", "Noto Color Emoji"`,
      fontSize: 16,
      wordWrap: 'wordWrapColumn',
      wordWrapColumn: 40,
      wrappingIndent: 'indent',
      minimap: {
        enabled: false,
      },
    });
  }, []);

  return (
    <div
      className={`Editor flex ${className}`}
      data-testid={`editor-${language}`}
    >
      <MonacoEditor
        value={value}
        onChange={onChangeCB}
        language={language}
        onMount={onMount}
      />
      {/* <ErrorPanel error={error} /> */}
    </div>
  );
};

import { debounce } from "@davidsouther/jiffies/lib/esm/debounce";
import { Trans } from "@lingui/macro";
import MonacoEditor from "@monaco-editor/react";
import { OnMount } from "@monaco-editor/react";
import ohm from "ohm-js";
import { useCallback, useEffect, useMemo, useState } from "react";

import { UNKNOWN_PARSE_ERROR } from "../languages/base";

import "./editor.scss";

export const ErrorPanel = ({ error }: { error: string }) => {
  return error.length ? (
    <details className="ErrorPanel" open>
      <summary role="button" className="secondary">
        <Trans>Parse Error</Trans>
      </summary>
      <pre>
        <code>{error}</code>
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
  const [error, setError] = useState("");

  const parse = useCallback(
    (text: string = "") => {
      const parsed = grammar.match(text);
      setError(
        parsed.failed()
          ? parsed.message ?? parsed.shortMessage ?? UNKNOWN_PARSE_ERROR
          : ""
      );
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

  const onMount: OnMount = useCallback((editor) => {
    editor.updateOptions({
      fontFamily: `"JetBrains Mono", source-code-pro, Menlo, Monaco,
      Consolas, "Roboto Mono", "Ubuntu Monospace", "Noto Mono", "Oxygen Mono",
      "Liberation Mono", monospace, "Apple Color Emoji", "Segoe UI Emoji",
      "Segoe UI Symbol", "Noto Color Emoji"`,
      fontSize: 16,
      minimap: {
        enabled: false,
      },
    });
  }, []);

  return (
    <div className={`Editor flex ${className}`}>
      <MonacoEditor
        value={value}
        onChange={onChangeCB}
        language={language}
        onMount={onMount}
      />
      <ErrorPanel error={error} />
    </div>
  );
};

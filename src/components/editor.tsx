import ohm from "ohm-js";
import { Trans } from "@lingui/macro";
import MonacoEditor, { OnMount } from "@monaco-editor/react";
import { useCallback, useState } from "react";
import "./editor.scss";
import { UNKNOWN_PARSE_ERROR } from "../languages/base";

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

  const onChangeCB = useCallback(
    (text: string = "") => {
      onChange(text);
      const parsed = grammar.match(text);
      if (parsed.failed()) {
        setError(parsed.message ?? parsed.shortMessage ?? UNKNOWN_PARSE_ERROR);
      } else {
        setError("");
      }
    },
    [onChange, setError, grammar]
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
        theme="vs"
        onMount={onMount}
      />
      <ErrorPanel error={error} />
    </div>
  );
};

import ohm from "ohm-js";
import { Trans } from "@lingui/macro";
import { useState } from "react";
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
  source,
  onSourceChange,
  grammar,
}: {
  className?: string;
  source: string;
  onSourceChange: (source: string) => void;
  grammar: ohm.Grammar;
}) => {
  const [text, setText] = useState(source);
  const [error, setError] = useState("");

  const onChange = (text: string) => {
    onSourceChange(text);
    setText(text);
    const parsed = grammar.match(text);
    if (parsed.failed()) {
      setError(parsed.message ?? parsed.shortMessage ?? UNKNOWN_PARSE_ERROR);
    }
  };

  return (
    <div className={`Editor flex ${className}`}>
      <textarea value={text} onChange={(e) => onChange(e.target.value)} />
      <ErrorPanel error={error} />
    </div>
  );
};

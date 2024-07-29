import { Trans } from "@lingui/macro";
import { type Grammar } from "ohm-js";
import { CSSProperties, lazy, Suspense, useContext, useState } from "react";
import { AppContext } from "../App.context";

import {
  CompilationError,
  Span,
} from "@nand2tetris/simulator/languages/base.js";

import { Action } from "@nand2tetris/simulator/types";
import "./editor.scss";

const Monaco = lazy(() => import("./Monaco"));

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
  onChange: Action<string>;
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

export interface Decoration {
  span: Span;
  cssClass: string;
}

export type HighlightType = "highlight" | "error";

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
  onChange: Action<string>;
  onCursorPositionChange?: (index: number) => void;
  grammar?: Grammar;
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
        <Suspense fallback="Loading...">
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
        </Suspense>
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

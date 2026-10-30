import { Trans } from "@lingui/react/macro";
import { useStateInitializer } from "@nand2tetris/components/react";
import { Diagnostic, Span } from "@nand2tetris/simulator/languages/base.js";
import { type Grammar } from "ohm-js";
import { CSSProperties, lazy, Suspense, useContext } from "react";
import { AppContext } from "../App.context";
import { describeDiagnostic } from "./diagnostics";

import "./editor.scss";
import { Action } from "@nand2tetris/simulator/types";

const Monaco = lazy(() => import("./Monaco"));

const NO_DIAGNOSTICS: readonly Diagnostic[] = [];

export const ErrorPanel = ({
  diagnostics = [],
  file,
}: {
  diagnostics?: readonly Diagnostic[];
  file?: string;
}) => {
  return diagnostics.length > 0 ? (
    <details className="ErrorPanel" open>
      <summary role="button" className="secondary">
        {file === undefined ? (
          <Trans>Parse Error</Trans>
        ) : (
          <Trans>Errors in {file}</Trans>
        )}
      </summary>
      <pre>
        <code>{diagnostics.map(describeDiagnostic).join("\n")}</code>
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
  const [text, setText] = useStateInitializer(value);
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
  diagnostics,
  dependencyDiagnostics,
  onChange,
  onCursorPositionChange,
  grammar,
  language,
  path,
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
  path: string;
  diagnostics?: readonly Diagnostic[];
  /**
   * The diagnostics of other files, by path. Their spans belong to those
   * files, so each list shows in a panel that names its file, never as a marker.
   */
  dependencyDiagnostics?: Record<string, readonly Diagnostic[]>;
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
  const list = diagnostics ?? NO_DIAGNOSTICS;
  const dependencies = Object.entries(dependencyDiagnostics ?? {});

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
            path={path}
            language={language}
            diagnostics={list}
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
          <ErrorPanel diagnostics={list} />
        </>
      )}
      {dependencies.length > 0 && (
        <div className="dependency-diagnostics">
          {dependencies.map(([file, fileDiagnostics]) => (
            <ErrorPanel key={file} file={file} diagnostics={fileDiagnostics} />
          ))}
        </div>
      )}
    </div>
  );
};

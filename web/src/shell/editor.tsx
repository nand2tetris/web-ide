import { Trans } from "@lingui/react/macro";
import { useStateInitializer } from "@nand2tetris/components/react";
import { BaseContext } from "@nand2tetris/components/stores/base.context.js";
import {
  Diagnostic,
  DiagnosticCode,
  Span,
  Stage,
} from "@nand2tetris/simulator/languages/diagnostic.js";
import { type Grammar } from "ohm-js";
import { CSSProperties, lazy, Suspense, useContext, useMemo } from "react";
import { AppContext } from "../App.context";
import { describeDiagnostic } from "./diagnostics";

import "./editor.scss";
import { Action } from "@nand2tetris/simulator/types";

const Monaco = lazy(() => import("./Monaco"));

const NO_DIAGNOSTICS: readonly Diagnostic[] = [];

const sourceOrder = (a: Diagnostic, b: Diagnostic) =>
  a.span === undefined
    ? b.span === undefined
      ? 0
      : 1
    : b.span === undefined
      ? -1
      : a.span.start - b.span.start || b.span.end - a.span.end;

const stageOrder = (problem: Diagnostic) => {
  if (
    problem.stage === Stage.LEX ||
    problem.stage === Stage.PARSE ||
    problem.code === DiagnosticCode.Syntax.EXPECTED
  )
    return 0;
  if (problem.stage === Stage.SEMANTIC || problem.stage === Stage.COMPILE)
    return 1;
  return 2;
};

const selectProblems = (
  diagnostics: readonly Diagnostic[],
  showAll: boolean,
) => {
  const ordered = [...diagnostics].sort(
    showAll
      ? sourceOrder
      : (a, b) => stageOrder(a) - stageOrder(b) || sourceOrder(a, b),
  );
  return showAll ? ordered : ordered.slice(0, 1);
};

export const ErrorPanel = ({
  diagnostics = [],
  file,
  showFirst = false,
  additionalCount = 0,
}: {
  diagnostics?: readonly Diagnostic[];
  file?: string;
  showFirst?: boolean;
  additionalCount?: number;
}) => {
  return diagnostics.length > 0 ? (
    <details className="ErrorPanel" open>
      <summary role="button" className="secondary">
        {file === undefined ? (
          <Trans>Problems</Trans>
        ) : (
          <Trans>Problems in {file}</Trans>
        )}
      </summary>
      <ol>
        {diagnostics.map((problem, index) => {
          const message = describeDiagnostic(problem);
          return (
            <li key={index}>
              {showFirst ? (
                additionalCount > 0 ? (
                  <Trans>
                    First problem: {message} (and {additionalCount} more)
                  </Trans>
                ) : (
                  <Trans>First problem: {message}</Trans>
                )
              ) : (
                message
              )}
            </li>
          );
        })}
      </ol>
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
  const { attemptRecovery } = useContext(BaseContext);
  const list = diagnostics ?? NO_DIAGNOSTICS;
  const visibleProblems = useMemo(
    () => selectProblems(list, attemptRecovery),
    [list, attemptRecovery],
  );
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
            diagnostics={visibleProblems}
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
        <Textarea
          value={value}
          onChange={onChange}
          language={language}
          disabled={disabled}
        />
      )}
      <ErrorPanel
        diagnostics={visibleProblems}
        showFirst={!attemptRecovery}
        additionalCount={list.length - visibleProblems.length}
      />
      {dependencies.length > 0 && (
        <div className="dependency-diagnostics">
          {dependencies.map(([file, fileDiagnostics]) => {
            const visible = selectProblems(fileDiagnostics, attemptRecovery);
            return (
              <ErrorPanel
                key={file}
                file={file}
                diagnostics={visible}
                showFirst={!attemptRecovery}
                additionalCount={fileDiagnostics.length - visible.length}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

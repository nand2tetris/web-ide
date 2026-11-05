import { isValid } from "@nand2tetris/simulator/languages/base.js";
import { CMP } from "@nand2tetris/simulator/languages/cmp.js";
import {
  type Diagnostic,
  Stage,
} from "@nand2tetris/simulator/languages/diagnostic.js";
import type { Action } from "@nand2tetris/simulator/types.js";
import { useMemo, useState } from "react";
import { compare } from "../compare.js";

export type StatusSeverity = "SUCCESS" | "WARNING" | "ERROR" | "INFO";

export type StatusSource = "asm" | "hdl" | "vm" | "tst" | "cmp" | "builtin";

/** A diagnostic a status lists. */
export interface StatusDiagnostic {
  diagnostic: Diagnostic;
}

export interface StatusHeading {
  source: StatusSource;
  count: number;
  /** Count of semantic and compile errors; omitted when zero. */
  semantic?: number;
}

/**
 * What the bottom status bar shows: a message, diagnostics, or both. A status
 * with diagnostics shows those in place of its message, and the UI words each
 * one. A heading identifies the source and diagnostic count. Comparison results
 * are also data so each UI can word them.
 */
export interface Status {
  severity?: StatusSeverity;
  message?: string;
  heading?: StatusHeading;
  comparison?: "equal" | "different";
  diagnostics?: readonly StatusDiagnostic[];
}

/** The actions that show a status in the status bar. */
export interface StatusActions {
  /** Defaults to `ERROR` for diagnostics and `INFO` otherwise. */
  setStatus: Action<Status>;
  clearStatus: Action<void>;
  setFailureStatus: (...args: Parameters<typeof failureStatus>) => void;
}

/** The status the bar shows, with the actions that change it. */
export interface StatusContext extends StatusActions {
  status: Status & { severity: StatusSeverity };
}

/**
 * What `setStatus` takes to report the diagnostics of a file, which it shows
 * as an error. An editor marks each diagnostic that has a span, so the status
 * lists only the others; with `marked: false` no editor shows the file and
 * every diagnostic is listed.
 */
export function failureStatus(
  source: StatusSource,
  diagnostics: readonly Diagnostic[],
  { marked = true }: { marked?: boolean } = {},
): Status {
  const semantic = diagnostics.filter(
    ({ stage }) => stage === Stage.SEMANTIC || stage === Stage.COMPILE,
  ).length;
  return {
    heading: {
      source,
      count: diagnostics.length,
      ...(semantic > 0 ? { semantic } : {}),
    },
    diagnostics: diagnostics
      .filter(({ span }) => !marked || span === undefined)
      .map((diagnostic) => ({ diagnostic })),
  };
}

/** The status after a test run compares its output to the compare file. */
export function comparisonStatus(
  cmp: string,
  out: string,
  { attemptRecovery = false }: { attemptRecovery?: boolean } = {},
): Status {
  const parsed = CMP.parse(cmp, { attemptRecovery });
  if (!isValid(parsed)) {
    return failureStatus("cmp", parsed.diagnostics, { marked: false });
  }
  return compare(cmp, out)
    ? {
        comparison: "equal",
        severity: "SUCCESS",
      }
    : {
        comparison: "different",
        severity: "ERROR",
      };
}

/** The status actions over `show`, which receives each status with its severity filled in. */
export function statusActions(
  show: (status: Status & { severity: StatusSeverity }) => void,
): StatusActions {
  const setStatus: StatusActions["setStatus"] = (status) =>
    show({
      ...status,
      severity:
        status.severity ??
        (status.diagnostics === undefined ? "INFO" : "ERROR"),
    });
  return {
    setStatus,
    clearStatus: () => setStatus({ message: "" }),
    setFailureStatus: (...args) => setStatus(failureStatus(...args)),
  };
}

/** The status context that shows nothing, for a context without a status bar. */
export const NO_STATUS: StatusContext = {
  status: { message: "", severity: "INFO" },
  ...statusActions(() => undefined),
};

/** The status of the status bar and the actions that change it. */
export function useStatus(): StatusContext {
  const [status, show] = useState<StatusContext["status"]>(NO_STATUS.status);
  const actions = useMemo(() => statusActions(show), []);
  return { status, ...actions };
}

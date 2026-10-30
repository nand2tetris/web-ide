import { isValid } from "@nand2tetris/simulator/languages/base.js";
import { CMP } from "@nand2tetris/simulator/languages/cmp.js";
import type { Diagnostic } from "@nand2tetris/simulator/languages/diagnostic.js";
import type { Action } from "@nand2tetris/simulator/types.js";
import { useMemo, useState } from "react";
import { compare } from "../compare.js";

export type StatusSeverity = "SUCCESS" | "WARNING" | "ERROR" | "INFO";

/** A diagnostic a status lists, with the file it belongs to when that is not the open one. */
export interface StatusDiagnostic {
  diagnostic: Diagnostic;
  file?: string;
}

/**
 * What the bottom status bar shows: a message, diagnostics, or both. A status
 * with diagnostics shows those in place of its message, and the UI words each
 * one. It leads with a heading, the file and how many diagnostics that file has,
 * when `heading` is present, and then lists each diagnostic in order.
 */
export interface Status {
  severity?: StatusSeverity;
  message?: string;
  heading?: { file: string; count: number };
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
 * as an error. An editor marks each
 * diagnostic that has a span, so the status lists only the others; with
 * `marked: false` no editor shows the file and every diagnostic is listed.
 * `head` also lists the first diagnostic. `others` holds diagnostics of other
 * files by path; no editor marks them, so they are all listed and counted.
 */
export function failureStatus(
  file: string,
  diagnostics: readonly Diagnostic[],
  {
    marked = true,
    head = false,
    others = {},
  }: {
    marked?: boolean;
    head?: boolean;
    others?: Record<string, readonly Diagnostic[]>;
  } = {},
): Status {
  const unmarked: StatusDiagnostic[] = [
    ...diagnostics
      .filter(({ span }) => !marked || span === undefined)
      .map((diagnostic) => ({ diagnostic })),
    ...Object.entries(others).flatMap(([path, list]) =>
      list.map((diagnostic) => ({ diagnostic, file: path })),
    ),
  ];
  const [first = Object.values(others).flat()[0]] = diagnostics;
  const listed =
    head &&
    first !== undefined &&
    !unmarked.some(({ diagnostic }) => diagnostic === first)
      ? [{ diagnostic: first }, ...unmarked]
      : unmarked;
  const count =
    diagnostics.length +
    Object.values(others).reduce((sum, list) => sum + list.length, 0);
  return {
    heading: { file, count },
    diagnostics: listed,
  };
}

/** The status after a test run compares its output to the compare file. */
export function comparisonStatus(cmp: string, out: string): Status {
  const parsed = CMP.parse(cmp);
  if (!isValid(parsed)) {
    return failureStatus("Compare file", parsed.diagnostics, { marked: false });
  }
  return compare(cmp, out)
    ? {
        message: `Simulation successful: The output file is identical to the compare file`,
        severity: "SUCCESS",
      }
    : {
        message: `Simulation error: The output file differs from the compare file`,
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

import type { Diagnostic } from "@nand2tetris/simulator/languages/diagnostic.js";
import type { Action } from "@nand2tetris/simulator/types.js";
import { useMemo, useState } from "react";

export type StatusSeverity = "SUCCESS" | "WARNING" | "ERROR" | "INFO";

/**
 * What the bottom status bar shows: a message, diagnostics, or both. A status
 * with diagnostics shows those in place of its message, and the UI words each
 * one.
 */
export interface Status {
  severity?: StatusSeverity;
  message?: string;
  diagnostics?: readonly Diagnostic[];
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

/** What `setStatus` takes to report `diagnostics`; the UI words each one. */
export function failureStatus(...diagnostics: Diagnostic[]): {
  diagnostics: readonly Diagnostic[];
} {
  return { diagnostics };
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

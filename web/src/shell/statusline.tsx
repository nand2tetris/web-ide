import { plural, t } from "@lingui/core/macro";
import {
  BaseContext,
  type DiagnosticStatus,
} from "@nand2tetris/components/stores/base.context.js";
import { useContext } from "react";
import { describeDiagnostic } from "./diagnostics";
import "./statusline.scss";

/** The sentences of a diagnostic status, joined as the status line shows them. */
export function describeStatus({
  heading,
  diagnostics,
}: DiagnosticStatus): string {
  const lead =
    heading === undefined ? [] : [describeHeading(heading.file, heading.count)];
  const listed = diagnostics.map(({ diagnostic }) =>
    describeDiagnostic(diagnostic),
  );
  return [...lead, ...listed].join(". ");
}

function describeHeading(file: string, count: number): string {
  const errors = plural(count, {
    one: "# syntax error",
    other: "# syntax errors",
  });
  return t`${file}: ${errors}`;
}

function StatusLine() {
  const { status } = useContext(BaseContext);
  const statusClass = `StatusLine status-${status.severity.toLowerCase()}`;
  return (
    <div className={statusClass}>
      {"diagnostics" in status ? describeStatus(status) : status.message}
    </div>
  );
}

export default StatusLine;

import {
  BaseContext,
  type DiagnosticStatus,
} from "@nand2tetris/components/stores/base.context.js";
import { useContext } from "react";
import { describeDiagnostic } from "./diagnostics";
import "./statusline.scss";

/** The sentences of a diagnostic status, joined as the status line shows them. */
export function describeStatus({ diagnostics }: DiagnosticStatus): string {
  return diagnostics.map(describeDiagnostic).join(". ");
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

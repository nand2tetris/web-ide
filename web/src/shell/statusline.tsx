import { useContext } from "react";
import { BaseContext } from "@nand2tetris/components/stores/base.context.js";

function StatusLine() {
  const { status } = useContext(BaseContext);
  const severityClass = status.severity
    ? `status-${status.severity.toLowerCase()}`
    : "";
  return (
    <div className={`statusline ${severityClass}`.trim()}>{status.message}</div>
  );
}

export default StatusLine;

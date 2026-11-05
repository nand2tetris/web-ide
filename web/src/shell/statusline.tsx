import { BaseContext } from "@nand2tetris/components/stores/base.context.js";
import { type Status } from "@nand2tetris/components/stores/status.js";
import { useContext } from "react";
import "./statusline.scss";

/** The sentences of a status's diagnostics, joined as the status line shows them. */
export function describeStatus({ diagnostics = [] }: Status): string {
  return diagnostics.map(({ message }) => message).join(". ");
}

function StatusLine() {
  const { status } = useContext(BaseContext);
  const statusClass = `StatusLine status-${status.severity.toLowerCase()}`;
  return (
    <div className={statusClass}>
      {status.diagnostics === undefined
        ? status.message
        : describeStatus(status)}
    </div>
  );
}

export default StatusLine;

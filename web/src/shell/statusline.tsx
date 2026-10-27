import { BaseContext } from "@nand2tetris/components/stores/base.context.js";
import { useContext } from "react";
import "./statusline.scss";

function StatusLine() {
  const { status } = useContext(BaseContext);
  const statusClass = `StatusLine status-${status.severity.toLowerCase()}`;
  return <div className={statusClass}>{status.message}</div>;
}

export default StatusLine;

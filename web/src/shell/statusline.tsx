import { useContext } from "react";
import { BaseContext } from "@nand2tetris/components/stores/base.context.js";

function StatusLine() {
  const { status } = useContext(BaseContext);
  return <div>{status}</div>;
}

export default StatusLine;

import { useContext } from "react";
import { BaseContext } from "@computron5k/components/stores/base.context.js";

function StatusLine() {
  const { status } = useContext(BaseContext);
  return <div>{status}</div>;
}

export default StatusLine;

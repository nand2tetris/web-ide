import { useContext } from "react";
import { AppContext } from "../../App.context";

function StatusLine() {
  const { status } = useContext(AppContext);
  return <div>{status}</div>;
}

export default StatusLine;

import { useContext, useEffect, useState } from "react";
import { AppContext } from "../../App.context";

function StatusLine() {
  const { statusLine } = useContext(AppContext);
  const [status, setStatus] = useState("");
  useEffect(() => {
    const sub = statusLine.subscribe(setStatus);
    return () => sub.unsubscribe();
  }, [statusLine]);
  statusLine.subscribe();
  return <div>{status}</div>;
}

export default StatusLine;

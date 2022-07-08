import { createContext, useContext } from "react";

export const StatusLineContext = createContext({
  status: "",
  setStatus(status: string) {
    this.status = status;
  },
});

function StatusLine() {
  const { status } = useContext(StatusLineContext);
  return <div>{status}</div>;
}

export default StatusLine;

import {
  FileSystem,
  ObjectFileSystemAdapter,
} from "@davidsouther/jiffies/lib/esm/fs.js";
import { useDialog } from "@nand2tetris/components/dialog";
import { BaseContext } from "@nand2tetris/components/stores/base.context.js";
import * as Not from "@nand2tetris/projects/project_01/01_not.js";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { StatusSeverity } from "@nand2tetris/components/stores/base.context";

const baseContext: BaseContext = {
  fs: new FileSystem(
    new ObjectFileSystemAdapter({ "projects/01/Not.hdl": Not.hdl }),
  ),
  canUpgradeFs: false,
  async upgradeFs() {},
  closeFs() {},
  storage: {},
  status: { message: "", severity: "INFO" },
  setStatus: (status: string | { message: string; severity?: StatusSeverity }): void => {
    // api.postMessage({ nand2tetris: true, showMessage: status });
    if (typeof status === "string") {
      console.log(status);
    } else {
      console.log(`${status.severity}: ${status.message}`);
    }

  },
  permissionPrompt: {} as ReturnType<typeof useDialog>,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  async requestPermission() {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  loadFs() {},
};

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement,
);
root.render(
  <React.StrictMode>
    <BaseContext.Provider value={baseContext}>
      <App />
    </BaseContext.Provider>
  </React.StrictMode>,
);

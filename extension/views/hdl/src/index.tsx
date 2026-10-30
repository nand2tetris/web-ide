import {
  FileSystem,
  ObjectFileSystemAdapter,
} from "@davidsouther/jiffies/fs.ts";
import { useDialog } from "@nand2tetris/components/dialog";
import { StatusSeverity } from "@nand2tetris/components/stores/base.context";
import { BaseContext } from "@nand2tetris/components/stores/base.context.js";
import {
  NO_STATUS,
  statusActions,
} from "@nand2tetris/components/stores/status.js";
import * as Not from "@nand2tetris/projects/project_01/01_not.js";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

const baseContext: BaseContext = {
  fs: new FileSystem(
    new ObjectFileSystemAdapter({ "projects/01/Not.hdl": Not.hdl }),
  ),
  canUpgradeFs: false,
  async upgradeFs() {
    // no-op
  },
  closeFs() {
    // no-op
  },
  storage: {},
  status: NO_STATUS.status,
  ...statusActions((shown) => {
    // api.postMessage({ nand2tetris: true, showMessage: shown });
    console.log(
      `${shown.severity}: ${shown.message ?? `${shown.diagnostics?.length ?? 0} diagnostics`}`,
    );
  }),
  permissionPrompt: {} as ReturnType<typeof useDialog>,
  async requestPermission() {
    // no-op
  },
  loadFs() {
    // no-op
  },
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

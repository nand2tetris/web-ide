import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BaseContext } from "@nand2tetris/components/stores/base.context.js";
import * as Not from "@nand2tetris/projects/project_01/01_not.js";
import {
  FileSystem,
  ObjectFileSystemAdapter,
} from "@davidsouther/jiffies/lib/esm/fs.js";

const baseContext: BaseContext = {
  fs: new FileSystem(
    new ObjectFileSystemAdapter({ "projects/01/Not.hdl": Not.hdl })
  ),
  storage: {},
  status: "",
  setStatus: (status: string): void => {
    // api.postMessage({ nand2tetris: true, showMessage: status });
    console.log(status);
  },
};

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <BaseContext.Provider value={baseContext}>
      <App />
    </BaseContext.Provider>
  </React.StrictMode>
);

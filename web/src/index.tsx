import { setParserRecovery } from "@nand2tetris/simulator/languages/base.js";
import React from "react";
import ReactDOM from "react-dom/client";
import { installPreloadErrorReload } from "./preloadError";
import { registerServiceWorker } from "./registerServiceWorker";

import "./pico/pico.scss";

import App from "./App";

// Opt in to error recovery: one parse reports every syntax error.
setParserRecovery(import.meta.env.VITE_PARSER_RECOVERY === "true");

installPreloadErrorReload();

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement,
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

window.addEventListener("load", () => {
  registerServiceWorker();
});

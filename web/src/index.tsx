import React from "react";
import ReactDOM from "react-dom/client";
import { removeLegacyServiceWorkers } from "./legacyServiceWorker";
import { installPreloadErrorReload } from "./preloadError";

import "./pico/pico.scss";

import App from "./App";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement,
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

installPreloadErrorReload();
void removeLegacyServiceWorkers();

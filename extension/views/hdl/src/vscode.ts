import { createContext } from "react";
import type { WebviewApi } from "vscode-webview";

const api: WebviewApi<unknown> = acquireVsCodeApi?.();

export const VSCodeContext = createContext({ api });

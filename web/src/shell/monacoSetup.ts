// Use the bundled monaco-editor instead of @monaco-editor/react's default
// jsdelivr CDN copy. The bundle is same-origin and precached by the service
// worker, so the editor works offline, and the app no longer loads Monaco twice.
import { loader } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import EditorWorker from "monaco-editor/editor/editor.worker.js?worker";

// The app only uses Monarch languages, which need the generic editor worker.
self.MonacoEnvironment = {
  getWorker: () => new EditorWorker(),
};

loader.config({ monaco });

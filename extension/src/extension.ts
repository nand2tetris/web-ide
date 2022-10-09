console.log("Loading extension.js");

import * as vscode from "vscode";
import { hardware } from "./commands/hardware";
import { getDiagnostics } from "./languages/hdl.js";

let diagnosticCollection: vscode.DiagnosticCollection;
export function activate(context: vscode.ExtensionContext) {
  console.log("Activating extension");
  const hardwareCommand = vscode.commands.registerCommand(
    "computron5k.hardware",
    async (fileUri) => {
      await hardware(fileUri);
    }
  );
  context.subscriptions.push(hardwareCommand);

  diagnosticCollection = vscode.languages.createDiagnosticCollection();
  vscode.workspace.onDidChangeTextDocument(async (event) => {
    if (event.document.languageId === "hdl") {
      diagnosticCollection.clear();
      const allDiagnostics = await getDiagnostics(event.document);
      for (const [file, diagnostics] of allDiagnostics) {
        diagnosticCollection.set(file, diagnostics);
      }
    }
  });
  context.subscriptions.push(diagnosticCollection);
}

export function deactivate() {
  console.log("Deactivating extension");
}

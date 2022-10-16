console.log("Initializing extension");
import * as vscode from "vscode";
import { makeCommands } from "./commands.js";
import { makeDiagnostics } from "./diagnostics.js";

export function activate(context: vscode.ExtensionContext) {
  console.log("Activating extension");
  makeCommands().forEach(([name, callback]) =>
    context.subscriptions.push(vscode.commands.registerCommand(name, callback))
  );

  context.subscriptions.push(makeDiagnostics());
}

export function deactivate() {
  console.log("Deactivating extension");
}

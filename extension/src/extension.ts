console.log("Initializing extension", new Date(Date.now()).toISOString());
import * as vscode from "vscode";
import { makeCommands } from "./commands.js";
import { makeDiagnostics } from "./diagnostics.js";
import { activateHdlView } from "./views/hdl.js";

export function activate(context: vscode.ExtensionContext) {
  console.log("Activating extension");
  makeCommands().forEach(([name, callback]) =>
    context.subscriptions.push(vscode.commands.registerCommand(name, callback))
  );

  context.subscriptions.push(makeDiagnostics());

  activateHdlView(context);
}

export function deactivate() {
  console.log("Deactivating extension");
}

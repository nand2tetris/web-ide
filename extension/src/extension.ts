import * as vscode from "vscode";
import { hardware } from "./commands/hardware";

export function activate(context: vscode.ExtensionContext) {
  const hardwareCommand = vscode.commands.registerCommand(
    "computron5k.hardware",
    async (fileUri) => {
      await hardware(fileUri);
    }
  );

  context.subscriptions.push(hardwareCommand);
}

export function deactivate() {}

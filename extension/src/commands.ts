import * as vscode from "vscode";
import { hardware } from "./commands/hardware.js";

type Callback = Parameters<typeof vscode.commands.registerCommand>[1];

export function makeCommands(): [string, Callback][] {
  const hardwareCommand: [string, Callback] = [
    "computron5k.hardware",
    async (fileUri: string) => {
      await hardware(fileUri);
    },
  ];

  return [hardwareCommand];
}

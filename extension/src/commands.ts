import * as vscode from "vscode";

type Callback = Parameters<typeof vscode.commands.registerCommand>[1];

export function makeCommands(): [string, Callback][] {
  const hardwareCommand: [string, Callback] = [
    "computron5k.hardware",
    async (fileUri: string) => {
      console.log("Hardware Command");
    },
  ];

  return [hardwareCommand];
}

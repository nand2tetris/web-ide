import * as vscode from "vscode";

type Callback = Parameters<typeof vscode.commands.registerCommand>[1];

export function makeCommands(): [string, Callback][] {
  const hardwareCommand: [string, Callback] = [
    "nand2tetris.hardware",
    async (fileUri: string) => {
      console.log("Hardware Command");
    },
  ];

  return [hardwareCommand];
}

import {
  Diagnostic,
  DiagnosticSeverity,
  Range,
  TextDocument,
  Uri,
} from "vscode";

import type { HDL } from "@computron5k/simulator/languages/hdl";

let hdl: typeof HDL | undefined = undefined;
async function getHdl(): Promise<typeof HDL> {
  if (hdl) return Promise.resolve(hdl);
  hdl = (await eval('import("@computron5k/simulator/languages/hdl.js")'))
    .HDL as typeof HDL;
  return hdl;
}

export async function getDiagnostics(
  document: TextDocument
): Promise<[Uri, Diagnostic[]][]> {
  console.log(`Checking for diagnostics: ${document.fileName}`);
  const { parser } = await getHdl();

  const parsed = parser.match(document.getText());
  if (!parsed.failed()) return [];

  const { line, column, message } =
    /Line (?<line>\d+), col (?<column>\d+): (?<message>.*)/.exec(
      parsed.shortMessage ?? ""
    )?.groups ?? { line: 1, column: 1, message: "could not parse error" };

  const startLineNumber = Number(line);
  const endLineNumber = startLineNumber;
  const startColumn = Number(column);
  const restOfLine = document
    .lineAt(startLineNumber)
    .text.substring(startColumn - 1);
  let endColumn = startColumn + (restOfLine.match(/([^\s]+)/)?.[0].length ?? 1);
  if (endColumn <= startColumn) {
    endColumn = startColumn + 1;
  }
  const range = new Range(
    startLineNumber - 1,
    startColumn - 1,
    endLineNumber - 1,
    endColumn - 1
  );
  const diagnostic = new Diagnostic(range, message, DiagnosticSeverity.Error);
  return [[document.uri, [diagnostic]]];
}

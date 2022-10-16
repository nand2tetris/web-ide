import * as vscode from "vscode";
import * as lang from "./languages/index.js";

async function getDiagnostics(document: vscode.TextDocument) {
  switch (document.languageId) {
    case "cmp":
    case "out":
      return lang.cmp.getDiagnostics(document);
    case "hdl":
      return lang.hdl.getDiagnostics(document);
    case "tst":
      return lang.tst.getDiagnostics(document);
    default:
      return [];
  }
}

let diagnosticCollection: vscode.DiagnosticCollection;
function getDiagnosticCollection() {
  if (diagnosticCollection === undefined) {
    diagnosticCollection = vscode.languages.createDiagnosticCollection();
  }
  return diagnosticCollection;
}

async function runDiagnostics(document: vscode.TextDocument) {
  getDiagnosticCollection().delete(document.uri);
  const allDiagnostics = await getDiagnostics(document);
  for (const [file, diagnostics] of allDiagnostics) {
    getDiagnosticCollection().set(file, diagnostics);
  }
}

export function makeDiagnostics() {
  vscode.workspace.textDocuments.forEach(runDiagnostics);
  vscode.workspace.onDidOpenTextDocument(runDiagnostics);
  vscode.workspace.onDidChangeTextDocument(async (event) => {
    runDiagnostics(event.document);
  });
  return getDiagnosticCollection();
}

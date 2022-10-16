import { Diagnostic, TextDocument, Uri } from "vscode";

import type { TST } from "@computron5k/simulator/languages/tst";
import * as base from "./base.js";

let tst: typeof TST | undefined = undefined;
async function getTst(): Promise<typeof TST> {
  if (tst) return Promise.resolve(tst);
  tst = (await eval('import("@computron5k/simulator/languages/tst.js")'))
    .TST as typeof TST;
  return tst;
}

export async function getDiagnostics(
  document: TextDocument
): Promise<[Uri, Diagnostic[]][]> {
  try {
    const { parser } = await getTst();
    return base.getDiagnostics(document, parser);
  } catch (e) {
    console.error("Failed to load tst parser", e);
    return [];
  }
}

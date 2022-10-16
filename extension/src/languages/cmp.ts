import { Diagnostic, TextDocument, Uri } from "vscode";

import type { CMP } from "@computron5k/simulator/languages/cmp";
import * as base from "./base.js";
// import { load } from "../loader.js";

let cmp: typeof CMP | undefined = undefined;
async function getCmp(): Promise<typeof CMP> {
  if (cmp) return Promise.resolve(cmp);
  cmp = (await import("@computron5k/simulator/languages/cmp.js"))
    .CMP as typeof CMP;
  return cmp;
}

export async function getDiagnostics(
  document: TextDocument
): Promise<[Uri, Diagnostic[]][]> {
  try {
    const { parser } = await getCmp();
    return base.getDiagnostics(document, parser);
  } catch (e) {
    console.error("Failed to load tst parser", e);
    return [];
  }
}

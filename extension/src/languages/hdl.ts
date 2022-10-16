import { Diagnostic, TextDocument, Uri } from "vscode";

import type { HDL } from "@computron5k/simulator/languages/hdl";
import * as base from "./base.js";

let hdl: typeof HDL | undefined = undefined;
async function getHdl(): Promise<typeof HDL> {
  if (hdl) return Promise.resolve(hdl);
  hdl = (await import("@computron5k/simulator/languages/hdl.js"))
    .HDL as typeof HDL;
  return hdl;
}

export async function getDiagnostics(
  document: TextDocument
): Promise<[Uri, Diagnostic[]][]> {
  const { parser } = await getHdl();

  return base.getDiagnostics(document, parser);
}

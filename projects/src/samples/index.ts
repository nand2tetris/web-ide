import { FileSystem, reset } from "@davidsouther/jiffies/lib/esm/fs.js";
import * as project_06 from "./project_06/index.js";
import * as Tst from "./tst.js";

const TST = {
  "TickTock.tst": Tst.TickTock,
};

export async function loadSamples(fs: FileSystem) {
  await fs.pushd("/samples");
  await reset(fs, TST);
  await reset(fs, project_06.FILES);
  await fs.popd();
}

export const AsmProjects = {
  "06": project_06,
};

import { FileSystem } from "@davidsouther/jiffies/lib/esm/fs";

import * as project_01 from "./project_01/index";
import * as project_02 from "./project_02/index";
import * as project_03 from "./project_03/index";
import * as project_05 from "./project_05/index";

export async function resetFiles(fs: FileSystem) {
  await project_01.resetFiles(fs);
  await project_02.resetFiles(fs);
  await project_03.resetFiles(fs);
  await project_05.resetFiles(fs);
}

export async function loadSolutions(fs: FileSystem) {
  await project_01.loadSolutions(fs);
  await project_02.loadSolutions(fs);
  await project_03.loadSolutions(fs);
  await project_05.loadSolutions(fs);
}

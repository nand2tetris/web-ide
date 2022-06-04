import { FileSystem } from "@davidsouther/jiffies/fs.js";

import * as project_01 from "./project_01/index.js";
import * as project_02 from "./project_02/index.js";
import * as project_03 from "./project_03/index.js";

export async function resetFiles(fs: FileSystem) {
  await project_01.resetFiles(fs);
  await project_02.resetFiles(fs);
  await project_03.resetFiles(fs);
}

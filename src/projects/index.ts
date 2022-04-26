import * as project_01 from "./project_01/index.js";
import { FileSystem } from "@davidsouther/jiffies/fs.js";

export async function resetFiles(fs: FileSystem) {
  await project_01.resetFiles(fs);
}

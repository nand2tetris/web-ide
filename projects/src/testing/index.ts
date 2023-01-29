import { FileSystem } from "@davidsouther/jiffies/lib/esm/fs.js";

import * as project_01 from "./project_01/index.js";
import * as project_02 from "./project_02/index.js";
import * as project_03 from "./project_03/index.js";
import * as project_05 from "./project_05/index.js";

export const ChipProjects = {
  "01": project_01,
  "02": project_02,
  "03": project_03,
  "05": project_05,
};

let reset = false;
export const loadSolutions = async (fs: FileSystem) => {
  if (reset) return; // React will double-render a call to resetFiles in useEffect.
  reset = true;
  await project_01.loadSolutions(fs);
  await project_02.loadSolutions(fs);
  await project_03.loadSolutions(fs);
  await project_05.loadSolutions(fs);
  reset = false;
};

export const loaders = {
  loadSolutions,
};

export default loaders;

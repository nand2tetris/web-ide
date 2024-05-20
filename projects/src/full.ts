import { FileSystem } from "@davidsouther/jiffies/lib/esm/fs.js";

import * as project_01 from "./project_01/index.js";
import * as project_02 from "./project_02/index.js";
import * as project_03 from "./project_03/index.js";
import * as project_04 from "./project_04/index.js";
import * as project_05 from "./project_05/index.js";
import * as project_07 from "./project_07/index.js";
import * as project_08 from "./project_08/index.js";
import * as project_06 from "./samples/project_06/index.js";

export const ChipProjects = {
  "01": project_01,
  "02": project_02,
  "03": project_03,
  "05": project_05,
};

export const VmProjects = {
  "07": project_07,
  "08": project_08,
};

const Projects = {
  1: project_01,
  2: project_02,
  3: project_03,
  4: project_04,
  5: project_05,
  6: project_06,
  7: project_07,
  8: project_08,
};

let reset = false;
export const resetFiles = async (fs: FileSystem, projects?: number[]) => {
  if (reset) return; // React will double-render a call to resetFiles in useEffect.
  reset = true;
  projects ??= [1, 2, 3, 4, 6, 5, 7, 8];
  for (const project of projects) {
    if (!Object.keys(Projects).includes(project.toString())) {
      continue;
    }
    await Projects[project as keyof typeof Projects].resetFiles(fs);
  }
  reset = false;
};

export const resetTests = async (fs: FileSystem, projects?: number[]) => {
  if (reset) return; // React will double-render a call to resetTests in useEffect.
  reset = true;
  projects ??= [1, 2, 3, 4, 5, 7, 8];
  for (const project of projects) {
    if (!Object.keys(Projects).includes(project.toString())) {
      continue;
    }
    await Projects[project as keyof typeof Projects].resetTests(fs);
  }
  reset = false;
};

export const Assignments = {
  ...project_01.CHIPS,
  ...project_02.CHIPS,
  ...project_03.CHIPS,
  ...project_05.CHIPS,
  ...project_07.VMS,
  ...project_08.VMS,
};

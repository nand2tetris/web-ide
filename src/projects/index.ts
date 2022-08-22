import { FileSystem } from "@davidsouther/jiffies/lib/esm/fs";

import * as project_01 from "./project_01/index";
import * as project_02 from "./project_02/index";
import * as project_03 from "./project_03/index";
import * as project_05 from "./project_05/index";
import * as samples from "./samples/index";

export const Projects = {
  "01": project_01,
  "02": project_02,
  "03": project_03,
  "05": project_05,
};

export const resetFiles = async (fs: FileSystem) => {
  await project_01.resetFiles(fs);
  await project_02.resetFiles(fs);
  await project_03.resetFiles(fs);
  await project_05.resetFiles(fs);
};

export const loadSolutions = async (fs: FileSystem) => {
  await project_01.loadSolutions(fs);
  await project_02.loadSolutions(fs);
  await project_03.loadSolutions(fs);
  await project_05.loadSolutions(fs);
};

export const loadSamples = async (fs: FileSystem) => {
  await samples.loadSamples(fs);
};

export const loaders = {
  resetFiles,
  loadSolutions,
  loadSamples,
};

export default loaders;

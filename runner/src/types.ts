import { Assignment } from "@nand2tetris/projects";

export interface RunResult {
  code: number;
  stdout: string;
  stderr: string;
}

export interface Runner {
  hdl({ dir, name }: Assignment): Promise<RunResult>;
}

import { ExecException, ExecOptions, exec } from "node:child_process";
import { dirname, join, parse } from "node:path";
import type { Assignment } from "@nand2tetris/projects/base.js";
import { Runner, RunResult } from "./types.js";

// Wrapper around `exec`, providing nand2tetris specific options and wrapping the result in a Promise. */
export function run(cmd: string, options: ExecOptions = {}) {
  return new Promise<string>((resolve, reject) => {
    exec(cmd, { windowsHide: true, ...options }, (error, stdout, stderr) => {
      if (error !== null || stderr.length > 0) {
        reject({ error, stderr });
      } else {
        resolve(`${stdout}`);
      }
    });
  });
}

const NAND2TetrisPackage = "org.nand2tetris.hack.main";
type NAND2TetrisMain = "HardwareSimulatorMain";
const __dirname = dirname(new URL(import.meta.url).pathname);

/**
 * Runner to manage calling the provided nand2tetris.jar with appropriate args and mains.
 */
export class JavaRunner implements Runner {
  /** When creating a runner, run the HDL test against the data file to ensure everything works. */
  static async try_init(installPath: string): Promise<Runner | undefined> {
    const runner = new JavaRunner(installPath);
    const file = join(__dirname, "..", "..", "data", "Not.hdl");
    const { code } = await runner.hdl(parse(file));
    return code === 0 ? runner : undefined;
  }

  private constructor(private readonly installPath: string) {}

  /** Run a .tst file for the given chip. */
  async hdl({ dir, name }: Assignment): Promise<RunResult> {
    return this.exec("HardwareSimulatorMain", join(dir, `${name}.tst`));
  }

  /** Run a nand2tetris Java main, in command line mode, given a certain file. */
  async exec(main: NAND2TetrisMain, filePath: string): Promise<RunResult> {
    try {
      const fullMain = `${NAND2TetrisPackage}.${main}`;
      const command = `java -classpath nand2tetris.jar ${fullMain} ${filePath}`;
      const stdout = await run(command, { cwd: this.installPath });
      return { code: 0, stdout, stderr: "" };
    } catch (e: unknown) {
      const { error, stderr } = e as { error?: ExecException; stderr: string };
      return { code: error?.code ?? 255, stderr, stdout: "" };
    }
  }
}

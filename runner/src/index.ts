import { exec, ExecOptions, ExecException } from "node:child_process";
import { dirname, join, parse } from "node:path";
import type { Assignment } from "@computron5k/projects/index.js";

export function run(cmd: string, options: ExecOptions = {}) {
  return new Promise<string>((resolve, reject) => {
    exec(cmd, { windowsHide: true, ...options }, (error, stdout, stderr) => {
      if (error !== null || stderr.length > 0) {
        reject({ error, stderr });
      } else {
        resolve(stdout);
      }
    });
  });
}

const NAND2TetrisPackage = "org.nand2tetris.hack.main";
type NAND2TetrisMain = "HardwareSimulatorMain";
const __dirname = dirname(new URL(import.meta.url).pathname);

export interface RunResult {
  code: number;
  stdout: string;
  stderr: string;
}

export class Runner {
  static async try_init(installPath: string): Promise<Runner | undefined> {
    const runner = new Runner(installPath);
    const file = join(__dirname, "..", "..", "Not.hdl");
    const { code } = await runner.hdl(parse(file));
    return code === 0 ? runner : undefined;
  }

  constructor(private readonly installPath: string) {}

  async hdl({ dir, name }: Assignment): Promise<RunResult> {
    return this.exec("HardwareSimulatorMain", join(dir, `${name}.tst`));
  }

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

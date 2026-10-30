// Project 8 Statics/Fibonacci .cmp output and the THAT segment view.
import {
  FileSystem,
  ObjectFileSystemAdapter,
} from "@davidsouther/jiffies/fs.ts";
import { unwrap } from "@davidsouther/jiffies/result.ts";
import { resetFiles } from "@nand2tetris/projects/full.js";
import { describe, expect, test } from "vitest";
import { validOf } from "../languages/base.js";
import { TST } from "../languages/tst.js";
import { VM } from "../languages/vm.js";
import { Vm } from "../vm/vm.js";
import { VMTest } from "./vmtst.js";

async function runVme(project: string, name: string) {
  const fs = new FileSystem(new ObjectFileSystemAdapter({}));
  await resetFiles(fs);
  const dir = `/projects/${project}/${name}`;
  fs.cd(dir);
  const files = (await fs.scandir(dir))
    .filter((e) => e.name.endsWith(".vm"))
    .map((e) => e.name);
  const parsed = [];
  for (const f of files) {
    const src = await fs.readFile(`${dir}/${f}`);
    parsed.push({
      name: f.replace(".vm", ""),
      instructions: unwrap(validOf(VM.parse(src))).instructions,
    });
  }
  const vm = unwrap(Vm.buildFromFiles(parsed));
  const tst = unwrap(
    validOf(TST.parse(await fs.readFile(`${dir}/${name}VME.tst`))),
  );
  const test = unwrap(VMTest.from(tst)).using(fs).with(vm);
  await test.run();
  const cmp = await fs.readFile(`${dir}/${name}.cmp`);
  return { log: test.log(), cmp };
}

const norm = (s: string) =>
  s
    .split("\n")
    .map((l) => l.replace(/\s+/g, ""))
    .filter(Boolean)
    .join("\n");

describe("#659", () => {
  test.each(["StaticsTest", "FibonacciElement"])(
    "%s VME output matches cmp",
    async (name) => {
      const { log, cmp } = await runVme("08", name);
      expect(norm(log)).toEqual(norm(cmp));
    },
  );
});

describe("#658 THAT segment", () => {
  test("pop that 2 / pop that 5 are visible in the THAT segment", () => {
    const { instructions } = unwrap(
      validOf(
        VM.parse(`
push constant 4000
pop pointer 1
push constant 11
pop that 2
push constant 22
pop that 5
`),
      ),
    );
    const vm = unwrap(Vm.build(instructions));
    for (let i = 0; i < 6; i++) vm.step();
    expect(vm.memory.THAT).toBe(4000);
    expect(vm.RAM.get(4002)).toBe(11);
    expect(vm.RAM.get(4005)).toBe(22);
    // the VM view renders vmStack()[...].that.count
    const frames = vm.vmStack();
    const that = frames[frames.length - 1].that;
    expect(that.count).toBe(6);
    expect(that.values[2]).toBe(11);
    expect(that.values[5]).toBe(22);
  });
});

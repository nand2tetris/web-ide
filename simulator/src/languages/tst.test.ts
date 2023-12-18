import {
  FileSystem,
  ObjectFileSystemAdapter,
} from "@davidsouther/jiffies/lib/esm/fs.js";
import { resetFiles } from "@nand2tetris/projects/index.js";
import { grammar, TST } from "./tst.js";

const NOT_TST = `
output-list in%B3.1.3 out%B3.1.3;

set in 0, eval, output;
set in 1, eval, output;`;

const BIT_TST = `
output-list time%S1.4.1 in%B2.1.2 load%B2.1.2 out%B2.1.2;
set in 0, set load 0, tick, output; tock, output;
set in 0, set load 1, eval, output;
`;

const MEM_TST = `
output-list time%S1.2.1 in%B2.1.2;
set in -32123, tick, output;
`;

const MEM_REPEAT = `
repeat 14 {
  eval, output;
}
`;

const INDEF_REPEAT = `
repeat {
  eval, output;
}
`;

const COND_WHILE = `while out <> 89 {
  eval;
}`;

describe("tst language", () => {
  it("parses an output format", () => {
    const match = grammar.match("a%B3.1.3", "OutputFormat");
    expect(match).toHaveSucceeded();
    expect(TST.semantics(match).format).toStrictEqual({
      id: "a",
      style: "B",
      width: 1,
      lpad: 3,
      rpad: 3,
      builtin: false,
      address: -1,
    });
  });

  it("parses an output list", () => {
    const match = grammar.match(
      "output-list a%B1.1.1 out%X2.3.4",
      "TstOutputListOperation"
    );
    expect(match).toHaveSucceeded();
    expect(TST.semantics(match).operation).toStrictEqual({
      op: "output-list",
      spec: [
        {
          id: "a",
          style: "B",
          width: 1,
          lpad: 1,
          rpad: 1,
          builtin: false,
          address: -1,
        },
        {
          id: "out",
          style: "X",
          width: 3,
          lpad: 2,
          rpad: 4,
          builtin: false,
          address: -1,
        },
      ],
    });
  });

  it("parses an output list with junk", () => {
    const match = grammar.match(
      "\n/// A list\noutput-list a%B1.1.1 /* the output */ out%X2.3.4",
      "TstOutputListOperation"
    );
    expect(match).toHaveSucceeded();
    expect(TST.semantics(match).operation).toStrictEqual({
      op: "output-list",
      spec: [
        {
          id: "a",
          style: "B",
          width: 1,
          lpad: 1,
          rpad: 1,
          builtin: false,
          address: -1,
        },
        {
          id: "out",
          style: "X",
          width: 3,
          lpad: 2,
          rpad: 4,
          builtin: false,
          address: -1,
        },
      ],
    });
  });

  it("parses an output list with builtins", () => {
    const match = grammar.match(
      "output-list PC[]%D0.4.0 RAM16K[0]%D1.7.1",
      "TstOutputListOperation"
    );
    expect(match).toHaveSucceeded();
    expect(TST.semantics(match).operation).toStrictEqual({
      op: "output-list",
      spec: [
        {
          id: "PC",
          style: "D",
          width: 4,
          lpad: 0,
          rpad: 0,
          builtin: true,
          address: -1,
        },
        {
          id: "RAM16K",
          style: "D",
          width: 7,
          lpad: 1,
          rpad: 1,
          builtin: true,
          address: 0,
        },
      ],
    });
  });

  it("parses file ops", () => {
    const match = grammar.match(
      "load A.hdl, output-file A.out, compare-to A.cmp, output-list a%B1.1.1;"
    );
    expect(match).toHaveSucceeded();
  });

  it("parses a single set", () => {
    const match = grammar.match("set a 0", "TstSetOperation");
    expect(match).toHaveSucceeded();
    expect(TST.semantics(match).operation).toEqual({
      op: "set",
      id: "a",
      value: 0,
    });
  });

  it("parses simple multiline", () => {
    const match = grammar.match("eval;\n\neval;\n\n");
    expect(match).toHaveSucceeded();
    expect(TST.semantics(match).tst).toEqual({
      lines: [
        { ops: [{ op: "eval" }], span: { start: 0, end: 5, line: 1 } },
        { ops: [{ op: "eval" }], span: { start: 7, end: 12, line: 3 } },
      ],
    });
  });

  it("parses a test file", () => {
    const match = grammar.match(NOT_TST);
    expect(match).toHaveSucceeded();
    expect(TST.semantics(match).tst).toEqual({
      lines: [
        {
          span: {
            start: 1,
            end: 34,
            line: 2,
          },
          ops: [
            {
              op: "output-list",
              spec: [
                {
                  id: "in",
                  style: "B",
                  width: 1,
                  lpad: 3,
                  rpad: 3,
                  builtin: false,
                  address: -1,
                },
                {
                  id: "out",
                  style: "B",
                  width: 1,
                  lpad: 3,
                  rpad: 3,
                  builtin: false,
                  address: -1,
                },
              ],
            },
          ],
        },
        {
          span: {
            end: 59,
            start: 36,
            line: 4,
          },
          ops: [
            { op: "set", id: "in", value: 0 },
            { op: "eval" },
            { op: "output" },
          ],
        },
        {
          span: {
            start: 60,
            end: 83,
            line: 5,
          },
          ops: [
            { op: "set", id: "in", value: 1 },
            { op: "eval" },
            { op: "output" },
          ],
        },
      ],
    });
  });

  it("parses a clocked test file", () => {
    const match = grammar.match(BIT_TST);
    expect(match).toHaveSucceeded();
    expect(TST.semantics(match).tst).toEqual({
      lines: [
        {
          span: {
            start: 1,
            end: 58,
            line: 2,
          },
          ops: [
            {
              op: "output-list",
              spec: [
                {
                  id: "time",
                  style: "S",
                  width: 4,
                  lpad: 1,
                  rpad: 1,
                  builtin: false,
                  address: -1,
                },
                {
                  id: "in",
                  style: "B",
                  width: 1,
                  lpad: 2,
                  rpad: 2,
                  builtin: false,
                  address: -1,
                },
                {
                  id: "load",
                  style: "B",
                  width: 1,
                  lpad: 2,
                  rpad: 2,
                  builtin: false,
                  address: -1,
                },
                {
                  id: "out",
                  style: "B",
                  width: 1,
                  lpad: 2,
                  rpad: 2,
                  builtin: false,
                  address: -1,
                },
              ],
            },
          ],
        },
        {
          span: {
            start: 59,
            end: 94,
            line: 3,
          },
          ops: [
            { op: "set", id: "in", value: 0 },
            { op: "set", id: "load", value: 0 },
            { op: "tick" },
            { op: "output" },
          ],
        },
        {
          span: {
            start: 95,
            end: 108,
            line: 3,
          },
          ops: [{ op: "tock" }, { op: "output" }],
        },
        {
          span: {
            start: 109,
            end: 144,
            line: 4,
          },
          ops: [
            { op: "set", id: "in", value: 0 },
            { op: "set", id: "load", value: 1 },
            { op: "eval" },
            { op: "output" },
          ],
        },
      ],
    });
  });

  it("parses a test file with negative integers", () => {
    const match = grammar.match(MEM_TST);
    expect(match).toHaveSucceeded();
    expect(TST.semantics(match).tst).toEqual({
      lines: [
        // output-list time%S1.2.1 in%B2.1.2;
        {
          span: {
            start: 1,
            end: 35,
            line: 2,
          },
          ops: [
            {
              op: "output-list",
              spec: [
                {
                  id: "time",
                  style: "S",
                  width: 2,
                  lpad: 1,
                  rpad: 1,
                  builtin: false,
                  address: -1,
                },
                {
                  id: "in",
                  style: "B",
                  width: 1,
                  lpad: 2,
                  rpad: 2,
                  builtin: false,
                  address: -1,
                },
              ],
            },
          ],
        },
        // set in -32123, tick, output;
        {
          span: {
            start: 36,
            end: 64,
            line: 3,
          },
          ops: [
            { op: "set", id: "in", value: 33413 /* unsigned */ },
            { op: "tick" },
            { op: "output" },
          ],
        },
      ],
    });
  });

  it("repeats blocks", () => {
    const match = grammar.match(MEM_REPEAT);
    expect(match).toHaveSucceeded();
    expect(TST.semantics(match).tst).toEqual({
      lines: [
        {
          count: 14,
          statements: [
            {
              span: {
                start: 15,
                end: 28,
                line: 3,
              },
              ops: [{ op: "eval" }, { op: "output" }],
            },
          ],
          span: {
            start: 1,
            end: 30,
            line: 2,
          },
        },
      ],
    });
  });

  it("repeats indefinitely", () => {
    const match = grammar.match(INDEF_REPEAT);
    expect(match).toHaveSucceeded();
    expect(TST.semantics(match).tst).toEqual({
      lines: [
        {
          count: -1,
          span: {
            start: 1,
            end: 27,
            line: 2,
          },
          statements: [
            {
              span: {
                start: 12,
                end: 25,
                line: 3,
              },
              ops: [{ op: "eval" }, { op: "output" }],
            },
          ],
        },
      ],
    });
  });

  it("loops with a condition", () => {
    const match = grammar.match(COND_WHILE);
    expect(match).toHaveSucceeded();
    expect(TST.semantics(match).tst).toEqual({
      lines: [
        {
          span: {
            start: 0,
            end: 27,
            line: 1,
          },
          condition: {
            op: "<>",
            left: "out",
            right: 89,
          },
          statements: [
            {
              span: {
                start: 20,
                end: 25,
                line: 2,
              },
              ops: [{ op: "eval" }],
            },
          ],
        },
      ],
    });
  });

  it("loads ROMs", () => {
    const match = grammar.match(`ROM32K load Max.hack;`);

    expect(match).toHaveSucceeded();
    expect(TST.semantics(match).tst).toEqual({
      lines: [
        {
          span: {
            start: 0,
            end: 21,
            line: 1,
          },
          ops: [{ op: "loadRom", file: "Max.hack" }],
        },
      ],
    });
  });
});

it("loads all project tst files", async () => {
  const fs = new FileSystem(new ObjectFileSystemAdapter());
  await resetFiles(fs);
  async function check() {
    for (const stat of await fs.scandir(".")) {
      if (stat.isDirectory()) {
        fs.pushd(stat.name);
        await check();
        fs.popd();
      } else {
        if (stat.name.endsWith("vm_tst")) {
          const tst = await fs.readFile(stat.name);
          const match = grammar.match(tst);
          expect(match).toHaveSucceeded();
        }
      }
    }
  }
  await check();
});

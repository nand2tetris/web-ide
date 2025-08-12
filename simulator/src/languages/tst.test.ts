import {
  FileSystem,
  ObjectFileSystemAdapter,
} from "@davidsouther/jiffies/lib/esm/fs.js";
import { resetFiles } from "@nand2tetris/projects/full.js";
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
      builtin: false,
      address: -1,
      format: {
        style: "B",
        width: 1,
        lpad: 3,
        rpad: 3,
      },
    });
  });

  it("parses an output list", () => {
    const match = grammar.match(
      "output-list a%B1.1.1 out%X2.3.4",
      "TstOutputListOperation",
    );
    expect(match).toHaveSucceeded();
    expect(TST.semantics(match).operation).toStrictEqual({
      op: "output-list",
      spec: [
        {
          id: "a",
          builtin: false,
          address: -1,
          format: { style: "B", width: 1, lpad: 1, rpad: 1 },
        },
        {
          id: "out",

          builtin: false,
          address: -1,
          format: { style: "X", width: 3, lpad: 2, rpad: 4 },
        },
      ],
    });
  });

  it("parses an output list with junk", () => {
    const match = grammar.match(
      "\n/// A list\noutput-list a%B1.1.1 /* the output */ out%X2.3.4",
      "TstOutputListOperation",
    );
    expect(match).toHaveSucceeded();
    expect(TST.semantics(match).operation).toStrictEqual({
      op: "output-list",
      spec: [
        {
          id: "a",
          builtin: false,
          address: -1,
          format: { style: "B", width: 1, lpad: 1, rpad: 1 },
        },
        {
          id: "out",
          builtin: false,
          address: -1,
          format: { style: "X", width: 3, lpad: 2, rpad: 4 },
        },
      ],
    });
  });

  it("parses an output list with builtins", () => {
    const match = grammar.match(
      "output-list PC[]%D0.4.0 RAM16K[0]%D1.7.1",
      "TstOutputListOperation",
    );
    expect(match).toHaveSucceeded();
    expect(TST.semantics(match).operation).toStrictEqual({
      op: "output-list",
      spec: [
        {
          id: "PC",
          builtin: true,
          address: -1,
          format: { style: "D", width: 4, lpad: 0, rpad: 0 },
        },
        {
          id: "RAM16K",
          builtin: true,
          address: 0,
          format: { style: "D", width: 7, lpad: 1, rpad: 1 },
        },
      ],
    });
  });

  it("parses file ops", () => {
    const match = grammar.match(
      "load A.hdl, output-file A.out, compare-to A.cmp, output-list a%B1.1.1;",
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
        {
          op: { op: "eval" },
          separator: ";",
          span: { start: 0, end: 5, line: 1 },
        },
        {
          op: { op: "eval" },
          separator: ";",
          span: { start: 7, end: 12, line: 3 },
        },
      ],
    });
  });

  it("parses a test file", () => {
    const match = grammar.match(NOT_TST);
    expect(match).toHaveSucceeded();
    expect(TST.semantics(match).tst).toEqual({
      lines: [
        {
          op: {
            op: "output-list",
            spec: [
              {
                id: "in",
                builtin: false,
                address: -1,
                format: { style: "B", width: 1, lpad: 3, rpad: 3 },
              },
              {
                id: "out",
                builtin: false,
                address: -1,
                format: { style: "B", width: 1, lpad: 3, rpad: 3 },
              },
            ],
          },
          separator: ";",
          span: { line: 2, start: 1, end: 34 },
        },

        {
          op: { op: "set", id: "in", value: 0 },
          separator: ",",
          span: { line: 4, start: 36, end: 45 },
        },
        {
          op: { op: "eval" },
          separator: ",",
          span: { line: 4, start: 46, end: 51 },
        },
        {
          op: { op: "output" },
          separator: ";",
          span: { line: 4, start: 52, end: 59 },
        },

        {
          op: { op: "set", id: "in", value: 1 },
          separator: ",",
          span: { line: 5, start: 60, end: 69 },
        },
        {
          op: { op: "eval" },
          separator: ",",
          span: { line: 5, start: 70, end: 75 },
        },
        {
          op: { op: "output" },
          separator: ";",
          span: { line: 5, start: 76, end: 83 },
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
          op: {
            op: "output-list",
            spec: [
              {
                id: "time",
                builtin: false,
                address: -1,
                format: { style: "S", width: 4, lpad: 1, rpad: 1 },
              },
              {
                id: "in",
                builtin: false,
                address: -1,
                format: { style: "B", width: 1, lpad: 2, rpad: 2 },
              },
              {
                id: "load",
                builtin: false,
                address: -1,
                format: { style: "B", width: 1, lpad: 2, rpad: 2 },
              },
              {
                id: "out",
                builtin: false,
                address: -1,
                format: { style: "B", width: 1, lpad: 2, rpad: 2 },
              },
            ],
          },
          separator: ";",
          span: { line: 2, start: 1, end: 58 },
        },

        {
          op: { op: "set", id: "in", value: 0 },
          separator: ",",
          span: { line: 3, start: 59, end: 68 },
        },
        {
          op: { op: "set", id: "load", value: 0 },
          separator: ",",
          span: { line: 3, start: 69, end: 80 },
        },
        {
          op: { op: "tick" },
          separator: ",",
          span: { line: 3, start: 81, end: 86 },
        },
        {
          op: { op: "output" },
          separator: ";",
          span: { line: 3, start: 87, end: 94 },
        },

        {
          op: { op: "tock" },
          separator: ",",
          span: { line: 3, start: 95, end: 100 },
        },
        {
          op: { op: "output" },
          separator: ";",
          span: { line: 3, start: 101, end: 108 },
        },

        {
          op: { op: "set", id: "in", value: 0 },
          separator: ",",
          span: { line: 4, start: 109, end: 118 },
        },
        {
          op: { op: "set", id: "load", value: 1 },
          separator: ",",
          span: { line: 4, start: 119, end: 130 },
        },
        {
          op: { op: "eval" },
          separator: ",",
          span: { line: 4, start: 131, end: 136 },
        },
        {
          op: { op: "output" },
          separator: ";",
          span: { line: 4, start: 137, end: 144 },
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
          op: {
            op: "output-list",
            spec: [
              {
                id: "time",
                builtin: false,
                address: -1,
                format: { style: "S", width: 2, lpad: 1, rpad: 1 },
              },
              {
                id: "in",
                builtin: false,
                address: -1,
                format: { style: "B", width: 1, lpad: 2, rpad: 2 },
              },
            ],
          },
          separator: ";",
          span: {
            start: 1,
            end: 35,
            line: 2,
          },
        },
        // set in -32123, tick, output;
        {
          op: { op: "set", id: "in", value: 33413 /* unsigned */ },
          separator: ",",
          span: { line: 3, start: 36, end: 50 },
        },
        {
          op: { op: "tick" },
          separator: ",",
          span: { line: 3, start: 51, end: 56 },
        },
        {
          op: { op: "output" },
          separator: ";",
          span: { line: 3, start: 57, end: 64 },
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
              op: { op: "eval" },
              separator: ",",
              span: { line: 3, start: 15, end: 20 },
            },
            {
              op: { op: "output" },
              separator: ";",
              span: { line: 3, start: 21, end: 28 },
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
              op: { op: "eval" },
              separator: ",",
              span: { line: 3, start: 12, end: 17 },
            },
            {
              op: { op: "output" },
              separator: ";",
              span: { line: 3, start: 18, end: 25 },
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
              op: { op: "eval" },
              separator: ";",
              span: {
                start: 20,
                end: 25,
                line: 2,
              },
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
          op: { op: "loadRom", file: "Max.hack" },
          separator: ";",
        },
      ],
    });
  });
});

it("loads all project tst files", async () => {
  const fs = new FileSystem(new ObjectFileSystemAdapter({}));
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

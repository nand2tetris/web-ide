import { grammar, TST } from "./tst";

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
    let match = grammar.match("a%B3.1.3", "OutputFormat");
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
    let match = grammar.match(
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
    let match = grammar.match(
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
    let match = grammar.match(
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

  it("parses a single set", () => {
    let match = grammar.match("set a 0", "TstSetOperation");
    expect(match).toHaveSucceeded();
    expect(TST.semantics(match).operation).toEqual({
      op: "set",
      id: "a",
      value: 0,
    });
  });

  it("parses simple multiline", () => {
    let match = grammar.match("eval;\n\neval;\n\n");
    expect(match).toHaveSucceeded();
    expect(TST.semantics(match).tst).toEqual({
      lines: [
        { ops: [{ op: "eval" }], span: { start: 0, end: 5 } },
        { ops: [{ op: "eval" }], span: { start: 7, end: 12 } },
      ],
    });
  });

  it("parses a test file", () => {
    let match = grammar.match(NOT_TST);
    expect(match).toHaveSucceeded();
    expect(TST.semantics(match).tst).toEqual({
      lines: [
        {
          span: {
            start: 1,
            end: 34,
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
    let match = grammar.match(BIT_TST);
    expect(match).toHaveSucceeded();
    expect(TST.semantics(match).tst).toEqual({
      lines: [
        {
          span: {
            start: 1,
            end: 58,
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
          },
          ops: [{ op: "tock" }, { op: "output" }],
        },
        {
          span: {
            start: 109,
            end: 144,
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
    let match = grammar.match(MEM_TST);
    expect(match).toHaveSucceeded();
    expect(TST.semantics(match).tst).toEqual({
      lines: [
        // output-list time%S1.2.1 in%B2.1.2;
        {
          span: {
            start: 1,
            end: 35,
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
    let match = grammar.match(MEM_REPEAT);
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
              },
              ops: [{ op: "eval" }, { op: "output" }],
            },
          ],
          span: {
            start: 1,
            end: 10,
          },
        },
      ],
    });
  });

  it("repeats indefinitely", () => {
    let match = grammar.match(INDEF_REPEAT);
    expect(match).toHaveSucceeded();
    expect(TST.semantics(match).tst).toEqual({
      lines: [
        {
          count: -1,
          span: {
            start: 1,
            end: 7,
          },
          statements: [
            {
              span: {
                start: 12,
                end: 25,
              },
              ops: [{ op: "eval" }, { op: "output" }],
            },
          ],
        },
      ],
    });
  });

  it("loops with a condition", () => {
    let match = grammar.match(COND_WHILE);
    expect(match).toHaveSucceeded();
    expect(TST.semantics(match).tst).toEqual({
      lines: [
        {
          span: {
            start: 0,
            end: 15,
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
              },
              ops: [{ op: "eval" }],
            },
          ],
        },
      ],
    });
  });

  it("loads ROMs", () => {
    let match = grammar.match(`ROM32K load Max.hack;`);

    expect(match).toHaveSucceeded();
    expect(TST.semantics(match).tst).toEqual({
      lines: [
        {
          span: {
            start: 0,
            end: 21,
          },
          ops: [{ op: "load", file: "Max.hack" }],
        },
      ],
    });
  });
});

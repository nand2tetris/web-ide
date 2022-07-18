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
        { id: "a", style: "B", width: 1, lpad: 1, rpad: 1 },
        { id: "out", style: "X", width: 3, lpad: 2, rpad: 4 },
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
        { id: "a", style: "B", width: 1, lpad: 1, rpad: 1 },
        { id: "out", style: "X", width: 3, lpad: 2, rpad: 4 },
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
      lines: [{ ops: [{ op: "eval" }] }, { ops: [{ op: "eval" }] }],
    });
  });

  it("parses a test file", () => {
    let match = grammar.match(NOT_TST);
    expect(match).toHaveSucceeded();
    expect(TST.semantics(match).tst).toEqual({
      lines: [
        {
          ops: [
            {
              op: "output-list",
              spec: [
                { id: "in", style: "B", width: 1, lpad: 3, rpad: 3 },
                { id: "out", style: "B", width: 1, lpad: 3, rpad: 3 },
              ],
            },
          ],
        },
        {
          ops: [
            { op: "set", id: "in", value: 0 },
            { op: "eval" },
            { op: "output" },
          ],
        },
        {
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
          ops: [
            {
              op: "output-list",
              spec: [
                { id: "time", style: "S", width: 4, lpad: 1, rpad: 1 },
                { id: "in", style: "B", width: 1, lpad: 2, rpad: 2 },
                { id: "load", style: "B", width: 1, lpad: 2, rpad: 2 },
                { id: "out", style: "B", width: 1, lpad: 2, rpad: 2 },
              ],
            },
          ],
        },
        {
          ops: [
            { op: "set", id: "in", value: 0 },
            { op: "set", id: "load", value: 0 },
            { op: "tick" },
            { op: "output" },
          ],
        },
        {
          ops: [{ op: "tock" }, { op: "output" }],
        },
        {
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
          ops: [
            {
              op: "output-list",
              spec: [
                { id: "time", style: "S", width: 2, lpad: 1, rpad: 1 },
                { id: "in", style: "B", width: 1, lpad: 2, rpad: 2 },
              ],
            },
          ],
        },
        // set in -32123, tick, output;
        {
          ops: [
            { op: "set", id: "in", value: 33413 /* unsigned */ },
            { op: "tick" },
            { op: "output" },
          ],
        },
      ],
    });
  });
});

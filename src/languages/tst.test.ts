import { Ok } from "@davidsouther/jiffies/lib/esm/result";
import {
  TEST_ONLY,
  Tst,
  TstOperation,
  TstOutputListOperation,
  TstOutputSpec,
  tstParser,
} from "./tst";
import { IResult, Span } from "./parser/base";

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
  it("parses values", () => {
    let parsed: IResult<number>;

    parsed = TEST_ONLY.tstValue("%XFF");
    expect(parsed).toBeOk(Ok(["", 255]));

    parsed = TEST_ONLY.tstValue("%D128");
    expect(parsed).toBeOk(Ok(["", 128]));

    parsed = TEST_ONLY.tstValue("%127");
    expect(parsed).toBeOk(Ok(["", 127]));

    parsed = TEST_ONLY.tstValue("%B11");
    expect(parsed).toBeOk(Ok(["", 3]));

    parsed = TEST_ONLY.tstValue("%D-1");
    expect(parsed).toBeOk(Ok(["", 0xffff]));

    parsed = TEST_ONLY.tstValue("0");
    expect(parsed).toBeOk(Ok(["", 0]));

    parsed = TEST_ONLY.tstValue("11111");
    expect(parsed).toBeOk(Ok(["", 11111]));
  });

  it("parses an output format", () => {
    let parsed: IResult<TstOutputSpec>;

    const input = new Span("a%B3.1.3");
    parsed = TEST_ONLY.tstOutputFormat(input);
    expect(parsed).toBeOk(
      Ok([
        // @ts-ignore
        { start: 8, end: 8 } as Span,
        { id: "a", style: "B", width: 1, lpad: 3, rpad: 3 },
      ])
    );
  });

  it("parses an output list", () => {
    let parsed: IResult<TstOutputListOperation>;

    let input = new Span("output-list a%B1.1.1 out%X2.3.4");
    parsed = TEST_ONLY.tstOutputListParser(input);
    expect(parsed).toBeOk(
      Ok([
        // @ts-ignore
        { start: 31, end: 31 } as Span,
        {
          op: "output-list",
          spec: [
            { id: "a", style: "B", width: 1, lpad: 1, rpad: 1 },
            { id: "out", style: "X", width: 3, lpad: 2, rpad: 4 },
          ],
        },
      ])
    );
  });

  it("parses simple multiline", () => {
    let parsed: IResult<Tst>;

    parsed = tstParser("eval;\n\neval;\n\n");
    expect(parsed).toBeOk(
      Ok([
        "",
        { lines: [{ ops: [{ op: "eval" }] }, { ops: [{ op: "eval" }] }] },
      ])
    );
  });

  it("parses an output list with junk", () => {
    let parsed: IResult<TstOutputListOperation>;

    parsed = TEST_ONLY.tstOutputListParser(
      "\n/// A list\noutput-list a%B1.1.1 /* the output */ out%X2.3.4"
    );
    expect(parsed).toBeOk(
      Ok([
        "",
        {
          op: "output-list",
          spec: [
            { id: "a", style: "B", width: 1, lpad: 1, rpad: 1 },
            { id: "out", style: "X", width: 3, lpad: 2, rpad: 4 },
          ],
        },
      ])
    );
  });

  it("parses a single set", () => {
    let parsed: IResult<TstOperation>;

    parsed = TEST_ONLY.set("set a 0");
    expect(parsed).toBeOk(Ok(["", { op: "set", id: "a", value: 0 }]));
  });

  it("parses a test file", () => {
    let parsed: IResult<Tst>;

    parsed = tstParser(NOT_TST);
    expect(parsed).toBeOk(
      Ok([
        "",
        {
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
        },
      ])
    );
  });

  it("parses a clocked test file", () => {
    let parsed: IResult<Tst>;

    parsed = tstParser(BIT_TST);
    expect(parsed).toBeOk(
      Ok([
        "",
        {
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
        },
      ])
    );
  });

  it("parses a test file with negative integers", () => {
    let parsed: IResult<Tst>;

    parsed = tstParser(MEM_TST);
    expect(parsed).toBeOk(
      Ok([
        "",
        {
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
        },
      ])
    );
  });
});

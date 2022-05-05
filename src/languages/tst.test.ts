import { Ok } from "@davidsouther/jiffies/result.js";
import { describe, expect, it } from "@davidsouther/jiffies/scope/index.js";
import {
  TEST_ONLY,
  Tst,
  TstOutputListOperation,
  TstOutputSpec,
  tstParser,
} from "./tst.js";
import { IResult, Span } from "./parser/base.js";

const NOT_TST = `
output-list in%B3.1.3 out%B3.1.3;

set in 0, eval, output;
set in 1, eval, output;`;

describe("tst language", () => {
  it("parses values", () => {
    let parsed: IResult<number>;

    parsed = TEST_ONLY.tstValue("%XFF");
    expect(parsed).toEqual(Ok(["", 255]));

    parsed = TEST_ONLY.tstValue("%D128");
    expect(parsed).toEqual(Ok(["", 128]));

    parsed = TEST_ONLY.tstValue("%127");
    expect(parsed).toEqual(Ok(["", 127]));

    parsed = TEST_ONLY.tstValue("%B11");
    expect(parsed).toEqual(Ok(["", 3]));

    parsed = TEST_ONLY.tstValue("%D-1");
    expect(parsed).toEqual(Ok(["", -1]));
  });

  it("parses an output format", () => {
    let parsed: IResult<TstOutputSpec>;

    parsed = TEST_ONLY.tstOutputFormat("a%B3.1.3");
    expect(parsed).toEqual(
      Ok(["", { id: "a", style: "B", width: 1, lpad: 3, rpad: 3 }])
    );
  });

  it("parses an output list", () => {
    let parsed: IResult<TstOutputListOperation>;

    parsed = TEST_ONLY.tstOutputListParser("output-list a%B1.1.1 out%X2.3.4");
    expect(parsed).toEqual(
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

  it("parses a test file", () => {
    let parsed: IResult<Tst>;

    parsed = tstParser(new Span(NOT_TST));

    expect(parsed).toEqual(
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
});

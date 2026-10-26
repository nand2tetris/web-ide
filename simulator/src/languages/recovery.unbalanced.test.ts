/**
 * Recovery from unbalanced blocks in Jack: a missing `}` is reported where the
 * parser finds it missing and the structure after it stays intact, and a `;`
 * or `}` inside a string literal never ends a skipped region.
 */
import { Err, isErr, Ok } from "@davidsouther/jiffies/result.ts";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  type CompilationError,
  isParseError,
  isParserRecoveryEnabled,
  type Parsed,
  type ParseResult,
  setParserRecovery,
} from "./base.js";
import { type ClassPartial, JACK } from "./jack.js";

const lines = (...l: string[]) => l.join("\n");

const MISSING_CLASS_CLOSE = lines(
  "class Main {",
  "  function void a() {",
  "    return;",
  "  }",
);

const MISSING_SUBROUTINE_CLOSE = lines(
  "class Main {",
  "  function void a() {",
  "    let x = 1;",
  "  function void b() {",
  "    retrn;",
  "  }",
  "}",
);

const MISSING_IF_CLOSE = lines(
  "class Main {",
  "  function void a() {",
  "    if (x) {",
  "      let y = 1;",
  "    let z = 2;",
  "    return;",
  "  }",
  "  function void b() {",
  "    retrn;",
  "  }",
  "}",
);

const MISSING_WHILE_CLOSE = lines(
  "class Main {",
  "  function void a() {",
  "    while (x) {",
  "      let y = 1;",
  "    return;",
  "  }",
  "  function void b() {",
  "    return;",
  "  }",
  "}",
);

const SEMI_IN_STRING = lines(
  "class Main {",
  "  function void a() {",
  '    do Output.printString("a;b" x);',
  "    let y = 1;",
  "    retrn;",
  "  }",
  "}",
);

const BRACE_IN_STRING = lines(
  "class Main {",
  "  function void a() {",
  '    do Output.printString("a}b" x);',
  "    let y = 1;",
  "    retrn;",
  "  }",
  "}",
);

const UNTERMINATED_STRING = lines(
  "class Main {",
  "  function void a() {",
  '    do Output.printString("abc);',
  "    let y = 1;",
  "    retrn;",
  "    return;",
  "  }",
  "}",
);

/** Today's single error for `source`, with recovery off. */
function plainError(source: string): CompilationError {
  const before = isParserRecoveryEnabled();
  setParserRecovery(false);
  const result = JACK.parse(source);
  setParserRecovery(before);
  expect(result).toBeErr();
  return Err(result as Err<CompilationError>);
}

function recovered(source: string): Parsed<ClassPartial> {
  const result: ParseResult<ClassPartial> = JACK.parse(source);
  if (isErr(result)) {
    const error = Err(result);
    throw new Error(
      `parse failed: ${(error.errors ?? [error]).map((e) => e.message).join(" | ")}`,
    );
  }
  return Ok(result as Ok<Parsed<ClassPartial>>);
}

const errorLines = (parsed: Parsed<ClassPartial>) =>
  parsed.errors.map((e) => e.span?.line);

const subroutineNames = (parsed: Parsed<ClassPartial>) =>
  parsed.ast.subroutines.map((s) =>
    isParseError(s) ? "<error>" : s.name.value,
  );

describe("Jack recovery from unbalanced blocks", () => {
  const before = isParserRecoveryEnabled();
  beforeAll(() => setParserRecovery(true));
  afterAll(() => setParserRecovery(before));

  it("reports a class missing its `}` and keeps its subroutines", () => {
    const parsed = recovered(MISSING_CLASS_CLOSE);
    expect(parsed.errors.map((e) => e.message)).toEqual([
      plainError(MISSING_CLASS_CLOSE).message,
    ]);
    expect(subroutineNames(parsed)).toEqual(["a"]);
  });

  it("closes a subroutine missing its `}` at the next subroutine", () => {
    const parsed = recovered(MISSING_SUBROUTINE_CLOSE);
    expect(errorLines(parsed)).toEqual([4, 5]);
    expect(parsed.errors[0].message).toBe(
      plainError(MISSING_SUBROUTINE_CLOSE).message,
    );
    expect(subroutineNames(parsed)).toEqual(["a", "b"]);
  });

  it("keeps the next subroutine when an `if` body lacks its `}`", () => {
    const parsed = recovered(MISSING_IF_CLOSE);
    expect(errorLines(parsed)).toEqual([8, 9]);
    expect(subroutineNames(parsed)).toEqual(["a", "b"]);
  });

  it("keeps the next subroutine when a `while` body lacks its `}`", () => {
    const parsed = recovered(MISSING_WHILE_CLOSE);
    expect(errorLines(parsed)).toEqual([7]);
    expect(subroutineNames(parsed)).toEqual(["a", "b"]);
  });

  it.each([
    ["`;`", SEMI_IN_STRING],
    ["`}`", BRACE_IN_STRING],
  ])(
    "does not end a skipped statement at a %s inside a string",
    (_, source) => {
      const parsed = recovered(source);
      expect(errorLines(parsed)).toEqual([3, 5]);
      expect(parsed.errors[0].message).toBe(plainError(source).message);
      const sub = parsed.ast.subroutines[0];
      if (isParseError(sub)) throw new Error("subroutine lost");
      expect(sub.body.statements).toHaveLength(3);
      expect(sub.body.statements[1]).toMatchObject({
        statementType: "letStatement",
        name: { value: "y" },
      });
    },
  );

  it.each([
    [
      "a stray `}` between subroutines",
      lines(
        "class Main {",
        "  function void a() {",
        "    return;",
        "  }",
        "  }",
        "  function void b() {",
        "    return;",
        "  }",
        "}",
      ),
    ],
    ["text after the class", "class Main { }\nfoo"],
  ])("leaves the first error of %s unchanged", (_, source) => {
    const result = JACK.parse(source);
    const first: CompilationError = isErr(result)
      ? Err(result)
      : Ok(result as Ok<Parsed<ClassPartial>>).errors[0];
    const plain = plainError(source);
    expect(first.message).toBe(plain.message);
    expect(first.span?.line).toBe(plain.span?.line);
  });

  it("still recovers an unterminated string at its own line", () => {
    const parsed = recovered(UNTERMINATED_STRING);
    expect(errorLines(parsed)).toEqual([3, 5]);
    const sub = parsed.ast.subroutines[0];
    if (isParseError(sub)) throw new Error("subroutine lost");
    expect(sub.body.statements[1]).toMatchObject({
      statementType: "letStatement",
      name: { value: "y" },
    });
  });
});

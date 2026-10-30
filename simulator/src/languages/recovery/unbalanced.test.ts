/**
 * Recovery from unbalanced blocks in Jack: a missing `}` is reported where the
 * parser finds it missing and the structure after it stays intact, and a `;`
 * or `}` inside a string literal never ends a skipped region.
 */
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  type Diagnostic,
  describeEnglish,
  isParserRecoveryEnabled,
  isRecovered,
  isValid,
  type Outcome,
  setParserRecovery,
} from "../base.js";
import { type Class, JACK } from "../jack.js";

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

/** A call whose failure comes before a string argument holding `text`. */
const stringAfterFailure = (text: string) =>
  lines(
    "class Main {",
    "  function void a() {",
    `    do f(x y, "${text}");`,
    "    let y = 1;",
    "    retrn;",
    "  }",
    "  function void b() {",
    "    retrn;",
    "  }",
    "}",
  );

const BRACE_IN_STRING_AFTER_MISSING_CLOSE = lines(
  "class Main {",
  "  function void a() {",
  "    if (x) {",
  "      let y = 1;",
  '      retrn "}";',
  "    return;",
  "  }",
  "  function void b() {",
  "    retrn;",
  "  }",
  "}",
);

const MISSING_CLASS_AND_SUBROUTINE_CLOSE = lines(
  "class Main {",
  "  function void a() {",
  "    let x = 1;",
  "    retrn;",
);

/** The single error for `source` with recovery off. */
function plainError(source: string): Diagnostic {
  const before = isParserRecoveryEnabled();
  setParserRecovery(false);
  const result = JACK.parse(source);
  setParserRecovery(before);
  if (isValid(result)) throw new Error("parse is valid");
  return result.diagnostics[0];
}

/** A parse with diagnostics. */
type Recovered = Exclude<Outcome<Class>, { diagnostics: readonly [] }>;

function recovered(source: string): Recovered {
  const outcome = JACK.parse(source);
  if (isValid(outcome)) throw new Error("parse is valid");
  const messages = outcome.diagnostics
    .map((e) => describeEnglish(e))
    .join(" | ");
  expect(outcome.ast, `parse did not recover: ${messages}`).not.toEqual(
    JACK.empty(),
  );
  return outcome;
}

const errorLines = (parsed: Recovered) =>
  parsed.diagnostics.map((e) => e.span?.line);

const subroutineNames = (parsed: Recovered) =>
  parsed.ast.subroutines.map((s) =>
    isRecovered(s) ? "<error>" : s.name.value,
  );

describe("Jack recovery from unbalanced blocks", () => {
  const before = isParserRecoveryEnabled();
  beforeAll(() => setParserRecovery(true));
  afterAll(() => setParserRecovery(before));

  it("returns the null root when a class has no matching closer", () => {
    const parsed = JACK.parse(MISSING_CLASS_CLOSE);

    expect(parsed.ast).toEqual(JACK.empty());
    expect(parsed.diagnostics[0]).toEqual(plainError(MISSING_CLASS_CLOSE));
  });

  it("uses the class join when a subroutine cannot match its own join", () => {
    const parsed = recovered(MISSING_SUBROUTINE_CLOSE);

    expect(errorLines(parsed)).toEqual([4]);
    expect(parsed.diagnostics[0]).toEqual(plainError(MISSING_SUBROUTINE_CLOSE));
    expect(subroutineNames(parsed)).toEqual(["<error>"]);
    expect(parsed.ast.subroutines[0].name.span).toMatchObject({
      start: MISSING_SUBROUTINE_CLOSE.indexOf("function"),
      end: MISSING_SUBROUTINE_CLOSE.lastIndexOf("\n}"),
    });
  });

  it("uses the class join after an unmatched if body", () => {
    const parsed = recovered(MISSING_IF_CLOSE);

    expect(errorLines(parsed)).toEqual([8]);
    expect(parsed.diagnostics[0]).toEqual(plainError(MISSING_IF_CLOSE));
    expect(subroutineNames(parsed)).toEqual(["<error>"]);
    expect(parsed.ast.subroutines[0].name.span).toMatchObject({
      start: MISSING_IF_CLOSE.indexOf("function"),
      end: MISSING_IF_CLOSE.lastIndexOf("\n}"),
    });
  });

  it("uses the class join after an unmatched while body", () => {
    const parsed = recovered(MISSING_WHILE_CLOSE);

    expect(errorLines(parsed)).toEqual([7]);
    expect(parsed.diagnostics[0]).toEqual(plainError(MISSING_WHILE_CLOSE));
    expect(subroutineNames(parsed)).toEqual(["<error>"]);
    expect(parsed.ast.subroutines[0].name.span).toMatchObject({
      start: MISSING_WHILE_CLOSE.indexOf("function"),
      end: MISSING_WHILE_CLOSE.lastIndexOf("\n}"),
    });
  });

  it.each([
    ["`;`", SEMI_IN_STRING],
    ["`}`", BRACE_IN_STRING],
  ])(
    "does not end a skipped statement at a %s inside a string",
    (_, source) => {
      const parsed = recovered(source);
      expect(errorLines(parsed)).toEqual([3, 5]);
      expect(describeEnglish(parsed.diagnostics[0])).toBe(
        describeEnglish(plainError(source)),
      );
      const sub = parsed.ast.subroutines[0];
      if (isRecovered(sub)) throw new Error("subroutine lost");
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
    if (isValid(result)) throw new Error("parse is valid");
    const first: Diagnostic = result.diagnostics[0];
    const plain = plainError(source);
    expect(describeEnglish(first)).toBe(describeEnglish(plain));
    expect(first.span?.line).toBe(plain.span?.line);
  });

  it.each([["a;b"], ["a}b"], ["a function b"], ["a//b"]])(
    "skips a string holding %s after the failure point whole",
    (text) => {
      const source = stringAfterFailure(text);
      const parsed = recovered(source);
      expect(errorLines(parsed)).toEqual([3, 5, 8]);
      expect(describeEnglish(parsed.diagnostics[0])).toBe(
        describeEnglish(plainError(source)),
      );
      expect(subroutineNames(parsed)).toEqual(["a", "b"]);
      const sub = parsed.ast.subroutines[0];
      if (isRecovered(sub)) throw new Error("subroutine lost");
      expect(sub.body.statements[1]).toMatchObject({
        statementType: "letStatement",
        name: { value: "y" },
      });
    },
  );

  it("ignores braces in strings while recovering at the class join", () => {
    const parsed = recovered(BRACE_IN_STRING_AFTER_MISSING_CLOSE);

    expect(errorLines(parsed)).toEqual([5, 8]);
    expect(parsed.diagnostics[0]).toEqual(
      plainError(BRACE_IN_STRING_AFTER_MISSING_CLOSE),
    );
    expect(subroutineNames(parsed)).toEqual(["<error>"]);
    expect(parsed.ast.subroutines[0].name.span).toMatchObject({
      start: BRACE_IN_STRING_AFTER_MISSING_CLOSE.indexOf("function"),
      end: BRACE_IN_STRING_AFTER_MISSING_CLOSE.lastIndexOf("\n}"),
    });
  });

  it("returns the null root when nested blocks have no matching closer", () => {
    const parsed = JACK.parse(MISSING_CLASS_AND_SUBROUTINE_CLOSE);

    expect(parsed.ast).toEqual(JACK.empty());
    expect(parsed.diagnostics[0]).toEqual(
      plainError(MISSING_CLASS_AND_SUBROUTINE_CLOSE),
    );
  });

  it("recovers an unterminated string at its own line", () => {
    const parsed = recovered(UNTERMINATED_STRING);
    expect(errorLines(parsed)).toEqual([3, 5]);
    const sub = parsed.ast.subroutines[0];
    if (isRecovered(sub)) throw new Error("subroutine lost");
    expect(sub.body.statements[1]).toMatchObject({
      statementType: "letStatement",
      name: { value: "y" },
    });
  });
});

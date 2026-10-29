import { display } from "@davidsouther/jiffies/display.ts";
import {
  FileSystem,
  ObjectFileSystemAdapter,
} from "@davidsouther/jiffies/fs.ts";
import { Err, isErr, unwrap } from "@davidsouther/jiffies/result.ts";
import { describe, expect, it } from "vitest";
import { validOf } from "../languages/base.js";
import { HDL } from "../languages/hdl.js";
import { bin } from "../util/twos.js";
import { build, loadChip, parse } from "./builder.js";
import { Chip, HIGH, LOW } from "./chip.js";

function asDisplay(e: unknown): string {
  return display(
    (e as { message: string }).message ??
      (e as { shortMessage: string }).shortMessage ??
      e,
  );
}

describe("Chip Builder", () => {
  it("builds a chip from a string", async () => {
    const nand = unwrap(
      await parse(
        `CHIP Not { IN in; OUT out; PARTS: Nand(a=in, b=in, out=out); }`,
      ),
    );

    nand.in().pull(LOW);
    nand.eval();
    expect(nand.out().voltage()).toBe(HIGH);

    nand.in().pull(HIGH);
    nand.eval();
    expect(nand.out().voltage()).toBe(LOW);
  });

  it("builds and evals a chip with subbus components", async () => {
    let foo: Chip;
    try {
      foo = unwrap(
        await parse(
          `CHIP Foo {
          IN six[3];
          OUT out;
          PARTS: Not16(
            in[0..1] = true,
            in[3..5] = six,
            in[7] = true,
            );
          }`,
        ),
      );
    } catch (e) {
      throw new Error(asDisplay(e));
    }
    const six = foo.in("six");
    six.busVoltage = 6;
    foo.eval();
    const inVoltage = [...foo.parts][0].in().busVoltage;
    expect(bin(inVoltage)).toBe(bin(0b10110011));

    // const outVoltage = foo.pin("out1").busVoltage;
    // expect(outVoltage).toBe(0b01001);
    // expect(outVoltage).toBe(0b11001);
  });

  it("builds and evals a chip with subpins", async () => {
    let foo: Chip;
    try {
      foo = unwrap(
        await parse(`
        CHIP Not2 {
          IN in[2];
          OUT out[2];
          PARTS:
          Not(in=in[0], out=out[0]);
          Not(in=in[1], out=out[1]);
        }
      `),
      );
    } catch (e) {
      throw new Error(asDisplay(e));
    }

    foo.in().busVoltage = 0b00;
    foo.eval();
    expect(foo.out().busVoltage).toBe(0b11);

    foo.in().busVoltage = 0b11;
    foo.eval();
    expect(foo.out().busVoltage).toBe(0b00);
  });

  it("builds and evals a chip with subbus components on the right", async () => {
    let foo: Chip;
    try {
      foo = unwrap(
        await parse(
          `CHIP Foo {
          IN in[16];
          OUT out[5];
          PARTS: Not16(
            in[0..7] = in[4..11],
            // in[8..15] = false,
            out[3..5] = out[1..3],
            );
          }`,
        ),
      );
    } catch (e) {
      throw new Error(asDisplay(e));
    }

    foo.in().busVoltage = 0b1010_1100_0011_0101;
    foo.eval();
    const inVoltage = [...foo.parts][0].in().busVoltage;
    const outVoltage = foo.out().busVoltage;
    expect(bin(inVoltage)).toBe(bin(0b11000011));
    expect(bin(outVoltage)).toBe(bin(0b01110));
  });

  it("looks up unknown chips in fs", async () => {
    const fs = new FileSystem(
      new ObjectFileSystemAdapter({ "Copy.hdl": COPY_HDL }),
    );

    let foo: Chip;

    try {
      const chip = unwrap(validOf(HDL.parse(USE_COPY_HDL)));
      foo = unwrap(await build({ parts: chip, dir: ".", fs }));
    } catch (e) {
      throw new Error(asDisplay(e));
    }

    foo.in("a").pull(HIGH);
    foo.eval();
    expect(foo.out("b").busVoltage).toBe(1);

    foo.in("a").pull(LOW);
    foo.eval();
    expect(foo.out("b").busVoltage).toBe(0);
  });

  it("returns error for mismatching input width", async () => {
    try {
      const chip = unwrap(
        validOf(
          HDL.parse(`CHIP Foo {
        IN in[3]; OUT out;
        PARTS: Or8Way(in=in, out=out);
      }`),
        ),
      );
      const foo = await build({ parts: chip });
      expect(foo).toBeErr();
    } catch (e) {
      throw new Error(asDisplay(e));
    }
  });

  it("returns error for mismatching output width", async () => {
    try {
      const chip = unwrap(
        validOf(
          HDL.parse(`CHIP Foo {
        IN in; OUT out[5];
        PARTS: Not(in=in, out=out);
      }`),
        ),
      );
      const foo = await build({ parts: chip });
      expect(foo).toBeErr();
    } catch (e) {
      throw new Error(asDisplay(e));
    }
  });

  it("returns error for wire loop", async () => {
    try {
      const chip = unwrap(
        validOf(
          HDL.parse(`CHIP Not {
        IN in;
        OUT out;
        PARTS:
        Nand(a=in, b=myNand, out=myNand);
      }`),
        ),
      );
      const foo = await build({ parts: chip });
      expect(foo).toBeErr();
    } catch (e) {
      throw new Error(asDisplay(e));
    }
  });

  it("returns error for part loop", async () => {
    try {
      const chip = unwrap(
        validOf(
          HDL.parse(`CHIP Not {
        IN in;
        OUT out;
        PARTS:
        Nand(a=in, b=b, out=c);
        Nand(a=in, b=c, out=b);
      }`),
        ),
      );
      const foo = await build({ parts: chip });
      expect(foo).toBeErr();
    } catch (e) {
      throw new Error(asDisplay(e));
    }
  });

  it("sorts after wiring", async () => {
    try {
      const chip = unwrap(
        validOf(
          HDL.parse(`CHIP Or { IN a, b; OUT out;
  PARTS:
  Not(in =b , out = net2);
  Nand(a = net, b =net2 , out =out );
  Not(in =a , out = net);
}`),
        ),
      );
      const orA = await build({ parts: chip });
      expect(orA).toBeOk();

      const ora = unwrap(orA);

      ora.in("a").pull(HIGH);
      ora.in("b").pull(LOW);
      ora.eval();
      expect(ora.out("out").busVoltage).toBe(HIGH);
    } catch (e) {
      throw new Error(asDisplay(e));
    }
  });
});

const USE_COPY_HDL = `CHIP UseCopy {
  IN a; OUT b;
  PARTS: Copy(in=a, out=b);
}`;

const COPY_HDL = `CHIP Copy { 
    IN in; OUT out;
    PARTS: Or(a=in, b=in, out=out);
}`;

describe("Chip Builder diagnostics", () => {
  const diagnosticsOf = async (
    ...args: Parameters<typeof parse>
  ): Promise<Record<string, readonly string[]>> => {
    const chip = await parse(...args);
    expect(chip).toBeErr();
    return Object.fromEntries(
      Object.entries(isErr(chip) ? Err(chip) : {}).map(([file, list]) => [
        file,
        list.map(({ message }) => message),
      ]),
    );
  };

  it("reports every independent semantic error", async () => {
    const source = [
      "CHIP Foo {",
      "  IN a; OUT out;",
      "  PARTS:",
      "  Nope(a=a, out=x);",
      "  Never(a=a, out=out);",
      "}",
    ].join("\n");

    const diagnostics = await diagnosticsOf(source);

    expect(diagnostics).toEqual({
      "<input>.hdl": [
        "Line 4: Undefined chip name: Nope",
        "Line 5: Undefined chip name: Never",
      ],
    });
  });

  it("reports an undriven internal pin when no part was skipped", async () => {
    const source = [
      "CHIP Foo {",
      "  IN a; OUT out;",
      "  PARTS:",
      "  Not(in=x, out=out);",
      "}",
    ].join("\n");

    const diagnostics = await diagnosticsOf(source);

    expect(diagnostics).toEqual({
      "<input>.hdl": ["Line 4: Undefined internal pin name: x"],
    });
  });

  it("does not report an internal pin a skipped part could drive", async () => {
    const source = [
      "CHIP Foo {",
      "  IN a; OUT out;",
      "  PARTS:",
      "  Not(in=a out=x);",
      "  Not(in=x, out=out);",
      "}",
    ].join("\n");

    const diagnostics = await diagnosticsOf(source);

    expect(diagnostics["<input>.hdl"]).toHaveLength(1);
    expect(diagnostics["<input>.hdl"][0]).not.toMatch(/internal pin/);
  });

  it("does not report an internal pin a skipped IN line could declare", async () => {
    const source = [
      "CHIP Foo {",
      "  IN a b;",
      "  OUT out;",
      "  PARTS:",
      "  Not(in=b, out=out);",
      "}",
    ].join("\n");

    const diagnostics = await diagnosticsOf(source);

    expect(diagnostics["<input>.hdl"]).toHaveLength(1);
    expect(diagnostics["<input>.hdl"][0]).not.toMatch(/internal pin/);
  });

  it("does not report an internal pin only an undefined part drives", async () => {
    const source = [
      "CHIP Foo {",
      "  IN a; OUT out;",
      "  PARTS:",
      "  Nope(a=a, out=x);",
      "  Not(in=x, out=out);",
      "  Not(in=y, out=z);",
      "}",
    ].join("\n");

    const diagnostics = await diagnosticsOf(source);

    expect(diagnostics).toEqual({
      "<input>.hdl": [
        "Line 4: Undefined chip name: Nope",
        "Line 6: Undefined internal pin name: y",
      ],
    });
  });

  const topUsing = (...parts: string[]) =>
    ["CHIP Top {", "  IN a; OUT out;", "  PARTS:", ...parts, "}"].join("\n");
  const filesWith = (files: Record<string, string>) =>
    new FileSystem(new ObjectFileSystemAdapter(files));

  it("keeps a recovered dependency's diagnostics under its file", async () => {
    const fs = filesWith({
      "Child.hdl": [
        "CHIP Child {",
        "  IN a; OUT out;",
        "  PARTS:",
        "  Not(in=a out=x);",
        "  Nope(in=a, out=out);",
        "}",
      ].join("\n"),
    });
    const top = topUsing("  Child(a=a, out=out);", "  Not(in=out, out=x);");

    const diagnostics = await diagnosticsOf(top, ".", "Top", fs);

    expect(diagnostics).toEqual({
      "./Child.hdl": [
        expect.stringMatching(/^Line 4: /),
        "Line 5: Undefined chip name: Nope",
      ],
      "./Top.hdl": ["Line 5: Cannot use output pin as input"],
    });
  });

  it("does not report a part pin a skipped declaration could supply", async () => {
    const fs = filesWith({
      "Child.hdl": [
        "CHIP Child {",
        "  IN a b;",
        "  OUT out;",
        "  PARTS:",
        "  Not(in=a, out=out);",
        "}",
      ].join("\n"),
    });
    const top = topUsing("  Child(b=a, out=out);");

    const diagnostics = await diagnosticsOf(top, ".", "Top", fs);

    expect(Object.keys(diagnostics)).toEqual(["./Child.hdl"]);
  });

  it("reports a part pin a skipped part could not supply", async () => {
    const fs = filesWith({
      "Child.hdl": [
        "CHIP Child {",
        "  IN a; OUT out;",
        "  PARTS:",
        "  Not(in=a out=out);",
        "}",
      ].join("\n"),
    });
    const top = topUsing("  Child(b=a, out=out);");

    const diagnostics = await diagnosticsOf(top, ".", "Top", fs);

    expect(diagnostics["./Top.hdl"]).toEqual(["Line 4: Undefined pin name: b"]);
  });

  it("adds no declaration and no caller error for a dependency with no tree", async () => {
    const fs = filesWith({ "Child.hdl": "CHIP Child { IN a OUT out; }" });
    const top = topUsing("  Child(a=a, out=x);", "  Not(in=out, out=y);");

    const diagnostics = await diagnosticsOf(top, ".", "Top", fs, {
      attemptRecovery: false,
    });

    expect(diagnostics).toEqual({
      "./Child.hdl": [expect.stringMatching(/^Line 1: /)],
      "./Top.hdl": ["Line 5: Cannot use output pin as input"],
    });
  });

  it("reports an unreadable dependency at the referring part", async () => {
    const top = topUsing("  Child(a=a, out=out);");

    const diagnostics = await diagnosticsOf(top, ".", "Top", filesWith({}));

    expect(diagnostics).toEqual({
      "./Top.hdl": ["Line 4: Undefined chip name: Child"],
    });
  });

  it("reports a chip that cannot be loaded without a referring part", async () => {
    const chip = await loadChip("Child", ".", filesWith({}));

    expect(chip).toBeErr();
    expect(isErr(chip) && Err(chip)).toEqual({
      "./Child.hdl": [{ message: "Could not load chip ./Child.hdl" }],
    });
  });

  describe("recovery option", () => {
    const source = [
      "CHIP Foo {",
      "  IN a; OUT out;",
      "  PARTS:",
      "  Not(in=a out=x);",
      "  Nope(in=a, out=out);",
      "}",
    ].join("\n");

    it("recovers by default", async () => {
      const diagnostics = await diagnosticsOf(source);

      expect(diagnostics["<input>.hdl"]).toHaveLength(2);
    });

    it("recovers when asked", async () => {
      const diagnostics = await diagnosticsOf(
        source,
        undefined,
        undefined,
        undefined,
        {
          attemptRecovery: true,
        },
      );

      expect(diagnostics["<input>.hdl"]).toHaveLength(2);
    });

    it("stops at the first syntax error when off", async () => {
      const diagnostics = await diagnosticsOf(
        source,
        undefined,
        undefined,
        undefined,
        {
          attemptRecovery: false,
        },
      );

      expect(diagnostics).toEqual({
        "<input>.hdl": [expect.stringMatching(/^Line 4: /)],
      });
    });
  });

  describe("a damaged CHIP header", () => {
    it("checks a chip whose header lost its name under the name it loads as", async () => {
      const source = [
        "CHIP {",
        "  IN a; OUT out;",
        "  PARTS:",
        "  Nope(a=a, out=out);",
        "}",
      ].join("\n");

      const diagnostics = await diagnosticsOf(
        source,
        ".",
        "Foo",
        filesWith({}),
      );

      expect(diagnostics).toEqual({
        "./Foo.hdl": [
          "Line 1: expected a letter",
          "Line 4: Undefined chip name: Nope",
        ],
      });
    });

    it("loads a dependency whose header lost its name as the part names it", async () => {
      const fs = filesWith({
        "Child.hdl": [
          "CHP Child {",
          "  IN a; OUT out;",
          "  PARTS:",
          "  Not(in=a, out=out);",
          "}",
        ].join("\n"),
      });
      const top = topUsing("  Child(a=a, out=out);", "  Not(in=out, out=x);");

      const diagnostics = await diagnosticsOf(top, ".", "Top", fs);

      expect(diagnostics).toEqual({
        "./Child.hdl": ['Line 1: expected "CHIP"'],
        "./Top.hdl": ["Line 5: Cannot use output pin as input"],
      });
    });

    it("loads a builtin whose header lost its name as the name it loads as", async () => {
      const source = ["CHIP {", "  IN in; OUT out;", "  BUILTIN;", "}"].join(
        "\n",
      );

      const named = await diagnosticsOf(source, ".", "Not", filesWith({}));
      const unnamed = await diagnosticsOf(source);

      expect(named).toEqual({ "./Not.hdl": ["Line 1: expected a letter"] });
      expect(unnamed).toEqual({ "<input>.hdl": ["Line 1: expected a letter"] });
    });

    it("does not report a part pin a skipped chip start could declare", async () => {
      const fs = filesWith({
        "Child.hdl": [
          "CHIP Child",
          "  IN a; OUT out;",
          "  PARTS:",
          "  Not(in=a, out=out);",
          "}",
        ].join("\n"),
      });
      const top = topUsing("  Child(a=a, out=out);");

      const diagnostics = await diagnosticsOf(top, ".", "Top", fs);

      expect(diagnostics).toEqual({ "./Child.hdl": ['Line 2: expected "{"'] });
    });

    it("does not report an internal pin a part after an early closer could drive", async () => {
      const source = [
        "CHIP Foo {",
        "  IN a; OUT out;",
        "  PARTS:",
        "  Not(in=y, out=out);",
        "  }",
        "  Not(in=a, out=y);",
        "}",
      ].join("\n");

      const diagnostics = await diagnosticsOf(source);

      expect(diagnostics).toEqual({
        "<input>.hdl": ["Line 6: expected end of input"],
      });
    });
  });

  it("bounds suppression to checks a skipped node could supply", async () => {
    const source = [
      "CHIP Foo {",
      "  IN a b;",
      "  OUT out;",
      "  PARTS:",
      "  Not(in=a out=x);",
      "  Not(in=y, out=out);",
      "  Not(in=out, out=z);",
      "}",
    ].join("\n");

    const diagnostics = await diagnosticsOf(source);

    // The undriven `y` is suppressed; the misused output is not.
    expect(diagnostics["<input>.hdl"]).toEqual([
      expect.stringMatching(/^Line 2: /),
      expect.stringMatching(/^Line 5: /),
      "Line 7: Cannot use output pin as input",
    ]);
  });
});

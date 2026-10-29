import { Err, isErr, unwrap } from "@davidsouther/jiffies/result.ts";
import { vm as SIMPLE_FUNCTION } from "@nand2tetris/projects/project_08/20_simple_function.js";
import { FIBONACCI } from "@nand2tetris/projects/samples/vm/fibonnaci.js";
import {
  BRANCHING_FUNCTION,
  NESTED_FUNCTION,
  STATIC,
} from "@nand2tetris/projects/samples/vm/vm.js";
import { describe, expect, test } from "vitest";
import { validOf } from "../languages/base.js";
import { VM } from "../languages/vm.js";
import { joinedDiagnostics, loadVm, VM_INPUT, Vm, type VmFile } from "./vm.js";

test("Simple Adder VM", () => {
  const vm = unwrap(
    Vm.build([
      { op: "push", segment: "constant", offset: 7 },
      { op: "push", segment: "constant", offset: 8 },
      { op: "add" },
    ]),
  );

  expect(vm.read([0])).toEqual([256]);
  vm.step(); // push 7
  expect(vm.read([0, 256])).toEqual([257, 7]);
  vm.step(); // push 8
  expect(vm.read([0, 256, 257])).toEqual([258, 7, 8]);
  vm.step(); // add
  expect(vm.read([0, 256, 257])).toEqual([257, 15, 8]);
  vm.step(); // goto __END
  expect(vm.read([0, 256])).toEqual([257, 15]);
  vm.step(); // goto __END
  expect(vm.read([0, 256])).toEqual([257, 15]);
});

const BIT_TEST = `
push constant 57
push constant 31
push constant 53
add
push constant 112
sub
neg
and
push constant 82
or
not
`;

test("Bit Ops", () => {
  const { instructions } = unwrap(validOf(VM.parse(BIT_TEST)));
  const vm = unwrap(Vm.build(instructions));

  for (let i = 0; i < 11; i++) {
    vm.step();
  }

  const stack = vm.read([0, 256]);
  expect(stack).toEqual([257, -91]);
});

const STACK_TEST = `
push constant 17
push constant 17
eq
push constant 17
push constant 16
eq
push constant 16
push constant 17
eq
push constant 892
push constant 891
lt
push constant 891
push constant 892
lt
push constant 891
push constant 891
lt
push constant 32767
push constant 32766
gt
push constant 32766
push constant 32767
gt
push constant 32766
push constant 32766
gt
push constant 57
push constant 31
push constant 53
add
push constant 112
sub
neg
and
push constant 82
or
not
`;

test("07 / Memory Access / Stack Test", () => {
  const { instructions } = unwrap(validOf(VM.parse(STACK_TEST)));
  const vm = unwrap(Vm.build(instructions));

  for (let i = 0; i < 38; i++) {
    vm.step();
  }

  const cells = [0, 256, 257, 258, 259, 260, 261, 262, 263, 264, 265];
  const values = [266, -1, 0, 0, 0, -1, 0, -1, 0, 0, -91];
  const stack = vm.read(cells);
  const actual = cells.map((a, i) => [a, stack[i]]);
  const expected = cells.map((a, i) => [a, values[i]]);
  expect(actual).toEqual(expected);
});

const BASIC_TEST = `
push constant 10
pop local 0
push constant 21
push constant 22
pop argument 2
pop argument 1
push constant 36
pop this 6
push constant 42
push constant 45
pop that 5
pop that 2
push constant 510
pop temp 6
push local 0
push that 5
add
push argument 1
sub
push this 6
push this 6
add
sub
push temp 6
add
`;

test("07 / Memory Access / Basic Test", () => {
  const { instructions } = unwrap(validOf(VM.parse(BASIC_TEST)));
  const vm = unwrap(Vm.build(instructions));

  vm.write([
    [0, 256],
    [1, 300],
    [2, 400],
    [3, 3000],
    [4, 3010],
  ]);
  vm.segmentInitializations["argument"].initialized = true;
  vm.segmentInitializations["local"].initialized = true;
  vm.invocation.thisInitialized = true;
  vm.invocation.thatInitialized = true;

  for (let i = 0; i < 25; i++) {
    vm.step();
  }

  const test = vm.read([256, 300, 401, 402, 3006, 3012, 3015, 11]);
  expect(test).toEqual([472, 10, 21, 22, 36, 42, 45, 510]);
});

const POINTER_TEST = `
push constant 3030
pop pointer 0
push constant 3040
pop pointer 1
push constant 32
pop this 2
push constant 46
pop that 6
push pointer 0
push pointer 1
add
push this 2
sub
push that 6
add
`;

test("07 / Memory Access / Pointer Test", () => {
  const { instructions } = unwrap(validOf(VM.parse(POINTER_TEST)));
  const vm = unwrap(Vm.build(instructions));

  vm.write([
    [0, 256],
    [1, 300],
    [2, 400],
    [3, 3000],
    [4, 3010],
  ]);
  vm.segmentInitializations["argument"].initialized = true;
  vm.segmentInitializations["local"].initialized = true;
  vm.invocation.thisInitialized = true;
  vm.invocation.thatInitialized = true;

  for (let i = 0; i < 16; i++) {
    vm.step();
  }

  const test = vm.read([256, 3, 4, 3032, 3046]);
  expect(test).toEqual([6084, 3030, 3040, 32, 46]);
});

test("08 / Branching Function", () => {
  const { instructions } = unwrap(validOf(VM.parse(BRANCHING_FUNCTION)));
  const vm = unwrap(Vm.build(instructions));

  vm.write([]);

  for (let i = 0; i < 100; i++) {
    vm.step();
  }

  const test = vm.read([0, 256]);
  expect(test).toEqual([257, 12]);
});

const LOOP_TEST = `
push constant 0    
pop local 0         // initializes sum = 0
label LOOP_START
push argument 0    
push local 0
add
pop local 0	        // sum = sum + counter
push argument 0
push constant 1
sub
pop argument 0      // counter--
push argument 0
if-goto LOOP_START  // If counter != 0, goto LOOP_START
push local 0
`;

test("08 / Program Flow / Basic Loop", () => {
  const { instructions } = unwrap(validOf(VM.parse(LOOP_TEST)));
  const vm = unwrap(Vm.build(instructions));

  vm.write([
    [0, 256],
    [1, 300],
    [2, 400],
    [400, 3],
  ]);
  vm.segmentInitializations["argument"].initialized = true;
  vm.segmentInitializations["local"].initialized = true;

  for (let i = 0; i < 33; i++) {
    vm.step();
  }

  const test = vm.read([0, 256]);
  expect(test).toEqual([257, 6]);
});

const FIBONACCI_SERIES = `
push argument 1
pop pointer 1           // that = argument[1]

push constant 0
pop that 0              // first element in the series = 0
push constant 1
pop that 1              // second element in the series = 1

push argument 0
push constant 2
sub
pop argument 0          // num_of_elements -= 2 (first 2 elements are set)

label MAIN_LOOP_START

push argument 0
if-goto COMPUTE_ELEMENT // if num_of_elements > 0, goto COMPUTE_ELEMENT
goto END_PROGRAM        // otherwise, goto END_PROGRAM

label COMPUTE_ELEMENT

push that 0
push that 1
add
pop that 2              // that[2] = that[0] + that[1]

push pointer 1
push constant 1
add
pop pointer 1           // that += 1

push argument 0
push constant 1
sub
pop argument 0          // num_of_elements--

goto MAIN_LOOP_START

label END_PROGRAM
`;

test("08 / Program Flow / Fibonacci Series", () => {
  const { instructions } = unwrap(validOf(VM.parse(FIBONACCI_SERIES)));
  const vm = unwrap(Vm.build(instructions));

  vm.write([
    [0, 256],
    [1, 300],
    [2, 400],
    [400, 6],
    [401, 3000],
  ]);
  vm.segmentInitializations["argument"].initialized = true;
  vm.segmentInitializations["local"].initialized = true;

  for (let i = 0; i < 1000; i++) {
    vm.step();
  }

  const test = vm.read([3000, 3001, 3002, 3003, 3004, 3005]);
  expect(test).toEqual([0, 1, 1, 2, 3, 5]);
});

test("08 / Functions / SimpleFunction", () => {
  const { instructions } = unwrap(validOf(VM.parse(SIMPLE_FUNCTION)));
  const vm = unwrap(Vm.build(instructions));

  expect(() => vm.vmStack()).not.toThrow("Assertion failed");
});

test("08 / Functions / NestedCall", () => {
  const { instructions } = unwrap(validOf(VM.parse(NESTED_FUNCTION)));
  const vm = unwrap(Vm.build(instructions));

  const init: [number, number][] = [
    [0, 261],
    [1, 261],
    [2, 256],
    [3, 3000],
    [4, 4000],
    [5, -1],
    [6, -1],
    [256, 1234],
    [257, -1],
    [258, -2],
    [259, -3],
    [260, -4],
  ];

  for (let i = 261; i < 300; i++) {
    init.push([i, -1]);
  }

  vm.write(init);
  vm.segmentInitializations["argument"].initialized = true;
  vm.segmentInitializations["local"].initialized = true;
  vm.invocation.thisInitialized = true;
  vm.invocation.thatInitialized = true;

  for (let i = 0; i < 1000; i++) {
    vm.step();
  }

  const test = vm.read([0, 1, 2, 3, 4, 5, 6]);
  expect(test).toEqual([261, 261, 256, 4000, 5000, 135, 246]);
});

test("08 / Functions / Fib", () => {
  const { instructions } = unwrap(validOf(VM.parse(FIBONACCI)));
  const vm = unwrap(Vm.build(instructions));

  for (let i = 0; i < 1000; i++) {
    vm.step();
  }

  const test = vm.read([0, 256]);
  expect(test).toEqual([257, 3]);
});

test("08 / Functions / Static", () => {
  const { instructions } = unwrap(validOf(VM.parse(STATIC)));
  const vm = unwrap(Vm.build(instructions));

  for (let i = 0; i < 1000; i++) {
    vm.step();
  }

  const test = vm.read([0, 256, 257]);
  expect(test).toEqual([258, -2, 8]);
});

describe("debug frame views", () => {
  test("top frame", () => {
    const { instructions } = unwrap(validOf(VM.parse(FIBONACCI)));
    const vm = unwrap(Vm.build(instructions));

    expect(vm.vmStack().length).toBe(1);
  });

  test("entry frame `that` reflects memory at THAT, not the THAT pointer", () => {
    const { instructions } = unwrap(validOf(VM.parse(FIBONACCI)));
    const vm = unwrap(Vm.build(instructions));
    // Set the THAT pointer and the memory it points to so the two are easy
    // to distinguish.
    vm.memory.set(4, 12345);
    vm.memory.set(12345, 7777);

    const top = vm.vmStack()[0];
    expect(top.that.values).toEqual([7777]);
  });
});

test("buildFromFiles with no files returns a Diagnostic under the input key", () => {
  const result = Vm.buildFromFiles([]);
  if (!isErr(result)) throw new Error("expected Err result");
  expect(Object.keys(Err(result))).toEqual([VM_INPUT]);
  expect(Err(result)[VM_INPUT][0].message).toMatch(/no\s+\.vm/i);
});

describe("Array.new / Array.dispose bridge to user Memory", () => {
  test("Array.new dispatches to user Memory.alloc when supplied", () => {
    const program = `
function Memory.alloc 0
push constant 4660
return

function Main.main 0
push constant 7
call Array.new 1
return
`;
    const { instructions } = unwrap(validOf(VM.parse(program)));
    const vm = unwrap(Vm.build(instructions));

    const arrayNew = vm.functionMap["Array.new"];
    expect(arrayNew).toBeDefined();
    expect(
      arrayNew.operations.some(
        (op) => op.op === "call" && op.name === "Memory.alloc",
      ),
    ).toBe(true);
  });

  test("Array.dispose dispatches to user Memory.deAlloc when supplied", () => {
    const program = `
function Memory.deAlloc 0
push constant 0
return

function Main.main 0
push constant 0
return
`;
    const { instructions } = unwrap(validOf(VM.parse(program)));
    const vm = unwrap(Vm.build(instructions));

    const arrayDispose = vm.functionMap["Array.dispose"];
    expect(arrayDispose).toBeDefined();
    expect(
      arrayDispose.operations.some(
        (op) => op.op === "call" && op.name === "Memory.deAlloc",
      ),
    ).toBe(true);
  });

  test("bridge is not injected when user supplies their own Array.new", () => {
    const program = `
function Memory.alloc 0
push constant 4660
return

function Array.new 0
push constant 999
return

function Main.main 0
push constant 0
return
`;
    const { instructions } = unwrap(validOf(VM.parse(program)));
    const vm = unwrap(Vm.build(instructions));

    const arrayNew = vm.functionMap["Array.new"];
    expect(
      arrayNew.operations.some(
        (op) =>
          op.op === "push" && op.segment === "constant" && op.offset === 999,
      ),
    ).toBe(true);
  });

  test("bridge is not injected when user does not supply Memory.alloc", () => {
    const program = `
function Main.main 0
push constant 0
return
`;
    const { instructions } = unwrap(validOf(VM.parse(program)));
    const vm = unwrap(Vm.build(instructions));

    expect(vm.functionMap["Array.new"]).toBeUndefined();
    expect(vm.functionMap["Array.dispose"]).toBeUndefined();
  });
});

describe("Output.printString bridge to user String", () => {
  test("Output.printString dispatches to user String.charAt when supplied", () => {
    const program = `
function String.charAt 0
push constant 0
return

function String.length 0
push constant 0
return

function Main.main 0
push constant 0
return
`;
    const { instructions } = unwrap(validOf(VM.parse(program)));
    const vm = unwrap(Vm.build(instructions));

    const printString = vm.functionMap["Output.printString"];
    expect(printString).toBeDefined();
    expect(
      printString.operations.some(
        (op) => op.op === "call" && op.name === "String.charAt",
      ),
    ).toBe(true);
    expect(
      printString.operations.some(
        (op) => op.op === "call" && op.name === "String.length",
      ),
    ).toBe(true);
  });

  test("bridge is not injected when user supplies their own Output.printString", () => {
    const program = `
function String.charAt 0
push constant 0
return

function Output.printString 0
push constant 999
return

function Main.main 0
push constant 0
return
`;
    const { instructions } = unwrap(validOf(VM.parse(program)));
    const vm = unwrap(Vm.build(instructions));

    const printString = vm.functionMap["Output.printString"];
    expect(
      printString.operations.some(
        (op) =>
          op.op === "push" && op.segment === "constant" && op.offset === 999,
      ),
    ).toBe(true);
  });

  test("bridge is not injected when user does not supply String.charAt", () => {
    const program = `
function Main.main 0
push constant 0
return
`;
    const { instructions } = unwrap(validOf(VM.parse(program)));
    const vm = unwrap(Vm.build(instructions));

    expect(vm.functionMap["Output.printString"]).toBeUndefined();
  });
});

const lines = (...l: string[]) => l.join("\n");

describe("loadVm", () => {
  const MAIN = "function Main.main 0\npush constant 7\nreturn\n";
  const failure = (files: VmFile[], options?: Parameters<typeof loadVm>[1]) => {
    const loaded = loadVm(files, options);
    if (!isErr(loaded)) throw new Error("expected Err result");
    return Err(loaded);
  };

  test("loads valid files to a Vm", () => {
    const loaded = loadVm([{ name: "Main.vm", content: MAIN }]);

    expect(isErr(loaded)).toBe(false);
    expect(unwrap(loaded).functionMap["Main.main"]).toBeDefined();
  });

  test("loads no files to one diagnostic under the input key", () => {
    const errors = failure([]);

    expect(Object.keys(errors)).toEqual([VM_INPUT]);
  });

  test("reports every semantic diagnostic of a file, not the first", () => {
    const errors = failure([
      {
        name: "Main.vm",
        content: lines(
          "function Main.main 0",
          "push pointer 5",
          "goto NOWHERE",
          "call Main.f 0",
          "label A",
          "label A",
          "return",
        ),
      },
    ]);

    expect(errors["Main.vm"].map(({ span }) => span?.line)).toEqual([
      2, 3, 4, 6,
    ]);
    expect(errors["Main.vm"].map(({ stage }) => stage)).toEqual([
      "semantic",
      "semantic",
      "semantic",
      "semantic",
    ]);
  });

  describe("file names", () => {
    const SINGLE = "function Foo.bar 0\npush constant 1\nreturn\n";

    test("accepts a valid function in a buffer of another name with the check off", () => {
      const loaded = loadVm([{ name: VM_INPUT, content: SINGLE }], {
        validateFileNames: false,
      });

      expect(isErr(loaded)).toBe(false);
    });

    test("rejects the same buffer with the check on, which is the default", () => {
      const byDefault = failure([{ name: "Other.vm", content: SINGLE }]);
      const explicit = failure([{ name: "Other.vm", content: SINGLE }], {
        validateFileNames: true,
      });

      expect(byDefault["Other.vm"][0].message).toMatch(
        /File name Other\.vm doesn't match class name Foo/,
      );
      expect(explicit).toEqual(byDefault);
    });

    test("rejects a malformed function name even with the check off", () => {
      const errors = failure(
        [{ name: VM_INPUT, content: "function bar 0\nreturn\n" }],
        { validateFileNames: false },
      );

      expect(errors[VM_INPUT]).toHaveLength(1);
      expect(errors[VM_INPUT][0].message).toMatch(
        /Illegal subroutine name bar/,
      );
      expect(errors[VM_INPUT][0].span?.line).toBe(1);
    });

    test("the raw build still accepts a name of any shape", () => {
      const { instructions } = unwrap(
        validOf(VM.parse("function bar 0\npush constant 1\nreturn\n")),
      );

      expect(isErr(Vm.build(instructions))).toBe(false);
    });

    test("reports a repeated file name under that name", () => {
      const errors = failure([
        { name: "Main.vm", content: MAIN },
        { name: "Main.vm", content: MAIN },
      ]);

      expect(errors["Main.vm"].map(({ message }) => message)).toContain(
        "File Main.vm already exists",
      );
    });
  });

  describe("two files", () => {
    // Each file's error is the goto, at the same local line and offsets. The
    // first function lines have equal length.
    const A = "function Sys.init  0\ngoto NOWHERE\nreturn\n"; // 41 long
    const B = "function Main.main 0\ngoto NOWHERE\nreturn";
    const LOCAL = { start: 21, end: 33, line: 2 };

    test("attributes equal local spans to each own file", () => {
      const errors = failure([
        { name: "Sys.vm", content: A },
        { name: "Main.vm", content: B },
      ]);

      expect(Object.keys(errors)).toEqual(["Sys.vm", "Main.vm"]);
      expect(errors["Sys.vm"]).toHaveLength(1);
      expect(errors["Main.vm"]).toHaveLength(1);
      expect(errors["Sys.vm"][0].span).toEqual(LOCAL);
      expect(errors["Main.vm"][0].span).toEqual(LOCAL);
    });

    test("maps both span ends and the line to the joined buffer", () => {
      const files = [
        { name: "Sys.vm", content: A }, // ends with a newline
        { name: "Main.vm", content: B }, // does not
      ];
      const errors = failure(files);

      const inSys = joinedDiagnostics(files, { "Sys.vm": errors["Sys.vm"] });
      const inMain = joinedDiagnostics(files, { "Main.vm": errors["Main.vm"] });

      // Sys starts the buffer: its base is zero.
      expect(inSys[0].span).toEqual(LOCAL);
      // Main follows Sys's 41 characters and the separator, so starts at 42.
      // Sys has 3 newlines, so Main starts 4 lines on: a trailing newline and
      // the separator make one blank line.
      expect(inMain[0].span).toEqual({ start: 63, end: 75, line: 6 });
      expect(inMain[0].message).toBe("Line 6: Undeclared label NOWHERE");
    });

    test("counts the separator after a file with or without a trailing newline", () => {
      const withNewline = { name: "A.vm", content: "return\n" };
      const without = { name: "B.vm", content: "return" };
      const bad = { name: "C.vm", content: "goto X" };
      const diagnostic = {
        message: "Line 1: x",
        span: { start: 0, end: 6, line: 1 },
      };

      const placed = (files: VmFile[]) =>
        joinedDiagnostics(files, { "C.vm": [diagnostic] })[0].span;

      // "return\n" + "\n" + "goto X": a blank line between.
      expect(placed([withNewline, bad])).toEqual({
        start: 8,
        end: 14,
        line: 3,
      });
      // "return" + "\n" + "goto X": none.
      expect(placed([without, bad])).toEqual({ start: 7, end: 13, line: 2 });
    });

    test("leaves the file-local diagnostics unchanged", () => {
      const files = [
        { name: "Sys.vm", content: A },
        { name: "Main.vm", content: B },
      ];
      const errors = failure(files);
      const before = JSON.stringify(errors);

      joinedDiagnostics(files, errors);

      expect(JSON.stringify(errors)).toBe(before);
    });

    test("keeps a spanless diagnostic spanless", () => {
      const files = [{ name: "Sys.vm", content: A }];

      const listed = joinedDiagnostics(files, {
        [VM_INPUT]: [{ message: "No entry" }],
      });

      expect(listed).toEqual([{ message: "No entry" }]);
    });

    test("moves the instructions of a loaded Vm into the joined buffer", () => {
      const vm = unwrap(
        loadVm([
          { name: "Sys.vm", content: "function Sys.init 0\nreturn\n" },
          { name: "B.vm", content: "function B.g 0\nreturn" },
        ]),
      );

      const lines = vm.functions
        .flatMap(({ operations }) => operations.map(({ span }) => span?.line))
        .filter((line) => line !== undefined)
        .sort();

      // Sys has two newlines, so B starts on line 4 (3 is blank).
      expect(lines).toEqual([1, 2, 4, 5]);
    });

    test("merges a file's list in source order before it is mapped", () => {
      const errors = failure([
        { name: "A.vm", content: "function bad 0\npush nowhere 1\n" },
      ]);

      // The syntax diagnostic is listed first by the parse, but follows by position.
      expect(errors["A.vm"].map(({ span }) => span?.line)).toEqual([1, 2]);
      expect(errors["A.vm"].map(({ stage }) => stage)).toEqual([
        "semantic",
        "parse",
      ]);
    });
  });

  describe("recovery", () => {
    const TWO_MISTAKES = lines(
      "function Main.main 0",
      "push nowhere 1",
      "label A",
      "label A",
      "return",
    );

    test("lists the syntax and the semantic diagnostic when omitted", () => {
      const errors = failure([{ name: "Main.vm", content: TWO_MISTAKES }]);

      expect(errors["Main.vm"].map(({ stage }) => stage)).toEqual([
        "parse",
        "semantic",
      ]);
    });

    test("equals the explicit true", () => {
      const files = [{ name: "Main.vm", content: TWO_MISTAKES }];

      expect(failure(files, { attemptRecovery: true })).toEqual(failure(files));
    });

    test("gives only the first syntax diagnostic when off", () => {
      const errors = failure([{ name: "Main.vm", content: TWO_MISTAKES }], {
        attemptRecovery: false,
      });

      expect(errors["Main.vm"]).toHaveLength(1);
      expect(errors["Main.vm"][0].span?.line).toBe(2);
      expect(errors["Main.vm"][0].stage).toMatch(/lex|parse/);
    });

    test("checks the other file when one file has a syntax error", () => {
      const errors = failure(
        [
          { name: "A.vm", content: "push nowhere 1\n" },
          { name: "B.vm", content: "function B.f 0\ngoto X\nreturn\n" },
        ],
        { attemptRecovery: false },
      );

      expect(Object.keys(errors)).toEqual(["A.vm", "B.vm"]);
      expect(errors["B.vm"][0].message).toMatch(/Undeclared label X/);
    });

    test("does not report an undeclared label a skipped line could declare", () => {
      const errors = failure([
        {
          name: "Main.vm",
          content: lines(
            "function Main.main 0",
            "goto END",
            "lable END",
            "return",
          ),
        },
      ]);

      expect(errors["Main.vm"].map(({ stage }) => stage)).toEqual(["parse"]);
    });

    test("still reports an undeclared label of another function", () => {
      const errors = failure([
        {
          name: "Main.vm",
          content: lines(
            "function Main.main 0",
            "lable END",
            "return",
            "function Main.other 0",
            "goto END",
            "return",
          ),
        },
      ]);

      expect(errors["Main.vm"].map(({ message }) => message)).toEqual([
        expect.stringMatching(/^Line 2: /),
        "Line 5: Undeclared label END",
      ]);
    });

    test("does not report an undefined function a skipped line could declare", () => {
      const errors = failure([
        {
          name: "Main.vm",
          content: lines(
            "function Main.main 0",
            "call Main.f 0",
            "fucntion Main.f 0",
            "return",
          ),
        },
      ]);

      expect(errors["Main.vm"].map(({ stage }) => stage)).toEqual(["parse"]);
    });

    test("reports an undefined function when nothing was skipped", () => {
      const errors = failure([
        {
          name: "Main.vm",
          content: lines("function Main.main 0", "call Main.f 0", "return"),
        },
      ]);

      expect(errors["Main.vm"][0].message).toMatch(/Undefined function Main.f/);
    });

    test("reports an entry point missing when nothing was skipped, not otherwise", () => {
      const two = lines("function A.f 0", "return", "function A.g 0", "return");

      const whole = failure([{ name: "A.vm", content: two }]);
      const damaged = failure([
        { name: "A.vm", content: `${two}\npush nowhere 1\n` },
      ]);

      expect(whole[VM_INPUT]).toHaveLength(1);
      expect(whole[VM_INPUT][0].message).toMatch(/entry point/);
      expect(damaged["A.vm"].map(({ stage }) => stage)).toEqual(["parse"]);
      expect(damaged[VM_INPUT]).toBeUndefined();
    });
  });
});

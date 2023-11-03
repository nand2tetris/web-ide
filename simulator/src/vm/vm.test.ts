import { unwrap } from "@davidsouther/jiffies/lib/esm/result.js";
import { VM } from "../languages/vm.js";
import { Vm } from "./vm.js";

test("Simple Adder VM", () => {
  const vm = Vm.build([
    { op: "push", segment: "constant", offset: 7 },
    { op: "push", segment: "constant", offset: 8 },
    { op: "add" },
  ]);

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
  const { instructions } = unwrap(VM.parse(BIT_TEST));
  const vm = Vm.build(instructions);

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
  const { instructions } = unwrap(VM.parse(STACK_TEST));
  const vm = Vm.build(instructions);

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
  const { instructions } = unwrap(VM.parse(BASIC_TEST));
  const vm = Vm.build(instructions);

  vm.write([
    [0, 256],
    [1, 300],
    [2, 400],
    [3, 3000],
    [4, 3010],
  ]);

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
  const { instructions } = unwrap(VM.parse(POINTER_TEST));
  const vm = Vm.build(instructions);

  vm.write([
    [0, 256],
    [1, 300],
    [2, 400],
    [3, 3000],
    [4, 3010],
  ]);

  for (let i = 0; i < 16; i++) {
    vm.step();
  }

  const test = vm.read([256, 3, 4, 3032, 3046]);
  expect(test).toEqual([6084, 3030, 3040, 32, 46]);
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
  const { instructions } = unwrap(VM.parse(LOOP_TEST));
  const vm = Vm.build(instructions);

  vm.write([
    [0, 256],
    [1, 300],
    [2, 400],
    [400, 3],
  ]);

  for (let i = 0; i < 26; i++) {
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
  const { instructions } = unwrap(VM.parse(FIBONACCI_SERIES));
  const vm = Vm.build(instructions);

  vm.write([
    [0, 256],
    [1, 300],
    [2, 400],
    [400, 6],
    [401, 3000],
  ]);

  for (let i = 0; i < 1000; i++) {
    vm.step();
  }

  const test = vm.read([3000, 3001, 3002, 3003, 3004, 3005]);
  expect(test).toEqual([0, 1, 1, 2, 3, 5]);
});

const SIMPLE_FUNCTION = `
// __implicit
  push constant 3
  push constant 4
  call mult 2

// returns x * y as sum i = 0 to y x
// x = arg 0
// y = arg 1
// sum = local 0
// i = local 1
function mult 2
label WHILE_LOOP
  push local 1
  push argument 1
  lt
  not
  if-goto WHILE_END
  push local 0
  push argument 0
  add
  pop local 0
  push local 1
  push constant 1
  add
  pop local 1
  goto WHILE_LOOP
label WHILE_END
  push local 0
  return
`;

test("08 / Simple Function / Simple Function", () => {
  const { instructions } = unwrap(VM.parse(SIMPLE_FUNCTION));
  const vm = Vm.build(instructions);

  vm.write([]);

  for (let i = 0; i < 100; i++) {
    vm.step();
  }

  const test = vm.read([0, 256]);
  expect(test).toEqual([257, 12]);
});

const NESTED_FUNCTION = `
// Sys.vm for NestedCall test.

// Sys.init()
//
// Calls Sys.main() and stores return value in temp 1.
// Does not return.  (Enters infinite loop.)

function Sys.init 0
push constant 4000	// test THIS and THAT context save
pop pointer 0
push constant 5000
pop pointer 1
call Sys.main 0
pop temp 1
label LOOP
goto LOOP

// Sys.main()
//
// Sets locals 1, 2 and 3, leaving locals 0 and 4 unchanged to test
// default local initialization to 0.  (RAM set to -1 by test setup.)
// Calls Sys.add12(123) and stores return value (135) in temp 0.
// Returns local 0 + local 1 + local 2 + local 3 + local 4 (456) to confirm
// that locals were not mangled by function call.

function Sys.main 5
push constant 4001
pop pointer 0
push constant 5001
pop pointer 1
push constant 200
pop local 1
push constant 40
pop local 2
push constant 6
pop local 3
push constant 123
call Sys.add12 1
pop temp 0
push local 0
push local 1
push local 2
push local 3
push local 4
add
add
add
add
return

// Sys.add12(int n)
//
// Returns n+12.

function Sys.add12 0
push constant 4002
pop pointer 0
push constant 5002
pop pointer 1
push argument 0
push constant 12
add
return
`;

test("08 / Functions / Nested Function", () => {
  const { instructions } = unwrap(VM.parse(NESTED_FUNCTION));
  const vm = Vm.build(instructions);

  const init: [number, number][] = [
    [3, -3],
    [4, -4],
    [5, -1],
    [6, -1],
    [257, -1],
    [258, -2],
    [259, -3],
    [260, -4],
  ];

  for (let i = 261; i < 300; i++) {
    init.push([i, -1]);
  }

  vm.write(init);

  for (let i = 0; i < 1000; i++) {
    vm.step();
  }

  const test = vm.read([0, 1, 2, 3, 4, 5, 6]);
  expect(test).toEqual([261, 261, 256, 4000, 5000, 135, 246]);
});

const FIB_MAIN = `
function Main.fibonacci 0
push argument 0
push constant 2
lt                     // checks if n<2
if-goto IF_TRUE
goto IF_FALSE
label IF_TRUE          // if n<2, return n
push argument 0        
return
label IF_FALSE         // if n>=2, returns fib(n-2)+fib(n-1)
push argument 0
push constant 2
sub
call Main.fibonacci 1  // computes fib(n-2)
push argument 0
push constant 1
sub
call Main.fibonacci 1  // computes fib(n-1)
add                    // returns fib(n-1) + fib(n-2)
return
`;

const FIB_SYS = `
function Sys.init 0
push constant 4
call Main.fibonacci 1   // computes the 4'th fibonacci element
label WHILE
goto WHILE              // loops infinitely
`;

test("08 / Functions / Fib", () => {
  const { instructions } = unwrap(VM.parse(FIB_MAIN + FIB_SYS));
  const vm = Vm.build(instructions);

  vm.write([]);

  for (let i = 0; i < 1000; i++) {
    vm.step();
  }

  const test = vm.read([0, 261]);
  expect(test).toEqual([262, 3]);
});

const STATIC_CLASS_1 = `function Class1.set 0
push argument 0
pop static 0
push argument 1
pop static 1
push constant 0
return

// Returns static[0] - static[1].
function Class1.get 0
push static 0
push static 1
sub
return
`;
const STATIC_CLASS_2 = `function Class2.set 0
push argument 0
pop static 0
push argument 1
pop static 1
push constant 0
return

// Returns static[0] - static[1].
function Class2.get 0
push static 0
push static 1
sub
return
`;

const STATIC_SYS = `function Sys.init 0
push constant 6
push constant 8
call Class1.set 2
pop temp 0 // Dumps the return value
push constant 23
push constant 15
call Class2.set 2
pop temp 0 // Dumps the return value
call Class1.get 0
call Class2.get 0
label WHILE
goto WHILE
`;

test("08 / Functions / Static", () => {
  const { instructions } = unwrap(
    VM.parse([STATIC_CLASS_1, STATIC_CLASS_2, STATIC_SYS].join("\n"))
  );
  const vm = Vm.build(instructions);

  vm.write([]);

  for (let i = 0; i < 1000; i++) {
    vm.step();
  }

  const test = vm.read([0, 261, 262]);
  expect(test).toEqual([263, -2, 8]);
});

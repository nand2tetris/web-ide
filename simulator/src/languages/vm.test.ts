import { grammar, VM, Vm } from "./vm.js";

const SIMPLE_ADD = `
push constant 7
push constant 8
add`;

const SIMPLE_ADD_PARSED = {
  instructions: [
    { op: "push", segment: "constant", value: 7 },
    { op: "push", segment: "constant", value: 8 },
    { op: "add" },
  ],
} satisfies Vm;

// d = (2 - x) + (y + 9)
const FIG7_3A = `
push constant 2
push local 0
sub
push local 1
push constant 9
add
add
pop local 2
`;

const FIG7_3A_PARSED = {
  instructions: [
    { op: "push", segment: "constant", value: 2 },
    { op: "push", segment: "local", value: 0 },
    { op: "sub" },
    { op: "push", segment: "local", value: 1 },
    { op: "push", segment: "constant", value: 9 },
    { op: "add" },
    { op: "add" },
    { op: "pop", segment: "local", value: 2 },
  ],
} satisfies Vm;

// (x < 7) or (y == 8)
const FIG7_3B = `
push local 0
push constant 7
lt
push local 1
push constant 8
eq
or
`;
const FIG7_3B_PARSED = {
  instructions: [
    { op: "push", segment: "local", value: 0 },
    { op: "push", segment: "constant", value: 7 },
    { op: "lt" },
    { op: "push", segment: "local", value: 1 },
    { op: "push", segment: "constant", value: 8 },
    { op: "eq" },
    { op: "or" },
  ],
} satisfies Vm;

const FIG8_1 = `
// returns x * y
// x = arg 0
// y = arg 1
// sum = local 0
// i = local 1
function mult 2
  push constant 0
  pop local 0
  push constant 0
  pop local 1
label WHILE_LOOP
  push local 1
  push argument 1
  lt
  neg
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
const FIG8_1_PARSED = {
  instructions: [
    { op: "function", name: "mult", nArgs: 2 },
    { op: "push", segment: "constant", value: 0 },
    { op: "pop", segment: "local", value: 0 },
    { op: "push", segment: "constant", value: 0 },
    { op: "pop", segment: "local", value: 1 },
    { op: "label", label: "WHILE_LOOP" },
    { op: "push", segment: "local", value: 1 },
    { op: "push", segment: "argument", value: 1 },
    { op: "lt" },
    { op: "neg" },
    { op: "if-goto", label: "WHILE_END" },
    { op: "push", segment: "local", value: 0 },
    { op: "push", segment: "argument", value: 0 },
    { op: "add" },
    { op: "pop", segment: "local", value: 0 },
    { op: "push", segment: "local", value: 1 },
    { op: "push", segment: "constant", value: 1 },
    { op: "add" },
    { op: "pop", segment: "local", value: 1 },
    { op: "goto", label: "WHILE_LOOP" },
    { op: "label", label: "WHILE_END" },
    { op: "push", segment: "local", value: 0 },
    { op: "return" },
  ],
} satisfies Vm;

const FIG8_2 = `
function main 0
  push constant 3
  push constant 4
  call hypot 2
  return

function hypot 2
  push argument 0
  push argument 0
  call mult 2
  push argument 1
  push argument 1
  call mult 2
  add
  call sqrt 1
  return
`;
const FIG8_2_PARSED = {
  instructions: [
    { op: "function", name: "main", nArgs: 0 },
    { op: "push", segment: "constant", value: 3 },
    { op: "push", segment: "constant", value: 4 },
    { op: "call", name: "hypot", nArgs: 2 },
    { op: "return" },
    { op: "function", name: "hypot", nArgs: 2 },
    { op: "push", segment: "argument", value: 0 },
    { op: "push", segment: "argument", value: 0 },
    { op: "call", name: "mult", nArgs: 2 },
    { op: "push", segment: "argument", value: 1 },
    { op: "push", segment: "argument", value: 1 },
    { op: "call", name: "mult", nArgs: 2 },
    { op: "add" },
    { op: "call", name: "sqrt", nArgs: 1 },
    { op: "return" },
  ],
} satisfies Vm;

const FIG8_4 = `
function main 0
push constant 3
call factorial 1
return
function factorial 1
push argument 0
push constant 1
eq
if-goto BASE_CASE
push argument 0
push argument 0
push constant 1
sub
call factorial 1
call mult 2
return
label BASE_CASE
push constant 1
return
`;
const FIG8_4_PARSED = {
  instructions: [
    { op: "function", name: "main", nArgs: 0 },
    { op: "push", segment: "constant", value: 3 },
    { op: "call", name: "factorial", nArgs: 1 },
    { op: "return" },
    { op: "function", name: "factorial", nArgs: 1 },
    { op: "push", segment: "argument", value: 0 },
    { op: "push", segment: "constant", value: 1 },
    { op: "eq" },
    { op: "if-goto", label: "BASE_CASE" },
    { op: "push", segment: "argument", value: 0 },
    { op: "push", segment: "argument", value: 0 },
    { op: "push", segment: "constant", value: 1 },
    { op: "sub" },
    { op: "call", name: "factorial", nArgs: 1 },
    { op: "call", name: "mult", nArgs: 2 },
    { op: "return" },
    { op: "label", label: "BASE_CASE" },
    { op: "push", segment: "constant", value: 1 },
    { op: "return" },
  ],
} satisfies Vm;

test.each([
  ["Simple Add", SIMPLE_ADD, SIMPLE_ADD_PARSED],
  ["Figure 7.3a", FIG7_3A, FIG7_3A_PARSED],
  ["Figure 7.3b", FIG7_3B, FIG7_3B_PARSED],
  ["Figure 8.1", FIG8_1, FIG8_1_PARSED],
  ["Figure 8.2", FIG8_2, FIG8_2_PARSED],
  ["Figure 8.4", FIG8_4, FIG8_4_PARSED],
])("VM Parser: %s", (_name, fig, parsed) => {
  const match = grammar.match(fig);
  expect(match).toHaveSucceeded();
  expect(VM.semantics(match).vm).toStrictEqual(parsed);
});

test.each([
  ["call mult", 'Line 1, col 10: expected "%B", ".", a digit, or "%X"'],
  [
    "push invalid",
    'Line 1, col 6: expected "temp", "pointer", "that", "this", "constant", "static", "local", or "argument"',
  ],
])("VM Parser Error: '%s'", (bad, message) => {
  const match = grammar.match(bad);
  expect(match).toHaveFailed(message);
});

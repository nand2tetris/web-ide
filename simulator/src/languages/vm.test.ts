import { grammar, VM, Vm } from "./vm.js";

const SIMPLE_ADD = `
push constant 7
push constant 8
add`;

const SIMPLE_ADD_PARSED = {
  instructions: [
    { op: "push", segment: "constant", offset: 7, line: 2 },
    { op: "push", segment: "constant", offset: 8, line: 3 },
    { op: "add", line: 4 },
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
    { op: "push", segment: "constant", offset: 2, line: 2 },
    { op: "push", segment: "local", offset: 0, line: 3 },
    { op: "sub", line: 4 },
    { op: "push", segment: "local", offset: 1, line: 5 },
    { op: "push", segment: "constant", offset: 9, line: 6 },
    { op: "add", line: 7 },
    { op: "add", line: 8 },
    { op: "pop", segment: "local", offset: 2, line: 9 },
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
    { op: "push", segment: "local", offset: 0, line: 2 },
    { op: "push", segment: "constant", offset: 7, line: 3 },
    { op: "lt", line: 4 },
    { op: "push", segment: "local", offset: 1, line: 5 },
    { op: "push", segment: "constant", offset: 8, line: 6 },
    { op: "eq", line: 7 },
    { op: "or", line: 8 },
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
    { op: "function", name: "mult", nVars: 2, line: 7 },
    { op: "push", segment: "constant", offset: 0, line: 8 },
    { op: "pop", segment: "local", offset: 0, line: 9 },
    { op: "push", segment: "constant", offset: 0, line: 10 },
    { op: "pop", segment: "local", offset: 1, line: 11 },
    { op: "label", label: "WHILE_LOOP", line: 12 },
    { op: "push", segment: "local", offset: 1, line: 13 },
    { op: "push", segment: "argument", offset: 1, line: 14 },
    { op: "lt", line: 15 },
    { op: "neg", line: 16 },
    { op: "if-goto", label: "WHILE_END", line: 17 },
    { op: "push", segment: "local", offset: 0, line: 18 },
    { op: "push", segment: "argument", offset: 0, line: 19 },
    { op: "add", line: 20 },
    { op: "pop", segment: "local", offset: 0, line: 21 },
    { op: "push", segment: "local", offset: 1, line: 22 },
    { op: "push", segment: "constant", offset: 1, line: 23 },
    { op: "add", line: 24 },
    { op: "pop", segment: "local", offset: 1, line: 25 },
    { op: "goto", label: "WHILE_LOOP", line: 26 },
    { op: "label", label: "WHILE_END", line: 27 },
    { op: "push", segment: "local", offset: 0, line: 28 },
    { op: "return", line: 29 },
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
    { op: "function", name: "main", nVars: 0, line: 2 },
    { op: "push", segment: "constant", offset: 3, line: 3 },
    { op: "push", segment: "constant", offset: 4, line: 4 },
    { op: "call", name: "hypot", nArgs: 2, line: 5 },
    { op: "return", line: 6 },
    { op: "function", name: "hypot", nVars: 2, line: 8 },
    { op: "push", segment: "argument", offset: 0, line: 9 },
    { op: "push", segment: "argument", offset: 0, line: 10 },
    { op: "call", name: "mult", nArgs: 2, line: 11 },
    { op: "push", segment: "argument", offset: 1, line: 12 },
    { op: "push", segment: "argument", offset: 1, line: 13 },
    { op: "call", name: "mult", nArgs: 2, line: 14 },
    { op: "add", line: 15 },
    { op: "call", name: "sqrt", nArgs: 1, line: 16 },
    { op: "return", line: 17 },
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
    { op: "function", name: "main", nVars: 0, line: 2 },
    { op: "push", segment: "constant", offset: 3, line: 3 },
    { op: "call", name: "factorial", nArgs: 1, line: 4 },
    { op: "return", line: 5 },
    { op: "function", name: "factorial", nVars: 1, line: 6 },
    { op: "push", segment: "argument", offset: 0, line: 7 },
    { op: "push", segment: "constant", offset: 1, line: 8 },
    { op: "eq", line: 9 },
    { op: "if-goto", label: "BASE_CASE", line: 10 },
    { op: "push", segment: "argument", offset: 0, line: 11 },
    { op: "push", segment: "argument", offset: 0, line: 12 },
    { op: "push", segment: "constant", offset: 1, line: 13 },
    { op: "sub", line: 14 },
    { op: "call", name: "factorial", nArgs: 1, line: 15 },
    { op: "call", name: "mult", nArgs: 2, line: 16 },
    { op: "return", line: 17 },
    { op: "label", label: "BASE_CASE", line: 18 },
    { op: "push", segment: "constant", offset: 1, line: 19 },
    { op: "return", line: 20 },
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

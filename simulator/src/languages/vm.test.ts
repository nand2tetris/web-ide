import { grammar, VM, Vm } from "./vm.js";

const SIMPLE_ADD = `
push constant 7
push constant 8
add`;

const SIMPLE_ADD_PARSED = {
  instructions: [
    {
      op: "push",
      segment: "constant",
      offset: 7,
      span: { start: 1, end: 16, line: 2 },
    },
    {
      op: "push",
      segment: "constant",
      offset: 8,
      span: { start: 17, end: 32, line: 3 },
    },
    { op: "add", span: { start: 33, end: 36, line: 4 } },
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
    {
      op: "push",
      segment: "constant",
      offset: 2,
      span: { start: 1, end: 16, line: 2 },
    },
    {
      op: "push",
      segment: "local",
      offset: 0,
      span: { start: 17, end: 29, line: 3 },
    },
    { op: "sub", span: { start: 30, end: 33, line: 4 } },
    {
      op: "push",
      segment: "local",
      offset: 1,
      span: { start: 34, end: 46, line: 5 },
    },
    {
      op: "push",
      segment: "constant",
      offset: 9,
      span: { start: 47, end: 62, line: 6 },
    },
    { op: "add", span: { start: 63, end: 66, line: 7 } },
    { op: "add", span: { start: 67, end: 70, line: 8 } },
    {
      op: "pop",
      segment: "local",
      offset: 2,
      span: { start: 71, end: 82, line: 9 },
    },
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
    {
      op: "push",
      segment: "local",
      offset: 0,
      span: { start: 1, end: 13, line: 2 },
    },
    {
      op: "push",
      segment: "constant",
      offset: 7,
      span: { start: 14, end: 29, line: 3 },
    },
    { op: "lt", span: { start: 30, end: 32, line: 4 } },
    {
      op: "push",
      segment: "local",
      offset: 1,
      span: { start: 33, end: 45, line: 5 },
    },
    {
      op: "push",
      segment: "constant",
      offset: 8,
      span: { start: 46, end: 61, line: 6 },
    },
    { op: "eq", span: { start: 62, end: 64, line: 7 } },
    { op: "or", span: { start: 65, end: 67, line: 8 } },
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
    {
      op: "function",
      name: "mult",
      nVars: 2,
      span: { start: 76, end: 91, line: 7 },
    },
    {
      op: "push",
      segment: "constant",
      offset: 0,
      span: { start: 94, end: 109, line: 8 },
    },
    {
      op: "pop",
      segment: "local",
      offset: 0,
      span: { start: 112, end: 123, line: 9 },
    },
    {
      op: "push",
      segment: "constant",
      offset: 0,
      span: { start: 126, end: 141, line: 10 },
    },
    {
      op: "pop",
      segment: "local",
      offset: 1,
      span: { start: 144, end: 155, line: 11 },
    },
    {
      op: "label",
      label: "WHILE_LOOP",
      span: { start: 156, end: 172, line: 12 },
    },
    {
      op: "push",
      segment: "local",
      offset: 1,
      span: { start: 175, end: 187, line: 13 },
    },
    {
      op: "push",
      segment: "argument",
      offset: 1,
      span: { start: 190, end: 205, line: 14 },
    },
    { op: "lt", span: { start: 208, end: 210, line: 15 } },
    { op: "neg", span: { start: 213, end: 216, line: 16 } },
    {
      op: "if-goto",
      label: "WHILE_END",
      span: { start: 219, end: 236, line: 17 },
    },
    {
      op: "push",
      segment: "local",
      offset: 0,
      span: { start: 239, end: 251, line: 18 },
    },
    {
      op: "push",
      segment: "argument",
      offset: 0,
      span: { start: 254, end: 269, line: 19 },
    },
    { op: "add", span: { start: 272, end: 275, line: 20 } },
    {
      op: "pop",
      segment: "local",
      offset: 0,
      span: { start: 278, end: 289, line: 21 },
    },
    {
      op: "push",
      segment: "local",
      offset: 1,
      span: { start: 292, end: 304, line: 22 },
    },
    {
      op: "push",
      segment: "constant",
      offset: 1,
      span: { start: 307, end: 322, line: 23 },
    },
    { op: "add", span: { start: 325, end: 328, line: 24 } },
    {
      op: "pop",
      segment: "local",
      offset: 1,
      span: { start: 331, end: 342, line: 25 },
    },
    {
      op: "goto",
      label: "WHILE_LOOP",
      span: { start: 345, end: 360, line: 26 },
    },
    {
      op: "label",
      label: "WHILE_END",
      span: { start: 361, end: 376, line: 27 },
    },
    {
      op: "push",
      segment: "local",
      offset: 0,
      span: { start: 379, end: 391, line: 28 },
    },
    { op: "return", span: { start: 394, end: 400, line: 29 } },
  ],
};

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
    {
      op: "function",
      name: "main",
      nVars: 0,
      span: { start: 1, end: 16, line: 2 },
    },
    {
      op: "push",
      segment: "constant",
      offset: 3,
      span: { start: 19, end: 34, line: 3 },
    },
    {
      op: "push",
      segment: "constant",
      offset: 4,
      span: { start: 37, end: 52, line: 4 },
    },
    {
      op: "call",
      name: "hypot",
      nArgs: 2,
      span: { start: 55, end: 67, line: 5 },
    },
    { op: "return", span: { start: 70, end: 76, line: 6 } },
    {
      op: "function",
      name: "hypot",
      nVars: 2,
      span: { start: 78, end: 94, line: 8 },
    },
    {
      op: "push",
      segment: "argument",
      offset: 0,
      span: { start: 97, end: 112, line: 9 },
    },
    {
      op: "push",
      segment: "argument",
      offset: 0,
      span: { start: 115, end: 130, line: 10 },
    },
    {
      op: "call",
      name: "mult",
      nArgs: 2,
      span: { start: 133, end: 144, line: 11 },
    },
    {
      op: "push",
      segment: "argument",
      offset: 1,
      span: { start: 147, end: 162, line: 12 },
    },
    {
      op: "push",
      segment: "argument",
      offset: 1,
      span: { start: 165, end: 180, line: 13 },
    },
    {
      op: "call",
      name: "mult",
      nArgs: 2,
      span: { start: 183, end: 194, line: 14 },
    },
    { op: "add", span: { start: 197, end: 200, line: 15 } },
    {
      op: "call",
      name: "sqrt",
      nArgs: 1,
      span: { start: 203, end: 214, line: 16 },
    },
    { op: "return", span: { start: 217, end: 223, line: 17 } },
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
    {
      op: "function",
      name: "main",
      nVars: 0,
      span: { start: 1, end: 16, line: 2 },
    },
    {
      op: "push",
      segment: "constant",
      offset: 3,
      span: { start: 17, end: 32, line: 3 },
    },
    {
      op: "call",
      name: "factorial",
      nArgs: 1,
      span: { start: 33, end: 49, line: 4 },
    },
    { op: "return", span: { start: 50, end: 56, line: 5 } },
    {
      op: "function",
      name: "factorial",
      nVars: 1,
      span: { start: 57, end: 77, line: 6 },
    },
    {
      op: "push",
      segment: "argument",
      offset: 0,
      span: { start: 78, end: 93, line: 7 },
    },
    {
      op: "push",
      segment: "constant",
      offset: 1,
      span: { start: 94, end: 109, line: 8 },
    },
    { op: "eq", span: { start: 110, end: 112, line: 9 } },
    {
      op: "if-goto",
      label: "BASE_CASE",
      span: { start: 113, end: 130, line: 10 },
    },
    {
      op: "push",
      segment: "argument",
      offset: 0,
      span: { start: 131, end: 146, line: 11 },
    },
    {
      op: "push",
      segment: "argument",
      offset: 0,
      span: { start: 147, end: 162, line: 12 },
    },
    {
      op: "push",
      segment: "constant",
      offset: 1,
      span: { start: 163, end: 178, line: 13 },
    },
    { op: "sub", span: { start: 179, end: 182, line: 14 } },
    {
      op: "call",
      name: "factorial",
      nArgs: 1,
      span: { start: 183, end: 199, line: 15 },
    },
    {
      op: "call",
      name: "mult",
      nArgs: 2,
      span: { start: 200, end: 211, line: 16 },
    },
    { op: "return", span: { start: 212, end: 218, line: 17 } },
    {
      op: "label",
      label: "BASE_CASE",
      span: { start: 219, end: 234, line: 18 },
    },
    {
      op: "push",
      segment: "constant",
      offset: 1,
      span: { start: 235, end: 250, line: 19 },
    },
    { op: "return", span: { start: 251, end: 257, line: 20 } },
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

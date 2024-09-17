export const jack = `// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/11/Average/Main.jack

// Inputs some numbers and computes their average
class Main {
   function void main() {
      var Array a; 
      var int length;
      var int i, sum;

      let length = Keyboard.readInt("How many numbers? ");
      let a = Array.new(length); // constructs the array
     
      let i = 0;
      while (i < length) {
         let a[i] = Keyboard.readInt("Enter a number: ");
         let sum = sum + a[i];
         let i = i + 1;
      }

      do Output.printString("The average is ");
      do Output.printInt(sum / length);
      return;
   }
}`;

export const parsed = {
  name: { value: "Main", span: { start: 234, end: 238, line: 7 } },
  varDecs: [],
  subroutines: [
    {
      type: "function",
      returnType: { value: "void", span: { start: 253, end: 258, line: 8 } },
      name: { value: "main", span: { start: 258, end: 262, line: 8 } },
      parameters: [],
      body: {
        varDecs: [
          {
            type: { value: "Array", span: { start: 277, end: 283, line: 9 } },
            names: ["a"],
          },
          {
            type: { value: "int", span: { start: 297, end: 301, line: 10 } },
            names: ["length"],
          },
          {
            type: { value: "int", span: { start: 319, end: 323, line: 11 } },
            names: ["i", "sum"],
          },
        ],
        statements: [
          {
            statementType: "letStatement",
            name: { value: "length", span: { start: 342, end: 348, line: 13 } },
            value: {
              nodeType: "expression",
              term: {
                termType: "subroutineCall",
                name: {
                  value: "Keyboard.readInt",
                  span: { start: 351, end: 367, line: 13 },
                },
                parameters: [
                  {
                    nodeType: "expression",
                    term: {
                      termType: "stringLiteral",
                      value: "How many numbers? ",
                    },
                    rest: [],
                  },
                ],
                span: { start: 351, end: 389, line: 13 },
              },
              rest: [],
            },
            span: { start: 338, end: 390, line: 13 },
          },
          {
            statementType: "letStatement",
            name: { value: "a", span: { start: 401, end: 402, line: 14 } },
            value: {
              nodeType: "expression",
              term: {
                termType: "subroutineCall",
                name: {
                  value: "Array.new",
                  span: { start: 405, end: 414, line: 14 },
                },
                parameters: [
                  {
                    nodeType: "expression",
                    term: {
                      termType: "variable",
                      name: "length",
                      span: { start: 415, end: 421, line: 14 },
                    },
                    rest: [],
                  },
                ],
                span: { start: 405, end: 422, line: 14 },
              },
              rest: [],
            },
            span: { start: 397, end: 423, line: 14 },
          },
          {
            statementType: "letStatement",
            name: { value: "i", span: { start: 464, end: 465, line: 16 } },
            value: {
              nodeType: "expression",
              term: { termType: "numericLiteral", value: 0 },
              rest: [],
            },
            span: { start: 460, end: 470, line: 16 },
          },
          {
            statementType: "whileStatement",
            condition: {
              nodeType: "expression",
              term: {
                termType: "variable",
                name: "i",
                span: { start: 484, end: 485, line: 17 },
              },
              rest: [
                {
                  op: "<",
                  term: {
                    termType: "variable",
                    name: "length",
                    span: { start: 488, end: 494, line: 17 },
                  },
                },
              ],
            },
            body: [
              {
                statementType: "letStatement",
                name: { value: "a", span: { start: 511, end: 512, line: 18 } },
                arrayIndex: {
                  nodeType: "expression",
                  term: {
                    termType: "variable",
                    name: "i",
                    span: { start: 513, end: 514, line: 18 },
                  },
                  rest: [],
                },
                value: {
                  nodeType: "expression",
                  term: {
                    termType: "subroutineCall",
                    name: {
                      value: "Keyboard.readInt",
                      span: { start: 518, end: 534, line: 18 },
                    },
                    parameters: [
                      {
                        nodeType: "expression",
                        term: {
                          termType: "stringLiteral",
                          value: "Enter a number: ",
                        },
                        rest: [],
                      },
                    ],
                    span: { start: 518, end: 554, line: 18 },
                  },
                  rest: [],
                },
                span: { start: 507, end: 555, line: 18 },
              },
              {
                statementType: "letStatement",
                name: {
                  value: "sum",
                  span: { start: 569, end: 572, line: 19 },
                },
                value: {
                  nodeType: "expression",
                  term: {
                    termType: "variable",
                    name: "sum",
                    span: { start: 575, end: 578, line: 19 },
                  },
                  rest: [
                    {
                      op: "+",
                      term: {
                        termType: "arrayAccess",
                        name: {
                          value: "a",
                          span: { start: 581, end: 582, line: 19 },
                        },
                        index: {
                          nodeType: "expression",
                          term: {
                            termType: "variable",
                            name: "i",
                            span: { start: 583, end: 584, line: 19 },
                          },
                          rest: [],
                        },
                        span: { start: 581, end: 585, line: 19 },
                      },
                    },
                  ],
                },
                span: { start: 565, end: 586, line: 19 },
              },
              {
                statementType: "letStatement",
                name: { value: "i", span: { start: 600, end: 601, line: 20 } },
                value: {
                  nodeType: "expression",
                  term: {
                    termType: "variable",
                    name: "i",
                    span: { start: 604, end: 605, line: 20 },
                  },
                  rest: [
                    { op: "+", term: { termType: "numericLiteral", value: 1 } },
                  ],
                },
                span: { start: 596, end: 610, line: 20 },
              },
            ],
          },
          {
            statementType: "doStatement",
            call: {
              termType: "subroutineCall",
              name: {
                value: "Output.printString",
                span: { start: 629, end: 647, line: 23 },
              },
              parameters: [
                {
                  nodeType: "expression",
                  term: { termType: "stringLiteral", value: "The average is " },
                  rest: [],
                },
              ],
              span: { start: 629, end: 666, line: 23 },
            },
          },
          {
            statementType: "doStatement",
            call: {
              termType: "subroutineCall",
              name: {
                value: "Output.printInt",
                span: { start: 677, end: 692, line: 24 },
              },
              parameters: [
                {
                  nodeType: "expression",
                  term: {
                    termType: "variable",
                    name: "sum",
                    span: { start: 693, end: 696, line: 24 },
                  },
                  rest: [
                    {
                      op: "/",
                      term: {
                        termType: "variable",
                        name: "length",
                        span: { start: 699, end: 705, line: 24 },
                      },
                    },
                  ],
                },
              ],
              span: { start: 677, end: 706, line: 24 },
            },
          },
          {
            statementType: "returnStatement",
            span: { start: 714, end: 721, line: 25 },
          },
        ],
      },
    },
  ],
};

export const compiled = `function Main.main 4
    push constant 18
    call String.new 1
    push constant 72
    call String.appendChar 2
    push constant 111
    call String.appendChar 2
    push constant 119
    call String.appendChar 2
    push constant 32
    call String.appendChar 2
    push constant 109
    call String.appendChar 2
    push constant 97
    call String.appendChar 2
    push constant 110
    call String.appendChar 2
    push constant 121
    call String.appendChar 2
    push constant 32
    call String.appendChar 2
    push constant 110
    call String.appendChar 2
    push constant 117
    call String.appendChar 2
    push constant 109
    call String.appendChar 2
    push constant 98
    call String.appendChar 2
    push constant 101
    call String.appendChar 2
    push constant 114
    call String.appendChar 2
    push constant 115
    call String.appendChar 2
    push constant 63
    call String.appendChar 2
    push constant 32
    call String.appendChar 2
    call Keyboard.readInt 1
    pop local 1
    push local 1
    call Array.new 1
    pop local 0
    push constant 0
    pop local 2
label Main_0
    push local 2
    push local 1
    lt
    not
    if-goto Main_1
    push local 2
    push local 0
    add
    push constant 16
    call String.new 1
    push constant 69
    call String.appendChar 2
    push constant 110
    call String.appendChar 2
    push constant 116
    call String.appendChar 2
    push constant 101
    call String.appendChar 2
    push constant 114
    call String.appendChar 2
    push constant 32
    call String.appendChar 2
    push constant 97
    call String.appendChar 2
    push constant 32
    call String.appendChar 2
    push constant 110
    call String.appendChar 2
    push constant 117
    call String.appendChar 2
    push constant 109
    call String.appendChar 2
    push constant 98
    call String.appendChar 2
    push constant 101
    call String.appendChar 2
    push constant 114
    call String.appendChar 2
    push constant 58
    call String.appendChar 2
    push constant 32
    call String.appendChar 2
    call Keyboard.readInt 1
    pop temp 0
    pop pointer 1
    push temp 0
    pop that 0
    push local 3
    push local 2
    push local 0
    add
    pop pointer 1
    push that 0
    add
    pop local 3
    push local 2
    push constant 1
    add
    pop local 2
    goto Main_0
label Main_1
    push constant 15
    call String.new 1
    push constant 84
    call String.appendChar 2
    push constant 104
    call String.appendChar 2
    push constant 101
    call String.appendChar 2
    push constant 32
    call String.appendChar 2
    push constant 97
    call String.appendChar 2
    push constant 118
    call String.appendChar 2
    push constant 101
    call String.appendChar 2
    push constant 114
    call String.appendChar 2
    push constant 97
    call String.appendChar 2
    push constant 103
    call String.appendChar 2
    push constant 101
    call String.appendChar 2
    push constant 32
    call String.appendChar 2
    push constant 105
    call String.appendChar 2
    push constant 115
    call String.appendChar 2
    push constant 32
    call String.appendChar 2
    call Output.printString 1
    pop temp 0
    push local 3
    push local 1
    call Math.divide 2
    call Output.printInt 1
    pop temp 0
    push constant 0
    return`;

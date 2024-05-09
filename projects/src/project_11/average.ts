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
  name: "Main",
  varDecs: [],
  subroutines: [
    {
      type: "function",
      returnType: "void",
      name: "main",
      parameters: [],
      body: {
        varDecs: [
          { type: "Array", names: ["a"] },
          { type: "int", names: ["length"] },
          { type: "int", names: ["i", "sum"] },
        ],
        statements: [
          {
            statementType: "letStatement",
            name: "length",
            value: {
              nodeType: "expression",
              term: {
                termType: "subroutineCall",
                name: "Keyboard.readInt",
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
              },
              rest: [],
            },
          },
          {
            statementType: "letStatement",
            name: "a",
            value: {
              nodeType: "expression",
              term: {
                termType: "subroutineCall",
                name: "Array.new",
                parameters: [
                  {
                    nodeType: "expression",
                    term: { termType: "variable", name: "length" },
                    rest: [],
                  },
                ],
              },
              rest: [],
            },
          },
          {
            statementType: "letStatement",
            name: "i",
            value: {
              nodeType: "expression",
              term: { termType: "numericLiteral", value: 0 },
              rest: [],
            },
          },
          {
            statementType: "whileStatement",
            condition: {
              nodeType: "expression",
              term: { termType: "variable", name: "i" },
              rest: [
                { op: "<", term: { termType: "variable", name: "length" } },
              ],
            },
            body: [
              {
                statementType: "letStatement",
                name: "a",
                arrayIndex: {
                  nodeType: "expression",
                  term: { termType: "variable", name: "i" },
                  rest: [],
                },
                value: {
                  nodeType: "expression",
                  term: {
                    termType: "subroutineCall",
                    name: "Keyboard.readInt",
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
                  },
                  rest: [],
                },
              },
              {
                statementType: "letStatement",
                name: "sum",
                value: {
                  nodeType: "expression",
                  term: { termType: "variable", name: "sum" },
                  rest: [
                    {
                      op: "+",
                      term: {
                        termType: "arrayAccess",
                        name: "a",
                        index: {
                          nodeType: "expression",
                          term: { termType: "variable", name: "i" },
                          rest: [],
                        },
                      },
                    },
                  ],
                },
              },
              {
                statementType: "letStatement",
                name: "i",
                value: {
                  nodeType: "expression",
                  term: { termType: "variable", name: "i" },
                  rest: [
                    {
                      op: "+",
                      term: { termType: "numericLiteral", value: 1 },
                    },
                  ],
                },
              },
            ],
          },
          {
            statementType: "doStatement",
            call: {
              termType: "subroutineCall",
              name: "Output.printString",
              parameters: [
                {
                  nodeType: "expression",
                  term: {
                    termType: "stringLiteral",
                    value: "The average is ",
                  },
                  rest: [],
                },
              ],
            },
          },
          {
            statementType: "doStatement",
            call: {
              termType: "subroutineCall",
              name: "Output.printInt",
              parameters: [
                {
                  nodeType: "expression",
                  term: { termType: "variable", name: "sum" },
                  rest: [
                    {
                      op: "/",
                      term: { termType: "variable", name: "length" },
                    },
                  ],
                },
              ],
            },
          },
          { statementType: "returnStatement" },
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
label L0
push local 2
push local 1
lt
not
if-goto L1
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
goto L0
label L1
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

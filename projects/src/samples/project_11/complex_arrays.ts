export const jack = `// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/11/ComplexArrays/Main.jack
/**
 * Performs several complex array processing tests.
 * For each test, the expected result is printed, along with the
 * actual result. In each test, the two results should be equal.
 */
class Main {

    function void main() {
        var Array a, b, c;
        
        let a = Array.new(10);
        let b = Array.new(5);
        let c = Array.new(1);
        
        let a[3] = 2;
        let a[4] = 8;
        let a[5] = 4;
        let b[a[3]] = a[3] + 3;  // b[2] = 5
        let a[b[a[3]]] = a[a[5]] * b[((7 - a[3]) - Main.double(2)) + 1];  // a[5] = 8 * 5 = 40
        let c[0] = null;
        let c = c[0];
        
        do Output.printString("Test 1: expected result: 5; actual result: ");
        do Output.printInt(b[2]);
        do Output.println();
        do Output.printString("Test 2: expected result: 40; actual result: ");
        do Output.printInt(a[5]);
        do Output.println();
        do Output.printString("Test 3: expected result: 0; actual result: ");
        do Output.printInt(c);
        do Output.println();
        
        let c = null;

        if (c = null) {
            do Main.fill(a, 10);
            let c = a[3];
            let c[1] = 33;
            let c = a[7];
            let c[1] = 77;
            let b = a[3];
            let b[1] = b[1] + c[1];  // b[1] = 33 + 77 = 110;
        }

        do Output.printString("Test 4: expected result: 77; actual result: ");
        do Output.printInt(c[1]);
        do Output.println();
        do Output.printString("Test 5: expected result: 110; actual result: ");
        do Output.printInt(b[1]);
        do Output.println();
        return;
    }
    
    function int double(int a) {
      return a * 2;
    }
    
    function void fill(Array a, int size) {
        while (size > 0) {
            let size = size - 1;
            let a[size] = Array.new(3);
        }
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
        varDecs: [{ type: "Array", names: ["a", "b", "c"] }],
        statements: [
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
                    term: { termType: "numericLiteral", value: 10 },
                    rest: [],
                  },
                ],
              },
              rest: [],
            },
          },
          {
            statementType: "letStatement",
            name: "b",
            value: {
              nodeType: "expression",
              term: {
                termType: "subroutineCall",
                name: "Array.new",
                parameters: [
                  {
                    nodeType: "expression",
                    term: { termType: "numericLiteral", value: 5 },
                    rest: [],
                  },
                ],
              },
              rest: [],
            },
          },
          {
            statementType: "letStatement",
            name: "c",
            value: {
              nodeType: "expression",
              term: {
                termType: "subroutineCall",
                name: "Array.new",
                parameters: [
                  {
                    nodeType: "expression",
                    term: { termType: "numericLiteral", value: 1 },
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
            arrayIndex: {
              nodeType: "expression",
              term: { termType: "numericLiteral", value: 3 },
              rest: [],
            },
            value: {
              nodeType: "expression",
              term: { termType: "numericLiteral", value: 2 },
              rest: [],
            },
          },
          {
            statementType: "letStatement",
            name: "a",
            arrayIndex: {
              nodeType: "expression",
              term: { termType: "numericLiteral", value: 4 },
              rest: [],
            },
            value: {
              nodeType: "expression",
              term: { termType: "numericLiteral", value: 8 },
              rest: [],
            },
          },
          {
            statementType: "letStatement",
            name: "a",
            arrayIndex: {
              nodeType: "expression",
              term: { termType: "numericLiteral", value: 5 },
              rest: [],
            },
            value: {
              nodeType: "expression",
              term: { termType: "numericLiteral", value: 4 },
              rest: [],
            },
          },
          {
            statementType: "letStatement",
            name: "b",
            arrayIndex: {
              nodeType: "expression",
              term: {
                termType: "arrayAccess",
                name: "a",
                index: {
                  nodeType: "expression",
                  term: { termType: "numericLiteral", value: 3 },
                  rest: [],
                },
              },
              rest: [],
            },
            value: {
              nodeType: "expression",
              term: {
                termType: "arrayAccess",
                name: "a",
                index: {
                  nodeType: "expression",
                  term: { termType: "numericLiteral", value: 3 },
                  rest: [],
                },
              },
              rest: [
                { op: "+", term: { termType: "numericLiteral", value: 3 } },
              ],
            },
          },
          {
            statementType: "letStatement",
            name: "a",
            arrayIndex: {
              nodeType: "expression",
              term: {
                termType: "arrayAccess",
                name: "b",
                index: {
                  nodeType: "expression",
                  term: {
                    termType: "arrayAccess",
                    name: "a",
                    index: {
                      nodeType: "expression",
                      term: { termType: "numericLiteral", value: 3 },
                      rest: [],
                    },
                  },
                  rest: [],
                },
              },
              rest: [],
            },
            value: {
              nodeType: "expression",
              term: {
                termType: "arrayAccess",
                name: "a",
                index: {
                  nodeType: "expression",
                  term: {
                    termType: "arrayAccess",
                    name: "a",
                    index: {
                      nodeType: "expression",
                      term: { termType: "numericLiteral", value: 5 },
                      rest: [],
                    },
                  },
                  rest: [],
                },
              },
              rest: [
                {
                  op: "*",
                  term: {
                    termType: "arrayAccess",
                    name: "b",
                    index: {
                      nodeType: "expression",
                      term: {
                        termType: "groupedExpression",
                        expression: {
                          nodeType: "expression",
                          term: {
                            termType: "groupedExpression",
                            expression: {
                              nodeType: "expression",
                              term: { termType: "numericLiteral", value: 7 },
                              rest: [
                                {
                                  op: "-",
                                  term: {
                                    termType: "arrayAccess",
                                    name: "a",
                                    index: {
                                      nodeType: "expression",
                                      term: {
                                        termType: "numericLiteral",
                                        value: 3,
                                      },
                                      rest: [],
                                    },
                                  },
                                },
                              ],
                            },
                          },
                          rest: [
                            {
                              op: "-",
                              term: {
                                termType: "subroutineCall",
                                name: "Main.double",
                                parameters: [
                                  {
                                    nodeType: "expression",
                                    term: {
                                      termType: "numericLiteral",
                                      value: 2,
                                    },
                                    rest: [],
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                      rest: [
                        {
                          op: "+",
                          term: { termType: "numericLiteral", value: 1 },
                        },
                      ],
                    },
                  },
                },
              ],
            },
          },
          {
            statementType: "letStatement",
            name: "c",
            arrayIndex: {
              nodeType: "expression",
              term: { termType: "numericLiteral", value: 0 },
              rest: [],
            },
            value: {
              nodeType: "expression",
              term: { termType: "keywordLiteral", value: "null" },
              rest: [],
            },
          },
          {
            statementType: "letStatement",
            name: "c",
            value: {
              nodeType: "expression",
              term: {
                termType: "arrayAccess",
                name: "c",
                index: {
                  nodeType: "expression",
                  term: { termType: "numericLiteral", value: 0 },
                  rest: [],
                },
              },
              rest: [],
            },
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
                    value: "Test 1: expected result: 5; actual result: ",
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
                  term: {
                    termType: "arrayAccess",
                    name: "b",
                    index: {
                      nodeType: "expression",
                      term: { termType: "numericLiteral", value: 2 },
                      rest: [],
                    },
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
              name: "Output.println",
              parameters: [],
            },
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
                    value: "Test 2: expected result: 40; actual result: ",
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
                  term: {
                    termType: "arrayAccess",
                    name: "a",
                    index: {
                      nodeType: "expression",
                      term: { termType: "numericLiteral", value: 5 },
                      rest: [],
                    },
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
              name: "Output.println",
              parameters: [],
            },
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
                    value: "Test 3: expected result: 0; actual result: ",
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
                  term: { termType: "variable", name: "c" },
                  rest: [],
                },
              ],
            },
          },
          {
            statementType: "doStatement",
            call: {
              termType: "subroutineCall",
              name: "Output.println",
              parameters: [],
            },
          },
          {
            statementType: "letStatement",
            name: "c",
            value: {
              nodeType: "expression",
              term: { termType: "keywordLiteral", value: "null" },
              rest: [],
            },
          },
          {
            statementType: "ifStatement",
            condition: {
              nodeType: "expression",
              term: { termType: "variable", name: "c" },
              rest: [
                {
                  op: "=",
                  term: { termType: "keywordLiteral", value: "null" },
                },
              ],
            },
            body: [
              {
                statementType: "doStatement",
                call: {
                  termType: "subroutineCall",
                  name: "Main.fill",
                  parameters: [
                    {
                      nodeType: "expression",
                      term: { termType: "variable", name: "a" },
                      rest: [],
                    },
                    {
                      nodeType: "expression",
                      term: { termType: "numericLiteral", value: 10 },
                      rest: [],
                    },
                  ],
                },
              },
              {
                statementType: "letStatement",
                name: "c",
                value: {
                  nodeType: "expression",
                  term: {
                    termType: "arrayAccess",
                    name: "a",
                    index: {
                      nodeType: "expression",
                      term: { termType: "numericLiteral", value: 3 },
                      rest: [],
                    },
                  },
                  rest: [],
                },
              },
              {
                statementType: "letStatement",
                name: "c",
                arrayIndex: {
                  nodeType: "expression",
                  term: { termType: "numericLiteral", value: 1 },
                  rest: [],
                },
                value: {
                  nodeType: "expression",
                  term: { termType: "numericLiteral", value: 33 },
                  rest: [],
                },
              },
              {
                statementType: "letStatement",
                name: "c",
                value: {
                  nodeType: "expression",
                  term: {
                    termType: "arrayAccess",
                    name: "a",
                    index: {
                      nodeType: "expression",
                      term: { termType: "numericLiteral", value: 7 },
                      rest: [],
                    },
                  },
                  rest: [],
                },
              },
              {
                statementType: "letStatement",
                name: "c",
                arrayIndex: {
                  nodeType: "expression",
                  term: { termType: "numericLiteral", value: 1 },
                  rest: [],
                },
                value: {
                  nodeType: "expression",
                  term: { termType: "numericLiteral", value: 77 },
                  rest: [],
                },
              },
              {
                statementType: "letStatement",
                name: "b",
                value: {
                  nodeType: "expression",
                  term: {
                    termType: "arrayAccess",
                    name: "a",
                    index: {
                      nodeType: "expression",
                      term: { termType: "numericLiteral", value: 3 },
                      rest: [],
                    },
                  },
                  rest: [],
                },
              },
              {
                statementType: "letStatement",
                name: "b",
                arrayIndex: {
                  nodeType: "expression",
                  term: { termType: "numericLiteral", value: 1 },
                  rest: [],
                },
                value: {
                  nodeType: "expression",
                  term: {
                    termType: "arrayAccess",
                    name: "b",
                    index: {
                      nodeType: "expression",
                      term: { termType: "numericLiteral", value: 1 },
                      rest: [],
                    },
                  },
                  rest: [
                    {
                      op: "+",
                      term: {
                        termType: "arrayAccess",
                        name: "c",
                        index: {
                          nodeType: "expression",
                          term: { termType: "numericLiteral", value: 1 },
                          rest: [],
                        },
                      },
                    },
                  ],
                },
              },
            ],
            else: [],
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
                    value: "Test 4: expected result: 77; actual result: ",
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
                  term: {
                    termType: "arrayAccess",
                    name: "c",
                    index: {
                      nodeType: "expression",
                      term: { termType: "numericLiteral", value: 1 },
                      rest: [],
                    },
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
              name: "Output.println",
              parameters: [],
            },
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
                    value: "Test 5: expected result: 110; actual result: ",
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
                  term: {
                    termType: "arrayAccess",
                    name: "b",
                    index: {
                      nodeType: "expression",
                      term: { termType: "numericLiteral", value: 1 },
                      rest: [],
                    },
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
              name: "Output.println",
              parameters: [],
            },
          },
          { statementType: "returnStatement" },
        ],
      },
    },
    {
      type: "function",
      returnType: "int",
      name: "double",
      parameters: [{ type: "int", name: "a" }],
      body: {
        varDecs: [],
        statements: [
          {
            statementType: "returnStatement",
            value: {
              nodeType: "expression",
              term: { termType: "variable", name: "a" },
              rest: [
                { op: "*", term: { termType: "numericLiteral", value: 2 } },
              ],
            },
          },
        ],
      },
    },
    {
      type: "function",
      returnType: "void",
      name: "fill",
      parameters: [
        { type: "Array", name: "a" },
        { type: "int", name: "size" },
      ],
      body: {
        varDecs: [],
        statements: [
          {
            statementType: "whileStatement",
            condition: {
              nodeType: "expression",
              term: { termType: "variable", name: "size" },
              rest: [
                { op: ">", term: { termType: "numericLiteral", value: 0 } },
              ],
            },
            body: [
              {
                statementType: "letStatement",
                name: "size",
                value: {
                  nodeType: "expression",
                  term: { termType: "variable", name: "size" },
                  rest: [
                    {
                      op: "-",
                      term: { termType: "numericLiteral", value: 1 },
                    },
                  ],
                },
              },
              {
                statementType: "letStatement",
                name: "a",
                arrayIndex: {
                  nodeType: "expression",
                  term: { termType: "variable", name: "size" },
                  rest: [],
                },
                value: {
                  nodeType: "expression",
                  term: {
                    termType: "subroutineCall",
                    name: "Array.new",
                    parameters: [
                      {
                        nodeType: "expression",
                        term: { termType: "numericLiteral", value: 3 },
                        rest: [],
                      },
                    ],
                  },
                  rest: [],
                },
              },
            ],
          },
          { statementType: "returnStatement" },
        ],
      },
    },
  ],
};

export const compiled = `function Main.main 3
push constant 10
call Array.new 1
pop local 0
push constant 5
call Array.new 1
pop local 1
push constant 1
call Array.new 1
pop local 2
push constant 3
push local 0
add
push constant 2
pop temp 0
pop pointer 1
push temp 0
pop that 0
push constant 4
push local 0
add
push constant 8
pop temp 0
pop pointer 1
push temp 0
pop that 0
push constant 5
push local 0
add
push constant 4
pop temp 0
pop pointer 1
push temp 0
pop that 0
push constant 3
push local 0
add
pop pointer 1
push that 0
push local 1
add
push constant 3
push local 0
add
pop pointer 1
push that 0
push constant 3
add
pop temp 0
pop pointer 1
push temp 0
pop that 0
push constant 3
push local 0
add
pop pointer 1
push that 0
push local 1
add
pop pointer 1
push that 0
push local 0
add
push constant 5
push local 0
add
pop pointer 1
push that 0
push local 0
add
pop pointer 1
push that 0
push constant 7
push constant 3
push local 0
add
pop pointer 1
push that 0
sub
push constant 2
call Main.double 1
sub
push constant 1
add
push local 1
add
pop pointer 1
push that 0
call Math.multiply 2
pop temp 0
pop pointer 1
push temp 0
pop that 0
push constant 0
push local 2
add
push constant 0
pop temp 0
pop pointer 1
push temp 0
pop that 0
push constant 0
push local 2
add
pop pointer 1
push that 0
pop local 2
push constant 43
call String.new 1
push constant 84
call String.appendChar 2
push constant 101
call String.appendChar 2
push constant 115
call String.appendChar 2
push constant 116
call String.appendChar 2
push constant 32
call String.appendChar 2
push constant 49
call String.appendChar 2
push constant 58
call String.appendChar 2
push constant 32
call String.appendChar 2
push constant 101
call String.appendChar 2
push constant 120
call String.appendChar 2
push constant 112
call String.appendChar 2
push constant 101
call String.appendChar 2
push constant 99
call String.appendChar 2
push constant 116
call String.appendChar 2
push constant 101
call String.appendChar 2
push constant 100
call String.appendChar 2
push constant 32
call String.appendChar 2
push constant 114
call String.appendChar 2
push constant 101
call String.appendChar 2
push constant 115
call String.appendChar 2
push constant 117
call String.appendChar 2
push constant 108
call String.appendChar 2
push constant 116
call String.appendChar 2
push constant 58
call String.appendChar 2
push constant 32
call String.appendChar 2
push constant 53
call String.appendChar 2
push constant 59
call String.appendChar 2
push constant 32
call String.appendChar 2
push constant 97
call String.appendChar 2
push constant 99
call String.appendChar 2
push constant 116
call String.appendChar 2
push constant 117
call String.appendChar 2
push constant 97
call String.appendChar 2
push constant 108
call String.appendChar 2
push constant 32
call String.appendChar 2
push constant 114
call String.appendChar 2
push constant 101
call String.appendChar 2
push constant 115
call String.appendChar 2
push constant 117
call String.appendChar 2
push constant 108
call String.appendChar 2
push constant 116
call String.appendChar 2
push constant 58
call String.appendChar 2
push constant 32
call String.appendChar 2
call Output.printString 1
pop temp 0
push constant 2
push local 1
add
pop pointer 1
push that 0
call Output.printInt 1
pop temp 0
call Output.println 0
pop temp 0
push constant 44
call String.new 1
push constant 84
call String.appendChar 2
push constant 101
call String.appendChar 2
push constant 115
call String.appendChar 2
push constant 116
call String.appendChar 2
push constant 32
call String.appendChar 2
push constant 50
call String.appendChar 2
push constant 58
call String.appendChar 2
push constant 32
call String.appendChar 2
push constant 101
call String.appendChar 2
push constant 120
call String.appendChar 2
push constant 112
call String.appendChar 2
push constant 101
call String.appendChar 2
push constant 99
call String.appendChar 2
push constant 116
call String.appendChar 2
push constant 101
call String.appendChar 2
push constant 100
call String.appendChar 2
push constant 32
call String.appendChar 2
push constant 114
call String.appendChar 2
push constant 101
call String.appendChar 2
push constant 115
call String.appendChar 2
push constant 117
call String.appendChar 2
push constant 108
call String.appendChar 2
push constant 116
call String.appendChar 2
push constant 58
call String.appendChar 2
push constant 32
call String.appendChar 2
push constant 52
call String.appendChar 2
push constant 48
call String.appendChar 2
push constant 59
call String.appendChar 2
push constant 32
call String.appendChar 2
push constant 97
call String.appendChar 2
push constant 99
call String.appendChar 2
push constant 116
call String.appendChar 2
push constant 117
call String.appendChar 2
push constant 97
call String.appendChar 2
push constant 108
call String.appendChar 2
push constant 32
call String.appendChar 2
push constant 114
call String.appendChar 2
push constant 101
call String.appendChar 2
push constant 115
call String.appendChar 2
push constant 117
call String.appendChar 2
push constant 108
call String.appendChar 2
push constant 116
call String.appendChar 2
push constant 58
call String.appendChar 2
push constant 32
call String.appendChar 2
call Output.printString 1
pop temp 0
push constant 5
push local 0
add
pop pointer 1
push that 0
call Output.printInt 1
pop temp 0
call Output.println 0
pop temp 0
push constant 43
call String.new 1
push constant 84
call String.appendChar 2
push constant 101
call String.appendChar 2
push constant 115
call String.appendChar 2
push constant 116
call String.appendChar 2
push constant 32
call String.appendChar 2
push constant 51
call String.appendChar 2
push constant 58
call String.appendChar 2
push constant 32
call String.appendChar 2
push constant 101
call String.appendChar 2
push constant 120
call String.appendChar 2
push constant 112
call String.appendChar 2
push constant 101
call String.appendChar 2
push constant 99
call String.appendChar 2
push constant 116
call String.appendChar 2
push constant 101
call String.appendChar 2
push constant 100
call String.appendChar 2
push constant 32
call String.appendChar 2
push constant 114
call String.appendChar 2
push constant 101
call String.appendChar 2
push constant 115
call String.appendChar 2
push constant 117
call String.appendChar 2
push constant 108
call String.appendChar 2
push constant 116
call String.appendChar 2
push constant 58
call String.appendChar 2
push constant 32
call String.appendChar 2
push constant 48
call String.appendChar 2
push constant 59
call String.appendChar 2
push constant 32
call String.appendChar 2
push constant 97
call String.appendChar 2
push constant 99
call String.appendChar 2
push constant 116
call String.appendChar 2
push constant 117
call String.appendChar 2
push constant 97
call String.appendChar 2
push constant 108
call String.appendChar 2
push constant 32
call String.appendChar 2
push constant 114
call String.appendChar 2
push constant 101
call String.appendChar 2
push constant 115
call String.appendChar 2
push constant 117
call String.appendChar 2
push constant 108
call String.appendChar 2
push constant 116
call String.appendChar 2
push constant 58
call String.appendChar 2
push constant 32
call String.appendChar 2
call Output.printString 1
pop temp 0
push local 2
call Output.printInt 1
pop temp 0
call Output.println 0
pop temp 0
push constant 0
pop local 2
push local 2
push constant 0
eq
not
if-goto L1
push local 0
push constant 10
call Main.fill 2
pop temp 0
push constant 3
push local 0
add
pop pointer 1
push that 0
pop local 2
push constant 1
push local 2
add
push constant 33
pop temp 0
pop pointer 1
push temp 0
pop that 0
push constant 7
push local 0
add
pop pointer 1
push that 0
pop local 2
push constant 1
push local 2
add
push constant 77
pop temp 0
pop pointer 1
push temp 0
pop that 0
push constant 3
push local 0
add
pop pointer 1
push that 0
pop local 1
push constant 1
push local 1
add
push constant 1
push local 1
add
pop pointer 1
push that 0
push constant 1
push local 2
add
pop pointer 1
push that 0
add
pop temp 0
pop pointer 1
push temp 0
pop that 0
goto L0
label L1
label L0
push constant 44
call String.new 1
push constant 84
call String.appendChar 2
push constant 101
call String.appendChar 2
push constant 115
call String.appendChar 2
push constant 116
call String.appendChar 2
push constant 32
call String.appendChar 2
push constant 52
call String.appendChar 2
push constant 58
call String.appendChar 2
push constant 32
call String.appendChar 2
push constant 101
call String.appendChar 2
push constant 120
call String.appendChar 2
push constant 112
call String.appendChar 2
push constant 101
call String.appendChar 2
push constant 99
call String.appendChar 2
push constant 116
call String.appendChar 2
push constant 101
call String.appendChar 2
push constant 100
call String.appendChar 2
push constant 32
call String.appendChar 2
push constant 114
call String.appendChar 2
push constant 101
call String.appendChar 2
push constant 115
call String.appendChar 2
push constant 117
call String.appendChar 2
push constant 108
call String.appendChar 2
push constant 116
call String.appendChar 2
push constant 58
call String.appendChar 2
push constant 32
call String.appendChar 2
push constant 55
call String.appendChar 2
push constant 55
call String.appendChar 2
push constant 59
call String.appendChar 2
push constant 32
call String.appendChar 2
push constant 97
call String.appendChar 2
push constant 99
call String.appendChar 2
push constant 116
call String.appendChar 2
push constant 117
call String.appendChar 2
push constant 97
call String.appendChar 2
push constant 108
call String.appendChar 2
push constant 32
call String.appendChar 2
push constant 114
call String.appendChar 2
push constant 101
call String.appendChar 2
push constant 115
call String.appendChar 2
push constant 117
call String.appendChar 2
push constant 108
call String.appendChar 2
push constant 116
call String.appendChar 2
push constant 58
call String.appendChar 2
push constant 32
call String.appendChar 2
call Output.printString 1
pop temp 0
push constant 1
push local 2
add
pop pointer 1
push that 0
call Output.printInt 1
pop temp 0
call Output.println 0
pop temp 0
push constant 45
call String.new 1
push constant 84
call String.appendChar 2
push constant 101
call String.appendChar 2
push constant 115
call String.appendChar 2
push constant 116
call String.appendChar 2
push constant 32
call String.appendChar 2
push constant 53
call String.appendChar 2
push constant 58
call String.appendChar 2
push constant 32
call String.appendChar 2
push constant 101
call String.appendChar 2
push constant 120
call String.appendChar 2
push constant 112
call String.appendChar 2
push constant 101
call String.appendChar 2
push constant 99
call String.appendChar 2
push constant 116
call String.appendChar 2
push constant 101
call String.appendChar 2
push constant 100
call String.appendChar 2
push constant 32
call String.appendChar 2
push constant 114
call String.appendChar 2
push constant 101
call String.appendChar 2
push constant 115
call String.appendChar 2
push constant 117
call String.appendChar 2
push constant 108
call String.appendChar 2
push constant 116
call String.appendChar 2
push constant 58
call String.appendChar 2
push constant 32
call String.appendChar 2
push constant 49
call String.appendChar 2
push constant 49
call String.appendChar 2
push constant 48
call String.appendChar 2
push constant 59
call String.appendChar 2
push constant 32
call String.appendChar 2
push constant 97
call String.appendChar 2
push constant 99
call String.appendChar 2
push constant 116
call String.appendChar 2
push constant 117
call String.appendChar 2
push constant 97
call String.appendChar 2
push constant 108
call String.appendChar 2
push constant 32
call String.appendChar 2
push constant 114
call String.appendChar 2
push constant 101
call String.appendChar 2
push constant 115
call String.appendChar 2
push constant 117
call String.appendChar 2
push constant 108
call String.appendChar 2
push constant 116
call String.appendChar 2
push constant 58
call String.appendChar 2
push constant 32
call String.appendChar 2
call Output.printString 1
pop temp 0
push constant 1
push local 1
add
pop pointer 1
push that 0
call Output.printInt 1
pop temp 0
call Output.println 0
pop temp 0
push constant 0
return
function Main.double 0
push argument 0
push constant 2
call Math.multiply 2
return
function Main.fill 0
label L2
push argument 1
push constant 0
gt
not
if-goto L3
push argument 1
push constant 1
sub
pop argument 1
push argument 1
push argument 0
add
push constant 3
call Array.new 1
pop temp 0
pop pointer 1
push temp 0
pop that 0
goto L2
label L3
push constant 0
return`;

export const jack = `// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/11/ConvertToBin/Main.jack
/**
 * Unpacks a 16-bit number into its binary representation:
 * Takes the 16-bit number stored in RAM[8000] and stores its individual 
 * bits in RAM[8001]..RAM[8016] (each location will contain 0 or 1).
 * Before the conversion, RAM[8001]..RAM[8016] are initialized to -1.
 * 
 * The program should be tested as follows:
 * 1) Load the program into the supplied VM emulator
 * 2) Put some value in RAM[8000]
 * 3) Switch to "no animation"
 * 4) Run the program (give it enough time to run)
 * 5) Stop the program
 * 6) Check that RAM[8001]..RAM[8016] contain the correct bits, and
 *    that none of these memory locations contains -1.
 */
class Main {
    
    /**
     * Initializes RAM[8001]..RAM[8016] to -1,
     * and converts the value in RAM[8000] to binary.
     */
    function void main() {
      var int value;
        do Main.fillMemory(8001, 16, -1); // sets RAM[8001]..RAM[8016] to -1
        let value = Memory.peek(8000);    // Uses an OS routine to read the input
        do Main.convert(value);           // performs the conversion
        return;
    }
    
    /** Converts the given decimal value to binary, and puts 
     *  the resulting bits in RAM[8001]..RAM[8016]. */
    function void convert(int value) {
      var int mask, position;
      var boolean loop;
      
      let loop = true;
      while (loop) {
          let position = position + 1;
          let mask = Main.nextMask(mask);
      
          if (~(position > 16)) {
      
              if (~((value & mask) = 0)) {
                  do Memory.poke(8000 + position, 1);
                 }
              else {
                  do Memory.poke(8000 + position, 0);
                }    
          }
          else {
              let loop = false;
          }
      }
      return;
    }
 
    /** Returns the next mask (the mask that should follow the given mask). */
    function int nextMask(int mask) {
      if (mask = 0) {
          return 1;
      }
      else {
      return mask * 2;
      }
    }
    
    /** Fills 'length' consecutive memory locations with 'value',
      * starting at 'address'. */
    function void fillMemory(int address, int length, int value) {
        while (length > 0) {
            do Memory.poke(address, value);
            let length = length - 1;
            let address = address + 1;
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
        varDecs: [{ type: "int", names: ["value"] }],
        statements: [
          {
            statementType: "doStatement",
            call: {
              termType: "subroutineCall",
              name: "Main.fillMemory",
              parameters: [
                {
                  nodeType: "expression",
                  term: { termType: "numericLiteral", value: 8001 },
                  rest: [],
                },
                {
                  nodeType: "expression",
                  term: { termType: "numericLiteral", value: 16 },
                  rest: [],
                },
                {
                  nodeType: "expression",
                  term: {
                    termType: "unaryExpression",
                    op: "-",
                    term: { termType: "numericLiteral", value: 1 },
                  },
                  rest: [],
                },
              ],
            },
          },
          {
            statementType: "letStatement",
            name: "value",
            value: {
              nodeType: "expression",
              term: {
                termType: "subroutineCall",
                name: "Memory.peek",
                parameters: [
                  {
                    nodeType: "expression",
                    term: { termType: "numericLiteral", value: 8000 },
                    rest: [],
                  },
                ],
              },
              rest: [],
            },
          },
          {
            statementType: "doStatement",
            call: {
              termType: "subroutineCall",
              name: "Main.convert",
              parameters: [
                {
                  nodeType: "expression",
                  term: { termType: "variable", name: "value" },
                  rest: [],
                },
              ],
            },
          },
          { statementType: "returnStatement" },
        ],
      },
    },
    {
      type: "function",
      returnType: "void",
      name: "convert",
      parameters: [{ type: "int", name: "value" }],
      body: {
        varDecs: [
          { type: "int", names: ["mask", "position"] },
          { type: "boolean", names: ["loop"] },
        ],
        statements: [
          {
            statementType: "letStatement",
            name: "loop",
            value: {
              nodeType: "expression",
              term: { termType: "keywordLiteral", value: "true" },
              rest: [],
            },
          },
          {
            statementType: "whileStatement",
            condition: {
              nodeType: "expression",
              term: { termType: "variable", name: "loop" },
              rest: [],
            },
            body: [
              {
                statementType: "letStatement",
                name: "position",
                value: {
                  nodeType: "expression",
                  term: { termType: "variable", name: "position" },
                  rest: [
                    {
                      op: "+",
                      term: { termType: "numericLiteral", value: 1 },
                    },
                  ],
                },
              },
              {
                statementType: "letStatement",
                name: "mask",
                value: {
                  nodeType: "expression",
                  term: {
                    termType: "subroutineCall",
                    name: "Main.nextMask",
                    parameters: [
                      {
                        nodeType: "expression",
                        term: { termType: "variable", name: "mask" },
                        rest: [],
                      },
                    ],
                  },
                  rest: [],
                },
              },
              {
                statementType: "ifStatement",
                condition: {
                  nodeType: "expression",
                  term: {
                    termType: "unaryExpression",
                    op: "~",
                    term: {
                      termType: "groupedExpression",
                      expression: {
                        nodeType: "expression",
                        term: { termType: "variable", name: "position" },
                        rest: [
                          {
                            op: ">",
                            term: { termType: "numericLiteral", value: 16 },
                          },
                        ],
                      },
                    },
                  },
                  rest: [],
                },
                body: [
                  {
                    statementType: "ifStatement",
                    condition: {
                      nodeType: "expression",
                      term: {
                        termType: "unaryExpression",
                        op: "~",
                        term: {
                          termType: "groupedExpression",
                          expression: {
                            nodeType: "expression",
                            term: {
                              termType: "groupedExpression",
                              expression: {
                                nodeType: "expression",
                                term: { termType: "variable", name: "value" },
                                rest: [
                                  {
                                    op: "&",
                                    term: {
                                      termType: "variable",
                                      name: "mask",
                                    },
                                  },
                                ],
                              },
                            },
                            rest: [
                              {
                                op: "=",
                                term: {
                                  termType: "numericLiteral",
                                  value: 0,
                                },
                              },
                            ],
                          },
                        },
                      },
                      rest: [],
                    },
                    body: [
                      {
                        statementType: "doStatement",
                        call: {
                          termType: "subroutineCall",
                          name: "Memory.poke",
                          parameters: [
                            {
                              nodeType: "expression",
                              term: {
                                termType: "numericLiteral",
                                value: 8000,
                              },
                              rest: [
                                {
                                  op: "+",
                                  term: {
                                    termType: "variable",
                                    name: "position",
                                  },
                                },
                              ],
                            },
                            {
                              nodeType: "expression",
                              term: { termType: "numericLiteral", value: 1 },
                              rest: [],
                            },
                          ],
                        },
                      },
                    ],
                    else: [
                      {
                        statementType: "doStatement",
                        call: {
                          termType: "subroutineCall",
                          name: "Memory.poke",
                          parameters: [
                            {
                              nodeType: "expression",
                              term: {
                                termType: "numericLiteral",
                                value: 8000,
                              },
                              rest: [
                                {
                                  op: "+",
                                  term: {
                                    termType: "variable",
                                    name: "position",
                                  },
                                },
                              ],
                            },
                            {
                              nodeType: "expression",
                              term: { termType: "numericLiteral", value: 0 },
                              rest: [],
                            },
                          ],
                        },
                      },
                    ],
                  },
                ],
                else: [
                  {
                    statementType: "letStatement",
                    name: "loop",
                    value: {
                      nodeType: "expression",
                      term: { termType: "keywordLiteral", value: "false" },
                      rest: [],
                    },
                  },
                ],
              },
            ],
          },
          { statementType: "returnStatement" },
        ],
      },
    },
    {
      type: "function",
      returnType: "int",
      name: "nextMask",
      parameters: [{ type: "int", name: "mask" }],
      body: {
        varDecs: [],
        statements: [
          {
            statementType: "ifStatement",
            condition: {
              nodeType: "expression",
              term: { termType: "variable", name: "mask" },
              rest: [
                { op: "=", term: { termType: "numericLiteral", value: 0 } },
              ],
            },
            body: [
              {
                statementType: "returnStatement",
                value: {
                  nodeType: "expression",
                  term: { termType: "numericLiteral", value: 1 },
                  rest: [],
                },
              },
            ],
            else: [
              {
                statementType: "returnStatement",
                value: {
                  nodeType: "expression",
                  term: { termType: "variable", name: "mask" },
                  rest: [
                    {
                      op: "*",
                      term: { termType: "numericLiteral", value: 2 },
                    },
                  ],
                },
              },
            ],
          },
        ],
      },
    },
    {
      type: "function",
      returnType: "void",
      name: "fillMemory",
      parameters: [
        { type: "int", name: "address" },
        { type: "int", name: "length" },
        { type: "int", name: "value" },
      ],
      body: {
        varDecs: [],
        statements: [
          {
            statementType: "whileStatement",
            condition: {
              nodeType: "expression",
              term: { termType: "variable", name: "length" },
              rest: [
                { op: ">", term: { termType: "numericLiteral", value: 0 } },
              ],
            },
            body: [
              {
                statementType: "doStatement",
                call: {
                  termType: "subroutineCall",
                  name: "Memory.poke",
                  parameters: [
                    {
                      nodeType: "expression",
                      term: { termType: "variable", name: "address" },
                      rest: [],
                    },
                    {
                      nodeType: "expression",
                      term: { termType: "variable", name: "value" },
                      rest: [],
                    },
                  ],
                },
              },
              {
                statementType: "letStatement",
                name: "length",
                value: {
                  nodeType: "expression",
                  term: { termType: "variable", name: "length" },
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
                name: "address",
                value: {
                  nodeType: "expression",
                  term: { termType: "variable", name: "address" },
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
          { statementType: "returnStatement" },
        ],
      },
    },
  ],
};

export const compiled = `function Main.main 1
push constant 8001
push constant 16
push constant 1
neg
call Main.fillMemory 3
pop temp 0
push constant 8000
call Memory.peek 1
pop local 0
push local 0
call Main.convert 1
pop temp 0
push constant 0
return
function Main.convert 3
push constant 1
pop local 2
label L0
push local 2
not
if-goto L1
push local 1
push constant 1
add
pop local 1
push local 0
call Main.nextMask 1
pop local 0
push local 1
push constant 16
gt
not
not
if-goto L3
push argument 0
push local 0
and
push constant 0
eq
not
not
if-goto L5
push constant 8000
push local 1
add
push constant 1
call Memory.poke 2
pop temp 0
goto L4
label L5
push constant 8000
push local 1
add
push constant 0
call Memory.poke 2
pop temp 0
label L4
goto L2
label L3
push constant 0
pop local 2
label L2
goto L0
label L1
push constant 0
return
function Main.nextMask 0
push argument 0
push constant 0
eq
not
if-goto L7
push constant 1
return
goto L6
label L7
push argument 0
push constant 2
call Math.multiply 2
return
label L6
function Main.fillMemory 0
label L8
push argument 1
push constant 0
gt
not
if-goto L9
push argument 0
push argument 2
call Memory.poke 2
pop temp 0
push argument 1
push constant 1
sub
pop argument 1
push argument 0
push constant 1
add
pop argument 0
goto L8
label L9
push constant 0
return`;

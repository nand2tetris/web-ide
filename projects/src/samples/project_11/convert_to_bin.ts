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
  name: { value: "Main", span: { start: 831, end: 835, line: 20 } },
  varDecs: [],
  subroutines: [
    {
      type: "function",
      returnType: { value: "void", span: { start: 973, end: 978, line: 26 } },
      name: { value: "main", span: { start: 978, end: 982, line: 26 } },
      parameters: [],
      body: {
        varDecs: [
          {
            type: { value: "int", span: { start: 997, end: 1001, line: 27 } },
            names: ["value"],
          },
        ],
        statements: [
          {
            statementType: "doStatement",
            call: {
              termType: "subroutineCall",
              name: {
                value: "Main.fillMemory",
                span: { start: 1019, end: 1034, line: 28 },
              },
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
              span: { start: 1019, end: 1048, line: 28 },
            },
          },
          {
            statementType: "letStatement",
            name: {
              value: "value",
              span: { start: 1097, end: 1102, line: 29 },
            },
            value: {
              nodeType: "expression",
              term: {
                termType: "subroutineCall",
                name: {
                  value: "Memory.peek",
                  span: { start: 1105, end: 1116, line: 29 },
                },
                parameters: [
                  {
                    nodeType: "expression",
                    term: { termType: "numericLiteral", value: 8000 },
                    rest: [],
                  },
                ],
                span: { start: 1105, end: 1122, line: 29 },
              },
              rest: [],
            },
            span: { start: 1093, end: 1123, line: 29 },
          },
          {
            statementType: "doStatement",
            call: {
              termType: "subroutineCall",
              name: {
                value: "Main.convert",
                span: { start: 1178, end: 1190, line: 30 },
              },
              parameters: [
                {
                  nodeType: "expression",
                  term: {
                    termType: "variable",
                    name: "value",
                    span: { start: 1191, end: 1196, line: 30 },
                  },
                  rest: [],
                },
              ],
              span: { start: 1178, end: 1197, line: 30 },
            },
          },
          {
            statementType: "returnStatement",
            span: { start: 1244, end: 1251, line: 31 },
          },
        ],
      },
    },
    {
      type: "function",
      returnType: { value: "void", span: { start: 1393, end: 1398, line: 36 } },
      name: { value: "convert", span: { start: 1398, end: 1405, line: 36 } },
      parameters: [
        {
          type: { value: "int", span: { start: 1406, end: 1410, line: 36 } },
          name: "value",
        },
      ],
      body: {
        varDecs: [
          {
            type: { value: "int", span: { start: 1429, end: 1433, line: 37 } },
            names: ["mask", "position"],
          },
          {
            type: {
              value: "boolean",
              span: { start: 1459, end: 1467, line: 38 },
            },
            names: ["loop"],
          },
        ],
        statements: [
          {
            statementType: "letStatement",
            name: { value: "loop", span: { start: 1490, end: 1494, line: 40 } },
            value: {
              nodeType: "expression",
              term: { termType: "keywordLiteral", value: "true" },
              rest: [],
            },
            span: { start: 1486, end: 1502, line: 40 },
          },
          {
            statementType: "whileStatement",
            condition: {
              nodeType: "expression",
              term: {
                termType: "variable",
                name: "loop",
                span: { start: 1516, end: 1520, line: 41 },
              },
              rest: [],
            },
            body: [
              {
                statementType: "letStatement",
                name: {
                  value: "position",
                  span: { start: 1538, end: 1546, line: 42 },
                },
                value: {
                  nodeType: "expression",
                  term: {
                    termType: "variable",
                    name: "position",
                    span: { start: 1549, end: 1557, line: 42 },
                  },
                  rest: [
                    { op: "+", term: { termType: "numericLiteral", value: 1 } },
                  ],
                },
                span: { start: 1534, end: 1562, line: 42 },
              },
              {
                statementType: "letStatement",
                name: {
                  value: "mask",
                  span: { start: 1577, end: 1581, line: 43 },
                },
                value: {
                  nodeType: "expression",
                  term: {
                    termType: "subroutineCall",
                    name: {
                      value: "Main.nextMask",
                      span: { start: 1584, end: 1597, line: 43 },
                    },
                    parameters: [
                      {
                        nodeType: "expression",
                        term: {
                          termType: "variable",
                          name: "mask",
                          span: { start: 1598, end: 1602, line: 43 },
                        },
                        rest: [],
                      },
                    ],
                    span: { start: 1584, end: 1603, line: 43 },
                  },
                  rest: [],
                },
                span: { start: 1573, end: 1604, line: 43 },
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
                        term: {
                          termType: "variable",
                          name: "position",
                          span: { start: 1628, end: 1636, line: 45 },
                        },
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
                                term: {
                                  termType: "variable",
                                  name: "value",
                                  span: { start: 1674, end: 1679, line: 47 },
                                },
                                rest: [
                                  {
                                    op: "&",
                                    term: {
                                      termType: "variable",
                                      name: "mask",
                                      span: {
                                        start: 1682,
                                        end: 1686,
                                        line: 47,
                                      },
                                    },
                                  },
                                ],
                              },
                            },
                            rest: [
                              {
                                op: "=",
                                term: { termType: "numericLiteral", value: 0 },
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
                          name: {
                            value: "Memory.poke",
                            span: { start: 1717, end: 1728, line: 48 },
                          },
                          parameters: [
                            {
                              nodeType: "expression",
                              term: { termType: "numericLiteral", value: 8000 },
                              rest: [
                                {
                                  op: "+",
                                  term: {
                                    termType: "variable",
                                    name: "position",
                                    span: { start: 1736, end: 1744, line: 48 },
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
                          span: { start: 1717, end: 1748, line: 48 },
                        },
                      },
                    ],
                    else: [
                      {
                        statementType: "doStatement",
                        call: {
                          termType: "subroutineCall",
                          name: {
                            value: "Memory.poke",
                            span: { start: 1811, end: 1822, line: 51 },
                          },
                          parameters: [
                            {
                              nodeType: "expression",
                              term: { termType: "numericLiteral", value: 8000 },
                              rest: [
                                {
                                  op: "+",
                                  term: {
                                    termType: "variable",
                                    name: "position",
                                    span: { start: 1830, end: 1838, line: 51 },
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
                          span: { start: 1811, end: 1842, line: 51 },
                        },
                      },
                    ],
                  },
                ],
                else: [
                  {
                    statementType: "letStatement",
                    name: {
                      value: "loop",
                      span: { start: 1913, end: 1917, line: 55 },
                    },
                    value: {
                      nodeType: "expression",
                      term: { termType: "keywordLiteral", value: "false" },
                      rest: [],
                    },
                    span: { start: 1909, end: 1926, line: 55 },
                  },
                ],
              },
            ],
          },
          {
            statementType: "returnStatement",
            span: { start: 1953, end: 1960, line: 58 },
          },
        ],
      },
    },
    {
      type: "function",
      returnType: { value: "int", span: { start: 2061, end: 2065, line: 62 } },
      name: { value: "nextMask", span: { start: 2065, end: 2073, line: 62 } },
      parameters: [
        {
          type: { value: "int", span: { start: 2074, end: 2078, line: 62 } },
          name: "mask",
        },
      ],
      body: {
        varDecs: [],
        statements: [
          {
            statementType: "ifStatement",
            condition: {
              nodeType: "expression",
              term: {
                termType: "variable",
                name: "mask",
                span: { start: 2096, end: 2100, line: 63 },
              },
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
                span: { start: 2118, end: 2127, line: 64 },
              },
            ],
            else: [
              {
                statementType: "returnStatement",
                value: {
                  nodeType: "expression",
                  term: {
                    termType: "variable",
                    name: "mask",
                    span: { start: 2162, end: 2166, line: 67 },
                  },
                  rest: [
                    { op: "*", term: { termType: "numericLiteral", value: 2 } },
                  ],
                },
                span: { start: 2155, end: 2171, line: 67 },
              },
            ],
          },
        ],
      },
    },
    {
      type: "function",
      returnType: { value: "void", span: { start: 2304, end: 2309, line: 73 } },
      name: { value: "fillMemory", span: { start: 2309, end: 2319, line: 73 } },
      parameters: [
        {
          type: { value: "int", span: { start: 2320, end: 2324, line: 73 } },
          name: "address",
        },
        {
          type: { value: "int", span: { start: 2333, end: 2337, line: 73 } },
          name: "length",
        },
        {
          type: { value: "int", span: { start: 2345, end: 2349, line: 73 } },
          name: "value",
        },
      ],
      body: {
        varDecs: [],
        statements: [
          {
            statementType: "whileStatement",
            condition: {
              nodeType: "expression",
              term: {
                termType: "variable",
                name: "length",
                span: { start: 2373, end: 2379, line: 74 },
              },
              rest: [
                { op: ">", term: { termType: "numericLiteral", value: 0 } },
              ],
            },
            body: [
              {
                statementType: "doStatement",
                call: {
                  termType: "subroutineCall",
                  name: {
                    value: "Memory.poke",
                    span: { start: 2402, end: 2413, line: 75 },
                  },
                  parameters: [
                    {
                      nodeType: "expression",
                      term: {
                        termType: "variable",
                        name: "address",
                        span: { start: 2414, end: 2421, line: 75 },
                      },
                      rest: [],
                    },
                    {
                      nodeType: "expression",
                      term: {
                        termType: "variable",
                        name: "value",
                        span: { start: 2423, end: 2428, line: 75 },
                      },
                      rest: [],
                    },
                  ],
                  span: { start: 2402, end: 2429, line: 75 },
                },
              },
              {
                statementType: "letStatement",
                name: {
                  value: "length",
                  span: { start: 2447, end: 2453, line: 76 },
                },
                value: {
                  nodeType: "expression",
                  term: {
                    termType: "variable",
                    name: "length",
                    span: { start: 2456, end: 2462, line: 76 },
                  },
                  rest: [
                    { op: "-", term: { termType: "numericLiteral", value: 1 } },
                  ],
                },
                span: { start: 2443, end: 2467, line: 76 },
              },
              {
                statementType: "letStatement",
                name: {
                  value: "address",
                  span: { start: 2484, end: 2491, line: 77 },
                },
                value: {
                  nodeType: "expression",
                  term: {
                    termType: "variable",
                    name: "address",
                    span: { start: 2494, end: 2501, line: 77 },
                  },
                  rest: [
                    { op: "+", term: { termType: "numericLiteral", value: 1 } },
                  ],
                },
                span: { start: 2480, end: 2506, line: 77 },
              },
            ],
          },
          {
            statementType: "returnStatement",
            span: { start: 2525, end: 2532, line: 79 },
          },
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
    neg
    pop local 2
label Main_0
    push local 2
    not
    if-goto Main_1
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
    if-goto Main_3
    push argument 0
    push local 0
    and
    push constant 0
    eq
    not
    not
    if-goto Main_5
    push constant 8000
    push local 1
    add
    push constant 1
    call Memory.poke 2
    pop temp 0
    goto Main_4
label Main_5
    push constant 8000
    push local 1
    add
    push constant 0
    call Memory.poke 2
    pop temp 0
label Main_4
    goto Main_2
label Main_3
    push constant 0
    pop local 2
label Main_2
    goto Main_0
label Main_1
    push constant 0
    return
function Main.nextMask 0
    push argument 0
    push constant 0
    eq
    not
    if-goto Main_7
    push constant 1
    return
    goto Main_6
label Main_7
    push argument 0
    push constant 2
    call Math.multiply 2
    return
label Main_6
function Main.fillMemory 0
label Main_8
    push argument 1
    push constant 0
    gt
    not
    if-goto Main_9
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
    goto Main_8
label Main_9
    push constant 0
    return`;

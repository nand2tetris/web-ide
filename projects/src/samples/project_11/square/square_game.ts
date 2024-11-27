export const jack = `// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/11/Square/SquareGame.jack
/**
 * Implements the Square game.
 * This simple game allows the user to move a black square around
 * the screen, and change the square's size during the movement.
 * When the game starts, a square of 30 by 30 pixels is shown at the
 * top-left corner of the screen. The user controls the square as follows.
 * The 4 arrow keys are used to move the square up, down, left, and right.
 * The 'z' and 'x' keys are used, respectively, to decrement and increment
 * the square's size. The 'q' key is used to quit the game.
 */
class SquareGame {
   field Square square; // the square of this game
   field int direction; // the square's current direction: 
                        // 0=none, 1=up, 2=down, 3=left, 4=right

   /** Constructs a new square game. */
   constructor SquareGame new() {
      // The initial square is located in (0,0), has size 30, and is not moving.
      let square = Square.new(0, 0, 30);
      let direction = 0;
      return this;
   }

   /** Disposes this game. */
   method void dispose() {
      do square.dispose();
      do Memory.deAlloc(this);
      return;
   }

   /** Moves the square in the current direction. */
   method void moveSquare() {
      if (direction = 1) { do square.moveUp(); }
      if (direction = 2) { do square.moveDown(); }
      if (direction = 3) { do square.moveLeft(); }
      if (direction = 4) { do square.moveRight(); }
      do Sys.wait(5);  // delays the next movement
      return;
   }

   /** Runs the game: handles the user's inputs and moves the square accordingly */
   method void run() {
      var char key;  // the key currently pressed by the user
      var boolean exit;
      let exit = false;
      
      while (~exit) {
         // waits for a key to be pressed
         while (key = 0) {
            let key = Keyboard.keyPressed();
            do moveSquare();
         }
         if (key = 81)  { let exit = true; }     // q key
         if (key = 90)  { do square.decSize(); } // z key
         if (key = 88)  { do square.incSize(); } // x key
         if (key = 131) { let direction = 1; }   // up arrow
         if (key = 133) { let direction = 2; }   // down arrow
         if (key = 130) { let direction = 3; }   // left arrow
         if (key = 132) { let direction = 4; }   // right arrow

         // waits for the key to be released
         while (~(key = 0)) {
            let key = Keyboard.keyPressed();
            do moveSquare();
         }
     } // while
     return;
   }
}


`;

export const parsed = {
  name: { value: "SquareGame", span: { start: 712, end: 722, line: 15 } },
  varDecs: [
    {
      varType: "field",
      type: { value: "Square", span: { start: 734, end: 741, line: 16 } },
      names: ["square"],
    },
    {
      varType: "field",
      type: { value: "int", span: { start: 785, end: 789, line: 17 } },
      names: ["direction"],
    },
  ],
  subroutines: [
    {
      type: "constructor",
      returnType: {
        value: "SquareGame",
        span: { start: 957, end: 968, line: 21 },
      },
      name: { value: "new", span: { start: 968, end: 971, line: 21 } },
      parameters: [],
      body: {
        varDecs: [],
        statements: [
          {
            statementType: "letStatement",
            name: {
              value: "square",
              span: { start: 1067, end: 1073, line: 23 },
            },
            value: {
              nodeType: "expression",
              term: {
                termType: "subroutineCall",
                name: {
                  value: "Square.new",
                  span: { start: 1076, end: 1086, line: 23 },
                },
                parameters: [
                  {
                    nodeType: "expression",
                    term: { termType: "numericLiteral", value: 0 },
                    rest: [],
                  },
                  {
                    nodeType: "expression",
                    term: { termType: "numericLiteral", value: 0 },
                    rest: [],
                  },
                  {
                    nodeType: "expression",
                    term: { termType: "numericLiteral", value: 30 },
                    rest: [],
                  },
                ],
                span: { start: 1076, end: 1096, line: 23 },
              },
              rest: [],
            },
            span: { start: 1063, end: 1097, line: 23 },
          },
          {
            statementType: "letStatement",
            name: {
              value: "direction",
              span: { start: 1108, end: 1117, line: 24 },
            },
            value: {
              nodeType: "expression",
              term: { termType: "numericLiteral", value: 0 },
              rest: [],
            },
            span: { start: 1104, end: 1122, line: 24 },
          },
          {
            statementType: "returnStatement",
            value: {
              nodeType: "expression",
              term: { termType: "keywordLiteral", value: "this" },
              rest: [],
            },
            span: { start: 1129, end: 1141, line: 25 },
          },
        ],
      },
    },
    {
      type: "method",
      returnType: { value: "void", span: { start: 1188, end: 1193, line: 29 } },
      name: { value: "dispose", span: { start: 1193, end: 1200, line: 29 } },
      parameters: [],
      body: {
        varDecs: [],
        statements: [
          {
            statementType: "doStatement",
            call: {
              termType: "subroutineCall",
              name: {
                value: "square.dispose",
                span: { start: 1214, end: 1228, line: 30 },
              },
              parameters: [],
              span: { start: 1214, end: 1230, line: 30 },
            },
          },
          {
            statementType: "doStatement",
            call: {
              termType: "subroutineCall",
              name: {
                value: "Memory.deAlloc",
                span: { start: 1241, end: 1255, line: 31 },
              },
              parameters: [
                {
                  nodeType: "expression",
                  term: { termType: "keywordLiteral", value: "this" },
                  rest: [],
                },
              ],
              span: { start: 1241, end: 1261, line: 31 },
            },
          },
          {
            statementType: "returnStatement",
            span: { start: 1269, end: 1276, line: 32 },
          },
        ],
      },
    },
    {
      type: "method",
      returnType: { value: "void", span: { start: 1346, end: 1351, line: 36 } },
      name: { value: "moveSquare", span: { start: 1351, end: 1361, line: 36 } },
      parameters: [],
      body: {
        varDecs: [],
        statements: [
          {
            statementType: "ifStatement",
            condition: {
              nodeType: "expression",
              term: {
                termType: "variable",
                name: "direction",
                span: { start: 1376, end: 1385, line: 37 },
              },
              rest: [
                { op: "=", term: { termType: "numericLiteral", value: 1 } },
              ],
            },
            body: [
              {
                statementType: "doStatement",
                call: {
                  termType: "subroutineCall",
                  name: {
                    value: "square.moveUp",
                    span: { start: 1396, end: 1409, line: 37 },
                  },
                  parameters: [],
                  span: { start: 1396, end: 1411, line: 37 },
                },
              },
            ],
            else: [],
          },
          {
            statementType: "ifStatement",
            condition: {
              nodeType: "expression",
              term: {
                termType: "variable",
                name: "direction",
                span: { start: 1425, end: 1434, line: 38 },
              },
              rest: [
                { op: "=", term: { termType: "numericLiteral", value: 2 } },
              ],
            },
            body: [
              {
                statementType: "doStatement",
                call: {
                  termType: "subroutineCall",
                  name: {
                    value: "square.moveDown",
                    span: { start: 1445, end: 1460, line: 38 },
                  },
                  parameters: [],
                  span: { start: 1445, end: 1462, line: 38 },
                },
              },
            ],
            else: [],
          },
          {
            statementType: "ifStatement",
            condition: {
              nodeType: "expression",
              term: {
                termType: "variable",
                name: "direction",
                span: { start: 1476, end: 1485, line: 39 },
              },
              rest: [
                { op: "=", term: { termType: "numericLiteral", value: 3 } },
              ],
            },
            body: [
              {
                statementType: "doStatement",
                call: {
                  termType: "subroutineCall",
                  name: {
                    value: "square.moveLeft",
                    span: { start: 1496, end: 1511, line: 39 },
                  },
                  parameters: [],
                  span: { start: 1496, end: 1513, line: 39 },
                },
              },
            ],
            else: [],
          },
          {
            statementType: "ifStatement",
            condition: {
              nodeType: "expression",
              term: {
                termType: "variable",
                name: "direction",
                span: { start: 1527, end: 1536, line: 40 },
              },
              rest: [
                { op: "=", term: { termType: "numericLiteral", value: 4 } },
              ],
            },
            body: [
              {
                statementType: "doStatement",
                call: {
                  termType: "subroutineCall",
                  name: {
                    value: "square.moveRight",
                    span: { start: 1547, end: 1563, line: 40 },
                  },
                  parameters: [],
                  span: { start: 1547, end: 1565, line: 40 },
                },
              },
            ],
            else: [],
          },
          {
            statementType: "doStatement",
            call: {
              termType: "subroutineCall",
              name: {
                value: "Sys.wait",
                span: { start: 1578, end: 1586, line: 41 },
              },
              parameters: [
                {
                  nodeType: "expression",
                  term: { termType: "numericLiteral", value: 5 },
                  rest: [],
                },
              ],
              span: { start: 1578, end: 1589, line: 41 },
            },
          },
          {
            statementType: "returnStatement",
            span: { start: 1626, end: 1633, line: 42 },
          },
        ],
      },
    },
    {
      type: "method",
      returnType: { value: "void", span: { start: 1734, end: 1739, line: 46 } },
      name: { value: "run", span: { start: 1739, end: 1742, line: 46 } },
      parameters: [],
      body: {
        varDecs: [
          {
            type: { value: "char", span: { start: 1757, end: 1762, line: 47 } },
            names: ["key"],
          },
          {
            type: {
              value: "boolean",
              span: { start: 1819, end: 1827, line: 48 },
            },
            names: ["exit"],
          },
        ],
        statements: [
          {
            statementType: "letStatement",
            name: { value: "exit", span: { start: 1843, end: 1847, line: 49 } },
            value: {
              nodeType: "expression",
              term: { termType: "keywordLiteral", value: "false" },
              rest: [],
            },
            span: { start: 1839, end: 1856, line: 49 },
          },
          {
            statementType: "whileStatement",
            condition: {
              nodeType: "expression",
              term: {
                termType: "unaryExpression",
                op: "~",
                term: {
                  termType: "variable",
                  name: "exit",
                  span: { start: 1878, end: 1882, line: 51 },
                },
              },
              rest: [],
            },
            body: [
              {
                statementType: "whileStatement",
                condition: {
                  nodeType: "expression",
                  term: {
                    termType: "variable",
                    name: "key",
                    span: { start: 1944, end: 1947, line: 53 },
                  },
                  rest: [
                    { op: "=", term: { termType: "numericLiteral", value: 0 } },
                  ],
                },
                body: [
                  {
                    statementType: "letStatement",
                    name: {
                      value: "key",
                      span: { start: 1971, end: 1974, line: 54 },
                    },
                    value: {
                      nodeType: "expression",
                      term: {
                        termType: "subroutineCall",
                        name: {
                          value: "Keyboard.keyPressed",
                          span: { start: 1977, end: 1996, line: 54 },
                        },
                        parameters: [],
                        span: { start: 1977, end: 1998, line: 54 },
                      },
                      rest: [],
                    },
                    span: { start: 1967, end: 1999, line: 54 },
                  },
                  {
                    statementType: "doStatement",
                    call: {
                      termType: "subroutineCall",
                      name: {
                        value: "moveSquare",
                        span: { start: 2015, end: 2025, line: 55 },
                      },
                      parameters: [],
                      span: { start: 2015, end: 2027, line: 55 },
                    },
                  },
                ],
              },
              {
                statementType: "ifStatement",
                condition: {
                  nodeType: "expression",
                  term: {
                    termType: "variable",
                    name: "key",
                    span: { start: 2053, end: 2056, line: 57 },
                  },
                  rest: [
                    {
                      op: "=",
                      term: { termType: "numericLiteral", value: 81 },
                    },
                  ],
                },
                body: [
                  {
                    statementType: "letStatement",
                    name: {
                      value: "exit",
                      span: { start: 2070, end: 2074, line: 57 },
                    },
                    value: {
                      nodeType: "expression",
                      term: { termType: "keywordLiteral", value: "true" },
                      rest: [],
                    },
                    span: { start: 2066, end: 2082, line: 57 },
                  },
                ],
                else: [],
              },
              {
                statementType: "ifStatement",
                condition: {
                  nodeType: "expression",
                  term: {
                    termType: "variable",
                    name: "key",
                    span: { start: 2111, end: 2114, line: 58 },
                  },
                  rest: [
                    {
                      op: "=",
                      term: { termType: "numericLiteral", value: 90 },
                    },
                  ],
                },
                body: [
                  {
                    statementType: "doStatement",
                    call: {
                      termType: "subroutineCall",
                      name: {
                        value: "square.decSize",
                        span: { start: 2127, end: 2141, line: 58 },
                      },
                      parameters: [],
                      span: { start: 2127, end: 2143, line: 58 },
                    },
                  },
                ],
                else: [],
              },
              {
                statementType: "ifStatement",
                condition: {
                  nodeType: "expression",
                  term: {
                    termType: "variable",
                    name: "key",
                    span: { start: 2169, end: 2172, line: 59 },
                  },
                  rest: [
                    {
                      op: "=",
                      term: { termType: "numericLiteral", value: 88 },
                    },
                  ],
                },
                body: [
                  {
                    statementType: "doStatement",
                    call: {
                      termType: "subroutineCall",
                      name: {
                        value: "square.incSize",
                        span: { start: 2185, end: 2199, line: 59 },
                      },
                      parameters: [],
                      span: { start: 2185, end: 2201, line: 59 },
                    },
                  },
                ],
                else: [],
              },
              {
                statementType: "ifStatement",
                condition: {
                  nodeType: "expression",
                  term: {
                    termType: "variable",
                    name: "key",
                    span: { start: 2227, end: 2230, line: 60 },
                  },
                  rest: [
                    {
                      op: "=",
                      term: { termType: "numericLiteral", value: 131 },
                    },
                  ],
                },
                body: [
                  {
                    statementType: "letStatement",
                    name: {
                      value: "direction",
                      span: { start: 2244, end: 2253, line: 60 },
                    },
                    value: {
                      nodeType: "expression",
                      term: { termType: "numericLiteral", value: 1 },
                      rest: [],
                    },
                    span: { start: 2240, end: 2258, line: 60 },
                  },
                ],
                else: [],
              },
              {
                statementType: "ifStatement",
                condition: {
                  nodeType: "expression",
                  term: {
                    termType: "variable",
                    name: "key",
                    span: { start: 2288, end: 2291, line: 61 },
                  },
                  rest: [
                    {
                      op: "=",
                      term: { termType: "numericLiteral", value: 133 },
                    },
                  ],
                },
                body: [
                  {
                    statementType: "letStatement",
                    name: {
                      value: "direction",
                      span: { start: 2305, end: 2314, line: 61 },
                    },
                    value: {
                      nodeType: "expression",
                      term: { termType: "numericLiteral", value: 2 },
                      rest: [],
                    },
                    span: { start: 2301, end: 2319, line: 61 },
                  },
                ],
                else: [],
              },
              {
                statementType: "ifStatement",
                condition: {
                  nodeType: "expression",
                  term: {
                    termType: "variable",
                    name: "key",
                    span: { start: 2351, end: 2354, line: 62 },
                  },
                  rest: [
                    {
                      op: "=",
                      term: { termType: "numericLiteral", value: 130 },
                    },
                  ],
                },
                body: [
                  {
                    statementType: "letStatement",
                    name: {
                      value: "direction",
                      span: { start: 2368, end: 2377, line: 62 },
                    },
                    value: {
                      nodeType: "expression",
                      term: { termType: "numericLiteral", value: 3 },
                      rest: [],
                    },
                    span: { start: 2364, end: 2382, line: 62 },
                  },
                ],
                else: [],
              },
              {
                statementType: "ifStatement",
                condition: {
                  nodeType: "expression",
                  term: {
                    termType: "variable",
                    name: "key",
                    span: { start: 2414, end: 2417, line: 63 },
                  },
                  rest: [
                    {
                      op: "=",
                      term: { termType: "numericLiteral", value: 132 },
                    },
                  ],
                },
                body: [
                  {
                    statementType: "letStatement",
                    name: {
                      value: "direction",
                      span: { start: 2431, end: 2440, line: 63 },
                    },
                    value: {
                      nodeType: "expression",
                      term: { termType: "numericLiteral", value: 4 },
                      rest: [],
                    },
                    span: { start: 2427, end: 2445, line: 63 },
                  },
                ],
                else: [],
              },
              {
                statementType: "whileStatement",
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
                          name: "key",
                          span: { start: 2529, end: 2532, line: 66 },
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
                    statementType: "letStatement",
                    name: {
                      value: "key",
                      span: { start: 2557, end: 2560, line: 67 },
                    },
                    value: {
                      nodeType: "expression",
                      term: {
                        termType: "subroutineCall",
                        name: {
                          value: "Keyboard.keyPressed",
                          span: { start: 2563, end: 2582, line: 67 },
                        },
                        parameters: [],
                        span: { start: 2563, end: 2584, line: 67 },
                      },
                      rest: [],
                    },
                    span: { start: 2553, end: 2585, line: 67 },
                  },
                  {
                    statementType: "doStatement",
                    call: {
                      termType: "subroutineCall",
                      name: {
                        value: "moveSquare",
                        span: { start: 2601, end: 2611, line: 68 },
                      },
                      parameters: [],
                      span: { start: 2601, end: 2613, line: 68 },
                    },
                  },
                ],
              },
            ],
          },
          {
            statementType: "returnStatement",
            span: { start: 2647, end: 2654, line: 71 },
          },
        ],
      },
    },
  ],
};

export const compiled = `function SquareGame.new 0
    push constant 2
    call Memory.alloc 1
    pop pointer 0
    push constant 0
    push constant 0
    push constant 30
    call Square.new 3
    pop this 0
    push constant 0
    pop this 1
    push pointer 0
    return
function SquareGame.dispose 0
    push argument 0
    pop pointer 0
    push this 0
    call Square.dispose 1
    pop temp 0
    push pointer 0
    call Memory.deAlloc 1
    pop temp 0
    push constant 0
    return
function SquareGame.moveSquare 0
    push argument 0
    pop pointer 0
    push this 1
    push constant 1
    eq
    not
    if-goto SquareGame_1
    push this 0
    call Square.moveUp 1
    pop temp 0
    goto SquareGame_0
label SquareGame_1
label SquareGame_0
    push this 1
    push constant 2
    eq
    not
    if-goto SquareGame_3
    push this 0
    call Square.moveDown 1
    pop temp 0
    goto SquareGame_2
label SquareGame_3
label SquareGame_2
    push this 1
    push constant 3
    eq
    not
    if-goto SquareGame_5
    push this 0
    call Square.moveLeft 1
    pop temp 0
    goto SquareGame_4
label SquareGame_5
label SquareGame_4
    push this 1
    push constant 4
    eq
    not
    if-goto SquareGame_7
    push this 0
    call Square.moveRight 1
    pop temp 0
    goto SquareGame_6
label SquareGame_7
label SquareGame_6
    push constant 5
    call Sys.wait 1
    pop temp 0
    push constant 0
    return
function SquareGame.run 2
    push argument 0
    pop pointer 0
    push constant 0
    pop local 1
label SquareGame_8
    push local 1
    not
    not
    if-goto SquareGame_9
label SquareGame_10
    push local 0
    push constant 0
    eq
    not
    if-goto SquareGame_11
    call Keyboard.keyPressed 0
    pop local 0
    push pointer 0
    call SquareGame.moveSquare 1
    pop temp 0
    goto SquareGame_10
label SquareGame_11
    push local 0
    push constant 81
    eq
    not
    if-goto SquareGame_13
    push constant 1
    neg
    pop local 1
    goto SquareGame_12
label SquareGame_13
label SquareGame_12
    push local 0
    push constant 90
    eq
    not
    if-goto SquareGame_15
    push this 0
    call Square.decSize 1
    pop temp 0
    goto SquareGame_14
label SquareGame_15
label SquareGame_14
    push local 0
    push constant 88
    eq
    not
    if-goto SquareGame_17
    push this 0
    call Square.incSize 1
    pop temp 0
    goto SquareGame_16
label SquareGame_17
label SquareGame_16
    push local 0
    push constant 131
    eq
    not
    if-goto SquareGame_19
    push constant 1
    pop this 1
    goto SquareGame_18
label SquareGame_19
label SquareGame_18
    push local 0
    push constant 133
    eq
    not
    if-goto SquareGame_21
    push constant 2
    pop this 1
    goto SquareGame_20
label SquareGame_21
label SquareGame_20
    push local 0
    push constant 130
    eq
    not
    if-goto SquareGame_23
    push constant 3
    pop this 1
    goto SquareGame_22
label SquareGame_23
label SquareGame_22
    push local 0
    push constant 132
    eq
    not
    if-goto SquareGame_25
    push constant 4
    pop this 1
    goto SquareGame_24
label SquareGame_25
label SquareGame_24
label SquareGame_26
    push local 0
    push constant 0
    eq
    not
    not
    if-goto SquareGame_27
    call Keyboard.keyPressed 0
    pop local 0
    push pointer 0
    call SquareGame.moveSquare 1
    pop temp 0
    goto SquareGame_26
label SquareGame_27
    goto SquareGame_8
label SquareGame_9
    push constant 0
    return`;

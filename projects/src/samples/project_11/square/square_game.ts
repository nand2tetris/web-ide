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
  name: "SquareGame",
  varDecs: [
    { varType: "field", type: "Square", names: ["square"] },
    { varType: "field", type: "int", names: ["direction"] },
  ],
  subroutines: [
    {
      type: "constructor",
      returnType: "SquareGame",
      name: "new",
      parameters: [],
      body: {
        varDecs: [],
        statements: [
          {
            statementType: "letStatement",
            name: "square",
            value: {
              nodeType: "expression",
              term: {
                termType: "subroutineCall",
                name: "Square.new",
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
              },
              rest: [],
            },
          },
          {
            statementType: "letStatement",
            name: "direction",
            value: {
              nodeType: "expression",
              term: { termType: "numericLiteral", value: 0 },
              rest: [],
            },
          },
          {
            statementType: "returnStatement",
            value: {
              nodeType: "expression",
              term: { termType: "keywordLiteral", value: "this" },
              rest: [],
            },
          },
        ],
      },
    },
    {
      type: "method",
      returnType: "void",
      name: "dispose",
      parameters: [],
      body: {
        varDecs: [],
        statements: [
          {
            statementType: "doStatement",
            call: {
              termType: "subroutineCall",
              name: "square.dispose",
              parameters: [],
            },
          },
          {
            statementType: "doStatement",
            call: {
              termType: "subroutineCall",
              name: "Memory.deAlloc",
              parameters: [
                {
                  nodeType: "expression",
                  term: { termType: "keywordLiteral", value: "this" },
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
      type: "method",
      returnType: "void",
      name: "moveSquare",
      parameters: [],
      body: {
        varDecs: [],
        statements: [
          {
            statementType: "ifStatement",
            condition: {
              nodeType: "expression",
              term: { termType: "variable", name: "direction" },
              rest: [
                { op: "=", term: { termType: "numericLiteral", value: 1 } },
              ],
            },
            body: [
              {
                statementType: "doStatement",
                call: {
                  termType: "subroutineCall",
                  name: "square.moveUp",
                  parameters: [],
                },
              },
            ],
            else: [],
          },
          {
            statementType: "ifStatement",
            condition: {
              nodeType: "expression",
              term: { termType: "variable", name: "direction" },
              rest: [
                { op: "=", term: { termType: "numericLiteral", value: 2 } },
              ],
            },
            body: [
              {
                statementType: "doStatement",
                call: {
                  termType: "subroutineCall",
                  name: "square.moveDown",
                  parameters: [],
                },
              },
            ],
            else: [],
          },
          {
            statementType: "ifStatement",
            condition: {
              nodeType: "expression",
              term: { termType: "variable", name: "direction" },
              rest: [
                { op: "=", term: { termType: "numericLiteral", value: 3 } },
              ],
            },
            body: [
              {
                statementType: "doStatement",
                call: {
                  termType: "subroutineCall",
                  name: "square.moveLeft",
                  parameters: [],
                },
              },
            ],
            else: [],
          },
          {
            statementType: "ifStatement",
            condition: {
              nodeType: "expression",
              term: { termType: "variable", name: "direction" },
              rest: [
                { op: "=", term: { termType: "numericLiteral", value: 4 } },
              ],
            },
            body: [
              {
                statementType: "doStatement",
                call: {
                  termType: "subroutineCall",
                  name: "square.moveRight",
                  parameters: [],
                },
              },
            ],
            else: [],
          },
          {
            statementType: "doStatement",
            call: {
              termType: "subroutineCall",
              name: "Sys.wait",
              parameters: [
                {
                  nodeType: "expression",
                  term: { termType: "numericLiteral", value: 5 },
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
      type: "method",
      returnType: "void",
      name: "run",
      parameters: [],
      body: {
        varDecs: [
          { type: "char", names: ["key"] },
          { type: "boolean", names: ["exit"] },
        ],
        statements: [
          {
            statementType: "letStatement",
            name: "exit",
            value: {
              nodeType: "expression",
              term: { termType: "keywordLiteral", value: "false" },
              rest: [],
            },
          },
          {
            statementType: "whileStatement",
            condition: {
              nodeType: "expression",
              term: {
                termType: "unaryExpression",
                op: "~",
                term: { termType: "variable", name: "exit" },
              },
              rest: [],
            },
            body: [
              {
                statementType: "whileStatement",
                condition: {
                  nodeType: "expression",
                  term: { termType: "variable", name: "key" },
                  rest: [
                    {
                      op: "=",
                      term: { termType: "numericLiteral", value: 0 },
                    },
                  ],
                },
                body: [
                  {
                    statementType: "letStatement",
                    name: "key",
                    value: {
                      nodeType: "expression",
                      term: {
                        termType: "subroutineCall",
                        name: "Keyboard.keyPressed",
                        parameters: [],
                      },
                      rest: [],
                    },
                  },
                  {
                    statementType: "doStatement",
                    call: {
                      termType: "subroutineCall",
                      name: "moveSquare",
                      parameters: [],
                    },
                  },
                ],
              },
              {
                statementType: "ifStatement",
                condition: {
                  nodeType: "expression",
                  term: { termType: "variable", name: "key" },
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
                    name: "exit",
                    value: {
                      nodeType: "expression",
                      term: { termType: "keywordLiteral", value: "true" },
                      rest: [],
                    },
                  },
                ],
                else: [],
              },
              {
                statementType: "ifStatement",
                condition: {
                  nodeType: "expression",
                  term: { termType: "variable", name: "key" },
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
                      name: "square.decSize",
                      parameters: [],
                    },
                  },
                ],
                else: [],
              },
              {
                statementType: "ifStatement",
                condition: {
                  nodeType: "expression",
                  term: { termType: "variable", name: "key" },
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
                      name: "square.incSize",
                      parameters: [],
                    },
                  },
                ],
                else: [],
              },
              {
                statementType: "ifStatement",
                condition: {
                  nodeType: "expression",
                  term: { termType: "variable", name: "key" },
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
                    name: "direction",
                    value: {
                      nodeType: "expression",
                      term: { termType: "numericLiteral", value: 1 },
                      rest: [],
                    },
                  },
                ],
                else: [],
              },
              {
                statementType: "ifStatement",
                condition: {
                  nodeType: "expression",
                  term: { termType: "variable", name: "key" },
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
                    name: "direction",
                    value: {
                      nodeType: "expression",
                      term: { termType: "numericLiteral", value: 2 },
                      rest: [],
                    },
                  },
                ],
                else: [],
              },
              {
                statementType: "ifStatement",
                condition: {
                  nodeType: "expression",
                  term: { termType: "variable", name: "key" },
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
                    name: "direction",
                    value: {
                      nodeType: "expression",
                      term: { termType: "numericLiteral", value: 3 },
                      rest: [],
                    },
                  },
                ],
                else: [],
              },
              {
                statementType: "ifStatement",
                condition: {
                  nodeType: "expression",
                  term: { termType: "variable", name: "key" },
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
                    name: "direction",
                    value: {
                      nodeType: "expression",
                      term: { termType: "numericLiteral", value: 4 },
                      rest: [],
                    },
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
                        term: { termType: "variable", name: "key" },
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
                    name: "key",
                    value: {
                      nodeType: "expression",
                      term: {
                        termType: "subroutineCall",
                        name: "Keyboard.keyPressed",
                        parameters: [],
                      },
                      rest: [],
                    },
                  },
                  {
                    statementType: "doStatement",
                    call: {
                      termType: "subroutineCall",
                      name: "moveSquare",
                      parameters: [],
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
if-goto L1
push this 0
call Square.moveUp 1
pop temp 0
goto L0
label L1
label L0
push this 1
push constant 2
eq
not
if-goto L3
push this 0
call Square.moveDown 1
pop temp 0
goto L2
label L3
label L2
push this 1
push constant 3
eq
not
if-goto L5
push this 0
call Square.moveLeft 1
pop temp 0
goto L4
label L5
label L4
push this 1
push constant 4
eq
not
if-goto L7
push this 0
call Square.moveRight 1
pop temp 0
goto L6
label L7
label L6
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
label L8
push local 1
not
not
if-goto L9
label L10
push local 0
push constant 0
eq
not
if-goto L11
call Keyboard.keyPressed 0
pop local 0
push pointer 0
call SquareGame.moveSquare 1
pop temp 0
goto L10
label L11
push local 0
push constant 81
eq
not
if-goto L13
push constant 1
pop local 1
goto L12
label L13
label L12
push local 0
push constant 90
eq
not
if-goto L15
push this 0
call Square.decSize 1
pop temp 0
goto L14
label L15
label L14
push local 0
push constant 88
eq
not
if-goto L17
push this 0
call Square.incSize 1
pop temp 0
goto L16
label L17
label L16
push local 0
push constant 131
eq
not
if-goto L19
push constant 1
pop this 1
goto L18
label L19
label L18
push local 0
push constant 133
eq
not
if-goto L21
push constant 2
pop this 1
goto L20
label L21
label L20
push local 0
push constant 130
eq
not
if-goto L23
push constant 3
pop this 1
goto L22
label L23
label L22
push local 0
push constant 132
eq
not
if-goto L25
push constant 4
pop this 1
goto L24
label L25
label L24
label L26
push local 0
push constant 0
eq
not
not
if-goto L27
call Keyboard.keyPressed 0
pop local 0
push pointer 0
call SquareGame.moveSquare 1
pop temp 0
goto L26
label L27
goto L8
label L9
push constant 0
return`;

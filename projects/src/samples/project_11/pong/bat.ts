export const jack = `// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/11/Pong/Bat.jack
// (Same as projects/9/Pong/Bat.jack)
/**
 * A graphical bat in a Pong game. 
 * Displayed as a filled horizontal rectangle that has a screen location,
 * a width and a height.
 * Has methods for drawing, erasing, moving left and right, and changing 
 * its width (to make the hitting action more challenging).
 * This class should have been called "Paddle", following the 
 * standard Pong terminology. Unaware of this terminology,
 * we called it "bat", and the name stuck. 
 */
class Bat {

    field int x, y;           // the bat's screen location
    field int width, height;  // the bat's width and height
    field int direction;      // direction of the bat's movement
                              //  (1 = left, 2 = right)

    /** Constructs a new bat with the given location and width. */
    constructor Bat new(int Ax, int Ay, int Awidth, int Aheight) {
        let x = Ax;
        let y = Ay;
        let width = Awidth;
        let height = Aheight;
        let direction = 2;
        do show();
        return this;
    }

    /** Deallocates the object's memory. */
    method void dispose() {
        do Memory.deAlloc(this);
        return;
    }

    /** Shows the bat. */
    method void show() {
        do Screen.setColor(true);
        do draw();
        return;
    }

    /** Hides the bat. */
    method void hide() {
        do Screen.setColor(false);
        do draw();
        return;
    }

    /** Draws the bat. */
    method void draw() {
        do Screen.drawRectangle(x, y, x + width, y + height);
        return;
    }

    /** Sets the bat's direction (0=stop, 1=left, 2=right). */
    method void setDirection(int Adirection) {
        let direction = Adirection;
        return;
    }

    /** Returns the bat's left edge. */
    method int getLeft() {
        return x;
    }

    /** Returns the bat's right edge. */
    method int getRight() {
        return x + width;
    }

    /** Sets the bat's width. */
    method void setWidth(int Awidth) {
        do hide();
        let width = Awidth;
        do show();
        return;
    }

    /** Moves the bat one step in the bat's direction. */
    method void move() {
      if (direction = 1) {
            let x = x - 4;
            if (x < 0) { let x = 0; }
            do Screen.setColor(false);
            do Screen.drawRectangle((x + width) + 1, y, (x + width) + 4, y + height);
            do Screen.setColor(true);
            do Screen.drawRectangle(x, y, x + 3, y + height);
        }
        else {
            let x = x + 4;
            if ((x + width) > 511) { let x = 511 - width; }
            do Screen.setColor(false);
            do Screen.drawRectangle(x - 4, y, x - 1, y + height);
            do Screen.setColor(true);
            do Screen.drawRectangle((x + width) - 3, y, x + width, y + height);
        }
        return;
    }
}`;

export const parsed = {
  name: "Bat",
  varDecs: [
    { varType: "field", type: "int", names: ["x", "y"] },
    { varType: "field", type: "int", names: ["width", "height"] },
    { varType: "field", type: "int", names: ["direction"] },
  ],
  subroutines: [
    {
      type: "constructor",
      returnType: "Bat",
      name: "new",
      parameters: [
        { type: "int", name: "Ax" },
        { type: "int", name: "Ay" },
        { type: "int", name: "Awidth" },
        { type: "int", name: "Aheight" },
      ],
      body: {
        varDecs: [],
        statements: [
          {
            statementType: "letStatement",
            name: "x",
            value: {
              nodeType: "expression",
              term: { termType: "variable", name: "Ax" },
              rest: [],
            },
          },
          {
            statementType: "letStatement",
            name: "y",
            value: {
              nodeType: "expression",
              term: { termType: "variable", name: "Ay" },
              rest: [],
            },
          },
          {
            statementType: "letStatement",
            name: "width",
            value: {
              nodeType: "expression",
              term: { termType: "variable", name: "Awidth" },
              rest: [],
            },
          },
          {
            statementType: "letStatement",
            name: "height",
            value: {
              nodeType: "expression",
              term: { termType: "variable", name: "Aheight" },
              rest: [],
            },
          },
          {
            statementType: "letStatement",
            name: "direction",
            value: {
              nodeType: "expression",
              term: { termType: "numericLiteral", value: 2 },
              rest: [],
            },
          },
          {
            statementType: "doStatement",
            call: {
              termType: "subroutineCall",
              name: "show",
              parameters: [],
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
      name: "show",
      parameters: [],
      body: {
        varDecs: [],
        statements: [
          {
            statementType: "doStatement",
            call: {
              termType: "subroutineCall",
              name: "Screen.setColor",
              parameters: [
                {
                  nodeType: "expression",
                  term: { termType: "keywordLiteral", value: "true" },
                  rest: [],
                },
              ],
            },
          },
          {
            statementType: "doStatement",
            call: {
              termType: "subroutineCall",
              name: "draw",
              parameters: [],
            },
          },
          { statementType: "returnStatement" },
        ],
      },
    },
    {
      type: "method",
      returnType: "void",
      name: "hide",
      parameters: [],
      body: {
        varDecs: [],
        statements: [
          {
            statementType: "doStatement",
            call: {
              termType: "subroutineCall",
              name: "Screen.setColor",
              parameters: [
                {
                  nodeType: "expression",
                  term: { termType: "keywordLiteral", value: "false" },
                  rest: [],
                },
              ],
            },
          },
          {
            statementType: "doStatement",
            call: {
              termType: "subroutineCall",
              name: "draw",
              parameters: [],
            },
          },
          { statementType: "returnStatement" },
        ],
      },
    },
    {
      type: "method",
      returnType: "void",
      name: "draw",
      parameters: [],
      body: {
        varDecs: [],
        statements: [
          {
            statementType: "doStatement",
            call: {
              termType: "subroutineCall",
              name: "Screen.drawRectangle",
              parameters: [
                {
                  nodeType: "expression",
                  term: { termType: "variable", name: "x" },
                  rest: [],
                },
                {
                  nodeType: "expression",
                  term: { termType: "variable", name: "y" },
                  rest: [],
                },
                {
                  nodeType: "expression",
                  term: { termType: "variable", name: "x" },
                  rest: [
                    {
                      op: "+",
                      term: { termType: "variable", name: "width" },
                    },
                  ],
                },
                {
                  nodeType: "expression",
                  term: { termType: "variable", name: "y" },
                  rest: [
                    {
                      op: "+",
                      term: { termType: "variable", name: "height" },
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
    {
      type: "method",
      returnType: "void",
      name: "setDirection",
      parameters: [{ type: "int", name: "Adirection" }],
      body: {
        varDecs: [],
        statements: [
          {
            statementType: "letStatement",
            name: "direction",
            value: {
              nodeType: "expression",
              term: { termType: "variable", name: "Adirection" },
              rest: [],
            },
          },
          { statementType: "returnStatement" },
        ],
      },
    },
    {
      type: "method",
      returnType: "int",
      name: "getLeft",
      parameters: [],
      body: {
        varDecs: [],
        statements: [
          {
            statementType: "returnStatement",
            value: {
              nodeType: "expression",
              term: { termType: "variable", name: "x" },
              rest: [],
            },
          },
        ],
      },
    },
    {
      type: "method",
      returnType: "int",
      name: "getRight",
      parameters: [],
      body: {
        varDecs: [],
        statements: [
          {
            statementType: "returnStatement",
            value: {
              nodeType: "expression",
              term: { termType: "variable", name: "x" },
              rest: [
                { op: "+", term: { termType: "variable", name: "width" } },
              ],
            },
          },
        ],
      },
    },
    {
      type: "method",
      returnType: "void",
      name: "setWidth",
      parameters: [{ type: "int", name: "Awidth" }],
      body: {
        varDecs: [],
        statements: [
          {
            statementType: "doStatement",
            call: {
              termType: "subroutineCall",
              name: "hide",
              parameters: [],
            },
          },
          {
            statementType: "letStatement",
            name: "width",
            value: {
              nodeType: "expression",
              term: { termType: "variable", name: "Awidth" },
              rest: [],
            },
          },
          {
            statementType: "doStatement",
            call: {
              termType: "subroutineCall",
              name: "show",
              parameters: [],
            },
          },
          { statementType: "returnStatement" },
        ],
      },
    },
    {
      type: "method",
      returnType: "void",
      name: "move",
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
                statementType: "letStatement",
                name: "x",
                value: {
                  nodeType: "expression",
                  term: { termType: "variable", name: "x" },
                  rest: [
                    {
                      op: "-",
                      term: { termType: "numericLiteral", value: 4 },
                    },
                  ],
                },
              },
              {
                statementType: "ifStatement",
                condition: {
                  nodeType: "expression",
                  term: { termType: "variable", name: "x" },
                  rest: [
                    {
                      op: "<",
                      term: { termType: "numericLiteral", value: 0 },
                    },
                  ],
                },
                body: [
                  {
                    statementType: "letStatement",
                    name: "x",
                    value: {
                      nodeType: "expression",
                      term: { termType: "numericLiteral", value: 0 },
                      rest: [],
                    },
                  },
                ],
                else: [],
              },
              {
                statementType: "doStatement",
                call: {
                  termType: "subroutineCall",
                  name: "Screen.setColor",
                  parameters: [
                    {
                      nodeType: "expression",
                      term: { termType: "keywordLiteral", value: "false" },
                      rest: [],
                    },
                  ],
                },
              },
              {
                statementType: "doStatement",
                call: {
                  termType: "subroutineCall",
                  name: "Screen.drawRectangle",
                  parameters: [
                    {
                      nodeType: "expression",
                      term: {
                        termType: "groupedExpression",
                        expression: {
                          nodeType: "expression",
                          term: { termType: "variable", name: "x" },
                          rest: [
                            {
                              op: "+",
                              term: { termType: "variable", name: "width" },
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
                    {
                      nodeType: "expression",
                      term: { termType: "variable", name: "y" },
                      rest: [],
                    },
                    {
                      nodeType: "expression",
                      term: {
                        termType: "groupedExpression",
                        expression: {
                          nodeType: "expression",
                          term: { termType: "variable", name: "x" },
                          rest: [
                            {
                              op: "+",
                              term: { termType: "variable", name: "width" },
                            },
                          ],
                        },
                      },
                      rest: [
                        {
                          op: "+",
                          term: { termType: "numericLiteral", value: 4 },
                        },
                      ],
                    },
                    {
                      nodeType: "expression",
                      term: { termType: "variable", name: "y" },
                      rest: [
                        {
                          op: "+",
                          term: { termType: "variable", name: "height" },
                        },
                      ],
                    },
                  ],
                },
              },
              {
                statementType: "doStatement",
                call: {
                  termType: "subroutineCall",
                  name: "Screen.setColor",
                  parameters: [
                    {
                      nodeType: "expression",
                      term: { termType: "keywordLiteral", value: "true" },
                      rest: [],
                    },
                  ],
                },
              },
              {
                statementType: "doStatement",
                call: {
                  termType: "subroutineCall",
                  name: "Screen.drawRectangle",
                  parameters: [
                    {
                      nodeType: "expression",
                      term: { termType: "variable", name: "x" },
                      rest: [],
                    },
                    {
                      nodeType: "expression",
                      term: { termType: "variable", name: "y" },
                      rest: [],
                    },
                    {
                      nodeType: "expression",
                      term: { termType: "variable", name: "x" },
                      rest: [
                        {
                          op: "+",
                          term: { termType: "numericLiteral", value: 3 },
                        },
                      ],
                    },
                    {
                      nodeType: "expression",
                      term: { termType: "variable", name: "y" },
                      rest: [
                        {
                          op: "+",
                          term: { termType: "variable", name: "height" },
                        },
                      ],
                    },
                  ],
                },
              },
            ],
            else: [
              {
                statementType: "letStatement",
                name: "x",
                value: {
                  nodeType: "expression",
                  term: { termType: "variable", name: "x" },
                  rest: [
                    {
                      op: "+",
                      term: { termType: "numericLiteral", value: 4 },
                    },
                  ],
                },
              },
              {
                statementType: "ifStatement",
                condition: {
                  nodeType: "expression",
                  term: {
                    termType: "groupedExpression",
                    expression: {
                      nodeType: "expression",
                      term: { termType: "variable", name: "x" },
                      rest: [
                        {
                          op: "+",
                          term: { termType: "variable", name: "width" },
                        },
                      ],
                    },
                  },
                  rest: [
                    {
                      op: ">",
                      term: { termType: "numericLiteral", value: 511 },
                    },
                  ],
                },
                body: [
                  {
                    statementType: "letStatement",
                    name: "x",
                    value: {
                      nodeType: "expression",
                      term: { termType: "numericLiteral", value: 511 },
                      rest: [
                        {
                          op: "-",
                          term: { termType: "variable", name: "width" },
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
                  name: "Screen.setColor",
                  parameters: [
                    {
                      nodeType: "expression",
                      term: { termType: "keywordLiteral", value: "false" },
                      rest: [],
                    },
                  ],
                },
              },
              {
                statementType: "doStatement",
                call: {
                  termType: "subroutineCall",
                  name: "Screen.drawRectangle",
                  parameters: [
                    {
                      nodeType: "expression",
                      term: { termType: "variable", name: "x" },
                      rest: [
                        {
                          op: "-",
                          term: { termType: "numericLiteral", value: 4 },
                        },
                      ],
                    },
                    {
                      nodeType: "expression",
                      term: { termType: "variable", name: "y" },
                      rest: [],
                    },
                    {
                      nodeType: "expression",
                      term: { termType: "variable", name: "x" },
                      rest: [
                        {
                          op: "-",
                          term: { termType: "numericLiteral", value: 1 },
                        },
                      ],
                    },
                    {
                      nodeType: "expression",
                      term: { termType: "variable", name: "y" },
                      rest: [
                        {
                          op: "+",
                          term: { termType: "variable", name: "height" },
                        },
                      ],
                    },
                  ],
                },
              },
              {
                statementType: "doStatement",
                call: {
                  termType: "subroutineCall",
                  name: "Screen.setColor",
                  parameters: [
                    {
                      nodeType: "expression",
                      term: { termType: "keywordLiteral", value: "true" },
                      rest: [],
                    },
                  ],
                },
              },
              {
                statementType: "doStatement",
                call: {
                  termType: "subroutineCall",
                  name: "Screen.drawRectangle",
                  parameters: [
                    {
                      nodeType: "expression",
                      term: {
                        termType: "groupedExpression",
                        expression: {
                          nodeType: "expression",
                          term: { termType: "variable", name: "x" },
                          rest: [
                            {
                              op: "+",
                              term: { termType: "variable", name: "width" },
                            },
                          ],
                        },
                      },
                      rest: [
                        {
                          op: "-",
                          term: { termType: "numericLiteral", value: 3 },
                        },
                      ],
                    },
                    {
                      nodeType: "expression",
                      term: { termType: "variable", name: "y" },
                      rest: [],
                    },
                    {
                      nodeType: "expression",
                      term: { termType: "variable", name: "x" },
                      rest: [
                        {
                          op: "+",
                          term: { termType: "variable", name: "width" },
                        },
                      ],
                    },
                    {
                      nodeType: "expression",
                      term: { termType: "variable", name: "y" },
                      rest: [
                        {
                          op: "+",
                          term: { termType: "variable", name: "height" },
                        },
                      ],
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

export const compiled = `function Bat.new 0
push constant 5
call Memory.alloc 1
pop pointer 0
push argument 0
pop this 0
push argument 1
pop this 1
push argument 2
pop this 2
push argument 3
pop this 3
push constant 2
pop this 4
push pointer 0
call Bat.show 1
pop temp 0
push pointer 0
return
function Bat.dispose 0
push argument 0
pop pointer 0
push pointer 0
call Memory.deAlloc 1
pop temp 0
push constant 0
return
function Bat.show 0
push argument 0
pop pointer 0
push constant 1
call Screen.setColor 1
pop temp 0
push pointer 0
call Bat.draw 1
pop temp 0
push constant 0
return
function Bat.hide 0
push argument 0
pop pointer 0
push constant 0
call Screen.setColor 1
pop temp 0
push pointer 0
call Bat.draw 1
pop temp 0
push constant 0
return
function Bat.draw 0
push argument 0
pop pointer 0
push this 0
push this 1
push this 0
push this 2
add
push this 1
push this 3
add
call Screen.drawRectangle 4
pop temp 0
push constant 0
return
function Bat.setDirection 0
push argument 0
pop pointer 0
push argument 1
pop this 4
push constant 0
return
function Bat.getLeft 0
push argument 0
pop pointer 0
push this 0
return
function Bat.getRight 0
push argument 0
pop pointer 0
push this 0
push this 2
add
return
function Bat.setWidth 0
push argument 0
pop pointer 0
push pointer 0
call Bat.hide 1
pop temp 0
push argument 1
pop this 2
push pointer 0
call Bat.show 1
pop temp 0
push constant 0
return
function Bat.move 0
push argument 0
pop pointer 0
push this 4
push constant 1
eq
not
if-goto L1
push this 0
push constant 4
sub
pop this 0
push this 0
push constant 0
lt
not
if-goto L3
push constant 0
pop this 0
goto L2
label L3
label L2
push constant 0
call Screen.setColor 1
pop temp 0
push this 0
push this 2
add
push constant 1
add
push this 1
push this 0
push this 2
add
push constant 4
add
push this 1
push this 3
add
call Screen.drawRectangle 4
pop temp 0
push constant 1
call Screen.setColor 1
pop temp 0
push this 0
push this 1
push this 0
push constant 3
add
push this 1
push this 3
add
call Screen.drawRectangle 4
pop temp 0
goto L0
label L1
push this 0
push constant 4
add
pop this 0
push this 0
push this 2
add
push constant 511
gt
not
if-goto L5
push constant 511
push this 2
sub
pop this 0
goto L4
label L5
label L4
push constant 0
call Screen.setColor 1
pop temp 0
push this 0
push constant 4
sub
push this 1
push this 0
push constant 1
sub
push this 1
push this 3
add
call Screen.drawRectangle 4
pop temp 0
push constant 1
call Screen.setColor 1
pop temp 0
push this 0
push this 2
add
push constant 3
sub
push this 1
push this 0
push this 2
add
push this 1
push this 3
add
call Screen.drawRectangle 4
pop temp 0
label L0
push constant 0
return`;

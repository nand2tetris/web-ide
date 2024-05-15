export const jack = `// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/11/Square/Square.jack

/** Implements a graphical square.
    The square has top-left x and y coordinates, and a size. */
class Square {

   field int x, y; // screen location of the top-left corner of this square
   field int size; // length of this square, in pixels

   /** Constructs and draws a new square with a given location and size. */
   constructor Square new(int ax, int ay, int asize) {
      let x = ax;
      let y = ay;
      let size = asize;
      do draw();
      return this;
   }

   /** Disposes this square. */
   method void dispose() {
      do Memory.deAlloc(this);
      return;
   }

   /** Draws this square in its current (x,y) location */
   method void draw() {
      // Draws the square using the color black
      do Screen.setColor(true);
      do Screen.drawRectangle(x, y, x + size, y + size);
      return;
   }

   /** Erases this square. */
   method void erase() {
      // Draws the square using the color white (background color)
      do Screen.setColor(false);
      do Screen.drawRectangle(x, y, x + size, y + size);
      return;
   }

    /** Increments the square size by 2 pixels (if possible). */
   method void incSize() {
      if (((y + size) < 254) & ((x + size) < 510)) {
         do erase();
         let size = size + 2;
         do draw();
      }
      return;
   }

   /** Decrements the square size by 2 pixels (if possible). */
   method void decSize() {
      if (size > 2) {
         do erase();
         let size = size - 2;
         do draw();
      }
      return;
   }

   /** Moves this square up by 2 pixels (if possible). */
   method void moveUp() {
      if (y > 1) {
         // Erases the bottom two rows of this square in its current location
         do Screen.setColor(false);
         do Screen.drawRectangle(x, (y + size) - 1, x + size, y + size);
         let y = y - 2;
         // Draws the top two rows of this square in its new location
         do Screen.setColor(true);
         do Screen.drawRectangle(x, y, x + size, y + 1);
      }
      return;
   }

   /** Moves the square down by 2 pixels (if possible). */
   method void moveDown() {
      if ((y + size) < 254) {
         do Screen.setColor(false);
         do Screen.drawRectangle(x, y, x + size, y + 1);
         let y = y + 2;
         do Screen.setColor(true);
         do Screen.drawRectangle(x, (y + size) - 1, x + size, y + size);
      }
      return;
   }

   /** Moves the square left by 2 pixels (if possible). */
   method void moveLeft() {
      if (x > 1) {
         do Screen.setColor(false);
         do Screen.drawRectangle((x + size) - 1, y, x + size, y + size);
         let x = x - 2;
         do Screen.setColor(true);
         do Screen.drawRectangle(x, y, x + 1, y + size);
      }
      return;
   }

   /** Moves the square right by 2 pixels (if possible). */
   method void moveRight() {
      if ((x + size) < 510) {
         do Screen.setColor(false);
         do Screen.drawRectangle(x, y, x + 1, y + size);
         let x = x + 2;
         do Screen.setColor(true);
         do Screen.drawRectangle((x + size) - 1, y, x + size, y + size);
      }
      return;
   }
}`;

export const parsed = {
  name: "Square",
  varDecs: [
    { varType: "field", type: "int", names: ["x", "y"] },
    { varType: "field", type: "int", names: ["size"] },
  ],
  subroutines: [
    {
      type: "constructor",
      returnType: "Square",
      name: "new",
      parameters: [
        { type: "int", name: "ax" },
        { type: "int", name: "ay" },
        { type: "int", name: "asize" },
      ],
      body: {
        varDecs: [],
        statements: [
          {
            statementType: "letStatement",
            name: "x",
            value: {
              nodeType: "expression",
              term: { termType: "variable", name: "ax" },
              rest: [],
            },
          },
          {
            statementType: "letStatement",
            name: "y",
            value: {
              nodeType: "expression",
              term: { termType: "variable", name: "ay" },
              rest: [],
            },
          },
          {
            statementType: "letStatement",
            name: "size",
            value: {
              nodeType: "expression",
              term: { termType: "variable", name: "asize" },
              rest: [],
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
      name: "draw",
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
                    { op: "+", term: { termType: "variable", name: "size" } },
                  ],
                },
                {
                  nodeType: "expression",
                  term: { termType: "variable", name: "y" },
                  rest: [
                    { op: "+", term: { termType: "variable", name: "size" } },
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
      name: "erase",
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
                    { op: "+", term: { termType: "variable", name: "size" } },
                  ],
                },
                {
                  nodeType: "expression",
                  term: { termType: "variable", name: "y" },
                  rest: [
                    { op: "+", term: { termType: "variable", name: "size" } },
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
      name: "incSize",
      parameters: [],
      body: {
        varDecs: [],
        statements: [
          {
            statementType: "ifStatement",
            condition: {
              nodeType: "expression",
              term: {
                termType: "groupedExpression",
                expression: {
                  nodeType: "expression",
                  term: {
                    termType: "groupedExpression",
                    expression: {
                      nodeType: "expression",
                      term: { termType: "variable", name: "y" },
                      rest: [
                        {
                          op: "+",
                          term: { termType: "variable", name: "size" },
                        },
                      ],
                    },
                  },
                  rest: [
                    {
                      op: "<",
                      term: { termType: "numericLiteral", value: 254 },
                    },
                  ],
                },
              },
              rest: [
                {
                  op: "&",
                  term: {
                    termType: "groupedExpression",
                    expression: {
                      nodeType: "expression",
                      term: {
                        termType: "groupedExpression",
                        expression: {
                          nodeType: "expression",
                          term: { termType: "variable", name: "x" },
                          rest: [
                            {
                              op: "+",
                              term: { termType: "variable", name: "size" },
                            },
                          ],
                        },
                      },
                      rest: [
                        {
                          op: "<",
                          term: { termType: "numericLiteral", value: 510 },
                        },
                      ],
                    },
                  },
                },
              ],
            },
            body: [
              {
                statementType: "doStatement",
                call: {
                  termType: "subroutineCall",
                  name: "erase",
                  parameters: [],
                },
              },
              {
                statementType: "letStatement",
                name: "size",
                value: {
                  nodeType: "expression",
                  term: { termType: "variable", name: "size" },
                  rest: [
                    {
                      op: "+",
                      term: { termType: "numericLiteral", value: 2 },
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
            ],
            else: [],
          },
          { statementType: "returnStatement" },
        ],
      },
    },
    {
      type: "method",
      returnType: "void",
      name: "decSize",
      parameters: [],
      body: {
        varDecs: [],
        statements: [
          {
            statementType: "ifStatement",
            condition: {
              nodeType: "expression",
              term: { termType: "variable", name: "size" },
              rest: [
                { op: ">", term: { termType: "numericLiteral", value: 2 } },
              ],
            },
            body: [
              {
                statementType: "doStatement",
                call: {
                  termType: "subroutineCall",
                  name: "erase",
                  parameters: [],
                },
              },
              {
                statementType: "letStatement",
                name: "size",
                value: {
                  nodeType: "expression",
                  term: { termType: "variable", name: "size" },
                  rest: [
                    {
                      op: "-",
                      term: { termType: "numericLiteral", value: 2 },
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
            ],
            else: [],
          },
          { statementType: "returnStatement" },
        ],
      },
    },
    {
      type: "method",
      returnType: "void",
      name: "moveUp",
      parameters: [],
      body: {
        varDecs: [],
        statements: [
          {
            statementType: "ifStatement",
            condition: {
              nodeType: "expression",
              term: { termType: "variable", name: "y" },
              rest: [
                { op: ">", term: { termType: "numericLiteral", value: 1 } },
              ],
            },
            body: [
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
                      rest: [],
                    },
                    {
                      nodeType: "expression",
                      term: {
                        termType: "groupedExpression",
                        expression: {
                          nodeType: "expression",
                          term: { termType: "variable", name: "y" },
                          rest: [
                            {
                              op: "+",
                              term: { termType: "variable", name: "size" },
                            },
                          ],
                        },
                      },
                      rest: [
                        {
                          op: "-",
                          term: { termType: "numericLiteral", value: 1 },
                        },
                      ],
                    },
                    {
                      nodeType: "expression",
                      term: { termType: "variable", name: "x" },
                      rest: [
                        {
                          op: "+",
                          term: { termType: "variable", name: "size" },
                        },
                      ],
                    },
                    {
                      nodeType: "expression",
                      term: { termType: "variable", name: "y" },
                      rest: [
                        {
                          op: "+",
                          term: { termType: "variable", name: "size" },
                        },
                      ],
                    },
                  ],
                },
              },
              {
                statementType: "letStatement",
                name: "y",
                value: {
                  nodeType: "expression",
                  term: { termType: "variable", name: "y" },
                  rest: [
                    {
                      op: "-",
                      term: { termType: "numericLiteral", value: 2 },
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
                          term: { termType: "variable", name: "size" },
                        },
                      ],
                    },
                    {
                      nodeType: "expression",
                      term: { termType: "variable", name: "y" },
                      rest: [
                        {
                          op: "+",
                          term: { termType: "numericLiteral", value: 1 },
                        },
                      ],
                    },
                  ],
                },
              },
            ],
            else: [],
          },
          { statementType: "returnStatement" },
        ],
      },
    },
    {
      type: "method",
      returnType: "void",
      name: "moveDown",
      parameters: [],
      body: {
        varDecs: [],
        statements: [
          {
            statementType: "ifStatement",
            condition: {
              nodeType: "expression",
              term: {
                termType: "groupedExpression",
                expression: {
                  nodeType: "expression",
                  term: { termType: "variable", name: "y" },
                  rest: [
                    { op: "+", term: { termType: "variable", name: "size" } },
                  ],
                },
              },
              rest: [
                { op: "<", term: { termType: "numericLiteral", value: 254 } },
              ],
            },
            body: [
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
                          term: { termType: "variable", name: "size" },
                        },
                      ],
                    },
                    {
                      nodeType: "expression",
                      term: { termType: "variable", name: "y" },
                      rest: [
                        {
                          op: "+",
                          term: { termType: "numericLiteral", value: 1 },
                        },
                      ],
                    },
                  ],
                },
              },
              {
                statementType: "letStatement",
                name: "y",
                value: {
                  nodeType: "expression",
                  term: { termType: "variable", name: "y" },
                  rest: [
                    {
                      op: "+",
                      term: { termType: "numericLiteral", value: 2 },
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
                      term: {
                        termType: "groupedExpression",
                        expression: {
                          nodeType: "expression",
                          term: { termType: "variable", name: "y" },
                          rest: [
                            {
                              op: "+",
                              term: { termType: "variable", name: "size" },
                            },
                          ],
                        },
                      },
                      rest: [
                        {
                          op: "-",
                          term: { termType: "numericLiteral", value: 1 },
                        },
                      ],
                    },
                    {
                      nodeType: "expression",
                      term: { termType: "variable", name: "x" },
                      rest: [
                        {
                          op: "+",
                          term: { termType: "variable", name: "size" },
                        },
                      ],
                    },
                    {
                      nodeType: "expression",
                      term: { termType: "variable", name: "y" },
                      rest: [
                        {
                          op: "+",
                          term: { termType: "variable", name: "size" },
                        },
                      ],
                    },
                  ],
                },
              },
            ],
            else: [],
          },
          { statementType: "returnStatement" },
        ],
      },
    },
    {
      type: "method",
      returnType: "void",
      name: "moveLeft",
      parameters: [],
      body: {
        varDecs: [],
        statements: [
          {
            statementType: "ifStatement",
            condition: {
              nodeType: "expression",
              term: { termType: "variable", name: "x" },
              rest: [
                { op: ">", term: { termType: "numericLiteral", value: 1 } },
              ],
            },
            body: [
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
                              term: { termType: "variable", name: "size" },
                            },
                          ],
                        },
                      },
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
                      rest: [],
                    },
                    {
                      nodeType: "expression",
                      term: { termType: "variable", name: "x" },
                      rest: [
                        {
                          op: "+",
                          term: { termType: "variable", name: "size" },
                        },
                      ],
                    },
                    {
                      nodeType: "expression",
                      term: { termType: "variable", name: "y" },
                      rest: [
                        {
                          op: "+",
                          term: { termType: "variable", name: "size" },
                        },
                      ],
                    },
                  ],
                },
              },
              {
                statementType: "letStatement",
                name: "x",
                value: {
                  nodeType: "expression",
                  term: { termType: "variable", name: "x" },
                  rest: [
                    {
                      op: "-",
                      term: { termType: "numericLiteral", value: 2 },
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
                          term: { termType: "variable", name: "size" },
                        },
                      ],
                    },
                  ],
                },
              },
            ],
            else: [],
          },
          { statementType: "returnStatement" },
        ],
      },
    },
    {
      type: "method",
      returnType: "void",
      name: "moveRight",
      parameters: [],
      body: {
        varDecs: [],
        statements: [
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
                    { op: "+", term: { termType: "variable", name: "size" } },
                  ],
                },
              },
              rest: [
                { op: "<", term: { termType: "numericLiteral", value: 510 } },
              ],
            },
            body: [
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
                          term: { termType: "variable", name: "size" },
                        },
                      ],
                    },
                  ],
                },
              },
              {
                statementType: "letStatement",
                name: "x",
                value: {
                  nodeType: "expression",
                  term: { termType: "variable", name: "x" },
                  rest: [
                    {
                      op: "+",
                      term: { termType: "numericLiteral", value: 2 },
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
                              term: { termType: "variable", name: "size" },
                            },
                          ],
                        },
                      },
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
                      rest: [],
                    },
                    {
                      nodeType: "expression",
                      term: { termType: "variable", name: "x" },
                      rest: [
                        {
                          op: "+",
                          term: { termType: "variable", name: "size" },
                        },
                      ],
                    },
                    {
                      nodeType: "expression",
                      term: { termType: "variable", name: "y" },
                      rest: [
                        {
                          op: "+",
                          term: { termType: "variable", name: "size" },
                        },
                      ],
                    },
                  ],
                },
              },
            ],
            else: [],
          },
          { statementType: "returnStatement" },
        ],
      },
    },
  ],
};

export const compiled = `function Square.new 0
push constant 3
call Memory.alloc 1
pop pointer 0
push argument 0
pop this 0
push argument 1
pop this 1
push argument 2
pop this 2
push pointer 0
call Square.draw 1
pop temp 0
push pointer 0
return
function Square.dispose 0
push argument 0
pop pointer 0
push pointer 0
call Memory.deAlloc 1
pop temp 0
push constant 0
return
function Square.draw 0
push argument 0
pop pointer 0
push constant 1
call Screen.setColor 1
pop temp 0
push this 0
push this 1
push this 0
push this 2
add
push this 1
push this 2
add
call Screen.drawRectangle 4
pop temp 0
push constant 0
return
function Square.erase 0
push argument 0
pop pointer 0
push constant 0
call Screen.setColor 1
pop temp 0
push this 0
push this 1
push this 0
push this 2
add
push this 1
push this 2
add
call Screen.drawRectangle 4
pop temp 0
push constant 0
return
function Square.incSize 0
push argument 0
pop pointer 0
push this 1
push this 2
add
push constant 254
lt
push this 0
push this 2
add
push constant 510
lt
and
not
if-goto L1
push pointer 0
call Square.erase 1
pop temp 0
push this 2
push constant 2
add
pop this 2
push pointer 0
call Square.draw 1
pop temp 0
goto L0
label L1
label L0
push constant 0
return
function Square.decSize 0
push argument 0
pop pointer 0
push this 2
push constant 2
gt
not
if-goto L3
push pointer 0
call Square.erase 1
pop temp 0
push this 2
push constant 2
sub
pop this 2
push pointer 0
call Square.draw 1
pop temp 0
goto L2
label L3
label L2
push constant 0
return
function Square.moveUp 0
push argument 0
pop pointer 0
push this 1
push constant 1
gt
not
if-goto L5
push constant 0
call Screen.setColor 1
pop temp 0
push this 0
push this 1
push this 2
add
push constant 1
sub
push this 0
push this 2
add
push this 1
push this 2
add
call Screen.drawRectangle 4
pop temp 0
push this 1
push constant 2
sub
pop this 1
push constant 1
call Screen.setColor 1
pop temp 0
push this 0
push this 1
push this 0
push this 2
add
push this 1
push constant 1
add
call Screen.drawRectangle 4
pop temp 0
goto L4
label L5
label L4
push constant 0
return
function Square.moveDown 0
push argument 0
pop pointer 0
push this 1
push this 2
add
push constant 254
lt
not
if-goto L7
push constant 0
call Screen.setColor 1
pop temp 0
push this 0
push this 1
push this 0
push this 2
add
push this 1
push constant 1
add
call Screen.drawRectangle 4
pop temp 0
push this 1
push constant 2
add
pop this 1
push constant 1
call Screen.setColor 1
pop temp 0
push this 0
push this 1
push this 2
add
push constant 1
sub
push this 0
push this 2
add
push this 1
push this 2
add
call Screen.drawRectangle 4
pop temp 0
goto L6
label L7
label L6
push constant 0
return
function Square.moveLeft 0
push argument 0
pop pointer 0
push this 0
push constant 1
gt
not
if-goto L9
push constant 0
call Screen.setColor 1
pop temp 0
push this 0
push this 2
add
push constant 1
sub
push this 1
push this 0
push this 2
add
push this 1
push this 2
add
call Screen.drawRectangle 4
pop temp 0
push this 0
push constant 2
sub
pop this 0
push constant 1
call Screen.setColor 1
pop temp 0
push this 0
push this 1
push this 0
push constant 1
add
push this 1
push this 2
add
call Screen.drawRectangle 4
pop temp 0
goto L8
label L9
label L8
push constant 0
return
function Square.moveRight 0
push argument 0
pop pointer 0
push this 0
push this 2
add
push constant 510
lt
not
if-goto L11
push constant 0
call Screen.setColor 1
pop temp 0
push this 0
push this 1
push this 0
push constant 1
add
push this 1
push this 2
add
call Screen.drawRectangle 4
pop temp 0
push this 0
push constant 2
add
pop this 0
push constant 1
call Screen.setColor 1
pop temp 0
push this 0
push this 2
add
push constant 1
sub
push this 1
push this 0
push this 2
add
push this 1
push this 2
add
call Screen.drawRectangle 4
pop temp 0
goto L10
label L11
label L10
push constant 0
return`;

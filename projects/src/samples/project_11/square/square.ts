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
  name: { value: "Square", span: { start: 284, end: 290, line: 8 } },
  varDecs: [
    {
      varType: "field",
      type: { value: "int", span: { start: 303, end: 307, line: 10 } },
      names: ["x", "y"],
    },
    {
      varType: "field",
      type: { value: "int", span: { start: 379, end: 383, line: 11 } },
      names: ["size"],
    },
  ],
  subroutines: [
    {
      type: "constructor",
      returnType: { value: "Square", span: { start: 517, end: 524, line: 14 } },
      name: { value: "new", span: { start: 524, end: 527, line: 14 } },
      parameters: [
        {
          type: { value: "int", span: { start: 528, end: 532, line: 14 } },
          name: "ax",
        },
        {
          type: { value: "int", span: { start: 536, end: 540, line: 14 } },
          name: "ay",
        },
        {
          type: { value: "int", span: { start: 544, end: 548, line: 14 } },
          name: "asize",
        },
      ],
      body: {
        varDecs: [],
        statements: [
          {
            statementType: "letStatement",
            name: { value: "x", span: { start: 567, end: 568, line: 15 } },
            value: {
              nodeType: "expression",
              term: {
                termType: "variable",
                name: "ax",
                span: { start: 571, end: 573, line: 15 },
              },
              rest: [],
            },
            span: { start: 563, end: 574, line: 15 },
          },
          {
            statementType: "letStatement",
            name: { value: "y", span: { start: 585, end: 586, line: 16 } },
            value: {
              nodeType: "expression",
              term: {
                termType: "variable",
                name: "ay",
                span: { start: 589, end: 591, line: 16 },
              },
              rest: [],
            },
            span: { start: 581, end: 592, line: 16 },
          },
          {
            statementType: "letStatement",
            name: { value: "size", span: { start: 603, end: 607, line: 17 } },
            value: {
              nodeType: "expression",
              term: {
                termType: "variable",
                name: "asize",
                span: { start: 610, end: 615, line: 17 },
              },
              rest: [],
            },
            span: { start: 599, end: 616, line: 17 },
          },
          {
            statementType: "doStatement",
            call: {
              termType: "subroutineCall",
              name: { value: "draw", span: { start: 626, end: 630, line: 18 } },
              parameters: [],
              span: { start: 626, end: 632, line: 18 },
            },
          },
          {
            statementType: "returnStatement",
            value: {
              nodeType: "expression",
              term: { termType: "keywordLiteral", value: "this" },
              rest: [],
            },
            span: { start: 640, end: 652, line: 19 },
          },
        ],
      },
    },
    {
      type: "method",
      returnType: { value: "void", span: { start: 701, end: 706, line: 23 } },
      name: { value: "dispose", span: { start: 706, end: 713, line: 23 } },
      parameters: [],
      body: {
        varDecs: [],
        statements: [
          {
            statementType: "doStatement",
            call: {
              termType: "subroutineCall",
              name: {
                value: "Memory.deAlloc",
                span: { start: 727, end: 741, line: 24 },
              },
              parameters: [
                {
                  nodeType: "expression",
                  term: { termType: "keywordLiteral", value: "this" },
                  rest: [],
                },
              ],
              span: { start: 727, end: 747, line: 24 },
            },
          },
          {
            statementType: "returnStatement",
            span: { start: 755, end: 762, line: 25 },
          },
        ],
      },
    },
    {
      type: "method",
      returnType: { value: "void", span: { start: 837, end: 842, line: 29 } },
      name: { value: "draw", span: { start: 842, end: 846, line: 29 } },
      parameters: [],
      body: {
        varDecs: [],
        statements: [
          {
            statementType: "doStatement",
            call: {
              termType: "subroutineCall",
              name: {
                value: "Screen.setColor",
                span: { start: 908, end: 923, line: 31 },
              },
              parameters: [
                {
                  nodeType: "expression",
                  term: { termType: "keywordLiteral", value: "true" },
                  rest: [],
                },
              ],
              span: { start: 908, end: 929, line: 31 },
            },
          },
          {
            statementType: "doStatement",
            call: {
              termType: "subroutineCall",
              name: {
                value: "Screen.drawRectangle",
                span: { start: 940, end: 960, line: 32 },
              },
              parameters: [
                {
                  nodeType: "expression",
                  term: {
                    termType: "variable",
                    name: "x",
                    span: { start: 961, end: 962, line: 32 },
                  },
                  rest: [],
                },
                {
                  nodeType: "expression",
                  term: {
                    termType: "variable",
                    name: "y",
                    span: { start: 964, end: 965, line: 32 },
                  },
                  rest: [],
                },
                {
                  nodeType: "expression",
                  term: {
                    termType: "variable",
                    name: "x",
                    span: { start: 967, end: 968, line: 32 },
                  },
                  rest: [
                    {
                      op: "+",
                      term: {
                        termType: "variable",
                        name: "size",
                        span: { start: 971, end: 975, line: 32 },
                      },
                    },
                  ],
                },
                {
                  nodeType: "expression",
                  term: {
                    termType: "variable",
                    name: "y",
                    span: { start: 977, end: 978, line: 32 },
                  },
                  rest: [
                    {
                      op: "+",
                      term: {
                        termType: "variable",
                        name: "size",
                        span: { start: 981, end: 985, line: 32 },
                      },
                    },
                  ],
                },
              ],
              span: { start: 940, end: 986, line: 32 },
            },
          },
          {
            statementType: "returnStatement",
            span: { start: 994, end: 1001, line: 33 },
          },
        ],
      },
    },
    {
      type: "method",
      returnType: { value: "void", span: { start: 1048, end: 1053, line: 37 } },
      name: { value: "erase", span: { start: 1053, end: 1058, line: 37 } },
      parameters: [],
      body: {
        varDecs: [],
        statements: [
          {
            statementType: "doStatement",
            call: {
              termType: "subroutineCall",
              name: {
                value: "Screen.setColor",
                span: { start: 1139, end: 1154, line: 39 },
              },
              parameters: [
                {
                  nodeType: "expression",
                  term: { termType: "keywordLiteral", value: "false" },
                  rest: [],
                },
              ],
              span: { start: 1139, end: 1161, line: 39 },
            },
          },
          {
            statementType: "doStatement",
            call: {
              termType: "subroutineCall",
              name: {
                value: "Screen.drawRectangle",
                span: { start: 1172, end: 1192, line: 40 },
              },
              parameters: [
                {
                  nodeType: "expression",
                  term: {
                    termType: "variable",
                    name: "x",
                    span: { start: 1193, end: 1194, line: 40 },
                  },
                  rest: [],
                },
                {
                  nodeType: "expression",
                  term: {
                    termType: "variable",
                    name: "y",
                    span: { start: 1196, end: 1197, line: 40 },
                  },
                  rest: [],
                },
                {
                  nodeType: "expression",
                  term: {
                    termType: "variable",
                    name: "x",
                    span: { start: 1199, end: 1200, line: 40 },
                  },
                  rest: [
                    {
                      op: "+",
                      term: {
                        termType: "variable",
                        name: "size",
                        span: { start: 1203, end: 1207, line: 40 },
                      },
                    },
                  ],
                },
                {
                  nodeType: "expression",
                  term: {
                    termType: "variable",
                    name: "y",
                    span: { start: 1209, end: 1210, line: 40 },
                  },
                  rest: [
                    {
                      op: "+",
                      term: {
                        termType: "variable",
                        name: "size",
                        span: { start: 1213, end: 1217, line: 40 },
                      },
                    },
                  ],
                },
              ],
              span: { start: 1172, end: 1218, line: 40 },
            },
          },
          {
            statementType: "returnStatement",
            span: { start: 1226, end: 1233, line: 41 },
          },
        ],
      },
    },
    {
      type: "method",
      returnType: { value: "void", span: { start: 1315, end: 1320, line: 45 } },
      name: { value: "incSize", span: { start: 1320, end: 1327, line: 45 } },
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
                      term: {
                        termType: "variable",
                        name: "y",
                        span: { start: 1344, end: 1345, line: 46 },
                      },
                      rest: [
                        {
                          op: "+",
                          term: {
                            termType: "variable",
                            name: "size",
                            span: { start: 1348, end: 1352, line: 46 },
                          },
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
                          term: {
                            termType: "variable",
                            name: "x",
                            span: { start: 1365, end: 1366, line: 46 },
                          },
                          rest: [
                            {
                              op: "+",
                              term: {
                                termType: "variable",
                                name: "size",
                                span: { start: 1369, end: 1373, line: 46 },
                              },
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
                  name: {
                    value: "erase",
                    span: { start: 1397, end: 1402, line: 47 },
                  },
                  parameters: [],
                  span: { start: 1397, end: 1404, line: 47 },
                },
              },
              {
                statementType: "letStatement",
                name: {
                  value: "size",
                  span: { start: 1419, end: 1423, line: 48 },
                },
                value: {
                  nodeType: "expression",
                  term: {
                    termType: "variable",
                    name: "size",
                    span: { start: 1426, end: 1430, line: 48 },
                  },
                  rest: [
                    { op: "+", term: { termType: "numericLiteral", value: 2 } },
                  ],
                },
                span: { start: 1415, end: 1435, line: 48 },
              },
              {
                statementType: "doStatement",
                call: {
                  termType: "subroutineCall",
                  name: {
                    value: "draw",
                    span: { start: 1448, end: 1452, line: 49 },
                  },
                  parameters: [],
                  span: { start: 1448, end: 1454, line: 49 },
                },
              },
            ],
            else: [],
          },
          {
            statementType: "returnStatement",
            span: { start: 1470, end: 1477, line: 51 },
          },
        ],
      },
    },
    {
      type: "method",
      returnType: { value: "void", span: { start: 1558, end: 1563, line: 55 } },
      name: { value: "decSize", span: { start: 1563, end: 1570, line: 55 } },
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
                name: "size",
                span: { start: 1585, end: 1589, line: 56 },
              },
              rest: [
                { op: ">", term: { termType: "numericLiteral", value: 2 } },
              ],
            },
            body: [
              {
                statementType: "doStatement",
                call: {
                  termType: "subroutineCall",
                  name: {
                    value: "erase",
                    span: { start: 1609, end: 1614, line: 57 },
                  },
                  parameters: [],
                  span: { start: 1609, end: 1616, line: 57 },
                },
              },
              {
                statementType: "letStatement",
                name: {
                  value: "size",
                  span: { start: 1631, end: 1635, line: 58 },
                },
                value: {
                  nodeType: "expression",
                  term: {
                    termType: "variable",
                    name: "size",
                    span: { start: 1638, end: 1642, line: 58 },
                  },
                  rest: [
                    { op: "-", term: { termType: "numericLiteral", value: 2 } },
                  ],
                },
                span: { start: 1627, end: 1647, line: 58 },
              },
              {
                statementType: "doStatement",
                call: {
                  termType: "subroutineCall",
                  name: {
                    value: "draw",
                    span: { start: 1660, end: 1664, line: 59 },
                  },
                  parameters: [],
                  span: { start: 1660, end: 1666, line: 59 },
                },
              },
            ],
            else: [],
          },
          {
            statementType: "returnStatement",
            span: { start: 1682, end: 1689, line: 61 },
          },
        ],
      },
    },
    {
      type: "method",
      returnType: { value: "void", span: { start: 1764, end: 1769, line: 65 } },
      name: { value: "moveUp", span: { start: 1769, end: 1775, line: 65 } },
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
                name: "y",
                span: { start: 1790, end: 1791, line: 66 },
              },
              rest: [
                { op: ">", term: { termType: "numericLiteral", value: 1 } },
              ],
            },
            body: [
              {
                statementType: "doStatement",
                call: {
                  termType: "subroutineCall",
                  name: {
                    value: "Screen.setColor",
                    span: { start: 1889, end: 1904, line: 68 },
                  },
                  parameters: [
                    {
                      nodeType: "expression",
                      term: { termType: "keywordLiteral", value: "false" },
                      rest: [],
                    },
                  ],
                  span: { start: 1889, end: 1911, line: 68 },
                },
              },
              {
                statementType: "doStatement",
                call: {
                  termType: "subroutineCall",
                  name: {
                    value: "Screen.drawRectangle",
                    span: { start: 1925, end: 1945, line: 69 },
                  },
                  parameters: [
                    {
                      nodeType: "expression",
                      term: {
                        termType: "variable",
                        name: "x",
                        span: { start: 1946, end: 1947, line: 69 },
                      },
                      rest: [],
                    },
                    {
                      nodeType: "expression",
                      term: {
                        termType: "groupedExpression",
                        expression: {
                          nodeType: "expression",
                          term: {
                            termType: "variable",
                            name: "y",
                            span: { start: 1950, end: 1951, line: 69 },
                          },
                          rest: [
                            {
                              op: "+",
                              term: {
                                termType: "variable",
                                name: "size",
                                span: { start: 1954, end: 1958, line: 69 },
                              },
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
                      term: {
                        termType: "variable",
                        name: "x",
                        span: { start: 1965, end: 1966, line: 69 },
                      },
                      rest: [
                        {
                          op: "+",
                          term: {
                            termType: "variable",
                            name: "size",
                            span: { start: 1969, end: 1973, line: 69 },
                          },
                        },
                      ],
                    },
                    {
                      nodeType: "expression",
                      term: {
                        termType: "variable",
                        name: "y",
                        span: { start: 1975, end: 1976, line: 69 },
                      },
                      rest: [
                        {
                          op: "+",
                          term: {
                            termType: "variable",
                            name: "size",
                            span: { start: 1979, end: 1983, line: 69 },
                          },
                        },
                      ],
                    },
                  ],
                  span: { start: 1925, end: 1984, line: 69 },
                },
              },
              {
                statementType: "letStatement",
                name: {
                  value: "y",
                  span: { start: 1999, end: 2000, line: 70 },
                },
                value: {
                  nodeType: "expression",
                  term: {
                    termType: "variable",
                    name: "y",
                    span: { start: 2003, end: 2004, line: 70 },
                  },
                  rest: [
                    { op: "-", term: { termType: "numericLiteral", value: 2 } },
                  ],
                },
                span: { start: 1995, end: 2009, line: 70 },
              },
              {
                statementType: "doStatement",
                call: {
                  termType: "subroutineCall",
                  name: {
                    value: "Screen.setColor",
                    span: { start: 2092, end: 2107, line: 72 },
                  },
                  parameters: [
                    {
                      nodeType: "expression",
                      term: { termType: "keywordLiteral", value: "true" },
                      rest: [],
                    },
                  ],
                  span: { start: 2092, end: 2113, line: 72 },
                },
              },
              {
                statementType: "doStatement",
                call: {
                  termType: "subroutineCall",
                  name: {
                    value: "Screen.drawRectangle",
                    span: { start: 2127, end: 2147, line: 73 },
                  },
                  parameters: [
                    {
                      nodeType: "expression",
                      term: {
                        termType: "variable",
                        name: "x",
                        span: { start: 2148, end: 2149, line: 73 },
                      },
                      rest: [],
                    },
                    {
                      nodeType: "expression",
                      term: {
                        termType: "variable",
                        name: "y",
                        span: { start: 2151, end: 2152, line: 73 },
                      },
                      rest: [],
                    },
                    {
                      nodeType: "expression",
                      term: {
                        termType: "variable",
                        name: "x",
                        span: { start: 2154, end: 2155, line: 73 },
                      },
                      rest: [
                        {
                          op: "+",
                          term: {
                            termType: "variable",
                            name: "size",
                            span: { start: 2158, end: 2162, line: 73 },
                          },
                        },
                      ],
                    },
                    {
                      nodeType: "expression",
                      term: {
                        termType: "variable",
                        name: "y",
                        span: { start: 2164, end: 2165, line: 73 },
                      },
                      rest: [
                        {
                          op: "+",
                          term: { termType: "numericLiteral", value: 1 },
                        },
                      ],
                    },
                  ],
                  span: { start: 2127, end: 2170, line: 73 },
                },
              },
            ],
            else: [],
          },
          {
            statementType: "returnStatement",
            span: { start: 2186, end: 2193, line: 75 },
          },
        ],
      },
    },
    {
      type: "method",
      returnType: { value: "void", span: { start: 2269, end: 2274, line: 79 } },
      name: { value: "moveDown", span: { start: 2274, end: 2282, line: 79 } },
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
                    termType: "variable",
                    name: "y",
                    span: { start: 2298, end: 2299, line: 80 },
                  },
                  rest: [
                    {
                      op: "+",
                      term: {
                        termType: "variable",
                        name: "size",
                        span: { start: 2302, end: 2306, line: 80 },
                      },
                    },
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
                  name: {
                    value: "Screen.setColor",
                    span: { start: 2329, end: 2344, line: 81 },
                  },
                  parameters: [
                    {
                      nodeType: "expression",
                      term: { termType: "keywordLiteral", value: "false" },
                      rest: [],
                    },
                  ],
                  span: { start: 2329, end: 2351, line: 81 },
                },
              },
              {
                statementType: "doStatement",
                call: {
                  termType: "subroutineCall",
                  name: {
                    value: "Screen.drawRectangle",
                    span: { start: 2365, end: 2385, line: 82 },
                  },
                  parameters: [
                    {
                      nodeType: "expression",
                      term: {
                        termType: "variable",
                        name: "x",
                        span: { start: 2386, end: 2387, line: 82 },
                      },
                      rest: [],
                    },
                    {
                      nodeType: "expression",
                      term: {
                        termType: "variable",
                        name: "y",
                        span: { start: 2389, end: 2390, line: 82 },
                      },
                      rest: [],
                    },
                    {
                      nodeType: "expression",
                      term: {
                        termType: "variable",
                        name: "x",
                        span: { start: 2392, end: 2393, line: 82 },
                      },
                      rest: [
                        {
                          op: "+",
                          term: {
                            termType: "variable",
                            name: "size",
                            span: { start: 2396, end: 2400, line: 82 },
                          },
                        },
                      ],
                    },
                    {
                      nodeType: "expression",
                      term: {
                        termType: "variable",
                        name: "y",
                        span: { start: 2402, end: 2403, line: 82 },
                      },
                      rest: [
                        {
                          op: "+",
                          term: { termType: "numericLiteral", value: 1 },
                        },
                      ],
                    },
                  ],
                  span: { start: 2365, end: 2408, line: 82 },
                },
              },
              {
                statementType: "letStatement",
                name: {
                  value: "y",
                  span: { start: 2423, end: 2424, line: 83 },
                },
                value: {
                  nodeType: "expression",
                  term: {
                    termType: "variable",
                    name: "y",
                    span: { start: 2427, end: 2428, line: 83 },
                  },
                  rest: [
                    { op: "+", term: { termType: "numericLiteral", value: 2 } },
                  ],
                },
                span: { start: 2419, end: 2433, line: 83 },
              },
              {
                statementType: "doStatement",
                call: {
                  termType: "subroutineCall",
                  name: {
                    value: "Screen.setColor",
                    span: { start: 2446, end: 2461, line: 84 },
                  },
                  parameters: [
                    {
                      nodeType: "expression",
                      term: { termType: "keywordLiteral", value: "true" },
                      rest: [],
                    },
                  ],
                  span: { start: 2446, end: 2467, line: 84 },
                },
              },
              {
                statementType: "doStatement",
                call: {
                  termType: "subroutineCall",
                  name: {
                    value: "Screen.drawRectangle",
                    span: { start: 2481, end: 2501, line: 85 },
                  },
                  parameters: [
                    {
                      nodeType: "expression",
                      term: {
                        termType: "variable",
                        name: "x",
                        span: { start: 2502, end: 2503, line: 85 },
                      },
                      rest: [],
                    },
                    {
                      nodeType: "expression",
                      term: {
                        termType: "groupedExpression",
                        expression: {
                          nodeType: "expression",
                          term: {
                            termType: "variable",
                            name: "y",
                            span: { start: 2506, end: 2507, line: 85 },
                          },
                          rest: [
                            {
                              op: "+",
                              term: {
                                termType: "variable",
                                name: "size",
                                span: { start: 2510, end: 2514, line: 85 },
                              },
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
                      term: {
                        termType: "variable",
                        name: "x",
                        span: { start: 2521, end: 2522, line: 85 },
                      },
                      rest: [
                        {
                          op: "+",
                          term: {
                            termType: "variable",
                            name: "size",
                            span: { start: 2525, end: 2529, line: 85 },
                          },
                        },
                      ],
                    },
                    {
                      nodeType: "expression",
                      term: {
                        termType: "variable",
                        name: "y",
                        span: { start: 2531, end: 2532, line: 85 },
                      },
                      rest: [
                        {
                          op: "+",
                          term: {
                            termType: "variable",
                            name: "size",
                            span: { start: 2535, end: 2539, line: 85 },
                          },
                        },
                      ],
                    },
                  ],
                  span: { start: 2481, end: 2540, line: 85 },
                },
              },
            ],
            else: [],
          },
          {
            statementType: "returnStatement",
            span: { start: 2556, end: 2563, line: 87 },
          },
        ],
      },
    },
    {
      type: "method",
      returnType: { value: "void", span: { start: 2639, end: 2644, line: 91 } },
      name: { value: "moveLeft", span: { start: 2644, end: 2652, line: 91 } },
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
                name: "x",
                span: { start: 2667, end: 2668, line: 92 },
              },
              rest: [
                { op: ">", term: { termType: "numericLiteral", value: 1 } },
              ],
            },
            body: [
              {
                statementType: "doStatement",
                call: {
                  termType: "subroutineCall",
                  name: {
                    value: "Screen.setColor",
                    span: { start: 2688, end: 2703, line: 93 },
                  },
                  parameters: [
                    {
                      nodeType: "expression",
                      term: { termType: "keywordLiteral", value: "false" },
                      rest: [],
                    },
                  ],
                  span: { start: 2688, end: 2710, line: 93 },
                },
              },
              {
                statementType: "doStatement",
                call: {
                  termType: "subroutineCall",
                  name: {
                    value: "Screen.drawRectangle",
                    span: { start: 2724, end: 2744, line: 94 },
                  },
                  parameters: [
                    {
                      nodeType: "expression",
                      term: {
                        termType: "groupedExpression",
                        expression: {
                          nodeType: "expression",
                          term: {
                            termType: "variable",
                            name: "x",
                            span: { start: 2746, end: 2747, line: 94 },
                          },
                          rest: [
                            {
                              op: "+",
                              term: {
                                termType: "variable",
                                name: "size",
                                span: { start: 2750, end: 2754, line: 94 },
                              },
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
                      term: {
                        termType: "variable",
                        name: "y",
                        span: { start: 2761, end: 2762, line: 94 },
                      },
                      rest: [],
                    },
                    {
                      nodeType: "expression",
                      term: {
                        termType: "variable",
                        name: "x",
                        span: { start: 2764, end: 2765, line: 94 },
                      },
                      rest: [
                        {
                          op: "+",
                          term: {
                            termType: "variable",
                            name: "size",
                            span: { start: 2768, end: 2772, line: 94 },
                          },
                        },
                      ],
                    },
                    {
                      nodeType: "expression",
                      term: {
                        termType: "variable",
                        name: "y",
                        span: { start: 2774, end: 2775, line: 94 },
                      },
                      rest: [
                        {
                          op: "+",
                          term: {
                            termType: "variable",
                            name: "size",
                            span: { start: 2778, end: 2782, line: 94 },
                          },
                        },
                      ],
                    },
                  ],
                  span: { start: 2724, end: 2783, line: 94 },
                },
              },
              {
                statementType: "letStatement",
                name: {
                  value: "x",
                  span: { start: 2798, end: 2799, line: 95 },
                },
                value: {
                  nodeType: "expression",
                  term: {
                    termType: "variable",
                    name: "x",
                    span: { start: 2802, end: 2803, line: 95 },
                  },
                  rest: [
                    { op: "-", term: { termType: "numericLiteral", value: 2 } },
                  ],
                },
                span: { start: 2794, end: 2808, line: 95 },
              },
              {
                statementType: "doStatement",
                call: {
                  termType: "subroutineCall",
                  name: {
                    value: "Screen.setColor",
                    span: { start: 2821, end: 2836, line: 96 },
                  },
                  parameters: [
                    {
                      nodeType: "expression",
                      term: { termType: "keywordLiteral", value: "true" },
                      rest: [],
                    },
                  ],
                  span: { start: 2821, end: 2842, line: 96 },
                },
              },
              {
                statementType: "doStatement",
                call: {
                  termType: "subroutineCall",
                  name: {
                    value: "Screen.drawRectangle",
                    span: { start: 2856, end: 2876, line: 97 },
                  },
                  parameters: [
                    {
                      nodeType: "expression",
                      term: {
                        termType: "variable",
                        name: "x",
                        span: { start: 2877, end: 2878, line: 97 },
                      },
                      rest: [],
                    },
                    {
                      nodeType: "expression",
                      term: {
                        termType: "variable",
                        name: "y",
                        span: { start: 2880, end: 2881, line: 97 },
                      },
                      rest: [],
                    },
                    {
                      nodeType: "expression",
                      term: {
                        termType: "variable",
                        name: "x",
                        span: { start: 2883, end: 2884, line: 97 },
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
                      term: {
                        termType: "variable",
                        name: "y",
                        span: { start: 2890, end: 2891, line: 97 },
                      },
                      rest: [
                        {
                          op: "+",
                          term: {
                            termType: "variable",
                            name: "size",
                            span: { start: 2894, end: 2898, line: 97 },
                          },
                        },
                      ],
                    },
                  ],
                  span: { start: 2856, end: 2899, line: 97 },
                },
              },
            ],
            else: [],
          },
          {
            statementType: "returnStatement",
            span: { start: 2915, end: 2922, line: 99 },
          },
        ],
      },
    },
    {
      type: "method",
      returnType: {
        value: "void",
        span: { start: 2999, end: 3004, line: 103 },
      },
      name: { value: "moveRight", span: { start: 3004, end: 3013, line: 103 } },
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
                    termType: "variable",
                    name: "x",
                    span: { start: 3029, end: 3030, line: 104 },
                  },
                  rest: [
                    {
                      op: "+",
                      term: {
                        termType: "variable",
                        name: "size",
                        span: { start: 3033, end: 3037, line: 104 },
                      },
                    },
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
                  name: {
                    value: "Screen.setColor",
                    span: { start: 3060, end: 3075, line: 105 },
                  },
                  parameters: [
                    {
                      nodeType: "expression",
                      term: { termType: "keywordLiteral", value: "false" },
                      rest: [],
                    },
                  ],
                  span: { start: 3060, end: 3082, line: 105 },
                },
              },
              {
                statementType: "doStatement",
                call: {
                  termType: "subroutineCall",
                  name: {
                    value: "Screen.drawRectangle",
                    span: { start: 3096, end: 3116, line: 106 },
                  },
                  parameters: [
                    {
                      nodeType: "expression",
                      term: {
                        termType: "variable",
                        name: "x",
                        span: { start: 3117, end: 3118, line: 106 },
                      },
                      rest: [],
                    },
                    {
                      nodeType: "expression",
                      term: {
                        termType: "variable",
                        name: "y",
                        span: { start: 3120, end: 3121, line: 106 },
                      },
                      rest: [],
                    },
                    {
                      nodeType: "expression",
                      term: {
                        termType: "variable",
                        name: "x",
                        span: { start: 3123, end: 3124, line: 106 },
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
                      term: {
                        termType: "variable",
                        name: "y",
                        span: { start: 3130, end: 3131, line: 106 },
                      },
                      rest: [
                        {
                          op: "+",
                          term: {
                            termType: "variable",
                            name: "size",
                            span: { start: 3134, end: 3138, line: 106 },
                          },
                        },
                      ],
                    },
                  ],
                  span: { start: 3096, end: 3139, line: 106 },
                },
              },
              {
                statementType: "letStatement",
                name: {
                  value: "x",
                  span: { start: 3154, end: 3155, line: 107 },
                },
                value: {
                  nodeType: "expression",
                  term: {
                    termType: "variable",
                    name: "x",
                    span: { start: 3158, end: 3159, line: 107 },
                  },
                  rest: [
                    { op: "+", term: { termType: "numericLiteral", value: 2 } },
                  ],
                },
                span: { start: 3150, end: 3164, line: 107 },
              },
              {
                statementType: "doStatement",
                call: {
                  termType: "subroutineCall",
                  name: {
                    value: "Screen.setColor",
                    span: { start: 3177, end: 3192, line: 108 },
                  },
                  parameters: [
                    {
                      nodeType: "expression",
                      term: { termType: "keywordLiteral", value: "true" },
                      rest: [],
                    },
                  ],
                  span: { start: 3177, end: 3198, line: 108 },
                },
              },
              {
                statementType: "doStatement",
                call: {
                  termType: "subroutineCall",
                  name: {
                    value: "Screen.drawRectangle",
                    span: { start: 3212, end: 3232, line: 109 },
                  },
                  parameters: [
                    {
                      nodeType: "expression",
                      term: {
                        termType: "groupedExpression",
                        expression: {
                          nodeType: "expression",
                          term: {
                            termType: "variable",
                            name: "x",
                            span: { start: 3234, end: 3235, line: 109 },
                          },
                          rest: [
                            {
                              op: "+",
                              term: {
                                termType: "variable",
                                name: "size",
                                span: { start: 3238, end: 3242, line: 109 },
                              },
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
                      term: {
                        termType: "variable",
                        name: "y",
                        span: { start: 3249, end: 3250, line: 109 },
                      },
                      rest: [],
                    },
                    {
                      nodeType: "expression",
                      term: {
                        termType: "variable",
                        name: "x",
                        span: { start: 3252, end: 3253, line: 109 },
                      },
                      rest: [
                        {
                          op: "+",
                          term: {
                            termType: "variable",
                            name: "size",
                            span: { start: 3256, end: 3260, line: 109 },
                          },
                        },
                      ],
                    },
                    {
                      nodeType: "expression",
                      term: {
                        termType: "variable",
                        name: "y",
                        span: { start: 3262, end: 3263, line: 109 },
                      },
                      rest: [
                        {
                          op: "+",
                          term: {
                            termType: "variable",
                            name: "size",
                            span: { start: 3266, end: 3270, line: 109 },
                          },
                        },
                      ],
                    },
                  ],
                  span: { start: 3212, end: 3271, line: 109 },
                },
              },
            ],
            else: [],
          },
          {
            statementType: "returnStatement",
            span: { start: 3287, end: 3294, line: 111 },
          },
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
    neg
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
    if-goto Square_1
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
    goto Square_0
label Square_1
label Square_0
    push constant 0
    return
function Square.decSize 0
    push argument 0
    pop pointer 0
    push this 2
    push constant 2
    gt
    not
    if-goto Square_3
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
    goto Square_2
label Square_3
label Square_2
    push constant 0
    return
function Square.moveUp 0
    push argument 0
    pop pointer 0
    push this 1
    push constant 1
    gt
    not
    if-goto Square_5
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
    neg
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
    goto Square_4
label Square_5
label Square_4
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
    if-goto Square_7
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
    neg
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
    goto Square_6
label Square_7
label Square_6
    push constant 0
    return
function Square.moveLeft 0
    push argument 0
    pop pointer 0
    push this 0
    push constant 1
    gt
    not
    if-goto Square_9
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
    neg
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
    goto Square_8
label Square_9
label Square_8
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
    if-goto Square_11
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
    neg
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
    goto Square_10
label Square_11
label Square_10
    push constant 0
    return`;

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
  name: { value: "Bat", span: { start: 660, end: 663, line: 16 } },
  varDecs: [
    {
      varType: "field",
      type: { value: "int", span: { start: 677, end: 681, line: 18 } },
      names: ["x", "y"],
    },
    {
      varType: "field",
      type: { value: "int", span: { start: 736, end: 740, line: 19 } },
      names: ["width", "height"],
    },
    {
      varType: "field",
      type: { value: "int", span: { start: 796, end: 800, line: 20 } },
      names: ["direction"],
    },
  ],
  subroutines: [
    {
      type: "constructor",
      returnType: { value: "Bat", span: { start: 991, end: 995, line: 24 } },
      name: { value: "new", span: { start: 995, end: 998, line: 24 } },
      parameters: [
        {
          type: { value: "int", span: { start: 999, end: 1003, line: 24 } },
          name: "Ax",
        },
        {
          type: { value: "int", span: { start: 1007, end: 1011, line: 24 } },
          name: "Ay",
        },
        {
          type: { value: "int", span: { start: 1015, end: 1019, line: 24 } },
          name: "Awidth",
        },
        {
          type: { value: "int", span: { start: 1027, end: 1031, line: 24 } },
          name: "Aheight",
        },
      ],
      body: {
        varDecs: [],
        statements: [
          {
            statementType: "letStatement",
            name: { value: "x", span: { start: 1054, end: 1055, line: 25 } },
            value: {
              nodeType: "expression",
              term: {
                termType: "variable",
                name: "Ax",
                span: { start: 1058, end: 1060, line: 25 },
              },
              rest: [],
            },
            span: { start: 1050, end: 1061, line: 25 },
          },
          {
            statementType: "letStatement",
            name: { value: "y", span: { start: 1074, end: 1075, line: 26 } },
            value: {
              nodeType: "expression",
              term: {
                termType: "variable",
                name: "Ay",
                span: { start: 1078, end: 1080, line: 26 },
              },
              rest: [],
            },
            span: { start: 1070, end: 1081, line: 26 },
          },
          {
            statementType: "letStatement",
            name: {
              value: "width",
              span: { start: 1094, end: 1099, line: 27 },
            },
            value: {
              nodeType: "expression",
              term: {
                termType: "variable",
                name: "Awidth",
                span: { start: 1102, end: 1108, line: 27 },
              },
              rest: [],
            },
            span: { start: 1090, end: 1109, line: 27 },
          },
          {
            statementType: "letStatement",
            name: {
              value: "height",
              span: { start: 1122, end: 1128, line: 28 },
            },
            value: {
              nodeType: "expression",
              term: {
                termType: "variable",
                name: "Aheight",
                span: { start: 1131, end: 1138, line: 28 },
              },
              rest: [],
            },
            span: { start: 1118, end: 1139, line: 28 },
          },
          {
            statementType: "letStatement",
            name: {
              value: "direction",
              span: { start: 1152, end: 1161, line: 29 },
            },
            value: {
              nodeType: "expression",
              term: { termType: "numericLiteral", value: 2 },
              rest: [],
            },
            span: { start: 1148, end: 1166, line: 29 },
          },
          {
            statementType: "doStatement",
            call: {
              termType: "subroutineCall",
              name: {
                value: "show",
                span: { start: 1178, end: 1182, line: 30 },
              },
              parameters: [],
              span: { start: 1178, end: 1184, line: 30 },
            },
          },
          {
            statementType: "returnStatement",
            value: {
              nodeType: "expression",
              term: { termType: "keywordLiteral", value: "this" },
              rest: [],
            },
            span: { start: 1194, end: 1206, line: 31 },
          },
        ],
      },
    },
    {
      type: "method",
      returnType: { value: "void", span: { start: 1269, end: 1274, line: 35 } },
      name: { value: "dispose", span: { start: 1274, end: 1281, line: 35 } },
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
                span: { start: 1297, end: 1311, line: 36 },
              },
              parameters: [
                {
                  nodeType: "expression",
                  term: { termType: "keywordLiteral", value: "this" },
                  rest: [],
                },
              ],
              span: { start: 1297, end: 1317, line: 36 },
            },
          },
          {
            statementType: "returnStatement",
            span: { start: 1327, end: 1334, line: 37 },
          },
        ],
      },
    },
    {
      type: "method",
      returnType: { value: "void", span: { start: 1379, end: 1384, line: 41 } },
      name: { value: "show", span: { start: 1384, end: 1388, line: 41 } },
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
                span: { start: 1404, end: 1419, line: 42 },
              },
              parameters: [
                {
                  nodeType: "expression",
                  term: { termType: "keywordLiteral", value: "true" },
                  rest: [],
                },
              ],
              span: { start: 1404, end: 1425, line: 42 },
            },
          },
          {
            statementType: "doStatement",
            call: {
              termType: "subroutineCall",
              name: {
                value: "draw",
                span: { start: 1438, end: 1442, line: 43 },
              },
              parameters: [],
              span: { start: 1438, end: 1444, line: 43 },
            },
          },
          {
            statementType: "returnStatement",
            span: { start: 1454, end: 1461, line: 44 },
          },
        ],
      },
    },
    {
      type: "method",
      returnType: { value: "void", span: { start: 1506, end: 1511, line: 48 } },
      name: { value: "hide", span: { start: 1511, end: 1515, line: 48 } },
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
                span: { start: 1531, end: 1546, line: 49 },
              },
              parameters: [
                {
                  nodeType: "expression",
                  term: { termType: "keywordLiteral", value: "false" },
                  rest: [],
                },
              ],
              span: { start: 1531, end: 1553, line: 49 },
            },
          },
          {
            statementType: "doStatement",
            call: {
              termType: "subroutineCall",
              name: {
                value: "draw",
                span: { start: 1566, end: 1570, line: 50 },
              },
              parameters: [],
              span: { start: 1566, end: 1572, line: 50 },
            },
          },
          {
            statementType: "returnStatement",
            span: { start: 1582, end: 1589, line: 51 },
          },
        ],
      },
    },
    {
      type: "method",
      returnType: { value: "void", span: { start: 1634, end: 1639, line: 55 } },
      name: { value: "draw", span: { start: 1639, end: 1643, line: 55 } },
      parameters: [],
      body: {
        varDecs: [],
        statements: [
          {
            statementType: "doStatement",
            call: {
              termType: "subroutineCall",
              name: {
                value: "Screen.drawRectangle",
                span: { start: 1659, end: 1679, line: 56 },
              },
              parameters: [
                {
                  nodeType: "expression",
                  term: {
                    termType: "variable",
                    name: "x",
                    span: { start: 1680, end: 1681, line: 56 },
                  },
                  rest: [],
                },
                {
                  nodeType: "expression",
                  term: {
                    termType: "variable",
                    name: "y",
                    span: { start: 1683, end: 1684, line: 56 },
                  },
                  rest: [],
                },
                {
                  nodeType: "expression",
                  term: {
                    termType: "variable",
                    name: "x",
                    span: { start: 1686, end: 1687, line: 56 },
                  },
                  rest: [
                    {
                      op: "+",
                      term: {
                        termType: "variable",
                        name: "width",
                        span: { start: 1690, end: 1695, line: 56 },
                      },
                    },
                  ],
                },
                {
                  nodeType: "expression",
                  term: {
                    termType: "variable",
                    name: "y",
                    span: { start: 1697, end: 1698, line: 56 },
                  },
                  rest: [
                    {
                      op: "+",
                      term: {
                        termType: "variable",
                        name: "height",
                        span: { start: 1701, end: 1707, line: 56 },
                      },
                    },
                  ],
                },
              ],
              span: { start: 1659, end: 1708, line: 56 },
            },
          },
          {
            statementType: "returnStatement",
            span: { start: 1718, end: 1725, line: 57 },
          },
        ],
      },
    },
    {
      type: "method",
      returnType: { value: "void", span: { start: 1807, end: 1812, line: 61 } },
      name: {
        value: "setDirection",
        span: { start: 1812, end: 1824, line: 61 },
      },
      parameters: [
        {
          type: { value: "int", span: { start: 1825, end: 1829, line: 61 } },
          name: "Adirection",
        },
      ],
      body: {
        varDecs: [],
        statements: [
          {
            statementType: "letStatement",
            name: {
              value: "direction",
              span: { start: 1855, end: 1864, line: 62 },
            },
            value: {
              nodeType: "expression",
              term: {
                termType: "variable",
                name: "Adirection",
                span: { start: 1867, end: 1877, line: 62 },
              },
              rest: [],
            },
            span: { start: 1851, end: 1878, line: 62 },
          },
          {
            statementType: "returnStatement",
            span: { start: 1887, end: 1894, line: 63 },
          },
        ],
      },
    },
    {
      type: "method",
      returnType: { value: "int", span: { start: 1953, end: 1957, line: 67 } },
      name: { value: "getLeft", span: { start: 1957, end: 1964, line: 67 } },
      parameters: [],
      body: {
        varDecs: [],
        statements: [
          {
            statementType: "returnStatement",
            value: {
              nodeType: "expression",
              term: {
                termType: "variable",
                name: "x",
                span: { start: 1984, end: 1985, line: 68 },
              },
              rest: [],
            },
            span: { start: 1977, end: 1986, line: 68 },
          },
        ],
      },
    },
    {
      type: "method",
      returnType: { value: "int", span: { start: 2046, end: 2050, line: 72 } },
      name: { value: "getRight", span: { start: 2050, end: 2058, line: 72 } },
      parameters: [],
      body: {
        varDecs: [],
        statements: [
          {
            statementType: "returnStatement",
            value: {
              nodeType: "expression",
              term: {
                termType: "variable",
                name: "x",
                span: { start: 2078, end: 2079, line: 73 },
              },
              rest: [
                {
                  op: "+",
                  term: {
                    termType: "variable",
                    name: "width",
                    span: { start: 2082, end: 2087, line: 73 },
                  },
                },
              ],
            },
            span: { start: 2071, end: 2088, line: 73 },
          },
        ],
      },
    },
    {
      type: "method",
      returnType: { value: "void", span: { start: 2140, end: 2145, line: 77 } },
      name: { value: "setWidth", span: { start: 2145, end: 2153, line: 77 } },
      parameters: [
        {
          type: { value: "int", span: { start: 2154, end: 2158, line: 77 } },
          name: "Awidth",
        },
      ],
      body: {
        varDecs: [],
        statements: [
          {
            statementType: "doStatement",
            call: {
              termType: "subroutineCall",
              name: {
                value: "hide",
                span: { start: 2179, end: 2183, line: 78 },
              },
              parameters: [],
              span: { start: 2179, end: 2185, line: 78 },
            },
          },
          {
            statementType: "letStatement",
            name: {
              value: "width",
              span: { start: 2199, end: 2204, line: 79 },
            },
            value: {
              nodeType: "expression",
              term: {
                termType: "variable",
                name: "Awidth",
                span: { start: 2207, end: 2213, line: 79 },
              },
              rest: [],
            },
            span: { start: 2195, end: 2214, line: 79 },
          },
          {
            statementType: "doStatement",
            call: {
              termType: "subroutineCall",
              name: {
                value: "show",
                span: { start: 2226, end: 2230, line: 80 },
              },
              parameters: [],
              span: { start: 2226, end: 2232, line: 80 },
            },
          },
          {
            statementType: "returnStatement",
            span: { start: 2242, end: 2249, line: 81 },
          },
        ],
      },
    },
    {
      type: "method",
      returnType: { value: "void", span: { start: 2326, end: 2331, line: 85 } },
      name: { value: "move", span: { start: 2331, end: 2335, line: 85 } },
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
                span: { start: 2350, end: 2359, line: 86 },
              },
              rest: [
                { op: "=", term: { termType: "numericLiteral", value: 1 } },
              ],
            },
            body: [
              {
                statementType: "letStatement",
                name: {
                  value: "x",
                  span: { start: 2383, end: 2384, line: 87 },
                },
                value: {
                  nodeType: "expression",
                  term: {
                    termType: "variable",
                    name: "x",
                    span: { start: 2387, end: 2388, line: 87 },
                  },
                  rest: [
                    { op: "-", term: { termType: "numericLiteral", value: 4 } },
                  ],
                },
                span: { start: 2379, end: 2393, line: 87 },
              },
              {
                statementType: "ifStatement",
                condition: {
                  nodeType: "expression",
                  term: {
                    termType: "variable",
                    name: "x",
                    span: { start: 2410, end: 2411, line: 88 },
                  },
                  rest: [
                    { op: "<", term: { termType: "numericLiteral", value: 0 } },
                  ],
                },
                body: [
                  {
                    statementType: "letStatement",
                    name: {
                      value: "x",
                      span: { start: 2423, end: 2424, line: 88 },
                    },
                    value: {
                      nodeType: "expression",
                      term: { termType: "numericLiteral", value: 0 },
                      rest: [],
                    },
                    span: { start: 2419, end: 2429, line: 88 },
                  },
                ],
                else: [],
              },
              {
                statementType: "doStatement",
                call: {
                  termType: "subroutineCall",
                  name: {
                    value: "Screen.setColor",
                    span: { start: 2447, end: 2462, line: 89 },
                  },
                  parameters: [
                    {
                      nodeType: "expression",
                      term: { termType: "keywordLiteral", value: "false" },
                      rest: [],
                    },
                  ],
                  span: { start: 2447, end: 2469, line: 89 },
                },
              },
              {
                statementType: "doStatement",
                call: {
                  termType: "subroutineCall",
                  name: {
                    value: "Screen.drawRectangle",
                    span: { start: 2486, end: 2506, line: 90 },
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
                            span: { start: 2508, end: 2509, line: 90 },
                          },
                          rest: [
                            {
                              op: "+",
                              term: {
                                termType: "variable",
                                name: "width",
                                span: { start: 2512, end: 2517, line: 90 },
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
                    {
                      nodeType: "expression",
                      term: {
                        termType: "variable",
                        name: "y",
                        span: { start: 2524, end: 2525, line: 90 },
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
                            name: "x",
                            span: { start: 2528, end: 2529, line: 90 },
                          },
                          rest: [
                            {
                              op: "+",
                              term: {
                                termType: "variable",
                                name: "width",
                                span: { start: 2532, end: 2537, line: 90 },
                              },
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
                      term: {
                        termType: "variable",
                        name: "y",
                        span: { start: 2544, end: 2545, line: 90 },
                      },
                      rest: [
                        {
                          op: "+",
                          term: {
                            termType: "variable",
                            name: "height",
                            span: { start: 2548, end: 2554, line: 90 },
                          },
                        },
                      ],
                    },
                  ],
                  span: { start: 2486, end: 2555, line: 90 },
                },
              },
              {
                statementType: "doStatement",
                call: {
                  termType: "subroutineCall",
                  name: {
                    value: "Screen.setColor",
                    span: { start: 2572, end: 2587, line: 91 },
                  },
                  parameters: [
                    {
                      nodeType: "expression",
                      term: { termType: "keywordLiteral", value: "true" },
                      rest: [],
                    },
                  ],
                  span: { start: 2572, end: 2593, line: 91 },
                },
              },
              {
                statementType: "doStatement",
                call: {
                  termType: "subroutineCall",
                  name: {
                    value: "Screen.drawRectangle",
                    span: { start: 2610, end: 2630, line: 92 },
                  },
                  parameters: [
                    {
                      nodeType: "expression",
                      term: {
                        termType: "variable",
                        name: "x",
                        span: { start: 2631, end: 2632, line: 92 },
                      },
                      rest: [],
                    },
                    {
                      nodeType: "expression",
                      term: {
                        termType: "variable",
                        name: "y",
                        span: { start: 2634, end: 2635, line: 92 },
                      },
                      rest: [],
                    },
                    {
                      nodeType: "expression",
                      term: {
                        termType: "variable",
                        name: "x",
                        span: { start: 2637, end: 2638, line: 92 },
                      },
                      rest: [
                        {
                          op: "+",
                          term: { termType: "numericLiteral", value: 3 },
                        },
                      ],
                    },
                    {
                      nodeType: "expression",
                      term: {
                        termType: "variable",
                        name: "y",
                        span: { start: 2644, end: 2645, line: 92 },
                      },
                      rest: [
                        {
                          op: "+",
                          term: {
                            termType: "variable",
                            name: "height",
                            span: { start: 2648, end: 2654, line: 92 },
                          },
                        },
                      ],
                    },
                  ],
                  span: { start: 2610, end: 2655, line: 92 },
                },
              },
            ],
            else: [
              {
                statementType: "letStatement",
                name: {
                  value: "x",
                  span: { start: 2698, end: 2699, line: 95 },
                },
                value: {
                  nodeType: "expression",
                  term: {
                    termType: "variable",
                    name: "x",
                    span: { start: 2702, end: 2703, line: 95 },
                  },
                  rest: [
                    { op: "+", term: { termType: "numericLiteral", value: 4 } },
                  ],
                },
                span: { start: 2694, end: 2708, line: 95 },
              },
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
                        span: { start: 2726, end: 2727, line: 96 },
                      },
                      rest: [
                        {
                          op: "+",
                          term: {
                            termType: "variable",
                            name: "width",
                            span: { start: 2730, end: 2735, line: 96 },
                          },
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
                    name: {
                      value: "x",
                      span: { start: 2750, end: 2751, line: 96 },
                    },
                    value: {
                      nodeType: "expression",
                      term: { termType: "numericLiteral", value: 511 },
                      rest: [
                        {
                          op: "-",
                          term: {
                            termType: "variable",
                            name: "width",
                            span: { start: 2760, end: 2765, line: 96 },
                          },
                        },
                      ],
                    },
                    span: { start: 2746, end: 2766, line: 96 },
                  },
                ],
                else: [],
              },
              {
                statementType: "doStatement",
                call: {
                  termType: "subroutineCall",
                  name: {
                    value: "Screen.setColor",
                    span: { start: 2784, end: 2799, line: 97 },
                  },
                  parameters: [
                    {
                      nodeType: "expression",
                      term: { termType: "keywordLiteral", value: "false" },
                      rest: [],
                    },
                  ],
                  span: { start: 2784, end: 2806, line: 97 },
                },
              },
              {
                statementType: "doStatement",
                call: {
                  termType: "subroutineCall",
                  name: {
                    value: "Screen.drawRectangle",
                    span: { start: 2823, end: 2843, line: 98 },
                  },
                  parameters: [
                    {
                      nodeType: "expression",
                      term: {
                        termType: "variable",
                        name: "x",
                        span: { start: 2844, end: 2845, line: 98 },
                      },
                      rest: [
                        {
                          op: "-",
                          term: { termType: "numericLiteral", value: 4 },
                        },
                      ],
                    },
                    {
                      nodeType: "expression",
                      term: {
                        termType: "variable",
                        name: "y",
                        span: { start: 2851, end: 2852, line: 98 },
                      },
                      rest: [],
                    },
                    {
                      nodeType: "expression",
                      term: {
                        termType: "variable",
                        name: "x",
                        span: { start: 2854, end: 2855, line: 98 },
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
                        span: { start: 2861, end: 2862, line: 98 },
                      },
                      rest: [
                        {
                          op: "+",
                          term: {
                            termType: "variable",
                            name: "height",
                            span: { start: 2865, end: 2871, line: 98 },
                          },
                        },
                      ],
                    },
                  ],
                  span: { start: 2823, end: 2872, line: 98 },
                },
              },
              {
                statementType: "doStatement",
                call: {
                  termType: "subroutineCall",
                  name: {
                    value: "Screen.setColor",
                    span: { start: 2889, end: 2904, line: 99 },
                  },
                  parameters: [
                    {
                      nodeType: "expression",
                      term: { termType: "keywordLiteral", value: "true" },
                      rest: [],
                    },
                  ],
                  span: { start: 2889, end: 2910, line: 99 },
                },
              },
              {
                statementType: "doStatement",
                call: {
                  termType: "subroutineCall",
                  name: {
                    value: "Screen.drawRectangle",
                    span: { start: 2927, end: 2947, line: 100 },
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
                            span: { start: 2949, end: 2950, line: 100 },
                          },
                          rest: [
                            {
                              op: "+",
                              term: {
                                termType: "variable",
                                name: "width",
                                span: { start: 2953, end: 2958, line: 100 },
                              },
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
                      term: {
                        termType: "variable",
                        name: "y",
                        span: { start: 2965, end: 2966, line: 100 },
                      },
                      rest: [],
                    },
                    {
                      nodeType: "expression",
                      term: {
                        termType: "variable",
                        name: "x",
                        span: { start: 2968, end: 2969, line: 100 },
                      },
                      rest: [
                        {
                          op: "+",
                          term: {
                            termType: "variable",
                            name: "width",
                            span: { start: 2972, end: 2977, line: 100 },
                          },
                        },
                      ],
                    },
                    {
                      nodeType: "expression",
                      term: {
                        termType: "variable",
                        name: "y",
                        span: { start: 2979, end: 2980, line: 100 },
                      },
                      rest: [
                        {
                          op: "+",
                          term: {
                            termType: "variable",
                            name: "height",
                            span: { start: 2983, end: 2989, line: 100 },
                          },
                        },
                      ],
                    },
                  ],
                  span: { start: 2927, end: 2990, line: 100 },
                },
              },
            ],
          },
          {
            statementType: "returnStatement",
            span: { start: 3010, end: 3017, line: 102 },
          },
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
    neg
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
    if-goto Bat_1
    push this 0
    push constant 4
    sub
    pop this 0
    push this 0
    push constant 0
    lt
    not
    if-goto Bat_3
    push constant 0
    pop this 0
    goto Bat_2
label Bat_3
label Bat_2
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
    neg
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
    goto Bat_0
label Bat_1
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
    if-goto Bat_5
    push constant 511
    push this 2
    sub
    pop this 0
    goto Bat_4
label Bat_5
label Bat_4
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
    neg
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
label Bat_0
    push constant 0
    return`;

export const jack = `// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/11/Pong/Ball.jack
// (Same as projects/9/Pong/Ball.jack)
/**
 * A graphical ball in a Pong game. Characterized by a screen location and 
 * distance of last destination. Has methods for drawing, erasing and moving
 * on the screen. The ball is displayed as a filled, 6-by-6 pixles rectangle. 
 */
class Ball {

    field int x, y;               // the ball's screen location (in pixels)
    field int lengthx, lengthy;   // distance of last destination (in pixels)

    field int d, straightD, diagonalD;   // used for straight line movement computation
    field boolean invert, positivex, positivey;   // (same)
   
    field int leftWall, rightWall, topWall, bottomWall;  // wall locations
   
    field int wall;   // last wall that the ball was bounced off of

    /** Constructs a new ball with the given initial location and wall locations. */
    constructor Ball new(int Ax, int Ay,
                         int AleftWall, int ArightWall, int AtopWall, int AbottomWall) {    	
      let x = Ax;		
      let y = Ay;
      let leftWall = AleftWall;
      let rightWall = ArightWall - 6;    // -6 for ball size
      let topWall = AtopWall; 
      let bottomWall = AbottomWall - 6;  // -6 for ball size
      let wall = 0;
        do show();
        return this;
    }

    /** Deallocates the Ball's memory. */
    method void dispose() {
        do Memory.deAlloc(this);
        return;
    }

    /** Shows the ball. */
    method void show() {
        do Screen.setColor(true);
        do draw();
        return;
    }

    /** Hides the ball. */
    method void hide() {
        do Screen.setColor(false);
      do draw();
        return;
    }

    /** Draws the ball. */
    method void draw() {
      do Screen.drawRectangle(x, y, x + 5, y + 5);
      return;
    }

    /** Returns the ball's left edge. */
    method int getLeft() {
        return x;
    }

    /** Returns the ball's right edge. */
    method int getRight() {
        return x + 5;
    }

    /** Computes and sets the ball's destination. */
    method void setDestination(int destx, int desty) {
        var int dx, dy, temp;
        let lengthx = destx - x;
      let lengthy = desty - y;
        let dx = Math.abs(lengthx);
        let dy = Math.abs(lengthy);
        let invert = (dx < dy);

        if (invert) {
            let temp = dx; // swap dx, dy
            let dx = dy;
            let dy = temp;
             let positivex = (y < desty);
            let positivey = (x < destx);
        }
        else {
          let positivex = (x < destx);
            let positivey = (y < desty);
        }

        let d = (2 * dy) - dx;
        let straightD = 2 * dy;
        let diagonalD = 2 * (dy - dx);

      return;
    }

    /**
     * Moves the ball one step towards its destination.
     * If the ball has reached a wall, returns 0.
     * Else, returns a value according to the wall:
     * 1 (left wall), 2 (right wall), 3 (top wall), 4 (bottom wall).
     */
    method int move() {

      do hide();

        if (d < 0) { let d = d + straightD; }
        else {
            let d = d + diagonalD;

            if (positivey) {
                if (invert) { let x = x + 4; }
                else { let y = y + 4; }
            }
            else {
                if (invert) { let x = x - 4; }
                else { let y = y - 4; }
            }
      }

        if (positivex) {
            if (invert) { let y = y + 4; }
            else { let x = x + 4; }
      }
      else {
            if (invert) { let y = y - 4; }
            else { let x = x - 4; }
      }

      if (~(x > leftWall)) {
          let wall = 1;    
          let x = leftWall;
      }
        if (~(x < rightWall)) {
          let wall = 2;    
          let x = rightWall;
      }
        if (~(y > topWall)) {
            let wall = 3;    
          let y = topWall;
        }
        if (~(y < bottomWall)) {
            let wall = 4;    
          let y = bottomWall;
        }

      do show();

      return wall;
    }

    /**
     * Bounces off the current wall: sets the new destination
     * of the ball according to the ball's angle and the given
     * bouncing direction (-1/0/1=left/center/right or up/center/down).
     */
    method void bounce(int bouncingDirection) {
        var int newx, newy, divLengthx, divLengthy, factor;

      // Since results are too big, divides by 10
        let divLengthx = lengthx / 10;
        let divLengthy = lengthy / 10;
      if (bouncingDirection = 0) { let factor = 10; }
      else {
          if (((~(lengthx < 0)) & (bouncingDirection = 1)) | ((lengthx < 0) & (bouncingDirection = (-1)))) {
                let factor = 20; // bounce direction is in ball direction
            }
          else { let factor = 5; } // bounce direction is against ball direction
      }

      if (wall = 1) {
          let newx = 506;
          let newy = (divLengthy * (-50)) / divLengthx;
            let newy = y + (newy * factor);
      }
        else {
            if (wall = 2) {
                let newx = 0;
                let newy = (divLengthy * 50) / divLengthx;
                let newy = y + (newy * factor);
          }
          else {
                if (wall = 3) {
                let newy = 250;
                let newx = (divLengthx * (-25)) / divLengthy;
                    let newx = x + (newx * factor);
            }
                else { // assumes wall = 4
                let newy = 0;
                let newx = (divLengthx * 25) / divLengthy;
                    let newx = x + (newx * factor);
            }
            }
        }

        do setDestination(newx, newy);
        return;
    }
}`;

export const parsed = {
  name: "Ball",
  varDecs: [
    { varType: "field", type: "int", names: ["x", "y"] },
    { varType: "field", type: "int", names: ["lengthx", "lengthy"] },
    { varType: "field", type: "int", names: ["d", "straightD", "diagonalD"] },
    {
      varType: "field",
      type: "boolean",
      names: ["invert", "positivex", "positivey"],
    },
    {
      varType: "field",
      type: "int",
      names: ["leftWall", "rightWall", "topWall", "bottomWall"],
    },
    { varType: "field", type: "int", names: ["wall"] },
  ],
  subroutines: [
    {
      type: "constructor",
      returnType: "Ball",
      name: "new",
      parameters: [
        { type: "int", name: "Ax" },
        { type: "int", name: "Ay" },
        { type: "int", name: "AleftWall" },
        { type: "int", name: "ArightWall" },
        { type: "int", name: "AtopWall" },
        { type: "int", name: "AbottomWall" },
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
            name: "leftWall",
            value: {
              nodeType: "expression",
              term: { termType: "variable", name: "AleftWall" },
              rest: [],
            },
          },
          {
            statementType: "letStatement",
            name: "rightWall",
            value: {
              nodeType: "expression",
              term: { termType: "variable", name: "ArightWall" },
              rest: [
                { op: "-", term: { termType: "numericLiteral", value: 6 } },
              ],
            },
          },
          {
            statementType: "letStatement",
            name: "topWall",
            value: {
              nodeType: "expression",
              term: { termType: "variable", name: "AtopWall" },
              rest: [],
            },
          },
          {
            statementType: "letStatement",
            name: "bottomWall",
            value: {
              nodeType: "expression",
              term: { termType: "variable", name: "AbottomWall" },
              rest: [
                { op: "-", term: { termType: "numericLiteral", value: 6 } },
              ],
            },
          },
          {
            statementType: "letStatement",
            name: "wall",
            value: {
              nodeType: "expression",
              term: { termType: "numericLiteral", value: 0 },
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
                      term: { termType: "numericLiteral", value: 5 },
                    },
                  ],
                },
                {
                  nodeType: "expression",
                  term: { termType: "variable", name: "y" },
                  rest: [
                    {
                      op: "+",
                      term: { termType: "numericLiteral", value: 5 },
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
                { op: "+", term: { termType: "numericLiteral", value: 5 } },
              ],
            },
          },
        ],
      },
    },
    {
      type: "method",
      returnType: "void",
      name: "setDestination",
      parameters: [
        { type: "int", name: "destx" },
        { type: "int", name: "desty" },
      ],
      body: {
        varDecs: [{ type: "int", names: ["dx", "dy", "temp"] }],
        statements: [
          {
            statementType: "letStatement",
            name: "lengthx",
            value: {
              nodeType: "expression",
              term: { termType: "variable", name: "destx" },
              rest: [{ op: "-", term: { termType: "variable", name: "x" } }],
            },
          },
          {
            statementType: "letStatement",
            name: "lengthy",
            value: {
              nodeType: "expression",
              term: { termType: "variable", name: "desty" },
              rest: [{ op: "-", term: { termType: "variable", name: "y" } }],
            },
          },
          {
            statementType: "letStatement",
            name: "dx",
            value: {
              nodeType: "expression",
              term: {
                termType: "subroutineCall",
                name: "Math.abs",
                parameters: [
                  {
                    nodeType: "expression",
                    term: { termType: "variable", name: "lengthx" },
                    rest: [],
                  },
                ],
              },
              rest: [],
            },
          },
          {
            statementType: "letStatement",
            name: "dy",
            value: {
              nodeType: "expression",
              term: {
                termType: "subroutineCall",
                name: "Math.abs",
                parameters: [
                  {
                    nodeType: "expression",
                    term: { termType: "variable", name: "lengthy" },
                    rest: [],
                  },
                ],
              },
              rest: [],
            },
          },
          {
            statementType: "letStatement",
            name: "invert",
            value: {
              nodeType: "expression",
              term: {
                termType: "groupedExpression",
                expression: {
                  nodeType: "expression",
                  term: { termType: "variable", name: "dx" },
                  rest: [
                    { op: "<", term: { termType: "variable", name: "dy" } },
                  ],
                },
              },
              rest: [],
            },
          },
          {
            statementType: "ifStatement",
            condition: {
              nodeType: "expression",
              term: { termType: "variable", name: "invert" },
              rest: [],
            },
            body: [
              {
                statementType: "letStatement",
                name: "temp",
                value: {
                  nodeType: "expression",
                  term: { termType: "variable", name: "dx" },
                  rest: [],
                },
              },
              {
                statementType: "letStatement",
                name: "dx",
                value: {
                  nodeType: "expression",
                  term: { termType: "variable", name: "dy" },
                  rest: [],
                },
              },
              {
                statementType: "letStatement",
                name: "dy",
                value: {
                  nodeType: "expression",
                  term: { termType: "variable", name: "temp" },
                  rest: [],
                },
              },
              {
                statementType: "letStatement",
                name: "positivex",
                value: {
                  nodeType: "expression",
                  term: {
                    termType: "groupedExpression",
                    expression: {
                      nodeType: "expression",
                      term: { termType: "variable", name: "y" },
                      rest: [
                        {
                          op: "<",
                          term: { termType: "variable", name: "desty" },
                        },
                      ],
                    },
                  },
                  rest: [],
                },
              },
              {
                statementType: "letStatement",
                name: "positivey",
                value: {
                  nodeType: "expression",
                  term: {
                    termType: "groupedExpression",
                    expression: {
                      nodeType: "expression",
                      term: { termType: "variable", name: "x" },
                      rest: [
                        {
                          op: "<",
                          term: { termType: "variable", name: "destx" },
                        },
                      ],
                    },
                  },
                  rest: [],
                },
              },
            ],
            else: [
              {
                statementType: "letStatement",
                name: "positivex",
                value: {
                  nodeType: "expression",
                  term: {
                    termType: "groupedExpression",
                    expression: {
                      nodeType: "expression",
                      term: { termType: "variable", name: "x" },
                      rest: [
                        {
                          op: "<",
                          term: { termType: "variable", name: "destx" },
                        },
                      ],
                    },
                  },
                  rest: [],
                },
              },
              {
                statementType: "letStatement",
                name: "positivey",
                value: {
                  nodeType: "expression",
                  term: {
                    termType: "groupedExpression",
                    expression: {
                      nodeType: "expression",
                      term: { termType: "variable", name: "y" },
                      rest: [
                        {
                          op: "<",
                          term: { termType: "variable", name: "desty" },
                        },
                      ],
                    },
                  },
                  rest: [],
                },
              },
            ],
          },
          {
            statementType: "letStatement",
            name: "d",
            value: {
              nodeType: "expression",
              term: {
                termType: "groupedExpression",
                expression: {
                  nodeType: "expression",
                  term: { termType: "numericLiteral", value: 2 },
                  rest: [
                    { op: "*", term: { termType: "variable", name: "dy" } },
                  ],
                },
              },
              rest: [{ op: "-", term: { termType: "variable", name: "dx" } }],
            },
          },
          {
            statementType: "letStatement",
            name: "straightD",
            value: {
              nodeType: "expression",
              term: { termType: "numericLiteral", value: 2 },
              rest: [{ op: "*", term: { termType: "variable", name: "dy" } }],
            },
          },
          {
            statementType: "letStatement",
            name: "diagonalD",
            value: {
              nodeType: "expression",
              term: { termType: "numericLiteral", value: 2 },
              rest: [
                {
                  op: "*",
                  term: {
                    termType: "groupedExpression",
                    expression: {
                      nodeType: "expression",
                      term: { termType: "variable", name: "dy" },
                      rest: [
                        {
                          op: "-",
                          term: { termType: "variable", name: "dx" },
                        },
                      ],
                    },
                  },
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
      returnType: "int",
      name: "move",
      parameters: [],
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
            statementType: "ifStatement",
            condition: {
              nodeType: "expression",
              term: { termType: "variable", name: "d" },
              rest: [
                { op: "<", term: { termType: "numericLiteral", value: 0 } },
              ],
            },
            body: [
              {
                statementType: "letStatement",
                name: "d",
                value: {
                  nodeType: "expression",
                  term: { termType: "variable", name: "d" },
                  rest: [
                    {
                      op: "+",
                      term: { termType: "variable", name: "straightD" },
                    },
                  ],
                },
              },
            ],
            else: [
              {
                statementType: "letStatement",
                name: "d",
                value: {
                  nodeType: "expression",
                  term: { termType: "variable", name: "d" },
                  rest: [
                    {
                      op: "+",
                      term: { termType: "variable", name: "diagonalD" },
                    },
                  ],
                },
              },
              {
                statementType: "ifStatement",
                condition: {
                  nodeType: "expression",
                  term: { termType: "variable", name: "positivey" },
                  rest: [],
                },
                body: [
                  {
                    statementType: "ifStatement",
                    condition: {
                      nodeType: "expression",
                      term: { termType: "variable", name: "invert" },
                      rest: [],
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
                              op: "+",
                              term: { termType: "numericLiteral", value: 4 },
                            },
                          ],
                        },
                      },
                    ],
                    else: [
                      {
                        statementType: "letStatement",
                        name: "y",
                        value: {
                          nodeType: "expression",
                          term: { termType: "variable", name: "y" },
                          rest: [
                            {
                              op: "+",
                              term: { termType: "numericLiteral", value: 4 },
                            },
                          ],
                        },
                      },
                    ],
                  },
                ],
                else: [
                  {
                    statementType: "ifStatement",
                    condition: {
                      nodeType: "expression",
                      term: { termType: "variable", name: "invert" },
                      rest: [],
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
                    ],
                    else: [
                      {
                        statementType: "letStatement",
                        name: "y",
                        value: {
                          nodeType: "expression",
                          term: { termType: "variable", name: "y" },
                          rest: [
                            {
                              op: "-",
                              term: { termType: "numericLiteral", value: 4 },
                            },
                          ],
                        },
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            statementType: "ifStatement",
            condition: {
              nodeType: "expression",
              term: { termType: "variable", name: "positivex" },
              rest: [],
            },
            body: [
              {
                statementType: "ifStatement",
                condition: {
                  nodeType: "expression",
                  term: { termType: "variable", name: "invert" },
                  rest: [],
                },
                body: [
                  {
                    statementType: "letStatement",
                    name: "y",
                    value: {
                      nodeType: "expression",
                      term: { termType: "variable", name: "y" },
                      rest: [
                        {
                          op: "+",
                          term: { termType: "numericLiteral", value: 4 },
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
                ],
              },
            ],
            else: [
              {
                statementType: "ifStatement",
                condition: {
                  nodeType: "expression",
                  term: { termType: "variable", name: "invert" },
                  rest: [],
                },
                body: [
                  {
                    statementType: "letStatement",
                    name: "y",
                    value: {
                      nodeType: "expression",
                      term: { termType: "variable", name: "y" },
                      rest: [
                        {
                          op: "-",
                          term: { termType: "numericLiteral", value: 4 },
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
                          op: "-",
                          term: { termType: "numericLiteral", value: 4 },
                        },
                      ],
                    },
                  },
                ],
              },
            ],
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
                    term: { termType: "variable", name: "x" },
                    rest: [
                      {
                        op: ">",
                        term: { termType: "variable", name: "leftWall" },
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
                name: "wall",
                value: {
                  nodeType: "expression",
                  term: { termType: "numericLiteral", value: 1 },
                  rest: [],
                },
              },
              {
                statementType: "letStatement",
                name: "x",
                value: {
                  nodeType: "expression",
                  term: { termType: "variable", name: "leftWall" },
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
              term: {
                termType: "unaryExpression",
                op: "~",
                term: {
                  termType: "groupedExpression",
                  expression: {
                    nodeType: "expression",
                    term: { termType: "variable", name: "x" },
                    rest: [
                      {
                        op: "<",
                        term: { termType: "variable", name: "rightWall" },
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
                name: "wall",
                value: {
                  nodeType: "expression",
                  term: { termType: "numericLiteral", value: 2 },
                  rest: [],
                },
              },
              {
                statementType: "letStatement",
                name: "x",
                value: {
                  nodeType: "expression",
                  term: { termType: "variable", name: "rightWall" },
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
              term: {
                termType: "unaryExpression",
                op: "~",
                term: {
                  termType: "groupedExpression",
                  expression: {
                    nodeType: "expression",
                    term: { termType: "variable", name: "y" },
                    rest: [
                      {
                        op: ">",
                        term: { termType: "variable", name: "topWall" },
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
                name: "wall",
                value: {
                  nodeType: "expression",
                  term: { termType: "numericLiteral", value: 3 },
                  rest: [],
                },
              },
              {
                statementType: "letStatement",
                name: "y",
                value: {
                  nodeType: "expression",
                  term: { termType: "variable", name: "topWall" },
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
              term: {
                termType: "unaryExpression",
                op: "~",
                term: {
                  termType: "groupedExpression",
                  expression: {
                    nodeType: "expression",
                    term: { termType: "variable", name: "y" },
                    rest: [
                      {
                        op: "<",
                        term: { termType: "variable", name: "bottomWall" },
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
                name: "wall",
                value: {
                  nodeType: "expression",
                  term: { termType: "numericLiteral", value: 4 },
                  rest: [],
                },
              },
              {
                statementType: "letStatement",
                name: "y",
                value: {
                  nodeType: "expression",
                  term: { termType: "variable", name: "bottomWall" },
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
              name: "show",
              parameters: [],
            },
          },
          {
            statementType: "returnStatement",
            value: {
              nodeType: "expression",
              term: { termType: "variable", name: "wall" },
              rest: [],
            },
          },
        ],
      },
    },
    {
      type: "method",
      returnType: "void",
      name: "bounce",
      parameters: [{ type: "int", name: "bouncingDirection" }],
      body: {
        varDecs: [
          {
            type: "int",
            names: ["newx", "newy", "divLengthx", "divLengthy", "factor"],
          },
        ],
        statements: [
          {
            statementType: "letStatement",
            name: "divLengthx",
            value: {
              nodeType: "expression",
              term: { termType: "variable", name: "lengthx" },
              rest: [
                { op: "/", term: { termType: "numericLiteral", value: 10 } },
              ],
            },
          },
          {
            statementType: "letStatement",
            name: "divLengthy",
            value: {
              nodeType: "expression",
              term: { termType: "variable", name: "lengthy" },
              rest: [
                { op: "/", term: { termType: "numericLiteral", value: 10 } },
              ],
            },
          },
          {
            statementType: "ifStatement",
            condition: {
              nodeType: "expression",
              term: { termType: "variable", name: "bouncingDirection" },
              rest: [
                { op: "=", term: { termType: "numericLiteral", value: 0 } },
              ],
            },
            body: [
              {
                statementType: "letStatement",
                name: "factor",
                value: {
                  nodeType: "expression",
                  term: { termType: "numericLiteral", value: 10 },
                  rest: [],
                },
              },
            ],
            else: [
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
                            termType: "unaryExpression",
                            op: "~",
                            term: {
                              termType: "groupedExpression",
                              expression: {
                                nodeType: "expression",
                                term: {
                                  termType: "variable",
                                  name: "lengthx",
                                },
                                rest: [
                                  {
                                    op: "<",
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
                      },
                      rest: [
                        {
                          op: "&",
                          term: {
                            termType: "groupedExpression",
                            expression: {
                              nodeType: "expression",
                              term: {
                                termType: "variable",
                                name: "bouncingDirection",
                              },
                              rest: [
                                {
                                  op: "=",
                                  term: {
                                    termType: "numericLiteral",
                                    value: 1,
                                  },
                                },
                              ],
                            },
                          },
                        },
                      ],
                    },
                  },
                  rest: [
                    {
                      op: "|",
                      term: {
                        termType: "groupedExpression",
                        expression: {
                          nodeType: "expression",
                          term: {
                            termType: "groupedExpression",
                            expression: {
                              nodeType: "expression",
                              term: { termType: "variable", name: "lengthx" },
                              rest: [
                                {
                                  op: "<",
                                  term: {
                                    termType: "numericLiteral",
                                    value: 0,
                                  },
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
                                    termType: "variable",
                                    name: "bouncingDirection",
                                  },
                                  rest: [
                                    {
                                      op: "=",
                                      term: {
                                        termType: "groupedExpression",
                                        expression: {
                                          nodeType: "expression",
                                          term: {
                                            termType: "unaryExpression",
                                            op: "-",
                                            term: {
                                              termType: "numericLiteral",
                                              value: 1,
                                            },
                                          },
                                          rest: [],
                                        },
                                      },
                                    },
                                  ],
                                },
                              },
                            },
                          ],
                        },
                      },
                    },
                  ],
                },
                body: [
                  {
                    statementType: "letStatement",
                    name: "factor",
                    value: {
                      nodeType: "expression",
                      term: { termType: "numericLiteral", value: 20 },
                      rest: [],
                    },
                  },
                ],
                else: [
                  {
                    statementType: "letStatement",
                    name: "factor",
                    value: {
                      nodeType: "expression",
                      term: { termType: "numericLiteral", value: 5 },
                      rest: [],
                    },
                  },
                ],
              },
            ],
          },
          {
            statementType: "ifStatement",
            condition: {
              nodeType: "expression",
              term: { termType: "variable", name: "wall" },
              rest: [
                { op: "=", term: { termType: "numericLiteral", value: 1 } },
              ],
            },
            body: [
              {
                statementType: "letStatement",
                name: "newx",
                value: {
                  nodeType: "expression",
                  term: { termType: "numericLiteral", value: 506 },
                  rest: [],
                },
              },
              {
                statementType: "letStatement",
                name: "newy",
                value: {
                  nodeType: "expression",
                  term: {
                    termType: "groupedExpression",
                    expression: {
                      nodeType: "expression",
                      term: { termType: "variable", name: "divLengthy" },
                      rest: [
                        {
                          op: "*",
                          term: {
                            termType: "groupedExpression",
                            expression: {
                              nodeType: "expression",
                              term: {
                                termType: "unaryExpression",
                                op: "-",
                                term: {
                                  termType: "numericLiteral",
                                  value: 50,
                                },
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
                      op: "/",
                      term: { termType: "variable", name: "divLengthx" },
                    },
                  ],
                },
              },
              {
                statementType: "letStatement",
                name: "newy",
                value: {
                  nodeType: "expression",
                  term: { termType: "variable", name: "y" },
                  rest: [
                    {
                      op: "+",
                      term: {
                        termType: "groupedExpression",
                        expression: {
                          nodeType: "expression",
                          term: { termType: "variable", name: "newy" },
                          rest: [
                            {
                              op: "*",
                              term: { termType: "variable", name: "factor" },
                            },
                          ],
                        },
                      },
                    },
                  ],
                },
              },
            ],
            else: [
              {
                statementType: "ifStatement",
                condition: {
                  nodeType: "expression",
                  term: { termType: "variable", name: "wall" },
                  rest: [
                    {
                      op: "=",
                      term: { termType: "numericLiteral", value: 2 },
                    },
                  ],
                },
                body: [
                  {
                    statementType: "letStatement",
                    name: "newx",
                    value: {
                      nodeType: "expression",
                      term: { termType: "numericLiteral", value: 0 },
                      rest: [],
                    },
                  },
                  {
                    statementType: "letStatement",
                    name: "newy",
                    value: {
                      nodeType: "expression",
                      term: {
                        termType: "groupedExpression",
                        expression: {
                          nodeType: "expression",
                          term: { termType: "variable", name: "divLengthy" },
                          rest: [
                            {
                              op: "*",
                              term: { termType: "numericLiteral", value: 50 },
                            },
                          ],
                        },
                      },
                      rest: [
                        {
                          op: "/",
                          term: { termType: "variable", name: "divLengthx" },
                        },
                      ],
                    },
                  },
                  {
                    statementType: "letStatement",
                    name: "newy",
                    value: {
                      nodeType: "expression",
                      term: { termType: "variable", name: "y" },
                      rest: [
                        {
                          op: "+",
                          term: {
                            termType: "groupedExpression",
                            expression: {
                              nodeType: "expression",
                              term: { termType: "variable", name: "newy" },
                              rest: [
                                {
                                  op: "*",
                                  term: {
                                    termType: "variable",
                                    name: "factor",
                                  },
                                },
                              ],
                            },
                          },
                        },
                      ],
                    },
                  },
                ],
                else: [
                  {
                    statementType: "ifStatement",
                    condition: {
                      nodeType: "expression",
                      term: { termType: "variable", name: "wall" },
                      rest: [
                        {
                          op: "=",
                          term: { termType: "numericLiteral", value: 3 },
                        },
                      ],
                    },
                    body: [
                      {
                        statementType: "letStatement",
                        name: "newy",
                        value: {
                          nodeType: "expression",
                          term: { termType: "numericLiteral", value: 250 },
                          rest: [],
                        },
                      },
                      {
                        statementType: "letStatement",
                        name: "newx",
                        value: {
                          nodeType: "expression",
                          term: {
                            termType: "groupedExpression",
                            expression: {
                              nodeType: "expression",
                              term: {
                                termType: "variable",
                                name: "divLengthx",
                              },
                              rest: [
                                {
                                  op: "*",
                                  term: {
                                    termType: "groupedExpression",
                                    expression: {
                                      nodeType: "expression",
                                      term: {
                                        termType: "unaryExpression",
                                        op: "-",
                                        term: {
                                          termType: "numericLiteral",
                                          value: 25,
                                        },
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
                              op: "/",
                              term: {
                                termType: "variable",
                                name: "divLengthy",
                              },
                            },
                          ],
                        },
                      },
                      {
                        statementType: "letStatement",
                        name: "newx",
                        value: {
                          nodeType: "expression",
                          term: { termType: "variable", name: "x" },
                          rest: [
                            {
                              op: "+",
                              term: {
                                termType: "groupedExpression",
                                expression: {
                                  nodeType: "expression",
                                  term: {
                                    termType: "variable",
                                    name: "newx",
                                  },
                                  rest: [
                                    {
                                      op: "*",
                                      term: {
                                        termType: "variable",
                                        name: "factor",
                                      },
                                    },
                                  ],
                                },
                              },
                            },
                          ],
                        },
                      },
                    ],
                    else: [
                      {
                        statementType: "letStatement",
                        name: "newy",
                        value: {
                          nodeType: "expression",
                          term: { termType: "numericLiteral", value: 0 },
                          rest: [],
                        },
                      },
                      {
                        statementType: "letStatement",
                        name: "newx",
                        value: {
                          nodeType: "expression",
                          term: {
                            termType: "groupedExpression",
                            expression: {
                              nodeType: "expression",
                              term: {
                                termType: "variable",
                                name: "divLengthx",
                              },
                              rest: [
                                {
                                  op: "*",
                                  term: {
                                    termType: "numericLiteral",
                                    value: 25,
                                  },
                                },
                              ],
                            },
                          },
                          rest: [
                            {
                              op: "/",
                              term: {
                                termType: "variable",
                                name: "divLengthy",
                              },
                            },
                          ],
                        },
                      },
                      {
                        statementType: "letStatement",
                        name: "newx",
                        value: {
                          nodeType: "expression",
                          term: { termType: "variable", name: "x" },
                          rest: [
                            {
                              op: "+",
                              term: {
                                termType: "groupedExpression",
                                expression: {
                                  nodeType: "expression",
                                  term: {
                                    termType: "variable",
                                    name: "newx",
                                  },
                                  rest: [
                                    {
                                      op: "*",
                                      term: {
                                        termType: "variable",
                                        name: "factor",
                                      },
                                    },
                                  ],
                                },
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            statementType: "doStatement",
            call: {
              termType: "subroutineCall",
              name: "setDestination",
              parameters: [
                {
                  nodeType: "expression",
                  term: { termType: "variable", name: "newx" },
                  rest: [],
                },
                {
                  nodeType: "expression",
                  term: { termType: "variable", name: "newy" },
                  rest: [],
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

export const compiled = `function Ball.new 0
push constant 15
call Memory.alloc 1
pop pointer 0
push argument 0
pop this 0
push argument 1
pop this 1
push argument 2
pop this 10
push argument 3
push constant 6
sub
pop this 11
push argument 4
pop this 12
push argument 5
push constant 6
sub
pop this 13
push constant 0
pop this 14
push pointer 0
call Ball.show 1
pop temp 0
push pointer 0
return
function Ball.dispose 0
push argument 0
pop pointer 0
push pointer 0
call Memory.deAlloc 1
pop temp 0
push constant 0
return
function Ball.show 0
push argument 0
pop pointer 0
push constant 1
call Screen.setColor 1
pop temp 0
push pointer 0
call Ball.draw 1
pop temp 0
push constant 0
return
function Ball.hide 0
push argument 0
pop pointer 0
push constant 0
call Screen.setColor 1
pop temp 0
push pointer 0
call Ball.draw 1
pop temp 0
push constant 0
return
function Ball.draw 0
push argument 0
pop pointer 0
push this 0
push this 1
push this 0
push constant 5
add
push this 1
push constant 5
add
call Screen.drawRectangle 4
pop temp 0
push constant 0
return
function Ball.getLeft 0
push argument 0
pop pointer 0
push this 0
return
function Ball.getRight 0
push argument 0
pop pointer 0
push this 0
push constant 5
add
return
function Ball.setDestination 3
push argument 0
pop pointer 0
push argument 1
push this 0
sub
pop this 2
push argument 2
push this 1
sub
pop this 3
push this 2
call Math.abs 1
pop local 0
push this 3
call Math.abs 1
pop local 1
push local 0
push local 1
lt
pop this 7
push this 7
not
if-goto L1
push local 0
pop local 2
push local 1
pop local 0
push local 2
pop local 1
push this 1
push argument 2
lt
pop this 8
push this 0
push argument 1
lt
pop this 9
goto L0
label L1
push this 0
push argument 1
lt
pop this 8
push this 1
push argument 2
lt
pop this 9
label L0
push constant 2
push local 1
call Math.multiply 2
push local 0
sub
pop this 4
push constant 2
push local 1
call Math.multiply 2
pop this 5
push constant 2
push local 1
push local 0
sub
call Math.multiply 2
pop this 6
push constant 0
return
function Ball.move 0
push argument 0
pop pointer 0
push pointer 0
call Ball.hide 1
pop temp 0
push this 4
push constant 0
lt
not
if-goto L3
push this 4
push this 5
add
pop this 4
goto L2
label L3
push this 4
push this 6
add
pop this 4
push this 9
not
if-goto L5
push this 7
not
if-goto L7
push this 0
push constant 4
add
pop this 0
goto L6
label L7
push this 1
push constant 4
add
pop this 1
label L6
goto L4
label L5
push this 7
not
if-goto L9
push this 0
push constant 4
sub
pop this 0
goto L8
label L9
push this 1
push constant 4
sub
pop this 1
label L8
label L4
label L2
push this 8
not
if-goto L11
push this 7
not
if-goto L13
push this 1
push constant 4
add
pop this 1
goto L12
label L13
push this 0
push constant 4
add
pop this 0
label L12
goto L10
label L11
push this 7
not
if-goto L15
push this 1
push constant 4
sub
pop this 1
goto L14
label L15
push this 0
push constant 4
sub
pop this 0
label L14
label L10
push this 0
push this 10
gt
not
not
if-goto L17
push constant 1
pop this 14
push this 10
pop this 0
goto L16
label L17
label L16
push this 0
push this 11
lt
not
not
if-goto L19
push constant 2
pop this 14
push this 11
pop this 0
goto L18
label L19
label L18
push this 1
push this 12
gt
not
not
if-goto L21
push constant 3
pop this 14
push this 12
pop this 1
goto L20
label L21
label L20
push this 1
push this 13
lt
not
not
if-goto L23
push constant 4
pop this 14
push this 13
pop this 1
goto L22
label L23
label L22
push pointer 0
call Ball.show 1
pop temp 0
push this 14
return
function Ball.bounce 5
push argument 0
pop pointer 0
push this 2
push constant 10
call Math.divide 2
pop local 2
push this 3
push constant 10
call Math.divide 2
pop local 3
push argument 1
push constant 0
eq
not
if-goto L25
push constant 10
pop local 4
goto L24
label L25
push this 2
push constant 0
lt
not
push argument 1
push constant 1
eq
and
push this 2
push constant 0
lt
push argument 1
push constant 1
neg
eq
and
or
not
if-goto L27
push constant 20
pop local 4
goto L26
label L27
push constant 5
pop local 4
label L26
label L24
push this 14
push constant 1
eq
not
if-goto L29
push constant 506
pop local 0
push local 3
push constant 50
neg
call Math.multiply 2
push local 2
call Math.divide 2
pop local 1
push this 1
push local 1
push local 4
call Math.multiply 2
add
pop local 1
goto L28
label L29
push this 14
push constant 2
eq
not
if-goto L31
push constant 0
pop local 0
push local 3
push constant 50
call Math.multiply 2
push local 2
call Math.divide 2
pop local 1
push this 1
push local 1
push local 4
call Math.multiply 2
add
pop local 1
goto L30
label L31
push this 14
push constant 3
eq
not
if-goto L33
push constant 250
pop local 1
push local 2
push constant 25
neg
call Math.multiply 2
push local 3
call Math.divide 2
pop local 0
push this 0
push local 0
push local 4
call Math.multiply 2
add
pop local 0
goto L32
label L33
push constant 0
pop local 1
push local 2
push constant 25
call Math.multiply 2
push local 3
call Math.divide 2
pop local 0
push this 0
push local 0
push local 4
call Math.multiply 2
add
pop local 0
label L32
label L30
label L28
push pointer 0
push local 0
push local 1
call Ball.setDestination 3
pop temp 0
push constant 0
return`;

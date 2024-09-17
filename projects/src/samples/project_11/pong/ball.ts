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
  name: { value: "Ball", span: { start: 459, end: 463, line: 11 } },
  varDecs: [
    {
      varType: "field",
      type: { value: "int", span: { start: 477, end: 481, line: 13 } },
      names: ["x", "y"],
    },
    {
      varType: "field",
      type: { value: "int", span: { start: 553, end: 557, line: 14 } },
      names: ["lengthx", "lengthy"],
    },
    {
      varType: "field",
      type: { value: "int", span: { start: 632, end: 636, line: 16 } },
      names: ["d", "straightD", "diagonalD"],
    },
    {
      varType: "field",
      type: { value: "boolean", span: { start: 720, end: 728, line: 17 } },
      names: ["invert", "positivex", "positivey"],
    },
    {
      varType: "field",
      type: { value: "int", span: { start: 784, end: 788, line: 19 } },
      names: ["leftWall", "rightWall", "topWall", "bottomWall"],
    },
    {
      varType: "field",
      type: { value: "int", span: { start: 863, end: 867, line: 21 } },
      names: ["wall"],
    },
  ],
  subroutines: [
    {
      type: "constructor",
      returnType: { value: "Ball", span: { start: 1023, end: 1028, line: 24 } },
      name: { value: "new", span: { start: 1028, end: 1031, line: 24 } },
      parameters: [
        {
          type: { value: "int", span: { start: 1032, end: 1036, line: 24 } },
          name: "Ax",
        },
        {
          type: { value: "int", span: { start: 1040, end: 1044, line: 24 } },
          name: "Ay",
        },
        {
          type: { value: "int", span: { start: 1073, end: 1077, line: 25 } },
          name: "AleftWall",
        },
        {
          type: { value: "int", span: { start: 1088, end: 1092, line: 25 } },
          name: "ArightWall",
        },
        {
          type: { value: "int", span: { start: 1104, end: 1108, line: 25 } },
          name: "AtopWall",
        },
        {
          type: { value: "int", span: { start: 1118, end: 1122, line: 25 } },
          name: "AbottomWall",
        },
      ],
      body: {
        varDecs: [],
        statements: [
          {
            statementType: "letStatement",
            name: { value: "x", span: { start: 1152, end: 1153, line: 26 } },
            value: {
              nodeType: "expression",
              term: {
                termType: "variable",
                name: "Ax",
                span: { start: 1156, end: 1158, line: 26 },
              },
              rest: [],
            },
            span: { start: 1148, end: 1159, line: 26 },
          },
          {
            statementType: "letStatement",
            name: { value: "y", span: { start: 1172, end: 1173, line: 27 } },
            value: {
              nodeType: "expression",
              term: {
                termType: "variable",
                name: "Ay",
                span: { start: 1176, end: 1178, line: 27 },
              },
              rest: [],
            },
            span: { start: 1168, end: 1179, line: 27 },
          },
          {
            statementType: "letStatement",
            name: {
              value: "leftWall",
              span: { start: 1190, end: 1198, line: 28 },
            },
            value: {
              nodeType: "expression",
              term: {
                termType: "variable",
                name: "AleftWall",
                span: { start: 1201, end: 1210, line: 28 },
              },
              rest: [],
            },
            span: { start: 1186, end: 1211, line: 28 },
          },
          {
            statementType: "letStatement",
            name: {
              value: "rightWall",
              span: { start: 1222, end: 1231, line: 29 },
            },
            value: {
              nodeType: "expression",
              term: {
                termType: "variable",
                name: "ArightWall",
                span: { start: 1234, end: 1244, line: 29 },
              },
              rest: [
                { op: "-", term: { termType: "numericLiteral", value: 6 } },
              ],
            },
            span: { start: 1218, end: 1249, line: 29 },
          },
          {
            statementType: "letStatement",
            name: {
              value: "topWall",
              span: { start: 1283, end: 1290, line: 30 },
            },
            value: {
              nodeType: "expression",
              term: {
                termType: "variable",
                name: "AtopWall",
                span: { start: 1293, end: 1301, line: 30 },
              },
              rest: [],
            },
            span: { start: 1279, end: 1302, line: 30 },
          },
          {
            statementType: "letStatement",
            name: {
              value: "bottomWall",
              span: { start: 1314, end: 1324, line: 31 },
            },
            value: {
              nodeType: "expression",
              term: {
                termType: "variable",
                name: "AbottomWall",
                span: { start: 1327, end: 1338, line: 31 },
              },
              rest: [
                { op: "-", term: { termType: "numericLiteral", value: 6 } },
              ],
            },
            span: { start: 1310, end: 1343, line: 31 },
          },
          {
            statementType: "letStatement",
            name: { value: "wall", span: { start: 1375, end: 1379, line: 32 } },
            value: {
              nodeType: "expression",
              term: { termType: "numericLiteral", value: 0 },
              rest: [],
            },
            span: { start: 1371, end: 1384, line: 32 },
          },
          {
            statementType: "doStatement",
            call: {
              termType: "subroutineCall",
              name: {
                value: "show",
                span: { start: 1396, end: 1400, line: 33 },
              },
              parameters: [],
              span: { start: 1396, end: 1402, line: 33 },
            },
          },
          {
            statementType: "returnStatement",
            value: {
              nodeType: "expression",
              term: { termType: "keywordLiteral", value: "this" },
              rest: [],
            },
            span: { start: 1412, end: 1424, line: 34 },
          },
        ],
      },
    },
    {
      type: "method",
      returnType: { value: "void", span: { start: 1485, end: 1490, line: 38 } },
      name: { value: "dispose", span: { start: 1490, end: 1497, line: 38 } },
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
                span: { start: 1513, end: 1527, line: 39 },
              },
              parameters: [
                {
                  nodeType: "expression",
                  term: { termType: "keywordLiteral", value: "this" },
                  rest: [],
                },
              ],
              span: { start: 1513, end: 1533, line: 39 },
            },
          },
          {
            statementType: "returnStatement",
            span: { start: 1543, end: 1550, line: 40 },
          },
        ],
      },
    },
    {
      type: "method",
      returnType: { value: "void", span: { start: 1596, end: 1601, line: 44 } },
      name: { value: "show", span: { start: 1601, end: 1605, line: 44 } },
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
                span: { start: 1621, end: 1636, line: 45 },
              },
              parameters: [
                {
                  nodeType: "expression",
                  term: { termType: "keywordLiteral", value: "true" },
                  rest: [],
                },
              ],
              span: { start: 1621, end: 1642, line: 45 },
            },
          },
          {
            statementType: "doStatement",
            call: {
              termType: "subroutineCall",
              name: {
                value: "draw",
                span: { start: 1655, end: 1659, line: 46 },
              },
              parameters: [],
              span: { start: 1655, end: 1661, line: 46 },
            },
          },
          {
            statementType: "returnStatement",
            span: { start: 1671, end: 1678, line: 47 },
          },
        ],
      },
    },
    {
      type: "method",
      returnType: { value: "void", span: { start: 1724, end: 1729, line: 51 } },
      name: { value: "hide", span: { start: 1729, end: 1733, line: 51 } },
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
                span: { start: 1749, end: 1764, line: 52 },
              },
              parameters: [
                {
                  nodeType: "expression",
                  term: { termType: "keywordLiteral", value: "false" },
                  rest: [],
                },
              ],
              span: { start: 1749, end: 1771, line: 52 },
            },
          },
          {
            statementType: "doStatement",
            call: {
              termType: "subroutineCall",
              name: {
                value: "draw",
                span: { start: 1782, end: 1786, line: 53 },
              },
              parameters: [],
              span: { start: 1782, end: 1788, line: 53 },
            },
          },
          {
            statementType: "returnStatement",
            span: { start: 1798, end: 1805, line: 54 },
          },
        ],
      },
    },
    {
      type: "method",
      returnType: { value: "void", span: { start: 1851, end: 1856, line: 58 } },
      name: { value: "draw", span: { start: 1856, end: 1860, line: 58 } },
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
                span: { start: 1874, end: 1894, line: 59 },
              },
              parameters: [
                {
                  nodeType: "expression",
                  term: {
                    termType: "variable",
                    name: "x",
                    span: { start: 1895, end: 1896, line: 59 },
                  },
                  rest: [],
                },
                {
                  nodeType: "expression",
                  term: {
                    termType: "variable",
                    name: "y",
                    span: { start: 1898, end: 1899, line: 59 },
                  },
                  rest: [],
                },
                {
                  nodeType: "expression",
                  term: {
                    termType: "variable",
                    name: "x",
                    span: { start: 1901, end: 1902, line: 59 },
                  },
                  rest: [
                    { op: "+", term: { termType: "numericLiteral", value: 5 } },
                  ],
                },
                {
                  nodeType: "expression",
                  term: {
                    termType: "variable",
                    name: "y",
                    span: { start: 1908, end: 1909, line: 59 },
                  },
                  rest: [
                    { op: "+", term: { termType: "numericLiteral", value: 5 } },
                  ],
                },
              ],
              span: { start: 1874, end: 1914, line: 59 },
            },
          },
          {
            statementType: "returnStatement",
            span: { start: 1922, end: 1929, line: 60 },
          },
        ],
      },
    },
    {
      type: "method",
      returnType: { value: "int", span: { start: 1989, end: 1993, line: 64 } },
      name: { value: "getLeft", span: { start: 1993, end: 2000, line: 64 } },
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
                span: { start: 2020, end: 2021, line: 65 },
              },
              rest: [],
            },
            span: { start: 2013, end: 2022, line: 65 },
          },
        ],
      },
    },
    {
      type: "method",
      returnType: { value: "int", span: { start: 2083, end: 2087, line: 69 } },
      name: { value: "getRight", span: { start: 2087, end: 2095, line: 69 } },
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
                span: { start: 2115, end: 2116, line: 70 },
              },
              rest: [
                { op: "+", term: { termType: "numericLiteral", value: 5 } },
              ],
            },
            span: { start: 2108, end: 2121, line: 70 },
          },
        ],
      },
    },
    {
      type: "method",
      returnType: { value: "void", span: { start: 2193, end: 2198, line: 74 } },
      name: {
        value: "setDestination",
        span: { start: 2198, end: 2212, line: 74 },
      },
      parameters: [
        {
          type: { value: "int", span: { start: 2213, end: 2217, line: 74 } },
          name: "destx",
        },
        {
          type: { value: "int", span: { start: 2224, end: 2228, line: 74 } },
          name: "desty",
        },
      ],
      body: {
        varDecs: [
          {
            type: { value: "int", span: { start: 2249, end: 2253, line: 75 } },
            names: ["dx", "dy", "temp"],
          },
        ],
        statements: [
          {
            statementType: "letStatement",
            name: {
              value: "lengthx",
              span: { start: 2279, end: 2286, line: 76 },
            },
            value: {
              nodeType: "expression",
              term: {
                termType: "variable",
                name: "destx",
                span: { start: 2289, end: 2294, line: 76 },
              },
              rest: [
                {
                  op: "-",
                  term: {
                    termType: "variable",
                    name: "x",
                    span: { start: 2297, end: 2298, line: 76 },
                  },
                },
              ],
            },
            span: { start: 2275, end: 2299, line: 76 },
          },
          {
            statementType: "letStatement",
            name: {
              value: "lengthy",
              span: { start: 2310, end: 2317, line: 77 },
            },
            value: {
              nodeType: "expression",
              term: {
                termType: "variable",
                name: "desty",
                span: { start: 2320, end: 2325, line: 77 },
              },
              rest: [
                {
                  op: "-",
                  term: {
                    termType: "variable",
                    name: "y",
                    span: { start: 2328, end: 2329, line: 77 },
                  },
                },
              ],
            },
            span: { start: 2306, end: 2330, line: 77 },
          },
          {
            statementType: "letStatement",
            name: { value: "dx", span: { start: 2343, end: 2345, line: 78 } },
            value: {
              nodeType: "expression",
              term: {
                termType: "subroutineCall",
                name: {
                  value: "Math.abs",
                  span: { start: 2348, end: 2356, line: 78 },
                },
                parameters: [
                  {
                    nodeType: "expression",
                    term: {
                      termType: "variable",
                      name: "lengthx",
                      span: { start: 2357, end: 2364, line: 78 },
                    },
                    rest: [],
                  },
                ],
                span: { start: 2348, end: 2365, line: 78 },
              },
              rest: [],
            },
            span: { start: 2339, end: 2366, line: 78 },
          },
          {
            statementType: "letStatement",
            name: { value: "dy", span: { start: 2379, end: 2381, line: 79 } },
            value: {
              nodeType: "expression",
              term: {
                termType: "subroutineCall",
                name: {
                  value: "Math.abs",
                  span: { start: 2384, end: 2392, line: 79 },
                },
                parameters: [
                  {
                    nodeType: "expression",
                    term: {
                      termType: "variable",
                      name: "lengthy",
                      span: { start: 2393, end: 2400, line: 79 },
                    },
                    rest: [],
                  },
                ],
                span: { start: 2384, end: 2401, line: 79 },
              },
              rest: [],
            },
            span: { start: 2375, end: 2402, line: 79 },
          },
          {
            statementType: "letStatement",
            name: {
              value: "invert",
              span: { start: 2415, end: 2421, line: 80 },
            },
            value: {
              nodeType: "expression",
              term: {
                termType: "groupedExpression",
                expression: {
                  nodeType: "expression",
                  term: {
                    termType: "variable",
                    name: "dx",
                    span: { start: 2425, end: 2427, line: 80 },
                  },
                  rest: [
                    {
                      op: "<",
                      term: {
                        termType: "variable",
                        name: "dy",
                        span: { start: 2430, end: 2432, line: 80 },
                      },
                    },
                  ],
                },
              },
              rest: [],
            },
            span: { start: 2411, end: 2434, line: 80 },
          },
          {
            statementType: "ifStatement",
            condition: {
              nodeType: "expression",
              term: {
                termType: "variable",
                name: "invert",
                span: { start: 2448, end: 2454, line: 82 },
              },
              rest: [],
            },
            body: [
              {
                statementType: "letStatement",
                name: {
                  value: "temp",
                  span: { start: 2474, end: 2478, line: 83 },
                },
                value: {
                  nodeType: "expression",
                  term: {
                    termType: "variable",
                    name: "dx",
                    span: { start: 2481, end: 2483, line: 83 },
                  },
                  rest: [],
                },
                span: { start: 2470, end: 2484, line: 83 },
              },
              {
                statementType: "letStatement",
                name: {
                  value: "dx",
                  span: { start: 2516, end: 2518, line: 84 },
                },
                value: {
                  nodeType: "expression",
                  term: {
                    termType: "variable",
                    name: "dy",
                    span: { start: 2521, end: 2523, line: 84 },
                  },
                  rest: [],
                },
                span: { start: 2512, end: 2524, line: 84 },
              },
              {
                statementType: "letStatement",
                name: {
                  value: "dy",
                  span: { start: 2541, end: 2543, line: 85 },
                },
                value: {
                  nodeType: "expression",
                  term: {
                    termType: "variable",
                    name: "temp",
                    span: { start: 2546, end: 2550, line: 85 },
                  },
                  rest: [],
                },
                span: { start: 2537, end: 2551, line: 85 },
              },
              {
                statementType: "letStatement",
                name: {
                  value: "positivex",
                  span: { start: 2569, end: 2578, line: 86 },
                },
                value: {
                  nodeType: "expression",
                  term: {
                    termType: "groupedExpression",
                    expression: {
                      nodeType: "expression",
                      term: {
                        termType: "variable",
                        name: "y",
                        span: { start: 2582, end: 2583, line: 86 },
                      },
                      rest: [
                        {
                          op: "<",
                          term: {
                            termType: "variable",
                            name: "desty",
                            span: { start: 2586, end: 2591, line: 86 },
                          },
                        },
                      ],
                    },
                  },
                  rest: [],
                },
                span: { start: 2565, end: 2593, line: 86 },
              },
              {
                statementType: "letStatement",
                name: {
                  value: "positivey",
                  span: { start: 2610, end: 2619, line: 87 },
                },
                value: {
                  nodeType: "expression",
                  term: {
                    termType: "groupedExpression",
                    expression: {
                      nodeType: "expression",
                      term: {
                        termType: "variable",
                        name: "x",
                        span: { start: 2623, end: 2624, line: 87 },
                      },
                      rest: [
                        {
                          op: "<",
                          term: {
                            termType: "variable",
                            name: "destx",
                            span: { start: 2627, end: 2632, line: 87 },
                          },
                        },
                      ],
                    },
                  },
                  rest: [],
                },
                span: { start: 2606, end: 2634, line: 87 },
              },
            ],
            else: [
              {
                statementType: "letStatement",
                name: {
                  value: "positivex",
                  span: { start: 2674, end: 2683, line: 90 },
                },
                value: {
                  nodeType: "expression",
                  term: {
                    termType: "groupedExpression",
                    expression: {
                      nodeType: "expression",
                      term: {
                        termType: "variable",
                        name: "x",
                        span: { start: 2687, end: 2688, line: 90 },
                      },
                      rest: [
                        {
                          op: "<",
                          term: {
                            termType: "variable",
                            name: "destx",
                            span: { start: 2691, end: 2696, line: 90 },
                          },
                        },
                      ],
                    },
                  },
                  rest: [],
                },
                span: { start: 2670, end: 2698, line: 90 },
              },
              {
                statementType: "letStatement",
                name: {
                  value: "positivey",
                  span: { start: 2715, end: 2724, line: 91 },
                },
                value: {
                  nodeType: "expression",
                  term: {
                    termType: "groupedExpression",
                    expression: {
                      nodeType: "expression",
                      term: {
                        termType: "variable",
                        name: "y",
                        span: { start: 2728, end: 2729, line: 91 },
                      },
                      rest: [
                        {
                          op: "<",
                          term: {
                            termType: "variable",
                            name: "desty",
                            span: { start: 2732, end: 2737, line: 91 },
                          },
                        },
                      ],
                    },
                  },
                  rest: [],
                },
                span: { start: 2711, end: 2739, line: 91 },
              },
            ],
          },
          {
            statementType: "letStatement",
            name: { value: "d", span: { start: 2763, end: 2764, line: 94 } },
            value: {
              nodeType: "expression",
              term: {
                termType: "groupedExpression",
                expression: {
                  nodeType: "expression",
                  term: { termType: "numericLiteral", value: 2 },
                  rest: [
                    {
                      op: "*",
                      term: {
                        termType: "variable",
                        name: "dy",
                        span: { start: 2772, end: 2774, line: 94 },
                      },
                    },
                  ],
                },
              },
              rest: [
                {
                  op: "-",
                  term: {
                    termType: "variable",
                    name: "dx",
                    span: { start: 2778, end: 2780, line: 94 },
                  },
                },
              ],
            },
            span: { start: 2759, end: 2781, line: 94 },
          },
          {
            statementType: "letStatement",
            name: {
              value: "straightD",
              span: { start: 2794, end: 2803, line: 95 },
            },
            value: {
              nodeType: "expression",
              term: { termType: "numericLiteral", value: 2 },
              rest: [
                {
                  op: "*",
                  term: {
                    termType: "variable",
                    name: "dy",
                    span: { start: 2810, end: 2812, line: 95 },
                  },
                },
              ],
            },
            span: { start: 2790, end: 2813, line: 95 },
          },
          {
            statementType: "letStatement",
            name: {
              value: "diagonalD",
              span: { start: 2826, end: 2835, line: 96 },
            },
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
                      term: {
                        termType: "variable",
                        name: "dy",
                        span: { start: 2843, end: 2845, line: 96 },
                      },
                      rest: [
                        {
                          op: "-",
                          term: {
                            termType: "variable",
                            name: "dx",
                            span: { start: 2848, end: 2850, line: 96 },
                          },
                        },
                      ],
                    },
                  },
                },
              ],
            },
            span: { start: 2822, end: 2852, line: 96 },
          },
          {
            statementType: "returnStatement",
            span: { start: 2860, end: 2867, line: 98 },
          },
        ],
      },
    },
    {
      type: "method",
      returnType: { value: "int", span: { start: 3129, end: 3133, line: 107 } },
      name: { value: "move", span: { start: 3133, end: 3137, line: 107 } },
      parameters: [],
      body: {
        varDecs: [],
        statements: [
          {
            statementType: "doStatement",
            call: {
              termType: "subroutineCall",
              name: {
                value: "hide",
                span: { start: 3152, end: 3156, line: 109 },
              },
              parameters: [],
              span: { start: 3152, end: 3158, line: 109 },
            },
          },
          {
            statementType: "ifStatement",
            condition: {
              nodeType: "expression",
              term: {
                termType: "variable",
                name: "d",
                span: { start: 3173, end: 3174, line: 111 },
              },
              rest: [
                { op: "<", term: { termType: "numericLiteral", value: 0 } },
              ],
            },
            body: [
              {
                statementType: "letStatement",
                name: {
                  value: "d",
                  span: { start: 3186, end: 3187, line: 111 },
                },
                value: {
                  nodeType: "expression",
                  term: {
                    termType: "variable",
                    name: "d",
                    span: { start: 3190, end: 3191, line: 111 },
                  },
                  rest: [
                    {
                      op: "+",
                      term: {
                        termType: "variable",
                        name: "straightD",
                        span: { start: 3194, end: 3203, line: 111 },
                      },
                    },
                  ],
                },
                span: { start: 3182, end: 3204, line: 111 },
              },
            ],
            else: [
              {
                statementType: "letStatement",
                name: {
                  value: "d",
                  span: { start: 3238, end: 3239, line: 113 },
                },
                value: {
                  nodeType: "expression",
                  term: {
                    termType: "variable",
                    name: "d",
                    span: { start: 3242, end: 3243, line: 113 },
                  },
                  rest: [
                    {
                      op: "+",
                      term: {
                        termType: "variable",
                        name: "diagonalD",
                        span: { start: 3246, end: 3255, line: 113 },
                      },
                    },
                  ],
                },
                span: { start: 3234, end: 3256, line: 113 },
              },
              {
                statementType: "ifStatement",
                condition: {
                  nodeType: "expression",
                  term: {
                    termType: "variable",
                    name: "positivey",
                    span: { start: 3274, end: 3283, line: 115 },
                  },
                  rest: [],
                },
                body: [
                  {
                    statementType: "ifStatement",
                    condition: {
                      nodeType: "expression",
                      term: {
                        termType: "variable",
                        name: "invert",
                        span: { start: 3307, end: 3313, line: 116 },
                      },
                      rest: [],
                    },
                    body: [
                      {
                        statementType: "letStatement",
                        name: {
                          value: "x",
                          span: { start: 3321, end: 3322, line: 116 },
                        },
                        value: {
                          nodeType: "expression",
                          term: {
                            termType: "variable",
                            name: "x",
                            span: { start: 3325, end: 3326, line: 116 },
                          },
                          rest: [
                            {
                              op: "+",
                              term: { termType: "numericLiteral", value: 4 },
                            },
                          ],
                        },
                        span: { start: 3317, end: 3331, line: 116 },
                      },
                    ],
                    else: [
                      {
                        statementType: "letStatement",
                        name: {
                          value: "y",
                          span: { start: 3361, end: 3362, line: 117 },
                        },
                        value: {
                          nodeType: "expression",
                          term: {
                            termType: "variable",
                            name: "y",
                            span: { start: 3365, end: 3366, line: 117 },
                          },
                          rest: [
                            {
                              op: "+",
                              term: { termType: "numericLiteral", value: 4 },
                            },
                          ],
                        },
                        span: { start: 3357, end: 3371, line: 117 },
                      },
                    ],
                  },
                ],
                else: [
                  {
                    statementType: "ifStatement",
                    condition: {
                      nodeType: "expression",
                      term: {
                        termType: "variable",
                        name: "invert",
                        span: { start: 3427, end: 3433, line: 120 },
                      },
                      rest: [],
                    },
                    body: [
                      {
                        statementType: "letStatement",
                        name: {
                          value: "x",
                          span: { start: 3441, end: 3442, line: 120 },
                        },
                        value: {
                          nodeType: "expression",
                          term: {
                            termType: "variable",
                            name: "x",
                            span: { start: 3445, end: 3446, line: 120 },
                          },
                          rest: [
                            {
                              op: "-",
                              term: { termType: "numericLiteral", value: 4 },
                            },
                          ],
                        },
                        span: { start: 3437, end: 3451, line: 120 },
                      },
                    ],
                    else: [
                      {
                        statementType: "letStatement",
                        name: {
                          value: "y",
                          span: { start: 3481, end: 3482, line: 121 },
                        },
                        value: {
                          nodeType: "expression",
                          term: {
                            termType: "variable",
                            name: "y",
                            span: { start: 3485, end: 3486, line: 121 },
                          },
                          rest: [
                            {
                              op: "-",
                              term: { termType: "numericLiteral", value: 4 },
                            },
                          ],
                        },
                        span: { start: 3477, end: 3491, line: 121 },
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
              term: {
                termType: "variable",
                name: "positivex",
                span: { start: 3529, end: 3538, line: 125 },
              },
              rest: [],
            },
            body: [
              {
                statementType: "ifStatement",
                condition: {
                  nodeType: "expression",
                  term: {
                    termType: "variable",
                    name: "invert",
                    span: { start: 3558, end: 3564, line: 126 },
                  },
                  rest: [],
                },
                body: [
                  {
                    statementType: "letStatement",
                    name: {
                      value: "y",
                      span: { start: 3572, end: 3573, line: 126 },
                    },
                    value: {
                      nodeType: "expression",
                      term: {
                        termType: "variable",
                        name: "y",
                        span: { start: 3576, end: 3577, line: 126 },
                      },
                      rest: [
                        {
                          op: "+",
                          term: { termType: "numericLiteral", value: 4 },
                        },
                      ],
                    },
                    span: { start: 3568, end: 3582, line: 126 },
                  },
                ],
                else: [
                  {
                    statementType: "letStatement",
                    name: {
                      value: "x",
                      span: { start: 3608, end: 3609, line: 127 },
                    },
                    value: {
                      nodeType: "expression",
                      term: {
                        termType: "variable",
                        name: "x",
                        span: { start: 3612, end: 3613, line: 127 },
                      },
                      rest: [
                        {
                          op: "+",
                          term: { termType: "numericLiteral", value: 4 },
                        },
                      ],
                    },
                    span: { start: 3604, end: 3618, line: 127 },
                  },
                ],
              },
            ],
            else: [
              {
                statementType: "ifStatement",
                condition: {
                  nodeType: "expression",
                  term: {
                    termType: "variable",
                    name: "invert",
                    span: { start: 3658, end: 3664, line: 130 },
                  },
                  rest: [],
                },
                body: [
                  {
                    statementType: "letStatement",
                    name: {
                      value: "y",
                      span: { start: 3672, end: 3673, line: 130 },
                    },
                    value: {
                      nodeType: "expression",
                      term: {
                        termType: "variable",
                        name: "y",
                        span: { start: 3676, end: 3677, line: 130 },
                      },
                      rest: [
                        {
                          op: "-",
                          term: { termType: "numericLiteral", value: 4 },
                        },
                      ],
                    },
                    span: { start: 3668, end: 3682, line: 130 },
                  },
                ],
                else: [
                  {
                    statementType: "letStatement",
                    name: {
                      value: "x",
                      span: { start: 3708, end: 3709, line: 131 },
                    },
                    value: {
                      nodeType: "expression",
                      term: {
                        termType: "variable",
                        name: "x",
                        span: { start: 3712, end: 3713, line: 131 },
                      },
                      rest: [
                        {
                          op: "-",
                          term: { termType: "numericLiteral", value: 4 },
                        },
                      ],
                    },
                    span: { start: 3704, end: 3718, line: 131 },
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
                    term: {
                      termType: "variable",
                      name: "x",
                      span: { start: 3742, end: 3743, line: 134 },
                    },
                    rest: [
                      {
                        op: ">",
                        term: {
                          termType: "variable",
                          name: "leftWall",
                          span: { start: 3746, end: 3754, line: 134 },
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
                statementType: "letStatement",
                name: {
                  value: "wall",
                  span: { start: 3773, end: 3777, line: 135 },
                },
                value: {
                  nodeType: "expression",
                  term: { termType: "numericLiteral", value: 1 },
                  rest: [],
                },
                span: { start: 3769, end: 3782, line: 135 },
              },
              {
                statementType: "letStatement",
                name: {
                  value: "x",
                  span: { start: 3801, end: 3802, line: 136 },
                },
                value: {
                  nodeType: "expression",
                  term: {
                    termType: "variable",
                    name: "leftWall",
                    span: { start: 3805, end: 3813, line: 136 },
                  },
                  rest: [],
                },
                span: { start: 3797, end: 3814, line: 136 },
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
                    term: {
                      termType: "variable",
                      name: "x",
                      span: { start: 3837, end: 3838, line: 138 },
                    },
                    rest: [
                      {
                        op: "<",
                        term: {
                          termType: "variable",
                          name: "rightWall",
                          span: { start: 3841, end: 3850, line: 138 },
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
                statementType: "letStatement",
                name: {
                  value: "wall",
                  span: { start: 3869, end: 3873, line: 139 },
                },
                value: {
                  nodeType: "expression",
                  term: { termType: "numericLiteral", value: 2 },
                  rest: [],
                },
                span: { start: 3865, end: 3878, line: 139 },
              },
              {
                statementType: "letStatement",
                name: {
                  value: "x",
                  span: { start: 3897, end: 3898, line: 140 },
                },
                value: {
                  nodeType: "expression",
                  term: {
                    termType: "variable",
                    name: "rightWall",
                    span: { start: 3901, end: 3910, line: 140 },
                  },
                  rest: [],
                },
                span: { start: 3893, end: 3911, line: 140 },
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
                    term: {
                      termType: "variable",
                      name: "y",
                      span: { start: 3934, end: 3935, line: 142 },
                    },
                    rest: [
                      {
                        op: ">",
                        term: {
                          termType: "variable",
                          name: "topWall",
                          span: { start: 3938, end: 3945, line: 142 },
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
                statementType: "letStatement",
                name: {
                  value: "wall",
                  span: { start: 3966, end: 3970, line: 143 },
                },
                value: {
                  nodeType: "expression",
                  term: { termType: "numericLiteral", value: 3 },
                  rest: [],
                },
                span: { start: 3962, end: 3975, line: 143 },
              },
              {
                statementType: "letStatement",
                name: {
                  value: "y",
                  span: { start: 3994, end: 3995, line: 144 },
                },
                value: {
                  nodeType: "expression",
                  term: {
                    termType: "variable",
                    name: "topWall",
                    span: { start: 3998, end: 4005, line: 144 },
                  },
                  rest: [],
                },
                span: { start: 3990, end: 4006, line: 144 },
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
                    term: {
                      termType: "variable",
                      name: "y",
                      span: { start: 4031, end: 4032, line: 146 },
                    },
                    rest: [
                      {
                        op: "<",
                        term: {
                          termType: "variable",
                          name: "bottomWall",
                          span: { start: 4035, end: 4045, line: 146 },
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
                statementType: "letStatement",
                name: {
                  value: "wall",
                  span: { start: 4066, end: 4070, line: 147 },
                },
                value: {
                  nodeType: "expression",
                  term: { termType: "numericLiteral", value: 4 },
                  rest: [],
                },
                span: { start: 4062, end: 4075, line: 147 },
              },
              {
                statementType: "letStatement",
                name: {
                  value: "y",
                  span: { start: 4094, end: 4095, line: 148 },
                },
                value: {
                  nodeType: "expression",
                  term: {
                    termType: "variable",
                    name: "bottomWall",
                    span: { start: 4098, end: 4108, line: 148 },
                  },
                  rest: [],
                },
                span: { start: 4090, end: 4109, line: 148 },
              },
            ],
            else: [],
          },
          {
            statementType: "doStatement",
            call: {
              termType: "subroutineCall",
              name: {
                value: "show",
                span: { start: 4130, end: 4134, line: 151 },
              },
              parameters: [],
              span: { start: 4130, end: 4136, line: 151 },
            },
          },
          {
            statementType: "returnStatement",
            value: {
              nodeType: "expression",
              term: {
                termType: "variable",
                name: "wall",
                span: { start: 4152, end: 4156, line: 153 },
              },
              rest: [],
            },
            span: { start: 4145, end: 4157, line: 153 },
          },
        ],
      },
    },
    {
      type: "method",
      returnType: {
        value: "void",
        span: { start: 4389, end: 4394, line: 161 },
      },
      name: { value: "bounce", span: { start: 4394, end: 4400, line: 161 } },
      parameters: [
        {
          type: { value: "int", span: { start: 4401, end: 4405, line: 161 } },
          name: "bouncingDirection",
        },
      ],
      body: {
        varDecs: [
          {
            type: { value: "int", span: { start: 4438, end: 4442, line: 162 } },
            names: ["newx", "newy", "divLengthx", "divLengthy", "factor"],
          },
        ],
        statements: [
          {
            statementType: "letStatement",
            name: {
              value: "divLengthx",
              span: { start: 4549, end: 4559, line: 165 },
            },
            value: {
              nodeType: "expression",
              term: {
                termType: "variable",
                name: "lengthx",
                span: { start: 4562, end: 4569, line: 165 },
              },
              rest: [
                { op: "/", term: { termType: "numericLiteral", value: 10 } },
              ],
            },
            span: { start: 4545, end: 4575, line: 165 },
          },
          {
            statementType: "letStatement",
            name: {
              value: "divLengthy",
              span: { start: 4588, end: 4598, line: 166 },
            },
            value: {
              nodeType: "expression",
              term: {
                termType: "variable",
                name: "lengthy",
                span: { start: 4601, end: 4608, line: 166 },
              },
              rest: [
                { op: "/", term: { termType: "numericLiteral", value: 10 } },
              ],
            },
            span: { start: 4584, end: 4614, line: 166 },
          },
          {
            statementType: "ifStatement",
            condition: {
              nodeType: "expression",
              term: {
                termType: "variable",
                name: "bouncingDirection",
                span: { start: 4625, end: 4642, line: 167 },
              },
              rest: [
                { op: "=", term: { termType: "numericLiteral", value: 0 } },
              ],
            },
            body: [
              {
                statementType: "letStatement",
                name: {
                  value: "factor",
                  span: { start: 4654, end: 4660, line: 167 },
                },
                value: {
                  nodeType: "expression",
                  term: { termType: "numericLiteral", value: 10 },
                  rest: [],
                },
                span: { start: 4650, end: 4666, line: 167 },
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
                                  span: { start: 4700, end: 4707, line: 169 },
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
                                span: { start: 4717, end: 4734, line: 169 },
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
                              term: {
                                termType: "variable",
                                name: "lengthx",
                                span: { start: 4745, end: 4752, line: 169 },
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
                                    span: { start: 4761, end: 4778, line: 169 },
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
                    name: {
                      value: "factor",
                      span: { start: 4811, end: 4817, line: 170 },
                    },
                    value: {
                      nodeType: "expression",
                      term: { termType: "numericLiteral", value: 20 },
                      rest: [],
                    },
                    span: { start: 4807, end: 4823, line: 170 },
                  },
                ],
                else: [
                  {
                    statementType: "letStatement",
                    name: {
                      value: "factor",
                      span: { start: 4900, end: 4906, line: 172 },
                    },
                    value: {
                      nodeType: "expression",
                      term: { termType: "numericLiteral", value: 5 },
                      rest: [],
                    },
                    span: { start: 4896, end: 4911, line: 172 },
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
                termType: "variable",
                name: "wall",
                span: { start: 4979, end: 4983, line: 175 },
              },
              rest: [
                { op: "=", term: { termType: "numericLiteral", value: 1 } },
              ],
            },
            body: [
              {
                statementType: "letStatement",
                name: {
                  value: "newx",
                  span: { start: 5005, end: 5009, line: 176 },
                },
                value: {
                  nodeType: "expression",
                  term: { termType: "numericLiteral", value: 506 },
                  rest: [],
                },
                span: { start: 5001, end: 5016, line: 176 },
              },
              {
                statementType: "letStatement",
                name: {
                  value: "newy",
                  span: { start: 5031, end: 5035, line: 177 },
                },
                value: {
                  nodeType: "expression",
                  term: {
                    termType: "groupedExpression",
                    expression: {
                      nodeType: "expression",
                      term: {
                        termType: "variable",
                        name: "divLengthy",
                        span: { start: 5039, end: 5049, line: 177 },
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
                                term: { termType: "numericLiteral", value: 50 },
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
                        name: "divLengthx",
                        span: { start: 5061, end: 5071, line: 177 },
                      },
                    },
                  ],
                },
                span: { start: 5027, end: 5072, line: 177 },
              },
              {
                statementType: "letStatement",
                name: {
                  value: "newy",
                  span: { start: 5089, end: 5093, line: 178 },
                },
                value: {
                  nodeType: "expression",
                  term: {
                    termType: "variable",
                    name: "y",
                    span: { start: 5096, end: 5097, line: 178 },
                  },
                  rest: [
                    {
                      op: "+",
                      term: {
                        termType: "groupedExpression",
                        expression: {
                          nodeType: "expression",
                          term: {
                            termType: "variable",
                            name: "newy",
                            span: { start: 5101, end: 5105, line: 178 },
                          },
                          rest: [
                            {
                              op: "*",
                              term: {
                                termType: "variable",
                                name: "factor",
                                span: { start: 5108, end: 5114, line: 178 },
                              },
                            },
                          ],
                        },
                      },
                    },
                  ],
                },
                span: { start: 5085, end: 5116, line: 178 },
              },
            ],
            else: [
              {
                statementType: "ifStatement",
                condition: {
                  nodeType: "expression",
                  term: {
                    termType: "variable",
                    name: "wall",
                    span: { start: 5156, end: 5160, line: 181 },
                  },
                  rest: [
                    { op: "=", term: { termType: "numericLiteral", value: 2 } },
                  ],
                },
                body: [
                  {
                    statementType: "letStatement",
                    name: {
                      value: "newx",
                      span: { start: 5188, end: 5192, line: 182 },
                    },
                    value: {
                      nodeType: "expression",
                      term: { termType: "numericLiteral", value: 0 },
                      rest: [],
                    },
                    span: { start: 5184, end: 5197, line: 182 },
                  },
                  {
                    statementType: "letStatement",
                    name: {
                      value: "newy",
                      span: { start: 5218, end: 5222, line: 183 },
                    },
                    value: {
                      nodeType: "expression",
                      term: {
                        termType: "groupedExpression",
                        expression: {
                          nodeType: "expression",
                          term: {
                            termType: "variable",
                            name: "divLengthy",
                            span: { start: 5226, end: 5236, line: 183 },
                          },
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
                          term: {
                            termType: "variable",
                            name: "divLengthx",
                            span: { start: 5245, end: 5255, line: 183 },
                          },
                        },
                      ],
                    },
                    span: { start: 5214, end: 5256, line: 183 },
                  },
                  {
                    statementType: "letStatement",
                    name: {
                      value: "newy",
                      span: { start: 5277, end: 5281, line: 184 },
                    },
                    value: {
                      nodeType: "expression",
                      term: {
                        termType: "variable",
                        name: "y",
                        span: { start: 5284, end: 5285, line: 184 },
                      },
                      rest: [
                        {
                          op: "+",
                          term: {
                            termType: "groupedExpression",
                            expression: {
                              nodeType: "expression",
                              term: {
                                termType: "variable",
                                name: "newy",
                                span: { start: 5289, end: 5293, line: 184 },
                              },
                              rest: [
                                {
                                  op: "*",
                                  term: {
                                    termType: "variable",
                                    name: "factor",
                                    span: { start: 5296, end: 5302, line: 184 },
                                  },
                                },
                              ],
                            },
                          },
                        },
                      ],
                    },
                    span: { start: 5273, end: 5304, line: 184 },
                  },
                ],
                else: [
                  {
                    statementType: "ifStatement",
                    condition: {
                      nodeType: "expression",
                      term: {
                        termType: "variable",
                        name: "wall",
                        span: { start: 5354, end: 5358, line: 187 },
                      },
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
                        name: {
                          value: "newy",
                          span: { start: 5386, end: 5390, line: 188 },
                        },
                        value: {
                          nodeType: "expression",
                          term: { termType: "numericLiteral", value: 250 },
                          rest: [],
                        },
                        span: { start: 5382, end: 5397, line: 188 },
                      },
                      {
                        statementType: "letStatement",
                        name: {
                          value: "newx",
                          span: { start: 5418, end: 5422, line: 189 },
                        },
                        value: {
                          nodeType: "expression",
                          term: {
                            termType: "groupedExpression",
                            expression: {
                              nodeType: "expression",
                              term: {
                                termType: "variable",
                                name: "divLengthx",
                                span: { start: 5426, end: 5436, line: 189 },
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
                                span: { start: 5448, end: 5458, line: 189 },
                              },
                            },
                          ],
                        },
                        span: { start: 5414, end: 5459, line: 189 },
                      },
                      {
                        statementType: "letStatement",
                        name: {
                          value: "newx",
                          span: { start: 5484, end: 5488, line: 190 },
                        },
                        value: {
                          nodeType: "expression",
                          term: {
                            termType: "variable",
                            name: "x",
                            span: { start: 5491, end: 5492, line: 190 },
                          },
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
                                    span: { start: 5496, end: 5500, line: 190 },
                                  },
                                  rest: [
                                    {
                                      op: "*",
                                      term: {
                                        termType: "variable",
                                        name: "factor",
                                        span: {
                                          start: 5503,
                                          end: 5509,
                                          line: 190,
                                        },
                                      },
                                    },
                                  ],
                                },
                              },
                            },
                          ],
                        },
                        span: { start: 5480, end: 5511, line: 190 },
                      },
                    ],
                    else: [
                      {
                        statementType: "letStatement",
                        name: {
                          value: "newy",
                          span: { start: 5589, end: 5593, line: 193 },
                        },
                        value: {
                          nodeType: "expression",
                          term: { termType: "numericLiteral", value: 0 },
                          rest: [],
                        },
                        span: { start: 5585, end: 5598, line: 193 },
                      },
                      {
                        statementType: "letStatement",
                        name: {
                          value: "newx",
                          span: { start: 5619, end: 5623, line: 194 },
                        },
                        value: {
                          nodeType: "expression",
                          term: {
                            termType: "groupedExpression",
                            expression: {
                              nodeType: "expression",
                              term: {
                                termType: "variable",
                                name: "divLengthx",
                                span: { start: 5627, end: 5637, line: 194 },
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
                                span: { start: 5646, end: 5656, line: 194 },
                              },
                            },
                          ],
                        },
                        span: { start: 5615, end: 5657, line: 194 },
                      },
                      {
                        statementType: "letStatement",
                        name: {
                          value: "newx",
                          span: { start: 5682, end: 5686, line: 195 },
                        },
                        value: {
                          nodeType: "expression",
                          term: {
                            termType: "variable",
                            name: "x",
                            span: { start: 5689, end: 5690, line: 195 },
                          },
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
                                    span: { start: 5694, end: 5698, line: 195 },
                                  },
                                  rest: [
                                    {
                                      op: "*",
                                      term: {
                                        termType: "variable",
                                        name: "factor",
                                        span: {
                                          start: 5701,
                                          end: 5707,
                                          line: 195,
                                        },
                                      },
                                    },
                                  ],
                                },
                              },
                            },
                          ],
                        },
                        span: { start: 5678, end: 5709, line: 195 },
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
              name: {
                value: "setDestination",
                span: { start: 5760, end: 5774, line: 200 },
              },
              parameters: [
                {
                  nodeType: "expression",
                  term: {
                    termType: "variable",
                    name: "newx",
                    span: { start: 5775, end: 5779, line: 200 },
                  },
                  rest: [],
                },
                {
                  nodeType: "expression",
                  term: {
                    termType: "variable",
                    name: "newy",
                    span: { start: 5781, end: 5785, line: 200 },
                  },
                  rest: [],
                },
              ],
              span: { start: 5760, end: 5786, line: 200 },
            },
          },
          {
            statementType: "returnStatement",
            span: { start: 5796, end: 5803, line: 201 },
          },
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
    neg
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
    if-goto Ball_1
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
    goto Ball_0
label Ball_1
    push this 0
    push argument 1
    lt
    pop this 8
    push this 1
    push argument 2
    lt
    pop this 9
label Ball_0
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
    if-goto Ball_3
    push this 4
    push this 5
    add
    pop this 4
    goto Ball_2
label Ball_3
    push this 4
    push this 6
    add
    pop this 4
    push this 9
    not
    if-goto Ball_5
    push this 7
    not
    if-goto Ball_7
    push this 0
    push constant 4
    add
    pop this 0
    goto Ball_6
label Ball_7
    push this 1
    push constant 4
    add
    pop this 1
label Ball_6
    goto Ball_4
label Ball_5
    push this 7
    not
    if-goto Ball_9
    push this 0
    push constant 4
    sub
    pop this 0
    goto Ball_8
label Ball_9
    push this 1
    push constant 4
    sub
    pop this 1
label Ball_8
label Ball_4
label Ball_2
    push this 8
    not
    if-goto Ball_11
    push this 7
    not
    if-goto Ball_13
    push this 1
    push constant 4
    add
    pop this 1
    goto Ball_12
label Ball_13
    push this 0
    push constant 4
    add
    pop this 0
label Ball_12
    goto Ball_10
label Ball_11
    push this 7
    not
    if-goto Ball_15
    push this 1
    push constant 4
    sub
    pop this 1
    goto Ball_14
label Ball_15
    push this 0
    push constant 4
    sub
    pop this 0
label Ball_14
label Ball_10
    push this 0
    push this 10
    gt
    not
    not
    if-goto Ball_17
    push constant 1
    pop this 14
    push this 10
    pop this 0
    goto Ball_16
label Ball_17
label Ball_16
    push this 0
    push this 11
    lt
    not
    not
    if-goto Ball_19
    push constant 2
    pop this 14
    push this 11
    pop this 0
    goto Ball_18
label Ball_19
label Ball_18
    push this 1
    push this 12
    gt
    not
    not
    if-goto Ball_21
    push constant 3
    pop this 14
    push this 12
    pop this 1
    goto Ball_20
label Ball_21
label Ball_20
    push this 1
    push this 13
    lt
    not
    not
    if-goto Ball_23
    push constant 4
    pop this 14
    push this 13
    pop this 1
    goto Ball_22
label Ball_23
label Ball_22
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
    if-goto Ball_25
    push constant 10
    pop local 4
    goto Ball_24
label Ball_25
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
    if-goto Ball_27
    push constant 20
    pop local 4
    goto Ball_26
label Ball_27
    push constant 5
    pop local 4
label Ball_26
label Ball_24
    push this 14
    push constant 1
    eq
    not
    if-goto Ball_29
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
    goto Ball_28
label Ball_29
    push this 14
    push constant 2
    eq
    not
    if-goto Ball_31
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
    goto Ball_30
label Ball_31
    push this 14
    push constant 3
    eq
    not
    if-goto Ball_33
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
    goto Ball_32
label Ball_33
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
label Ball_32
label Ball_30
label Ball_28
    push pointer 0
    push local 0
    push local 1
    call Ball.setDestination 3
    pop temp 0
    push constant 0
    return`;

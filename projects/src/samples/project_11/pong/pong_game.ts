export const jack = `// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/11/Pong/PongGame.jack
// (Same as projects/9/Pong/PongGame.jack)
/**
 * Represents a Pong game.
 */
class PongGame {

    static PongGame instance; // A Pong game     
    field Bat bat;            // bat
    field Ball ball;          // ball
    field int wall;           // current wall that the ball is bouncing off of
    field boolean exit;       // true when the game is over
    field int score;          // current score
    field int lastWall;       // last wall that the ball bounced off of

    // The current width of the bat
    field int batWidth;

    /** Constructs a new Pong game. */
    constructor PongGame new() {
      do Screen.clearScreen();
        let batWidth = 50;  // initial bat size
        let bat = Bat.new(230, 229, batWidth, 7);
        let ball = Ball.new(253, 222, 0, 511, 0, 229);
        do ball.setDestination(400,0);
        do Screen.drawRectangle(0, 238, 511, 240);
      do Output.moveCursor(22,0);
      do Output.printString("Score: 0");
  
      let exit = false;
      let score = 0;
      let wall = 0;
      let lastWall = 0;

        return this;
    }

    /** Deallocates the object's memory. */
    method void dispose() {
        do bat.dispose();
      do ball.dispose();
        do Memory.deAlloc(this);
        return;
    }

    /** Creates an instance of a Pong game. */
    function void newInstance() {
        let instance = PongGame.new();
        return;
    }
    
    /** Returns this Pong game. */
    function PongGame getInstance() {
        return instance;
    }

    /** Starts the game, and handles inputs from the user that control
     *  the bat's movement direction. */
    method void run() {
        var char key;

        while (~exit) {
            // waits for a key to be pressed.
            while ((key = 0) & (~exit)) {
                let key = Keyboard.keyPressed();
                do bat.move();
                do moveBall();
                do Sys.wait(50);
            }

            if (key = 130) { do bat.setDirection(1); }
          else {
              if (key = 132) { do bat.setDirection(2); }
            else {
                    if (key = 140) { let exit = true; }
            }
            }

            // Waits for the key to be released.
            while ((~(key = 0)) & (~exit)) {
                let key = Keyboard.keyPressed();
                do bat.move();
                do moveBall();
                do Sys.wait(50);
            }
        }

      if (exit) {
            do Output.moveCursor(10,27);
          do Output.printString("Game Over");
      }
            
        return;
    }

    /**
     * Handles ball movement, including bouncing.
     * If the ball bounces off a wall, finds its new direction.
     * If the ball bounces off the bat, increases the score by one
     * and shrinks the bat's size, to make the game more challenging. 
     */
    method void moveBall() {
        var int bouncingDirection, batLeft, batRight, ballLeft, ballRight;

        let wall = ball.move();

        if ((wall > 0) & (~(wall = lastWall))) {
            let lastWall = wall;
            let bouncingDirection = 0;
            let batLeft = bat.getLeft();
            let batRight = bat.getRight();
            let ballLeft = ball.getLeft();
            let ballRight = ball.getRight();
  
            if (wall = 4) {
                let exit = (batLeft > ballRight) | (batRight < ballLeft);
                if (~exit) {
                    if (ballRight < (batLeft + 10)) { let bouncingDirection = -1; }
                    else {
                        if (ballLeft > (batRight - 10)) { let bouncingDirection = 1; }
                    }

                    let batWidth = batWidth - 2;
                    do bat.setWidth(batWidth);      
                    let score = score + 1;
                    do Output.moveCursor(22,7);
                    do Output.printInt(score);
                }
            }
            do ball.bounce(bouncingDirection);
        }
        return;
    }
}`;

export const parsed = {
  name: { value: "PongGame", span: { start: 262, end: 270, line: 9 } },
  varDecs: [
    {
      varType: "static",
      type: { value: "PongGame", span: { start: 285, end: 294, line: 11 } },
      names: ["instance"],
    },
    {
      varType: "field",
      type: { value: "Bat", span: { start: 334, end: 338, line: 12 } },
      names: ["bat"],
    },
    {
      varType: "field",
      type: { value: "Ball", span: { start: 371, end: 376, line: 13 } },
      names: ["ball"],
    },
    {
      varType: "field",
      type: { value: "int", span: { start: 409, end: 413, line: 14 } },
      names: ["wall"],
    },
    {
      varType: "field",
      type: { value: "boolean", span: { start: 488, end: 496, line: 15 } },
      names: ["exit"],
    },
    {
      varType: "field",
      type: { value: "int", span: { start: 548, end: 552, line: 16 } },
      names: ["score"],
    },
    {
      varType: "field",
      type: { value: "int", span: { start: 595, end: 599, line: 17 } },
      names: ["lastWall"],
    },
    {
      varType: "field",
      type: { value: "int", span: { start: 704, end: 708, line: 20 } },
      names: ["batWidth"],
    },
  ],
  subroutines: [
    {
      type: "constructor",
      returnType: {
        value: "PongGame",
        span: { start: 774, end: 783, line: 23 },
      },
      name: { value: "new", span: { start: 783, end: 786, line: 23 } },
      parameters: [],
      body: {
        varDecs: [],
        statements: [
          {
            statementType: "doStatement",
            call: {
              termType: "subroutineCall",
              name: {
                value: "Screen.clearScreen",
                span: { start: 800, end: 818, line: 24 },
              },
              parameters: [],
              span: { start: 800, end: 820, line: 24 },
            },
          },
          {
            statementType: "letStatement",
            name: {
              value: "batWidth",
              span: { start: 834, end: 842, line: 25 },
            },
            value: {
              nodeType: "expression",
              term: { termType: "numericLiteral", value: 50 },
              rest: [],
            },
            span: { start: 830, end: 848, line: 25 },
          },
          {
            statementType: "letStatement",
            name: { value: "bat", span: { start: 882, end: 885, line: 26 } },
            value: {
              nodeType: "expression",
              term: {
                termType: "subroutineCall",
                name: {
                  value: "Bat.new",
                  span: { start: 888, end: 895, line: 26 },
                },
                parameters: [
                  {
                    nodeType: "expression",
                    term: { termType: "numericLiteral", value: 230 },
                    rest: [],
                  },
                  {
                    nodeType: "expression",
                    term: { termType: "numericLiteral", value: 229 },
                    rest: [],
                  },
                  {
                    nodeType: "expression",
                    term: {
                      termType: "variable",
                      name: "batWidth",
                      span: { start: 906, end: 914, line: 26 },
                    },
                    rest: [],
                  },
                  {
                    nodeType: "expression",
                    term: { termType: "numericLiteral", value: 7 },
                    rest: [],
                  },
                ],
                span: { start: 888, end: 918, line: 26 },
              },
              rest: [],
            },
            span: { start: 878, end: 919, line: 26 },
          },
          {
            statementType: "letStatement",
            name: { value: "ball", span: { start: 932, end: 936, line: 27 } },
            value: {
              nodeType: "expression",
              term: {
                termType: "subroutineCall",
                name: {
                  value: "Ball.new",
                  span: { start: 939, end: 947, line: 27 },
                },
                parameters: [
                  {
                    nodeType: "expression",
                    term: { termType: "numericLiteral", value: 253 },
                    rest: [],
                  },
                  {
                    nodeType: "expression",
                    term: { termType: "numericLiteral", value: 222 },
                    rest: [],
                  },
                  {
                    nodeType: "expression",
                    term: { termType: "numericLiteral", value: 0 },
                    rest: [],
                  },
                  {
                    nodeType: "expression",
                    term: { termType: "numericLiteral", value: 511 },
                    rest: [],
                  },
                  {
                    nodeType: "expression",
                    term: { termType: "numericLiteral", value: 0 },
                    rest: [],
                  },
                  {
                    nodeType: "expression",
                    term: { termType: "numericLiteral", value: 229 },
                    rest: [],
                  },
                ],
                span: { start: 939, end: 973, line: 27 },
              },
              rest: [],
            },
            span: { start: 928, end: 974, line: 27 },
          },
          {
            statementType: "doStatement",
            call: {
              termType: "subroutineCall",
              name: {
                value: "ball.setDestination",
                span: { start: 986, end: 1005, line: 28 },
              },
              parameters: [
                {
                  nodeType: "expression",
                  term: { termType: "numericLiteral", value: 400 },
                  rest: [],
                },
                {
                  nodeType: "expression",
                  term: { termType: "numericLiteral", value: 0 },
                  rest: [],
                },
              ],
              span: { start: 986, end: 1012, line: 28 },
            },
          },
          {
            statementType: "doStatement",
            call: {
              termType: "subroutineCall",
              name: {
                value: "Screen.drawRectangle",
                span: { start: 1025, end: 1045, line: 29 },
              },
              parameters: [
                {
                  nodeType: "expression",
                  term: { termType: "numericLiteral", value: 0 },
                  rest: [],
                },
                {
                  nodeType: "expression",
                  term: { termType: "numericLiteral", value: 238 },
                  rest: [],
                },
                {
                  nodeType: "expression",
                  term: { termType: "numericLiteral", value: 511 },
                  rest: [],
                },
                {
                  nodeType: "expression",
                  term: { termType: "numericLiteral", value: 240 },
                  rest: [],
                },
              ],
              span: { start: 1025, end: 1063, line: 29 },
            },
          },
          {
            statementType: "doStatement",
            call: {
              termType: "subroutineCall",
              name: {
                value: "Output.moveCursor",
                span: { start: 1074, end: 1091, line: 30 },
              },
              parameters: [
                {
                  nodeType: "expression",
                  term: { termType: "numericLiteral", value: 22 },
                  rest: [],
                },
                {
                  nodeType: "expression",
                  term: { termType: "numericLiteral", value: 0 },
                  rest: [],
                },
              ],
              span: { start: 1074, end: 1097, line: 30 },
            },
          },
          {
            statementType: "doStatement",
            call: {
              termType: "subroutineCall",
              name: {
                value: "Output.printString",
                span: { start: 1108, end: 1126, line: 31 },
              },
              parameters: [
                {
                  nodeType: "expression",
                  term: { termType: "stringLiteral", value: "Score: 0" },
                  rest: [],
                },
              ],
              span: { start: 1108, end: 1138, line: 31 },
            },
          },
          {
            statementType: "letStatement",
            name: { value: "exit", span: { start: 1153, end: 1157, line: 33 } },
            value: {
              nodeType: "expression",
              term: { termType: "keywordLiteral", value: "false" },
              rest: [],
            },
            span: { start: 1149, end: 1166, line: 33 },
          },
          {
            statementType: "letStatement",
            name: {
              value: "score",
              span: { start: 1177, end: 1182, line: 34 },
            },
            value: {
              nodeType: "expression",
              term: { termType: "numericLiteral", value: 0 },
              rest: [],
            },
            span: { start: 1173, end: 1187, line: 34 },
          },
          {
            statementType: "letStatement",
            name: { value: "wall", span: { start: 1198, end: 1202, line: 35 } },
            value: {
              nodeType: "expression",
              term: { termType: "numericLiteral", value: 0 },
              rest: [],
            },
            span: { start: 1194, end: 1207, line: 35 },
          },
          {
            statementType: "letStatement",
            name: {
              value: "lastWall",
              span: { start: 1218, end: 1226, line: 36 },
            },
            value: {
              nodeType: "expression",
              term: { termType: "numericLiteral", value: 0 },
              rest: [],
            },
            span: { start: 1214, end: 1231, line: 36 },
          },
          {
            statementType: "returnStatement",
            value: {
              nodeType: "expression",
              term: { termType: "keywordLiteral", value: "this" },
              rest: [],
            },
            span: { start: 1241, end: 1253, line: 38 },
          },
        ],
      },
    },
    {
      type: "method",
      returnType: { value: "void", span: { start: 1316, end: 1321, line: 42 } },
      name: { value: "dispose", span: { start: 1321, end: 1328, line: 42 } },
      parameters: [],
      body: {
        varDecs: [],
        statements: [
          {
            statementType: "doStatement",
            call: {
              termType: "subroutineCall",
              name: {
                value: "bat.dispose",
                span: { start: 1344, end: 1355, line: 43 },
              },
              parameters: [],
              span: { start: 1344, end: 1357, line: 43 },
            },
          },
          {
            statementType: "doStatement",
            call: {
              termType: "subroutineCall",
              name: {
                value: "ball.dispose",
                span: { start: 1368, end: 1380, line: 44 },
              },
              parameters: [],
              span: { start: 1368, end: 1382, line: 44 },
            },
          },
          {
            statementType: "doStatement",
            call: {
              termType: "subroutineCall",
              name: {
                value: "Memory.deAlloc",
                span: { start: 1395, end: 1409, line: 45 },
              },
              parameters: [
                {
                  nodeType: "expression",
                  term: { termType: "keywordLiteral", value: "this" },
                  rest: [],
                },
              ],
              span: { start: 1395, end: 1415, line: 45 },
            },
          },
          {
            statementType: "returnStatement",
            span: { start: 1425, end: 1432, line: 46 },
          },
        ],
      },
    },
    {
      type: "function",
      returnType: { value: "void", span: { start: 1500, end: 1505, line: 50 } },
      name: {
        value: "newInstance",
        span: { start: 1505, end: 1516, line: 50 },
      },
      parameters: [],
      body: {
        varDecs: [],
        statements: [
          {
            statementType: "letStatement",
            name: {
              value: "instance",
              span: { start: 1533, end: 1541, line: 51 },
            },
            value: {
              nodeType: "expression",
              term: {
                termType: "subroutineCall",
                name: {
                  value: "PongGame.new",
                  span: { start: 1544, end: 1556, line: 51 },
                },
                parameters: [],
                span: { start: 1544, end: 1558, line: 51 },
              },
              rest: [],
            },
            span: { start: 1529, end: 1559, line: 51 },
          },
          {
            statementType: "returnStatement",
            span: { start: 1568, end: 1575, line: 52 },
          },
        ],
      },
    },
    {
      type: "function",
      returnType: {
        value: "PongGame",
        span: { start: 1635, end: 1644, line: 56 },
      },
      name: {
        value: "getInstance",
        span: { start: 1644, end: 1655, line: 56 },
      },
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
                name: "instance",
                span: { start: 1675, end: 1683, line: 57 },
              },
              rest: [],
            },
            span: { start: 1668, end: 1684, line: 57 },
          },
        ],
      },
    },
    {
      type: "method",
      returnType: { value: "void", span: { start: 1815, end: 1820, line: 62 } },
      name: { value: "run", span: { start: 1820, end: 1823, line: 62 } },
      parameters: [],
      body: {
        varDecs: [
          {
            type: { value: "char", span: { start: 1840, end: 1845, line: 63 } },
            names: ["key"],
          },
        ],
        statements: [
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
                  span: { start: 1867, end: 1871, line: 65 },
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
                    termType: "groupedExpression",
                    expression: {
                      nodeType: "expression",
                      term: {
                        termType: "variable",
                        name: "key",
                        span: { start: 1941, end: 1944, line: 67 },
                      },
                      rest: [
                        {
                          op: "=",
                          term: { termType: "numericLiteral", value: 0 },
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
                            termType: "unaryExpression",
                            op: "~",
                            term: {
                              termType: "variable",
                              name: "exit",
                              span: { start: 1954, end: 1958, line: 67 },
                            },
                          },
                          rest: [],
                        },
                      },
                    },
                  ],
                },
                body: [
                  {
                    statementType: "letStatement",
                    name: {
                      value: "key",
                      span: { start: 1983, end: 1986, line: 68 },
                    },
                    value: {
                      nodeType: "expression",
                      term: {
                        termType: "subroutineCall",
                        name: {
                          value: "Keyboard.keyPressed",
                          span: { start: 1989, end: 2008, line: 68 },
                        },
                        parameters: [],
                        span: { start: 1989, end: 2010, line: 68 },
                      },
                      rest: [],
                    },
                    span: { start: 1979, end: 2011, line: 68 },
                  },
                  {
                    statementType: "doStatement",
                    call: {
                      termType: "subroutineCall",
                      name: {
                        value: "bat.move",
                        span: { start: 2031, end: 2039, line: 69 },
                      },
                      parameters: [],
                      span: { start: 2031, end: 2041, line: 69 },
                    },
                  },
                  {
                    statementType: "doStatement",
                    call: {
                      termType: "subroutineCall",
                      name: {
                        value: "moveBall",
                        span: { start: 2062, end: 2070, line: 70 },
                      },
                      parameters: [],
                      span: { start: 2062, end: 2072, line: 70 },
                    },
                  },
                  {
                    statementType: "doStatement",
                    call: {
                      termType: "subroutineCall",
                      name: {
                        value: "Sys.wait",
                        span: { start: 2093, end: 2101, line: 71 },
                      },
                      parameters: [
                        {
                          nodeType: "expression",
                          term: { termType: "numericLiteral", value: 50 },
                          rest: [],
                        },
                      ],
                      span: { start: 2093, end: 2105, line: 71 },
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
                    span: { start: 2138, end: 2141, line: 74 },
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
                    statementType: "doStatement",
                    call: {
                      termType: "subroutineCall",
                      name: {
                        value: "bat.setDirection",
                        span: { start: 2154, end: 2170, line: 74 },
                      },
                      parameters: [
                        {
                          nodeType: "expression",
                          term: { termType: "numericLiteral", value: 1 },
                          rest: [],
                        },
                      ],
                      span: { start: 2154, end: 2173, line: 74 },
                    },
                  },
                ],
                else: [
                  {
                    statementType: "ifStatement",
                    condition: {
                      nodeType: "expression",
                      term: {
                        termType: "variable",
                        name: "key",
                        span: { start: 2212, end: 2215, line: 76 },
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
                        statementType: "doStatement",
                        call: {
                          termType: "subroutineCall",
                          name: {
                            value: "bat.setDirection",
                            span: { start: 2228, end: 2244, line: 76 },
                          },
                          parameters: [
                            {
                              nodeType: "expression",
                              term: { termType: "numericLiteral", value: 2 },
                              rest: [],
                            },
                          ],
                          span: { start: 2228, end: 2247, line: 76 },
                        },
                      },
                    ],
                    else: [
                      {
                        statementType: "ifStatement",
                        condition: {
                          nodeType: "expression",
                          term: {
                            termType: "variable",
                            name: "key",
                            span: { start: 2294, end: 2297, line: 78 },
                          },
                          rest: [
                            {
                              op: "=",
                              term: { termType: "numericLiteral", value: 140 },
                            },
                          ],
                        },
                        body: [
                          {
                            statementType: "letStatement",
                            name: {
                              value: "exit",
                              span: { start: 2311, end: 2315, line: 78 },
                            },
                            value: {
                              nodeType: "expression",
                              term: {
                                termType: "keywordLiteral",
                                value: "true",
                              },
                              rest: [],
                            },
                            span: { start: 2307, end: 2323, line: 78 },
                          },
                        ],
                        else: [],
                      },
                    ],
                  },
                ],
              },
              {
                statementType: "whileStatement",
                condition: {
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
                              name: "key",
                              span: { start: 2426, end: 2429, line: 83 },
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
                  },
                  rest: [
                    {
                      op: "&",
                      term: {
                        termType: "groupedExpression",
                        expression: {
                          nodeType: "expression",
                          term: {
                            termType: "unaryExpression",
                            op: "~",
                            term: {
                              termType: "variable",
                              name: "exit",
                              span: { start: 2440, end: 2444, line: 83 },
                            },
                          },
                          rest: [],
                        },
                      },
                    },
                  ],
                },
                body: [
                  {
                    statementType: "letStatement",
                    name: {
                      value: "key",
                      span: { start: 2469, end: 2472, line: 84 },
                    },
                    value: {
                      nodeType: "expression",
                      term: {
                        termType: "subroutineCall",
                        name: {
                          value: "Keyboard.keyPressed",
                          span: { start: 2475, end: 2494, line: 84 },
                        },
                        parameters: [],
                        span: { start: 2475, end: 2496, line: 84 },
                      },
                      rest: [],
                    },
                    span: { start: 2465, end: 2497, line: 84 },
                  },
                  {
                    statementType: "doStatement",
                    call: {
                      termType: "subroutineCall",
                      name: {
                        value: "bat.move",
                        span: { start: 2517, end: 2525, line: 85 },
                      },
                      parameters: [],
                      span: { start: 2517, end: 2527, line: 85 },
                    },
                  },
                  {
                    statementType: "doStatement",
                    call: {
                      termType: "subroutineCall",
                      name: {
                        value: "moveBall",
                        span: { start: 2548, end: 2556, line: 86 },
                      },
                      parameters: [],
                      span: { start: 2548, end: 2558, line: 86 },
                    },
                  },
                  {
                    statementType: "doStatement",
                    call: {
                      termType: "subroutineCall",
                      name: {
                        value: "Sys.wait",
                        span: { start: 2579, end: 2587, line: 87 },
                      },
                      parameters: [
                        {
                          nodeType: "expression",
                          term: { termType: "numericLiteral", value: 50 },
                          rest: [],
                        },
                      ],
                      span: { start: 2579, end: 2591, line: 87 },
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
                termType: "variable",
                name: "exit",
                span: { start: 2628, end: 2632, line: 91 },
              },
              rest: [],
            },
            body: [
              {
                statementType: "doStatement",
                call: {
                  termType: "subroutineCall",
                  name: {
                    value: "Output.moveCursor",
                    span: { start: 2651, end: 2668, line: 92 },
                  },
                  parameters: [
                    {
                      nodeType: "expression",
                      term: { termType: "numericLiteral", value: 10 },
                      rest: [],
                    },
                    {
                      nodeType: "expression",
                      term: { termType: "numericLiteral", value: 27 },
                      rest: [],
                    },
                  ],
                  span: { start: 2651, end: 2675, line: 92 },
                },
              },
              {
                statementType: "doStatement",
                call: {
                  termType: "subroutineCall",
                  name: {
                    value: "Output.printString",
                    span: { start: 2690, end: 2708, line: 93 },
                  },
                  parameters: [
                    {
                      nodeType: "expression",
                      term: { termType: "stringLiteral", value: "Game Over" },
                      rest: [],
                    },
                  ],
                  span: { start: 2690, end: 2721, line: 93 },
                },
              },
            ],
            else: [],
          },
          {
            statementType: "returnStatement",
            span: { start: 2752, end: 2759, line: 96 },
          },
        ],
      },
    },
    {
      type: "method",
      returnType: {
        value: "void",
        span: { start: 3046, end: 3051, line: 105 },
      },
      name: { value: "moveBall", span: { start: 3051, end: 3059, line: 105 } },
      parameters: [],
      body: {
        varDecs: [
          {
            type: { value: "int", span: { start: 3076, end: 3080, line: 106 } },
            names: [
              "bouncingDirection",
              "batLeft",
              "batRight",
              "ballLeft",
              "ballRight",
            ],
          },
        ],
        statements: [
          {
            statementType: "letStatement",
            name: {
              value: "wall",
              span: { start: 3152, end: 3156, line: 108 },
            },
            value: {
              nodeType: "expression",
              term: {
                termType: "subroutineCall",
                name: {
                  value: "ball.move",
                  span: { start: 3159, end: 3168, line: 108 },
                },
                parameters: [],
                span: { start: 3159, end: 3170, line: 108 },
              },
              rest: [],
            },
            span: { start: 3148, end: 3171, line: 108 },
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
                    name: "wall",
                    span: { start: 3186, end: 3190, line: 110 },
                  },
                  rest: [
                    { op: ">", term: { termType: "numericLiteral", value: 0 } },
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
                        termType: "unaryExpression",
                        op: "~",
                        term: {
                          termType: "groupedExpression",
                          expression: {
                            nodeType: "expression",
                            term: {
                              termType: "variable",
                              name: "wall",
                              span: { start: 3201, end: 3205, line: 110 },
                            },
                            rest: [
                              {
                                op: "=",
                                term: {
                                  termType: "variable",
                                  name: "lastWall",
                                  span: { start: 3208, end: 3216, line: 110 },
                                },
                              },
                            ],
                          },
                        },
                      },
                      rest: [],
                    },
                  },
                },
              ],
            },
            body: [
              {
                statementType: "letStatement",
                name: {
                  value: "lastWall",
                  span: { start: 3238, end: 3246, line: 111 },
                },
                value: {
                  nodeType: "expression",
                  term: {
                    termType: "variable",
                    name: "wall",
                    span: { start: 3249, end: 3253, line: 111 },
                  },
                  rest: [],
                },
                span: { start: 3234, end: 3254, line: 111 },
              },
              {
                statementType: "letStatement",
                name: {
                  value: "bouncingDirection",
                  span: { start: 3271, end: 3288, line: 112 },
                },
                value: {
                  nodeType: "expression",
                  term: { termType: "numericLiteral", value: 0 },
                  rest: [],
                },
                span: { start: 3267, end: 3293, line: 112 },
              },
              {
                statementType: "letStatement",
                name: {
                  value: "batLeft",
                  span: { start: 3310, end: 3317, line: 113 },
                },
                value: {
                  nodeType: "expression",
                  term: {
                    termType: "subroutineCall",
                    name: {
                      value: "bat.getLeft",
                      span: { start: 3320, end: 3331, line: 113 },
                    },
                    parameters: [],
                    span: { start: 3320, end: 3333, line: 113 },
                  },
                  rest: [],
                },
                span: { start: 3306, end: 3334, line: 113 },
              },
              {
                statementType: "letStatement",
                name: {
                  value: "batRight",
                  span: { start: 3351, end: 3359, line: 114 },
                },
                value: {
                  nodeType: "expression",
                  term: {
                    termType: "subroutineCall",
                    name: {
                      value: "bat.getRight",
                      span: { start: 3362, end: 3374, line: 114 },
                    },
                    parameters: [],
                    span: { start: 3362, end: 3376, line: 114 },
                  },
                  rest: [],
                },
                span: { start: 3347, end: 3377, line: 114 },
              },
              {
                statementType: "letStatement",
                name: {
                  value: "ballLeft",
                  span: { start: 3394, end: 3402, line: 115 },
                },
                value: {
                  nodeType: "expression",
                  term: {
                    termType: "subroutineCall",
                    name: {
                      value: "ball.getLeft",
                      span: { start: 3405, end: 3417, line: 115 },
                    },
                    parameters: [],
                    span: { start: 3405, end: 3419, line: 115 },
                  },
                  rest: [],
                },
                span: { start: 3390, end: 3420, line: 115 },
              },
              {
                statementType: "letStatement",
                name: {
                  value: "ballRight",
                  span: { start: 3437, end: 3446, line: 116 },
                },
                value: {
                  nodeType: "expression",
                  term: {
                    termType: "subroutineCall",
                    name: {
                      value: "ball.getRight",
                      span: { start: 3449, end: 3462, line: 116 },
                    },
                    parameters: [],
                    span: { start: 3449, end: 3464, line: 116 },
                  },
                  rest: [],
                },
                span: { start: 3433, end: 3465, line: 116 },
              },
              {
                statementType: "ifStatement",
                condition: {
                  nodeType: "expression",
                  term: {
                    termType: "variable",
                    name: "wall",
                    span: { start: 3485, end: 3489, line: 118 },
                  },
                  rest: [
                    { op: "=", term: { termType: "numericLiteral", value: 4 } },
                  ],
                },
                body: [
                  {
                    statementType: "letStatement",
                    name: {
                      value: "exit",
                      span: { start: 3517, end: 3521, line: 119 },
                    },
                    value: {
                      nodeType: "expression",
                      term: {
                        termType: "groupedExpression",
                        expression: {
                          nodeType: "expression",
                          term: {
                            termType: "variable",
                            name: "batLeft",
                            span: { start: 3525, end: 3532, line: 119 },
                          },
                          rest: [
                            {
                              op: ">",
                              term: {
                                termType: "variable",
                                name: "ballRight",
                                span: { start: 3535, end: 3544, line: 119 },
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
                                termType: "variable",
                                name: "batRight",
                                span: { start: 3549, end: 3557, line: 119 },
                              },
                              rest: [
                                {
                                  op: "<",
                                  term: {
                                    termType: "variable",
                                    name: "ballLeft",
                                    span: { start: 3560, end: 3568, line: 119 },
                                  },
                                },
                              ],
                            },
                          },
                        },
                      ],
                    },
                    span: { start: 3513, end: 3570, line: 119 },
                  },
                  {
                    statementType: "ifStatement",
                    condition: {
                      nodeType: "expression",
                      term: {
                        termType: "unaryExpression",
                        op: "~",
                        term: {
                          termType: "variable",
                          name: "exit",
                          span: { start: 3592, end: 3596, line: 120 },
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
                            termType: "variable",
                            name: "ballRight",
                            span: { start: 3624, end: 3633, line: 121 },
                          },
                          rest: [
                            {
                              op: "<",
                              term: {
                                termType: "groupedExpression",
                                expression: {
                                  nodeType: "expression",
                                  term: {
                                    termType: "variable",
                                    name: "batLeft",
                                    span: { start: 3637, end: 3644, line: 121 },
                                  },
                                  rest: [
                                    {
                                      op: "+",
                                      term: {
                                        termType: "numericLiteral",
                                        value: 10,
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
                              value: "bouncingDirection",
                              span: { start: 3658, end: 3675, line: 121 },
                            },
                            value: {
                              nodeType: "expression",
                              term: {
                                termType: "unaryExpression",
                                op: "-",
                                term: { termType: "numericLiteral", value: 1 },
                              },
                              rest: [],
                            },
                            span: { start: 3654, end: 3681, line: 121 },
                          },
                        ],
                        else: [
                          {
                            statementType: "ifStatement",
                            condition: {
                              nodeType: "expression",
                              term: {
                                termType: "variable",
                                name: "ballLeft",
                                span: { start: 3739, end: 3747, line: 123 },
                              },
                              rest: [
                                {
                                  op: ">",
                                  term: {
                                    termType: "groupedExpression",
                                    expression: {
                                      nodeType: "expression",
                                      term: {
                                        termType: "variable",
                                        name: "batRight",
                                        span: {
                                          start: 3751,
                                          end: 3759,
                                          line: 123,
                                        },
                                      },
                                      rest: [
                                        {
                                          op: "-",
                                          term: {
                                            termType: "numericLiteral",
                                            value: 10,
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
                                  value: "bouncingDirection",
                                  span: { start: 3773, end: 3790, line: 123 },
                                },
                                value: {
                                  nodeType: "expression",
                                  term: {
                                    termType: "numericLiteral",
                                    value: 1,
                                  },
                                  rest: [],
                                },
                                span: { start: 3769, end: 3795, line: 123 },
                              },
                            ],
                            else: [],
                          },
                        ],
                      },
                      {
                        statementType: "letStatement",
                        name: {
                          value: "batWidth",
                          span: { start: 3845, end: 3853, line: 126 },
                        },
                        value: {
                          nodeType: "expression",
                          term: {
                            termType: "variable",
                            name: "batWidth",
                            span: { start: 3856, end: 3864, line: 126 },
                          },
                          rest: [
                            {
                              op: "-",
                              term: { termType: "numericLiteral", value: 2 },
                            },
                          ],
                        },
                        span: { start: 3841, end: 3869, line: 126 },
                      },
                      {
                        statementType: "doStatement",
                        call: {
                          termType: "subroutineCall",
                          name: {
                            value: "bat.setWidth",
                            span: { start: 3893, end: 3905, line: 127 },
                          },
                          parameters: [
                            {
                              nodeType: "expression",
                              term: {
                                termType: "variable",
                                name: "batWidth",
                                span: { start: 3906, end: 3914, line: 127 },
                              },
                              rest: [],
                            },
                          ],
                          span: { start: 3893, end: 3915, line: 127 },
                        },
                      },
                      {
                        statementType: "letStatement",
                        name: {
                          value: "score",
                          span: { start: 3947, end: 3952, line: 128 },
                        },
                        value: {
                          nodeType: "expression",
                          term: {
                            termType: "variable",
                            name: "score",
                            span: { start: 3955, end: 3960, line: 128 },
                          },
                          rest: [
                            {
                              op: "+",
                              term: { termType: "numericLiteral", value: 1 },
                            },
                          ],
                        },
                        span: { start: 3943, end: 3965, line: 128 },
                      },
                      {
                        statementType: "doStatement",
                        call: {
                          termType: "subroutineCall",
                          name: {
                            value: "Output.moveCursor",
                            span: { start: 3989, end: 4006, line: 129 },
                          },
                          parameters: [
                            {
                              nodeType: "expression",
                              term: { termType: "numericLiteral", value: 22 },
                              rest: [],
                            },
                            {
                              nodeType: "expression",
                              term: { termType: "numericLiteral", value: 7 },
                              rest: [],
                            },
                          ],
                          span: { start: 3989, end: 4012, line: 129 },
                        },
                      },
                      {
                        statementType: "doStatement",
                        call: {
                          termType: "subroutineCall",
                          name: {
                            value: "Output.printInt",
                            span: { start: 4037, end: 4052, line: 130 },
                          },
                          parameters: [
                            {
                              nodeType: "expression",
                              term: {
                                termType: "variable",
                                name: "score",
                                span: { start: 4053, end: 4058, line: 130 },
                              },
                              rest: [],
                            },
                          ],
                          span: { start: 4037, end: 4059, line: 130 },
                        },
                      },
                    ],
                    else: [],
                  },
                ],
                else: [],
              },
              {
                statementType: "doStatement",
                call: {
                  termType: "subroutineCall",
                  name: {
                    value: "ball.bounce",
                    span: { start: 4108, end: 4119, line: 133 },
                  },
                  parameters: [
                    {
                      nodeType: "expression",
                      term: {
                        termType: "variable",
                        name: "bouncingDirection",
                        span: { start: 4120, end: 4137, line: 133 },
                      },
                      rest: [],
                    },
                  ],
                  span: { start: 4108, end: 4138, line: 133 },
                },
              },
            ],
            else: [],
          },
          {
            statementType: "returnStatement",
            span: { start: 4158, end: 4165, line: 135 },
          },
        ],
      },
    },
  ],
};

export const compiled = `function PongGame.new 0
    push constant 7
    call Memory.alloc 1
    pop pointer 0
    call Screen.clearScreen 0
    pop temp 0
    push constant 50
    pop this 6
    push constant 230
    push constant 229
    push this 6
    push constant 7
    call Bat.new 4
    pop this 0
    push constant 253
    push constant 222
    push constant 0
    push constant 511
    push constant 0
    push constant 229
    call Ball.new 6
    pop this 1
    push this 1
    push constant 400
    push constant 0
    call Ball.setDestination 3
    pop temp 0
    push constant 0
    push constant 238
    push constant 511
    push constant 240
    call Screen.drawRectangle 4
    pop temp 0
    push constant 22
    push constant 0
    call Output.moveCursor 2
    pop temp 0
    push constant 8
    call String.new 1
    push constant 83
    call String.appendChar 2
    push constant 99
    call String.appendChar 2
    push constant 111
    call String.appendChar 2
    push constant 114
    call String.appendChar 2
    push constant 101
    call String.appendChar 2
    push constant 58
    call String.appendChar 2
    push constant 32
    call String.appendChar 2
    push constant 48
    call String.appendChar 2
    call Output.printString 1
    pop temp 0
    push constant 0
    pop this 3
    push constant 0
    pop this 4
    push constant 0
    pop this 2
    push constant 0
    pop this 5
    push pointer 0
    return
function PongGame.dispose 0
    push argument 0
    pop pointer 0
    push this 0
    call Bat.dispose 1
    pop temp 0
    push this 1
    call Ball.dispose 1
    pop temp 0
    push pointer 0
    call Memory.deAlloc 1
    pop temp 0
    push constant 0
    return
function PongGame.newInstance 0
    call PongGame.new 0
    pop static 0
    push constant 0
    return
function PongGame.getInstance 0
    push static 0
    return
function PongGame.run 1
    push argument 0
    pop pointer 0
label PongGame_0
    push this 3
    not
    not
    if-goto PongGame_1
label PongGame_2
    push local 0
    push constant 0
    eq
    push this 3
    not
    and
    not
    if-goto PongGame_3
    call Keyboard.keyPressed 0
    pop local 0
    push this 0
    call Bat.move 1
    pop temp 0
    push pointer 0
    call PongGame.moveBall 1
    pop temp 0
    push constant 50
    call Sys.wait 1
    pop temp 0
    goto PongGame_2
label PongGame_3
    push local 0
    push constant 130
    eq
    not
    if-goto PongGame_5
    push this 0
    push constant 1
    call Bat.setDirection 2
    pop temp 0
    goto PongGame_4
label PongGame_5
    push local 0
    push constant 132
    eq
    not
    if-goto PongGame_7
    push this 0
    push constant 2
    call Bat.setDirection 2
    pop temp 0
    goto PongGame_6
label PongGame_7
    push local 0
    push constant 140
    eq
    not
    if-goto PongGame_9
    push constant 1
    neg
    pop this 3
    goto PongGame_8
label PongGame_9
label PongGame_8
label PongGame_6
label PongGame_4
label PongGame_10
    push local 0
    push constant 0
    eq
    not
    push this 3
    not
    and
    not
    if-goto PongGame_11
    call Keyboard.keyPressed 0
    pop local 0
    push this 0
    call Bat.move 1
    pop temp 0
    push pointer 0
    call PongGame.moveBall 1
    pop temp 0
    push constant 50
    call Sys.wait 1
    pop temp 0
    goto PongGame_10
label PongGame_11
    goto PongGame_0
label PongGame_1
    push this 3
    not
    if-goto PongGame_13
    push constant 10
    push constant 27
    call Output.moveCursor 2
    pop temp 0
    push constant 9
    call String.new 1
    push constant 71
    call String.appendChar 2
    push constant 97
    call String.appendChar 2
    push constant 109
    call String.appendChar 2
    push constant 101
    call String.appendChar 2
    push constant 32
    call String.appendChar 2
    push constant 79
    call String.appendChar 2
    push constant 118
    call String.appendChar 2
    push constant 101
    call String.appendChar 2
    push constant 114
    call String.appendChar 2
    call Output.printString 1
    pop temp 0
    goto PongGame_12
label PongGame_13
label PongGame_12
    push constant 0
    return
function PongGame.moveBall 5
    push argument 0
    pop pointer 0
    push this 1
    call Ball.move 1
    pop this 2
    push this 2
    push constant 0
    gt
    push this 2
    push this 5
    eq
    not
    and
    not
    if-goto PongGame_15
    push this 2
    pop this 5
    push constant 0
    pop local 0
    push this 0
    call Bat.getLeft 1
    pop local 1
    push this 0
    call Bat.getRight 1
    pop local 2
    push this 1
    call Ball.getLeft 1
    pop local 3
    push this 1
    call Ball.getRight 1
    pop local 4
    push this 2
    push constant 4
    eq
    not
    if-goto PongGame_17
    push local 1
    push local 4
    gt
    push local 2
    push local 3
    lt
    or
    pop this 3
    push this 3
    not
    not
    if-goto PongGame_19
    push local 4
    push local 1
    push constant 10
    add
    lt
    not
    if-goto PongGame_21
    push constant 1
    neg
    pop local 0
    goto PongGame_20
label PongGame_21
    push local 3
    push local 2
    push constant 10
    sub
    gt
    not
    if-goto PongGame_23
    push constant 1
    pop local 0
    goto PongGame_22
label PongGame_23
label PongGame_22
label PongGame_20
    push this 6
    push constant 2
    sub
    pop this 6
    push this 0
    push this 6
    call Bat.setWidth 2
    pop temp 0
    push this 4
    push constant 1
    add
    pop this 4
    push constant 22
    push constant 7
    call Output.moveCursor 2
    pop temp 0
    push this 4
    call Output.printInt 1
    pop temp 0
    goto PongGame_18
label PongGame_19
label PongGame_18
    goto PongGame_16
label PongGame_17
label PongGame_16
    push this 1
    push local 0
    call Ball.bounce 2
    pop temp 0
    goto PongGame_14
label PongGame_15
label PongGame_14
    push constant 0
    return`;

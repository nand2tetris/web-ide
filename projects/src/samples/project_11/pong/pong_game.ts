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
  name: "PongGame",
  varDecs: [
    { varType: "static", type: "PongGame", names: ["instance"] },
    { varType: "field", type: "Bat", names: ["bat"] },
    { varType: "field", type: "Ball", names: ["ball"] },
    { varType: "field", type: "int", names: ["wall"] },
    { varType: "field", type: "boolean", names: ["exit"] },
    { varType: "field", type: "int", names: ["score"] },
    { varType: "field", type: "int", names: ["lastWall"] },
    { varType: "field", type: "int", names: ["batWidth"] },
  ],
  subroutines: [
    {
      type: "constructor",
      returnType: "PongGame",
      name: "new",
      parameters: [],
      body: {
        varDecs: [],
        statements: [
          {
            statementType: "doStatement",
            call: {
              termType: "subroutineCall",
              name: "Screen.clearScreen",
              parameters: [],
            },
          },
          {
            statementType: "letStatement",
            name: "batWidth",
            value: {
              nodeType: "expression",
              term: { termType: "numericLiteral", value: 50 },
              rest: [],
            },
          },
          {
            statementType: "letStatement",
            name: "bat",
            value: {
              nodeType: "expression",
              term: {
                termType: "subroutineCall",
                name: "Bat.new",
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
                    term: { termType: "variable", name: "batWidth" },
                    rest: [],
                  },
                  {
                    nodeType: "expression",
                    term: { termType: "numericLiteral", value: 7 },
                    rest: [],
                  },
                ],
              },
              rest: [],
            },
          },
          {
            statementType: "letStatement",
            name: "ball",
            value: {
              nodeType: "expression",
              term: {
                termType: "subroutineCall",
                name: "Ball.new",
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
              },
              rest: [],
            },
          },
          {
            statementType: "doStatement",
            call: {
              termType: "subroutineCall",
              name: "ball.setDestination",
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
            },
          },
          {
            statementType: "doStatement",
            call: {
              termType: "subroutineCall",
              name: "Output.moveCursor",
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
            },
          },
          {
            statementType: "doStatement",
            call: {
              termType: "subroutineCall",
              name: "Output.printString",
              parameters: [
                {
                  nodeType: "expression",
                  term: { termType: "stringLiteral", value: "Score: 0" },
                  rest: [],
                },
              ],
            },
          },
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
            statementType: "letStatement",
            name: "score",
            value: {
              nodeType: "expression",
              term: { termType: "numericLiteral", value: 0 },
              rest: [],
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
            statementType: "letStatement",
            name: "lastWall",
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
              name: "bat.dispose",
              parameters: [],
            },
          },
          {
            statementType: "doStatement",
            call: {
              termType: "subroutineCall",
              name: "ball.dispose",
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
      type: "function",
      returnType: "void",
      name: "newInstance",
      parameters: [],
      body: {
        varDecs: [],
        statements: [
          {
            statementType: "letStatement",
            name: "instance",
            value: {
              nodeType: "expression",
              term: {
                termType: "subroutineCall",
                name: "PongGame.new",
                parameters: [],
              },
              rest: [],
            },
          },
          { statementType: "returnStatement" },
        ],
      },
    },
    {
      type: "function",
      returnType: "PongGame",
      name: "getInstance",
      parameters: [],
      body: {
        varDecs: [],
        statements: [
          {
            statementType: "returnStatement",
            value: {
              nodeType: "expression",
              term: { termType: "variable", name: "instance" },
              rest: [],
            },
          },
        ],
      },
    },
    {
      type: "method",
      returnType: "void",
      name: "run",
      parameters: [],
      body: {
        varDecs: [{ type: "char", names: ["key"] }],
        statements: [
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
                            term: { termType: "variable", name: "exit" },
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
                      name: "bat.move",
                      parameters: [],
                    },
                  },
                  {
                    statementType: "doStatement",
                    call: {
                      termType: "subroutineCall",
                      name: "moveBall",
                      parameters: [],
                    },
                  },
                  {
                    statementType: "doStatement",
                    call: {
                      termType: "subroutineCall",
                      name: "Sys.wait",
                      parameters: [
                        {
                          nodeType: "expression",
                          term: { termType: "numericLiteral", value: 50 },
                          rest: [],
                        },
                      ],
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
                      term: { termType: "numericLiteral", value: 130 },
                    },
                  ],
                },
                body: [
                  {
                    statementType: "doStatement",
                    call: {
                      termType: "subroutineCall",
                      name: "bat.setDirection",
                      parameters: [
                        {
                          nodeType: "expression",
                          term: { termType: "numericLiteral", value: 1 },
                          rest: [],
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
                        statementType: "doStatement",
                        call: {
                          termType: "subroutineCall",
                          name: "bat.setDirection",
                          parameters: [
                            {
                              nodeType: "expression",
                              term: { termType: "numericLiteral", value: 2 },
                              rest: [],
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
                          term: { termType: "variable", name: "key" },
                          rest: [
                            {
                              op: "=",
                              term: {
                                termType: "numericLiteral",
                                value: 140,
                              },
                            },
                          ],
                        },
                        body: [
                          {
                            statementType: "letStatement",
                            name: "exit",
                            value: {
                              nodeType: "expression",
                              term: {
                                termType: "keywordLiteral",
                                value: "true",
                              },
                              rest: [],
                            },
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
                            term: { termType: "variable", name: "key" },
                            rest: [
                              {
                                op: "=",
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
                            termType: "unaryExpression",
                            op: "~",
                            term: { termType: "variable", name: "exit" },
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
                      name: "bat.move",
                      parameters: [],
                    },
                  },
                  {
                    statementType: "doStatement",
                    call: {
                      termType: "subroutineCall",
                      name: "moveBall",
                      parameters: [],
                    },
                  },
                  {
                    statementType: "doStatement",
                    call: {
                      termType: "subroutineCall",
                      name: "Sys.wait",
                      parameters: [
                        {
                          nodeType: "expression",
                          term: { termType: "numericLiteral", value: 50 },
                          rest: [],
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
              term: { termType: "variable", name: "exit" },
              rest: [],
            },
            body: [
              {
                statementType: "doStatement",
                call: {
                  termType: "subroutineCall",
                  name: "Output.moveCursor",
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
                },
              },
              {
                statementType: "doStatement",
                call: {
                  termType: "subroutineCall",
                  name: "Output.printString",
                  parameters: [
                    {
                      nodeType: "expression",
                      term: { termType: "stringLiteral", value: "Game Over" },
                      rest: [],
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
      name: "moveBall",
      parameters: [],
      body: {
        varDecs: [
          {
            type: "int",
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
            name: "wall",
            value: {
              nodeType: "expression",
              term: {
                termType: "subroutineCall",
                name: "ball.move",
                parameters: [],
              },
              rest: [],
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
                  term: { termType: "variable", name: "wall" },
                  rest: [
                    {
                      op: ">",
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
                          termType: "groupedExpression",
                          expression: {
                            nodeType: "expression",
                            term: { termType: "variable", name: "wall" },
                            rest: [
                              {
                                op: "=",
                                term: {
                                  termType: "variable",
                                  name: "lastWall",
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
                name: "lastWall",
                value: {
                  nodeType: "expression",
                  term: { termType: "variable", name: "wall" },
                  rest: [],
                },
              },
              {
                statementType: "letStatement",
                name: "bouncingDirection",
                value: {
                  nodeType: "expression",
                  term: { termType: "numericLiteral", value: 0 },
                  rest: [],
                },
              },
              {
                statementType: "letStatement",
                name: "batLeft",
                value: {
                  nodeType: "expression",
                  term: {
                    termType: "subroutineCall",
                    name: "bat.getLeft",
                    parameters: [],
                  },
                  rest: [],
                },
              },
              {
                statementType: "letStatement",
                name: "batRight",
                value: {
                  nodeType: "expression",
                  term: {
                    termType: "subroutineCall",
                    name: "bat.getRight",
                    parameters: [],
                  },
                  rest: [],
                },
              },
              {
                statementType: "letStatement",
                name: "ballLeft",
                value: {
                  nodeType: "expression",
                  term: {
                    termType: "subroutineCall",
                    name: "ball.getLeft",
                    parameters: [],
                  },
                  rest: [],
                },
              },
              {
                statementType: "letStatement",
                name: "ballRight",
                value: {
                  nodeType: "expression",
                  term: {
                    termType: "subroutineCall",
                    name: "ball.getRight",
                    parameters: [],
                  },
                  rest: [],
                },
              },
              {
                statementType: "ifStatement",
                condition: {
                  nodeType: "expression",
                  term: { termType: "variable", name: "wall" },
                  rest: [
                    {
                      op: "=",
                      term: { termType: "numericLiteral", value: 4 },
                    },
                  ],
                },
                body: [
                  {
                    statementType: "letStatement",
                    name: "exit",
                    value: {
                      nodeType: "expression",
                      term: {
                        termType: "groupedExpression",
                        expression: {
                          nodeType: "expression",
                          term: { termType: "variable", name: "batLeft" },
                          rest: [
                            {
                              op: ">",
                              term: {
                                termType: "variable",
                                name: "ballRight",
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
                              },
                              rest: [
                                {
                                  op: "<",
                                  term: {
                                    termType: "variable",
                                    name: "ballLeft",
                                  },
                                },
                              ],
                            },
                          },
                        },
                      ],
                    },
                  },
                  {
                    statementType: "ifStatement",
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
                        statementType: "ifStatement",
                        condition: {
                          nodeType: "expression",
                          term: { termType: "variable", name: "ballRight" },
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
                            name: "bouncingDirection",
                            value: {
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
                        ],
                        else: [
                          {
                            statementType: "ifStatement",
                            condition: {
                              nodeType: "expression",
                              term: {
                                termType: "variable",
                                name: "ballLeft",
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
                                name: "bouncingDirection",
                                value: {
                                  nodeType: "expression",
                                  term: {
                                    termType: "numericLiteral",
                                    value: 1,
                                  },
                                  rest: [],
                                },
                              },
                            ],
                            else: [],
                          },
                        ],
                      },
                      {
                        statementType: "letStatement",
                        name: "batWidth",
                        value: {
                          nodeType: "expression",
                          term: { termType: "variable", name: "batWidth" },
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
                          name: "bat.setWidth",
                          parameters: [
                            {
                              nodeType: "expression",
                              term: {
                                termType: "variable",
                                name: "batWidth",
                              },
                              rest: [],
                            },
                          ],
                        },
                      },
                      {
                        statementType: "letStatement",
                        name: "score",
                        value: {
                          nodeType: "expression",
                          term: { termType: "variable", name: "score" },
                          rest: [
                            {
                              op: "+",
                              term: { termType: "numericLiteral", value: 1 },
                            },
                          ],
                        },
                      },
                      {
                        statementType: "doStatement",
                        call: {
                          termType: "subroutineCall",
                          name: "Output.moveCursor",
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
                        },
                      },
                      {
                        statementType: "doStatement",
                        call: {
                          termType: "subroutineCall",
                          name: "Output.printInt",
                          parameters: [
                            {
                              nodeType: "expression",
                              term: { termType: "variable", name: "score" },
                              rest: [],
                            },
                          ],
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
                  name: "ball.bounce",
                  parameters: [
                    {
                      nodeType: "expression",
                      term: {
                        termType: "variable",
                        name: "bouncingDirection",
                      },
                      rest: [],
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
label L0
push this 3
not
not
if-goto L1
label L2
push local 0
push constant 0
eq
push this 3
not
and
not
if-goto L3
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
goto L2
label L3
push local 0
push constant 130
eq
not
if-goto L5
push this 0
push constant 1
call Bat.setDirection 2
pop temp 0
goto L4
label L5
push local 0
push constant 132
eq
not
if-goto L7
push this 0
push constant 2
call Bat.setDirection 2
pop temp 0
goto L6
label L7
push local 0
push constant 140
eq
not
if-goto L9
push constant 1
pop this 3
goto L8
label L9
label L8
label L6
label L4
label L10
push local 0
push constant 0
eq
not
push this 3
not
and
not
if-goto L11
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
goto L10
label L11
goto L0
label L1
push this 3
not
if-goto L13
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
goto L12
label L13
label L12
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
if-goto L15
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
if-goto L17
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
if-goto L19
push local 4
push local 1
push constant 10
add
lt
not
if-goto L21
push constant 1
neg
pop local 0
goto L20
label L21
push local 3
push local 2
push constant 10
sub
gt
not
if-goto L23
push constant 1
pop local 0
goto L22
label L23
label L22
label L20
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
goto L18
label L19
label L18
goto L16
label L17
label L16
push this 1
push local 0
call Ball.bounce 2
pop temp 0
goto L14
label L15
label L14
push constant 0
return`;

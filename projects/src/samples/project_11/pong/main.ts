export const jack = `// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/11/Pong/Main.jack
// (Same as projects/9/Pong/Main.jack)
/**
 * Main class of the Pong game.
 */
class Main {

    /** Initializes a Pong game and starts running it. */
    function void main() {
        var PongGame game;
        do PongGame.newInstance();
        let game = PongGame.getInstance();
        do game.run();
        do game.dispose();
        return;
    }
}`;

export const parsed = {
  name: "Main",
  varDecs: [],
  subroutines: [
    {
      type: "function",
      returnType: "void",
      name: "main",
      parameters: [],
      body: {
        varDecs: [{ type: "PongGame", names: ["game"] }],
        statements: [
          {
            statementType: "doStatement",
            call: {
              termType: "subroutineCall",
              name: "PongGame.newInstance",
              parameters: [],
            },
          },
          {
            statementType: "letStatement",
            name: "game",
            value: {
              nodeType: "expression",
              term: {
                termType: "subroutineCall",
                name: "PongGame.getInstance",
                parameters: [],
              },
              rest: [],
            },
          },
          {
            statementType: "doStatement",
            call: {
              termType: "subroutineCall",
              name: "game.run",
              parameters: [],
            },
          },
          {
            statementType: "doStatement",
            call: {
              termType: "subroutineCall",
              name: "game.dispose",
              parameters: [],
            },
          },
          { statementType: "returnStatement" },
        ],
      },
    },
  ],
};

export const compiled = `function Main.main 1
call PongGame.newInstance 0
pop temp 0
call PongGame.getInstance 0
pop local 0
push local 0
call PongGame.run 1
pop temp 0
push local 0
call PongGame.dispose 1
pop temp 0
push constant 0
return`;

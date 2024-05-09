export const jack = `// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/11/Square/Main.jack

/** Initializes a new Square game and starts running it. */
class Main {
    function void main() {
        var SquareGame game;
        let game = SquareGame.new();
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
        varDecs: [{ type: "SquareGame", names: ["game"] }],
        statements: [
          {
            statementType: "letStatement",
            name: "game",
            value: {
              nodeType: "expression",
              term: {
                termType: "subroutineCall",
                name: "SquareGame.new",
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
call SquareGame.new 0
pop local 0
push local 0
call SquareGame.run 1
pop temp 0
push local 0
call SquareGame.dispose 1
pop temp 0
push constant 0
return`;

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
  name: { value: "Main", span: { start: 243, end: 247, line: 7 } },
  varDecs: [],
  subroutines: [
    {
      type: "function",
      returnType: { value: "void", span: { start: 263, end: 268, line: 8 } },
      name: { value: "main", span: { start: 268, end: 272, line: 8 } },
      parameters: [],
      body: {
        varDecs: [
          {
            type: {
              value: "SquareGame",
              span: { start: 289, end: 300, line: 9 },
            },
            names: ["game"],
          },
        ],
        statements: [
          {
            statementType: "letStatement",
            name: { value: "game", span: { start: 318, end: 322, line: 10 } },
            value: {
              nodeType: "expression",
              term: {
                termType: "subroutineCall",
                name: {
                  value: "SquareGame.new",
                  span: { start: 325, end: 339, line: 10 },
                },
                parameters: [],
                span: { start: 325, end: 341, line: 10 },
              },
              rest: [],
            },
            span: { start: 314, end: 342, line: 10 },
          },
          {
            statementType: "doStatement",
            call: {
              termType: "subroutineCall",
              name: {
                value: "game.run",
                span: { start: 354, end: 362, line: 11 },
              },
              parameters: [],
              span: { start: 354, end: 364, line: 11 },
            },
          },
          {
            statementType: "doStatement",
            call: {
              termType: "subroutineCall",
              name: {
                value: "game.dispose",
                span: { start: 377, end: 389, line: 12 },
              },
              parameters: [],
              span: { start: 377, end: 391, line: 12 },
            },
          },
          {
            statementType: "returnStatement",
            span: { start: 401, end: 408, line: 13 },
          },
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

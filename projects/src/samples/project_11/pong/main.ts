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
  name: { value: "Main", span: { start: 259, end: 263, line: 9 } },
  varDecs: [],
  subroutines: [
    {
      type: "function",
      returnType: { value: "void", span: { start: 338, end: 343, line: 12 } },
      name: { value: "main", span: { start: 343, end: 347, line: 12 } },
      parameters: [],
      body: {
        varDecs: [
          {
            type: {
              value: "PongGame",
              span: { start: 364, end: 373, line: 13 },
            },
            names: ["game"],
          },
        ],
        statements: [
          {
            statementType: "doStatement",
            call: {
              termType: "subroutineCall",
              name: {
                value: "PongGame.newInstance",
                span: { start: 390, end: 410, line: 14 },
              },
              parameters: [],
              span: { start: 390, end: 412, line: 14 },
            },
          },
          {
            statementType: "letStatement",
            name: { value: "game", span: { start: 426, end: 430, line: 15 } },
            value: {
              nodeType: "expression",
              term: {
                termType: "subroutineCall",
                name: {
                  value: "PongGame.getInstance",
                  span: { start: 433, end: 453, line: 15 },
                },
                parameters: [],
                span: { start: 433, end: 455, line: 15 },
              },
              rest: [],
            },
            span: { start: 422, end: 456, line: 15 },
          },
          {
            statementType: "doStatement",
            call: {
              termType: "subroutineCall",
              name: {
                value: "game.run",
                span: { start: 468, end: 476, line: 16 },
              },
              parameters: [],
              span: { start: 468, end: 478, line: 16 },
            },
          },
          {
            statementType: "doStatement",
            call: {
              termType: "subroutineCall",
              name: {
                value: "game.dispose",
                span: { start: 491, end: 503, line: 17 },
              },
              parameters: [],
              span: { start: 491, end: 505, line: 17 },
            },
          },
          {
            statementType: "returnStatement",
            span: { start: 515, end: 522, line: 18 },
          },
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

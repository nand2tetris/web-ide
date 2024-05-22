export const jack = `// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/11/Seven/Main.jack
/**
 * Computes the value of 1 + (2 * 3) and prints the result
 * at the top-left of the screen.  
 */
class Main {

   function void main() {
      do Output.printInt(1 + (2 * 3));
      return;
   }

}`;

export const parsed = {
  name: { value: "Main", span: { start: 284, end: 288, line: 9 } },
  varDecs: [],
  subroutines: [
    {
      type: "function",
      returnType: { value: "void", span: { start: 304, end: 309, line: 11 } },
      name: { value: "main", span: { start: 309, end: 313, line: 11 } },
      parameters: [],
      body: {
        varDecs: [],
        statements: [
          {
            statementType: "doStatement",
            call: {
              termType: "subroutineCall",
              name: {
                value: "Output.printInt",
                span: { start: 327, end: 342, line: 12 },
              },
              parameters: [
                {
                  nodeType: "expression",
                  term: { termType: "numericLiteral", value: 1 },
                  rest: [
                    {
                      op: "+",
                      term: {
                        termType: "groupedExpression",
                        expression: {
                          nodeType: "expression",
                          term: { termType: "numericLiteral", value: 2 },
                          rest: [
                            {
                              op: "*",
                              term: { termType: "numericLiteral", value: 3 },
                            },
                          ],
                        },
                      },
                    },
                  ],
                },
              ],
              span: { start: 327, end: 355, line: 12 },
            },
          },
          {
            statementType: "returnStatement",
            span: { start: 363, end: 370, line: 13 },
          },
        ],
      },
    },
  ],
};

export const compiled = `function Main.main 0
    push constant 1
    push constant 2
    push constant 3
    call Math.multiply 2
    add
    call Output.printInt 1
    pop temp 0
    push constant 0
    return`;

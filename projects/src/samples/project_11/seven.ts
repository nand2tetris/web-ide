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
  name: "Main",
  varDecs: [],
  subroutines: [
    {
      type: "function",
      returnType: "void",
      name: "main",
      parameters: [],
      body: {
        varDecs: [],
        statements: [
          {
            statementType: "doStatement",
            call: {
              termType: "subroutineCall",
              name: "Output.printInt",
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
            },
          },
          { statementType: "returnStatement" },
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

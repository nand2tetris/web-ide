import { unwrap } from "@davidsouther/jiffies/lib/esm/result";
import { JACK } from "./jack";

const jackSamples = [
  {
    name: "Average/Main",
    source: `// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/11/Average/Main.jack

// Inputs some numbers and computes their average
class Main {
   function void main() {
      var Array a; 
      var int length;
      var int i, sum;

      let length = Keyboard.readInt("How many numbers? ");
      let a = Array.new(length); // constructs the array
     
      let i = 0;
      while (i < length) {
         let a[i] = Keyboard.readInt("Enter a number: ");
         let sum = sum + a[i];
         let i = i + 1;
      }

      do Output.printString("The average is ");
      do Output.printInt(sum / length);
      return;
   }
}`,
    parsed: {
      name: "Main",
      varDecs: [],
      subroutines: [
        {
          type: "function",
          returnType: "void",
          name: "main",
          parameters: [],
          body: {
            varDecs: [
              { type: "Array", names: ["a"] },
              { type: "int", names: ["length"] },
              { type: "int", names: ["i", "sum"] },
            ],
            statements: [
              {
                statementType: "letStatement",
                name: "length",
                value: {
                  nodeType: "expression",
                  term: {
                    termType: "subroutineCall",
                    name: "Keyboard.readInt",
                    parameters: [
                      {
                        nodeType: "expression",
                        term: {
                          termType: "stringLiteral",
                          value: "How many numbers? ",
                        },
                        rest: [],
                      },
                    ],
                  },
                  rest: [],
                },
              },
              {
                statementType: "letStatement",
                name: "a",
                value: {
                  nodeType: "expression",
                  term: {
                    termType: "subroutineCall",
                    name: "Array.new",
                    parameters: [
                      {
                        nodeType: "expression",
                        term: { termType: "variable", name: "length" },
                        rest: [],
                      },
                    ],
                  },
                  rest: [],
                },
              },
              {
                statementType: "letStatement",
                name: "i",
                value: {
                  nodeType: "expression",
                  term: { termType: "numericLiteral", value: 0 },
                  rest: [],
                },
              },
              {
                statementType: "whileStatement",
                condition: {
                  nodeType: "expression",
                  term: { termType: "variable", name: "i" },
                  rest: [
                    { op: "<", term: { termType: "variable", name: "length" } },
                  ],
                },
                body: [
                  {
                    statementType: "letStatement",
                    name: "a",
                    arrayIndex: {
                      nodeType: "expression",
                      term: { termType: "variable", name: "i" },
                      rest: [],
                    },
                    value: {
                      nodeType: "expression",
                      term: {
                        termType: "subroutineCall",
                        name: "Keyboard.readInt",
                        parameters: [
                          {
                            nodeType: "expression",
                            term: {
                              termType: "stringLiteral",
                              value: "Enter a number: ",
                            },
                            rest: [],
                          },
                        ],
                      },
                      rest: [],
                    },
                  },
                  {
                    statementType: "letStatement",
                    name: "sum",
                    value: {
                      nodeType: "expression",
                      term: { termType: "variable", name: "sum" },
                      rest: [
                        {
                          op: "+",
                          term: {
                            termType: "arrayAccess",
                            name: "a",
                            index: {
                              nodeType: "expression",
                              term: { termType: "variable", name: "i" },
                              rest: [],
                            },
                          },
                        },
                      ],
                    },
                  },
                  {
                    statementType: "letStatement",
                    name: "i",
                    value: {
                      nodeType: "expression",
                      term: { termType: "variable", name: "i" },
                      rest: [
                        {
                          op: "+",
                          term: { termType: "numericLiteral", value: 1 },
                        },
                      ],
                    },
                  },
                ],
              },
              {
                statementType: "doStatement",
                call: {
                  termType: "subroutineCall",
                  name: "Output.printString",
                  parameters: [
                    {
                      nodeType: "expression",
                      term: {
                        termType: "stringLiteral",
                        value: "The average is ",
                      },
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
                      term: { termType: "variable", name: "sum" },
                      rest: [
                        {
                          op: "/",
                          term: { termType: "variable", name: "length" },
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
    },
  },
];

describe("jack language", () => {
  it.each(jackSamples)("%s", (sample) => {
    const parsed = JACK.parse(sample.source);
    expect(parsed).toBeOk();
    expect(unwrap(parsed)).toEqual(sample.parsed);
  });
});

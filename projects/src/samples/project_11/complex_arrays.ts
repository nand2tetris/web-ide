export const jack = `// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/11/ComplexArrays/Main.jack
/**
 * Performs several complex array processing tests.
 * For each test, the expected result is printed, along with the
 * actual result. In each test, the two results should be equal.
 */
class Main {

    function void main() {
        var Array a, b, c;
        
        let a = Array.new(10);
        let b = Array.new(5);
        let c = Array.new(1);
        
        let a[3] = 2;
        let a[4] = 8;
        let a[5] = 4;
        let b[a[3]] = a[3] + 3;  // b[2] = 5
        let a[b[a[3]]] = a[a[5]] * b[((7 - a[3]) - Main.double(2)) + 1];  // a[5] = 8 * 5 = 40
        let c[0] = null;
        let c = c[0];
        
        do Output.printString("Test 1: expected result: 5; actual result: ");
        do Output.printInt(b[2]);
        do Output.println();
        do Output.printString("Test 2: expected result: 40; actual result: ");
        do Output.printInt(a[5]);
        do Output.println();
        do Output.printString("Test 3: expected result: 0; actual result: ");
        do Output.printInt(c);
        do Output.println();
        
        let c = null;

        if (c = null) {
            do Main.fill(a, 10);
            let c = a[3];
            let c[1] = 33;
            let c = a[7];
            let c[1] = 77;
            let b = a[3];
            let b[1] = b[1] + c[1];  // b[1] = 33 + 77 = 110;
        }

        do Output.printString("Test 4: expected result: 77; actual result: ");
        do Output.printInt(c[1]);
        do Output.println();
        do Output.printString("Test 5: expected result: 110; actual result: ");
        do Output.printInt(b[1]);
        do Output.println();
        return;
    }
    
    function int double(int a) {
      return a * 2;
    }
    
    function void fill(Array a, int size) {
        while (size > 0) {
            let size = size - 1;
            let a[size] = Array.new(3);
        }
        return;
    }
}`;

export const parsed = {
  name: { value: "Main", span: { start: 379, end: 383, line: 10 } },
  varDecs: [],
  subroutines: [
    {
      type: "function",
      returnType: { value: "void", span: { start: 400, end: 405, line: 12 } },
      name: { value: "main", span: { start: 405, end: 409, line: 12 } },
      parameters: [],
      body: {
        varDecs: [
          {
            type: { value: "Array", span: { start: 426, end: 432, line: 13 } },
            names: ["a", "b", "c"],
          },
        ],
        statements: [
          {
            statementType: "letStatement",
            name: { value: "a", span: { start: 462, end: 463, line: 15 } },
            value: {
              nodeType: "expression",
              term: {
                termType: "subroutineCall",
                name: {
                  value: "Array.new",
                  span: { start: 466, end: 475, line: 15 },
                },
                parameters: [
                  {
                    nodeType: "expression",
                    term: { termType: "numericLiteral", value: 10 },
                    rest: [],
                  },
                ],
                span: { start: 466, end: 479, line: 15 },
              },
              rest: [],
            },
            span: { start: 458, end: 480, line: 15 },
          },
          {
            statementType: "letStatement",
            name: { value: "b", span: { start: 493, end: 494, line: 16 } },
            value: {
              nodeType: "expression",
              term: {
                termType: "subroutineCall",
                name: {
                  value: "Array.new",
                  span: { start: 497, end: 506, line: 16 },
                },
                parameters: [
                  {
                    nodeType: "expression",
                    term: { termType: "numericLiteral", value: 5 },
                    rest: [],
                  },
                ],
                span: { start: 497, end: 509, line: 16 },
              },
              rest: [],
            },
            span: { start: 489, end: 510, line: 16 },
          },
          {
            statementType: "letStatement",
            name: { value: "c", span: { start: 523, end: 524, line: 17 } },
            value: {
              nodeType: "expression",
              term: {
                termType: "subroutineCall",
                name: {
                  value: "Array.new",
                  span: { start: 527, end: 536, line: 17 },
                },
                parameters: [
                  {
                    nodeType: "expression",
                    term: { termType: "numericLiteral", value: 1 },
                    rest: [],
                  },
                ],
                span: { start: 527, end: 539, line: 17 },
              },
              rest: [],
            },
            span: { start: 519, end: 540, line: 17 },
          },
          {
            statementType: "letStatement",
            name: { value: "a", span: { start: 562, end: 563, line: 19 } },
            arrayIndex: {
              nodeType: "expression",
              term: { termType: "numericLiteral", value: 3 },
              rest: [],
            },
            value: {
              nodeType: "expression",
              term: { termType: "numericLiteral", value: 2 },
              rest: [],
            },
            span: { start: 558, end: 571, line: 19 },
          },
          {
            statementType: "letStatement",
            name: { value: "a", span: { start: 584, end: 585, line: 20 } },
            arrayIndex: {
              nodeType: "expression",
              term: { termType: "numericLiteral", value: 4 },
              rest: [],
            },
            value: {
              nodeType: "expression",
              term: { termType: "numericLiteral", value: 8 },
              rest: [],
            },
            span: { start: 580, end: 593, line: 20 },
          },
          {
            statementType: "letStatement",
            name: { value: "a", span: { start: 606, end: 607, line: 21 } },
            arrayIndex: {
              nodeType: "expression",
              term: { termType: "numericLiteral", value: 5 },
              rest: [],
            },
            value: {
              nodeType: "expression",
              term: { termType: "numericLiteral", value: 4 },
              rest: [],
            },
            span: { start: 602, end: 615, line: 21 },
          },
          {
            statementType: "letStatement",
            name: { value: "b", span: { start: 628, end: 629, line: 22 } },
            arrayIndex: {
              nodeType: "expression",
              term: {
                termType: "arrayAccess",
                name: { value: "a", span: { start: 630, end: 631, line: 22 } },
                index: {
                  nodeType: "expression",
                  term: { termType: "numericLiteral", value: 3 },
                  rest: [],
                },
                span: { start: 630, end: 634, line: 22 },
              },
              rest: [],
            },
            value: {
              nodeType: "expression",
              term: {
                termType: "arrayAccess",
                name: { value: "a", span: { start: 638, end: 639, line: 22 } },
                index: {
                  nodeType: "expression",
                  term: { termType: "numericLiteral", value: 3 },
                  rest: [],
                },
                span: { start: 638, end: 642, line: 22 },
              },
              rest: [
                { op: "+", term: { termType: "numericLiteral", value: 3 } },
              ],
            },
            span: { start: 624, end: 647, line: 22 },
          },
          {
            statementType: "letStatement",
            name: { value: "a", span: { start: 673, end: 674, line: 23 } },
            arrayIndex: {
              nodeType: "expression",
              term: {
                termType: "arrayAccess",
                name: { value: "b", span: { start: 675, end: 676, line: 23 } },
                index: {
                  nodeType: "expression",
                  term: {
                    termType: "arrayAccess",
                    name: {
                      value: "a",
                      span: { start: 677, end: 678, line: 23 },
                    },
                    index: {
                      nodeType: "expression",
                      term: { termType: "numericLiteral", value: 3 },
                      rest: [],
                    },
                    span: { start: 677, end: 681, line: 23 },
                  },
                  rest: [],
                },
                span: { start: 675, end: 682, line: 23 },
              },
              rest: [],
            },
            value: {
              nodeType: "expression",
              term: {
                termType: "arrayAccess",
                name: { value: "a", span: { start: 686, end: 687, line: 23 } },
                index: {
                  nodeType: "expression",
                  term: {
                    termType: "arrayAccess",
                    name: {
                      value: "a",
                      span: { start: 688, end: 689, line: 23 },
                    },
                    index: {
                      nodeType: "expression",
                      term: { termType: "numericLiteral", value: 5 },
                      rest: [],
                    },
                    span: { start: 688, end: 692, line: 23 },
                  },
                  rest: [],
                },
                span: { start: 686, end: 693, line: 23 },
              },
              rest: [
                {
                  op: "*",
                  term: {
                    termType: "arrayAccess",
                    name: {
                      value: "b",
                      span: { start: 696, end: 697, line: 23 },
                    },
                    index: {
                      nodeType: "expression",
                      term: {
                        termType: "groupedExpression",
                        expression: {
                          nodeType: "expression",
                          term: {
                            termType: "groupedExpression",
                            expression: {
                              nodeType: "expression",
                              term: { termType: "numericLiteral", value: 7 },
                              rest: [
                                {
                                  op: "-",
                                  term: {
                                    termType: "arrayAccess",
                                    name: {
                                      value: "a",
                                      span: { start: 704, end: 705, line: 23 },
                                    },
                                    index: {
                                      nodeType: "expression",
                                      term: {
                                        termType: "numericLiteral",
                                        value: 3,
                                      },
                                      rest: [],
                                    },
                                    span: { start: 704, end: 708, line: 23 },
                                  },
                                },
                              ],
                            },
                          },
                          rest: [
                            {
                              op: "-",
                              term: {
                                termType: "subroutineCall",
                                name: {
                                  value: "Main.double",
                                  span: { start: 712, end: 723, line: 23 },
                                },
                                parameters: [
                                  {
                                    nodeType: "expression",
                                    term: {
                                      termType: "numericLiteral",
                                      value: 2,
                                    },
                                    rest: [],
                                  },
                                ],
                                span: { start: 712, end: 726, line: 23 },
                              },
                            },
                          ],
                        },
                      },
                      rest: [
                        {
                          op: "+",
                          term: { termType: "numericLiteral", value: 1 },
                        },
                      ],
                    },
                    span: { start: 696, end: 732, line: 23 },
                  },
                },
              ],
            },
            span: { start: 669, end: 733, line: 23 },
          },
          {
            statementType: "letStatement",
            name: { value: "c", span: { start: 768, end: 769, line: 24 } },
            arrayIndex: {
              nodeType: "expression",
              term: { termType: "numericLiteral", value: 0 },
              rest: [],
            },
            value: {
              nodeType: "expression",
              term: { termType: "keywordLiteral", value: "null" },
              rest: [],
            },
            span: { start: 764, end: 780, line: 24 },
          },
          {
            statementType: "letStatement",
            name: { value: "c", span: { start: 793, end: 794, line: 25 } },
            value: {
              nodeType: "expression",
              term: {
                termType: "arrayAccess",
                name: { value: "c", span: { start: 797, end: 798, line: 25 } },
                index: {
                  nodeType: "expression",
                  term: { termType: "numericLiteral", value: 0 },
                  rest: [],
                },
                span: { start: 797, end: 801, line: 25 },
              },
              rest: [],
            },
            span: { start: 789, end: 802, line: 25 },
          },
          {
            statementType: "doStatement",
            call: {
              termType: "subroutineCall",
              name: {
                value: "Output.printString",
                span: { start: 823, end: 841, line: 27 },
              },
              parameters: [
                {
                  nodeType: "expression",
                  term: {
                    termType: "stringLiteral",
                    value: "Test 1: expected result: 5; actual result: ",
                  },
                  rest: [],
                },
              ],
              span: { start: 823, end: 888, line: 27 },
            },
          },
          {
            statementType: "doStatement",
            call: {
              termType: "subroutineCall",
              name: {
                value: "Output.printInt",
                span: { start: 901, end: 916, line: 28 },
              },
              parameters: [
                {
                  nodeType: "expression",
                  term: {
                    termType: "arrayAccess",
                    name: {
                      value: "b",
                      span: { start: 917, end: 918, line: 28 },
                    },
                    index: {
                      nodeType: "expression",
                      term: { termType: "numericLiteral", value: 2 },
                      rest: [],
                    },
                    span: { start: 917, end: 921, line: 28 },
                  },
                  rest: [],
                },
              ],
              span: { start: 901, end: 922, line: 28 },
            },
          },
          {
            statementType: "doStatement",
            call: {
              termType: "subroutineCall",
              name: {
                value: "Output.println",
                span: { start: 935, end: 949, line: 29 },
              },
              parameters: [],
              span: { start: 935, end: 951, line: 29 },
            },
          },
          {
            statementType: "doStatement",
            call: {
              termType: "subroutineCall",
              name: {
                value: "Output.printString",
                span: { start: 964, end: 982, line: 30 },
              },
              parameters: [
                {
                  nodeType: "expression",
                  term: {
                    termType: "stringLiteral",
                    value: "Test 2: expected result: 40; actual result: ",
                  },
                  rest: [],
                },
              ],
              span: { start: 964, end: 1030, line: 30 },
            },
          },
          {
            statementType: "doStatement",
            call: {
              termType: "subroutineCall",
              name: {
                value: "Output.printInt",
                span: { start: 1043, end: 1058, line: 31 },
              },
              parameters: [
                {
                  nodeType: "expression",
                  term: {
                    termType: "arrayAccess",
                    name: {
                      value: "a",
                      span: { start: 1059, end: 1060, line: 31 },
                    },
                    index: {
                      nodeType: "expression",
                      term: { termType: "numericLiteral", value: 5 },
                      rest: [],
                    },
                    span: { start: 1059, end: 1063, line: 31 },
                  },
                  rest: [],
                },
              ],
              span: { start: 1043, end: 1064, line: 31 },
            },
          },
          {
            statementType: "doStatement",
            call: {
              termType: "subroutineCall",
              name: {
                value: "Output.println",
                span: { start: 1077, end: 1091, line: 32 },
              },
              parameters: [],
              span: { start: 1077, end: 1093, line: 32 },
            },
          },
          {
            statementType: "doStatement",
            call: {
              termType: "subroutineCall",
              name: {
                value: "Output.printString",
                span: { start: 1106, end: 1124, line: 33 },
              },
              parameters: [
                {
                  nodeType: "expression",
                  term: {
                    termType: "stringLiteral",
                    value: "Test 3: expected result: 0; actual result: ",
                  },
                  rest: [],
                },
              ],
              span: { start: 1106, end: 1171, line: 33 },
            },
          },
          {
            statementType: "doStatement",
            call: {
              termType: "subroutineCall",
              name: {
                value: "Output.printInt",
                span: { start: 1184, end: 1199, line: 34 },
              },
              parameters: [
                {
                  nodeType: "expression",
                  term: {
                    termType: "variable",
                    name: "c",
                    span: { start: 1200, end: 1201, line: 34 },
                  },
                  rest: [],
                },
              ],
              span: { start: 1184, end: 1202, line: 34 },
            },
          },
          {
            statementType: "doStatement",
            call: {
              termType: "subroutineCall",
              name: {
                value: "Output.println",
                span: { start: 1215, end: 1229, line: 35 },
              },
              parameters: [],
              span: { start: 1215, end: 1231, line: 35 },
            },
          },
          {
            statementType: "letStatement",
            name: { value: "c", span: { start: 1254, end: 1255, line: 37 } },
            value: {
              nodeType: "expression",
              term: { termType: "keywordLiteral", value: "null" },
              rest: [],
            },
            span: { start: 1250, end: 1263, line: 37 },
          },
          {
            statementType: "ifStatement",
            condition: {
              nodeType: "expression",
              term: {
                termType: "variable",
                name: "c",
                span: { start: 1277, end: 1278, line: 39 },
              },
              rest: [
                {
                  op: "=",
                  term: { termType: "keywordLiteral", value: "null" },
                },
              ],
            },
            body: [
              {
                statementType: "doStatement",
                call: {
                  termType: "subroutineCall",
                  name: {
                    value: "Main.fill",
                    span: { start: 1304, end: 1313, line: 40 },
                  },
                  parameters: [
                    {
                      nodeType: "expression",
                      term: {
                        termType: "variable",
                        name: "a",
                        span: { start: 1314, end: 1315, line: 40 },
                      },
                      rest: [],
                    },
                    {
                      nodeType: "expression",
                      term: { termType: "numericLiteral", value: 10 },
                      rest: [],
                    },
                  ],
                  span: { start: 1304, end: 1320, line: 40 },
                },
              },
              {
                statementType: "letStatement",
                name: {
                  value: "c",
                  span: { start: 1338, end: 1339, line: 41 },
                },
                value: {
                  nodeType: "expression",
                  term: {
                    termType: "arrayAccess",
                    name: {
                      value: "a",
                      span: { start: 1342, end: 1343, line: 41 },
                    },
                    index: {
                      nodeType: "expression",
                      term: { termType: "numericLiteral", value: 3 },
                      rest: [],
                    },
                    span: { start: 1342, end: 1346, line: 41 },
                  },
                  rest: [],
                },
                span: { start: 1334, end: 1347, line: 41 },
              },
              {
                statementType: "letStatement",
                name: {
                  value: "c",
                  span: { start: 1364, end: 1365, line: 42 },
                },
                arrayIndex: {
                  nodeType: "expression",
                  term: { termType: "numericLiteral", value: 1 },
                  rest: [],
                },
                value: {
                  nodeType: "expression",
                  term: { termType: "numericLiteral", value: 33 },
                  rest: [],
                },
                span: { start: 1360, end: 1374, line: 42 },
              },
              {
                statementType: "letStatement",
                name: {
                  value: "c",
                  span: { start: 1391, end: 1392, line: 43 },
                },
                value: {
                  nodeType: "expression",
                  term: {
                    termType: "arrayAccess",
                    name: {
                      value: "a",
                      span: { start: 1395, end: 1396, line: 43 },
                    },
                    index: {
                      nodeType: "expression",
                      term: { termType: "numericLiteral", value: 7 },
                      rest: [],
                    },
                    span: { start: 1395, end: 1399, line: 43 },
                  },
                  rest: [],
                },
                span: { start: 1387, end: 1400, line: 43 },
              },
              {
                statementType: "letStatement",
                name: {
                  value: "c",
                  span: { start: 1417, end: 1418, line: 44 },
                },
                arrayIndex: {
                  nodeType: "expression",
                  term: { termType: "numericLiteral", value: 1 },
                  rest: [],
                },
                value: {
                  nodeType: "expression",
                  term: { termType: "numericLiteral", value: 77 },
                  rest: [],
                },
                span: { start: 1413, end: 1427, line: 44 },
              },
              {
                statementType: "letStatement",
                name: {
                  value: "b",
                  span: { start: 1444, end: 1445, line: 45 },
                },
                value: {
                  nodeType: "expression",
                  term: {
                    termType: "arrayAccess",
                    name: {
                      value: "a",
                      span: { start: 1448, end: 1449, line: 45 },
                    },
                    index: {
                      nodeType: "expression",
                      term: { termType: "numericLiteral", value: 3 },
                      rest: [],
                    },
                    span: { start: 1448, end: 1452, line: 45 },
                  },
                  rest: [],
                },
                span: { start: 1440, end: 1453, line: 45 },
              },
              {
                statementType: "letStatement",
                name: {
                  value: "b",
                  span: { start: 1470, end: 1471, line: 46 },
                },
                arrayIndex: {
                  nodeType: "expression",
                  term: { termType: "numericLiteral", value: 1 },
                  rest: [],
                },
                value: {
                  nodeType: "expression",
                  term: {
                    termType: "arrayAccess",
                    name: {
                      value: "b",
                      span: { start: 1477, end: 1478, line: 46 },
                    },
                    index: {
                      nodeType: "expression",
                      term: { termType: "numericLiteral", value: 1 },
                      rest: [],
                    },
                    span: { start: 1477, end: 1481, line: 46 },
                  },
                  rest: [
                    {
                      op: "+",
                      term: {
                        termType: "arrayAccess",
                        name: {
                          value: "c",
                          span: { start: 1484, end: 1485, line: 46 },
                        },
                        index: {
                          nodeType: "expression",
                          term: { termType: "numericLiteral", value: 1 },
                          rest: [],
                        },
                        span: { start: 1484, end: 1488, line: 46 },
                      },
                    },
                  ],
                },
                span: { start: 1466, end: 1489, line: 46 },
              },
            ],
            else: [],
          },
          {
            statementType: "doStatement",
            call: {
              termType: "subroutineCall",
              name: {
                value: "Output.printString",
                span: { start: 1538, end: 1556, line: 49 },
              },
              parameters: [
                {
                  nodeType: "expression",
                  term: {
                    termType: "stringLiteral",
                    value: "Test 4: expected result: 77; actual result: ",
                  },
                  rest: [],
                },
              ],
              span: { start: 1538, end: 1604, line: 49 },
            },
          },
          {
            statementType: "doStatement",
            call: {
              termType: "subroutineCall",
              name: {
                value: "Output.printInt",
                span: { start: 1617, end: 1632, line: 50 },
              },
              parameters: [
                {
                  nodeType: "expression",
                  term: {
                    termType: "arrayAccess",
                    name: {
                      value: "c",
                      span: { start: 1633, end: 1634, line: 50 },
                    },
                    index: {
                      nodeType: "expression",
                      term: { termType: "numericLiteral", value: 1 },
                      rest: [],
                    },
                    span: { start: 1633, end: 1637, line: 50 },
                  },
                  rest: [],
                },
              ],
              span: { start: 1617, end: 1638, line: 50 },
            },
          },
          {
            statementType: "doStatement",
            call: {
              termType: "subroutineCall",
              name: {
                value: "Output.println",
                span: { start: 1651, end: 1665, line: 51 },
              },
              parameters: [],
              span: { start: 1651, end: 1667, line: 51 },
            },
          },
          {
            statementType: "doStatement",
            call: {
              termType: "subroutineCall",
              name: {
                value: "Output.printString",
                span: { start: 1680, end: 1698, line: 52 },
              },
              parameters: [
                {
                  nodeType: "expression",
                  term: {
                    termType: "stringLiteral",
                    value: "Test 5: expected result: 110; actual result: ",
                  },
                  rest: [],
                },
              ],
              span: { start: 1680, end: 1747, line: 52 },
            },
          },
          {
            statementType: "doStatement",
            call: {
              termType: "subroutineCall",
              name: {
                value: "Output.printInt",
                span: { start: 1760, end: 1775, line: 53 },
              },
              parameters: [
                {
                  nodeType: "expression",
                  term: {
                    termType: "arrayAccess",
                    name: {
                      value: "b",
                      span: { start: 1776, end: 1777, line: 53 },
                    },
                    index: {
                      nodeType: "expression",
                      term: { termType: "numericLiteral", value: 1 },
                      rest: [],
                    },
                    span: { start: 1776, end: 1780, line: 53 },
                  },
                  rest: [],
                },
              ],
              span: { start: 1760, end: 1781, line: 53 },
            },
          },
          {
            statementType: "doStatement",
            call: {
              termType: "subroutineCall",
              name: {
                value: "Output.println",
                span: { start: 1794, end: 1808, line: 54 },
              },
              parameters: [],
              span: { start: 1794, end: 1810, line: 54 },
            },
          },
          {
            statementType: "returnStatement",
            span: { start: 1820, end: 1827, line: 55 },
          },
        ],
      },
    },
    {
      type: "function",
      returnType: { value: "int", span: { start: 1852, end: 1856, line: 58 } },
      name: { value: "double", span: { start: 1856, end: 1862, line: 58 } },
      parameters: [
        {
          type: { value: "int", span: { start: 1863, end: 1867, line: 58 } },
          name: "a",
        },
      ],
      body: {
        varDecs: [],
        statements: [
          {
            statementType: "returnStatement",
            value: {
              nodeType: "expression",
              term: {
                termType: "variable",
                name: "a",
                span: { start: 1885, end: 1886, line: 59 },
              },
              rest: [
                { op: "*", term: { termType: "numericLiteral", value: 2 } },
              ],
            },
            span: { start: 1878, end: 1891, line: 59 },
          },
        ],
      },
    },
    {
      type: "function",
      returnType: { value: "void", span: { start: 1916, end: 1921, line: 62 } },
      name: { value: "fill", span: { start: 1921, end: 1925, line: 62 } },
      parameters: [
        {
          type: { value: "Array", span: { start: 1926, end: 1932, line: 62 } },
          name: "a",
        },
        {
          type: { value: "int", span: { start: 1935, end: 1939, line: 62 } },
          name: "size",
        },
      ],
      body: {
        varDecs: [],
        statements: [
          {
            statementType: "whileStatement",
            condition: {
              nodeType: "expression",
              term: {
                termType: "variable",
                name: "size",
                span: { start: 1962, end: 1966, line: 63 },
              },
              rest: [
                { op: ">", term: { termType: "numericLiteral", value: 0 } },
              ],
            },
            body: [
              {
                statementType: "letStatement",
                name: {
                  value: "size",
                  span: { start: 1990, end: 1994, line: 64 },
                },
                value: {
                  nodeType: "expression",
                  term: {
                    termType: "variable",
                    name: "size",
                    span: { start: 1997, end: 2001, line: 64 },
                  },
                  rest: [
                    { op: "-", term: { termType: "numericLiteral", value: 1 } },
                  ],
                },
                span: { start: 1986, end: 2006, line: 64 },
              },
              {
                statementType: "letStatement",
                name: {
                  value: "a",
                  span: { start: 2023, end: 2024, line: 65 },
                },
                arrayIndex: {
                  nodeType: "expression",
                  term: {
                    termType: "variable",
                    name: "size",
                    span: { start: 2025, end: 2029, line: 65 },
                  },
                  rest: [],
                },
                value: {
                  nodeType: "expression",
                  term: {
                    termType: "subroutineCall",
                    name: {
                      value: "Array.new",
                      span: { start: 2033, end: 2042, line: 65 },
                    },
                    parameters: [
                      {
                        nodeType: "expression",
                        term: { termType: "numericLiteral", value: 3 },
                        rest: [],
                      },
                    ],
                    span: { start: 2033, end: 2045, line: 65 },
                  },
                  rest: [],
                },
                span: { start: 2019, end: 2046, line: 65 },
              },
            ],
          },
          {
            statementType: "returnStatement",
            span: { start: 2065, end: 2072, line: 67 },
          },
        ],
      },
    },
  ],
};

export const compiled = `function Main.main 3
    push constant 10
    call Array.new 1
    pop local 0
    push constant 5
    call Array.new 1
    pop local 1
    push constant 1
    call Array.new 1
    pop local 2
    push constant 3
    push local 0
    add
    push constant 2
    pop temp 0
    pop pointer 1
    push temp 0
    pop that 0
    push constant 4
    push local 0
    add
    push constant 8
    pop temp 0
    pop pointer 1
    push temp 0
    pop that 0
    push constant 5
    push local 0
    add
    push constant 4
    pop temp 0
    pop pointer 1
    push temp 0
    pop that 0
    push constant 3
    push local 0
    add
    pop pointer 1
    push that 0
    push local 1
    add
    push constant 3
    push local 0
    add
    pop pointer 1
    push that 0
    push constant 3
    add
    pop temp 0
    pop pointer 1
    push temp 0
    pop that 0
    push constant 3
    push local 0
    add
    pop pointer 1
    push that 0
    push local 1
    add
    pop pointer 1
    push that 0
    push local 0
    add
    push constant 5
    push local 0
    add
    pop pointer 1
    push that 0
    push local 0
    add
    pop pointer 1
    push that 0
    push constant 7
    push constant 3
    push local 0
    add
    pop pointer 1
    push that 0
    sub
    push constant 2
    call Main.double 1
    sub
    push constant 1
    add
    push local 1
    add
    pop pointer 1
    push that 0
    call Math.multiply 2
    pop temp 0
    pop pointer 1
    push temp 0
    pop that 0
    push constant 0
    push local 2
    add
    push constant 0
    pop temp 0
    pop pointer 1
    push temp 0
    pop that 0
    push constant 0
    push local 2
    add
    pop pointer 1
    push that 0
    pop local 2
    push constant 43
    call String.new 1
    push constant 84
    call String.appendChar 2
    push constant 101
    call String.appendChar 2
    push constant 115
    call String.appendChar 2
    push constant 116
    call String.appendChar 2
    push constant 32
    call String.appendChar 2
    push constant 49
    call String.appendChar 2
    push constant 58
    call String.appendChar 2
    push constant 32
    call String.appendChar 2
    push constant 101
    call String.appendChar 2
    push constant 120
    call String.appendChar 2
    push constant 112
    call String.appendChar 2
    push constant 101
    call String.appendChar 2
    push constant 99
    call String.appendChar 2
    push constant 116
    call String.appendChar 2
    push constant 101
    call String.appendChar 2
    push constant 100
    call String.appendChar 2
    push constant 32
    call String.appendChar 2
    push constant 114
    call String.appendChar 2
    push constant 101
    call String.appendChar 2
    push constant 115
    call String.appendChar 2
    push constant 117
    call String.appendChar 2
    push constant 108
    call String.appendChar 2
    push constant 116
    call String.appendChar 2
    push constant 58
    call String.appendChar 2
    push constant 32
    call String.appendChar 2
    push constant 53
    call String.appendChar 2
    push constant 59
    call String.appendChar 2
    push constant 32
    call String.appendChar 2
    push constant 97
    call String.appendChar 2
    push constant 99
    call String.appendChar 2
    push constant 116
    call String.appendChar 2
    push constant 117
    call String.appendChar 2
    push constant 97
    call String.appendChar 2
    push constant 108
    call String.appendChar 2
    push constant 32
    call String.appendChar 2
    push constant 114
    call String.appendChar 2
    push constant 101
    call String.appendChar 2
    push constant 115
    call String.appendChar 2
    push constant 117
    call String.appendChar 2
    push constant 108
    call String.appendChar 2
    push constant 116
    call String.appendChar 2
    push constant 58
    call String.appendChar 2
    push constant 32
    call String.appendChar 2
    call Output.printString 1
    pop temp 0
    push constant 2
    push local 1
    add
    pop pointer 1
    push that 0
    call Output.printInt 1
    pop temp 0
    call Output.println 0
    pop temp 0
    push constant 44
    call String.new 1
    push constant 84
    call String.appendChar 2
    push constant 101
    call String.appendChar 2
    push constant 115
    call String.appendChar 2
    push constant 116
    call String.appendChar 2
    push constant 32
    call String.appendChar 2
    push constant 50
    call String.appendChar 2
    push constant 58
    call String.appendChar 2
    push constant 32
    call String.appendChar 2
    push constant 101
    call String.appendChar 2
    push constant 120
    call String.appendChar 2
    push constant 112
    call String.appendChar 2
    push constant 101
    call String.appendChar 2
    push constant 99
    call String.appendChar 2
    push constant 116
    call String.appendChar 2
    push constant 101
    call String.appendChar 2
    push constant 100
    call String.appendChar 2
    push constant 32
    call String.appendChar 2
    push constant 114
    call String.appendChar 2
    push constant 101
    call String.appendChar 2
    push constant 115
    call String.appendChar 2
    push constant 117
    call String.appendChar 2
    push constant 108
    call String.appendChar 2
    push constant 116
    call String.appendChar 2
    push constant 58
    call String.appendChar 2
    push constant 32
    call String.appendChar 2
    push constant 52
    call String.appendChar 2
    push constant 48
    call String.appendChar 2
    push constant 59
    call String.appendChar 2
    push constant 32
    call String.appendChar 2
    push constant 97
    call String.appendChar 2
    push constant 99
    call String.appendChar 2
    push constant 116
    call String.appendChar 2
    push constant 117
    call String.appendChar 2
    push constant 97
    call String.appendChar 2
    push constant 108
    call String.appendChar 2
    push constant 32
    call String.appendChar 2
    push constant 114
    call String.appendChar 2
    push constant 101
    call String.appendChar 2
    push constant 115
    call String.appendChar 2
    push constant 117
    call String.appendChar 2
    push constant 108
    call String.appendChar 2
    push constant 116
    call String.appendChar 2
    push constant 58
    call String.appendChar 2
    push constant 32
    call String.appendChar 2
    call Output.printString 1
    pop temp 0
    push constant 5
    push local 0
    add
    pop pointer 1
    push that 0
    call Output.printInt 1
    pop temp 0
    call Output.println 0
    pop temp 0
    push constant 43
    call String.new 1
    push constant 84
    call String.appendChar 2
    push constant 101
    call String.appendChar 2
    push constant 115
    call String.appendChar 2
    push constant 116
    call String.appendChar 2
    push constant 32
    call String.appendChar 2
    push constant 51
    call String.appendChar 2
    push constant 58
    call String.appendChar 2
    push constant 32
    call String.appendChar 2
    push constant 101
    call String.appendChar 2
    push constant 120
    call String.appendChar 2
    push constant 112
    call String.appendChar 2
    push constant 101
    call String.appendChar 2
    push constant 99
    call String.appendChar 2
    push constant 116
    call String.appendChar 2
    push constant 101
    call String.appendChar 2
    push constant 100
    call String.appendChar 2
    push constant 32
    call String.appendChar 2
    push constant 114
    call String.appendChar 2
    push constant 101
    call String.appendChar 2
    push constant 115
    call String.appendChar 2
    push constant 117
    call String.appendChar 2
    push constant 108
    call String.appendChar 2
    push constant 116
    call String.appendChar 2
    push constant 58
    call String.appendChar 2
    push constant 32
    call String.appendChar 2
    push constant 48
    call String.appendChar 2
    push constant 59
    call String.appendChar 2
    push constant 32
    call String.appendChar 2
    push constant 97
    call String.appendChar 2
    push constant 99
    call String.appendChar 2
    push constant 116
    call String.appendChar 2
    push constant 117
    call String.appendChar 2
    push constant 97
    call String.appendChar 2
    push constant 108
    call String.appendChar 2
    push constant 32
    call String.appendChar 2
    push constant 114
    call String.appendChar 2
    push constant 101
    call String.appendChar 2
    push constant 115
    call String.appendChar 2
    push constant 117
    call String.appendChar 2
    push constant 108
    call String.appendChar 2
    push constant 116
    call String.appendChar 2
    push constant 58
    call String.appendChar 2
    push constant 32
    call String.appendChar 2
    call Output.printString 1
    pop temp 0
    push local 2
    call Output.printInt 1
    pop temp 0
    call Output.println 0
    pop temp 0
    push constant 0
    pop local 2
    push local 2
    push constant 0
    eq
    not
    if-goto Main_1
    push local 0
    push constant 10
    call Main.fill 2
    pop temp 0
    push constant 3
    push local 0
    add
    pop pointer 1
    push that 0
    pop local 2
    push constant 1
    push local 2
    add
    push constant 33
    pop temp 0
    pop pointer 1
    push temp 0
    pop that 0
    push constant 7
    push local 0
    add
    pop pointer 1
    push that 0
    pop local 2
    push constant 1
    push local 2
    add
    push constant 77
    pop temp 0
    pop pointer 1
    push temp 0
    pop that 0
    push constant 3
    push local 0
    add
    pop pointer 1
    push that 0
    pop local 1
    push constant 1
    push local 1
    add
    push constant 1
    push local 1
    add
    pop pointer 1
    push that 0
    push constant 1
    push local 2
    add
    pop pointer 1
    push that 0
    add
    pop temp 0
    pop pointer 1
    push temp 0
    pop that 0
    goto Main_0
label Main_1
label Main_0
    push constant 44
    call String.new 1
    push constant 84
    call String.appendChar 2
    push constant 101
    call String.appendChar 2
    push constant 115
    call String.appendChar 2
    push constant 116
    call String.appendChar 2
    push constant 32
    call String.appendChar 2
    push constant 52
    call String.appendChar 2
    push constant 58
    call String.appendChar 2
    push constant 32
    call String.appendChar 2
    push constant 101
    call String.appendChar 2
    push constant 120
    call String.appendChar 2
    push constant 112
    call String.appendChar 2
    push constant 101
    call String.appendChar 2
    push constant 99
    call String.appendChar 2
    push constant 116
    call String.appendChar 2
    push constant 101
    call String.appendChar 2
    push constant 100
    call String.appendChar 2
    push constant 32
    call String.appendChar 2
    push constant 114
    call String.appendChar 2
    push constant 101
    call String.appendChar 2
    push constant 115
    call String.appendChar 2
    push constant 117
    call String.appendChar 2
    push constant 108
    call String.appendChar 2
    push constant 116
    call String.appendChar 2
    push constant 58
    call String.appendChar 2
    push constant 32
    call String.appendChar 2
    push constant 55
    call String.appendChar 2
    push constant 55
    call String.appendChar 2
    push constant 59
    call String.appendChar 2
    push constant 32
    call String.appendChar 2
    push constant 97
    call String.appendChar 2
    push constant 99
    call String.appendChar 2
    push constant 116
    call String.appendChar 2
    push constant 117
    call String.appendChar 2
    push constant 97
    call String.appendChar 2
    push constant 108
    call String.appendChar 2
    push constant 32
    call String.appendChar 2
    push constant 114
    call String.appendChar 2
    push constant 101
    call String.appendChar 2
    push constant 115
    call String.appendChar 2
    push constant 117
    call String.appendChar 2
    push constant 108
    call String.appendChar 2
    push constant 116
    call String.appendChar 2
    push constant 58
    call String.appendChar 2
    push constant 32
    call String.appendChar 2
    call Output.printString 1
    pop temp 0
    push constant 1
    push local 2
    add
    pop pointer 1
    push that 0
    call Output.printInt 1
    pop temp 0
    call Output.println 0
    pop temp 0
    push constant 45
    call String.new 1
    push constant 84
    call String.appendChar 2
    push constant 101
    call String.appendChar 2
    push constant 115
    call String.appendChar 2
    push constant 116
    call String.appendChar 2
    push constant 32
    call String.appendChar 2
    push constant 53
    call String.appendChar 2
    push constant 58
    call String.appendChar 2
    push constant 32
    call String.appendChar 2
    push constant 101
    call String.appendChar 2
    push constant 120
    call String.appendChar 2
    push constant 112
    call String.appendChar 2
    push constant 101
    call String.appendChar 2
    push constant 99
    call String.appendChar 2
    push constant 116
    call String.appendChar 2
    push constant 101
    call String.appendChar 2
    push constant 100
    call String.appendChar 2
    push constant 32
    call String.appendChar 2
    push constant 114
    call String.appendChar 2
    push constant 101
    call String.appendChar 2
    push constant 115
    call String.appendChar 2
    push constant 117
    call String.appendChar 2
    push constant 108
    call String.appendChar 2
    push constant 116
    call String.appendChar 2
    push constant 58
    call String.appendChar 2
    push constant 32
    call String.appendChar 2
    push constant 49
    call String.appendChar 2
    push constant 49
    call String.appendChar 2
    push constant 48
    call String.appendChar 2
    push constant 59
    call String.appendChar 2
    push constant 32
    call String.appendChar 2
    push constant 97
    call String.appendChar 2
    push constant 99
    call String.appendChar 2
    push constant 116
    call String.appendChar 2
    push constant 117
    call String.appendChar 2
    push constant 97
    call String.appendChar 2
    push constant 108
    call String.appendChar 2
    push constant 32
    call String.appendChar 2
    push constant 114
    call String.appendChar 2
    push constant 101
    call String.appendChar 2
    push constant 115
    call String.appendChar 2
    push constant 117
    call String.appendChar 2
    push constant 108
    call String.appendChar 2
    push constant 116
    call String.appendChar 2
    push constant 58
    call String.appendChar 2
    push constant 32
    call String.appendChar 2
    call Output.printString 1
    pop temp 0
    push constant 1
    push local 1
    add
    pop pointer 1
    push that 0
    call Output.printInt 1
    pop temp 0
    call Output.println 0
    pop temp 0
    push constant 0
    return
function Main.double 0
    push argument 0
    push constant 2
    call Math.multiply 2
    return
function Main.fill 0
label Main_2
    push argument 1
    push constant 0
    gt
    not
    if-goto Main_3
    push argument 1
    push constant 1
    sub
    pop argument 1
    push argument 1
    push argument 0
    add
    push constant 3
    call Array.new 1
    pop temp 0
    pop pointer 1
    push temp 0
    pop that 0
    goto Main_2
label Main_3
    push constant 0
    return`;

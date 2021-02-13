import parser
import unittest

from io import StringIO

import compiler
import parser
import parser_test

class CompilerTestParser(parser.Parser):
    def __init__(self, source):
        self.tokenizer = parser.Tokenizer(StringIO(source))
        self.tree = []
        while self.tokenizer.hasToken():
            instruction = self.tokenizer.instruction()
            self.tree.append(instruction)
    
    def tokenize(self):
        return parser.TokenList(self.tree);

    def parse(self, Instruction):
        return Instruction(self.tokenize())

class CompilerTestCase(parser_test.ParserTestCase):
    def compile(self, source, Instruction):
        return CompilerTestParser(source).parse(Instruction)
    
    def expression(self, source):
        return self.compile(source, compiler.Expression)
    
    def statement(self, source):
        return compiler.Statement.next(CompilerTestParser(source).tokenize())

class TestExpression(CompilerTestCase):
    def test_unaryTree(self):
        expression = self.expression('-a')
        self.assertInstructionList([expression], [
            (compiler.Expression, {}, [
                (compiler.UnaryExpression, {'op': {'symbol': '-'}}, [
                    (compiler.Term, {}, [
                        (compiler.IdentifierToken, {'token': 'a'})
                    ])
                ])
            ])
        ])
    
    def test_binaryTree(self):
        expression = self.expression('A + B')
        self.assertInstructionList([expression], [
            (compiler.Expression, {}, [
                (compiler.Term, {}, [(compiler.IdentifierToken, {'token': 'A'})]),
                (compiler.SymbolToken, {'symbol': '+'}),
                (compiler.Term, {}, [(compiler.IdentifierToken, {'token': 'B'})]),
            ])
        ])
    
    def test_nestedTree(self):
        expression = self.expression('A + (B * C)')
        self.assertInstructionList([expression], [
            (compiler.Expression, {}, [
                (compiler.Term, {}, [(compiler.IdentifierToken, {'token': 'A'})]),
                (compiler.SymbolToken, {'symbol': '+'}),
                (compiler.GroupExpression, {}, [
                    (compiler.Term, {}, [(compiler.IdentifierToken, {'token': 'B'})]),
                    (compiler.SymbolToken, {'symbol': '*'}),
                    (compiler.Term, {}, [(compiler.IdentifierToken, {'token': 'C'})]),
                ])
            ])
        ])
    
    def test_mixed_expression(self):
        expression = self.expression('A + -B')
        self.assertInstructionList([expression], [
            (compiler.Expression, {}, [
                (compiler.Term, {}, [(compiler.IdentifierToken, {'token': 'A'})]),
                (compiler.SymbolToken, {'symbol': '+'}),
                (compiler.UnaryExpression, {'op': {'symbol': '-'}}, [
                    (compiler.Term, {}, [
                        (compiler.IdentifierToken, {'token': 'B'})
                    ])
                ])
            ])
        ])
    
    def test_callProcedure(self):
        expression = self.expression('a.b()')
        self.assertInstructionList(expression.tree, [
            (compiler.CallExpression, {'subroutine': 'b', 'var': 'a'}, [])
        ])

    def test_callFunction(self):
        expression = self.expression('b(a, 5, b + c)')
        self.assertInstructionList(expression.tree, [
            (compiler.CallExpression, {'subroutine': 'b'}, [
                (compiler.Expression, {}, [(compiler.Term, {}, [(compiler.IdentifierToken, {'token': 'a'})])]),
                (compiler.Expression, {}, [(compiler.Term, {}, [(compiler.NumberToken, {'number': '5'})])]),
                (compiler.Expression, {}, [
                    (compiler.Term, {}, [(compiler.IdentifierToken, {'token': 'b'})]),
                    (compiler.SymbolToken, {'symbol': '+'}),
                    (compiler.Term, {}, [(compiler.IdentifierToken, {'token': 'c'})]),
                ])
            ])
        ])
    
    def test_indexExpression(self):
        expression = self.expression('a[b + 2]')
        self.assertInstructionList(expression.tree, [
            (compiler.IndexExpression, {'var': 'a'}, [
                (compiler.Term, {}, [(compiler.IdentifierToken, {'token': 'b'})]),
                (compiler.SymbolToken, {'symbol': '+'}),
                (compiler.Term, {}, [(compiler.NumberToken, {'number': '2'})]),
            ])
        ])

class TestStatements(CompilerTestCase):
    def test_letStatementTree(self):
        statement = self.statement('let a = b;')
        self.assertInstructionList([statement], [
            (compiler.LetStatement, {'name': 'a'}, [
                (compiler.Expression, {}, [
                    (compiler.Term, {}, [(compiler.IdentifierToken, {'token': 'b'})])
                ])
            ])
        ])
    
    def test_letStatementTreeWithIndex(self):
        statement = self.statement('let a[2] = b;')
        self.assertInstructionList([statement], [
            (compiler.LetStatement, {'name': 'a'}, [
                (compiler.Expression, {}, [
                    (compiler.Term, {}, [(compiler.NumberToken, {'number': '2'})])
                ]),
                (compiler.Expression, {}, [
                    (compiler.Term, {}, [(compiler.IdentifierToken, {'token': 'b'})])
                ])
            ])
        ])

    def test_ifStatementTree(self):
        statement = self.statement('if (a = b) { let a = 0; }')
        self.assertInstructionList([statement], [
            (compiler.IfStatement, {}, [
                (compiler.Expression, {}, [
                    (compiler.Term, {}, [(compiler.IdentifierToken, {'token': 'a'})]),
                    (compiler.SymbolToken, {'symbol': '='}),
                    (compiler.Term, {}, [(compiler.IdentifierToken, {'token': 'b'})]),
                ]),
                (compiler.ThenBody, {}, [(compiler.LetStatement, {})]),
                (compiler.ElseBody, {}, []),
            ])
        ])

    def test_ifElseStatementTree(self):
        statement = self.statement('if (a = b) { let a = 0; } else { let b = 0; }')
        self.assertInstructionList([statement], [
            (compiler.IfStatement, {}, [
                (compiler.Expression, {}, [
                    (compiler.Term, {}, [(compiler.IdentifierToken, {'token': 'a'})]),
                    (compiler.SymbolToken, {'symbol': '='}),
                    (compiler.Term, {}, [(compiler.IdentifierToken, {'token': 'b'})]),
                ]),
                (compiler.ThenBody, {}, [(compiler.LetStatement, {})]),
                (compiler.ElseBody, {}, [(compiler.LetStatement, {})]),
            ])
        ])

    def test_whileStatementTree(self):
        statement = self.statement('while ( i < 10 ) { let i = i + 1; }')
        self.assertInstructionList([statement], [
            (compiler.WhileStatement, {}, [
                (compiler.Expression, {}, [
                    (compiler.Term, {}, [(compiler.IdentifierToken, {'token': 'i'})]),
                    (compiler.SymbolToken, {'symbol': '<'}),
                    (compiler.Term, {}, [(compiler.NumberToken, {'number': '10'})]),
                ]),
                (compiler.WhileBody, {}, [(compiler.LetStatement, {})]),
            ])
        ])

    def test_doStatementTree(self):
        statement = self.statement('do Test.test(a + b);')
        self.assertInstructionList([statement], [
            (compiler.DoStatement, {}, [
                (compiler.CallExpression, {'subroutine': 'test', 'var': 'Test'})
            ])
        ])

    def test_returnStatementTree(self):
        statement = self.statement('return;')
        self.assertInstructionList([statement], [
            (compiler.ReturnStatement, {}, [])
        ])

    def test_returnValueTree(self):
        statement = self.statement('return a;')
        self.assertInstructionList([statement], [
            (compiler.ReturnStatement, {}, [
                (compiler.Expression, {})
            ])
        ])

class TestArguments(CompilerTestCase):
    def test_emptyArgsTree(self):
        expression = self.compile('()', compiler.ArgumentList)
        self.assertInstructionList([expression], [
            (compiler.ArgumentList, {}, [])
        ])

    def test_singleArgTree(self):
        expression = self.compile('(int a)', compiler.ArgumentList)
        self.assertInstructionList([expression], [
            (compiler.ArgumentList, {}, [
                (compiler.Argument, {'type': 'int', 'name': 'a'})
            ])
        ])
    
    def test_manyArgsTree(self):
        expression = self.compile('(int a, String b, boolean c)', compiler.ArgumentList)
        self.assertInstructionList([expression], [
            (compiler.ArgumentList, {}, [
                (compiler.Argument, {'type': 'int', 'name': 'a'}),
                (compiler.Argument, {'type': 'String', 'name': 'b'}),
                (compiler.Argument, {'type': 'boolean', 'name': 'c'}),
            ])
        ])

if __name__ == '__main__':
    unittest.main()
from io import StringIO

import unittest
import parser
import parser_test
import lisp

class LispTestCase(parser_test.ParserTestCase):
    def compile(self, source):
        parser = lisp.LispParser()
        parser.parse(StringIO(source))
        return parser
    
    def lisp(self, source):
        return self.compile(source).lisp()

class TestLispParser(LispTestCase):
    def test_parse(self):
        expression = self.compile('(head (a b))')
        self.assertInstructionList(expression.tree, [
            (lisp.List, {}, [
                (parser.IdentifierToken, {'token': 'head'}),
                (lisp.List, {}, [
                    (parser.IdentifierToken, {'token': 'a'}),
                    (parser.IdentifierToken, {'token': 'b'}),
                ])
            ])
        ])
    
    def test_parseSeveral(self):
        expression = self.compile('(a) (b) (c)')
        self.assertInstructionList(expression.tree, [
            (lisp.List, {}, [(parser.IdentifierToken, {'token': 'a'})]),
            (lisp.List, {}, [(parser.IdentifierToken, {'token': 'b'})]),
            (lisp.List, {}, [(parser.IdentifierToken, {'token': 'c'})]),
        ])
    
    def test_parseNil(self):
        expression = self.compile('()')
        self.assertInstructionList(expression.tree, [(lisp.List, {}, [])])
    
    def test_parseQuote(self):
        result = self.compile('(\'5)')
        self.assertInstructionList(result, [
            (lisp.List, {}, [
                (parser.IdentifierToken, {'token': 'quote'}),
                (parser.NumberToken, {'number': '5'}),
            ])
        ])

class TestLispInterpreter(LispTestCase):
    def test_head(self):
        result = self.lisp('(head (a b c))')
        self.assertInstructionList(result, [(parser.IdentifierToken, {'token': 'a'})])
    
    def test_tail(self):
        result = self.lisp('(tail (a b c))')
        self.assertEqual(len(result), 1)
        self.assertInstructionList(result[0], [
            (parser.IdentifierToken, {'token': 'b'}),
            (parser.IdentifierToken, {'token': 'c'}),
        ])
    
    def test_nil(self):
        result = self.lisp('(tail ())')
        self.assertEqual(len(result), 1)
        self.assertEqual(result, [None])

    def test_eq(self):
        result = self.lisp('(eq (a a))')
        self.assertEqual(len(result), 1)
        self.assertTrue(result[0])

        result = self.lisp('(eq (a b))')
        self.assertEqual(len(result), 1)
        self.assertFalse(result[0])


if __name__ == '__main__':
    unittest.main()
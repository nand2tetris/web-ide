#!/usr/bin/env python3

import parser

FN_MAP = {
    'cons': 'join',
    'car': 'head',
    'cdr': 'tail',
    '=': 'eq',
    'ff': 'first',
    'cond': 'if',
    '==': 'equal',
    'pairlis': 'zip',
    'assoc': 'find',
    'sublis': 'replace',
}

FNS = {
    'head': lambda _: _.head(),
    'tail': lambda _: _.tail(),
    'quote': lambda _: _,
    'eq': lambda _: isinstance(_.head(), parser.IdentifierToken) and _.head() == _.tail()[0],
    'equal': lambda _: _.head() == _.tail(),
}

def evalapply(list):
    car = list.tree[0]
    cdr = list.tree[1:]
    if isinstance(car, parser.IdentifierToken):
        fn = car.kwargs['token']
        if fn in FN_MAP:
            fn = FN_MAP[fn]
        if fn in FNS:
            return FNS[fn](cdr)
    return None 

class LispParser(parser.Parser):
    def parse(self, instream):
        parser.Parser.parse(self, instream)
        self.tree = List.list(parser.TokenList(self.tree))

    def buildTree(self):
        return []

    @classmethod
    def getTokenizer(cls):
        return LispTokenizer

    def lisp(self):
        return [evalapply(list) for list in self.tree]

    def default(self):
        self.lisp()

class LispTokenizer(parser.Tokenizer):
    @staticmethod
    def comment():
        return ';'

    @staticmethod
    def symbols():
        return ['(', ')', '\'', '=', '==']
    
    def _getSymbol(self):
        symbol = parser.Tokenizer._getSymbol(self)
        if symbol is None:
            return symbol
        if symbol.kwargs['symbol'] == '=' and self.list.peek() == '=':
            self.list.next()
            symbol.kwargs['symbol'] = '=='
        return symbol

class List(parser.Block):
    def buildTree(self):
        tree = []
        while not self.list.done():
            if parser.SymbolToken.matches(self.list.peek(), '('):
                self.list.next()
                tree.append(List(self.list))
                self.list.next()
            elif parser.SymbolToken.matches(self.list.peek(), '\''):
                self.list.next()
                tree.append(List.quote(self.list))
            elif parser.SymbolToken.matches(self.list.peek(), ')'):
                return tree
            else:
                tree.append(self.list.next())
        return tree
    
    def head(self):
        return self.tree[0]
    
    def tail(self):
        return self.tree[1:]
    
    @staticmethod
    def list(list):
        tree = []
        while not list.done():
            tree.append(List(list))
        return tree
    
    @staticmethod
    def quote(list):
        token = list.next()
        quoteList = List(EmptyTokenList())
        quoteList.tree = [parser.IdentifierToken(token="quote"), token]
        return quoteList

    def __str__(self):
        return '(' + ' '.join([str(_) for _ in self.tree]) + ')'

class EmptyTokenList():
    def done(self):
        return True
    
    def peek(self):
        return parser.SymbolToken(symbol=')') 

if __name__ == '__main__':
    parser.main(LispParser)
import argparse
import pathlib
import sys
from operator import is_not
from functools import partial

import sixml

SYMBOLS = {}
def SYMBOL(name, prefix='$'):
    if not name in SYMBOLS:
        SYMBOLS[name] = 0
    SYMBOLS[name] += 1
    return f'{prefix}{name}_{SYMBOLS[name]}'

def joinLines(lines):
    return '\n'.join(filter(partial(is_not, None), lines))

class Table():
    def __init__(self):
        self.table = {
            'SP': 0x0000,
            'LCL': 0x0001,
            'ARG': 0x0002,
            'THIS': 0x0003,
            'THAT': 0x0004,
            'R0': 0x0000,
            'R1': 0x0001,
            'R2': 0x0002,
            'R3': 0x0003,
            'R4': 0x0004,
            'R5': 0x0005,
            'R6': 0x0006,
            'R7': 0x0007,
            'R8': 0x0008,
            'R9': 0x0009,
            'R10': 0x0008,
            'R11': 0x000b,
            'R12': 0x000c,
            'R13': 0x000d,
            'R14': 0x000e,
            'R15': 0x000f,
            'SCREEN': 0x4000,
            'KBD': 0x6000,
        } 
        self.nextRegister = 0x0010
    
    def get(self, symbol):
        self.register(symbol)
        return self.table.get(symbol)
    
    def location(self, symbol, location):
        # location can overwrite earlier symbols!
        self.table[symbol] = location
    
    def register(self, symbol):
        if not symbol in self.table:
            if self.nextRegister >= 0x4000:
                raise Exception(f'Symbol table is full, not creating register in screen mapped memory')
            self.table[symbol] = self.nextRegister
            self.nextRegister += 1

class NoopTable:
    def get(self, symbol):
        return symbol
    
    def location(self, symbol, location):
        pass
    
    def register(self, symbol):
        pass

class Scope:
    def __init__(self, parent = None, clazz=''):
        self.parent = parent
        self.clazz = clazz
        self.table = {}
        self.next = {
            'argument': 0,
            'local': 0,
            'static': 0,
            'this': 0,
        }
    
    def get(self, symbol):
        if symbol in self.table:
            return self.table[symbol]
        if not self.parent:
            raise Exception(f'Symbol not found: {symbol}')
        return self.parent.get(symbol) 
    
    def set(self, symbol, location, type):
        self.check(symbol)
        pos = self.next[location]
        self.next[location] = pos + 1
        self.table[symbol] = (f'{location} {pos}', type)

    def check(self, symbol):
        if symbol in self.table:
            raise Exception(f'Symbol already in scope: {symbol}')

    def constant(self, symbol: str, value: int):
        self.check(symbol)
        self.table[symbol] = (f'constant {value}', 'int')
    
    def argument(self, symbol: str, type):
        self.set(symbol, 'argument', type)
    
    def local(self, symbol: str, type):
        self.set(symbol, 'local', type)
    
    def field(self, symbol: str, type):
        self.set(symbol, 'this', type)
    
    def static(self, symbol: str, type):
        self.set(symbol, 'static', type)

class ParseException(Exception):
    def __init__(self, token, message: str):
        (line, col) = token.kwargs['position']
        location = f" (at {line}:{col})"
        Exception.__init__(self, message + location)

class ParseElement:
    def __init__(self, **kwargs):
        self.kwargs = kwargs
    
    def fill(self, table, position):
        return position

    def hack(self, table):
        return None
    
    def scope(self, scope):
        pass

    def asm(self):
        return None
    
    def vm(self, scope):
        return None

    def xml(self, table):
        name = self.__class__.__name__
        element = sixml.Element(name, self.kwargs, [])

        return element

class Tokenizer:
    def __init__(self, stream=sys.stdin):
        self.file = stream.read()
        self.size = len(self.file)
        self.index = 0
        self.line = 1
        self.col = 1

    def hasToken(self):
        return self.index < self.size

    def instruction(self):
        self._consumeWhitespace()
        if not self.hasToken():
            return NoopInstruction()

        comment = self._getComment()
        if comment is not None:
            return comment
        
        string = self._getString()
        if string is not None:
            return string

        number = self._getNumber()
        if number is not None:
            return number
        
        symbol = self._getSymbol()
        if symbol is not None:
            return symbol
        
        keyword = self._getKeyword()
        if keyword is not None:
            return keyword

        return self._getIdentifier()

    def position(self):
        return (self.line, self.col)
    
    @staticmethod
    def keywords():
        return []

    @staticmethod
    def symbols():
        return []
    
    @staticmethod
    def comment():
        return '//'
    
    @staticmethod
    def openComment():
        return '/*'
    
    @staticmethod
    def closeComment():
        return '*/'

    def _consumeWhitespace(self):
        while self.hasToken() and self.file[self.index].isspace():
            self._next()
    
    def _next(self):
        if self.file[self.index] == '\n':
            self.line += 1
            self.col = 1
        else:
            self.col += 1
        self.index += 1

    def _getComment(self):
        comment = None
        start = self.position
        if self.file[self.index:self.index+len(self.comment())] == self.comment():
            start = self.index
            while self.hasToken() and self.file[self.index] != '\n':
                self._next()
            comment = self.file[start:self.index]
        if self.file[self.index:self.index+len(self.openComment())] == self.openComment():
            start = self.index
            while self.file[self.index:self.index+len(self.closeComment())] != self.closeComment():
                self._next()
            self.index += 2
            comment = self.file[start:self.index]
        if comment is not None:
            return CommentToken(comment=comment, position=start, end=self.position())
        return None 
    
    def _getLine(self):
        token = ''
        while self.hasToken() and self.file[self.index] != '\n':
            token += self.file[self.index]
            self._next()
        return token
    
    def _getString(self):
        if self.file[self.index] == '"':
            self._next()
            start = self.index
            while self.file[self.index] != '"' and self.file[self.index-1:self.index] != '\\"':
                self._next()
            string = self.file[start:self.index]
            self._next() # Get ending "
            return StringToken(string=string, position=self.position())
        return None
    
    def _getNumber(self):
        if self.file[self.index].isdigit():
            start = self.index
            while self.file[self.index].isdigit():
                self._next()
            number = self.file[start:self.index]
            return NumberToken(number=number, position=self.position())
        return None
    
    def _getSymbol(self):
        symbol = None
        if self.file[self.index] in self.__class__.symbols():
            symbol = SymbolToken(symbol=self.file[self.index], position=self.position())
            self._next()
        return symbol
    
    def _getWord(self):
        start = self.index
        while self.hasToken() and \
                not self.file[self.index].isspace() and \
                not self.file[self.index] in self.__class__.symbols() and \
                self.file[self.index] != '"':
            self._next()
        token = self.file[start:self.index]
        return token

    def _getKeyword(self):
        token = self._getWord()
        if token in self.__class__.keywords():
            return KeywordToken(keyword=token, position=self.position())
        self.index -= len(token)
        return None

    def _getIdentifier(self):
        token = self._getWord()
        if token in self.__class__.keywords():
            return KeywordToken(keyword=token, position=self.position())
        return IdentifierToken(token=token, position=self.position())

class Token(ParseElement):
    def __eq__(self, other):
        if isinstance(other, dict):
            for arg in other:
                if self.kwargs[arg] != other[arg]:
                    return False
            return True
        return object.__eq__(self, other) 

class CommentToken(Token):
    def __repr__(self):
        return f'Comment<{self.kwargs["comment"]}>'
    
    def __str__(self):
        return self.kwargs["comment"]

class KeywordToken(Token):
    def __repr__(self):
        return f'Keyword<{self.kwargs["keyword"]}>'
    
    def __str__(self):
        return self.kwargs["keyword"]

    @classmethod
    def isType(cls, token):
        if not isinstance(token, cls):
            return False
        return token.kwargs['keyword'] in ['int', 'boolean', 'char', 'void']
    
    @classmethod
    def matches(cls, token, *args):
        if not isinstance(token, cls):
            return False
        if len(args) == 0:
            return True
        return any([token.kwargs['keyword'] == keyword for keyword in args])

class SymbolToken(Token):
    def __repr__(self):
        return f'Symbol<{self.kwargs["symbol"]}>'
    
    def __str__(self):
        return self.kwargs['symbol']
    
    def __eq__(self, other):
        if not self.__class__ == other.__class__:
            return False
        return self.kwargs['symbol'] == other.kwargs['symbol']

    @classmethod
    def matches(cls, token, *args):
        if not isinstance(token, cls):
            return False
        if len(args) == 0:
            return True
        return any([token.kwargs['symbol'] == keyword for keyword in args])

class StringToken(Token):
    def __repr__(self):
        return f'String<{self.kwargs["string"]}>'
    
    def __str__(self):
        return '"' + self.kwargs["string"] + '"'
    
    def __eq__(self, other):
        if not self.__class__ == other.__class__:
            return False
        return self.kwargs['string'] == other.kwargs['string']

class NumberToken(Token):
    def __repr__(self):
        return f'Number<{self.kwargs["number"]}>'
    
    def __str__(self):
        return self.kwargs["number"]
    
    def __eq__(self, other):
        if not self.__class__ == other.__class__:
            return False
        return self.kwargs['number'] == other.kwargs['number']

class IdentifierToken(Token):
    def __repr__(self):
        return f'Identifier<{self.kwargs["token"]}>'
    
    def __str__(self):
        return self.kwargs["token"]
    
    def __eq__(self, other):
        if not self.__class__ == other.__class__:
            return False
        return self.kwargs['token'] == other.kwargs['token']

    @staticmethod
    def matches(token):
        return isinstance(token, IdentifierToken)

class TokenList:
    def __init__(self, list):
        self.list = list
        self.index = 0
        self.skipComments()
    
    def next(self):
        token = self.peek()
        self.advance()
        return token
    
    def done(self):
        return not self.index < len(self.list)

    def peek(self):
        if not self.done():
            return self.list[self.index]
        return None
    
    def advance(self):
        self.index += 1
        self.skipComments()
    
    def skipComments(self):
        while isinstance(self.peek(), CommentToken):
            self.index += 1
    
    def getKeyword(self, *args):
        token = self.peek()
        if KeywordToken.matches(token, *args):
            self.advance()
            return token
        else:
            keywords = ','.join(args)
            raise ParseException(token, f'Expected Keyword in [{keywords}], got {token}')

    def getType(self):
        if KeywordToken.isType(self.peek()):
            return self.next()
        return self.getIdentifier()
    
    def getSymbol(self, symbol):
        token = self.peek()
        if SymbolToken.matches(token, symbol):
            self.advance()
            return token
        else:
            raise ParseException(token, f'Expected Symbol {symbol}, got {token}')
    
    def getIdentifier(self):
        token = self.peek()
        if IdentifierToken.matches(token):
            self.advance()
            return token
        if KeywordToken.matches(token, 'this'):
            self.advance()
            return token
        else:
            raise ParseException(token, f'Expected Identifier, got {token}')

class Instruction(ParseElement):
    def __init__(self, instruction='', comment='', *args, **kwargs):
        self.instruction = instruction
        self.comment = comment
        self.args = args
        self.kwargs = kwargs
        self.tree = self.buildTree()
        if not isinstance(self.tree, list):
            raise Exception(f'{self.__class__} failed to build a tree')
    
    def buildTree(self):
        return None
    
    def fill(self, table, position):
        for child in self.tree:
            position = child.fill(table, position)
        return position
    
    def scope(self, scope):
        for child in self.tree:
            child.scope(scope)
    
    def hack(self, table):
        return joinLines([child.hack(table) for child in self.tree])
    
    def asm(self):
        return joinLines([child.asm() for child in self.tree])
    
    def vm(self, scope):
        return joinLines([child.vm(scope) for child in self.tree])

class NoopInstruction(Instruction):
    def __init__(self):
        Instruction.__init__(self, 'noop')

    def buildTree(self):
        return []
    
    def fill(self, table, position):
        return position

    def hack(self, table):
        return None
    
    def asm(self):
        return None
    
    def xml(self, table):
        return None

class Block(Instruction):
    def __init__(self, list):
        self.list = list
        Instruction.__init__(self)

    def __str__(self):
        return '\n'.join([str(t) for t in self.tree])

class Parser(Instruction):
    def __init__(self):
        Instruction.__init__(self, 'program')
        self.Tokenizer = self.getTokenizer()
    
    @classmethod
    def getTokenizer(cls):
        pass
    
    def parse(self, instream):
        tokenizer = self.Tokenizer(instream)
        while tokenizer.hasToken():
            instruction = tokenizer.instruction()
            self.tree.append(instruction)

    def fill(self, table, position=0):
        for child in self.tree:
            position = child.fill(table, position)
        return position

    def scope(self, scope):
        for child in self.tree:
            child.scope(scope)

    def vm(self, scope):
        self.scope(scope)
        return joinLines([child.vm(scope) for child in self.tree])

    def hack(self, table=Table()):
        self.fill(table) 
        return joinLines([child.hack(table) for child in self.tree])
    
    def xml(self, table=Table(), scope=Scope()):
        self.fill(table)
        return Instruction.xml(self, table)


argparser = argparse.ArgumentParser()
argparser.add_argument('files', metavar='File', nargs='+')
argparser.add_argument('--xml', const=True, nargs='?', help='Write XML data, rather than the parser\s default output.')
argparser.add_argument('--out', type=str, default='-', help='Write to output file, - (default) is stdout.')

def main(Parser, argv=sys.argv[1:]):
    args = argparser.parse_args(argv)
    parse = Parser()

    for filename in args.files:
        with open(filename, 'r') as file:
            parse.parse(file)

    if args.xml:
        out = parse.xml()
    else:
        out = parse.default()

    out = f'{out}'

    if args.out == '-':
        sys.stdout.write(out)
    else:
        with open(args.out, 'w') as file:
            file.write(out)

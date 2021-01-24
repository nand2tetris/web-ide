import sys 
import parser
import sixml

class JackParser(parser.Parser):
    def parse(self, instream):
        parser.Parser.parse(self, instream)
        # Modify the tree

    @classmethod
    def getTokenizer(cls):
        return JackTokenizer

    def default(self):
        return self.vm()

class JackTokenizer(parser.Tokenizer):
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
            return parser.NoopInstruction()

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
        
        return self._getIdentifier()

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
        nextTwo = self.file[self.index:self.index+2]
        comment = None
        if nextTwo == '//':
            start = self.index
            while self.file[self.index] != '\n':
                self._next()
            comment = self.file[start:self.index]
        if nextTwo == '/*':
            start = self.index
            while self.file[self.index:self.index+2] != '*/':
                self._next()
            comment = self.file[start:self.index]
        if comment is not None:
            return CommentToken(comment=comment)
        return comment
    
    def _getString(self):
        if self.file[self.index] == '"':
            self._next()
            start = self.index
            while self.file[self.index] != '"' and self.file[self.index-1:self.index] != '\\"':
                self._next()
            string = self.file[start:self.index]
            self._next() # Get ending "
            return StringToken(string=string)
        return None
    
    def _getNumber(self):
        if self.file[self.index].isdigit():
            start = self.index
            while self.file[self.index].isdigit():
                self._next()
            number = self.file[start:self.index]
            return NumberToken(number=number)
        return None
    
    def _getSymbol(self):
        symbol = None
        if self.file[self.index] in SymbolToken.SYMBOLS:
            symbol = SymbolToken(symbol=self.file[self.index])
            self._next()
        return symbol
    
    def _getIdentifier(self):
        start = self.index
        while self.hasToken() and \
                not self.file[self.index].isspace() and \
                not self.file[self.index] in SymbolToken.SYMBOLS and \
                self.file[self.index] != '"':
            self._next()
        token = self.file[start:self.index]
        if token in KeywordToken.KEYWORDS:
            return KeywordToken(keyword=token)
        return IdentifierToken(token=token)
    

class CommentToken(parser.Instruction):
    pass

class KeywordToken(parser.Instruction):
    KEYWORDS = ['class', 'constructor', 'function', 'method', 'field', 'static', 'var', 'int', 'char', 'boolean', 'void', 'true', 'false', 'null', 'this', 'let', 'do', 'if', 'else', 'while', 'return']

class SymbolToken(parser.Instruction):
    SYMBOLS = ['{', '}', '(', ')', '[', ']', '.', ',', ';', '+', '-', '*', '/', '&', '|', '<', '>', '=', '~']

class StringToken(parser.Instruction):
    pass

class NumberToken(parser.Instruction):
    pass

class IdentifierToken(parser.Instruction):
    pass

if __name__ == '__main__':
    parser.main(sys.argv[1:], JackParser)
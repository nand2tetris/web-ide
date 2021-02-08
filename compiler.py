#!/usr/bin/env python
import sys 
import parser


class BlockParser(parser.Parser):
    def parse(self, instream):
        parser.Parser.parse(self, instream)
        list = TokenList(self.tree)
        self.tokentree = self.tree
        self.tree = [
            ClassStatement(list)
        ]

    @classmethod
    def getTokenizer(cls):
        return BlockTokenizer

    def default(self):
        return self.vm(scope=parser.Scope())

class BlockTokenizer(parser.Tokenizer):
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
            self.index += 2
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
    def __repr__(self):
        return f'Comment<{self.kwargs["comment"]}>'

class KeywordToken(parser.Instruction):
    KEYWORDS = ['class', 'constructor', 'function', 'method', 'field', 'static', 'var', 'int', 'char', 'boolean', 'void', 'true', 'false', 'null', 'this', 'let', 'do', 'if', 'else', 'while', 'return']

    def __repr__(self):
        return f'Keyword<{self.kwargs["keyword"]}>'

    @classmethod
    def isType(cls, token):
        if not isinstance(token, cls):
            return False
        return token.kwargs['keyword'] in ['int', 'boolean', 'char', 'void']
    
    @classmethod
    def matches(cls, token, *args):
        if not isinstance(token, cls):
             return False
        return len(args) == 0 or any([ \
            token.kwargs['keyword'] == keyword and \
            keyword in KeywordToken.KEYWORDS \
            for keyword in args \
        ])

class SymbolToken(parser.Instruction):
    SYMBOLS = ['{', '}', '(', ')', '[', ']', '.', ',', ';', '+', '-', '*', '/', '&', '|', '<', '>', '=', '~']

    def __repr__(self):
        return f'Symbol<{self.kwargs["symbol"]}>'

    @classmethod
    def matches(cls, token, *args):
        if not isinstance(token, cls):
            return False
        return len(args) == 0 or any([ \
            token.kwargs['symbol'] == keyword and \
            keyword in SymbolToken.SYMBOLS \
            for keyword in args \
        ])

class StringToken(parser.Instruction):
    def __repr__(self):
        return f'String<{self.kwargs["string"]}>'

class NumberToken(parser.Instruction):
    def __repr__(self):
        return f'Number<{self.kwargs["number"]}>'

class IdentifierToken(parser.Instruction):
    def __repr__(self):
        return f'Identifier<{self.kwargs["token"]}>'

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

    def peek(self):
        return self.list[self.index]
    
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
            raise Exception(f'Expected Keyword in [{keywords}], got {token}')

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
            raise Exception(f'Expected Symbol {symbol}, got {token}')
    
    def getIdentifier(self):
        token = self.peek()
        if IdentifierToken.matches(token):
            self.advance()
            return token
        if KeywordToken.matches(token, 'this'):
            self.advance()
            return token
        else:
            raise Exception(f'Expected Identifier, got {token}')

class Block(parser.Instruction):
    def __init__(self, list):
        self.list = list
        parser.Instruction.__init__(self)

class BlockBody(Block):
    def scope(self, scope):
        self.scope = parser.Scope(parent=scope)
        parser.Instruction.scope(self, self.scope)
    
    def vm(self, scope):
        assert scope == self.scope.parent
        return parser.Instruction.vm(self, self.scope)

class ClassStatement(BlockBody):
    def buildTree(self):
        self.token = self.list.getKeyword('class')
        self.name = self.list.getIdentifier()
        self.list.getSymbol('{')
        self.vars = VarDecl.list(self.list)
        self.routines = Routines(self.list)
        self.list.getSymbol('}')
        return self.vars + [self.routines]
    
    def scope(self, scope):
        BlockBody.scope(self, scope)
        self.scope.clazz = self.name.kwargs['token']

class VarDecl(Block):
    def buildTree(self):
        self.location = self.list.getKeyword('var', 'static', 'field')
        self.vars = VarNameList(self.list, self.location)
        self.kwargs = {
            'location': self.location.kwargs['keyword']
        }
        return [self.vars]
    
    @staticmethod
    def list(list):
        decls = []
        while VarDecl.matches(list):
            decls.append(VarDecl(list))
        return decls
    
    @staticmethod
    def matches(list):
        token = list.peek()
        return KeywordToken.matches(token, 'var', 'static', 'field')

class VarNameList(Block):
    def __init__(self, list, location):
        self.location = location
        Block.__init__(self, list)


    """ type varName (, varname)*"""
    def buildTree(self):
        self.type = self.list.getType()
        self.names = [self.list.getIdentifier()]
        while SymbolToken.matches(self.list.peek(), ','):
            self.list.advance()
            self.names.append(self.list.getIdentifier())
        self.list.getSymbol(';')
        return self.names
    
    def scope(self, scope: parser.Scope):
        location = self.location.kwargs['keyword']
        for name in self.names:
            if location == 'static':
                scope.static(name.kwargs['token'])
            if location == 'var':
                scope.local(name.kwargs['token'])
            
            # TODO var, field

class Routines(Block):
    def buildTree(self):
        routines = []
        while Routine.matches(self.list):
            routines.append(Routine(self.list))
        return routines

class Routine(BlockBody):
    def buildTree(self):
        self.routineType = self.list.getKeyword('constructor', 'function', 'method')
        self.returnType = self.list.getType()
        self.name = self.list.getIdentifier()
        self.arguments = ArgumentList(self.list)
        self.kwargs = {
            'type': self.routineType.kwargs['keyword'],
            'return': self.retType(),
            'name': self.name.kwargs['token'],
        }
        self.body = RoutineBody(self.list)
        return [self.arguments, self.body]
    
    def retType(self):
        if isinstance(self.returnType, KeywordToken):
            return self.returnType.kwargs['keyword']
        return self.returnType.kwargs['token']
    
    def vm(self, scope):
        decl = f"function {scope.clazz}.{self.kwargs['name']} {len(self.arguments)}"
        vm = BlockBody.vm(self, scope)
        return f"{decl}\n{vm}"

    @staticmethod
    def matches(list):
        token = list.peek()
        return KeywordToken.matches(token, 'constructor', 'function', 'method')

class ArgumentList(Block):
    def buildTree(self):
        self.arguments = []
        self.list.getSymbol('(')
        if SymbolToken.matches(self.list.peek(), ')'):
            self.list.advance()
        else:
            self.arguments.append(Argument(self.list))
            while SymbolToken.matches(self.list.peek(), ','):
                self.list.advance()
                self.arguments.append(Argument(self.list))
            self.list.getSymbol(')')
        return self.arguments
    
    def __len__(self):
        return len(self.arguments)

class Argument(Block):
    def buildTree(self):
        self.type = self.list.getType()
        self.name = self.list.getIdentifier()
        self.kwargs = {
            'type': self.type.kwargs.get('keyword', self.type.kwargs.get('token')),
            'name': self.name.kwargs['token']
        }
        return []
    
    def scope(self, scope):
        scope.argument(self.name)

class RoutineBody(Block):
    def buildTree(self):
        self.list.getSymbol('{')
        self.vars = VarDecl.list(self.list)
        return self.vars + Statement.list(self.list)

class Statement(Block):
    @staticmethod
    def list(list):
        statements = []
        while not SymbolToken.matches(list.peek(), '}'):
            statements.append(Statement.next(list))
        list.advance()
        return statements

    @staticmethod
    def next(list):
        nextStatement = list.getKeyword('let', 'if', 'while', 'do', 'return')
        keyword = nextStatement.kwargs['keyword']
        if keyword == 'let':
            return LetStatement(list)
        if keyword == 'if':
            return IfStatement(list)
        if keyword == 'while':
            return WhileStatement(list)
        if keyword == 'do':
            return DoStatement(list)
        if keyword == 'return':
            return ReturnStatement(list)

class LetStatement(Statement):
    def buildTree(self):
        self.name = self.list.getIdentifier()
        self.index = None
        if SymbolToken.matches(self.list.peek(), '['):
            self.list.advance()
            self.index = Expression(self.list)
            self.list.getSymbol(']')
        self.list.getSymbol('=')
        self.value = Expression(self.list)
        self.list.getSymbol(';')
        self.kwargs = {
            'name': self.name.kwargs['token'],
        }
        tree = []
        if self.index is not None:
            tree.append(self.index)
        tree.append(self.value)
        return tree
    
    def vm(self, scope):
        op = self.value.vm(scope)
        loc = self.name.kwargs['token']
        location = scope.get(loc)
        if not self.index:
            return f"{op}\npop {location}"
        else:
            offset = self.index.vm(scope)
            addr = f"push {location} // {loc}\n{offset}\nadd\npop pointer 1"
            return f"{addr}\n{op}\npop that 0"

class IfStatement(Statement):
    def buildTree(self):
        self.label = IfStatement.nextLabel()
        self.list.getSymbol('(') 
        self.expression = Expression(self.list)
        self.list.getSymbol(')') 
        self.thenbody = ThenBody(self.list)
        self.elsebody = ElseBody(self.list) 
        return [self.expression, self.thenbody, self.elsebody]

    def vm(self, scope):
        expr = self.expression.vm(scope)
        thenbody = self.thenbody.vm(scope)
        elsebody = self.elsebody.vm(scope)

        return "\n".join([
            expr,
            f"if-goto {self.label}_then",
            elsebody,
            f"goto {self.label}_end"
            f"label {self.label}_then",
            thenbody,
            f"label {self.label}_end",
        ])

    label = 0
    @classmethod
    def nextLabel(cls):
        label = f"if_{cls.label}"
        cls.label += 1
        return label

class ThenBody(Statement):
    def buildTree(self):
        self.list.getSymbol('{') 
        return Statement.list(self.list)

class ElseBody(Statement):
    def buildTree(self):
        if KeywordToken.matches(self.list.peek(), 'else'):
            self.list.advance()
            self.list.getSymbol('{')
            return Statement.list(self.list)
        else:
            return []

class WhileStatement(Statement):
    def buildTree(self):
        self.label = WhileStatement.nextLabel()
        self.list.getSymbol('(')
        self.expression = Expression(self.list)
        self.list.getSymbol(')')
        self.body = WhileBody(self.list)
        return [self.expression, self.body]
    
    def vm(self, scope):
        expr = self.expression.vm(scope)
        body = self.body.vm(scope)

        return "\n".join([
            f"label {self.label}_start",
            expr,
            "not",
            f"if-goto {self.label}_end",
            body,
            f"goto {self.label}_start",
            f"label {self.label}_end"
        ])

    label = 0
    @classmethod
    def nextLabel(cls):
        label = f"while_{cls.label}"
        cls.label += 1
        return label

class WhileBody(Statement):
    def buildTree(self):
        self.list.getSymbol('{')
        return Statement.list(self.list)

class DoStatement(Statement):
    def buildTree(self):
        call = CallExpression(self.list)
        self.list.getSymbol(';')
        return [call]

class ReturnStatement(Statement):
    def buildTree(self):
        if SymbolToken.matches(self.list.peek(), ';'):
            self.list.advance()
            return []
        else:
            value = Expression(self.list)
            self.list.getSymbol(';')
            return [value]
    
    def vm(self, scope):
        vm = Statement.vm(self, scope)
        return f"{vm}\nreturn"

class Expression(Statement):
    def buildTree(self):
        """
        Expressions are determined by the next next token.

        term bop => BinaryExpression
        term => TermExpression
        """
        terms = [Term.next(self.list)]
        while SymbolToken.matches(self.list.peek(), '+', '-', '*', '/', '&', '|', '<', '>', '='):
            terms.append(self.list.next())
            terms.append(Term.next(self.list))
        return terms
    
    def vm(self, scope):
        vm = self.tree[0].vm(scope)
        for i in range(2, len(self.tree), 2):
            symbol = self.tree[i-1].kwargs['symbol']
            op = {
                '+': 'add',
                '-': 'sub',
                '&': 'and',
                '|': 'or',
                '<': 'lt',
                '>': 'gt',
                '=': 'eq',
                '*': 'call Math.multiply 2',
                '/': 'call Math.divide 2',
            }[symbol]
            y = self.tree[i].vm(scope)
            vm += f"\n{y}\n{op}"
        return vm

    @staticmethod
    def list(list):
        expressions = [Expression(list)]
        while SymbolToken.matches(list.peek, ','):
            list.advance()
            expressions.push(Expression(list))
        return expressions

class GroupExpression(Statement):
    def buildTree(self):
        expression = Expression(self.list)
        self.list.getSymbol(')')
        return [expression]

class UnaryExpression(Statement):
    def __init__(self, op, list):
        self.op = op
        Statement.__init__(self, list)

    def buildTree(self):
        self.kwargs['op'] = self.op
        return [Expression(self.list)]
    
    def vm(self, scope):
        mem = self.children[0].vm(scope)
        op = {'-': 'neg', '~': 'not'}[self.op]
        return f"{mem}\n{op}"

class Term(Statement):
    def __init__(self, termToken, list):
        self.token = termToken
        if not Term.isConstant(self.token):
            raise Exception(f'Expected constant, got {self.token}')
        Statement.__init__(self, list)

    def buildTree(self):
        return [self.token]
    
    def vm(self, scope):
        if isinstance(self.token, StringToken):
            string = self.token.kwargs['string']
            return f"// begin '{string}'\n" + \
                "\n".join([f"push {ord(c)}\ncall String.appendChar 1" for c in string]) + \
                f"\n// end '{string}'"
        elif isinstance(self.token, NumberToken):
            return f"push constant {self.token.kwargs['number']}"
        else:
            location = scope.get(self.token.kwargs['token'])
            return f"push {location}"

    """
    Terms are determined by the next next token.

    ( expression => GroupExpression
    uop term => UnaryExpression
    term [ => IndexExpression
    term . => CallExpression
    term ( => CallExpression
    term => TermExpression
    """
    @staticmethod
    def next(list):
        next = list.peek()
        if SymbolToken.matches(next, '('):
            list.advance()
            return GroupExpression(list)
        if SymbolToken.matches(next, '-', '~'):
            list.advance()
            return UnaryExpression(next, list)
        term = list.next() 
        next = list.peek()
        if SymbolToken.matches(next, '['):
            list.advance()
            return IndexExpression(term, list)
        if SymbolToken.matches(next, '(', '.'):
            list.advance()
            return CallExpression(list, name=term, dot=next)
        return Term(term, list)
    
    @staticmethod
    def isConstant(token):
        return isinstance(token, IdentifierToken) or \
               isinstance(token, StringToken) or \
               isinstance(token, NumberToken) or \
               KeywordToken.matches(token, 'true', 'false', 'null', 'this')

class IndexExpression(Statement):
    def __init__(self, term, list):
        self.var = term
        Statement.__init__(self, list)
    
    def buildTree(self):
        self.kwargs = {
            'var': self.var.kwargs['token']
        }
        self.index = Expression(self.list)
        self.list.getSymbol(']')
        return [self.index]

    def vm(self, scope):
        location = scope.get(self.kwargs['var'])
        offset = self.index.vm(scope)
        addr = f"push {location}\n{offset}\nadd\npop pointer 1"
        return f"{addr}\npush that 0"

class CallExpression(Statement):
    def __init__(self, list, name=None, dot=None):
        self.subroutineName = name
        self.dot = dot
        Statement.__init__(self, list)

    def buildTree(self):
        if self.subroutineName is None:
            self.subroutineName = self.list.getIdentifier()
        self.varName = None
        if SymbolToken.matches(self.list.peek(), '.'):
            self.dot = self.list.next()
        if SymbolToken.matches(self.dot, '.'):
            self.varName = self.subroutineName
            self.subroutineName = self.list.getIdentifier()
        if not SymbolToken.matches(self.dot, '('):
            self.list.getSymbol('(')
        self.expressions = []
        if not SymbolToken.matches(self.list.peek(), ')'):
            self.expressions = Expression.list(self.list) 
        self.list.getSymbol(')')
        self.kwargs = {
            'subroutine': self.subroutineName.kwargs['token']
        }
        if self.varName is not None:
            self.kwargs['var'] = self.varName.kwargs['token']
        return self.expressions
    
    def vm(self, scope):
        vm = Statement.vm(self, scope)
        method = self.subroutineName.kwargs['token']
        if self.varName:
            var = self.varName.kwargs['token']
            method = f"{var}${method}"
        return f"{vm}\ncall {method} {len(self.expressions)}"

if __name__ == '__main__':
    parser.main(sys.argv[1:], BlockParser)

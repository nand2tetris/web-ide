import sys
from operator import is_not
from functools import partial
from xml.etree.ElementTree import Element
from xml.etree.ElementTree import ElementTree


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

class Tokenizer:
    def __init__(self, stream=sys.stdin):
        self.stream = stream
        self.done = False

    def hasToken(self):
        return not self.done
    
    def token(self):
        read = self.stream.readline()
        if read == '':
            self.done = True
        slash = read.find('//')
        if slash > -1:
            comment = read[slash:]
            read = read[:slash]
        else:
            comment = f'//# {read}'
        return (read.strip(), comment.replace('\n', ' '))
    
    def instruction(self):
        if self.hasToken():
            [token, comment] = self.token()
            instruction = self.makeInstruction(token, comment)
        if not instruction:
            instruction = NoopInstruction()
        return instruction

    def makeInstruction(self, token, comment):
        pass

class Instruction:
    def __init__(self, instruction='', comment='', *args, **kwargs):
        self.instruction = instruction
        self.comment = comment
        self.args = args
        self.kwargs = kwargs
        self.tree = self.buildTree()
    
    def buildTree(self):
        return []
    
    def fill(self, table, position):
        return position + 1
    
    def hack(self, table):
        return joinLines([child.hack(table) for child in self.tree])
    
    def asm(self):
        return joinLines([child.asm() for child in self.tree])
    
    def vm(self):
        return joinLines([child.vm() for child in self.tree])

    def xml(self):
        name = self.__class__.__name__
        element = f'<{name}'
        if self.instruction != '':
            element += f' instruction="{self.instruction}"'
        if self.comment != '':
            element += f' comment="{self.comment}"'
        if len(self.args) > 0:
            args = ' '.join(self.args)
            element += f' args="{args}"'
        for k, v in self.kwargs.items():
            element += f' {k}="{v}"'
        if len(self.tree) == 0:
            element += ' />'
        else:
            element += '>'
            for child in self.tree:
                xml = child.xml()
                if not xml is None:
                    element += xml
            element += f'</{name}>'
        return element

class NoopInstruction(Instruction):
    def __init__(self):
        Instruction.__init__(self, 'noop')
    
    def fill(self, table, position):
        return position

    def hack(self, table):
        return None
    
    def asm(self):
        return None
    
    def xml(self):
        return None

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

    def hack(self, table=Table()):
        self.fill(table) 
        return joinLines([child.hack(table) for child in self.tree])

def input():
    if len(sys.argv) > 1:
        print(f'Assembling from {sys.argv[1]} to stdout', file=sys.stderr)
        localfile = pathlib.Path(__file__).parent / sys.argv[1]
        return open(localfile)
    else:
        print(f'Assembling from stdin to stdout', file=sys.stderr)
        return sys.stdin

def main(Parser):
    file = input()

    parse = ASMParser()
    parse.parse(file)
    file.close()
    out = parse.default()
    sys.stdout.write(out)

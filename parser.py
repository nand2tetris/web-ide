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
    return f'{prefix}{name}{SYMBOLS[name]}'

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
        for child in self.tree:
            position = child.fill(table, position)
        return position
    
    def hack(self, table):
        return joinLines([child.hack(table) for child in self.tree])
    
    def asm(self):
        return joinLines([child.asm() for child in self.tree])
    
    def vm(self):
        return joinLines([child.vm() for child in self.tree])

    def xml(self, table):
        name = self.__class__.__name__
        attributes = { 
            'instruction': self.instruction,
            'comment': self.comment,
            'args': ' '.join(self.args),
            **self.kwargs
        }
        children = [child.xml(table) for child in self.tree]
        element = sixml.Element(name, attributes, children)

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
    
    def xml(self, table):
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

    def vm(self):
        return joinLines([child.vm() for child in self.tree])

    def hack(self, table=Table()):
        self.fill(table) 
        return joinLines([child.hack(table) for child in self.tree])
    
    def xml(self, table=Table()):
        self.fill(table)
        return Instruction.xml(self, table)


argparser = argparse.ArgumentParser()
argparser.add_argument('files', metavar='File', nargs='+')
argparser.add_argument('--xml', const=True, nargs='?', help='Write XML data, rather than the parser\s default output.')
argparser.add_argument('--out', type=str, default='-', help='Write to output file, - (default) is stdout.')

def main(argv, Parser):
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

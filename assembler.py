'''
Assembler for the hack machine language from nand2tetris
'''

import pathlib
import re
import sys

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

class Parse():
    def __init__(self, instream):
        self.tokenizer = Tokenizer(stream=instream)
        self.instructions = []
        self.table = Table()
    
    def parse(self):
        while self.tokenizer.hasToken():
            instruction = self.tokenizer.instruction()
            self.instructions.append(instruction)
        
        position = 0
        for instruction in self.instructions:
            position = instruction.fillTable(self.table, position)
    
    def write(self, outstream):
        for instruction in self.instructions:
            if instruction.binary:
                assembly = instruction.write(self.table)
                assembly = assembly.replace('_', '')
                outstream.write(assembly)
                outstream.write('\n')

class Tokenizer():
    def __init__(self, stream=sys.stdin):
        self.stream = stream
        self.done = False

    def hasToken(self):
        return not self.done
    
    def token(self):
        read = self.stream.readline()
        if read == '':
            self.done = True
        comment = read.find('//')
        if comment > -1:
            read = read[:comment]
        return read.strip()
    
    def instruction(self):
        if self.hasToken():
            token = self.token()
            try:
                if token[0] == '@':
                    return AInstruction(token)
                if token[0] == '(':
                    return LInstruction(token)
                if token[1] == '=' or token[2] == '=' or token[3] == '=':
                    return CInstruction(token)
                if token[-4] == ';':
                    return CInstruction(token)
            except:
                pass
            return NoopInstruction(token)

class NoopInstruction():
    def __init__(self, token):
        self.binary = False 
        self.token = token
    
    def fillTable(self, table, position):
        return position
    
    def write(self, table):
        return f'Noop/Comment: {self.token}'
    
    def __repr__(self):
        return f'                 # {self.write()}'

class CInstruction():
    def __init__(self, token):
        self.binary = True 
        self.token = token
        eq = self.token.find('=')
        sc = self.token.find(';')
        self.comp = token
        self.dest = ''
        self.jump = ''

        if eq > -1 and sc > -1:
            self.dest = self.token[0:eq]
            self.comp = self.token[eq+1:sc]
            self.jump = self.token[sc+1:]
        elif eq < 0 and sc > -1:
            self.comp = self.token[:sc]
            self.jump = self.token[sc+1:]
        elif eq > -1 and sc < 0:
            self.dest = self.token[0:eq]
            self.comp = self.token[eq+1:]

        self.mMode = self.comp.find('M') > -1

    
    def fillTable(self, table, position):
        self.position = position
        return position + 1
    
    def write(self, table):
        a = 1 if self.mMode else 0
        c = COMMANDS.get(self.comp.replace('M', 'A'), 0b111000)
        d = ASSIGN.get(self.dest, 0b000)
        j = JUMP.get(self.jump, 0b000)
        return f'111_{a:01b}_{c:06b}_{d:03b}_{j:03b}'
    
    def __repr__(self):
        return f'{self.position:0x04} {self.write({})} # {self.token}'
 
COMMANDS = {
      '0': 0b101010,
      '1': 0b111111,
     '-1': 0b111010,
      'D': 0b001100,
      'A': 0b110000,
     '!D': 0b001101,
     '!A': 0b110001,
     '-D': 0b001111,
     '-A': 0b110001,
    'D+1': 0b011111,
    'A+1': 0b110111,
    'D-1': 0b001110,
    'A-1': 0b110010,
    'D+A': 0b000010,
    'D-A': 0b010011,
    'A-D': 0b000111,
    'D&A': 0b000000,
    'D|A': 0b010101,
}

ASSIGN = {
    'M': 0b001,
    'D': 0b010,
    'MD': 0b011,
    'A': 0b100,
    'AM': 0b101,
    'AD': 0b110,
    'AMD': 0b111,
}

JUMP = {
    'JGT': 0b001,
    'JEQ': 0b010,
    'JGE': 0b011,
    'JLT': 0b100,
    'JNE': 0b101,
    'JLE': 0b110,
    'JMP': 0b111,
}

def jump(jmp):
    if jmp == 'JGT':
        return 0b001
    return 0b000


class AInstruction():
    def __init__(self, token):
        self.binary = True 
        self.token = token
        self.value = token[1:]
        self.isLiteral = re.match(r'^\d+$', self.value) 
    
    def fillTable(self, table, position):
        self.position = position
        if not self.isLiteral:
            table.register(self.value)
        return position + 1

    def write(self, table):
        if self.isLiteral:
            intval = int(self.value)
        else:
            intval = table.get(self.value)
        return f'0{intval:015b}'
    
    def __repr__(self):
        return f'{self.position:0x04} A{self.value:>19}'

class LInstruction():
    def __init__(self, token):
        self.binary = False 
        self.token = token
        self.value = token[1:-1]
    
    def fillTable(self, table, position):
        self.position = position
        table.location(self.value, position)
        return position

    def write(self, table):
        return f'Label: {self.token} @ {table[self.token]}'
    
    def __repr__(self):
        return f'{self.position:0x04} {self.token:^20}'

def input():
    if len(sys.argv) > 1:
        print(f'Assembling from {sys.argv[1]} to stdout', file=sys.stderr)
        localfile = pathlib.Path(__file__).parent / sys.argv[1]
        return open(localfile)
    else:
        print(f'Assembling from stdin to stdout', file=sys.stderr)
        return sys.stdin


if __name__ == '__main__':
    file = input()

    parse = Parse(file)
    parse.parse()
    file.close()
    parse.write(sys.stdout)


import re
import sys

import parser

class ASMParser(parser.Parser):
    @classmethod
    def getTokenizer(cls):
        return ASMTokenizer
    
    def default(self):
        return self.hack()

class ASMTokenizer(parser.Tokenizer):
    def makeInstruction(self, token, comment):
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
        return parser.NoopInstruction()

class CInstruction(parser.Instruction):
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

    def write(self, table):
        a = 1 if self.mMode else 0
        c = COMMANDS.get(self.comp.replace('M', 'A'), 0b111000)
        d = ASSIGN.get(self.dest, 0b000)
        j = JUMP.get(self.jump, 0b000)
        return f'111_{a:01b}_{c:06b}_{d:03b}_{j:03b}'

    def hack(self, table):
        return self.write(table).replace('_', '')
 
    def asm(self):
        return self.token
    
    def xml(self):
        name = self.__class__.__name__
        element = f'<{name} mMode="{self.mMode}"'
        if not self.dest == '':
            element += f' dest="{self.dest}"'
        element += f' comp="{self.comp}"'
        if not self.jump == '':
            element += f' jump="{self.jump}"'
        element += f'>{self.write({})}</{name}>'
        return element

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

class AInstruction(parser.Instruction):
    def __init__(self, token):
        self.token = token
        self.value = token[1:]
        self.isLiteral = re.match(r'^\d+$', self.value) 
    
    def fill(self, table, position):
        self.position = position
        if not self.isLiteral:
            table.register(self.value)
        return position + 1

    def hack(self, table):
        if self.isLiteral:
            intval = int(self.value)
        else:
            intval = table.get(self.value)
        return f'0{intval:015b}'
    
    def asm(self):
        return f'@{self.value}'
    
    def xml(self):
        name = self.__class__.__name__
        element = f'<{self.__class__.__name__} value="{self.value}" />'
        return element

class LInstruction(parser.Instruction):
    def __init__(self, token):
        self.token = token
        self.value = token[1:-1]
    
    def fill(self, table, position):
        self.position = position
        table.location(self.value, position)
        return position

    def hack(self, table):
        return None

    def asm(self):
        return f'({self.value})'
    
    def xml(self):
        name = self.__class__.__name__
        element = f'<{self.__class__.__name__} label="{self.value}" />'
        return element

if __name__ == '__main__':
    parser.main(sys.argv[1:], ASMParser)

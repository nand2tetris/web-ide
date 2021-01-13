import pathlib
import sys


class VM:
    def __init__(self, instream):
        self.tokenizer = Tokenizer(instream)
        self.instructions = []

    def parse(self):
        while self.tokenizer.hasToken():
            instruction = self.tokenizer.instruction()
            self.instructions.append(instruction)
    
    def write(self, outstream):
        for instruction in self.instructions:
            vm = instruction.write()
            outstream.write(vm)
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
        slash = read.find('//')
        if slash > -1:
            comment = read[slash:]
            read = read[:slash]
        else:
            comment = f'//# {read}'
        return (read.strip(), comment)
    
    def instruction(self):
        if self.hasToken():
            [token, comment] = self.token()
            parts = token.split(' ')
            if len(parts) == 1:
                [instruction] = parts
                arg1 = ''
                arg2 = ''
            if len(parts) == 2:
                [instruction, arg1] = parts
                arg2 = ''
            if len(parts) == 3:
                [instruction, arg1, arg2] = parts

            if instruction in [ 'neg', 'not']:
                return UnaryInstruction(instruction, comment)
            if instruction in ['add', 'sub', 'and', 'or']:
                return BinaryInstruction(instruction, comment)
            if instruction in ['lt', 'eq', 'gt']:
                return LogicInstruction(instruction, comment)
            if instruction == 'push' or instruction == 'pop':
                return MemoryInstruction(instruction, arg1, arg2, comment)
            return NoopInstruction(token, comment)

def PTR_OFF(ptr, offset):
    """
    D=ptr+offset
    """
    if offset > 1:
        op = f'@{offset:d}\nD=D+A'
    if offset == 1:
        op = f'D=D+1'
    if offset == 0:
        op = ''
    if offset == -1:
        op = 'D=D-1'
    if offset < -1:
        op = f'@{-offset:d}\nD=D-A'
    return f'@{ptr:s}\nD=M\n{op} //# D={ptr}+{offset}'

def READ(ptr, offset=0):
    """
    D=*(ptr+offset)
    """
    return f'{PTR_OFF(ptr, offset)}\nA=D\nD=M //# D=*({ptr}+{offset})'

def WRITE(ptr, offset=0):
    """
    *(ptr+offset)=D

    Uses R13 and R14
    """
    data = '@R13\nM=D'
    addr = f'{PTR_OFF(ptr, offset)}\n@R14\nM=D'
    write = '@R13\nD=M\n@R14\nA=M\nM=D'
    return f'{data}\n{addr}\n{write} //# *({ptr}+{offset})=D'

def BINARY(operation):
    load_x = READ('SP', -2)
    cache = '@R13\nM=D'
    load_y = READ('SP', -1)
    op = OPCODES[operation]
    write = WRITE('SP', -2)
    dec = DEC_SP
    return f'{load_y}\n{cache}\n{load_x}\n@R13\n{op} //# {operation}\n{write}\n{dec}'

def SYMBOL(name):
    if not name in SYMBOLS:
        SYMBOLS[name] = 0
    SYMBOLS[name] += 1
    return f'${name}{SYMBOLS[name]}'

def IF_THEN_ELSE(op, true, false):
    eq_then = SYMBOL(f'{op}_then')
    eq_else = SYMBOL(f'{op}_else')
    eq_end = SYMBOL(f'{op}_end')
    cmp = f'@{eq_then}\nD;{JUMPS[op]}'
    then = f'({eq_then})\n{true}\n'
    elze = f'{false}\n@{eq_end}\n0;JMP'
    return f'{cmp}\n{elze}\n{then}\n({eq_end})'

DEC_SP = """@SP
D=M
D=D-1
M=D"""

INC_SP = """@SP
D=M
D=D+1
M=D"""

OPCODES = {
    'neg': 'D=-D',
    'not': 'D=!D',
    'add': 'D=D+M',
    'sub': 'D=D-M',
    'and': 'D=D&M',
    'or': 'D=D|M',
}

JUMPS = {
    'eq': 'JEQ',
    'lt': 'JLT',
    'gt': 'JGT',
}

SYMBOLS = {}

POINTER = {
    'local': 'LCL',
    'argument': 'ARG',
    'this': 'THIS',
    'that': 'THAT',
}

class UnaryInstruction:
    def __init__(self, instruction, comment):
        self.binary = True 
        self.instruction = instruction 
        self.comment = comment

    def write(self):
        load = READ('SP', -1)
        op = OPCODES[self.instruction]
        write = WRITE('SP', -1)
        return f'{load}\n{op}\n{write} {self.comment}\n'
    
    def __retr__(self):
        return self.instruction

class BinaryInstruction:
    def __init__(self, instruction, comment):
        self.instruction = instruction
        self.comment = comment
    
    def write(self):
        return f'{BINARY(self.instruction)}  {self.comment}\n'
 
    def __retr__(self):
        return self.instruction

class MemoryInstruction:
    def __init__(self, instruction, segment, index, comment, file = 'Xxx', function=''):
        self.instruction = instruction
        self.segment = segment
        self.index = int(index)
        if segment == 'pointer':
            self.index += 3
        if segment == 'temp':
            self.index += 5
        self.comment = comment
        self.file = file
        self.function = function

    def target(self):

        return self.segment
    
    def write(self):
        if self.instruction == 'push':
            inc = INC_SP
            if self.segment in 'constant':
                value = f'@{self.index:d}\nD=A'
            elif self.segment in ['pointer', 'temp']:
                value = f'@{self.index:d}\nD=M'
            elif self.segment == 'static':
                value = f'@{self.file}.{self.index}\nD=M'
            elif self.segment in ['local', 'argument', 'this', 'that']:
                value = READ(POINTER[self.segment], self.index)
            else:
                value = READ(self.segment, self.index)
            write = WRITE('SP')
            return f'{value}\n{write}\n{inc} {self.comment}\n'
        if self.instruction == 'pop':
            read = READ('SP', -1)
            if self.segment in 'constant':
                write = f'0'
            elif self.segment in ['pointer', 'temp']:
                write = f'@{self.index:d}\nM=D'
            elif self.segment == 'static':
                write = f'@{self.file}.{self.index}\nM=D'
            elif self.segment in ['local', 'argument', 'this', 'that']:
                write = WRITE(POINTER[self.segment], self.index)
            else:
                write = write(self.segment, self.index)
            dec = DEC_SP
            return f'{read}\n{write}\n{dec} {self.comment}\n'
    
    def __retr__(self):
        return self.instruction + ' ' + self.segment + ' ' + self.index

class LogicInstruction:
    def __init__(self, instruction, comment):
        self.instruction = instruction
        self.comment = comment
    
    def write(self):
        setup = BINARY('sub')
        read = READ('SP', -1)
        true = f'@0\nD=A\nD=!D'
        false = f'@0\nD=A'
        if_then = IF_THEN_ELSE(self.instruction, true, false)
        write = WRITE('SP', -1)
        return f'{setup}\n{read}\n{if_then}\n{write}  {self.comment}\n'
    
    def __retr__(self):
        return self.instruction

class NoopInstruction():
    def __init__(self, token, comment):
        self.token = token
        self.comment = comment
    
    def write(self):
        return f'//# {self.token} {self.comment}'

def input():
    if len(sys.argv) > 1:
        print(f'Preparing VM from {sys.argv[1]} to stdout', file=sys.stderr)
        localfile = pathlib.Path(__file__).parent / sys.argv[1]
        return open(localfile)
    else:
        print(f'Preparing VM from stdin to stdout', file=sys.stderr)
        return sys.stdin

if __name__ == '__main__':
    file = input()

    parse = VM(file)
    parse.parse()
    file.close()
    parse.write(sys.stdout)


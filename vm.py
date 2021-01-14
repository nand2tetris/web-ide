import pathlib
import sys

import parser
import assembler


DATA_ADDRESS = 'R13'
MEMORY_ADDRESS = 'R14'
JUMP_ADDRESS = 'R15'

class VMParser(parser.Parser):
    @classmethod
    def getTokenizer(cls):
        return VMTokenizer

class VMTokenizer(parser.Tokenizer):
    def makeInstruction(self, token, comment):
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
            return MemoryInstruction(instruction, comment, segment=arg1, index=arg2, file='')
        if instruction == 'label':
            return LabelInstruction(instruction, comment, label=arg1)
        if instruction == 'goto' or instruction == 'if-goto':
            return GotoInstruction(instruction, comment, label=arg1)
        if instruction == 'function':
            return FunctionInstruction('function', comment, name=arg1, locals=arg2)
        if instruction == 'call':
            return CallInstruction('call', comment, name=arg1, args=arg2)
        if instruction == 'return':
            return ReturnInstruction('return', comment)
        return None

class ASM(parser.Instruction):
    def __init__(self, address=None, store='', comp='', jump=''):
        self.address = address
        self.store = store
        self.comp = comp
        self.jump = jump
        parser.Instruction.__init__(self, f'@{address} {store}={comp};{jump}')
    
    def buildTree(self):
        instructions = []
        if not self.address is None:
            instructions.append(assembler.AInstruction(f'@{self.address}'))
        instructions.append(assembler.CInstruction(f'{self.store}={self.comp};{self.jump}'))
        return instructions

CACHE_DATA = ASM(DATA_ADDRESS, 'M', 'D')
CACHE_ADDRESS = ASM(MEMORY_ADDRESS, 'M', 'D')

class PointerOffsetInstruction(parser.Instruction):
    def buildTree(self):
        ptr = self.kwargs['ptr']
        offset = self.kwargs.get('offset', 0)
        loadPtr = ASM(ptr, 'D', 'M')
        if offset > 1:
            op = ASM(f'{offset:d}', 'D', 'D+A')
        if offset == 1:
            op = ASM(None, 'D', 'D+1')
        if offset == 0:
            op = parser.NoopInstruction()
        if offset == -1:
            op = ASM(None, 'D', 'D-1')
        if offset < -1:
            op = ASM(f'{-offset:d}', 'D', 'D-A')
        
        return [loadPtr, op]

class ReadPtrInstruction(parser.Instruction):
    def buildTree(self):
        ptr = self.kwargs['ptr']
        offset = self.kwargs.get('offset', 0)
        return [
            PointerOffsetInstruction(ptr=ptr, offset=offset),
            ASM(None, 'A', 'D'),
            ASM(None, 'D', 'M'),
        ]

class WritePtrInstruction(parser.Instruction):
    def buildTree(self):
        ptr = self.kwargs['ptr']
        offset = self.kwargs.get('offset', 0)
        return [
            CACHE_DATA,
            # Calculate pointer and store in MEMORY_ADDRESS
            PointerOffsetInstruction(ptr=ptr, offset=offset),
            ASM(MEMORY_ADDRESS, 'M', 'D'),
            # Write from R13 to R14
            CACHE_DATA,
            ASM(MEMORY_ADDRESS, 'A', 'M'),
            ASM(None, 'M', 'D'),
        ]

class DecrementStackInstruction(parser.Instruction):
    def buildTree(self):
        return [
            ASM('SP', 'D', 'M'),
            ASM(None, 'MD', 'D-1')
        ]

class IncrementStackInstruction(parser.Instruction):
    def buildTree(self):
        return [
            ASM('SP', 'D', 'M'),
            ASM(None, 'MD', 'D+1')
        ]

class PopStackInstruction(parser.Instruction):
    def buildTree(self):
        return [
            ReadPtrInstruction(ptr='SP', offset=-1),
            CACHE_DATA,
            DecrementStackInstruction()
        ]

class PopRegisterInstruction(parser.Instruction):
    def buildTree(self):
        return [
            PopStackInstruction(),
            ASM(self.kwargs['ptr'], 'M', 'D')
        ]

class PushStackInstruction(parser.Instruction):
    def buildTree(self):
        return [
            WritePtrInstruction(ptr='SP'),
            IncrementStackInstruction()
        ]
    
class PushRegisterInstruction(parser.Instruction):
    def buildTree(self):
        reg = self.kwargs['reg']
        return [
            ASM(f'{reg:s}', 'D', 'M'),
            PushStackInstruction()
        ]

class PushConstantInstruction(parser.Instruction):
    def buildTree(self):
        val = self.kwargs['val']
        return [
            ASM(f'{val:d}', 'D', 'A'),
            PushStackInstruction()
        ]

class BinaryInstruction(parser.Instruction):
    def buildTree(self):
        return [
            ReadPtrInstruction(ptr='SP', offset=-2),
            CACHE_DATA,
            ReadPtrInstruction(ptr='SP', offset=-1),
            assembler.AInstruction(DATA_ADDRESS),
            assembler.CInstruction(OPCODES[self.instruction]),
            WritePtrInstruction(ptr='SP', offset=-2),
            DecrementStackInstruction(),
        ]

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

POINTER = {
    'local': 'LCL',
    'argument': 'ARG',
    'this': 'THIS',
    'that': 'THAT',
}

SYMBOLS = {}
def SYMBOL(name):
    if not name in SYMBOLS:
        SYMBOLS[name] = 0
    SYMBOLS[name] += 1
    return f'${name}{SYMBOLS[name]}'

class IfThenElseInstruction(parser.Instruction):
    def buildTree(self):
        eq_then = SYMBOL(f'{op}_then')
        eq_end = SYMBOL(f'{op}_end')
        return [
            ASM(eq_then, '', 'D', JUMPS[self.kwargs['op']]),
            self.kwargs['false'],
            ASM(eq_end, '', '0', 'JMP'),
            assembler.LInstruction(f'({eq_then})'),
            self.kwargs['true'],
            assembler.LInstruction(f'({eq_end})'),
        ]

class UnaryInstruction(parser.Instruction):
    def buildTree(self):
        return [
            ReadPtrInstruction(ptr='SP', offset=-1),
            assembler.CInstruction(OPCODES[self.instruction]),
            WritePtrInstruction(ptr='SP', offset=-1)
        ]

class MemoryInstruction(parser.Instruction):
    def buildTree(self):
        tree = []
        file = self.kwargs['file']
        index = int(self.kwargs['index'])
        segment = self.kwargs['segment']
        if segment == 'pointer':
            index += 3
        if segment == 'temp':
            index += 5
        if self.instruction == 'push':
            if segment in 'constant':
                tree.append(ASM(f'{index:d}', 'D', 'A'))
            elif segment in ['pointer', 'temp']:
                tree.append(ASM(f'{index:d}', 'D', 'M'))
            elif segment == 'static':
                tree.append(ASM(f'{file}.{index}', 'D', 'M'))
            elif segment in ['local', 'argument', 'this', 'that']:
                tree.append(ReadPtrInstruction(ptr=POINTER[segment], offset=index))
            else:
                tree.append(ReadPtrInstruction(ptr=segment, offset=index))
            tree.append(WritePtrInstruction(ptr='SP'))
            tree.append(IncrementStackInstruction())
        if self.instruction == 'pop':
            if segment != 'constant':
                tree.append(ReadPtrInstruction(ptr='SP', offset=-1))
            if segment in ['pointer', 'temp']:
                tree.append(ASM(f'{index:d}', 'M', 'D'))
            elif segment == 'static':
                tree.append(ASM(f'{file}.{index}', 'M', 'D'))
            elif segment in ['local', 'argument', 'this', 'that']:
                tree.append(WritePtrInstruction(ptr=POINTER[argument], offset=index))
            else:
                tree.append(WritePtrInstruction(ptr=segment, offset=index))
            tree.append(DecrementStackInstruction())    
        return tree

class LogicTrueInstruction(parser.Instruction):
    def buildTree(self):
        return [
            ASM('0', 'D', 'A'),
            ASM(None, 'D', '!D'),
        ]

class LogicFalseInstruction(parser.Instruction):
    def buildTree(self):
        return [
            ASM('0', 'D', 'A')
        ]

class LogicInstruction(parser.Instruction):
    def buildTree(self):
        return [
            BinaryInstruction('sub'),
            ReadPtrInstruction(ptr='SP', offset=-1),
            IfThenElseInstruction(self.instruction, LogicTrueInstruction(), LogicFalseInstruction()),
            WritePtrInstruction(ptr='SP', offset=-1),
        ]

class LabelInstruction(parser.Instruction):
    def buildTree(self):
        return [assembler.LInstruction(self.kwargs['label'])]
    
class GotoInstruction(parser.Instruction):
    def buildTree(self):
        label = self.kwargs['label']
        if self.instruction == 'goto':
            return ASM(label, '', '0', 'JMP')
        if self.instruction == 'if-goto':
            return [
                CACHE_DATA,
                DecrementStackInstruction(),
                ASM(DATA_ADDRESS, '', 'M', 'JNE')
            ]

class FunctionInstruction(parser.Instruction):
    def buildTree(self):
        locals = int(self.kwargs['locals'])
        label = self.kwargs['name']
        # static = ???
        tree = [
            ASM('SP', 'D', 'M'),
            ASM('LCL', 'M', 'D')
        ]
        for i in range(0, locals):
            tree.append(PushConstantInstruction(val=0))
        return tree

class CallInstruction(parser.Instruction):
    def buildTree(self):
        args = self.kwargs['args']
        function = self.kwargs['name']
        address = SYMBOL(f'{function}-return')

        return [
            PushConstantInstruction(val=address),
            PushRegisterInstruction(reg='LCL'),
            PushRegisterInstruction(reg='ARG'),
            PushRegisterInstruction(reg='THIS'),
            PushRegisterInstruction(reg='THAT'),
            PushRegisterInstruction(reg='SP'),
            PushConstantInstruction(val=args),
            PushConstantInstruction(val=5),
            BinaryInstruction('sub'),
            BinaryInstruction('sub'),
            PopRegisterInstruction(ptr='ARG'),
            GotoInstruction('goto', label=function),
            assembler.LInstruction(address)
        ]

class MovePointerInstruction(parser.Instruction):
    def buildTree(self):
        src = self.kwargs['src']
        src_offset = self.kwargs.get('src_offset', 0)
        dest = self.kwargs['dest']
        dest_offset = self.kwargs.get('dest_offset', 0)
        return [
            ReadPtrInstruction(ptr=src, offset=src_offset),
            WritePtrInstruction(ptr=dest, offset=dest_offset),
        ]

class ReturnInstruction(parser.Instruction):
    def buildTree(self):
        return [
            MovePointerInstruction(src='LCL', dest=MEMORY_ADDRESS),
            MovePointerInstruction(src=MEMORY_ADDRESS, offset=-5, dest=JUMP_ADDRESS),
            PopRegisterInstruction(ptr='ARG'), # Set up return value
            # SP = ARG+1
            ASM('ARG', 'D', 'M'),
            ASM('SP', 'M', 'D+1'),
            MovePointerInstruction(src=MEMORY_ADDRESS, src_offset=-1, dest='THAT'),
            MovePointerInstruction(src=MEMORY_ADDRESS, src_offset=-2, dest='THIS'),
            MovePointerInstruction(src=MEMORY_ADDRESS, src_offset=-3, dest='ARG'),
            MovePointerInstruction(src=MEMORY_ADDRESS, src_offset=-4, dest='LCL'),
            ASM(JUMP_ADDRESS, '', 'M', 'JMP')
        ]

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

    parse = VMParser()
    parse.parse(file)
    file.close()
    out = parse.asm()
    #out = parse.xml()
    sys.stdout.write(out)

#!/usr/bin/env python
import sys

import parser
import assembler


DATA_ADDRESS = 'R13'
MEMORY_ADDRESS = 'R14'
JUMP_ADDRESS = 'R15'
FRAME_ADDRESS = 'R12'
SP_ADDRESS = 'R11'

class VMParser(parser.Parser):
    @classmethod
    def getTokenizer(cls):
        return VMTokenizer
    
    def default(self):
        return self.asm()
    
    def parse(self, instream):
        parser.Parser.parse(self, instream)

        hasSysInit = False
        for child in self.tree:
            isFn = isinstance(child, FunctionInstruction)
            if isFn and child.kwargs['name'] == 'Sys.init':
                hasSysInit = True

        if hasSysInit:
            self.tree.insert(0, BootstrapInstruction())

class VMTokenizer(parser.Tokenizer):
    def __init__(self, instream):
        parser.Tokenizer.__init__(self, instream)
        self.currentFunction = ''

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
            return MemoryInstruction(instruction, comment, segment=arg1, index=arg2, function=self.currentFunction)
        if instruction == 'label':
            return LabelInstruction(instruction, comment, label=arg1)
        if instruction == 'goto' or instruction == 'if-goto':
            return GotoInstruction(instruction, comment, label=arg1)
        if instruction == 'function':
            self.currentFunction = arg1
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
        if self.address:
            instructions.append(assembler.AInstruction(f'@{self.address}'))
        cInst = self.comp
        if self.store:
            cInst = f'{self.store}={cInst}'
        if self.jump:
            cInst = f'{cInst};{self.jump}'
        instructions.append(assembler.CInstruction(cInst))
        return instructions

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
    """
    *(ptr+offset)=D
    """
    def buildTree(self):
        ptr = self.kwargs['ptr']
        offset = self.kwargs.get('offset', 0)
        return [
            ASM(DATA_ADDRESS, 'M', 'D'),
            # Calculate pointer and store in MEMORY_ADDRESS
            PointerOffsetInstruction(ptr=ptr, offset=offset),
            ASM(MEMORY_ADDRESS, 'M', 'D'),
            # Write from DATA_ADDRESS to MEMORY_ADDRESS
            ASM(DATA_ADDRESS, 'D', 'M'),
            ASM(MEMORY_ADDRESS, 'A', 'M'),
            ASM('', 'M', 'D')
        ]

class ReadInstruction(parser.Instruction):
    def buildTree(self):
        src = self.kwargs['src']
        if 'reg' in src:
            return [
                ASM(src['reg'], 'D', 'M'),
            ]
        elif 'ptr' in src:
            ptr = src['ptr']
            offset = src.get('offset', 0)
            return [
                ReadPtrInstruction(ptr=ptr, offset=offset)
            ]
        else:
            return []

class WriteInstruction(parser.Instruction):
    def buildTree(self):
        dest = self.kwargs['dest']
        if 'reg' in dest:
            return [
                ASM(dest['reg'], 'M', 'D'),
            ]
        elif 'ptr' in dest:
            ptr = dest['ptr']
            offset = dest.get('offset', 0)
            return [
                WritePtrInstruction(ptr=ptr, offset=offset)
            ]
        else:
            return []

class MoveInstruction(parser.Instruction):
    def buildTree(self):
        src = self.kwargs['src']
        dest = self.kwargs['dest']
        return [
            ReadInstruction(src=src),
            WriteInstruction(dest=dest),
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
            ASM(DATA_ADDRESS, 'M', 'D'),
            DecrementStackInstruction(),
            ASM(DATA_ADDRESS, 'D', 'M')
        ]

class PopRegisterInstruction(parser.Instruction):
    def buildTree(self):
        return [
            PopStackInstruction(),
            ASM(self.kwargs['reg'], 'M', 'D')
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
            ASM(f'{val}', 'D', 'A'),
            PushStackInstruction()
        ]

class BinaryInstruction(parser.Instruction):
    def buildTree(self):
        return [
            # Read Y into DATA_ADDRESS
            ReadPtrInstruction(ptr='SP', offset=-1),
            ASM(DATA_ADDRESS, 'M', 'D'),
            # Read X into D
            ReadPtrInstruction(ptr='SP', offset=-2),
            assembler.AInstruction(DATA_ADDRESS),
            # Operate with D=X and M=Y
            assembler.CInstruction(OPCODES[self.instruction]),
            WritePtrInstruction(ptr='SP', offset=-2),
            DecrementStackInstruction(),
        ]

    def vm(self):
        return self.instruction

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

class IfThenElseInstruction(parser.Instruction):
    def buildTree(self):
        op = self.instruction
        eq_then = parser.SYMBOL(f'{op}_then')
        eq_end = parser.SYMBOL(f'{op}_end')
        return [
            ASM(eq_then, '', 'D', JUMPS[op]),
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
    
    def vm(self):
        return self.instruction

class MemoryInstruction(parser.Instruction):
    def buildTree(self):
        tree = []
        function = self.kwargs['function']
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
                tree.append(ASM(f'{function}.{index}', 'D', 'M'))
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
                tree.append(ASM(f'{function}.{index}', 'M', 'D'))
            elif segment in ['local', 'argument', 'this', 'that']:
                tree.append(WritePtrInstruction(ptr=POINTER[segment], offset=index))
            else:
                tree.append(WritePtrInstruction(ptr=segment, offset=index))
            tree.append(DecrementStackInstruction())    
        return tree
    
    def vm(self):
        index = int(self.kwargs['index'])
        segment = self.kwargs['segment']
        return f'{self.instruction} {segment} {index}'

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
            IfThenElseInstruction(self.instruction, true=LogicTrueInstruction(), false=LogicFalseInstruction()),
            WritePtrInstruction(ptr='SP', offset=-1),
        ]
    
    def vm(self):
        return self.instruction

class LabelInstruction(parser.Instruction):
    def buildTree(self):
        label = self.kwargs['label']
        return [assembler.LInstruction(f'({label})')]
    
    def vm(self):
        label =  self.kwargs['label']
        return f'label {label}'
    
class GotoInstruction(parser.Instruction):
    def buildTree(self):
        label = self.kwargs.get('label', None)
        indirect = self.kwargs.get('indirect', False)
        if self.instruction == 'goto':
            if indirect:
                return [
                    ASM(label, 'D', 'M'),
                    ASM('', 'A', 'D'),
                    ASM('', '', '0', 'JMP')
                ]
            else:
                return [ASM(label, '', '0', 'JMP')]
        if self.instruction == 'if-goto':
            return [
                PopStackInstruction(),
                ASM(label, '', 'D', 'JNE')
            ]
        
    def vm(self):
        label = self.kwargs['label']
        return f'{self.instruction} {label}'

class FunctionInstruction(parser.Instruction):
    def buildTree(self):
        locals = int(self.kwargs['locals'])
        label = self.kwargs['name']
        # static = ???
        tree = [
            LabelInstruction(label=label),
            ASM('SP', 'D', 'M'),
            ASM('LCL', 'M', 'D')
        ]
        for i in range(0, locals):
            tree.append(PushConstantInstruction(val=0))
        return tree
    
    def vm(self):
        locals = int(self.kwargs['locals'])
        label = self.kwargs['name']
        return f'function {label} {locals}'

class BuildCallStack(parser.Instruction):
    def buildTree(self):
        args = self.kwargs['args']
        return [
            MoveInstruction(src={'reg': 'LCL'}, dest={'ptr': 'SP', 'offset': 0}),
            MoveInstruction(src={'reg': 'ARG'}, dest={'ptr': 'SP', 'offset': 1}),
            MoveInstruction(src={'reg': 'THIS'}, dest={'ptr': 'SP', 'offset': 2}),
            MoveInstruction(src={'reg': 'THAT'}, dest={'ptr': 'SP', 'offset': 3}),
            ASM('SP', 'D', 'M'),
            ASM(4, 'D', 'D+A'),
            ASM('SP', 'M', 'D'),
            ASM(int(args)+5, 'D', 'D-A'),
            ASM('ARG', 'M', 'D')
        ]

class ClearArgsInstruction(parser.Instruction):
    def buildTree(self):
        args = self.kwargs['args']
        return [
            PopRegisterInstruction(reg=DATA_ADDRESS),
            ASM('SP', 'D', 'M'),
            ASM(int(args), 'D', 'D-A'),
            ASM('SP', 'M', 'D'),
            PushRegisterInstruction(reg=DATA_ADDRESS)
        ]

class CallInstruction(parser.Instruction):
    def buildTree(self):
        args = self.kwargs['args']
        function = self.kwargs['name']
        address = parser.SYMBOL(f'{function}-return', prefix='')

        return [
            PushConstantInstruction(val=address),
            BuildCallStack(args=args),
            GotoInstruction('goto', label=function),
            assembler.LInstruction(f'({address})'),
            ClearArgsInstruction(args=args),
        ]

    def vm(self):
        args = self.kwargs['args']
        function = self.kwargs['name']
        return f'call {function} {args}'

class PopFrameInstruction(parser.Instruction):
    def buildTree(self):
        return [
            MoveInstruction(src={'ptr': FRAME_ADDRESS, 'offset': -1}, dest={'reg': 'THAT'}),
            MoveInstruction(src={'ptr': FRAME_ADDRESS, 'offset': -2}, dest={'reg': 'THIS'}),
            MoveInstruction(src={'ptr': FRAME_ADDRESS, 'offset': -3}, dest={'reg': 'ARG'}),
            MoveInstruction(src={'ptr': FRAME_ADDRESS, 'offset': -4}, dest={'reg': 'LCL'}),
        ]

class ReturnInstruction(parser.Instruction):
    def buildTree(self):
        return [
            # FRAME = LCL
            ASM('LCL', 'D', 'M'),
            ASM(FRAME_ADDRESS, 'M', 'D'),
            # RET = *(FRAME-5)
            MoveInstruction(src={'ptr': FRAME_ADDRESS, 'offset': -5}, dest={'reg': JUMP_ADDRESS}),
            # Copy return value to top of stack
            MoveInstruction(src={'ptr': 'SP', 'offset': -1}, dest={'ptr': 'ARG'}),
            # Cache arg, to update SP later
            MoveInstruction(src={'reg': 'ARG'}, dest={'reg': SP_ADDRESS}),
            # Reset registers
            PopFrameInstruction(),
            # SP = OLD_ARG+1
            ReadInstruction(src={'reg': SP_ADDRESS}),
            ASM('SP', 'M', 'D+1'),
            GotoInstruction('goto', label=JUMP_ADDRESS, indirect=True)
        ]
    
    def vm(self):
        return 'return'

class BootstrapInstruction(parser.Instruction):
    def buildTree(self):
        return [
            ASM(256, 'D', 'A'),
            ASM('SP', 'M', 'D'),
            GotoInstruction('goto', label='Sys.init')
        ]

if __name__ == '__main__':
    parser.main(sys.argv[1:], VMParser)
import unittest

import assembler
import parser
import parser_test
import translator
    
class TranslatorTestCase(parser_test.ParserTestCase):
    def assertAsm(self, instruction, address=None, store='', comp='', jump=''):
        self.assertIsInstance(instruction, translator.ASM)
        self.assertEqual(instruction.address, address)
        self.assertEqual(instruction.store, store)
        self.assertEqual(instruction.comp, comp)
        self.assertEqual(instruction.jump, jump)
    
    def assertInstruction(self, instruction, Instruction, **kwargs):
        if Instruction == translator.ASM:
            self.assertAsm(instruction, **kwargs)
        else:
            parser_test.ParserTestCase.assertInstruction(self, instruction, Instruction, **kwargs)

# Use this to skip an instruction in the instruction list
SKIP = (None, (None, None))

class TestPointerOffsetInstruction(TranslatorTestCase):
    def test_offsetTwo(self):
        instruction = translator.PointerOffsetInstruction(ptr='pointer', offset=2)
        self.assertInstructionList(instruction.tree, [
            (translator.ASM, {'address': 'pointer', 'store': 'D', 'comp': 'M'}),
            (translator.ASM, {'address': '2', 'store': 'D', 'comp': 'D+A'}),
        ])
    
    def test_offsetOne(self):
        instruction = translator.PointerOffsetInstruction(ptr='pointer', offset=1)
        self.assertInstructionList(instruction.tree, [
            (translator.ASM, {'address': 'pointer', 'store': 'D', 'comp': 'M'}),
            (translator.ASM, {'store': 'D', 'comp': 'D+1'}),
        ])
    
    def test_offsetZero(self):
        instruction = translator.PointerOffsetInstruction(ptr='pointer', offset=0)
        self.assertInstructionList(instruction.tree, [
            (translator.ASM, {'address': 'pointer', 'store': 'D', 'comp': 'M'}),
            (parser.NoopInstruction, {}),
        ])
    
    def test_offsetNegOne(self):
        instruction = translator.PointerOffsetInstruction(ptr='pointer', offset=-1)
        self.assertEqual(len(instruction.tree), 2)
        self.assertInstructionList(instruction.tree, [
            (translator.ASM, {'address': 'pointer', 'store': 'D', 'comp': 'M'}),
            (translator.ASM, {'store': 'D', 'comp': 'D-1'}),
        ])
    
    def test_offsetNegTwo(self):
        instruction = translator.PointerOffsetInstruction(ptr='pointer', offset=-2)
        self.assertEqual(len(instruction.tree), 2)
        self.assertInstructionList(instruction.tree, [
            (translator.ASM, {'address': 'pointer', 'store': 'D', 'comp': 'M'}),
            (translator.ASM, {'address': '2', 'store': 'D', 'comp': 'D-A'}),
        ])

class TestReadPtrInstruction(TranslatorTestCase):
    def test_readPtr(self):
        instruction = translator.ReadPtrInstruction(ptr='pointer', offset=3)
        self.assertInstructionList(instruction.tree, [
            (translator.PointerOffsetInstruction, {'ptr': 'pointer', 'offset': 3}),
            (translator.ASM, {'store': 'A', 'comp': 'D'}),
            (translator.ASM, {'store': 'D', 'comp': 'M'}),
        ])

class TestWritePtrInstruction(TranslatorTestCase):
    def test_writePtr(self):
        instruction = translator.WritePtrInstruction(ptr='pointer', offset=-3)
        self.assertInstructionList(instruction.tree, [
            (translator.ASM, {'address': translator.DATA_ADDRESS, 'store': 'M', 'comp':'D'}),
            (translator.PointerOffsetInstruction, {'ptr': 'pointer', 'offset': -3}),
            (translator.ASM, {'address': translator.MEMORY_ADDRESS, 'store': 'M', 'comp':'D'}),
            (translator.ASM, {'address': translator.DATA_ADDRESS, 'store': 'D', 'comp':'M'}),
            (translator.ASM, {'address': translator.MEMORY_ADDRESS, 'store': 'A', 'comp':'M'}),
            (translator.ASM, {'store': 'M', 'comp':'D'}),
        ])

class TestReadInstruction(TranslatorTestCase):
    def test_readReg(self):
        instruction = translator.ReadInstruction(src={'reg': 'LCL'})
        self.assertInstructionList(instruction.tree, [
            (translator.ASM, {'address': 'LCL', 'store': 'D', 'comp': 'M'})
        ])
    
    def test_readPtr(self):
        instruction = translator.ReadInstruction(src={'ptr': 'pointer', 'offset': 5})
        self.assertInstructionList(instruction.tree, [
            (translator.ReadPtrInstruction, {'ptr': 'pointer', 'offset': 5})
        ])

class TestWriteInstruction(TranslatorTestCase):
    def test_readReg(self):
        instruction = translator.WriteInstruction(dest={'reg': 'LCL'})
        self.assertInstructionList(instruction.tree, [
            (translator.ASM, {'address': 'LCL', 'store': 'M', 'comp': 'D'})
        ])
    
    def test_readPtr(self):
        instruction = translator.WriteInstruction(dest={'ptr': 'pointer', 'offset': 5})
        self.assertInstructionList(instruction.tree, [
            (translator.WritePtrInstruction, {'ptr': 'pointer', 'offset': 5})
        ])

class TestMoveInstruction(TranslatorTestCase):
    def test_move(self):
        src = {'reg': 'LCL'}
        dest = {'ptr': 'pointer', 'offset': 0}
        instruction = translator.MoveInstruction(src=src, dest=dest)
        self.assertInstructionList(instruction.tree, [
            (translator.ReadInstruction, {'src': src}),
            (translator.WriteInstruction, {'dest': dest})
        ])

class TestStackInstructions(TranslatorTestCase):
    def test_decrementStack(self):
        instruction = translator.DecrementStackInstruction()
        self.assertInstructionList(instruction.tree, [
            (translator.ASM, {'address': 'SP', 'store': 'D', 'comp': 'M'}),
            (translator.ASM, {'store': 'MD', 'comp': 'D-1'})
        ])

    def test_incrementStack(self):
        instruction = translator.IncrementStackInstruction()
        self.assertInstructionList(instruction.tree, [
            (translator.ASM, {'address': 'SP', 'store': 'D', 'comp': 'M'}),
            (translator.ASM, {'store': 'MD', 'comp': 'D+1'})
        ])

    def test_popStack(self):
        instruction = translator.PopStackInstruction()
        self.assertInstructionList(instruction.tree, [
            (translator.ReadPtrInstruction, {'ptr': 'SP', 'offset': -1}),
            (translator.ASM, {'address': translator.DATA_ADDRESS, 'store': 'M', 'comp': 'D'}),
            (translator.DecrementStackInstruction, {}),
            (translator.ASM, {'address': translator.DATA_ADDRESS, 'store': 'D', 'comp': 'M'}),
        ])
    
    def test_pushStack(self):
        instruction = translator.PushStackInstruction()
        self.assertInstructionList(instruction.tree, [
            (translator.WritePtrInstruction, {'ptr': 'SP'}),
            (translator.IncrementStackInstruction, {})
        ])
    
    def test_pushRegister(self):
        instruction = translator.PushRegisterInstruction(reg='LCL')
        self.assertInstructionList(instruction.tree, [
            (translator.ASM, {'address': 'LCL', 'store': 'D', 'comp': 'M'}),
            (translator.PushStackInstruction, {})
        ])
    
    def test_pushConstant(self):
        instruction = translator.PushConstantInstruction(val=42)
        self.assertInstructionList(instruction.tree, [
            (translator.ASM, {'address': '42', 'store': 'D', 'comp': 'A'}),
            (translator.PushStackInstruction, {})
        ])
    
    def test_popRegister(self):
        instruction = translator.PopRegisterInstruction(reg='LCL')
        self.assertInstructionList(instruction.tree, [
            (translator.PopStackInstruction, {}),
            (translator.ASM, {'address': 'LCL', 'store': 'M', 'comp': 'D'}),
        ])

class TestComputationInstruction(TranslatorTestCase):
    def test_binary(self):
        instruction = translator.BinaryInstruction('and')
        self.assertInstructionList(instruction.tree, [
            (translator.ReadPtrInstruction, {'ptr': 'SP', 'offset': -1}),
            (translator.ASM, {'address': translator.DATA_ADDRESS, 'store': 'M', 'comp': 'D'}),
            (translator.ReadPtrInstruction, {'ptr': 'SP', 'offset': -2}),
            SKIP,
            SKIP,
            (translator.WritePtrInstruction, {'ptr': 'SP', 'offset': -2}),
            (translator.DecrementStackInstruction, {}),
        ])
        a = instruction.tree[3]
        c = instruction.tree[4]
        self.assertIsInstance(a, assembler.AInstruction)
        self.assertEqual(a.value, '13')
        self.assertEqual(bool(a.isLiteral), True)
        self.assertIsInstance(c, assembler.CInstruction)
        self.assertEqual(c.comp, 'D&M')
        self.assertEqual(c.dest, 'D')
        self.assertEqual(c.jump, '')

    def test_unary(self):
        instruction = translator.UnaryInstruction('neg')
        self.assertInstructionList(instruction.tree, [
            (translator.ReadPtrInstruction, {'ptr': 'SP', 'offset': -1}),
            SKIP,
            (translator.WritePtrInstruction, {'ptr': 'SP', 'offset': -1}),
        ])
        c = instruction.tree[1]
        self.assertIsInstance(c, assembler.CInstruction)
        self.assertEqual(c.comp, '-D')
        self.assertEqual(c.dest, 'D')
        self.assertEqual(c.jump, '')

class TestMemoryInstruction(TranslatorTestCase):
    def test_pushConstant(self):
        instruction = translator.MemoryInstruction('push', segment='constant', index='42', function='Test')
        self.assertInstructionList(instruction.tree, [
            (translator.ASM, {'address': '42', 'store': 'D', 'comp': 'A'}),
            (translator.WritePtrInstruction, {'ptr': 'SP'}),
            (translator.IncrementStackInstruction, {}),
        ])

    def test_push_temp_pointer(self):
        pointer = translator.MemoryInstruction('push', segment='pointer', index='0', function='Test')
        self.assertInstructionList(pointer.tree, [
            (translator.ASM, {'address': '3', 'store': 'D', 'comp': 'M'}),
            (translator.WritePtrInstruction, {'ptr': 'SP'}),
            (translator.IncrementStackInstruction, {}),
        ])
        
        temp = translator.MemoryInstruction('push', segment='temp', index='3', function='Test')
        self.assertInstruction(temp.tree[0], (translator.ASM, {'address': '8', 'store': 'D', 'comp': 'M'}))

    def test_push_static(self):
        static = translator.MemoryInstruction('push', segment='static', index='5', function='Test')
        self.assertInstruction(static.tree[0], (translator.ASM, {'address': 'Test.5', 'store': 'D', 'comp': 'M'}))

    def test_push_local_argument_this_that(self):
        local = translator.MemoryInstruction('push', segment='local', index='2', function='Test')
        self.assertInstruction(local.tree[0], (translator.ReadPtrInstruction, {'ptr': 'LCL', 'offset': '2'}))
        argument = translator.MemoryInstruction('push', segment='argument', index='3', function='Test')
        self.assertInstruction(argument.tree[0], (translator.ReadPtrInstruction, {'ptr': 'ARG', 'offset': '3'}))
        this = translator.MemoryInstruction('push', segment='this', index='4', function='Test')
        self.assertInstruction(this.tree[0], (translator.ReadPtrInstruction, {'ptr': 'THIS', 'offset': '4'}))
        that = translator.MemoryInstruction('push', segment='that', index='5', function='Test')
        self.assertInstruction(that.tree[0], (translator.ReadPtrInstruction, {'ptr': 'THAT', 'offset': '5'}))

    def test_pop_pointer_temp(self):
        pointer = translator.MemoryInstruction('pop', segment='pointer', index='1', function='Test')
        self.assertInstructionList(pointer.tree, [
            (translator.ReadPtrInstruction, {'ptr': 'SP', 'offset': -1}),
            (translator.ASM, {'address': '4', 'store': 'M', 'comp': 'D'}),
            (translator.DecrementStackInstruction, {}),
        ])
        temp = translator.MemoryInstruction('pop', segment='temp', index='2', function='Test')
        self.assertInstruction(temp.tree[1], (translator.ASM, {'address': '7', 'store': 'D', 'comp': 'M'}))

    def test_pop_static(self):
        temp = translator.MemoryInstruction('pop', segment='static', index='2', function='Test')
        self.assertInstruction(temp.tree[1], (translator.ASM, {'address': 'Test.2', 'store': 'D', 'comp': 'M'}))

    def test_pop_local_argument_this_that(self):
        local = translator.MemoryInstruction('pop', segment='local', index='2', function='Test')
        self.assertInstruction(local.tree[1], (translator.WritePtrInstruction, {'ptr': 'LCL', 'offset': '2'}))
        argument = translator.MemoryInstruction('pop', segment='argument', index='3', function='Test')
        self.assertInstruction(argument.tree[1], (translator.WritePtrInstruction, {'ptr': 'ARG', 'offset': '3'}))
        this = translator.MemoryInstruction('pop', segment='this', index='4', function='Test')
        self.assertInstruction(this.tree[1], (translator.WritePtrInstruction, {'ptr': 'THIS', 'offset': '4'}))
        that = translator.MemoryInstruction('pop', segment='that', index='5', function='Test')
        self.assertInstruction(that.tree[1], (translator.WritePtrInstruction, {'ptr': 'THAT', 'offset': '5'}))

class TestLogicInstructions(TranslatorTestCase):
    def test_ifThenElse(self):
        true = translator.LogicTrueInstruction()
        false = translator.LogicFalseInstruction()
        instruction = translator.IfThenElseInstruction('lt', true=true, false=false)
        self.assertInstructionList(instruction.tree, [
            (translator.ASM, {'address': '$lt_then_1', 'store': '', 'comp': 'D', 'jump': 'JLT'}),
            SKIP,
            (translator.ASM, {'address': '$lt_end_1', 'store': '', 'comp': '0', 'jump': 'JMP'}),
            SKIP,
            SKIP,
            SKIP
        ])
        self.assertEqual(instruction.tree[1], false)
        self.assertEqual(instruction.tree[4], true)
        self.assertIsInstance(instruction.tree[3], assembler.LInstruction)
        self.assertEqual(instruction.tree[3].value, '$lt_then_1')
        self.assertIsInstance(instruction.tree[5], assembler.LInstruction)
        self.assertEqual(instruction.tree[5].value, '$lt_end_1')

    def test_false(self):
        instruction = translator.LogicFalseInstruction()
        self.assertInstructionList(instruction.tree, [
            (translator.ASM, {'address': '0', 'store': 'D', 'comp': 'A'})
        ])
    
    def test_true(self):
        instruction = translator.LogicTrueInstruction()
        self.assertInstructionList(instruction.tree, [
            (translator.ASM, {'address': '0', 'store': 'D', 'comp': 'A'}),
            (translator.ASM, {'store': 'D', 'comp': '!D'})
        ])

    def test_logic(self):
        instruction = translator.LogicInstruction('lt')
        self.assertInstructionList(instruction.tree, [
            (translator.BinaryInstruction, {}),
            (translator.ReadPtrInstruction, {'ptr': 'SP', 'offset': -1}),
            (translator.IfThenElseInstruction, {}),
            (translator.WritePtrInstruction, {'ptr': 'SP', 'offset': -1}),
        ])
        self.assertEqual(instruction.tree[0].instruction, 'sub')
        self.assertEqual(instruction.tree[2].instruction, 'lt')

class TestLabelInstruction(TranslatorTestCase):
    def test_label(self):
        instruction = translator.LabelInstruction(label='label')
        self.assertEqual(len(instruction.tree), 1)
        self.assertIsInstance(instruction.tree[0], assembler.LInstruction)
        self.assertEqual(instruction.tree[0].value, 'label')

class TestGotoInstruction(TranslatorTestCase):
    def test_gotoDirect(self):
        instruction = translator.GotoInstruction('goto', label='label', indirect=False)
        self.assertInstructionList(instruction.tree, [
            (translator.ASM, {'address': 'label', 'store': '', 'comp': '0', 'jump': 'JMP'}),
        ])

    def test_gotoIndirect(self):
        instruction = translator.GotoInstruction('goto', label='reg', indirect=True)
        self.assertInstructionList(instruction.tree, [
            (translator.ASM, {'address': 'reg', 'store': 'D', 'comp': 'M'}),
            (translator.ASM, {'store': 'A', 'comp': 'D'}),
            (translator.ASM, {'store': '', 'comp': '0', 'jump': 'JMP'}),
        ])

    def test_if_goto(self):
        instruction = translator.GotoInstruction('if-goto', label='label')
        self.assertInstructionList(instruction.tree, [
            (translator.PopStackInstruction, {}),
            (translator.ASM, {'address': 'label', 'store': '', 'comp': 'D', 'jump': 'JNE'}),
        ])

class TestFunctionCalling(TranslatorTestCase):
    def test_function(self):
        instruction = translator.FunctionInstruction(name='Test', locals='0')
        self.assertInstructionList(instruction.tree, [
            (translator.LabelInstruction, {'label': 'Test'}),
            (translator.ASM, {'address': 'SP', 'store': 'D', 'comp': 'M'}),
            (translator.ASM, {'address': 'LCL', 'store': 'M', 'comp': 'D'}),
        ])
    
    def test_functionLocals(self):
        instruction = translator.FunctionInstruction(name='Test', locals='3')
        self.assertInstructionList(instruction.tree, [
            SKIP, SKIP, SKIP,
            (translator.PushConstantInstruction, {'val': 0}),
            (translator.PushConstantInstruction, {'val': 0}),
            (translator.PushConstantInstruction, {'val': 0}),
        ])

    def test_buildCallStack(self):
        instruction = translator.BuildCallStack(args=0)
        self.assertInstructionList(instruction.tree, [
            (translator.MoveInstruction, {'src': {'reg': 'LCL'}, 'dest': {'ptr': 'SP', 'offset': 0}}),
            (translator.MoveInstruction, {'src': {'reg': 'ARG'}, 'dest': {'ptr': 'SP', 'offset': 1}}),
            (translator.MoveInstruction, {'src': {'reg': 'THIS'}, 'dest': {'ptr': 'SP', 'offset': 2}}),
            (translator.MoveInstruction, {'src': {'reg': 'THAT'}, 'dest': {'ptr': 'SP', 'offset': 3}}),
            (translator.ASM, {'address': 'SP', 'store': 'D', 'comp': 'M'}),
            (translator.ASM, {'address': '4', 'store': 'D', 'comp': 'D+A'}),
            (translator.ASM, {'address': 'SP', 'store': 'M', 'comp': 'D'}),
            (translator.ASM, {'address': '5', 'store': 'D', 'comp': 'D-A'}),
            (translator.ASM, {'address': 'ARG', 'store': 'M', 'comp': 'D'}),
        ])
    
    def test_buildCallStackWithArgs(self):
        instruction = translator.BuildCallStack(args=3)
        self.assertEqual(instruction.tree[7].address, '8')

    def test_clearArgs(self):
        instruction = translator.ClearArgsInstruction(args=3)
        self.assertInstructionList(instruction.tree, [
            (translator.PopRegisterInstruction, {'reg': translator.DATA_ADDRESS}),
            (translator.ASM, {'address': 'SP', 'store': 'D', 'comp': 'M'}),
            (translator.ASM, {'address': '3', 'store': 'D', 'comp': 'D-A'}),
            (translator.ASM, {'address': 'SP', 'store': 'M', 'comp': 'D'}),
            (translator.PushRegisterInstruction, {'reg': translator.DATA_ADDRESS}),
        ])

    def test_popFrame(self):
        instruction = translator.PopFrameInstruction()
        self.assertInstructionList(instruction.tree, [
            (translator.MoveInstruction, {'src': {'ptr': translator.FRAME_ADDRESS, 'offset': -1}, 'dest': {'reg': 'THAT'}}),
            (translator.MoveInstruction, {'src': {'ptr': translator.FRAME_ADDRESS, 'offset': -2}, 'dest': {'reg': 'THIS'}}),
            (translator.MoveInstruction, {'src': {'ptr': translator.FRAME_ADDRESS, 'offset': -3}, 'dest': {'reg': 'ARG'}}),
            (translator.MoveInstruction, {'src': {'ptr': translator.FRAME_ADDRESS, 'offset': -4}, 'dest': {'reg': 'LCL'}}),
        ])
    
    def test_callInstruction(self):
        instruction = translator.CallInstruction(args=2, name='Test')
        self.assertInstructionList(instruction.tree, [
            (translator.PushConstantInstruction, {'val': 'Test_return_1'}),
            (translator.BuildCallStack, {'args': 2}),
            (translator.GotoInstruction, {'label': 'Test'}),
            SKIP,
            (translator.ClearArgsInstruction, {'args': 2})
        ])
        self.assertIsInstance(instruction.tree[3], assembler.LInstruction)
        self.assertEqual(instruction.tree[3].value, 'Test_return_1')

    def test_returnInstruction(self):
        instruction = translator.ReturnInstruction()
        self.assertInstructionList(instruction.tree, [
            (translator.MoveInstruction, {'src': {'reg': 'LCL'}, 'dest': {'reg': translator.FRAME_ADDRESS}}),
            (translator.MoveInstruction, {'src': {'ptr': translator.FRAME_ADDRESS, 'offset': -5}, 'dest': {'reg': translator.JUMP_ADDRESS}}),
            (translator.MoveInstruction, {'src': {'ptr': 'SP', 'offset': -1}, 'dest': {'ptr': 'ARG'}}),
            (translator.MoveInstruction, {'src': {'reg': 'ARG'}, 'dest': {'reg': translator.SP_ADDRESS}}),
            (translator.PopFrameInstruction, {}),
            (translator.ReadInstruction, {'src': {'reg': translator.SP_ADDRESS}}),
            (translator.ASM, {'address': 'SP', 'store': 'M', 'comp': 'D+1'}),
            (translator.GotoInstruction, {'label': translator.JUMP_ADDRESS, 'indirect': True}),
        ])

if __name__ == '__main__':
    unittest.main()
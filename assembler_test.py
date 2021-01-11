import unittest

import assembler

class TestAInstruction(unittest.TestCase):
    def test_literal(self):
        token = '@12345'
        instruction = assembler.AInstruction(token)
        self.assertEqual(instruction.value, '12345')
        self.assertTrue(instruction.isLiteral)

    def test_non_literal(self):
        token = '@SCREEN'
        instruction = assembler.AInstruction(token)
        self.assertEqual(instruction.value, 'SCREEN')
        self.assertFalse(instruction.isLiteral)
    
    def test_writes_assembly(self):
        token = '@12'
        instruction = assembler.AInstruction(token)
        assembly = instruction.write({})
        self.assertEqual(assembly, '0000000000001100')

    def test_gets_registers(self):
        table = assembler.Table()
        token = '@foo'
        instruction = assembler.AInstruction(token)
        instruction.fillTable(table, 0)
        self.assertEqual(table.get('foo'), 0x0010)

class TestLInstruction(unittest.TestCase):
    def test_gets_location(self):
        token = "(LOOP)"
        instruction = assembler.LInstruction(token)
        table = assembler.Table()
        instruction.fillTable(table, 12)
        self.assertEqual(table.get('LOOP'), 12)

class TestCInstruction(unittest.TestCase):
    def test_comp(self):
        token = '0'
        instruction = assembler.CInstruction(token)
        assembly = instruction.write({})
        self.assertEqual(instruction.mMode, False)
        self.assertEqual(instruction.dest, '')
        self.assertEqual(instruction.comp, '0')
        self.assertEqual(instruction.jump, '')
        self.assertEqual(assembly, '111_0_101010_000_000')

    def test_dest_comp(self):
        token = 'D=M'
        instruction = assembler.CInstruction(token)
        assembly = instruction.write({})
        self.assertEqual(instruction.mMode, True)
        self.assertEqual(instruction.dest, 'D')
        self.assertEqual(instruction.comp, 'M')
        self.assertEqual(instruction.jump, '')
        self.assertEqual(assembly, '111_1_110000_010_000')

    def test_dest_comp_jump(self):
        token = 'D=D-1;JNE'
        instruction = assembler.CInstruction(token)
        assembly = instruction.write({})
        self.assertEqual(instruction.mMode, False)
        self.assertEqual(instruction.dest, 'D')
        self.assertEqual(instruction.comp, 'D-1')
        self.assertEqual(instruction.jump, 'JNE')
        self.assertEqual(assembly, '111_0_001110_010_101')

    def test_comp_jump(self):
        token = '0;JMP'
        instruction = assembler.CInstruction(token)
        assembly = instruction.write({})
        self.assertEqual(instruction.mMode, False)
        self.assertEqual(instruction.dest, '')
        self.assertEqual(instruction.comp, '0')
        self.assertEqual(instruction.jump, 'JMP')
        self.assertEqual(assembly, '111_0_101010_000_111')

    def test_multiple_assign(self):
        token = 'MD=M-1'
        instruction = assembler.CInstruction(token)
        assembly = instruction.write({})
        self.assertEqual(instruction.mMode, True)
        self.assertEqual(instruction.dest, 'MD')
        self.assertEqual(instruction.comp, 'M-1')
        self.assertEqual(instruction.jump, '')
        self.assertEqual(assembly, '111_1_110010_011_000')

if __name__ == '__main__':
    unittest.main()
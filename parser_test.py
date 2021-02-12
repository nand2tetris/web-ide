import unittest

class ParserTestCase(unittest.TestCase):
    def assertInstruction(self, instruction, Instruction, **kwargs):
        self.assertIsInstance(instruction, Instruction)
        for arg in kwargs:
            self.assertEqual(instruction.kwargs[arg], kwargs[arg])
    
    def assertInstructionList(self, actual, expected):
        self.assertEqual(len(actual), len(expected))
        for (instruction, (Instruction, kwargs, *tree)) in zip(actual, expected):
            if Instruction == None:
                pass
            else:
                self.assertInstruction(instruction, Instruction, **kwargs)
                if tree:
                    self.assertInstructionList(instruction.tree, tree[0])

# Use this to skip an instruction in the instruction list
SKIP = (None, (None, None))

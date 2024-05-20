const vm = `Vm <: Base {
  Root := Vm

  Vm = newline* VmInstructionLine* VmInstruction?

  space := comment | " " | "\t"
  whitespace = lineComment | comment | space

  VmInstructionLine = VmInstruction newline+
  VmInstruction =
    | StackInstruction
    | OpInstruction
    | FunctionInstruction
    | CallInstruction
    | ReturnInstruction
    | GotoInstruction
    | LabelInstruction
  
  StackInstruction = (push | pop) MemorySegment Number
  OpInstruction = Add | Sub | Neg | Lt | Gt | Eq | And | Or | Not
  FunctionInstruction = function Name Number 
  CallInstruction =  call Name Number
  ReturnInstruction = return
  LabelInstruction = label Name
  GotoInstruction = (goto | ifGoto) Name

  MemorySegment = argument | local | static | constant | this | that | pointer | temp

  push = "push" whitespace+
  pop = "pop" whitespace+
  function = "function" whitespace+
  call = "call" whitespace+
  return = "return"
  goto = "goto" whitespace+
  ifGoto = "if-goto" whitespace+
  label = "label" whitespace+

  argument = "argument" whitespace+
  local = "local" whitespace+
  static = "static" whitespace+
  constant = "constant" whitespace+
  this = "this" whitespace+
  that = "that" whitespace+
  pointer = "pointer" whitespace+
  temp = "temp" whitespace+

  Add = "add" 
  Sub = "sub" 
  Neg = "neg" 
  Eq = "eq"
  Lt = "lt" 
  Gt = "gt" 
  And = "and" 
  Or = "or" 
  Not = "not"
}`;
export default vm;

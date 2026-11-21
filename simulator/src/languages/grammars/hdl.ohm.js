const hdl = `
Hdl <: Base{
  Root := Chip
  identifier := ~keyword letter alnum*
  keyword = ("CHIP" | "IN" | "OUT" | "PARTS" | "BUILTIN" | "CLOCKED") ~alnum
  Name := identifier
  Chip = ChipOpen ChipBody ChipClose  -- closed
       | ChipOpen "PARTS:" PartEntry* ! UnclosedEnd  -- unclosed
  ChipOpen = ChipStart ! &PartsStart
  // Repeats the lookahead of Parts so that the unclosed and closed
  // alternatives list the same expected tokens in the same order in strict mode.
  UnclosedEnd = &("CLOCKED" | CloseBrace) CloseBrace
  ChipStart = ("CHIP" Name) ! OpenBrace ChipPins
  ChipPins = InList? OutList?
  PartsStart = "BUILTIN" | "PARTS:"
  ChipBody = PartList ClockedList?
  ChipClose = CloseBrace ! end
  InList = ("IN" PinList) ! Semi
  OutList = ("OUT" PinList) ! Semi
  PartList = BuiltinPart | Parts
  PinList = NonemptyListOf<PinDecl, Comma>
  PinDecl = PinName PinWidth?
  PinName (a pin name) = identifier
  PinWidth = OpenSquare decNumber CloseSquare
  BuiltinPart = "BUILTIN" Name? Semi
  Parts = "PARTS:" PartEntry* ! &("CLOCKED" | CloseBrace)
  PartEntry = Part | BuiltinPart
  Part = (Name "(" Wires ")") ! Semi
  Wires = List<Wire, Comma>
  Wire = WireSide Equal (WireSide | True | False) 
  WireSide = PinName SubBus?
  SubBus = OpenSquare decNumber subBusRest? CloseSquare
  subBusRest = ".." decNumber
  ClockedList = ("CLOCKED" SimplePinList) ! Semi
  SimplePinList = NonemptyListOf<PinName, Comma>
}`;
export default hdl;

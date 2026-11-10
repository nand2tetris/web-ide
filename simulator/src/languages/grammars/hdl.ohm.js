const hdl = `
Hdl <: Base{
  Root := Chip
  identifier := (letter) (alnum)*
  Name := identifier
  Chip = ChipOpen ChipBody ChipClose  -- closed
       | ChipOpen "PARTS:" PartEntry* ! UnclosedEnd  -- unclosed
  ChipOpen = ChipStart ! &PartsStart
  // Repeats the lookahead of Parts so a strict failure lists its expected
  // text in the same order as before this alternative existed.
  UnclosedEnd = &("CLOCKED" | CloseBrace) CloseBrace
  ChipStart = ("CHIP" Name) ! OpenBrace ChipPins
  ChipPins = InList? OutList?
  PartsStart = "BUILTIN" | "PARTS:"
  ChipBody = PartList ClockedList?
  ChipClose = CloseBrace ! end
  InList = ("IN" PinList) ! Semi
  OutList = ("OUT" PinList) ! Semi
  PartList = BuiltinPart | Parts
  PinList = List<PinDecl, Comma>
  PinDecl = Name PinWidth?
  PinWidth = OpenSquare decNumber CloseSquare
  BuiltinPart = "BUILTIN" Name? Semi
  Parts = "PARTS:" PartEntry* ! &("CLOCKED" | CloseBrace)
  PartEntry = Part | BuiltinPart
  Part = (Name "(" Wires ")") ! Semi
  Wires = List<Wire, Comma>
  Wire = WireSide Equal (WireSide | True | False) 
  WireSide = Name SubBus? 
  SubBus = OpenSquare decNumber subBusRest? CloseSquare
  subBusRest = ".." decNumber
  ClockedList = ("CLOCKED" SimplePinList) ! Semi
  SimplePinList = List<Name, Comma>
}`;
export default hdl;

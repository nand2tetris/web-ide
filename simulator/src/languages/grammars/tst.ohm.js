const tst = `
Tst <: Base {
  Root := Tst
  Tst = (TstStatement | TstRepeat | TstWhile)+

  TstRepeat = Repeat Number? OpenBrace TstCommand+ CloseBrace
  TstWhile = While Condition OpenBrace TstCommand+ CloseBrace
  TstStatement = TstCommand

  TstCommand = TstOperation Separator
  Separator = (Semi | Bang | Comma)

  TstOperation =
    | TstFileOperation
    | TstOutputListOperation
    | TstEvalOperation
    | TstSetOperation
    | TstOutputOperation
    | TstEchoOperation
    | TstClearEchoOperation
    | TstLoadROMOperation
    | TstResetRAMOperation

  TstLoadROMOperation = ROM32K Load FileName
  TstFileOperation = FileOperation FileName?
  TstOutputListOperation = "output-list" OutputFormat+
  OutputFormat = Name Index? FormatSpec?
  FormatSpec = percent FormatStyle wholeDec dot wholeDec dot wholeDec
  TstSetOperation = Set Name Index? Number
  Index = OpenSquare wholeDec? CloseSquare
  Condition = Value CompareOp Value
  TstEvalOperation = Eval | TickTock | Tick | Tock | VmStep
  TstOutputOperation = Output
  TstEchoOperation = Echo String
  TstClearEchoOperation = ClearEcho
  TstResetRAMOperation = ResetRAM

  filename = (alnum|underscore|dot|dollar|minus)+
  FileName = filename
  FileOperation = "load" | "output-file" | "compare-to"

  Set = "set"
  Eval = "eval"
  Tick = "tick"
  Tock = "tock"
  TickTock = "ticktock"
  VmStep = "vmstep"
  Echo = "echo"
  Repeat = "repeat"
  ClearEcho = "clear-echo"
  Output = "output"
  OutputList = "output-list"
  FormatStyle = "B"|"D"|"S"|"X"
  ROM32K = "ROM32K"
  Load = "load"
  While = "while"
  ResetRAM = "resetRam"

  CompareOp = "<>" | "<=" | ">=" | "=" | "<" | ">"
}`;
export default tst;

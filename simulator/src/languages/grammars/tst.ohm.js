const tst = `
Tst <: Base {
  Root := Tst
  Tst = (TstStatement | TstRepeat | TstWhile)+

  TstRepeat = Repeat Number? OpenBrace TstStatement+ CloseBrace
  TstWhile = While Condition OpenBrace TstStatement+ CloseBrace
  TstStatement = List<TstOperation, ","> (Semi | Bang)

  TstOperation =
    | TstFileOperation
    | TstOutputListOperation
    | TstEvalOperation
    | TstSetOperation
    | TstOutputOperation
    | TstEchoOperation
    | TstClearEchoOperation
    | TstLoadROMOperation

  TstLoadROMOperation = ROM32K Load FileName
  TstFileOperation = FileOperation FileName
  TstOutputListOperation = "output-list" OutputFormat+
  OutputFormat = Name Index? percent FormatStyle wholeDec dot wholeDec dot wholeDec
  TstSetOperation = Set Name Index? Number
  Index = OpenSquare wholeDec? CloseSquare
  Condition = Value CompareOp Value
  TstEvalOperation = Eval | Tick | Tock | TickTock
  TstOutputOperation = Output
  TstEchoOperation = Echo String
  TstClearEchoOperation = ClearEcho

  FileName = Name
  FileOperation = "load" | "output-file" | "compare-to"

  Set = "set"
  Eval = "eval"
  Tick = "tick"
  Tock = "tock"
  TickTock = "ticktock"
  Echo = "echo"
  Repeat = "repeat"
  ClearEcho = "clear-echo"
  Output = "output"
  OutputList = "output-list"
  FormatStyle = "B"|"D"|"S"|"X"
  ROM32K = "ROM32K"
  Load = "load"
  While = "while"

  CompareOp = "<>" | "<=" | ">=" | "=" | "<" | ">"
}`;
export default tst;

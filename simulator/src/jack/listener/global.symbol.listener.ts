import {
  ClassDeclarationContext,
  SubroutineDeclarationContext,
  VarNameInDeclarationContext,
} from "../generated/JackParser.js";
import {
  ruleContextToSpan,
  DuplicatedClassError,
  DuplicatedSubroutineError,
  JackCompilerError,
} from "../error.js";
import {
  GenericSymbol,
  GlobalSymbolTable,
  SubroutineInfo,
  SubroutineType,
} from "../symbol.js";
import { builtInSymbols } from "../builtins.js";
import { JackParserListener } from "../generated/JackParserListener.js";

/**
 * Creates global symbol table that contains built-in functions and found classes and subroutines
 */
export class GlobalSymbolTableListener extends JackParserListener {
  // key can be class or <class>.<subroutine_name>
  public globalSymbolTable: GlobalSymbolTable = structuredClone(builtInSymbols);
  public className = "";
  public errors: JackCompilerError[] = [];
  private subRoutineInfo: SubroutineInfo = {} as SubroutineInfo;
  private subroutineVarsCount = 0;
  private stopProcessingSubroutines = false;
  private subroutineId = "";
  public filename = "";
  override enterClassDeclaration = (ctx: ClassDeclarationContext) => {
    const classNameCtx = ctx.className();
    const id = classNameCtx.IDENTIFIER();
    const className = id.getText();
    if (this.globalSymbolTable[className] != undefined) {
      if (classNameCtx.stop == null || classNameCtx.stop?.stop == null)
        throw new Error("Stop token should not be null");
      if (classNameCtx.start == null) {
        throw new Error("Start token should not be null");
      }
      const e = DuplicatedClassError(
        ruleContextToSpan(classNameCtx),
        className,
      );
      this.errors.push(e);
      return;
    }
    this.globalSymbolTable[className] = {
      filename: this.filename,
      start: { line: id.symbol.line, character: id.symbol.column },
      end: {
        line: id.symbol.line,
        character: id.symbol.column + id.getText().length,
      },
    } as GenericSymbol;
    this.className = className;
  };

  override enterSubroutineDeclaration = (ctx: SubroutineDeclarationContext) => {
    let subroutineType: SubroutineType;
    if (ctx.subroutineType().CONSTRUCTOR() != null) {
      subroutineType = SubroutineType.Constructor;
    } else if (ctx.subroutineType().METHOD() != null) {
      subroutineType = SubroutineType.Method;
    } else if (ctx.subroutineType().FUNCTION() != null) {
      subroutineType = SubroutineType.Function;
    } else {
      throw new Error("Invalid subroutine type");
    }
    const subroutineWithoutTypeCtx = ctx.subroutineDecWithoutType();
    const nameCtx = subroutineWithoutTypeCtx.subroutineName();
    const subroutineName = nameCtx.IDENTIFIER().getText();
    const id = this.className + "." + subroutineName;
    if (this.globalSymbolTable[id] != undefined) {
      if (nameCtx.start == null) {
        throw new Error("Start token should not be null");
      }
      this.errors.push(
        DuplicatedSubroutineError(ruleContextToSpan(nameCtx), subroutineName),
      );
      this.stopProcessingSubroutines = true;
    } else {
      this.subroutineId = id;
      const params = subroutineWithoutTypeCtx.parameterList().parameter();
      this.subRoutineInfo = {
        type: subroutineType,
        paramsCount: params.length,
      };
      this.subroutineVarsCount = 0;
      this.stopProcessingSubroutines = false;
    }
  };
  override enterVarNameInDeclaration = (_ctx: VarNameInDeclarationContext) => {
    if (this.stopProcessingSubroutines) return;
    this.subroutineVarsCount++;
  };
  override exitSubroutineDeclaration = (_ctx: SubroutineDeclarationContext) => {
    if (this.stopProcessingSubroutines) return;
    this.subRoutineInfo.localVarsCount = this.subroutineVarsCount;
    this.globalSymbolTable[this.subroutineId] = {
      subroutineInfo: this.subRoutineInfo,
    };
  };
}

import {
  ClassDeclarationContext,
  SubroutineBodyContext,
  SubroutineDeclarationContext,
  VarNameInDeclarationContext,
} from "../generated/JackParser.js";
import { asSpan, DuplicatedClassError, DuplicatedSubroutineError, JackCompilerError } from "../error.js";
import { builtInSymbols, builtInTypes } from "../builtins.js";
import {
  GenericSymbol,
  GlobalSymbolTable,
  SubroutineInfo,
  SubroutineType,
} from "../symbol.js";
import JackParserListener from "../generated/JackParserListener.js";
import { assertExists } from "@davidsouther/jiffies/lib/esm/assert.js";

const primitives = new Set(builtInTypes);
export type Primitive = typeof primitives extends Set<infer S> ? S : never;
/**
 * Creates global symbol table that contains built-in functions and found classes and subroutines
 */
export class JackGlobalSymbolTableListener extends JackParserListener {
  // key can be class or <class>.<subroutine_name>
  public globalSymbolTable: GlobalSymbolTable = structuredClone(builtInSymbols);
  public className = "";
  public errors: JackCompilerError[] = [];
  private subRoutineInfo: SubroutineInfo = {} as SubroutineInfo;
  private subroutineVarsCount = 0;
  private stopProcessingSubroutines = false;
  private subroutineId = "";

  override enterClassDeclaration = (ctx: ClassDeclarationContext) => {
    const classNameCtx = ctx.className();
    const id = classNameCtx.IDENTIFIER();
    const className = id.getText();
    if (this.globalSymbolTable[className] != undefined) {
      //TODO: RL check on UI
       const e = DuplicatedClassError(
        asSpan(ctxClassName.start, ctxClassName.stop), className
      );
      this.errors.push(e);
      return;
    }
    this.globalSymbolTable[className] = {} as GenericSymbol;
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
      this.errors.push(
        DuplicatedSubroutineError(
          {
          line: nameCtx.IDENTIFIER().symbol.line,
          start: nameCtx.start.start,
          end: nameCtx.start.stop,
      },
          subroutineName,
        ),
      );
      this.stopProcessingSubroutines = true;
    } else {
      this.subroutineId = id;
      const paramsCount = subroutineWithoutTypeCtx
        .parameterList()
        .parameter_list().length;
      this.subRoutineInfo = {
        type: subroutineType,
        paramsCount: paramsCount,
      };
      this.subroutineVarsCount = 0;
      this.stopProcessingSubroutines = false;
    }
  };
  override enterVarNameInDeclaration = (ctx: VarNameInDeclarationContext) => {
    if (this.stopProcessingSubroutines) return;
    this.subroutineVarsCount++;
  };
  override exitSubroutineBody = (ctx: SubroutineBodyContext) => {
    if (this.stopProcessingSubroutines) return;
    this.subRoutineInfo.localVarsCount = this.subroutineVarsCount;
    this.globalSymbolTable[this.subroutineId] = {
      subroutineInfo: this.subRoutineInfo,
    };
  };
}

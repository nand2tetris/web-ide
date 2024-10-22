import { JackParserListener } from "../generated/JackParserListener.js";
import {
  ArrayAccessContext,
  ClassDeclarationContext,
  ConstantContext,
  ExpressionContext,
  IfElseStatementContext,
  IfExpressionContext,
  IfStatementContext,
  LetStatementContext,
  ReturnStatementContext,
  SubroutineCallContext,
  SubroutineDeclarationContext,
  WhileExpressionContext,
  WhileStatementContext,
} from "../generated/JackParser.js";
import {
  GenericSymbol,
  LocalSymbolTable,
  scopeTypeToString,
  VariableSymbol,
} from "../symbol.js";
import { CallType, getCallType } from "./common.js";
import { assertExists } from "@davidsouther/jiffies/lib/esm/assert.js";

const binaryOperationToVmCmd: Record<string, string> = {
  "+": "add",
  "-": "sub",
  "*": "call Math.multiply 2",
  "/": "call Math.divide 2",
  "&": "and",
  "|": "or",
  "<": "lt",
  ">": "gt",
  "=": "eq",
};

const unaryOperationToVmCmd: Record<string, string> = {
  "-": "neg",
  "~": "not",
};
/**
 * Transforms parse tree into VM code
 */
export class VMWriter extends JackParserListener {
  public result = "";
  private className = "";
  private currentLabelInd = 0;
  private _localSymbolTable: LocalSymbolTable | undefined;
  private afterEquals = false;
  constructor(private globalSymbolTable: Record<string, GenericSymbol>) {
    super();
  }

  override enterClassDeclaration = (ctx: ClassDeclarationContext) => {
    if (this.className != "") {
      throw new Error("Cannot change class name");
    }
    if (ctx.localSymbolTable == undefined) {
      throw new Error("Local symbol table not found in parse tree");
    }
    if (ctx.className() == null) {
      throw new Error("Class name not found in parse tree");
    }
    this.className = ctx.className().getText();
    this._localSymbolTable = ctx.localSymbolTable;
  };
  get localSymbolTable() {
    if (this._localSymbolTable == null)
      throw new Error("Local symbol table is not initialized");
    return this._localSymbolTable;
  }

  override enterSubroutineDeclaration = (ctx: SubroutineDeclarationContext) => {
    const name = ctx
      .subroutineDecWithoutType()
      .subroutineName()
      .IDENTIFIER()
      .getText();
    const symbol = this.globalSymbolTable[this.className + "." + name];
    if (symbol == undefined) {
      throw new Error(
        `Can't find subroutine ${name} in class ${this.className} in symbol table`,
      );
    }
    if (symbol.subroutineInfo == null) {
      throw new Error(
        `Subroutine info not found for subroutine ${name} in class ${this.className}`,
      );
    }
    this.result += `function ${this.className}.${name} ${symbol.subroutineInfo.localVarsCount}\n`;

    if (ctx.subroutineType().CONSTRUCTOR() != null) {
      this.result += `    push constant ${this.localSymbolTable.fieldsCount()}\n`;
      this.result += "    call Memory.alloc 1\n";
      this.result += "    pop pointer 0\n";
    } else if (ctx.subroutineType().METHOD() != null) {
      this.result += "    push argument 0\n";
      this.result += "    pop pointer 0\n";
    }

    if (ctx.symbols == null) {
      throw new Error("Subroutine symbols not found in parse tree");
    }
    this.localSymbolTable.setSubroutineScope(ctx.symbols);
  };
  override exitArrayAccess = (ctx: ArrayAccessContext) => {
    const varName = ctx.varName().IDENTIFIER().getText();
    const symbol = this.localSymbolTable.lookup(varName);
    if (symbol == undefined) {
      throw new Error(`Can't find variable ${varName} in local symbol table`);
    }
    this.pushSymbolOntoStack(symbol);
    this.result += `    add\n`;
    if (this.afterEquals || ctx.parent instanceof ExpressionContext) {
      this.result += `    pop pointer 1\n`;
      this.result += `    push that 0\n`;
    }
  };
  override enterEquals = () => {
    this.afterEquals = true;
  };
  override exitStatement = () => {
    this.afterEquals = false;
  };
  override enterConstant = (ctx: ConstantContext) => {
    if (ctx.INTEGER_LITERAL() != null) {
      this.result += `    push constant ${ctx.INTEGER_LITERAL()?.getText()}\n`;
    } else if (ctx.booleanLiteral() != null) {
      if (ctx.booleanLiteral()?.FALSE() != null) {
        this.result += `    push constant 0\n`;
      } else if (ctx.booleanLiteral()?.TRUE()) {
        this.result += `    push constant 1\n`;
        this.result += `    neg\n`;
      } else {
        throw new Error("Unknown boolean literal");
      }
    } else if (ctx.THIS_LITERAL() != null) {
      this.result += `    push pointer 0\n`;
    } else if (ctx.STRING_LITERAL() != null) {
      const maybeStr = ctx
        .STRING_LITERAL()
        ?.getText()
        //cutoff ""
        .slice(1, -1);
      const str = assertExists(maybeStr, "String literal cannot be null");
      this.result += `    push constant ${str.length}\n`;
      this.result += `    call String.new 1\n`;
      for (const char of str) {
        this.result += `    push constant ${char.charCodeAt(0)}\n`;
        this.result += "    call String.appendChar 2\n";
      }
    } else if (ctx.NULL_LITERAL() != null) {
      this.result += `    push constant 0\n`;
    } else {
      throw new Error("Unknown constant type");
    }
  };
  override exitExpression = (ctx: ExpressionContext) => {
    if (ctx.varName() != null) {
      const varNameCtx = assertExists(
        ctx.varName(),
        "Variable name cannot be null",
      );
      const varName = varNameCtx.IDENTIFIER().getText();
      const symbol = this.localSymbolTable.lookup(varName);
      if (symbol == undefined) {
        throw new Error(
          `Cannot find variable ${varName} in arguments or local variables`,
        );
      }
      this.pushSymbolOntoStack(symbol);
    } else if (ctx.binaryOperator() != null) {
      const binaryOp = assertExists(
        ctx.binaryOperator(),
        "Binary operator cannot be null",
      ).getText();
      if (binaryOperationToVmCmd[binaryOp] == undefined) {
        throw new Error(`Unknown binary operator ${binaryOp}`);
      }
      this.result += "    " + binaryOperationToVmCmd[binaryOp] + "\n";
    } else if (ctx.unaryOperation() != null) {
      const unaryOp = assertExists(
        ctx.unaryOperation()?.unaryOperator(),
        "Unary operation cannot be null",
      ).getText();
      if (unaryOperationToVmCmd[unaryOp] == null) {
        throw new Error(`Unknown unary operator ${unaryOp}`);
      }
      this.result += "    " + unaryOperationToVmCmd[unaryOp] + "\n";
    }
  };
  pushSymbolOntoStack(symbol: VariableSymbol) {
    this.result += `    push ${scopeTypeToString(symbol.scope)} ${symbol.index}\n`;
  }
  override exitLetStatement = (ctx: LetStatementContext) => {
    if (ctx.varName() != null) {
      const varNameCtx = assertExists(ctx.varName(), "Var name cannot be null");
      const symbol = this.localSymbolTable.lookup(
        varNameCtx.IDENTIFIER().getText(),
      );
      if (symbol == undefined) {
        throw new Error(
          `Can't find variable ${ctx.varName()?.IDENTIFIER().getText()} in local symbol table`,
        );
      }
      this.result += `    pop ${scopeTypeToString(symbol.scope)} ${symbol.index}\n`;
    } else if (ctx.arrayAccess() != null) {
      this.result += "pop temp 0\n";
      this.result += "pop pointer 1\n";
      this.result += "push temp 0\n";
      this.result += "pop that 0\n";
    } else {
      throw new Error(`Unknown let statement type`);
    }
  };
  //if else
  override enterIfStatement = (ctx: IfStatementContext) => {
    ctx.endLabel = this.createLabel();
  };
  override exitIfStatement = (ctx: IfStatementContext) => {
    const parent = ctx.parent as IfElseStatementContext;
    if (parent.elseStatement() != null) {
      parent.endLabel = this.createLabel();
      this.result += `    goto ${parent.endLabel}\n`;
    }
    this.result += `label ${ctx.endLabel} \n`;
  };
  override exitIfExpression = (ctx: IfExpressionContext) => {
    const parent = ctx.parent as IfStatementContext;
    this.ifNotGoto(parent.endLabel);
  };
  override exitIfElseStatement = (ctx: IfElseStatementContext) => {
    if (ctx.endLabel) {
      this.result += `label ${ctx.endLabel}\n`;
    }
  };
  //while
  override enterWhileStatement = (ctx: WhileStatementContext) => {
    ctx.startLabel = this.createLabel();
    ctx.endLabel = this.createLabel();
    this.result += `label ${ctx.startLabel}\n`;
  };
  override exitWhileExpression = (ctx: WhileExpressionContext) => {
    const parent = ctx.parent as WhileStatementContext;
    this.ifNotGoto(parent.endLabel);
  };

  override exitWhileStatement = (ctx: WhileStatementContext) => {
    this.result += `    goto ${ctx.startLabel}\n`;
    this.result += `label ${ctx.endLabel}\n`;
  };

  override enterSubroutineCall = (ctx: SubroutineCallContext) => {
    const { callType, symbol } = getCallType(
      ctx.subroutineId(),
      this.className,
      this.localSymbolTable,
    );
    if (callType === CallType.VarMethod) {
      if (symbol == null)
        throw new Error("Symbol not found when calling a method");
      this.pushSymbolOntoStack(symbol);
    } else if (callType === CallType.LocalMethod) {
      this.result += `    push pointer 0\n`;
    }
  };
  //do
  override exitSubroutineCall = (ctx: SubroutineCallContext) => {
    //method call
    const { callType, subroutineIdText } = getCallType(
      ctx.subroutineId(),
      this.className,
      this.localSymbolTable,
    );
    switch (callType) {
      case CallType.ClassFunctionOrConstructor: {
        const argsCount = ctx.expressionList().expression().length;
        this.result += `    call ${ctx.subroutineId().getText()} ${argsCount}\n`;
        break;
      }
      case CallType.LocalMethod:
      case CallType.VarMethod: {
        const expressionsCount = ctx.expressionList().expression().length;
        this.result += `    call ${subroutineIdText} ${expressionsCount + 1}\n`;
        break;
      }
      default:
        throw new Error(`Unknown call type ${callType}`);
    }
  };
  //return
  override exitReturnStatement = (ctx: ReturnStatementContext) => {
    if (ctx.expression() == null) {
      this.result += "    push constant 0\n";
    }
    this.result += "    return\n";
  };
  //Utils
  ifNotGoto(endLabel: string) { 
    this.result += "    not\n";
    this.result += `    if-goto ${endLabel}\n`;
  }
  getLabel(ind: number) {
    return `${this.className}_${ind} `;
  }

  createLabel() {
    return this.getLabel(this.currentLabelInd++);
  }
}

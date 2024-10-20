import { TerminalNode } from "antlr4ng";
import { builtInTypes, intRange } from "../builtins";
import {
  ConstructorMushReturnThisError,
  DuplicatedVariableError,
  FieldCantBeReferencedInFunctionError,
  FilenameDoesntMatchClassNameError,
  FunctionCalledAsMethodError,
  IncorrectConstructorReturnTypeError,
  IncorrectParamsNumberInSubroutineCallError,
  IntLiteralIsOutOfRangeError,
  JackCompilerError,
  MethodCalledAsFunctionError,
  NonVoidFunctionNoReturnError,
  ruleContextToSpan,
  SubroutineNotAllPathsReturnError,
  terminalNodeToSpan,
  ThisCantBeReferencedInFunctionError,
  UndeclaredVariableError,
  UnknownClassError,
  UnknownSubroutineCallError,
  UnreachableCodeError,
  VoidSubroutineReturnsValueError,
  WrongLiteralTypeError,
} from "../error";
import {
  ClassDeclarationContext,
  ClassVarDecContext,
  ConstantContext,
  ElseStatementContext,
  FieldNameContext,
  IfStatementContext,
  LetStatementContext,
  ParameterContext,
  RBraceContext,
  ReturnStatementContext,
  StatementContext,
  SubroutineCallContext,
  SubroutineDeclarationContext,
  SubroutineDecWithoutTypeContext,
  VarDeclarationContext,
  VarNameContext,
  VarNameInDeclarationContext,
  VarTypeContext,
  WhileStatementContext
} from "../generated/JackParser";
import { JackParserListener } from "../generated/JackParserListener";
import {
  GenericSymbol,
  LocalSymbolTable,
  ScopeType,
  SubroutineType,
} from "../symbol";
import { assertExists, CallType, getCallType } from "./common";
/**
 * Validates Jack file
 */
export class ValidatorListener extends JackParserListener {
  private localSymbolTable: LocalSymbolTable = new LocalSymbolTable();
  private subroutineShouldReturnVoidType = false;
  private controlFlowGraphNode: BinaryTreeNode = new BinaryTreeNode();
  private subroutineName = "";
  private className = "";
  private stopProcessingErrorsInThisScope = false;
  private subroutineType?: SubroutineType;
  constructor(
    private globalSymbolTable: Record<string, GenericSymbol>,
    private filename?: string,
    public errors: JackCompilerError[] = []
  ) {
    super();
  }

  override enterClassDeclaration = (ctx: ClassDeclarationContext) => {
    const className = ctx.className();
    const newName = className.getText();
    if (this.className != "") {
      throw new Error("Cannot change class name");
    }
    this.className = newName;
    if (this.filename != null && this.filename != this.className) {
      if (className.start == null) {
        throw new Error("Start token should not be null");
      }
      this.errors.push(
        FilenameDoesntMatchClassNameError(
          ruleContextToSpan(ctx.className()),
          this.filename,
          this.className
        )
      );
    }
    ctx.localSymbolTable = this.localSymbolTable;
  };

  override enterClassVarDec = (ctx: ClassVarDecContext) => {
    let scope: ScopeType;
    if (ctx.STATIC() != null) {
      scope = ScopeType.Static;
    } else if (ctx.FIELD() != null) {
      scope = ScopeType.This;
    } else {
      throw new Error("Unknown field modifier ");
    }
    const type = ctx.fieldList().varType().getText();
    ctx
      .fieldList()
      .fieldName()
      .forEach((field: FieldNameContext) => {
        this.localSymbolTableAdd(
          field.IDENTIFIER(),
          scope,
          field.getText(),
          type
        );
      });
  };
  override enterSubroutineDeclaration = (ctx: SubroutineDeclarationContext) => {
    if (ctx.subroutineType().CONSTRUCTOR() != null) {
      this.subroutineType = SubroutineType.Constructor;
      if (
        ctx.subroutineDecWithoutType().subroutineReturnType().getText() !==
        this.className
      ) {
        this.addError(
          IncorrectConstructorReturnTypeError(
            ruleContextToSpan(
              ctx.subroutineDecWithoutType().subroutineReturnType()
            )
          )
        );
      }
    } else if (ctx.subroutineType().FUNCTION() != null) {
      this.subroutineType = SubroutineType.Function;
    } else if (ctx.subroutineType().METHOD != null) {
      this.subroutineType = SubroutineType.Method;
    } else {
      throw new Error("Unknown subroutine type ");
    }
  };
  override enterSubroutineDecWithoutType = (
    ctx: SubroutineDecWithoutTypeContext
  ) => {
    const returnType = ctx.subroutineReturnType();
    this.subroutineShouldReturnVoidType = returnType.VOID() != null;
    this.controlFlowGraphNode = new BinaryTreeNode();
    this.subroutineName = ctx.subroutineName().getText();
  };

  override enterParameter = (ctx: ParameterContext) => {
    const name = ctx.parameterName().getText();
    if (this.localSymbolTable.lookup(name)) {
      this.addError(
        DuplicatedVariableError(ruleContextToSpan(ctx.parameterName()), name)
      );
    } else {
      this.localSymbolTable.defineArgument(
        name,
        ctx.varType().getText(),
        this.subroutineType == SubroutineType.Method
      );
    }
  };
  //Var
  override enterVarType = (ctx: VarTypeContext) => {
    const id = ctx.IDENTIFIER();
    if (id != null) {
      const type = id.getText() ?? "";
      if (this.globalSymbolTable[type] == null) {
        this.addError(UnknownClassError(terminalNodeToSpan(id), type));
      }
    }
  };

  override enterVarDeclaration = (ctx: VarDeclarationContext) => {
    const type = ctx.varType().getText();
    ctx
      .varNameInDeclaration()
      .forEach((nameCtx: VarNameInDeclarationContext) => {
        this.localSymbolTableAdd(
          nameCtx.IDENTIFIER(),
          ScopeType.Local,
          nameCtx.getText(),
          type
        );
      });
  };

  /**
   * Var name when doing some actions - do statement, let ... We have a different rule for a var name that is used in declaration
   */
  override enterVarName = (ctx: VarNameContext) => {
    const symbol = this.localSymbolTable.lookup(ctx.getText());
    if (symbol == undefined) {
      this.addError(
        UndeclaredVariableError(
          terminalNodeToSpan(ctx.IDENTIFIER()),
          ctx.getText()
        )
      );
    } else if (
      this.subroutineType == SubroutineType.Function &&
      symbol.scope == ScopeType.This
    ) {
      this.addError(
        FieldCantBeReferencedInFunctionError(
          terminalNodeToSpan(ctx.IDENTIFIER())
        )
      );
    }
  };

  override enterConstant = (ctx: ConstantContext) => {
    const thisLiteral = ctx.THIS_LITERAL();
    if (thisLiteral != null && this.subroutineType == SubroutineType.Function) {
      this.addError(
        ThisCantBeReferencedInFunctionError(terminalNodeToSpan(thisLiteral))
      );
    }
  };

  override enterStatement = (ctx: StatementContext) => {
    if (this.controlFlowGraphNode.returns == true) {
      this.addError(UnreachableCodeError(ruleContextToSpan(ctx)));
      this.stopProcessingErrorsInThisScope = true;
    }
  };
  override enterRBrace = (_ctx: RBraceContext) => {
    this.stopProcessingErrorsInThisScope = false;
  };
  /**
   * Control flow
   */
  override enterWhileStatement = (_ctx: WhileStatementContext) => {
    this.controlFlowGraphNode = this.controlFlowGraphNode.left =
      new BinaryTreeNode(this.controlFlowGraphNode);
  };

  override exitWhileStatement = (_ctx: WhileStatementContext) => {
    if (this.controlFlowGraphNode?.parent != null) {
      this.controlFlowGraphNode = this.controlFlowGraphNode.parent;
    }
  };
  override enterIfStatement = (_ctx: IfStatementContext) => {
    this.controlFlowGraphNode = this.controlFlowGraphNode.left =
      new BinaryTreeNode(this.controlFlowGraphNode);
  };
  override exitIfStatement = (_ctx: IfStatementContext) => {
    if (this.controlFlowGraphNode?.parent != null) {
      this.controlFlowGraphNode = this.controlFlowGraphNode.parent;
    }
  };
  override enterElseStatement = (_ctx: ElseStatementContext) => {
    this.controlFlowGraphNode = this.controlFlowGraphNode.right =
      new BinaryTreeNode(this.controlFlowGraphNode);
  };
  override exitElseStatement = (_ctx: ElseStatementContext) => {
    if (this.controlFlowGraphNode?.parent != null) {
      this.controlFlowGraphNode = this.controlFlowGraphNode.parent;
    }
  };
  override enterLetStatement = (ctx: LetStatementContext) => {
    const varName = ctx.varName()?.getText();
    const constCtx = ctx.expression()?.constant();
    //corresponding literal type check
    if (
      varName != null &&
      constCtx != null &&
      this.localSymbolTable.lookup(varName) &&
      constCtx.NULL_LITERAL() == null
    ) {
      const symbol = this.localSymbolTable.lookup(varName);
      if (symbol != null && literalTypes.indexOf(symbol.type) != -1) {
        let expectedLiteralType = symbol.type;
        if (expectedLiteralType === "char") {
          expectedLiteralType = "int";
        }
        const constantCtx = ctx.expression()?.constant();
        let actualType = "";
        if (constantCtx?.INTEGER_LITERAL() != null) {
          actualType = "int";
          const intLiteral = constantCtx?.INTEGER_LITERAL();
          const value = constantCtx?.INTEGER_LITERAL()?.getText();
          if (
            constCtx != null &&
            intLiteral != null &&
            value != null &&
            parseInt(value) > intRange.max
          ) {
            this.addError(
              IntLiteralIsOutOfRangeError(
                terminalNodeToSpan(intLiteral),
                parseInt(value),
                intRange.min,
                intRange.max
              )
            );
          }
        } else if (constCtx?.STRING_LITERAL() != null) {
          actualType = "String";
        } else if (constCtx?.booleanLiteral() != null) {
          actualType = "boolean";
        } else {
          throw new Error(`Unknown literal type ${expectedLiteralType}`);
        }
        if (actualType != expectedLiteralType) {
          this.addError(
            WrongLiteralTypeError(
              ruleContextToSpan(constantCtx ?? ctx),
              symbol.type,
              actualType
            )
          );
        }
      }
    }
    //int min value check
    const unaryOp = ctx.expression()?.unaryOperation();
    if (
      varName &&
      unaryOp != null &&
      unaryOp.unaryOperator().MINUS() !== null &&
      unaryOp.expression()?.constant() != null &&
      unaryOp.expression()?.constant()?.INTEGER_LITERAL() !== null
    ) {
      const value = parseInt(
        unaryOp.expression()?.constant()?.INTEGER_LITERAL()?.getText() ?? "0"
      );
      if (-value < intRange.min) {
        this.addError(
          IntLiteralIsOutOfRangeError(
            terminalNodeToSpan(
              assertExists(unaryOp.expression()?.constant()?.INTEGER_LITERAL())
            ),
            value,
            intRange.min,
            intRange.max
          )
        );
      }
    }
  };

  override enterSubroutineCall = (ctx: SubroutineCallContext) => {
    //check if variable exists with the name before dot
    const subroutineId = ctx.subroutineId();
    const { callType, subroutineIdText } = getCallType(
      subroutineId,
      this.className,
      this.localSymbolTable
    );

    const symbol = this.globalSymbolTable[subroutineIdText];
    if (symbol == undefined) {
      this.addError(
        UnknownSubroutineCallError(
          ruleContextToSpan(subroutineId.subroutineName()),
          subroutineId.subroutineName().getText(),
          subroutineId.className()?.getText()
        )
      );
    } else {
      //method called as a function
      if (
        symbol.subroutineInfo?.type == SubroutineType.Method &&
        callType == CallType.ClassFunctionOrConstructor
      ) {
        this.addError(
          MethodCalledAsFunctionError(
            ruleContextToSpan(subroutineId.subroutineName()),
            subroutineId.subroutineName().getText()
          )
        );
      }
      // function called as a method
      else if (
        symbol.subroutineInfo?.type == SubroutineType.Function &&
        callType == CallType.LocalMethod
      ) {
        this.addError(
          FunctionCalledAsMethodError(
            ruleContextToSpan(subroutineId.subroutineName()),
            subroutineId.subroutineName().getText()
          )
        );
      } else {
        //check parameter count
        const l = ctx.expressionList()?.expression().length;
        if (symbol.subroutineInfo?.paramsCount != l) {
          if (symbol.subroutineInfo == null)
            throw new Error("Subroutine info cannot be null");
          if (
            ctx.expressionList() != null &&
            ctx.expressionList().start != null
          ) {
            this.addError(
              IncorrectParamsNumberInSubroutineCallError(
                ruleContextToSpan(ctx.expressionList()),
                subroutineId.getText(),
                assertExists(symbol.subroutineInfo).paramsCount,
                l
              )
            );
          } else {
            const start = ctx.LPAREN().symbol;
            const stop = ctx.RPAREN().symbol;

            this.addError(
              IncorrectParamsNumberInSubroutineCallError(
                { line: start.line, start: start.start, end: stop.stop + 1 },
                subroutineId.getText(),
                symbol.subroutineInfo?.paramsCount ?? 0,
                l
              )
            );
          }
        }
      }
    }
  };
  override enterReturnStatement = (ctx: ReturnStatementContext) => {
    const returnsVoid = ctx.expression() == null;
    if (returnsVoid && !this.subroutineShouldReturnVoidType) {
      this.addError(NonVoidFunctionNoReturnError(ruleContextToSpan(ctx)));
    }
    if (!returnsVoid && this.subroutineShouldReturnVoidType) {
      this.addError(VoidSubroutineReturnsValueError(ruleContextToSpan(ctx)));
    }
    this.controlFlowGraphNode.returns = true;
    if (this.subroutineType == SubroutineType.Constructor) {
      if (
        returnsVoid ||
        (ctx.expression()?.expression().length ?? 0) > 1 ||
        ctx.expression()?.constant() == null ||
        ctx.expression()?.constant()?.THIS_LITERAL() == null
      ) {
        this.addError(ConstructorMushReturnThisError(ruleContextToSpan(ctx)));
      }
    }
  };

  override exitSubroutineDeclaration = (ctx: SubroutineDeclarationContext) => {
    if (!this.controlFlowGraphNode.returns) {
      this.addError(
        //TODO: add exact place that doesn't return
        SubroutineNotAllPathsReturnError(
          ruleContextToSpan(ctx.subroutineType()),
          this.subroutineName
        )
      );
    }
    this.subroutineType = undefined;
    ctx.symbols = this.localSymbolTable.popStack();
  };

  override exitClassDeclaration = (_ctx: ClassDeclarationContext) => {
    while (this.controlFlowGraphNode?.parent != undefined) {
      this.controlFlowGraphNode = this.controlFlowGraphNode.parent;
    }
  };

  //Utils

  localSymbolTableAdd(
    identifierCtx: TerminalNode,
    scope: ScopeType,
    name: string,
    type: string
  ) {
    if (this.localSymbolTable.lookup(name)) {
      this.addError(
        DuplicatedVariableError(terminalNodeToSpan(identifierCtx), name)
      );
    } else {
      this.localSymbolTable.define(scope, name, type);
    }
  }
  addError<T extends JackCompilerError>(error: T) {
    if (!this.stopProcessingErrorsInThisScope) this.errors.push(error);
  }
}

class BinaryTreeNode {
  private _returns?: boolean;
  constructor(
    public parent?: BinaryTreeNode,
    public left?: BinaryTreeNode,
    public right?: BinaryTreeNode
  ) {}

  public get returns(): boolean {
    if (this._returns) {
      return this._returns;
    } else if (this.right == undefined && this.left == undefined) {
      return false;
    } else if (this.right != undefined && this.left != undefined) {
      return this.left.returns && this.right.returns;
    } else if (this.left != undefined) {
      return false;
    } else {
      throw new Error("Something went wrong - CFG has only right  subtree");
    }
  }

  public set returns(_returns: boolean) {
    this._returns = _returns;
  }
  print() {
    console.log("Branch returns value");
    console.log(".");
    console.log(this.printBT());
  }

  printBT(prefix = "", side: Side = Side.LEFT) {
    let res = "";
    if (this._returns) {
      res += this.#pad(side);
      res += " " + this._returns + "\n";
      return res;
    } else {
      if (this.right == undefined && this.left == undefined) {
        res += this.#pad(side);
        res += " " + false + "\n";
      } else {
        res += this.left?.printBT(
          side == Side.LEFT ? "|   " : "    ",
          Side.LEFT
        );
        if (this.right) {
          res += prefix;
          res += this.right?.printBT(
            side == Side.LEFT ? "|\t" : "\t",
            Side.RIGHT
          );
        } else {
          res += "\n";
        }
      }
    }
    return res;
  }
  #pad(side: Side): string {
    return side == Side.LEFT ? "├──" : "└──";
  }
}
enum Side {
  LEFT,
  RIGHT,
}
const literalTypes = [...builtInTypes, "String"];

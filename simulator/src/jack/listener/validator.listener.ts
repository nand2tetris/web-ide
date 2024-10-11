import { ParserRuleContext } from "antlr4";
import { builtInTypes, intRange } from "../builtins.js";
import {
  ConstructorMushReturnThis,
  DuplicatedVariableException,
  FieldCantBeReferencedInFunction,
  FilenameDoesntMatchClassName,
  FunctionCalledAsMethodError,
  IncorrectConstructorReturnType,
  IncorrectParamsNumberInSubroutineCallError,
  IntLiteralIsOutOfRange,
  JackCompilerError,
  MethodCalledAsFunctionError,
  NonVoidFunctionNoReturnError,
  SubroutineNotAllPathsReturnError,
  ThisCantBeReferencedInFunction,
  UndeclaredVariableError,
  UnknownClassError,
  UnknownSubroutineCallError,
  UnreachableCodeError,
  VoidSubroutineReturnsValueError,
  WrongLiteralTypeError,
} from "../error.js";
import {
  ClassDeclarationContext,
  ClassVarDecContext,
  ConstantContext,
  ElseStatementContext,
  IfStatementContext,
  LetStatementContext,
  ParameterContext,
  RBraceContext,
  ReturnStatementContext,
  StatementContext,
  SubroutineBodyContext,
  SubroutineCallContext,
  SubroutineDeclarationContext,
  SubroutineDecWithoutTypeContext,
  VarDeclarationContext,
  VarNameContext,
  VarTypeContext,
  WhileStatementContext,
} from "../generated/JackParser.js";
import JackParserListener from "../generated/JackParserListener.js";
import {
  GenericSymbol,
  LocalSymbolTable,
  ScopeType,
  SubroutineType,
} from "../symbol.js";
import { CallType, getCallType } from "./common.js";
/* eslint-disable  @typescript-eslint/no-non-null-assertion */
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
    public errors: JackCompilerError[] = [],
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
    console.log(
      "Filename",
      this.filename != null,
      this.filename != this.className,
    );
    if (this.filename != null && this.filename != this.className) {
      console.error("FilenameDoesntMatchClassName");
      this.errors.push(
        new FilenameDoesntMatchClassName(
          className.start.line,
          className.start.start,
          className.start.stop,
          this.filename,
          this.className,
        ),
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
      .fieldName_list()
      .forEach((field) => {
        this.localSymbolTableAdd(ctx, scope, field.getText(), type);
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
          new IncorrectConstructorReturnType(
            ctx.start.line,
            ctx.start.start,
            ctx.start.stop,
          ),
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
    ctx: SubroutineDecWithoutTypeContext,
  ) => {
    const returnType = ctx.subroutineReturnType();
    this.subroutineShouldReturnVoidType = returnType.VOID() != null;
    this.controlFlowGraphNode = new BinaryTreeNode();
    this.subroutineName = ctx.subroutineName().getText();
  };

  override enterParameter = (ctx: ParameterContext) => {
    this.defineArgument(
      ctx,
      ctx.parameterName().getText(),
      ctx.varType().getText(),
      this.subroutineType == SubroutineType.Method,
    );
  };
  //Var
  override enterVarType = (ctx: VarTypeContext) => {
    if (ctx.IDENTIFIER() != null) {
      const type = ctx.IDENTIFIER()!.getText();
      if (this.globalSymbolTable[type] == null) {
        this.addError(
          new UnknownClassError(
            ctx.start.line,
            ctx.start.start,
            ctx.start.stop,
            type,
          ),
        );
      }
    }
  };

  override enterVarDeclaration = (ctx: VarDeclarationContext) => {
    const type = ctx.varType().getText();
    ctx.varNameInDeclaration_list().forEach((name) => {
      this.localSymbolTableAdd(ctx, ScopeType.Local, name.getText(), type);
    });
  };

  /**
   * Var name when doing some actions - do statement, let ... We have a different rule for a var name that is used in declaration
   */
  override enterVarName = (ctx: VarNameContext) => {
    const symbol = this.localSymbolTable.lookup(ctx.getText());
    if (symbol == undefined) {
      this.addError(
        new UndeclaredVariableError(
          ctx.start.line,
          ctx.start.start,
          ctx.start.stop,
          ctx.getText(),
        ),
      );
    } else if (
      this.subroutineType == SubroutineType.Function &&
      symbol.scope == ScopeType.This
    ) {
      this.addError(
        new FieldCantBeReferencedInFunction(
          ctx.start.line,
          ctx.start.start,
          ctx.start.stop,
        ),
      );
    }
  };

  override enterConstant = (ctx: ConstantContext) => {
    if (
      ctx.THIS_LITERAL() != null &&
      this.subroutineType == SubroutineType.Function
    ) {
      this.addError(
        new ThisCantBeReferencedInFunction(
          ctx.start.line,
          ctx.start.start,
          ctx.start.stop,
        ),
      );
    }
  };

  override enterStatement = (ctx: StatementContext) => {
    if (this.controlFlowGraphNode.returns == true) {
      this.addError(
        new UnreachableCodeError(
          ctx.start.line,
          ctx.start.start,
          ctx.stop?.stop ?? ctx.start.stop,
        ),
      );
      this.stopProcessingErrorsInThisScope = true;
    }
  };
  override enterRBrace = (ctx: RBraceContext) => {
    this.stopProcessingErrorsInThisScope = false;
  };
  /**
   * Control flow
   */
  override enterWhileStatement = (ctx: WhileStatementContext) => {
    this.controlFlowGraphNode = this.controlFlowGraphNode.left =
      new BinaryTreeNode(this.controlFlowGraphNode);
  };

  override exitWhileStatement = (ctx: WhileStatementContext) => {
    if (this.controlFlowGraphNode?.parent != null) {
      this.controlFlowGraphNode = this.controlFlowGraphNode.parent;
    }
  };
  override enterIfStatement = (ctx: IfStatementContext) => {
    this.controlFlowGraphNode = this.controlFlowGraphNode.left =
      new BinaryTreeNode(this.controlFlowGraphNode);
  };
  override exitIfStatement = (ctx: IfStatementContext) => {
    if (this.controlFlowGraphNode?.parent != null) {
      this.controlFlowGraphNode = this.controlFlowGraphNode.parent;
    }
  };
  override enterElseStatement = (ctx: ElseStatementContext) => {
    this.controlFlowGraphNode = this.controlFlowGraphNode.right =
      new BinaryTreeNode(this.controlFlowGraphNode);
  };
  override exitElseStatement = (ctx: ElseStatementContext) => {
    if (this.controlFlowGraphNode?.parent != null) {
      this.controlFlowGraphNode = this.controlFlowGraphNode.parent;
    }
  };
  override enterLetStatement = (ctx: LetStatementContext) => {
    const varName = ctx.varName();
    const constCtx = ctx.expression().constant();
    //corresponding literal type check
    if (
      varName != null &&
      constCtx != null &&
      this.localSymbolTable.lookup(ctx.varName()!.getText()) &&
      ctx.expression().constant()!.NULL_LITERAL() == null
    ) {
      const type = this.localSymbolTable.lookup(ctx.varName()!.getText())!.type;
      if (literalTypes.indexOf(type) != -1) {
        const constantCtx = ctx.expression().constant()!;
        switch (type) {
          case "char":
          case "int":
            if (constantCtx.INTEGER_LITERAL() === null) {
              this.addError(
                new WrongLiteralTypeError(
                  ctx.start.line,
                  ctx.start.start,
                  ctx.start.stop,
                  type,
                ),
              );
            } else {
              const value = parseInt(constantCtx.INTEGER_LITERAL()!.getText());
              if (value > intRange.max) {
                this.addError(
                  new IntLiteralIsOutOfRange(
                    ctx.start.line,
                    ctx.start.start,
                    ctx.start.stop,
                    value,
                    intRange.min,
                    intRange.max,
                  ),
                );
              }
            }
            break;
          case "boolean":
            if (constantCtx.booleanLiteral() === null) {
              this.addError(
                new WrongLiteralTypeError(
                  ctx.start.line,
                  ctx.start.start,
                  ctx.start.stop,
                  type,
                ),
              );
            }
            break;
          case "String":
            if (constantCtx.STRING_LITERAL() === null) {
              this.addError(
                new WrongLiteralTypeError(
                  ctx.start.line,
                  ctx.start.start,
                  ctx.start.stop,
                  type.toLowerCase(),
                ),
              );
            }
            break;
          default:
            throw new Error(`Unknown literal type ${type}`);
        }
      }
    }
    //int min value check
    const unaryOp = ctx.expression().unaryOperation();
    if (
      varName &&
      unaryOp != null &&
      unaryOp.unaryOperator().MINUS() !== null &&
      unaryOp!.expression().constant() != null &&
      unaryOp!.expression().constant()?.INTEGER_LITERAL() !== null
    ) {
      const value = parseInt(
        unaryOp!.expression().constant()!.INTEGER_LITERAL()!.getText(),
      );
      if (-value < intRange.min) {
        this.addError(
          new IntLiteralIsOutOfRange(
            ctx.start.line,
            ctx.start.start,
            ctx.start.stop,
            value,
            intRange.min,
            intRange.max,
          ),
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
      this.localSymbolTable,
    );

    const symbol = this.globalSymbolTable[subroutineIdText];
    if (symbol == undefined) {
      this.addError(
        new UnknownSubroutineCallError(
          ctx.start.line,
          ctx.start.start,
          ctx.start.stop,
          subroutineId.subroutineName().getText(),
          subroutineId.className()?.getText(),
        ),
      );
    } else {
      //method called as a function
      if (
        symbol.subroutineInfo?.type == SubroutineType.Method &&
        callType == CallType.ClassFunctionOrConstructor
      ) {
        this.addError(
          new MethodCalledAsFunctionError(
            ctx.start.line,
            ctx.start.start,
            ctx.start.stop,
            subroutineId.subroutineName().getText(),
          ),
        );
      }
      // function called as a method
      else if (
        symbol.subroutineInfo?.type == SubroutineType.Function &&
        callType == CallType.LocalMethod
      ) {
        this.addError(
          new FunctionCalledAsMethodError(
            ctx.start.line,
            ctx.start.start,
            ctx.start.stop,
            subroutineId.subroutineName().getText(),
          ),
        );
      } else {
        //check parameter count
        const l = ctx.expressionList().expression_list().length;
        if (symbol.subroutineInfo!.paramsCount != l) {
          this.addError(
            new IncorrectParamsNumberInSubroutineCallError(
              ctx.start.line,
              ctx.start.start,
              ctx.start.stop,
              subroutineId.getText(),
              symbol.subroutineInfo!.paramsCount,
              l,
            ),
          );
        }
      }
    }
  };
  override enterReturnStatement = (ctx: ReturnStatementContext) => {
    const returnsVoid = ctx.expression() == null;
    if (returnsVoid && !this.subroutineShouldReturnVoidType) {
      this.addError(
        new NonVoidFunctionNoReturnError(
          ctx.stop!.line,
          ctx.stop!.start,
          ctx.stop!.stop,
        ),
      );
    }
    if (!returnsVoid && this.subroutineShouldReturnVoidType) {
      this.addError(
        new VoidSubroutineReturnsValueError(
          ctx.stop!.line,
          ctx.stop!.start,
          ctx.stop!.stop,
        ),
      );
    }
    this.controlFlowGraphNode.returns = true;
    if (this.subroutineType == SubroutineType.Constructor) {
      if (
        returnsVoid ||
        ctx.expression()!.expression_list().length > 1 ||
        ctx.expression()!.constant() == null ||
        ctx.expression()!.constant()!.THIS_LITERAL() == null
      ) {
        this.addError(
          new ConstructorMushReturnThis(
            ctx.stop!.line,
            ctx.stop!.start,
            ctx.stop!.stop,
          ),
        );
      }
    }
  };

  override exitSubroutineBody = (ctx: SubroutineBodyContext) => {
    if (!this.controlFlowGraphNode.returns) {
      this.addError(
        new SubroutineNotAllPathsReturnError(
          ctx.stop!.line,
          ctx.stop!.start,
          ctx.stop!.stop,
          this.subroutineName,
        ),
      );
    }
    this.subroutineType = undefined;
  };
  override exitSubroutineDeclaration = (ctx: SubroutineDeclarationContext) => {
    ctx.symbols = this.localSymbolTable.popStack();
  };

  override exitClassDeclaration = (ctx: ClassDeclarationContext) => {
    while (this.controlFlowGraphNode?.parent != undefined) {
      this.controlFlowGraphNode = this.controlFlowGraphNode.parent;
    }
  };

  //Utils
  defineArgument(
    ctx: ParserRuleContext,
    name: string,
    type: string,
    inMethod: boolean,
  ) {
    if (this.localSymbolTable.lookup(name)) {
      this.addError(
        new DuplicatedVariableException(
          ctx.start.line,
          ctx.start.start,
          ctx.start.stop,
          name,
        ),
      );
    } else {
      this.localSymbolTable.defineArgument(name, type, inMethod);
    }
  }
  localSymbolTableAdd(
    ctx: ParserRuleContext,
    scope: ScopeType,
    name: string,
    type: string,
  ) {
    if (this.localSymbolTable.lookup(name)) {
      this.addError(
        new DuplicatedVariableException(
          ctx.start.line,
          ctx.start.start,
          ctx.start.stop,
          name,
        ),
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
    public right?: BinaryTreeNode,
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
      res += this.pad(prefix, side);
      res += " " + this._returns + "\n";
      return res;
    } else {
      if (this.right == undefined && this.left == undefined) {
        res += this.pad(prefix, side);
        res += " " + false + "\n";
      } else {
        res += this.left?.printBT(
          side == Side.LEFT ? "|   " : "    ",
          Side.LEFT,
        );
        if (this.right) {
          res += prefix;
          res += this.right?.printBT(
            side == Side.LEFT ? "|\t" : "\t",
            Side.RIGHT,
          );
        } else {
          res += "\n";
        }
      }
    }
    return res;
  }
  pad(prefix: string, side: Side): string {
    return side == Side.LEFT ? "├──" : "└──";
  }
}
enum Side {
  LEFT,
  RIGHT,
}
const literalTypes = [...builtInTypes, "String"];

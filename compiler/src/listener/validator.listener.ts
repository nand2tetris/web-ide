import { ParseTreeListener } from "antlr4ts/tree/ParseTreeListener";
import { TerminalNode } from "antlr4ts/tree/TerminalNode";
import { ConstructorMushReturnThis, DuplicatedVariableException, FunctionCalledAsMethodError, IncorrectConstructorReturnType, IncorrectParamsNumberInSubroutineCallError, JackCompilerError, MethodCalledAsFunctionError, NonVoidFunctionNoReturnError, SubroutineNotAllPathsReturnError, UndeclaredVariableError, UnknownClassError, UnknownSubroutineCallError, UnreachableCodeError, VoidSubroutineReturnsValueError } from "../error";
import { ClassDeclarationContext, ClassNameContext, ElseStatementContext, FieldListContext, IfStatementContext, ParameterContext, RBraceContext, ReturnStatementContext, StatementContext, SubroutineBodyContext, SubroutineCallContext, SubroutineDeclarationContext, SubroutineDecWithoutTypeContext, VarDeclarationContext, VarNameContext, VarTypeContext, WhileStatementContext } from "../generated/JackParser";
import { JackParserListener } from "../generated/JackParserListener";
import { GenericSymbol, LocalSymbolTable, SubroutineType } from "../symbol";

class BinaryTreeNode {
    _returns?: boolean;
    constructor(
        public parent: BinaryTreeNode | undefined,
        public left?: BinaryTreeNode,
        public right?: BinaryTreeNode) { }

    get returns(): boolean {
        if (this._returns) {
            return this._returns;
        } else if (this.right == undefined && this.left == undefined) {
            return false;
        } else if (this.right != undefined && this.left != undefined) {
            return this.left.returns && this.right.returns;
        } else if (this.left != undefined) {
            return false;
        } else {
            throw new Error("Something went wrong - CFG has only right  subtree")
        }
    }
    print() {
        console.log("Branch returns value")
        console.log(".")
        console.log(this.printBT());
    }

    printBT(prefix: string = "", side: Side = Side.LEFT) {
        let res: string = ""
        if (this._returns) {
            res += this.#pad(prefix, side)
            res += " " + this._returns + "\n";
            return res;
        } else {
            if (this.right == undefined && this.left == undefined) {
                res += this.#pad(prefix, side)
                res += " " + false + "\n";
            } else {
                res += this.left?.printBT((side == Side.LEFT ? "|   " : "    "), Side.LEFT);
                if (this.right) {
                    res += prefix
                    res += this.right?.printBT((side == Side.LEFT ? "|\t" : "\t"), Side.RIGHT);
                } else {
                    res += "\n";
                }

            }
        }
        return res;
    }
    #pad(prefix: string, side: Side): string {
        return side == Side.LEFT ? "├──" : "└──";
    }

}
enum Side {
    LEFT,
    RIGHT
}

export class ValidatorListener implements JackParserListener, ParseTreeListener {

    //why do we need local symbol table? this vars, arguments, local vars. What about types?
    localSymbolTable: LocalSymbolTable = new LocalSymbolTable();
    subroutineShouldReturnVoidType: boolean = false;
    cfgNode: BinaryTreeNode = new BinaryTreeNode(undefined);
    subroutineName: string = ""
    className = ""
    inConstructor: boolean = false
    stopProcessingErrorsInThisScope = false;
    constructor(private globalSymbolTable: Record<string, GenericSymbol>, public errors: JackCompilerError[] = []) { }

    enterClassName(ctx: ClassNameContext) {
        this.className = ctx.IDENTIFIER().text
    };
    enterFieldList(ctx: FieldListContext) {
        const type = ctx.varType().text
        ctx.fieldName().forEach(field => {
            this.#localSymbolTableAdd(ctx.start.line, ctx.start.startIndex, field.text, type);
        });
    };
    enterSubroutineDeclaration(ctx: SubroutineDeclarationContext) {
        let subroutineType: SubroutineType;
        if (ctx.subroutineType().CONSTRUCTOR() != undefined) {
            this.inConstructor = true;
            if (ctx.subroutineDecWithoutType().subroutineReturnType().text !== this.className) {
                this.#addError(new IncorrectConstructorReturnType(ctx.start.line, ctx.start.startIndex));
            }
        }
    }
    enterSubroutineDecWithoutType(ctx: SubroutineDecWithoutTypeContext) {
        this.localSymbolTable.pushStack();
        const returnType = ctx.subroutineReturnType()
        this.subroutineShouldReturnVoidType = returnType.VOID() != undefined
        this.cfgNode = new BinaryTreeNode(undefined);
        this.subroutineName = ctx.subroutineName().text
    };

    enterParameter(ctx: ParameterContext) {
        this.#localSymbolTableAdd(ctx.start.line, ctx.start.startIndex, ctx.parameterName().text, ctx.varType().text);
    };
    //Var
    enterVarType(ctx: VarTypeContext) {
        if (ctx.IDENTIFIER() != undefined) {
            const type = ctx.IDENTIFIER()!.text
            if (this.globalSymbolTable[type] === undefined) {
                this.#addError(new UnknownClassError(ctx.start.line, ctx.start.startIndex, type));
            }
        }
    };

    enterVarDeclaration(ctx: VarDeclarationContext) {
        const type = ctx.varType().text
        ctx.varNameInDeclaration().forEach(name => {
            this.#localSymbolTableAdd(ctx.start.line, ctx.start.startIndex, name.text, type);
        })
    };

    enterVarName(ctx: VarNameContext) {
        if (!this.localSymbolTable.existsSymbol(ctx.text)) {
            this.#addError(new UndeclaredVariableError(ctx.start.line, ctx.start.startIndex, ctx.text));
        }
    };

    enterStatement(ctx: StatementContext) {
        if (this.cfgNode._returns == true) {
            this.#addError(new UnreachableCodeError(ctx.start.line, ctx.start.startIndex));
            this.stopProcessingErrorsInThisScope = true;
        }
    };
    enterRBrace(ctx: RBraceContext) {
        this.stopProcessingErrorsInThisScope = false;
    };
    /**
     * Control flow
     */
    enterWhileStatement(ctx: WhileStatementContext) {
        this.cfgNode = this.cfgNode.left = new BinaryTreeNode(this.cfgNode);
    };

    exitWhileStatement(ctx: WhileStatementContext) {
        if (this.cfgNode?.parent != null) {
            this.cfgNode = this.cfgNode.parent
        }
    };
    enterIfStatement(ctx: IfStatementContext) {
        this.cfgNode = this.cfgNode.left = new BinaryTreeNode(this.cfgNode);
    };
    exitIfStatement(ctx: IfStatementContext) {
        if (this.cfgNode?.parent != null) {
            this.cfgNode = this.cfgNode.parent
        }
    };
    enterElseStatement(ctx: ElseStatementContext) {
        this.cfgNode = this.cfgNode.right = new BinaryTreeNode(this.cfgNode);
    };
    exitElseStatement(ctx: ElseStatementContext) {
        if (this.cfgNode?.parent != null) {
            this.cfgNode = this.cfgNode.parent
        }

    };
    enterSubroutineCall(ctx: SubroutineCallContext) {
        //check if variable exists with the name before dot
        const subroutineId = ctx.subroutineId()
        let callType: CallType;

        let subroutineIdText: string;
        if (subroutineId.text.indexOf('.') == -1) {
            //local method
            callType = CallType.LocalMethod
            subroutineIdText = this.className + "." + subroutineId.subroutineName().text
        } else {
            // var method
            const [varName, methodName] = subroutineId.text.split('.')
            if (this.localSymbolTable.existsSymbol(varName)) {
                const varType = this.localSymbolTable.getType(varName)
                subroutineIdText = varType + "." + methodName
                callType = CallType.VarMethod;
            } else {
                // class function/ctor
                subroutineIdText = subroutineId.text
                callType = CallType.ClassFunctionOrConstructor;
            }
        }

        const symbol = this.globalSymbolTable[subroutineIdText]
        if (symbol == undefined) {
            this.#addError(new UnknownSubroutineCallError(ctx.start.line, ctx.start.startIndex,
                subroutineId.subroutineName().text,
                subroutineId.className()?.text
            ));
        } else {
            //method called as a function
            if (symbol.subroutineInfo?.type == SubroutineType.Method
                && callType == CallType.ClassFunctionOrConstructor) {
                this.#addError(new MethodCalledAsFunctionError(ctx.start.line, ctx.start.startIndex,
                    subroutineId.subroutineName().text));
            }
            // function called as a method
            else if (symbol.subroutineInfo?.type == SubroutineType.Function
                && callType == CallType.LocalMethod) {
                this.#addError(new FunctionCalledAsMethodError(ctx.start.line, ctx.start.startIndex,
                    subroutineId.subroutineName().text));
            } else {
                //check parameter count 
                const l = ctx.expressionList().expression().length
                if (symbol.subroutineInfo!.paramsCount != l) {
                    this.#addError(new IncorrectParamsNumberInSubroutineCallError(ctx.start.line, ctx.start.startIndex, subroutineId.text,
                        symbol.subroutineInfo!.paramsCount, l));
                }
            }
        }

    };
    enterReturnStatement(ctx: ReturnStatementContext) {
        const returnsVoid = ctx.expression() == undefined
        if (returnsVoid && !this.subroutineShouldReturnVoidType) {
            this.#addError(new NonVoidFunctionNoReturnError(ctx.start.line, ctx.start.startIndex));
        }
        if (!returnsVoid && this.subroutineShouldReturnVoidType) {
            this.#addError(new VoidSubroutineReturnsValueError(ctx.start.line, ctx.start.startIndex));
        }
        this.cfgNode._returns = true;
        if (this.inConstructor) {
            if (returnsVoid || ctx.expression()!.expression().length > 1 ||
                ctx.expression()!.constant() == undefined || ctx.expression()!.constant()!.THIS_LITERAL() == undefined) {
                this.#addError(new ConstructorMushReturnThis(ctx.start.line, ctx.start.startIndex))
            }
        }
    };

    exitSubroutineBody(ctx: SubroutineBodyContext) {
        if (!this.cfgNode.returns) {
            this.#addError(new SubroutineNotAllPathsReturnError(ctx.start.line, ctx.start.startIndex, this.subroutineName));
        }
        this.inConstructor = false;
        this.localSymbolTable.popStack();
    };

    exitClassDeclaration(ctx: ClassDeclarationContext) {
        while (this.cfgNode?.parent != undefined) {
            this.cfgNode = this.cfgNode.parent
        }
    };

    //Utils
    #localSymbolTableAdd(line: number, position: number, name: string, type: string) {
        if (this.localSymbolTable.existsSymbol(name)) {
            this.#addError(new DuplicatedVariableException(line, position, name));
        } else {
            this.localSymbolTable.add(name, type);
        }
    }
    #addError<T extends JackCompilerError>(error: T) {
        if (!this.stopProcessingErrorsInThisScope)
            this.errors.push(error);
    }
    //to fix compiler error
    visitTerminal?: (/*@NotNull*/ node: TerminalNode) => void;

}


enum CallType {
    VarMethod,
    LocalMethod,
    ClassFunctionOrConstructor
}
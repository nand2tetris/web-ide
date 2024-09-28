import { ParseTreeListener } from "antlr4ts/tree/ParseTreeListener";
import { TerminalNode } from "antlr4ts/tree/TerminalNode";
import { DuplicatedVariableException, IncorrectParamsNumberInSubroutineCall, JackCompilerError, NonVoidFunctionNoReturnError, SubroutineNotAllPathsReturn, UndeclaredVariableError, UnknownClassError, UnknownSubroutineCall, VoidSubroutineReturnsValueError } from "../error";
import { ClassDeclarationContext, ElseStatementContext, FieldDeclarationContext, FieldNameContext, IfElseStatementContext, IfStatementContext, LetStatementContext, ParameterContext, ParameterNameContext, ReturnStatementContext, SubroutineBodyContext, SubroutineCallContext, SubroutineDeclarationContext, SubroutineDecWithoutTypeContext, SubroutineReturnTypeContext, VarDeclarationContext, VarNameContext, VarNameInDeclarationContext, VarTypeContext, WhileStatementContext } from "../generated/JackParser";
import { JackParserListener } from "../generated/JackParserListener";
import { GenericSymbol } from "./symbol.table.listener";

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
    constructor(private globalSymbolTable: Record<string, GenericSymbol>, public errors: JackCompilerError[] = []) { }

    enterFieldName(ctx: FieldNameContext) {
        this.localSymbolTableAdd(ctx.start.line, ctx.start.startIndex, ctx.text);
    };
    enterSubroutineDecWithoutType(ctx: SubroutineDecWithoutTypeContext) {
        this.localSymbolTable.pushStack();
        const returnType = ctx.subroutineReturnType()
        this.subroutineShouldReturnVoidType = returnType.VOID() != undefined
        this.cfgNode = new BinaryTreeNode(undefined);
        this.subroutineName = ctx.subroutineName().text
    };

    enterParameterName(ctx: ParameterNameContext) {
        this.localSymbolTableAdd(ctx.start.line, ctx.start.startIndex, ctx.text);
    }

    //Var
    enterVarType(ctx: VarTypeContext) {
        if (ctx.IDENTIFIER() != undefined) {
            const type = ctx.IDENTIFIER()!.text
            if (this.globalSymbolTable[type] === undefined) {
                this.errors.push(new UnknownClassError(ctx.start.line, ctx.start.startIndex, type));
            }
        }
    };

    enterVarNameInDeclaration(ctx: VarNameInDeclarationContext) {
        this.localSymbolTableAdd(ctx.start.line, ctx.start.startIndex, ctx.text);
    };

    enterVarName(ctx: VarNameContext) {
        if (!this.localSymbolTable.existsSymbol(ctx.text)) {
            this.errors.push(new UndeclaredVariableError(ctx.start.line, ctx.start.startIndex, ctx.text));
        }
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
        const subroutineId = ctx.subroutineId().text
        const f = this.globalSymbolTable[subroutineId]
        if (f == undefined) {
            this.errors.push(new UnknownSubroutineCall(ctx.start.line, ctx.start.startIndex, ctx.subroutineId().text));
        } else {
            const l = ctx.expressionList().expression().length
            if (f.subroutineParameterCount != l) {
                this.errors.push(new IncorrectParamsNumberInSubroutineCall(ctx.start.line, ctx.start.startIndex, subroutineId,
                    f.subroutineParameterCount!, l));
            }
        }
    };
    enterReturnStatement(ctx: ReturnStatementContext) {
        const returnsVoid = ctx.expression() == undefined
        if (returnsVoid && !this.subroutineShouldReturnVoidType) {
            this.errors.push(new NonVoidFunctionNoReturnError(ctx.start.line, ctx.start.startIndex));
        }
        if (!returnsVoid && this.subroutineShouldReturnVoidType) {
            this.errors.push(new VoidSubroutineReturnsValueError(ctx.start.line, ctx.start.startIndex,));
        }
        this.cfgNode._returns = true;
    };

    exitSubroutineBody(ctx: SubroutineBodyContext) {
        if (!this.cfgNode.returns) {
            this.errors.push(new SubroutineNotAllPathsReturn(ctx.start.line, ctx.start.startIndex, this.subroutineName));
        }
        this.localSymbolTable.popStack();
    };

    exitClassDeclaration(ctx: ClassDeclarationContext) {
        while (this.cfgNode?.parent != undefined) {
            this.cfgNode = this.cfgNode.parent
        }
    };

    //Utils
    localSymbolTableAdd(line: number, position: number, name: string) {
        if (this.localSymbolTable.existsSymbol(name)) {
            this.errors.push(new DuplicatedVariableException(line, position, name));
        } else {
            this.localSymbolTable.add(name);
        }
    }
    //to fix compiler error
    visitTerminal?: (/*@NotNull*/ node: TerminalNode) => void;

}

export class LocalSymbolTable {
    constructor(private scopeVarDecs: string[][] = [[]]) {

    }
    existsSymbol(name: string): boolean {
        for (let i = this.scopeVarDecs.length - 1; i >= 0; i--) {
            if (this.scopeVarDecs[i].includes(name)) {
                return true;
            }
        }
        return false;
    }
    add(varName: string) {
        this.scopeVarDecs[this.scopeVarDecs.length - 1].push(varName);
    }
    pushStack() {
        this.scopeVarDecs.push([]);
    }
    popStack() {
        this.scopeVarDecs.pop();
    }

}
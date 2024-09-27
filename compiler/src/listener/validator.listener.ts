import { ParseTreeListener } from "antlr4ts/tree/ParseTreeListener";
import { TerminalNode } from "antlr4ts/tree/TerminalNode";
import { DuplicatedVariableException, JackCompilerError, NonVoidFunctionNoReturnError, SubroutineNotAllPathsReturn, UndeclaredVariableError, UnknownClassError, VoidSubroutineReturnsValueError } from "../error";
import { FieldDeclarationContext, FieldNameContext, IfStatementContext, LetStatementContext, ParameterContext, ParameterNameContext, ReturnStatementContext, SubroutineBodyContext, SubroutineDeclarationContext, SubroutineDecWithoutTypeContext, SubroutineReturnTypeContext, VarDeclarationContext, VarNameContext, VarNameInDeclarationContext, VarTypeContext, WhileStatementContext } from "../generated/JackParser";
import { JackParserListener } from "../generated/JackParserListener";
import { GenericSymbol } from "./symbol.table.listener";

class BinaryTreeNode {

    constructor(
        public parent: BinaryTreeNode | undefined,
        public left: BinaryTreeNode | LeafNode,
        public right: BinaryTreeNode | LeafNode) { }

    get returns(): boolean {
        return this.left.returns && this.right.returns;
    }
}
enum CFGSide {
    LEFT,
    RIGHT
}
class LeafNode {
    returns: boolean = false;
}

export class ValidatorListener implements JackParserListener, ParseTreeListener {


    /**
     *  List of validations rules:
     * - variable declaration - validate duplicate variable declarations
     * Let:
     * -  Undeclared variable
     * - `Subroutine ${subroutine.name.value}: not all code paths return a value`,
     * - `A non void subroutine must return a value`,
     * - Unknown type for return type, class variable, or method local var
     * - OS subroutine ${this.className}.${subroutine.name.value} must follow the interface
     * - validate arg number
     * -   `Method ${className}.${subroutineName} was called as a function/constructor`
     * - Subroutine was called as a method
     * - `Class ${className} doesn't contain a function/constructor ${subroutineName}`
     * - `Class ${className} doesn't exist`
     */

    //why do we need local symbol table? this vars, arguments, local vars. What about types?
    localSymbolTable: LocalSymbolTable = new LocalSymbolTable();
    subroutineShouldReturnVoidType: boolean = false;
    cfgNode: BinaryTreeNode | undefined
    cfgSide: CFGSide = CFGSide.LEFT;
    subroutineName: string = ""
    constructor(private globalSymbolTable: Record<string, GenericSymbol>, public errors: JackCompilerError[] = []) { }

    enterFieldName(ctx: FieldNameContext) {
        this.localSymbolTableAdd(ctx.start.line, ctx.start.startIndex, ctx.text);
    };
    enterSubroutineDecWithoutType(ctx: SubroutineDecWithoutTypeContext) {
        this.localSymbolTable.pushStack();
        const returnType = ctx.subroutineReturnType()
        this.subroutineShouldReturnVoidType = returnType.VOID() != undefined
        this.cfgNode = undefined
        this.cfgSide = CFGSide.LEFT;
        this.subroutineName = ctx.subroutineName().text
    };

    addCFGNode() {
        if (this.cfgNode == undefined) {
            this.cfgNode = new BinaryTreeNode(undefined, new LeafNode(), new LeafNode());
            this.cfgSide = CFGSide.LEFT;
        } else {
            switch (this.cfgSide) {
                case CFGSide.LEFT:
                    this.cfgNode = this.cfgNode.left = new BinaryTreeNode(this.cfgNode, new LeafNode(), new LeafNode());
                    break;
                case CFGSide.RIGHT:
                    this.cfgNode = this.cfgNode.left = new BinaryTreeNode(this.cfgNode, new LeafNode(), new LeafNode());
                    this.cfgSide = CFGSide.LEFT;
                    break;
            }
        }
    }
    //while
    enterWhileStatement(ctx: WhileStatementContext) {
        this.addCFGNode()
    };

    exitWhileStatement(ctx: WhileStatementContext) {
        this.cfgSide = CFGSide.RIGHT;
    };
    enterIfStatement(ctx: IfStatementContext) {
        this.addCFGNode()
    };
    exitIfStatement(ctx: IfStatementContext) {
        this.cfgSide = CFGSide.RIGHT;
    };

    enterVarType(ctx: VarTypeContext) {
        if (ctx.IDENTIFIER() != undefined) {
            const type = ctx.IDENTIFIER()!.text
            if (this.globalSymbolTable[type] === undefined) {
                this.errors.push(new UnknownClassError(ctx.start.line, ctx.start.startIndex, type));
            }
        }
    };


    enterParameterName(ctx: ParameterNameContext) {
        this.localSymbolTableAdd(ctx.start.line, ctx.start.startIndex, ctx.text);
    }

    enterVarNameInDeclaration(ctx: VarNameInDeclarationContext) {
        this.localSymbolTableAdd(ctx.start.line, ctx.start.startIndex, ctx.text);
    };

    enterVarName(ctx: VarNameContext) {
        if (!this.localSymbolTable.existsSymbol(ctx.text)) {
            this.errors.push(new UndeclaredVariableError(ctx.start.line, ctx.start.startIndex, ctx.text));
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
        if (this.cfgNode !== undefined) {
            switch (this.cfgSide) {
                case CFGSide.LEFT:
                    if (!(this.cfgNode.left instanceof LeafNode)) {
                        throw new Error("Expected left node in CFG")
                    }
                    this.cfgNode.left.returns = true;
                    break
                case CFGSide.RIGHT:
                    if (!(this.cfgNode.right instanceof LeafNode)) {
                        throw new Error("Expected left node in CFG")
                    }
                    this.cfgNode.right.returns = true;
            }
        }
    };
    exitSubroutineBody(ctx: SubroutineBodyContext) {
        if (this.cfgNode != undefined && !this.cfgNode.returns) {
            this.errors.push(new SubroutineNotAllPathsReturn(ctx.start.line, ctx.start.startIndex, this.subroutineName));
        }
        this.localSymbolTable.popStack();
    };
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
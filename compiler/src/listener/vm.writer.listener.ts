import { TerminalNode } from "antlr4ts/tree/TerminalNode";
import { JackParserListener } from "../generated/JackParserListener";
import { BinaryOperatorContext, ClassDeclarationContext, ConstantContext, ExpressionContext, ReturnStatementContext, SubroutineCallContext, SubroutineDeclarationContext, SubroutineDecWithoutTypeContext } from "../generated/JackParser";
import { GenericSymbol } from "../symbol";

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

export class VMWriter implements JackParserListener {
    public result: string = ""
    private className: string = "";
    constructor(private globalSymbolTable: Record<string, GenericSymbol>) {
    }
    enterSubroutineDeclaration(ctx: SubroutineDeclarationContext) {
        const name = ctx.subroutineDecWithoutType().subroutineName().IDENTIFIER().text
        const symbol = this.globalSymbolTable[this.className + "." + name]
        if (symbol == undefined) {
            throw new Error(`Can't find subroutine ${name} in class ${this.className} in symbol table`)
        }
        this.result += `function ${this.className}.${name} ${symbol.subroutineInfo!.localVarsCount}\n`;

        if (ctx.subroutineType().CONSTRUCTOR() != undefined) {
            this.result += "    push constant 0\n"
            this.result += "    call Memory.alloc 1\n"
            this.result += "    pop pointer 0\n"
        } else if (ctx.subroutineType().METHOD() != undefined) {
            this.result += "    push argument 0\n";
            this.result += "    pop pointer 0\n";
        }
    };
    enterClassDeclaration(ctx: ClassDeclarationContext) {
        if (this.className != "") {
            throw new Error("Cannot change class name")
        }
        this.className = ctx.className()!.text;
    };
    enterConstant(ctx: ConstantContext) {
        if (ctx.INTEGER_LITERAL() != undefined) {
            this.result += `    push constant ${ctx.INTEGER_LITERAL()!.text}\n`;
        }
    };
    exitExpression(ctx: ExpressionContext) {
        if (ctx.binaryOperator() != undefined) {
            const binaryOp = ctx.binaryOperator()!.text
            if (binaryOperationToVmCmd[binaryOp] == undefined) {
                throw new Error(`Unknown binary operator ${binaryOp}`)
            }
            this.result += "\t" + binaryOperationToVmCmd[binaryOp] + "\n";
        } else if (ctx.unaryOperation() != undefined) {
            const unaryOp = ctx.unaryOperation()!.unaryOperator().text;
            if (unaryOperationToVmCmd[unaryOp] == undefined) {
                throw new Error(`Unknown unary operator ${unaryOp}`)
            }
            this.result += "\t" + unaryOperationToVmCmd[unaryOp] + "\n";
        }
    };
    exitReturnStatement(ctx: ReturnStatementContext) {
        if (ctx.expression()?.constant()?.THIS_LITERAL() != undefined) {
            this.result += "    push pointer 0\n";
        } else if (ctx.expression() == undefined) {
            this.result += "    push constant 0\n";
        }
        this.result += "    return\n";
    };
    enterSubroutineCall(ctx: SubroutineCallContext) {
        this.result += "    call A.b 0\n";
        this.result += "    pop temp 0\n";
    };
    //to fix compiler error
    visitTerminal?: (/*@NotNull*/ node: TerminalNode) => void;

}
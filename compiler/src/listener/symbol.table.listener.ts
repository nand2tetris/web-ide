import { ParseTreeListener } from "antlr4ts/tree/ParseTreeListener";
import { TerminalNode } from "antlr4ts/tree/TerminalNode";
import { ClassDeclarationContext, ConstructorContext, FunctionContext, MethodContext, SubroutineDecWithoutTypeContext } from "../generated/JackParser";
import { JackParserListener } from "../generated/JackParserListener";
import { DuplicatedSubroutineError } from '../error'
const primitives = new Set(["int", "boolean", "char"] as const);
export type Primitive = typeof primitives extends Set<infer S> ? S : never;

/**
 * Generic symbol. Can be used for both class and function symbols
 */
export interface GenericSymbol extends Symbol {
    subroutineParameterCount?: number;
}

export class GlobalSymbolTableListener implements JackParserListener, ParseTreeListener {

    // key can be class or <class>.<subroutine_name>
    public globalSymbolTable: Record<string, GenericSymbol> = {};
    //track class variables, local vars, function args 
    public className = "";
    public errors: DuplicatedSubroutineError[] = []

    //to fix compiler error
    visitTerminal?: (/*@NotNull*/ node: TerminalNode) => void;

    enterClassDeclaration(ctx: ClassDeclarationContext) {
        if (this.globalSymbolTable[ctx.className()!.text] != undefined) {
            this.errors.push(new DuplicatedSubroutineError(ctx.start.line, ctx.start.startIndex, `Class "${ctx.className()!.text}" already defined.`));
            return;
        }
        this.globalSymbolTable[ctx.className()!.text] = {} as GenericSymbol;
        this.className = ctx.className()?.text;
    };

    enterSubroutineDecWithoutType(ctx: SubroutineDecWithoutTypeContext) {
        const nameCtx = ctx.subroutineName()
        const subroutineName = nameCtx.text
        const id = this.className + "." + subroutineName
        if (this.globalSymbolTable[id] != undefined) {
            this.errors.push(new DuplicatedSubroutineError(nameCtx.start.line, nameCtx.start.startIndex, `Subroutine "${subroutineName}" is already defined.`));
        }
        this.globalSymbolTable[id] = {
            subroutineParameterCount: ctx.parameterList().parameter().length,
        } as GenericSymbol;
    }

    resetErrors() {
        this.errors = [];
    }
}

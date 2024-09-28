import { ParseTreeListener } from "antlr4ts/tree/ParseTreeListener";
import { TerminalNode } from "antlr4ts/tree/TerminalNode";
import { ClassDeclarationContext, SubroutineDeclarationContext, SubroutineDecWithoutTypeContext } from "../generated/JackParser";
import { JackParserListener } from "../generated/JackParserListener";
import { DuplicatedSubroutineError } from '../error'
import { builtInSymbols, builtInTypes } from "../builtins";
import { GenericSymbol, SubroutineType } from "../symbol";

const primitives = new Set(builtInTypes);
export type Primitive = typeof primitives extends Set<infer S> ? S : never;

export class GlobalSymbolTableListener implements JackParserListener, ParseTreeListener {
    // key can be class or <class>.<subroutine_name>
    public globalSymbolTable: Record<string, GenericSymbol> = structuredClone(builtInSymbols);
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

    enterSubroutineDeclaration(ctx: SubroutineDeclarationContext) {
        let subroutineType: SubroutineType;
        if (ctx.subroutineType().CONSTRUCTOR() != undefined) {
            subroutineType = SubroutineType.Constructor;
        } else if (ctx.subroutineType().METHOD() != undefined) {
            subroutineType = SubroutineType.Method;
        } else if (ctx.subroutineType().FUNCTION() != undefined) {
            subroutineType = SubroutineType.Function;
        } else {
            throw new Error("Invalid subroutine type")
        }
        const subroutineWithoutTypeCtx = ctx.subroutineDecWithoutType()
        const nameCtx = subroutineWithoutTypeCtx.subroutineName()
        const subroutineName = nameCtx.text
        const id = this.className + "." + subroutineName
        if (this.globalSymbolTable[id] != undefined) {
            this.errors.push(new DuplicatedSubroutineError(nameCtx.start.line, nameCtx.start.startIndex, subroutineName));
        }
        const paramsCount = subroutineWithoutTypeCtx.parameterList().parameter().length
        this.globalSymbolTable[id] = {
            subroutineInfo: {
                type: subroutineType,
                paramsCount: paramsCount,
            }
        } as GenericSymbol;
    }

    resetErrors() {
        this.errors = [];
    }
}

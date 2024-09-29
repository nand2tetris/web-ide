import { TerminalNode } from "antlr4ts/tree/TerminalNode";
import { ClassDeclarationContext, SubroutineBodyContext, SubroutineDeclarationContext, SubroutineDecWithoutTypeContext, VarDeclarationContext, VarNameInDeclarationContext } from "../generated/JackParser";
import { JackParserListener } from "../generated/JackParserListener";
import { DuplicatedSubroutineError } from '../error'
import { builtInSymbols, builtInTypes } from "../builtins";
import { GenericSymbol, SubroutineInfo, SubroutineType } from "../symbol";

const primitives = new Set(builtInTypes);
export type Primitive = typeof primitives extends Set<infer S> ? S : never;

/**
 * Creates global symbol table that contains built-in functions and found classes and subroutines
 */
export class BinderListener implements JackParserListener {
    // key can be class or <class>.<subroutine_name>
    public globalSymbolTable: Record<string, GenericSymbol> = structuredClone(builtInSymbols);
    public className = "";
    public errors: DuplicatedSubroutineError[] = []
    private subRoutineInfo: SubroutineInfo = {} as SubroutineInfo;
    private subroutineVarsCount: number = 0;
    private stopProcessingSubroutines = false;
    private subroutineId = "";
    //to fix compiler error
    visitTerminal?: (/*@NotNull*/ node: TerminalNode) => void;

    enterClassDeclaration(ctx: ClassDeclarationContext) {
        if (this.globalSymbolTable[ctx.className()!.text] != undefined) {
            this.errors.push(new DuplicatedSubroutineError(ctx.start.line, ctx.start.startIndex, `Class "${ctx.className()!.text}" is already defined.`));
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
            this.stopProcessingSubroutines = true;
        } else {
            this.subroutineId = id;
        const paramsCount = subroutineWithoutTypeCtx.parameterList().parameter().length
            this.subRoutineInfo = {
                type: subroutineType,
                paramsCount: paramsCount,
            }
            this.subroutineVarsCount = 0;
            this.stopProcessingSubroutines = false;
        }
    }
    enterVarNameInDeclaration(ctx: VarNameInDeclarationContext) {
        if (this.stopProcessingSubroutines) return;
        this.subroutineVarsCount++;
    };
    exitSubroutineBody(ctx: SubroutineBodyContext) {
        if (this.stopProcessingSubroutines) return;
        this.subRoutineInfo.localVarsCount = this.subroutineVarsCount;
        this.globalSymbolTable[this.subroutineId] = { subroutineInfo: this.subRoutineInfo }
    };

    resetErrors() {
        this.errors = [];
    }
}


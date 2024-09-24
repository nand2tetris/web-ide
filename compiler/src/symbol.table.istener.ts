import { ParseTreeListener } from "antlr4ts/tree/ParseTreeListener";
import { ClassDeclarationContext, ClassVarDecContext, ConstructorContext, FunctionContext, JackParser, MethodContext, StaticFieldDeclarationContext, SubroutineDecContext, SubroutineDecWithoutTypeContext, SubroutineReturnTypeContext, VarDecContext, VarTypeContext } from "./generated/JackParser";
import { JackParserListener } from "./generated/JackParserListener";
import { TerminalNode } from "antlr4ts/tree/TerminalNode";

const primitives = new Set(["int", "boolean", "char"] as const);
export type Primitive = typeof primitives extends Set<infer S> ? S : never;

/**
 * Generic symbol. Can be used for both class and function symbols
 */
interface GenericSymbol extends Symbol {
    subroutineParameterCount?: number;
}
/**
 * Symbol table. Key represents class name or <class_name>.<subroutine_name>
 */
interface SymbolTale {
    [key: string]: GenericSymbol;
}

export class SymbolTableListener implements JackParserListener, ParseTreeListener {

    //wh do we need that? 
    // to check if symbol exists (function or class) and also check subroutine declaration so that we are are supplying right ammount of params 
    public globalSymbolTable: SymbolTale = {};
    //track class variables, local vars, function args 
    // localSymbolTable =  [];
    className = "";
    public errors: string[] = []
    // fix compiler error
    visitTerminal?: (/*@NotNull*/ node: TerminalNode) => void;

    enterClassDeclaration(ctx: ClassDeclarationContext) {
        if (this.globalSymbolTable[ctx.className()!.text] != undefined) {
            this.errors.push(`Class "${ctx.className()!.text}" already defined.`);
            return;
        }
        this.globalSymbolTable[ctx.className()!.text] = {} as GenericSymbol;
        this.className = ctx.className()?.text;
        console.log(`Entering class ${ctx.className()?.text}`);
    };
    enterStaticFieldDeclaration(ctx: StaticFieldDeclarationContext) {
        const fieldList = ctx.fieldList();
        console.log(`static field: ${fieldList.varType().text} ${fieldList.fieldName().map(t => t.text).join(",")}`);
    };


    enterVarDec(ctx: VarDecContext) {
        const names = ctx.IDENTIFIER();
        console.log(`Function var: ${this.getType(ctx.varType())} ${names.join(",")}`);
    };

    enterConstructor(ctx: ConstructorContext) {
        this.addSymbol(ctx.subroutineDecWithoutType())
        this.printSubroutine("Ctor", ctx.subroutineDecWithoutType())
    };
    addSymbol(c: SubroutineDecWithoutTypeContext) {
        const subroutineName = c.subroutineName().text
        const id = this.className + "." + subroutineName
        if (this.globalSymbolTable[id] != undefined) {
            this.errors.push(`Subroutine "${subroutineName}" is already defined.`);
        }
        this.globalSymbolTable[id] = {
            subroutineParameterCount: c.parameterList().parameter().length
        } as GenericSymbol;
    }
    enterMethod(ctx: MethodContext) {
        this.addSymbol(ctx.subroutineDecWithoutType())
        this.printSubroutine("Method", ctx.subroutineDecWithoutType())
    };
    enterFunction(ctx: FunctionContext) {
        this.addSymbol(ctx.subroutineDecWithoutType())
        this.printSubroutine("Function", ctx.subroutineDecWithoutType())
    };

    printSubroutine(type: string, c: SubroutineDecWithoutTypeContext) {
        const returnType = this.getSubroutineReturnType(c.subroutineReturnType())
        const paramList = c.parameterList().parameter().map(t => t.varType().text + " " + t.parameterName().text).join(",");
        console.log(`${type}: ${returnType} ${c.subroutineName().text} (${paramList})`);
    }

    getType(ctx: VarTypeContext): string {
        return ctx.BOOLEAN() ? "boolean" :
            ctx.INT() ? "int" :
                ctx.CHAR() ? "char" :
                    ctx.IDENTIFIER() ? ctx.IDENTIFIER()!.text :
                        "unknown";
    }

    getSubroutineReturnType(ctx: SubroutineReturnTypeContext): string {
        return ctx.VOID() ? "void" : this.getType(ctx.varType()!);
    }
    resetErrors() {
        this.errors = [];
    }
}

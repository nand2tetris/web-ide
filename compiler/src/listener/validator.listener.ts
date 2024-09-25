import { ParseTreeListener } from "antlr4ts/tree/ParseTreeListener";
import { TerminalNode } from "antlr4ts/tree/TerminalNode";
import { DuplicatedVarException, JackCompilerError } from "../error";
import { FieldDeclarationContext, SubroutineBodyContext, VarDeclarationContext } from "../generated/JackParser";
import { JackParserListener } from "../generated/JackParserListener";
import { GenericSymbol } from "./symbol.table.listener";


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
    constructor(private globalSymbolTable: Record<string, GenericSymbol>, public errors: JackCompilerError[] = []) { }

    enterFieldDeclaration(ctx: FieldDeclarationContext) {
        for (const fieldName of ctx.fieldList().fieldName().map(v=>v.text)) {
            this.localSymbolTableAdd(fieldName);
        }
    };

    enterSubroutineBody(ctx: SubroutineBodyContext) {
        this.localSymbolTable.pushStack();
    };
    
    enterVarDec(ctx: VarDeclarationContext) {
        //validate duplicate variable declarations
        const varNames = ctx.varName().map(v => v.text)
        for (const varName of varNames) {
            this.localSymbolTable.add(varName);
        }
    };
    exitSubroutineBody(ctx: SubroutineBodyContext) {
        this.localSymbolTable.popStack();
    };

    localSymbolTableAdd(name: string) {
        if (this.localSymbolTable.lookup(name)) {
            this.errors.push(new DuplicatedVarException(name));
        }
    }
    //to fix compiler error
    visitTerminal?: (/*@NotNull*/ node: TerminalNode) => void;
}

export class LocalSymbolTable {
    constructor(private scopeVarDecs: string[][] = [[]]) {

    }
    lookup(name: string): boolean {
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
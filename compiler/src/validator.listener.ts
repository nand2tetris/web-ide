import { ParseTreeListener } from "antlr4ts/tree/ParseTreeListener";
import { JackParserListener } from "./generated/JackParserListener";
import { GenericSymbol } from "./symbol.table.istener";
import { TerminalNode } from "antlr4ts/tree/TerminalNode";

export class ValidatorListener implements JackParserListener, ParseTreeListener {
    /**
     *  List of validations rules:
     * - variable declaration - validate duplicate variable declarations
     * - let statement - validate variable is declared
     * - `Subroutine ${subroutine.name.value}: not all code paths return a value`,
     * - `A non void subroutine must return a value`,
     * - Undeclared variable
     * - Unknown type for return type, class variable, or method local var
     * - OS subroutine ${this.className}.${subroutine.name.value} must follow the interface
     * - validate arg number
     * -   `Method ${className}.${subroutineName} was called as a function/constructor`
     * - Subroutine was called as a method
     * - `Class ${className} doesn't contain a function/constructor ${subroutineName}`
     * - `Class ${className} doesn't exist`
     */
    
    //TODO: change
    localSymbolTable: Record<string, any> = {};
    constructor(private globalSymbolTable: Record<string, GenericSymbol>) { }




    //to fix compiler error
    visitTerminal?: (/*@NotNull*/ node: TerminalNode) => void;
}
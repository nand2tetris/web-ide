import { Scope, SymbolTable, SymbolTableEntry } from "../src/symbol.table";

describe('symbol table', () => {
    test('basic', () => {
        const symbolTable = new SymbolTable();
        symbolTable.insert(new SymbolTableEntry('test', 'int', Scope.local));
        expect(symbolTable.lookup('test')).toEqual(new SymbolTableEntry('test', 'int', Scope.local));
        expect(symbolTable.lookup('a')).toBeUndefined();
    });
});
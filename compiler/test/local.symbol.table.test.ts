import { LocalSymbolTable, ScopeType } from "../src/symbol";

describe('LocalSymbolTable', () => {
    const jestConsole = console;

    beforeEach(() => {
        global.console = require('console');
    });

    afterEach(() => {
        global.console = jestConsole;
    });



    test('add', () => {
        const localSymbolTable = new LocalSymbolTable();
        const variableNames = ['testVariable1', 'testVariable2', 'testVariable3'];

        variableNames.forEach(variableName => {
            localSymbolTable.add(ScopeType.Local, variableName, "int")
            expect(localSymbolTable.existsSymbol(variableName)).toBe(true);
            expect(localSymbolTable.existsSymbol(variableName + "_")).toBe(false);

        });
    })

});
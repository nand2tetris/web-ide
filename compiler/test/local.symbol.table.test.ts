import { LocalSymbolTable } from "../src/symbol";

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
            localSymbolTable.add(variableName, "int")
            expect(localSymbolTable.existsSymbol(variableName)).toBe(true);
            expect(localSymbolTable.existsSymbol(variableName + "_")).toBe(false);

        });

    })
    test('push and pop stack', () => {
        const localSymbolTable = new LocalSymbolTable();
        const classVar = 'a';
        const functionVar = 'b';

        localSymbolTable.add(classVar, "boolean");


        localSymbolTable.pushStack();
        localSymbolTable.add(functionVar, "boolean");

        expect(localSymbolTable.existsSymbol(classVar)).toBe(true);
        expect(localSymbolTable.existsSymbol(functionVar)).toBe(true);

        localSymbolTable.popStack();

        expect(localSymbolTable.existsSymbol(classVar)).toBe(true);
        expect(localSymbolTable.existsSymbol(functionVar)).toBe(false);

    })

});
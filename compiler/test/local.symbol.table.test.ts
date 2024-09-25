import { LocalSymbolTable } from "../src/listener/validator.listener";

describe('LocalSymbolTable', () => {
    test('add', () => {
        const localSymbolTable = new LocalSymbolTable();
        const variableNames = ['testVariable1', 'testVariable2', 'testVariable3'];

        variableNames.forEach(variableName => {
            localSymbolTable.add(variableName)
            expect(localSymbolTable.lookup(variableName)).toBe(true);
            expect(localSymbolTable.lookup(variableName + "_")).toBe(false);

        });

    })
    test('push and pop stack', () => {
        const localSymbolTable = new LocalSymbolTable();
        const classVar = 'a';
        const functionVar = 'b';

        localSymbolTable.add(classVar);


        localSymbolTable.pushStack();
        localSymbolTable.add(functionVar);

        expect(localSymbolTable.lookup(classVar )).toBe(true);
        expect(localSymbolTable.lookup(functionVar)).toBe(true);

        localSymbolTable.popStack();

        expect(localSymbolTable.lookup(classVar)).toBe(true);
        expect(localSymbolTable.lookup(functionVar)).toBe(false);
        
    })

});
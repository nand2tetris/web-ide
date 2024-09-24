import { ParseTreeWalker } from "antlr4ts/tree/ParseTreeWalker";
import { ErrorListener } from "../src/error.listener";
import { GenericSymbol, SymbolTableListener } from "../src/symbol.table.istener";
import { DuplicatedSubroutineError } from "../src/error";
import { parseJack, getTestResourcePath } from "./test.helper";
import fs from 'fs';
import path from "path";

describe('Global symbol table', () => {

    test("should fail on duplicated subroutine", () => {
        const filePath = getTestResourcePath("DuplicatedSubroutine.jack");
        const errorListener = ErrorListener.getInstance()
        const globalSymbolsListener = traverseTree(errorListener, filePath);
        const symbolsErrors = globalSymbolsListener.errors
        expect(globalSymbolsListener.errors.length).toBe(1)
        expect(symbolsErrors[0]).toBeInstanceOf(DuplicatedSubroutineError)
    })

    test("basic", () => {
        const expected = {
            'Fraction': {},
            'Fraction.new': { subroutineParameterCount: 2 },
            'Fraction.reduce': { subroutineParameterCount: 0 },
            'Fraction.getNumerator': { subroutineParameterCount: 0 },
            'Fraction.getDenominator': { subroutineParameterCount: 0 },
            'Fraction.plus': { subroutineParameterCount: 1 },
            'Fraction.dispose': { subroutineParameterCount: 0 },
            'Fraction.print': { subroutineParameterCount: 0 },
            'Fraction.gcd': { subroutineParameterCount: 2 },
            'Main': {},
            'Main.main': { subroutineParameterCount: 0 }
        }
        let globalSymbolsListener = new SymbolTableListener()

        const testFolder = getTestResourcePath("Fraction");
        const files = fs.readdirSync(testFolder).filter(file => file.endsWith(".jack")).map(file => path.join(testFolder, file));
        const symbols = []
        for (const filePath of files) {

            const errorListener = ErrorListener.getInstance()
            globalSymbolsListener = traverseTree(errorListener, filePath, globalSymbolsListener);
        }
        expect(globalSymbolsListener.globalSymbolTable).toEqual(expected)

    })
})
function traverseTree(errorListener: ErrorListener, filePath: string, globalSymbolsListener = new SymbolTableListener()) {
    errorListener.filepath = filePath;
    const tree = parseJack(filePath, errorListener);

    expect(errorListener.error).toBe(false);

    ParseTreeWalker.DEFAULT.walk(globalSymbolsListener, tree);
    return globalSymbolsListener;
}


import { ParseTreeWalker } from 'antlr4ts/tree/ParseTreeWalker';
import fs from 'fs';
import { SymbolTableListener } from "../src/symbol.table.istener";

import path from "path";
import { ErrorListener } from "../src/error.listener";
import { getTestResourcePath, parseJack } from "./test.helper";


describe('Parser', () => {
    const jestConsole = console;

    beforeEach(() => {
        global.console = require('console');
    });

    afterEach(() => {
        global.console = jestConsole;
    });

    const dirs: string[] = [
        "Average",
        "ConvertToBin",
        "Fraction",
        "HelloWorld",
        "List",
        "Pong",
        "Square",
        "ComplexArrays"
    ]
    test.each(dirs)('%s', (dir: string) => {
        console.log("Testing " + dir)
        testJackDir(path.join(__dirname, "resources", dir));
    });
});

function testJackDir(testFolder: string): void {

    const globalSymbolsListener = new SymbolTableListener();
    const files = fs.readdirSync(testFolder).filter(file => file.endsWith(".jack")).map(file => path.join(testFolder, file));
    for (const filePath of files) {
        const errorListener = ErrorListener.getInstance()
        errorListener.filepath = filePath;
        const tree = parseJack(filePath, errorListener);
        expect(errorListener.error).toBe(false)
        // console.log(tree.toStringTree(parser.ruleNames));

        ParseTreeWalker.DEFAULT.walk(globalSymbolsListener, tree);
        const symbolsErrors = globalSymbolsListener.errors.join("\n")
        try {
            expect(globalSymbolsListener.errors.length).toBe(0)
        }
        catch (e) {
            throw new Error(symbolsErrors);
        }
        globalSymbolsListener.resetErrors();
    }
}

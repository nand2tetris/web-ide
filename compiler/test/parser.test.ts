import { JackLexer } from "../src/generated/JackLexer";
import { JackParser } from "../src/generated/JackParser";
import { SymbolTableListener } from "../src/symbol.table.istener";
import fs from 'fs';
import { ParseTreeWalker } from 'antlr4ts/tree/ParseTreeWalker'

import { CommonTokenStream, BufferedTokenStream, CharStreams } from 'antlr4ts';
import path from "path";
import { ErrorListener } from "../src/error.listener";
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
        "Square"
    ]
    test.each(dirs)('%s', (dir: string) => {
        console.log("Testing " + dir)
        testJack(dir);
        // console.log("File", f)
    });

});
function testJack(testName: string, trace = false) {
    var filePath = path.join(__dirname, "resources", testName);
    testJackDir(filePath);
}
function testJackDir(testFolder: string) {

    const globalSymbolsListener = new SymbolTableListener();
    const files = fs.readdirSync(testFolder).filter(file => file.endsWith(".jack")).map(file => path.join(testFolder, file));
    for (const filePath of files) {

        const f = fs.readFileSync(filePath, 'utf8');
        // console.log(f);
        // Create the lexer and parser
        const inputStream = CharStreams.fromString(f);
        const lexer = new JackLexer(inputStream);
        const errorListener = ErrorListener.getInstance();
        errorListener.filepath = filePath;
        lexer.removeErrorListeners();
        lexer.addErrorListener(errorListener);

        const tokenStream = new CommonTokenStream(lexer);
        // const tokens = tokenStream.getTokens()
        // console.log("Tokens ", )
        expect(tokenStream.getTokens.length).toBeGreaterThan(0)
        const parser = new JackParser(tokenStream);
        // parser.isTrace = true;
        parser.removeErrorListeners();
        parser.addErrorListener(errorListener);
        // Parse the input, where `compilationUnit` is whatever entry point you defined
        const tree = parser.program();
        // expect(errorListener.error).toBe(false)
        // console.log(tree.toStringTree(parser.ruleNames));

        // Create the visitor
        // const v = new Visitor();
        // // Use the visitor entry point
        // const res = v.visit(tree);
        // console.log("Res", res);
        ParseTreeWalker.DEFAULT.walk(globalSymbolsListener, tree);
        const symbolsErrors = globalSymbolsListener.errors.join("\n")
        try {
            expect(globalSymbolsListener.errors.length,).toBe(0)
        }
        catch (e) {
            throw new Error(symbolsErrors);
        }

        globalSymbolsListener.resetErrors();

    }
    console.log("GlobalSymbolTable", globalSymbolsListener.globalSymbolTable)
}
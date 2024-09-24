import path from "path";
import { SymbolTableListener } from "./symbol.table.istener";
import fs from "fs";
import { ParseTreeWalker } from "antlr4ts/tree/ParseTreeWalker";
import { JackParser } from "./generated/JackParser";
import { CharStreams, CommonTokenStream } from "antlr4ts";
import { JackLexer } from "./generated/JackLexer";
import { ErrorListener } from "./error.listener";
import { ValidatorListener } from "./validator.listener";
export default class Compiler {
    static compile(dir: string): string {

        const globalSymbolsListener = new SymbolTableListener();
        const files = fs.readdirSync(dir).filter(file => file.endsWith(".jack")).map(file => path.join(dir, file));
        for (const filePath of files) {
            const errorListener = ErrorListener.getInstance()
            errorListener.filepath = filePath; const f = fs.readFileSync(filePath, 'utf8');
            const inputStream = CharStreams.fromString(f);
            const lexer = new JackLexer(inputStream);
            if (errorListener) {

                lexer.removeErrorListeners();
                lexer.addErrorListener(errorListener);
            }

            const tokenStream = new CommonTokenStream(lexer);
            expect(tokenStream.getTokens.length).toBeGreaterThan(0)
            const parser = new JackParser(tokenStream);
            // parser.isTrace = trace;
            if (errorListener != undefined) {
                parser.removeErrorListeners();
                parser.addErrorListener(errorListener);
            }
            const tree = parser.program();
            //TODO add error handling here
            if (errorListener.error) {
                console.error(errorListener.filepath + " has syntax errors");
                continue
            }
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
            if (globalSymbolsListener.className != path.parse(filePath).name) {
                console.log("Class name does not match file name: " + globalSymbolsListener.className + " vs " + path.parse(filePath).name);
            }

            //TODO: add OS builtin functions
            const validator = new ValidatorListener(globalSymbolsListener.globalSymbolTable);
        }
        return "";
    }
}
import { ANTLRErrorListener, CharStreams, CommonTokenStream } from "antlr4ts";
import { JackParser } from "../src/generated/JackParser";
import { JackLexer } from "../src/generated/JackLexer";
import fs from 'fs';
import path from "path";

export function parseJack(filePath: string, errorListener?: ANTLRErrorListener<any>, trace = false) {
    const f = fs.readFileSync(filePath, 'utf8');
    const inputStream = CharStreams.fromString(f);
    const lexer = new JackLexer(inputStream);
    if (errorListener) {

        lexer.removeErrorListeners();
        lexer.addErrorListener(errorListener);
    }

    const tokenStream = new CommonTokenStream(lexer);
    expect(tokenStream.getTokens.length).toBeGreaterThan(0)
    const parser = new JackParser(tokenStream);
    parser.isTrace = trace;
    if (errorListener != undefined) {
        parser.removeErrorListeners();
        parser.addErrorListener(errorListener);
    }
    return parser.program();
}

export function getTestResourcePath(relativePath: string) {
    return path.join(__dirname, "resources", relativePath);
}

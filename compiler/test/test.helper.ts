import { ANTLRErrorListener, CharStreams, CommonTokenStream } from "antlr4ts";
import { JackParser, ProgramContext } from "../src/generated/JackParser";
import { JackLexer } from "../src/generated/JackLexer";
import fs from 'fs';
import path from "path";
import { ParseTreeListener } from "antlr4ts/tree/ParseTreeListener";
import { ParseTreeWalker } from "antlr4ts/tree/ParseTreeWalker";

export function parseJackFile(filePath: string, errorListener?: ANTLRErrorListener<any>, trace = false) {
    const f = fs.readFileSync(filePath, 'utf8');
    return parseJackText(f, errorListener, trace);
}

export function parseJackText(source: string, errorListener: ANTLRErrorListener<any> | undefined, trace: boolean = false) {
    console.log("Source", source)
    const inputStream = CharStreams.fromString(source);
    const lexer = new JackLexer(inputStream);
    if (errorListener) {

        lexer.removeErrorListeners();
        lexer.addErrorListener(errorListener);
    }

    const tokenStream = new CommonTokenStream(lexer);
    expect(tokenStream.getTokens.length).toBeGreaterThan(0);
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

export function traverseTree<T extends ParseTreeListener>(tree: ProgramContext, listener: T) {
    ParseTreeWalker.DEFAULT.walk(listener, tree);
    return listener;
}

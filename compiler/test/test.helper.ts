import { ANTLRErrorListener, CharStreams, CommonTokenStream, ParserRuleContext } from "antlr4ts";
import { JackParser, ProgramContext } from "../src/generated/JackParser";
import { JackLexer } from "../src/generated/JackLexer";
import fs from 'fs';
import path from "path";
import { ParseTreeListener } from "antlr4ts/tree/ParseTreeListener";
import { ParseTreeWalker } from "antlr4ts/tree/ParseTreeWalker";
import { JackCompilerError } from "../src/error";
import { ErrorListener } from "../src/listener/error.listener";

export function parseJackFile(filePath: string, trace = false) {
    const errorListener: ErrorListener = new ErrorListener()
    errorListener.filepath = filePath
    const f = fs.readFileSync(filePath, 'utf8');
    return parseJackText(f, errorListener, trace);
}

export function parseJackText(src: string, errorListener?: ErrorListener, trace: boolean = false): ProgramContext {
    if (errorListener === undefined) {
        errorListener = new ErrorListener();
    }
    const inputStream = CharStreams.fromString(src);
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
    const tree = parser.program()
    if (errorListener.errors.length > 0) {
        console.error("Parser or lexer errors found");
        handleErrors(src, errorListener.errors);
    }
    return tree;
}

export function getTestResourcePath(relativePath: string) {
    return path.join(__dirname, "resources", relativePath);
}

export function listenToTheTree<T extends ParseTreeListener>(tree: ProgramContext, listener: T) {
    ParseTreeWalker.DEFAULT.walk(listener, tree);
    return listener;
}


export function handleErrors(src: string, errors: JackCompilerError[]) {
    const msg = errors.map(e => {
        return `${e.line}:${e.charPositionInLine} ${e.msg}\n${src.split("\n")[e.line]}`
    }).join("\n")
    console.error(msg);
    throw new Error(msg)
}
export const testResourcesDirs: string[] = [
    "Average",
    "ConvertToBin",
    "Fraction",
    "HelloWorld",
    "List",
    "Pong",
    "Square",
    "ComplexArrays"
]


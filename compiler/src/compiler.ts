import path from "path";
import { BinderListener } from "./listener/binder.listener";
import fs from "fs";
import { ParseTreeWalker } from "antlr4ts/tree/ParseTreeWalker";
import { JackParser } from "./generated/JackParser";
import { CharStreams, CommonTokenStream } from "antlr4ts";
import { JackLexer } from "./generated/JackLexer";
import { ErrorListener } from "./listener/error.listener";
import { ValidatorListener } from "./listener/validator.listener";
import { JackCompilerError } from "./error";
import { VMWriter } from "./listener/vm.writer.listener";
export default class Compiler {
    static compile(src: string): string | JackCompilerError[] {

        const globalSymbolsListener = new BinderListener();
        const errorListener = new ErrorListener();
        const lexer = new JackLexer(CharStreams.fromString(src));
        if (errorListener) {
            lexer.removeErrorListeners();
            lexer.addErrorListener(errorListener);
        }
        const tokenStream = new CommonTokenStream(lexer);
        const parser = new JackParser(tokenStream);
        // parser.isTrace = trace;
        if (errorListener != undefined) {
            parser.removeErrorListeners();
            parser.addErrorListener(errorListener);
        }
        const tree = parser.program();
        if (errorListener.errors.length > 0) {
            return errorListener.errors;
        }
        // console.log(tree.toStringTree(parser.ruleNames));

        ParseTreeWalker.DEFAULT.walk(globalSymbolsListener, tree);
        if (globalSymbolsListener.errors.length > 0) {
            return globalSymbolsListener.errors;
        }
        const validator = new ValidatorListener(globalSymbolsListener.globalSymbolTable);
        ParseTreeWalker.DEFAULT.walk(validator, tree);
        if (validator.errors.length > 0) {
            return globalSymbolsListener.errors;
        }
        const vmWriter = new VMWriter(globalSymbolsListener.globalSymbolTable);
        ParseTreeWalker.DEFAULT.walk(vmWriter, tree);

        return vmWriter.result;
    }
}
import { BinderListener } from "./listener/binder.listener.js";
import { CustomErrorListener } from "./listener/error.listener.js";
import { ValidatorListener } from "./listener/validator.listener.js";
import { JackCompilerError, LexerOrParserError } from "./error.js";
import { VMWriter } from "./listener/vm.writer.listener.js";
import JackParser, { ProgramContext } from "./generated/JackParser.js";
import { CharStreams, CommonTokenStream, ParseTreeWalker } from "antlr4";
import JackLexer from "./generated/JackLexer.js";
import { CompilationError } from "../languages/base.js";

export function compile(
  files: Record<string, string>,
): Record<string, string | CompilationError> {
  try {
    return _compile(files);
  } catch (err) {
    const result: Record<string, CompilationError> = {};
    console.error(err);
    const keys = Object.keys(files);
    for (const name of keys) {
      result[name] = {
        message:
          "Something went wrong while compiling files. Please create a bug report",
      } as CompilationError;
    }
    return result;
  }
}
function _compile(
  files: Record<string, string>,
): Record<string, string | CompilationError> {
  if (files instanceof LexerOrParserError) {
    throw new Error("Expected tree but got a lexer or parser error");
  }
  const result: Record<string, string | CompilationError> = {};
  for (const name of Object.keys(files)) {
    result[name] = "";
  }
  const trees: Record<string, ProgramContext> = {};
  const errors: Record<string, CompilationError> = {};
  const compiler = new Compiler();
  for (const [name, content] of Object.entries(files)) {
    const treeOrErrors = compiler.parserAndBind(content);
    if (Array.isArray(treeOrErrors)) {
      errors[name] = toCompilerError(treeOrErrors);
    }
    trees[name] = treeOrErrors as ProgramContext;
  }
  if (Object.keys(errors).length > 0) {
    for (const [name, error] of Object.entries(errors)) {
      result[name] = error;
    }
    return result;
  }

  for (const [name, tree] of Object.entries(trees)) {
    const compiledOrErrors = compiler.compile(tree);
    if (Array.isArray(compiledOrErrors)) {
      result[name] = toCompilerError(compiledOrErrors);
    } else {
      result[name] = compiledOrErrors;
    }
  }
  return result;
}
function toCompilerError(errors: JackCompilerError[]): CompilationError {
  const err = errors[0];
  return {
    message: `Line ${err.span.line}: ${err.msg}`,
    span: err.span,
  } as CompilationError;
}

export class Compiler {
  private binder = new BinderListener();
  private errorListener = new CustomErrorListener();
  compile(tree: ProgramContext): string | JackCompilerError[] {
    if (Object.keys(this.binder.globalSymbolTable).length == 0) {
      throw new Error(
        "Please populate global symbol table using parserAndBind method",
      );
    }
    const validator = new ValidatorListener(this.binder.globalSymbolTable);
    ParseTreeWalker.DEFAULT.walk(validator, tree);
    if (validator.errors.length > 0) {
      console.log("Errors in validator " + JSON.stringify(validator.errors));
      return validator.errors;
    }
    const vmWriter = new VMWriter(this.binder.globalSymbolTable);
    ParseTreeWalker.DEFAULT.walk(vmWriter, tree);
    return vmWriter.result;
  }

  parserAndBind(src: string): ProgramContext | JackCompilerError[] {
    const lexer = new JackLexer(CharStreams.fromString(src));
    lexer.removeErrorListeners();
    lexer.addErrorListener(this.errorListener);
    const tokenStream = new CommonTokenStream(lexer);
    const parser = new JackParser(tokenStream);
    parser.removeErrorListeners();
    parser.addErrorListener(this.errorListener);
    const tree = parser.program();
    if (this.errorListener.errors.length > 0) {
      console.log("Errors when parsing or lexing");
      return this.errorListener.errors;
    }
    ParseTreeWalker.DEFAULT.walk(this.binder, tree);
    if (this.binder.errors.length > 0) {
      console.log("Errors in binder");
      return this.binder.errors;
    }
    return tree;
  }
}

import { JackGlobalSymbolTableListener } from "./listener/global.symbol.table.listener.js";
import { JackCustomErrorListener } from "./listener/error.listener.js";
import { JackValidatorListener } from "./listener/validator.listener.js";
import { JackCompilerError, LexerOrParserError } from "./error.js";
import { JackVMWriter } from "./listener/vm.writer.listener.js";
import JackParser, { ProgramContext } from "./generated/JackParser.js";
import { CharStreams, CommonTokenStream, ParseTreeWalker } from "antlr4";
import JackLexer from "./generated/JackLexer.js";
import { CompilationError } from "../languages/base.js";

export function compile(
  files: Record<string, string>,
): Record<string, string | CompilationError> {
  return _doWithTryCatch(files, Command.Compile);
}

export function validate(
  files: Record<string, string>,
): Record<string, string | CompilationError> {
  return _doWithTryCatch(files, Command.Validate);
}
function _doWithTryCatch(files: Record<string, string>, cmd: Command) {
  try {
    return _do(files, cmd);
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
enum Command {
  Compile,
  Validate,
}

function _do(
  files: Record<string, string>,
  cmd: Command,
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
  const compiler = new JackCompiler();
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
    let compiledOrValidatedOrErrors;
    switch (cmd) {
      case Command.Compile:
        compiledOrValidatedOrErrors = compiler.compile(tree, name);

        if (Array.isArray(compiledOrValidatedOrErrors)) {
          result[name] = toCompilerError(compiledOrValidatedOrErrors);
        } else {
          result[name] = compiledOrValidatedOrErrors;
        }
        break;
      case Command.Validate:
        compiledOrValidatedOrErrors = compiler.validate(tree, name);
        if (Array.isArray(compiledOrValidatedOrErrors)) {
          result[name] = toCompilerError(compiledOrValidatedOrErrors);
        } else {
          result[name] = "";
        }
        break;
      default:
        throw new Error("Invalid command");
    }
  }
  return result;
}
function toCompilerError(errors: JackCompilerError[]): CompilationError {
  const err = errors[0];
  return {
    message: `Line ${err.span.line}: ${err.message}`,
    span: err.span,
  } as CompilationError;
}

export class JackCompiler {
  private globalSymbolTableListener = new JackGlobalSymbolTableListener();
  private errorListener = new JackCustomErrorListener();
  validate(
    tree: ProgramContext,
    filename?: string,
  ): ProgramContext | JackCompilerError[] {
    if (Object.keys(this.globalSymbolTableListener.globalSymbolTable).length == 0) {
      throw new Error(
        "Please populate global symbol table using parserAndBind method",
      );
    }
    const validator = new JackValidatorListener(
      this.globalSymbolTableListener.globalSymbolTable,
      filename,
    );
    ParseTreeWalker.DEFAULT.walk(validator, tree);

    return validator.errors.length > 0 ? validator.errors : tree;
  }
  compile(
    tree: ProgramContext,
    filename?: string,
  ): string | JackCompilerError[] {
    const treeOrErrors = this.validate(tree, filename);
    if (Array.isArray(treeOrErrors)) {
      const errors = treeOrErrors as JackCompilerError[];
      console.log("Errors in validator " + JSON.stringify(errors));
      return errors;
    }
    const validateTree = treeOrErrors as ProgramContext;
    const vmWriter = new JackVMWriter(this.globalSymbolTableListener.globalSymbolTable);
    ParseTreeWalker.DEFAULT.walk(vmWriter, validateTree);
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
    ParseTreeWalker.DEFAULT.walk(this.globalSymbolTableListener, tree);
    if (this.globalSymbolTableListener.errors.length > 0) {
      console.log("Errors when creating global symbol table");
      return this.globalSymbolTableListener.errors;
    }
    return tree;
  }
}

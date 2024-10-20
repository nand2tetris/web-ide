import { FileSystem } from "@davidsouther/jiffies/lib/esm/fs.js";
import { NodeFileSystemAdapter } from "@davidsouther/jiffies/lib/esm/fs_node.js";
import path from "path";
import { builtInSymbols } from "../builtins";
import { JackCompilerErrorType } from "../error";
import { createSubroutineSymbol, SubroutineType } from "../symbol";
import {
  getTestResourcePath,
  listenToTheTree,
  parseJackFile,
  parseJackText,
} from "../test.helper";
import { GlobalSymbolTableListener } from "./global.symbol.listener";

describe("Jack global symbol table listener", () => {
  const jestConsole = console;
  let fs: FileSystem;
  beforeEach(() => {
    global.console = require("console");
    fs = new FileSystem(new NodeFileSystemAdapter());
  });

  afterEach(() => {
    global.console = jestConsole;
  });

  test("should fail on duplicated subroutine", () => {
    const input = `
      class A {
          function void f(){
              return;
          }
          function int f(){
              return 1;
          }
      }`;
    testJackGlobalSymbolListener(input, "DuplicatedSubroutineError");
  });

  test("duplicated class", () => {
    const input = `
      class A {
      }`;
    const globalSymbolTableListener = new GlobalSymbolTableListener();
    testJackGlobalSymbolListener(input, undefined, globalSymbolTableListener);
    testJackGlobalSymbolListener(
      input,
      "DuplicatedClassError",
      globalSymbolTableListener,
    );
  });
  test("duplicated built in class", () => {
    const input = `
      class Math {
      }`;
    testJackGlobalSymbolListener(input, "DuplicatedClassError");
  });
  test("basic", async () => {
    const expected = {
      ...builtInSymbols,
      Fraction: {},
      "Fraction.new": createSubroutineSymbol(2, SubroutineType.Constructor, 0),
      "Fraction.reduce": createSubroutineSymbol(0, SubroutineType.Method, 1),
      "Fraction.getNumerator": createSubroutineSymbol(
        0,
        SubroutineType.Method,
        0,
      ),
      "Fraction.getDenominator": createSubroutineSymbol(
        0,
        SubroutineType.Method,
        0,
      ),
      "Fraction.plus": createSubroutineSymbol(1, SubroutineType.Method, 1),
      "Fraction.dispose": createSubroutineSymbol(0, SubroutineType.Method, 0),
      "Fraction.print": createSubroutineSymbol(0, SubroutineType.Method, 0),
      "Fraction.gcd": createSubroutineSymbol(2, SubroutineType.Function, 1),
      Main: {},
      "Main.main": createSubroutineSymbol(0, SubroutineType.Function, 3),
    };
    let globalSymbolsListener = new GlobalSymbolTableListener();

    const testFolder = getTestResourcePath("Fraction");

    const filteredFiles = [...(await fs.readdir(testFolder))]
      .filter((file) => file.endsWith(".jack"))
      .map((file) => path.join(testFolder, file));
    for (const filePath of filteredFiles) {
      const tree = parseJackFile(filePath);
      globalSymbolsListener = listenToTheTree(tree, globalSymbolsListener);
    }
    expect(globalSymbolsListener.globalSymbolTable).toEqual(expected);
  });
});
function testJackGlobalSymbolListener<T extends JackCompilerErrorType>(
  input: string,
  expectedError?: T,
  globalSymbolTableListener = new GlobalSymbolTableListener(),
) {
  const tree = parseJackText(input);
  listenToTheTree(tree, globalSymbolTableListener);
  const errors = globalSymbolTableListener.errors;
  if (expectedError) {
    if (errors.length > 1) {
      console.error("Errors", errors);
    }
    try {
      expect(globalSymbolTableListener.errors.length).toBe(1);
      expect(globalSymbolTableListener.errors[0].type).toBe(expectedError);
    } catch (e) {
      throw new Error(
        `Expected error ${expectedError} but got '` +
          JSON.stringify(globalSymbolTableListener.errors) +
          "'",
      );
    }
  } else {
    if (errors.length != 0)
      throw new Error("Didn't expect any errors but got " + errors.join("\n"));
  }
}

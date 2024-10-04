import fs from "fs";
import path from "path";
import { DuplicatedClassError, DuplicatedSubroutineError } from "../error";
import { BinderListener } from "./binder.listener";
import { createSubroutineSymbol, SubroutineType } from "../symbol";
import { builtInSymbols } from "../builtins";
import {
  getTestResourcePath,
  listenToTheTree,
  parseJackFile,
  parseJackText,
} from "../test.helper";

describe("Jack binder", () => {
  const jestConsole = console;

  beforeEach(() => {
    global.console = require("console");
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
    testBinder(input, DuplicatedSubroutineError)
  });

  test("duplicated class", () => {
    const input = `
      class A {
      }`;
    const binder = new BinderListener();
    testBinder(input, undefined, binder);
    testBinder(input, DuplicatedClassError, binder);
  });
  test("duplicated built in class", () => {
    const input = `
      class Math {
      }`;
    testBinder(input, DuplicatedClassError);
  });
  test("basic", () => {
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
    let globalSymbolsListener = new BinderListener();

    const testFolder = getTestResourcePath("Fraction");
    const files = fs
      .readdirSync(testFolder)
      .filter((file) => file.endsWith(".jack"))
      .map((file) => path.join(testFolder, file));
    for (const filePath of files) {
      const tree = parseJackFile(filePath);
      globalSymbolsListener = listenToTheTree(tree, globalSymbolsListener);
      // console.log("Symbols for " + path.basename(filePath) + ":", globalSymbolsListener.globalSymbolTable)
    }
    expect(globalSymbolsListener.globalSymbolTable).toEqual(expected);
  });
});
function testBinder<T extends { name: string }>(input: string, expectedError?: T, binder = new BinderListener()) {
  const tree = parseJackText(input);
  listenToTheTree(tree, binder);
  const errors = binder.errors;
  if (expectedError) {
    if (errors.length > 1) {
      console.error("Errors", errors);
    }
    try {
      expect(errors.length).toBe(1);
      expect(errors[0]).toBeInstanceOf(expectedError);
    } catch (e) {
      throw new Error(
        `Expected error ${expectedError.name} but got '` +
        errors.join(",") +
        "'",
      );
    }
  } else {
    if (errors.length != 0)
      throw new Error(
        "Didn't expect any errors but got " + errors.join("\n"),
      );
  }

}
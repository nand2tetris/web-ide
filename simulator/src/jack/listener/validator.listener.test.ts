import { FileSystem } from "@davidsouther/jiffies/lib/esm/fs.js";
import { NodeFileSystemAdapter } from "@davidsouther/jiffies/lib/esm/fs_node.js";
import { JackCustomErrorListener } from "./error.listener";
import { JackValidatorListener } from "./validator.listener";
import {
  createSubroutineSymbol,
  GenericSymbol,
  SubroutineType,
} from "../symbol";
import {
  getTestResourcePath,
  listenToTheTree,
  parseJackFile,
  parseJackText,
  testResourceDirs,
} from "../test.helper";
import { JackGlobalSymbolTableListener } from "./global.symbol.table.listener";
import path from "path";
import { ProgramContext } from "../generated/JackParser";
import { JackCompilerErrorType } from "../error";
describe("Jack validator listener", () => {
  const jestConsole = console;
  let fs: FileSystem;
  beforeEach(() => {
    global.console = require("console");
    fs = new FileSystem(new NodeFileSystemAdapter());
  });

  afterEach(() => {
    global.console = jestConsole;
  });

  function genericSymbol(
    type?: SubroutineType,
    paramsCount?: number,
  ): GenericSymbol {
    if (type != undefined && paramsCount != undefined) {
      return createSubroutineSymbol(paramsCount, type);
    } else {
      return {} as GenericSymbol;
    }
  }

  const duplicateVarClassBodies = [
    ["static", "  static int a, a;"],
    ["field", "  field int a, a;"],
    ["static and field", "  static int a; field boolean a;"],
    ["function args", "  function void a(int a, int a){return;}"],
    [
      "function var",
      ` function void a(){ 
            var boolean a, a; 
            return;
             }`,
    ],
    [
      "function var with different types",
      ` function void a(){ 
            var boolean a; 
            var int a;
            return;
             }`,
    ],
  ];
  test.concurrent.each(duplicateVarClassBodies)(
    "duplicated %s",
    (testName, classBody) => {
      testValidator(
        `
            class Main {
              ${classBody}
            }`,
        'DuplicatedVariableError',
      );
    },
  );

  /**
   * Undeclared var
   */
  test("let - undeclared variable ", () => {
    testValidator(
      `
            class Main {
            function void a(){
                let b=1;
                return;
            }
            }`,
      'UndeclaredVariableError',
    );
  });

  test("call function - undeclared variable ", () => {
    testValidator(
      `class Main {
                function void b(int a){
                    return;
                }
                function void a(){
                    do Main.b(a);
                    return;
                }
            }`,
      'UndeclaredVariableError',
      {
        Main: genericSymbol(),
        "Main.b": genericSymbol(SubroutineType.Function, 1),
        "Main.a": genericSymbol(SubroutineType.Function, 1),
      },
    );
  });

  test("if - undeclared variable ", () => {
    testValidator(
      `class Main {
              function void a(){
                if(a=0){
                    return;
                }else {
                   return;
                }
            }
            }`,
      'UndeclaredVariableError',
    );
  });

  /**
   * Unknown class
   */
  test("Unknown class for subroutine return type ", () => {
    testValidator(
      `
            class Main {
            function void b(int a){
                var D d;
                return;
            }
            }`,
      'UnknownClassError',
    );
  });

  test("Known type for subroutine return type ", () => {
    testValidator(
      `
            class Main {
                function D b(int a){
                    return D.new();
                }
            }`,
      undefined,
      {
        D: genericSymbol(),
        "D.new": genericSymbol(SubroutineType.Constructor, 0),
      },
    );
  });
  test("Arg Unknown class  ", () => {
    testValidator(
      `
            class Main {
                function void b(D a){
                    return;
            }
            }`,
      'UnknownClassError',
    );
  });

  test("Arg known type ", () => {
    testValidator(
      `

            class Main {
                function void b(D a){
                    return;
                }
            }`,
      undefined,
      { D: genericSymbol() },
    );
  });
  test("var Unknown class", () => {
    testValidator(
      `
            class Main {
                function void b(){
                    var D d;
                    return;
                }
            }`,
      'UnknownClassError',
    );
  });
  test("var known type", () => {
    testValidator(
      `
            class Main {
                function void b(){
                    var D d;
                    return;
                }
            }`,
      undefined,
      { D: genericSymbol() },
    );
  });
  test("field Unknown class", () => {
    testValidator(
      `
            class Main {
                field T t;
            }`,
      'UnknownClassError',
    );
  });
  test("field known type", () => {
    testValidator(
      `
            class Main {
                field T t;
            }`,
      undefined,
      { T: genericSymbol() },
    );
  });
  test("static field Unknown class", () => {
    testValidator(
      `
            class Main {
                static T t;
            }`,
      'UnknownClassError',
    );
  });
  test("static field known type", () => {
    testValidator(
      `
            class Main {
                static T t;
            }`,
      undefined,
      { T: genericSymbol() },
    );
  });

  /**
   * Incorrect return type
   */

  test("non void subroutine must return a value", () => {
    testValidator(
      `
            class Main {
                function int a(){
                    return;
                }
            }`,
      'NonVoidFunctionNoReturnError',
    );
  });

  test("void subroutine must return not return a value", () => {
    testValidator(
      `
            class Main {
                function void a(){
                    return 1;
                }
            }`,
      'VoidSubroutineReturnsValueError',
    );
  });
  /**
   * `Subroutine ${subroutine.name.value}: not all code paths return a value`
   */

  test("if missing return", () => {
    testValidator(
      `
            class Main {
                function void a(){
                    var int a;
                    let a=0;
                    if(a=0){

                    }else{
                        return;
                    }
                }
            }`,
      'SubroutineNotAllPathsReturnError',
    );
  });
  test("else missing return ", () => {
    testValidator(
      `
            class Main {
                function void a(){
                    var int a;
                    let a=0;
                    if(a=0){
                        return;
                    }else{
                       
                    }
                }
            }`,
      'SubroutineNotAllPathsReturnError',
    );
  });

  test("while missing return", () => {
    testValidator(
      `
            class Main {
                function int a(){
                    var int a;
                    let a=0;
                    while(a<10){
                       
                    }
                }
            }`,
      'SubroutineNotAllPathsReturnError',
    );
  });

  test(" missing return after while", () => {
    testValidator(
      `
            class Main {
                function int a(){
                    var int a;
                    let a=0;
                    while(a<10){
                        return 0;
                    }
                }
            }`,
      'SubroutineNotAllPathsReturnError',
    );
  });

  test("nested if missing return", () => {
    testValidator(
      `
            class Main {
                function void a(){
                    var int a;
                    let a=0;
                    if(a=0){
                        if(a=1){
                            return;
                        }else {

                        }
                    }else{
                        return;
                    }
                }
            }`,
      'SubroutineNotAllPathsReturnError',
    );
  });
  test("nested if missing return 2", () => {
    testValidator(
      `
            class Main {
                function void a(){
                    var int a;
                    let a=0;
                    if(a=0){
                        if(a=1){
                          
                        }else {
                              return;
                        }
                    }else{
                        return;
                    }
                }
            }`,
      'SubroutineNotAllPathsReturnError',
    );
  });

  test("nested if missing return 3", () => {
    testValidator(
      `
            class Main {
                function void a(){
                    var int a;
                    let a=0;
                    if(a=0){
                        if(a=1){
                            return;
                        }else {
                            return;
                        }
                    }else{
                    
                    }
                }
            }`,
      'SubroutineNotAllPathsReturnError',
    );
  });
  test("should be valid", () => {
    testValidator(`
            class Main {
                function void a(){
                    var int a;
                    let a=0;
                    if(a=0){
                        if(a=1){
                        }else {
                        }
                    }
                    return;
                }
            }`);
  });
  /**
   * Validate function call
   */
  test("calling undefined subroutine", () => {
    testValidator(
      `
            class Main {
                function void b(){
                    do Main.c();
                    return;
                }
            }`,
      'UnknownSubroutineCallError',
    );
  });

  test("incorrect number of parameters when calling a function", () => {
    testValidator(
      `
            class Main {
                function void a(int a, int b){
                    return;
                }
                function void b(){
                    do Main.a(1);
                    return;
                }
            }`,
      'IncorrectParamsNumberInSubroutineCallError',
      {
        Main: genericSymbol(),
        "Main.a": genericSymbol(SubroutineType.Function, 2),
        "Main.b": genericSymbol(SubroutineType.Function, 2),
      },
    );
  });

  test("call var method ", () => {
    testValidator(
      `
            class Main {
                constructor Main new(){
                    return this;
                }
                function void a(){
                    var Main m;
                    let m = Main.new();
                    do m.b();
                    return;
                }
                method void b(){
                    return;
                }
            }`,
      undefined,
      {
        Main: genericSymbol(),
        "Main.new": genericSymbol(SubroutineType.Constructor, 0),
        "Main.a": genericSymbol(SubroutineType.Function, 0),
        "Main.b": genericSymbol(SubroutineType.Method, 0),
      },
    );
  });
  test("call local method ", () => {
    testValidator(
      `
            class Main {
                method void a(){
                    do b();
                    return;
                }
                method void b(){
                    return;
                }
            }`,
      undefined,
      {
        Main: genericSymbol(),
        "Main.a": genericSymbol(SubroutineType.Method, 0),
        "Main.b": genericSymbol(SubroutineType.Method, 0),
      },
    );
  });

  /**
   * -   `Method ${className}.${subroutineName} was called as a function/constructor`
   */
  test("method called as a function/constructor", () => {
    testValidator(
      `
            class Main {
                function void b(){
                    do Main.c();
                    return;
                }
                method void c(){
                    return;
                }
            }`,
      'MethodCalledAsFunctionError',
      {
        Main: genericSymbol(),
        "Main.b": genericSymbol(SubroutineType.Function, 0),
        "Main.c": genericSymbol(SubroutineType.Method, 0),
      },
    );
  });
  test("function/ctor called as a method", () => {
    testValidator(
      `
            class Main {
                function void b(){
                    do c();
                    return;
                }
                function void c(){
                    return;
                }
            }`,
      'FunctionCalledAsMethodError',
      {
        Main: genericSymbol(),
        "Main.b": genericSymbol(SubroutineType.Function, 0),
        "Main.c": genericSymbol(SubroutineType.Function, 0),
      },
    );
  });
  test("incorrect return type in constructor", () => {
    testValidator(
      `
            class Main {
                constructor D new(){
                    return this;
                }
            }`,
      'IncorrectConstructorReturnTypeError',
      {
        Main: genericSymbol(),
        D: genericSymbol(),
      },
    );
  });
  test("unreachable code", () => {
    testValidator(
      `
            class Main {
                constructor Main new(){
                    return this;
                    let a=0;
                    let a=0;
                    let a=0;
                }
            }`,
      'UnreachableCodeError',
      {
        Main: genericSymbol(),
        "Main.new": genericSymbol(SubroutineType.Constructor, 0),
      },
    );
  });
  test("A constructor must return 'this'", () => {
    testValidator(
      `
            class Main {
                constructor Main new(){
                    return 1;
                }
            }`,
      'ConstructorMushReturnThisError',
      {
        Main: genericSymbol(),
        "Main.new": genericSymbol(SubroutineType.Constructor, 0),
      },
    );
  });
  test("Let statement - expected string literal ", () => {
    testValidator(
      `
            class Main {
                function void a(){
                    var String foo;
                    let foo = 1;
                    return;
                }
            }`,
      'WrongLiteralTypeError',
      {
        Main: genericSymbol(),
        "Main.a": genericSymbol(SubroutineType.Function, 0),
        String: genericSymbol(),
      },
    );
  });
  test("Let statement - expected boolean literal ", () => {
    testValidator(
      `
            class Main {
                function void a(){
                    var boolean foo;
                    let foo = 1;
                    return;
                }
            }`,
      'WrongLiteralTypeError',
      {
        Main: genericSymbol(),
        "Main.a": genericSymbol(SubroutineType.Function, 0),
      },
    );
  });

  test("Let statement - expected int literal ", () => {
    testValidator(
      `
            class Main {
                function void a(){
                    var int foo;
                    let foo = "asb";
                    return;
                }
            }`,
      'WrongLiteralTypeError',
      {
        Main: genericSymbol(),
        "Main.a": genericSymbol(SubroutineType.Function, 0),
      },
    );
  });
  test("integer constant value is too big", () => {
    testValidator(
      `
            class Main {
                function void a(){
                    var int foo;
                    let foo = 33000;
                    return;
                }
            }`,
      'IntLiteralIsOutOfRangeError',
      {
        Main: genericSymbol(),
        "Main.a": genericSymbol(SubroutineType.Function, 0),
      },
    );
  });
  test("integer constant value is too small", () => {
    testValidator(
      `
            class Main {
                function void a(){
                    var int foo;
                    let foo = -33000;
                    return;
                }
            }`,
      'IntLiteralIsOutOfRangeError',
      {
        Main: genericSymbol(),
        "Main.a": genericSymbol(SubroutineType.Function, 0),
      },
    );
  });
  test("A field can not be referenced in a function", () => {
    testValidator(
      `
            class Main {
                field int a;
                function void a(){
                    let a = 1;
                    return;
                }
            }`,
      'FieldCantBeReferencedInFunctionError',
      {
        Main: genericSymbol(),
        "Main.a": genericSymbol(SubroutineType.Function, 0),
      },
    );
  });
  test("A static field can be referenced in a function", () => {
    testValidator(
      `
            class Main {
                static int a;
                function void a(){
                    let a = 1;
                    return;
                }
            }`,
      undefined,
      {
        Main: genericSymbol(),
        "Main.a": genericSymbol(SubroutineType.Function, 0),
      },
    );
  });
  test("this can't be referenced in a function", () => {
    testValidator(
      `
            class Main {
                function void a(){
                    var Main m;
                    let m = this;
                    return;
                }
            }`,
      'ThisCantBeReferencedInFunctionError',
      {
        Main: genericSymbol(),
        "Main.a": genericSymbol(SubroutineType.Function, 0),
      },
    );
  });
  test("class name  doesn't match filename", () => {
    testValidator(
      `class A {}`,
      'FilenameDoesntMatchClassNameError',
      {
        A: genericSymbol(),
      },
      "B",
    );
  });

  //validate files
  test.each(testResourceDirs)("%s", async (dir: string) => {
    await testJackDir(fs, getTestResourcePath(dir));
  });
});

async function testJackDir(fs: FileSystem, testFolder: string): Promise<void> {
  const files = [...(await fs.readdir(testFolder))]
    .filter((file) => file.endsWith(".jack"))
    .map((file) => path.join(testFolder, file));
  const trees: Record<string, ProgramContext> = {};
  const globalSymbolsListener: JackGlobalSymbolTableListener =
    new JackGlobalSymbolTableListener();
  for (const filePath of files) {
    const tree = parseJackFile(filePath);
    trees[filePath] = tree;
    listenToTheTree(tree, globalSymbolsListener);
    expect(globalSymbolsListener.errors).toEqual([]);
  }
  for (const filepath of Object.keys(trees)) {
    const tree = trees[filepath];
    const validatorListener = listenToTheTree(
      tree,
      new JackValidatorListener(globalSymbolsListener.globalSymbolTable),
    );
    expect(validatorListener.errors).toEqual([]);
  }
}

function testValidator<T extends JackCompilerErrorType>(
  src: string,
  expectedError?: T,
  globalSymbolTable: Record<string, GenericSymbol> = {},
  filename?: string,
) {
  const errorListener = new JackCustomErrorListener();
  const tree = parseJackText(src, errorListener);
  const listener =
    filename != null
      ? new JackValidatorListener(globalSymbolTable, filename)
      : new JackValidatorListener(globalSymbolTable);
  const validator = listenToTheTree(tree, listener);
  if (expectedError) {
    if (validator.errors.length > 1) {
      console.error("Errors", validator.errors);
    }
    try {
      expect(validator.errors.length).toBe(1);
      expect(validator.errors[0].type).toBe(expectedError);
    } catch (e) {
      throw new Error(
        `Expected error ${expectedError} but got '` +
          JSON.stringify(validator.errors) +
          "'",
      );
    }
  } else {
    if (validator.errors.length != 0)
      throw new Error(
        "Didn't expect any errors but got " + validator.errors.join("\n"),
      );
  }
}

/**
 * TODO:
 *  Ideas for improvement -
 * - Show "Expected class name, subroutine name, field, parameter or local or static variable name" instead of "expecting IDENTIFIER"
 * - Show "Expected subroutine return type followed by a subroutine name" instead of "expecting IDENTIFIER"
 * - Expected subroutine name in call
 * - a numeric value is illegal here when using non numeric vars
 * - validate function call - when using literal in call validate the type
 *  add validation for assigning from void function call
 *  add rule to forbid var use before assignment
 */

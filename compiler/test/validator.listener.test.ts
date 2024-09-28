import { ILogObj, Logger } from "tslog"
import { ConstructorMushReturnThis, DuplicatedVariableException as DuplicatedVariableError, FieldCantBeReferencedInFunction, FunctionCalledAsMethodError, IncorrectConstructorReturnType, IncorrectParamsNumberInSubroutineCallError, IntLiteralIsOutOfRange as IntLiteralOverflow, MethodCalledAsFunctionError, NonVoidFunctionNoReturnError, SubroutineNotAllPathsReturnError, ThisCantBeReferencedInFunction, UndeclaredVariableError, UnknownClassError, UnknownSubroutineCallError, UnreachableCodeError, VoidSubroutineReturnsValueError, WrongLiteralTypeError } from "../src/error"
import { ErrorListener } from "../src/listener/error.listener"
import { ValidatorListener } from "../src/listener/validator.listener"
import { createSubroutineSymbol, GenericSymbol, SubroutineType } from "../src/symbol"
import { listenToTheTree, parseJackText } from "./test.helper"

const log: Logger<ILogObj> = new Logger();
describe('ValidatorListener', () => {
    const jestConsole = console;
    beforeEach(() => {

        global.console = require('console');
    });

    afterEach(() => {
        global.console = jestConsole;
    });

    function genericSymbol(type?: SubroutineType, paramsCount?: number): GenericSymbol {
        if (type != undefined && paramsCount != undefined) {
            return createSubroutineSymbol(paramsCount, type)
        } else {
            return {} as GenericSymbol
        }
    }

    const duplicateVarClassBodies = [
        ["static", '  static int a, a;'],
        ["field", '  field int a, a;'],
        ["static and field", '  static int a; field boolean a;'],
        ["function args", '  function void a(int a, int a){return;}'],
        ["function var", ` function void a(){ 
            var boolean a, a; 
            return;
             }`],
        ["function var with different types", ` function void a(){ 
            var boolean a; 
            var int a;
            return;
             }`],
    ]
    test.concurrent.each(duplicateVarClassBodies)('duplicated %s', (testName, classBody) => {
        testValidator(`
            class Main {
              ${classBody}
            }`, DuplicatedVariableError)
    })

    /** 
     * Undeclared var 
     */
    test('let - undeclared variable ', () => {
        testValidator(`
            class Main {
            function void a(){
                let b=1;
                return;
            }
            }`, UndeclaredVariableError)
    })

    test('call function - undeclared variable ', () => {
        testValidator(
            `class Main {
                function void b(int a){
                    return;
                }
                function void a(){
                    do Main.b(a);
                    return;
                }
            }`, UndeclaredVariableError,
            {
                "Main": genericSymbol(),
                "Main.b": genericSymbol(SubroutineType.Function, 1),
                "Main.a": genericSymbol(SubroutineType.Function, 1)
            })
    })

    test('if - undeclared variable ', () => {
        testValidator(
            `class Main {
              function void a(){
                if(a=0){
                    return;
                }else {
                   return;
                }
            }
            }`, UndeclaredVariableError)
    })

    /**
     * Unknown class
     */
    test('Unknown class for subroutine return type ', () => {
        testValidator(`
            class Main {
            function void b(int a){
                var D d;
                return;
            }
            }`, UnknownClassError)
    })

    test('Known type for subroutine return type ', () => {
        testValidator(`
            class Main {
                function D b(int a){
                    return D.new();
                }
            }`, undefined, { "D": genericSymbol(), "D.new": genericSymbol(SubroutineType.Constructor, 0) })
    })
    test('Arg Unknown class  ', () => {
        testValidator(`
            class Main {
                function void b(D a){
                    return;
            }
            }`, UnknownClassError)
    })

    test('Arg known type ', () => {
        testValidator(`

            class Main {
                function void b(D a){
                    return;
                }
            }`, undefined, { "D": genericSymbol() })
    })
    test('var Unknown class', () => {
        testValidator(`
            class Main {
                function void b(){
                    var D d;
                    return;
                }
            }`, UnknownClassError)
    })
    test('var known type', () => {
        testValidator(`
            class Main {
                function void b(){
                    var D d;
                    return;
                }
            }`, undefined, { "D": genericSymbol() })
    })
    test('field Unknown class', () => {
        testValidator(`
            class Main {
                field T t;
            }`, UnknownClassError)
    })
    test('field known type', () => {
        testValidator(`
            class Main {
                field T t;
            }`, undefined, { "T": genericSymbol() })
    })
    test('static field Unknown class', () => {
        testValidator(`
            class Main {
                static T t;
            }`, UnknownClassError)
    })
    test('static field known type', () => {
        testValidator(`
            class Main {
                static T t;
            }`, undefined, { "T": genericSymbol() })
    })

    /**
     * Incorrect return type
     */

    test('non void subroutine must return a value', () => {
        testValidator(`
            class Main {
                function int a(){
                    return;
                }
            }`, NonVoidFunctionNoReturnError)
    })


    test('void subroutine must return not return a value', () => {
        testValidator(`
            class Main {
                function void a(){
                    return 1;
                }
            }`, VoidSubroutineReturnsValueError)
    })
    /**
     * `Subroutine ${subroutine.name.value}: not all code paths return a value`
     */

    test('if missing return', () => {
        testValidator(`
            class Main {
                function void a(){
                    var int a;
                    let a=0;
                    if(a=0){

                    }else{
                        return;
                    }
                }
            }`, SubroutineNotAllPathsReturnError)
    })
    test('else missing return ', () => {
        testValidator(`
            class Main {
                function void a(){
                    var int a;
                    let a=0;
                    if(a=0){
                        return;
                    }else{
                       
                    }
                }
            }`, SubroutineNotAllPathsReturnError)
    })

    test('while missing return', () => {
        testValidator(`
            class Main {
                function int a(){
                    var int a;
                    let a=0;
                    while(a<10){
                       
                    }
                }
            }`, SubroutineNotAllPathsReturnError)
    })

    test(' missing return after while', () => {
        testValidator(`
            class Main {
                function int a(){
                    var int a;
                    let a=0;
                    while(a<10){
                        return 0;
                    }
                }
            }`, SubroutineNotAllPathsReturnError)
    })

    test('nested if missing return', () => {
        testValidator(`
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
            }`, SubroutineNotAllPathsReturnError)
    })
    test('nested if missing return 2', () => {
        testValidator(`
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
            }`, SubroutineNotAllPathsReturnError)
    })

    test('nested if missing return 3', () => {
        testValidator(`
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
            }`, SubroutineNotAllPathsReturnError)
    })
    test('should be valid', () => {
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
            }`)
    })
    /**
     * Validate function call 
     */
    test('calling undefined subroutine', () => {
        testValidator(`
            class Main {
                function void b(){
                    do Main.c();
                    return;
                }
            }`, UnknownSubroutineCallError)
    })
    test('incorrect number of parameters when calling a function', () => {
        testValidator(`
            class Main {
                function void a(int a, int b){
                    return;
                }
                function void b(){
                    do Main.a(1);
                    return;
                }
            }`, IncorrectParamsNumberInSubroutineCallError, {
            "Main": genericSymbol(),
            "Main.a": genericSymbol(SubroutineType.Function, 2),
            "Main.b": genericSymbol(SubroutineType.Function, 2)
        })
    })

    test('call var method ', () => {
        testValidator(`
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
            }`, undefined, {
            "Main": genericSymbol(),
            "Main.new": genericSymbol(SubroutineType.Constructor, 0),
            "Main.a": genericSymbol(SubroutineType.Function, 0),
            "Main.b": genericSymbol(SubroutineType.Method, 0)
        })
    })
    test('call local method ', () => {
        testValidator(`
            class Main {
                method void a(){
                    do b();
                    return;
                }
                method void b(){
                    return;
                }
            }`, undefined, {
            "Main": genericSymbol(),
            "Main.a": genericSymbol(SubroutineType.Method, 0),
            "Main.b": genericSymbol(SubroutineType.Method, 0)
        })
    })

    /**
     * -   `Method ${className}.${subroutineName} was called as a function/constructor`
     */
    test('method called as a function/constructor', () => {
        testValidator(`
            class Main {
                function void b(){
                    do Main.c();
                    return;
                }
                method void c(){
                    return;
                }
            }`, MethodCalledAsFunctionError,
            {
                "Main": genericSymbol(),
                "Main.b": genericSymbol(SubroutineType.Function, 0),
                "Main.c": genericSymbol(SubroutineType.Method, 0)
            })
    })
    test('function/ctor called as a method', () => {
        testValidator(`
            class Main {
                function void b(){
                    do c();
                    return;
                }
                function void c(){
                    return;
                }
            }`, FunctionCalledAsMethodError,
            {
                "Main": genericSymbol(),
                "Main.b": genericSymbol(SubroutineType.Function, 0),
                "Main.c": genericSymbol(SubroutineType.Function, 0)
            })
    })
    test('incorrect return type in constructor', () => {
        testValidator(`
            class Main {
                constructor D new(){
                    return this;
                }
            }`, IncorrectConstructorReturnType,
            {
                "Main": genericSymbol(),
                "D": genericSymbol(),
            })
    });
    test('unreachable code', () => {
        testValidator(`
            class Main {
                constructor Main new(){
                    return this;
                    let a=0;
                    let a=0;
                    let a=0;
                }
            }`, UnreachableCodeError,
            {
                "Main": genericSymbol(),
                "Main.new": genericSymbol(SubroutineType.Constructor, 0),
            })
    });
    test("A constructor must return 'this'", () => {
        testValidator(`
            class Main {
                constructor Main new(){
                    return 1;
                }
            }`, ConstructorMushReturnThis,
            {
                "Main": genericSymbol(),
                "Main.new": genericSymbol(SubroutineType.Constructor, 0),
            })
    })
    test("Let statement - expected string literal ", () => {
        testValidator(`
            class Main {
                function void a(){
                    var String foo;
                    let foo = 1;
                    return;
                }
            }`, WrongLiteralTypeError,
            {
                "Main": genericSymbol(),
                "Main.a": genericSymbol(SubroutineType.Function, 0),
                "String": genericSymbol(),
            })
    })
    test("Let statement - expected boolean literal ", () => {
        testValidator(`
            class Main {
                function void a(){
                    var boolean foo;
                    let foo = 1;
                    return;
                }
            }`, WrongLiteralTypeError,
            {
                "Main": genericSymbol(),
                "Main.a": genericSymbol(SubroutineType.Function, 0),
            })
    })

    test("Let statement - expected int literal ", () => {
        testValidator(`
            class Main {
                function void a(){
                    var int foo;
                    let foo = "asb";
                    return;
                }
            }`, WrongLiteralTypeError,
            {
                "Main": genericSymbol(),
                "Main.a": genericSymbol(SubroutineType.Function, 0),
            })
    })
    test("integer constant value is too big", () => {
        testValidator(`
            class Main {
                function void a(){
                    var int foo;
                    let foo = 33000;
                    return;
                }
            }`, IntLiteralOverflow,
            {
                "Main": genericSymbol(),
                "Main.a": genericSymbol(SubroutineType.Function, 0),
            })
    })
    test("integer constant value is too small", () => {
        testValidator(`
            class Main {
                function void a(){
                    var int foo;
                    let foo = -33000;
                    return;
                }
            }`, IntLiteralOverflow,
            {
                "Main": genericSymbol(),
                "Main.a": genericSymbol(SubroutineType.Function, 0),
            })
    })
    test("A field can not be referenced in a function", () => {
        testValidator(`
            class Main {
                field int a;
                function void a(){
                    let a = 1;
                    return;
                }
            }`, FieldCantBeReferencedInFunction,
            {
                "Main": genericSymbol(),
                "Main.a": genericSymbol(SubroutineType.Function, 0),
            })
    })
    test("A static field can be referenced in a function", () => {
        testValidator(`
            class Main {
                static int a;
                function void a(){
                    let a = 1;
                    return;
                }
            }`, undefined,
            {
                "Main": genericSymbol(),
                "Main.a": genericSymbol(SubroutineType.Function, 0),
            })
    })
    test("this can't be referenced in a function", () => {
        testValidator(`
            class Main {
                function void a(){
                    var Main m;
                    let m = this;
                    return;
                }
            }`, ThisCantBeReferencedInFunction,
            {
                "Main": genericSymbol(),
                "Main.a": genericSymbol(SubroutineType.Function, 0),
            })
    })
    /**
     *   Errors from old java compiler - 
     * - Expected class name, subroutine name, field, parameter or local or static variable name (currently expected IDENTIFIER)
     * - Expected subroutine name in call
     * - a numeric value is illegal here
     * - this' can't be referenced in a function
     * - Illegal casting into String constant
     * - A field may not be referenced in a function
     */

})
function testValidator<T extends { name: string }>(src: string, expectedError?: T, globalSymbolTable: Record<string, GenericSymbol> = {}) {
    const name = expect.getState().currentTestName!
    const errorListener = new ErrorListener();
    errorListener.filepath = name;
    const tree = parseJackText(src, errorListener)

    const validator = listenToTheTree(tree, new ValidatorListener(globalSymbolTable))
    if (expectedError) {
        // if (validator.cfgNode) {
        //     validator.cfgNode.print()
        // }
        if (validator.errors.length > 1) {
            console.error("Errors", validator.errors)
        }
        try {
            expect(validator.errors.length).toBe(1)
            expect(validator.errors[0]).toBeInstanceOf(expectedError)
        } catch (e) {
            throw new Error(`Expected error ${expectedError.name} but got '` + validator.errors.join(",") + "'")
        }
    } else {
        if (validator.errors.length != 0) throw new Error("Didn't expect any errors but got " + validator.errors.join("\n"))
    }
}




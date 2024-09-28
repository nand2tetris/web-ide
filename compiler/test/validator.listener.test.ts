import { ParserRuleContext } from "antlr4ts"
import { DuplicatedVariableException as DuplicatedVariableError, IncorrectParamsNumberInSubroutineCall, JackCompilerError, NonVoidFunctionNoReturnError, SubroutineNotAllPathsReturn, UndeclaredVariableError, UnknownClassError, UnknownSubroutineCall, VoidSubroutineReturnsValueError } from "../src/error"
import { ErrorListener } from "../src/listener/error.listener"
import { ValidatorListener } from "../src/listener/validator.listener"
import { handleErrors, listenToTheTree, parseJackText } from "./test.helper"
import { ProgramContext } from "../src/generated/JackParser"
import { Logger, ILogObj } from "tslog";
import { GenericSymbol } from "../src/symbol"

const log: Logger<ILogObj> = new Logger();
describe('ValidatorListener', () => {
    const jestConsole = console;
    beforeEach(() => {

        global.console = require('console');
    });

    afterEach(() => {
        global.console = jestConsole;
    });


    function genericSymbol(paramsCount?: number) {
        return paramsCount != undefined ? { subroutineParameterCount: paramsCount } as GenericSymbol :
            {} as GenericSymbol
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
                "Main.b": genericSymbol(1),
                "Main.a": genericSymbol()
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
            }`, undefined, { "D": genericSymbol(), "D.new": genericSymbol(0) })
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
            }`, SubroutineNotAllPathsReturn)
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
            }`, SubroutineNotAllPathsReturn)
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
            }`, SubroutineNotAllPathsReturn)
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
            }`, SubroutineNotAllPathsReturn)
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
            }`, SubroutineNotAllPathsReturn)
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
            }`, SubroutineNotAllPathsReturn)
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
            }`, SubroutineNotAllPathsReturn)
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
            }`, UnknownSubroutineCall)
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
            }`, IncorrectParamsNumberInSubroutineCall, {
            "Main": genericSymbol(),
            "Main.a": genericSymbol(2),
            "Main.b": genericSymbol(2)
        })
    })


    /**
     *  List of validations rules:
     * - OS subroutine ${this.className}.${subroutine.name.value} must follow the interface
     * - validate arg number
     * -   `Method ${className}.${subroutineName} was called as a function/constructor`
     * - Subroutine was called as a method
     * - `Class ${className} doesn't contain a function/constructor ${subroutineName}`
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
            throw new Error(`Expected error ${expectedError.name} but got ` + validator.errors[0])
        }
    } else {
        if (validator.errors.length != 0) throw new Error("Didn't expect any errors but got " + validator.errors.join("\n"))

    }
}




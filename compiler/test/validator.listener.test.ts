import { ParserRuleContext } from "antlr4ts"
import { DuplicatedVariableException, JackCompilerError, UndeclaredVariableError, UnknownSubroutineReturnType } from "../src/error"
import { ErrorListener } from "../src/listener/error.listener"
import { GenericSymbol } from "../src/listener/symbol.table.listener"
import { ValidatorListener } from "../src/listener/validator.listener"
import { handleErrors, listenToTheTree, parseJackText } from "./test.helper"
import { ProgramContext } from "../src/generated/JackParser"
import { assert } from "console"

describe('ValidatorListener', () => {
    const jestConsole = console;

    beforeEach(() => {
        global.console = require('console');
    });

    afterEach(() => {
        global.console = jestConsole;
    });

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
            }`, DuplicatedVariableException)
    })
    test('let - undeclared variable ', () => {
        testValidator( `
            class Main {
            function void a(){
                let b=1;
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
                }
            }`, UndeclaredVariableError)
    })

    test('if - undeclared variable ', () => {
        testValidator(
            `class Main {
              function void a(){
                if(a=0){
                }else {
                }
                return;
            }
            }`, UndeclaredVariableError)
    })

    test('Unknown type for subroutine return type ', () => {
        testValidator( `
            class Main {
            function D b(int a){
                return;
            }
            }`, UnknownSubroutineReturnType)
    })

    test('Known type for subroutine return type ', () => {
        testValidator(`
            class Main {
                function D b(int a){
                    return;
                }
            }`, undefined, { "D": {} as GenericSymbol })
    })


    test('Arg unknown type  ', () => {
        testValidator(`
            class Main {
                function void b(D a){
                    return;
            }
            }`, UnknownSubroutineReturnType)
    })

    test('Arg known type ', () => {
        testValidator( `

            class Main {
                function void b(D a){
                    return;
                }
            }`, undefined, { "D": {} as GenericSymbol })
    })


    //TODO: print line when on exception 
    /*
    * Let:
    * - `Subroutine ${subroutine.name.value}: not all code paths return a value`,
    * - `A non void subroutine must return a value`,
    * - Unknown type for return type, class variable, or method local var
    * - OS subroutine ${this.className}.${subroutine.name.value} must follow the interface
    * - validate arg number
    * -   `Method ${className}.${subroutineName} was called as a function/constructor`
    * - Subroutine was called as a method
    * - `Class ${className} doesn't contain a function/constructor ${subroutineName}`
    * - `Class ${className} doesn't exist`
    */

})
function testValidator<T>(src: string, expectedError?: T, globalSymbolTable: Record<string, GenericSymbol> = {}) {
    const name = expect.getState().currentTestName!
    console.info(`Testing  ${name}\n`, src)
    const errorListener = new ErrorListener();
    errorListener.filepath = name;
    const tree = parseJackText(src, errorListener)

    const validator = listenToTheTree(tree, new ValidatorListener(globalSymbolTable))
    if (expectedError) {
        expect(validator.errors.length).toBe(1)
        expect(validator.errors[0]).toBeInstanceOf(expectedError)
    } else {
        if (validator.errors.length != 0) throw new Error("Didn't expect any errors but got " + validator.errors.join("\n"))

    }
}

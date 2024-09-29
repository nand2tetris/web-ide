import fs from 'fs';
import path from "path";
import { DuplicatedSubroutineError } from "../src/error";
import { BinderListener } from "../src/listener/binder.listener";
import { createSubroutineSymbol, SubroutineType } from "../src/symbol";
import { getTestResourcePath, listenToTheTree, parseJackFile } from "./test.helper";

describe('Binder', () => {
    const jestConsole = console;

    beforeEach(() => {
        global.console = require('console');
    });

    afterEach(() => {
        global.console = jestConsole;
    });

    test("should fail on duplicated subroutine", () => {
        const filePath = getTestResourcePath("DuplicatedSubroutine.jack");
        const tree = parseJackFile(filePath)
        const globalSymbolsListener = new BinderListener()
        listenToTheTree(tree, globalSymbolsListener)
        const symbolsErrors = globalSymbolsListener.errors
        expect(globalSymbolsListener.errors.length).toBe(1)
        expect(symbolsErrors[0]).toBeInstanceOf(DuplicatedSubroutineError)
    })

    test("basic", () => {

        const expected = {
            //built in classes
            "Array": {},
            "Keyboard": {},
            "Math": {},
            "Memory": {},
            "Output": {},
            "Screen": {},
            "String": {},
            "Sys": {},
            'Array.dispose': createSubroutineSymbol(0, SubroutineType.Function),
            'Array.new': createSubroutineSymbol(1, SubroutineType.Function),
            'Keyboard.init': createSubroutineSymbol(0, SubroutineType.Function),
            'Keyboard.keyPressed': createSubroutineSymbol(0, SubroutineType.Function),
            'Keyboard.readChar': createSubroutineSymbol(0, SubroutineType.Function),
            'Keyboard.readInt': createSubroutineSymbol(1, SubroutineType.Function),
            'Keyboard.readLine': createSubroutineSymbol(1, SubroutineType.Function),
            'Math.abs': createSubroutineSymbol(1, SubroutineType.Function),
            'Math.divide': createSubroutineSymbol(2, SubroutineType.Function),
            'Math.max': createSubroutineSymbol(2, SubroutineType.Function),
            'Math.min': createSubroutineSymbol(2, SubroutineType.Function),
            'Math.multiply': createSubroutineSymbol(2, SubroutineType.Function),
            'Math.sqrt': createSubroutineSymbol(1, SubroutineType.Function),
            'Memory.alloc': createSubroutineSymbol(1, SubroutineType.Function),
            'Memory.deAlloc': createSubroutineSymbol(1, SubroutineType.Function),
            'Memory.peek': createSubroutineSymbol(1, SubroutineType.Function),
            'Memory.poke': createSubroutineSymbol(2, SubroutineType.Function),
            'Output.backSpace': createSubroutineSymbol(0, SubroutineType.Function),
            'Output.moveCursor': createSubroutineSymbol(2, SubroutineType.Function),
            'Output.printChar': createSubroutineSymbol(1, SubroutineType.Function),
            'Output.printInt': createSubroutineSymbol(1, SubroutineType.Function),
            'Output.println': createSubroutineSymbol(0, SubroutineType.Function),
            'Output.printString': createSubroutineSymbol(1, SubroutineType.Function),
            'Screen.clearScreen': createSubroutineSymbol(0, SubroutineType.Function),
            'Screen.drawCircle': createSubroutineSymbol(3, SubroutineType.Function),
            'Screen.drawLine': createSubroutineSymbol(4, SubroutineType.Function),
            'Screen.drawPixel': createSubroutineSymbol(2, SubroutineType.Function),
            'Screen.drawRectangle': createSubroutineSymbol(4, SubroutineType.Function),
            'Screen.setColor': createSubroutineSymbol(1, SubroutineType.Function),
            'String.appendChar': createSubroutineSymbol(1, SubroutineType.Function),
            'String.backSpace': createSubroutineSymbol(0, SubroutineType.Function),
            'String.charAt': createSubroutineSymbol(2, SubroutineType.Function),
            'String.dispose': createSubroutineSymbol(0, SubroutineType.Function),
            'String.doubleQuote': createSubroutineSymbol(0, SubroutineType.Function),
            'String.eraseLastChar': createSubroutineSymbol(0, SubroutineType.Function),
            'String.intValue': createSubroutineSymbol(0, SubroutineType.Function),
            'String.length': createSubroutineSymbol(0, SubroutineType.Function),
            'String.new': createSubroutineSymbol(1, SubroutineType.Function),
            'String.newLine': createSubroutineSymbol(0, SubroutineType.Function),
            'String.setCharAt': createSubroutineSymbol(1, SubroutineType.Function),
            'String.setInt': createSubroutineSymbol(1, SubroutineType.Function),
            'Sys.error': createSubroutineSymbol(1, SubroutineType.Function),
            'Sys.halt': createSubroutineSymbol(0, SubroutineType.Function),
            'Sys.wait': createSubroutineSymbol(1, SubroutineType.Function),
            //test files symbols
            'Fraction': {},
            'Fraction.new': createSubroutineSymbol(2, SubroutineType.Constructor, 0),
            'Fraction.reduce': createSubroutineSymbol(0, SubroutineType.Method, 1),
            'Fraction.getNumerator': createSubroutineSymbol(0, SubroutineType.Method, 0),
            'Fraction.getDenominator': createSubroutineSymbol(0, SubroutineType.Method, 0),
            'Fraction.plus': createSubroutineSymbol(1, SubroutineType.Method, 1),
            'Fraction.dispose': createSubroutineSymbol(0, SubroutineType.Method, 0),
            'Fraction.print': createSubroutineSymbol(0, SubroutineType.Method, 0),
            'Fraction.gcd': createSubroutineSymbol(2, SubroutineType.Function, 1),
            'Main': {},
            'Main.main': createSubroutineSymbol(0, SubroutineType.Function, 3),
        }
        let globalSymbolsListener = new BinderListener()

        const testFolder = getTestResourcePath("Fraction");
        const files = fs.readdirSync(testFolder).filter(file => file.endsWith(".jack")).map(file => path.join(testFolder, file));
        for (const filePath of files) {
            const tree = parseJackFile(filePath)
            globalSymbolsListener = listenToTheTree(tree, globalSymbolsListener);
            // console.log("Symbols for " + path.basename(filePath) + ":", globalSymbolsListener.globalSymbolTable)
        }
        expect(globalSymbolsListener.globalSymbolTable).toEqual(expected)
    })
})



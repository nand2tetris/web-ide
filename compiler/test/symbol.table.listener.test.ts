import { ParseTreeWalker } from "antlr4ts/tree/ParseTreeWalker";
import { ErrorListener } from "../src/listener/error.listener";
import {  GlobalSymbolTableListener } from "../src/listener/symbol.table.listener";
import { DuplicatedSubroutineError, JackCompilerError } from "../src/error";
import { getTestResourcePath, listenToTheTree, handleErrors, parseJackText, parseJackFile } from "./test.helper";
import fs from 'fs';
import path from "path";
import { ProgramContext } from "../src/generated/JackParser";

describe('Global symbol table', () => {
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
        const globalSymbolsListener = new GlobalSymbolTableListener()
        listenToTheTree(tree, globalSymbolsListener)
        const symbolsErrors = globalSymbolsListener.errors
        expect(globalSymbolsListener.errors.length).toBe(1)
        expect(symbolsErrors[0]).toBeInstanceOf(DuplicatedSubroutineError)
    })

    test("basic", () => {
        const expected = {
            'Fraction': {},
            'Fraction.new': { subroutineParameterCount: 2 },
            'Fraction.reduce': { subroutineParameterCount: 0 },
            'Fraction.getNumerator': { subroutineParameterCount: 0 },
            'Fraction.getDenominator': { subroutineParameterCount: 0 },
            'Fraction.plus': { subroutineParameterCount: 1 },
            'Fraction.dispose': { subroutineParameterCount: 0 },
            'Fraction.print': { subroutineParameterCount: 0 },
            'Fraction.gcd': { subroutineParameterCount: 2 },
            'Main': {},
            'Main.main': { subroutineParameterCount: 0 },
            //builtins 
            'Array.dispose': { subroutineParameterCount: 0 },
            'Array.new': { subroutineParameterCount: 1 },
            'Keyboard.init': { subroutineParameterCount: 0 },
            'Keyboard.keyPressed': { subroutineParameterCount: 0 },
            'Keyboard.readChar': { subroutineParameterCount: 0 },
            'Keyboard.readInt': { subroutineParameterCount: 1 },
            'Keyboard.readLine': { subroutineParameterCount: 1 },
            'Math.abs': { subroutineParameterCount: 1 },
            'Math.divide': { subroutineParameterCount: 2 },
            'Math.max': { subroutineParameterCount: 2 },
            'Math.min': { subroutineParameterCount: 2 },
            'Math.multiply': { subroutineParameterCount: 2 },
            'Math.sqrt': { subroutineParameterCount: 1 },
            'Memory.alloc': { subroutineParameterCount: 1 },
            'Memory.deAlloc': { subroutineParameterCount: 1 },
            'Memory.peek': { subroutineParameterCount: 1 },
            'Memory.poke': { subroutineParameterCount: 2 },
            'Output.backSpace': { subroutineParameterCount: 0 },
            'Output.moveCursor': { subroutineParameterCount: 2 },
            'Output.printChar': { subroutineParameterCount: 1 },
            'Output.printInt': { subroutineParameterCount: 1 },
            'Output.println': { subroutineParameterCount: 0 },
            'Output.printString': { subroutineParameterCount: 1 },
            'Screen.clearScreen': { subroutineParameterCount: 0 },
            'Screen.drawCircle': { subroutineParameterCount: 3 },
            'Screen.drawLine': { subroutineParameterCount: 4 },
            'Screen.drawPixel': { subroutineParameterCount: 2 },
            'Screen.drawRectangle': { subroutineParameterCount: 4 },
            'Screen.setColor': { subroutineParameterCount: 1 },
            'String.appendChar': { subroutineParameterCount: 1 },
            'String.backSpace': { subroutineParameterCount: 0 },
            'String.charAt': { subroutineParameterCount: 2 },
            'String.dispose': { subroutineParameterCount: 0 },
            'String.doubleQuote': { subroutineParameterCount: 0 },
            'String.eraseLastChar': { subroutineParameterCount: 0 },
            'String.intValue': { subroutineParameterCount: 0 },
            'String.length': { subroutineParameterCount: 0 },
            'String.new': { subroutineParameterCount: 1 },
            'String.newLine': { subroutineParameterCount: 0 },
            'String.setCharAt': { subroutineParameterCount: 1 },
            'String.setInt': { subroutineParameterCount: 1 },
            'Sys.error': { subroutineParameterCount: 1 },
            'Sys.halt': { subroutineParameterCount: 0 },
            'Sys.wait': { subroutineParameterCount: 1 }
        }
        let globalSymbolsListener = new GlobalSymbolTableListener()

        const testFolder = getTestResourcePath("Fraction");
        const files = fs.readdirSync(testFolder).filter(file => file.endsWith(".jack")).map(file => path.join(testFolder, file));
        for (const filePath of files) {
            const tree = parseJackFile(filePath)
            globalSymbolsListener = listenToTheTree(tree, globalSymbolsListener);
            console.log("Symbols for " + path.basename(filePath) + ":", globalSymbolsListener.globalSymbolTable)
        }
        expect(globalSymbolsListener.globalSymbolTable).toEqual(expected)
    })
})



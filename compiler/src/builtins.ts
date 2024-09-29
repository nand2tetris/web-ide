import { GenericSymbol, SubroutineType } from "./symbol";

export const builtInTypes = ["int", "boolean", "char"]
interface Range {
    min: number;
    max: number;
}
export const intRange = { min: -32768, max: 32767 } as Range;
//TODO: should we convert this to symbols?
const builtInFunctionsToArgCount: Record<string, number> = {
    "Array.dispose": 0,
    //TODO: what is this?
    // "Array.init": 0,
    "Array.new": 1,
    "Keyboard.init": 0,
    "Keyboard.keyPressed": 0,
    "Keyboard.readChar": 0,
    "Keyboard.readInt": 1,
    "Keyboard.readLine": 1,
    "Math.abs": 1,
    "Math.divide": 2,
    //TODO: what is this ?
    // "Math.init": 0,
    "Math.max": 2,
    "Math.min": 2,
    "Math.multiply": 2,
    "Math.sqrt": 1,
    "Memory.alloc": 1,
    "Memory.deAlloc": 1,
    // "Memory.init": 0,
    "Memory.peek": 1,
    "Memory.poke": 2,
    "Output.backSpace": 0,
    // "Output.init": 0,
    "Output.moveCursor": 2,
    "Output.printChar": 1,
    "Output.printInt": 1,
    "Output.println": 0,
    "Output.printString": 1,
    "Screen.clearScreen": 0,
    "Screen.drawCircle": 3,
    "Screen.drawLine": 4,
    "Screen.drawPixel": 2,
    "Screen.drawRectangle": 4,
    // "Screen.init": 0,
    "Screen.setColor": 1,
    "String.appendChar": 1,
    "String.backSpace": 0,
    "String.charAt": 2,
    "String.dispose": 0,
    "String.doubleQuote": 0,
    "String.eraseLastChar": 0,
    // "String.init": 0,
    "String.intValue": 0,
    "String.length": 0,
    "String.new": 1,
    "String.newLine": 0,
    "String.setCharAt": 1,
    "String.setInt": 1,
    "Sys.error": 1,
    "Sys.halt": 0,
    "Sys.wait": 1,
};
const builtInClasses = ["Array", "Keyboard", "Math", "Memory", "Output", "Screen", "String", "Sys"]
const builtInClassesRecord = builtInClasses.reduce((acc, elem) => ({
    ...acc,
    [elem]: {} as GenericSymbol
}), {} as Record<string, GenericSymbol>)

export const builtInSymbols = Object.keys(builtInFunctionsToArgCount).reduce((acc, elem) => ({
    ...acc,
    [elem]: {
        subroutineInfo: {
            paramsCount: builtInFunctionsToArgCount[elem],
            type: SubroutineType.Function
        }
    } as GenericSymbol
}), builtInClassesRecord)
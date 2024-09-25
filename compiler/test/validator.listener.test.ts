import { ErrorListener } from "../src/listener/error.listener"
import { GenericSymbol } from "../src/listener/symbol.table.listener"
import { ValidatorListener } from "../src/listener/validator.listener"
import { parseJackFile, parseJackText } from "./test.helper"

describe('ValidatorListener', () => {
    test('Duplicate variable declaration', () => {
        const src = `
        class Main {
            static int a;
            field int a;
        }`
        const errorListener = ErrorListener.getInstance();
        const tree = parseJackText(src, errorListener)
        expect(errorListener.error).toBe(false)
        const validator = new ValidatorListener({} as Record<string, GenericSymbol>);


    })
})
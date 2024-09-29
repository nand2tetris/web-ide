import fs from 'fs';
import { BinderListener } from "../src/listener/binder.listener";

import path from "path";
import { ErrorListener } from "../src/listener/error.listener";
import { listenToTheTree, parseJackFile, parseJackText, testResourcesDirs } from "./test.helper";
import { JackParserListener } from '../src/generated/JackParserListener';

describe('Parser', () => {
    const jestConsole = console;
    beforeEach(() => {
        global.console = require('console');
    });

    afterEach(() => {
        global.console = jestConsole;
    });

    test.each(testResourcesDirs)('%s', (dir: string) => {
        testJackDir(path.join(__dirname, "resources", dir));
    });
    test('expected EOF', () => {
        try {
            parseJackText(`
            class A{
            }
            var a;
            `)
        } catch (e) {
            if (e instanceof Error) {
                expect(e.message).toContain("expecting <EOF>")
                return;
            } else {
                fail("Expected Error");
            }
        }
        fail('Expected Error');
    })

});

function testJackDir(testFolder: string): void {
    const files = fs.readdirSync(testFolder).filter(file => file.endsWith(".jack")).map(file => path.join(testFolder, file));
    for (const filePath of files) {
        const errorListener = new ErrorListener()
        errorListener.filepath = filePath;
        const tree = parseJackFile(filePath)
        const globalSymbolsListener = listenToTheTree(tree, new BinderListener());
        const symbolsErrors = globalSymbolsListener.errors.join("\n")
        try {
            expect(globalSymbolsListener.errors.length).toBe(0)
        } catch (e) {
            throw new Error(symbolsErrors);
        }
        globalSymbolsListener.resetErrors();
    }
}

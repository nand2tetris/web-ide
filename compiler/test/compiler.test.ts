import Compiler from "../src/compiler";

describe("Compiler", () => {
    test('empty class', () => {
        const input = `class A{}`
        const expected = ``;
    })

    test('static field', () => {
        const input = `class A{
            static int a;
            function void init(){
                let a=1;
                return;
            }
        }`
        const expected = `

        `;
    })
    test('field', () => {
        const input = `
        class A{
            field int a;
            method void init(){
                let a=1;
                return;
            }
        }`
        const expected = `

        `;
    })

    test('empty  constructor', () => {
        const input = `class A{
            constructor A new(){
                return this;
            }
        }`
        const expected = `

        `;
    })
    test('empty function', () => {
        const input = `
        class A{
            function void init(){
                return;
            }
        }
        `
        const expected = `

        `;
    })
    test('empty method', () => {
        const input = `
            class A{
                method void init(){
                    return;
                }
            }`
        const expected = `
            
        `;
    })

    test('constructor with parameters', () => {
        const input = ``
        const expected = `
        
        `;
    })
    test('method with parameters', () => {
        const input = `
            class A{
                method void init(int a, boolean b){
                    return;
                }
            }
         `
        const expected = `

        `;
    })
    test('function with parameters', () => {
        const input = `
        class A{
        function void init(int a, boolean b){
                    return;
                }
        }
         `
        const expected = `

        `;
    })

    test('int var declaration', () => {
        const input = `
            class A{
            function void a(){
                var boolean b;
                return;
            }
            }
         `
        const expected = `

        `;
    })
    test('boolean var declaration', () => {
        const input = `
         `
        const expected = `

        `;
    })
    test('char var declaration', () => {
        const input = `
         `
        const expected = `

        `;
    })
    test('string var declaration', () => {
        const input = `
         `
        const expected = `

        `;
    })
    test('class var declaration', () => {
        const input = `
         `
        const expected = `

        `;
    })
    //Assign
    test('boolean literal assign', () => {
        const input = `
        class A{
            function void a(){
                var boolean b;
                let b = true;
                return;
            }
        }
         `
        const expected = `

        `;
    })
    test('char literal assign', () => {
        const input = `
        class A{
            function void a(){
                var char b;
                let b = 1;
                return;
            }
        }`
        const expected = `

        `;
    })
    test('null literal assign', () => {
        const input = `
        class A{
            function void a(){
                var A b;
                let a = null;
                return;
            }
        }
         `
        const expected = `

        `;
    })
    test('this literal assign', () => {
        const input = `
        class A{
            method void a(){
                var A b;
                let b = this;
                return;
            }
        }
         `
        const expected = `

        `;
    })
    test('int literal assign', () => {
        const input = `
        class A{
            function void a(){
                var int b;
                let b = 1;
                return;
            }
        }
         `
        const expected = `

        `;
    })
    test('assignment for binary operation', () => {
        const input = `
        class A{
            function void a(){
                var int b;
                let b = 2*3;
                return;
            }
        }
         `
        const expected = `
            function A.a 1
                push constant 2
                push constant 3
                call Math.multiply 2
                pop local 0
                push constant 0
                return
        `;
        testCompiler(input,expected);
    })
    test('assignment for varname', () => {
        const input = `
        class A{
            function void a(){
                var boolean b,c;
                let c=true;
                let b=c;
                return;
            }
        }
         `
        const expected = `
            function A.a 2
                push constant 1
                neg
                pop local 1
                push local 1
                pop local 0
                push constant 0
                return
        `;
    })
    test('assignment for subroutine call', () => {
        const input = `
        class A{
            function int a(){
                return 1;
            }
            function void b(){
                var boolean b;
                let b = A.a();
                return;
            }
        }
         `
        const expected = `
            function A.a 0
                push constant 1
                return
            function A.b 1
                call A.a 0
                pop local 0
                push constant 0
                return
        `;
    })
    test('assignment for array access', () => {
        const input = `
        class A{
            function void a(){
                var Array arr;
                let arr = Array.new(10);
                let arr[0] = 1;
                let arr[1] = arr[0];
                return;
            }
        }
         `
        const expected = `
            function A.a 1
                push constant 10
                call Array.new 1
                pop local 0
                push constant 0
                push local 0
                add
                push constant 1
                pop temp 0
                pop pointer 1
                push temp 0
                pop that 0
                push constant 1
                push local 0
                add
                push constant 0
                push local 0
                add
                pop pointer 1
                push that 0
                pop temp 0
                pop pointer 1
                push temp 0
                pop that 0
                push constant 0
                return
        `;
    })
    test('assignment to -1', () => {
        const input = `
        class A{
            function void a(){
                var int b;
                let b = -1;
                return;
            }
        }`
        const expected = `
            function A.a 1
                push constant 1
                neg
                pop local 0
                push constant 0
                return
        `;
        testCompiler(input,expected);
    })
    test('assignment to ~1', () => {
        const input = `
        class A{
            function void a(){
                var int b;
                let b = ~1;
                return;
            }
        }
         `
        const expected = `
            function A.a 1
            push constant 1
            not
            pop local 0
            push constant 0
            return
        `;
        testCompiler(input,expected);
    })
    test('assignment for grouped expr', () => {
        const input = `
        class A{
            function void a(){
                var int b;
                let b = 2*(3+5);
                return;
            }
        }`
        const expected = `
            function A.a 1
                push constant 2
                push constant 3
                push constant 5
                add
                call Math.multiply 2
                pop local 0
                push constant 0
                return
        `;
    })

    test('if statement', () => {
        const input = `
        class A{
            function void a(){
                var int b;
                let b = true;
                if(b){
                    let b = false;
                }
                return;
            }
        }`
        const expected = `
            function A.a 1
                push constant 1
                neg
                pop local 0
                push local 0
                not
                if-goto A_1
                push constant 0
                pop local 0
                goto A_0
            label A_1
            label A_0
                push constant 0
                return
        `;
    })
    test('if else statement', () => {
        const input = `
        class A{
            function void a(){
                var boolean b;
                var int a;
                let b = true;
                if(b){
                    let a = 1;
                }else{
                    let a = 2;
                }
                return;
            }
        }`
        const expected = `
            function A.a 2
                push constant 1
                neg
                pop local 0
                push local 0
                not
                if-goto A_1
                push constant 1
                pop local 1
                goto A_0
            label A_1
                push constant 2
                pop local 1
            label A_0
                push constant 0
                return
        `;
    })
    test('while constant', () => {
        const input = `
        class A{
            function void a(){
                var int i;
                let i = 1;
                while(i<10){
                    let i=i+1;
                }
                return;
            }
        }`
        const expected = `
            function A.a 1
                push constant 1
                pop local 0
            label A_0
                push local 0
                push constant 10
                lt
                not
                if-goto A_1
                push local 0
                push constant 1
                add
                pop local 0
                goto A_0
            label A_1
                push constant 0
                return
        `;
    })

    test('function call', () => {
        const input = `
        class A{
            function void b(){
                return;
            }
            function void a(){
                do A.b();
                return;
            }
        }`
        const expected = `
            function A.b 0
                push constant 0
                return
            function A.a 0
                call A.b 0
                pop temp 0
                push constant 0
                return
        `;
        testCompiler(input,expected);
    })
    test('method call', () => {
        const input = `
        class A{
            method void b(){
                return;
            }
            method void a(){
                do b();
                return;
            }
        }`
        const expected = `
            function A.b 0
                push argument 0
                pop pointer 0
                push constant 0
                return
            function A.a 0
                push argument 0
                pop pointer 0
                push pointer 0
                call A.b 1
                pop temp 0
                push constant 0
                return
        `;
        //TODO: add
        // testCompiler(input,expected);
    })
    test('constructor', () => {
        const input = `
        class A{
            constructor A new(){
                return this;
            }
        }`
        const expected = `
            function A.new 0        
            push constant 0
            call Memory.alloc 1
            pop pointer 0
            push pointer 0
            return
        `;
        testCompiler(input,expected);
    })

    test('return literal', () => {
        const input = `
        class A{
            method int a(){
                return 1;
            }
        }`
        const expected = `
        function A.a 0
            push argument 0
            pop pointer 0
            push constant 1
            return
        `;
        testCompiler(input,expected);
    })
    test('method return void', () => {
        const input = `
        class A{
            method void a(){
                return;
            }
        }`
        const expected = `
        function A.a 0
            push argument 0
            pop pointer 0
            push constant 0
            return
        `;
        testCompiler(input,expected);
    })

    test('return simple expression', () => {
        const input = `
        class A{
            function int a(){
                return 1+2*3;
            }
        }`
        const expected = `
            function A.a 0
                push constant 1
                push constant 2
                add
                push constant 3
                call Math.multiply 2
                return
        `;
        console.log(expected)
        testCompiler(input,expected);
    })
})

declare global {
    interface String {
        trimMultiline(): string;
    }
}
String.prototype.trimMultiline = function (): string {
    return this.split("\n").map(line => line.trim())
        .filter(str => str.replace(/[\s\t]/g, '').length != 0)
        .join("\n")
}
function testCompiler(input: string, expected: string): void {
    const res = Compiler.compile(input)
    if (Array.isArray(res)) {
        throw new Error(`Unexpected compilation errors: ${res.join("\n")}`);
    } else {
        expect(res.trimMultiline()).toEqual(expected.trimMultiline());
    }
}
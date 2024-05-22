export const FIB_MAIN = `function Main.fibonacci 0
    push argument 0
    push constant 2
    lt                     // checks if n<2
    if-goto IF_TRUE
    goto IF_FALSE
    label IF_TRUE          // if n<2, return n
    push argument 0        
    return
    label IF_FALSE         // if n>=2, returns fib(n-2)+fib(n-1)
    push argument 0
    push constant 2
    sub
    call Main.fibonacci 1  // computes fib(n-2)
    push argument 0
    push constant 1
    sub
    call Main.fibonacci 1  // computes fib(n-1)
    add                    // returns fib(n-1) + fib(n-2)
    return`;

export const FIB_SYS = `
function Sys.init 0
    push constant 4
    call Main.fibonacci 1   // computes the 4'th fibonacci element
label WHILE
    goto WHILE              // loops infinitely
`;

export const FIBONACCI = FIB_MAIN + FIB_SYS;

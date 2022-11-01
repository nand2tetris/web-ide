export const cmp = `|   a   |   b   |  sel  |  out  |
|   0   |   0   |   0   |   0   |
|   0   |   0   |   1   |   0   |
|   0   |   1   |   0   |   0   |
|   0   |   1   |   1   |   1   |
|   1   |   0   |   0   |   1   |
|   1   |   0   |   1   |   0   |
|   1   |   1   |   0   |   1   |
|   1   |   1   |   1   |   1   |`;
export const hdl = `// Multiplexor. If sel==1 then out=b else out=a.

CHIP Mux {
    IN a, b, sel;
    OUT out;

    PARTS:
}`;
export const tst = `output-list a%B3.1.3 b%B3.1.3 sel%B3.1.3 out%B3.1.3;

set a 0, set b 0, set sel 0, eval, output;
set sel 1, eval, output;

set a 0, set b 1, set sel 0, eval, output;
set sel 1, eval, output;

set a 1, set b 0, set sel 0, eval, output;
set sel 1, eval, output;

set a 1, set b 1, set sel 0, eval, output;
set sel 1, eval, output;`;

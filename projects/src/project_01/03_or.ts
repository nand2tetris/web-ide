export const cmp = `|   a   |   b   |  out  |
|   0   |   0   |   0   |
|   0   |   1   |   1   |
|   1   |   0   |   1   |
|   1   |   1   |   1   |`;
export const hdl = `/**
 * Or gate: out = 1 if {a==1 or b==1}, 0 otherwise
 */

CHIP Or {
    IN a, b;
    OUT out;

    PARTS:
}`;
export const tst = `output-list a%B3.1.3 b%B3.1.3 out%B3.1.3;

set a 0, set b 0, eval, output;
set a 0, set b 1, eval, output;
set a 1, set b 0, eval, output;
set a 1, set b 1, eval, output;`;

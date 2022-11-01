export const cmp = `|  in   |  out  |
|   0   |   1   |
|   1   |   0   |`;
export const hdl = `// Not gate: out = not in

CHIP Not {
    IN in;
    OUT out;

    PARTS:
}`;
export const tst = `output-list in%B3.1.3 out%B3.1.3;

set in 0, eval, output;
set in 1, eval, output;`;

export const hdl = `// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/3/a/RAM8.hdl
/**
 * Memory of eight 16-bit registers.
 * If load is asserted, the value of the register selected by
 * address is set to in; Otherwise, the value does not change.
 * The value of the selected register is emitted by out.
 */
CHIP RAM8 {
    IN in[16], load, address[3];
    OUT out[16];

    PARTS:
    //// Replace this comment with your code.
}`;
export const tst = `// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/3/a/RAM8.tst

load RAM8.hdl,
compare-to RAM8.cmp,
output-list time%S1.3.1 in%D1.6.1 load%B2.1.1 address%D3.1.3 out%D1.6.1;

set in 0,
set load 0,
set address 0,
tick,
output;
tock,
output;

set load 1,
tick,
output;
tock,
output;

set in 11111,
set load 0,
tick,
output;
tock,
output;

set load 1,
set address 1,
tick,
output;
tock,
output;

set load 0,
set address 0,
tick,
output;
tock,
output;

set in 3333,
set address 3,
tick,
output;
tock,
output;

set load 1,
tick,
output;
tock,
output;

set load 0,
tick,
output;
tock,
output;

set address 1,
eval,
output;

set in 7777,
tick,
output;
tock,
output;

set load 1,
set address 7,
tick,
output;
tock,
output;

set load 0,
tick,
output;
tock,
output;

set address 3,
eval,
output;

set address 7,
eval,
output;

set load 0,
set address 0,
tick,
output;
tock,
output;
set address 1,
eval,
output;
set address 2,
eval,
output;
set address 3,
eval,
output;
set address 4,
eval,
output;
set address 5,
eval,
output;
set address 6,
eval,
output;
set address 7,
eval,
output;

set load 1,
set in %B0101010101010101,
set address 0,
tick,
output;
tock,
output;
set address 1,
tick,
output,
tock,
output;
set address 2,
tick,
output,
tock,
output;
set address 3,
tick,
output,
tock,
output;
set address 4,
tick,
output,
tock,
output;
set address 5,
tick,
output,
tock,
output;
set address 6,
tick,
output,
tock,
output;
set address 7,
tick,
output,
tock,
output;

set load 0,
set address 0,
tick,
output;
tock,
output;
set address 1,
eval,
output;
set address 2,
eval,
output;
set address 3,
eval,
output;
set address 4,
eval,
output;
set address 5,
eval,
output;
set address 6,
eval,
output;
set address 7,
eval,
output;

set load 1,
set address 0,
set in %B1010101010101010,
tick,
output;
tock,
output;

set load 0,
set address 0,
tick,
output;
tock,
output;
set address 1,
eval,
output;
set address 2,
eval,
output;
set address 3,
eval,
output;
set address 4,
eval,
output;
set address 5,
eval,
output;
set address 6,
eval,
output;
set address 7,
eval,
output;

set load 1,
set address 0,
set in %B0101010101010101,
tick,
output,
tock,
output;
set address 1,
set in %B1010101010101010,
tick,
output;
tock,
output;

set load 0,
set address 0,
tick,
output;
tock,
output;
set address 1,
eval,
output;
set address 2,
eval,
output;
set address 3,
eval,
output;
set address 4,
eval,
output;
set address 5,
eval,
output;
set address 6,
eval,
output;
set address 7,
eval,
output;

set load 1,
set address 1,
set in %B0101010101010101,
tick,
output,
tock,
output;
set address 2,
set in %B1010101010101010,
tick,
output;
tock,
output;

set load 0,
set address 0,
tick,
output;
tock,
output;
set address 1,
eval,
output;
set address 2,
eval,
output;
set address 3,
eval,
output;
set address 4,
eval,
output;
set address 5,
eval,
output;
set address 6,
eval,
output;
set address 7,
eval,
output;

set load 1,
set address 2,
set in %B0101010101010101,
tick,
output,
tock,
output;
set address 3,
set in %B1010101010101010,
tick,
output;
tock,
output;

set load 0,
set address 0,
tick,
output;
tock,
output;
set address 1,
eval,
output;
set address 2,
eval,
output;
set address 3,
eval,
output;
set address 4,
eval,
output;
set address 5,
eval,
output;
set address 6,
eval,
output;
set address 7,
eval,
output;

set load 1,
set address 3,
set in %B0101010101010101,
tick,
output,
tock,
output;
set address 4,
set in %B1010101010101010,
tick,
output;
tock,
output;

set load 0,
set address 0,
tick,
output;
tock,
output;
set address 1,
eval,
output;
set address 2,
eval,
output;
set address 3,
eval,
output;
set address 4,
eval,
output;
set address 5,
eval,
output;
set address 6,
eval,
output;
set address 7,
eval,
output;

set load 1,
set address 4,
set in %B0101010101010101,
tick,
output,
tock,
output;
set address 5,
set in %B1010101010101010,
tick,
output;
tock,
output;

set load 0,
set address 0,
tick,
output;
tock,
output;
set address 1,
eval,
output;
set address 2,
eval,
output;
set address 3,
eval,
output;
set address 4,
eval,
output;
set address 5,
eval,
output;
set address 6,
eval,
output;
set address 7,
eval,
output;

set load 1,
set address 5,
set in %B0101010101010101,
tick,
output,
tock,
output;
set address 6,
set in %B1010101010101010,
tick,
output;
tock,
output;

set load 0,
set address 0,
tick,
output;
tock,
output;
set address 1,
eval,
output;
set address 2,
eval,
output;
set address 3,
eval,
output;
set address 4,
eval,
output;
set address 5,
eval,
output;
set address 6,
eval,
output;
set address 7,
eval,
output;

set load 1,
set address 6,
set in %B0101010101010101,
tick,
output,
tock,
output;
set address 7,
set in %B1010101010101010,
tick,
output;
tock,
output;

set load 0,
set address 0,
tick,
output;
tock,
output;
set address 1,
eval,
output;
set address 2,
eval,
output;
set address 3,
eval,
output;
set address 4,
eval,
output;
set address 5,
eval,
output;
set address 6,
eval,
output;
set address 7,
eval,
output;

set load 1,
set address 7,
set in %B0101010101010101,
tick,
output,
tock,
output;

set load 0,
set address 0,
tick,
output;
tock,
output;
set address 1,
eval,
output;
set address 2,
eval,
output;
set address 3,
eval,
output;
set address 4,
eval,
output;
set address 5,
eval,
output;
set address 6,
eval,
output;
set address 7,
eval,
output;
`;
export const cmp = `|time |   in   |load|address|  out   |
| 0+  |      0 |  0 |   0   |      0 |
| 1   |      0 |  0 |   0   |      0 |
| 1+  |      0 |  1 |   0   |      0 |
| 2   |      0 |  1 |   0   |      0 |
| 2+  |  11111 |  0 |   0   |      0 |
| 3   |  11111 |  0 |   0   |      0 |
| 3+  |  11111 |  1 |   1   |      0 |
| 4   |  11111 |  1 |   1   |  11111 |
| 4+  |  11111 |  0 |   0   |      0 |
| 5   |  11111 |  0 |   0   |      0 |
| 5+  |   3333 |  0 |   3   |      0 |
| 6   |   3333 |  0 |   3   |      0 |
| 6+  |   3333 |  1 |   3   |      0 |
| 7   |   3333 |  1 |   3   |   3333 |
| 7+  |   3333 |  0 |   3   |   3333 |
| 8   |   3333 |  0 |   3   |   3333 |
| 8   |   3333 |  0 |   1   |  11111 |
| 8+  |   7777 |  0 |   1   |  11111 |
| 9   |   7777 |  0 |   1   |  11111 |
| 9+  |   7777 |  1 |   7   |      0 |
| 10  |   7777 |  1 |   7   |   7777 |
| 10+ |   7777 |  0 |   7   |   7777 |
| 11  |   7777 |  0 |   7   |   7777 |
| 11  |   7777 |  0 |   3   |   3333 |
| 11  |   7777 |  0 |   7   |   7777 |
| 11+ |   7777 |  0 |   0   |      0 |
| 12  |   7777 |  0 |   0   |      0 |
| 12  |   7777 |  0 |   1   |  11111 |
| 12  |   7777 |  0 |   2   |      0 |
| 12  |   7777 |  0 |   3   |   3333 |
| 12  |   7777 |  0 |   4   |      0 |
| 12  |   7777 |  0 |   5   |      0 |
| 12  |   7777 |  0 |   6   |      0 |
| 12  |   7777 |  0 |   7   |   7777 |
| 12+ |  21845 |  1 |   0   |      0 |
| 13  |  21845 |  1 |   0   |  21845 |
| 13+ |  21845 |  1 |   1   |  11111 |
| 14  |  21845 |  1 |   1   |  21845 |
| 14+ |  21845 |  1 |   2   |      0 |
| 15  |  21845 |  1 |   2   |  21845 |
| 15+ |  21845 |  1 |   3   |   3333 |
| 16  |  21845 |  1 |   3   |  21845 |
| 16+ |  21845 |  1 |   4   |      0 |
| 17  |  21845 |  1 |   4   |  21845 |
| 17+ |  21845 |  1 |   5   |      0 |
| 18  |  21845 |  1 |   5   |  21845 |
| 18+ |  21845 |  1 |   6   |      0 |
| 19  |  21845 |  1 |   6   |  21845 |
| 19+ |  21845 |  1 |   7   |   7777 |
| 20  |  21845 |  1 |   7   |  21845 |
| 20+ |  21845 |  0 |   0   |  21845 |
| 21  |  21845 |  0 |   0   |  21845 |
| 21  |  21845 |  0 |   1   |  21845 |
| 21  |  21845 |  0 |   2   |  21845 |
| 21  |  21845 |  0 |   3   |  21845 |
| 21  |  21845 |  0 |   4   |  21845 |
| 21  |  21845 |  0 |   5   |  21845 |
| 21  |  21845 |  0 |   6   |  21845 |
| 21  |  21845 |  0 |   7   |  21845 |
| 21+ | -21846 |  1 |   0   |  21845 |
| 22  | -21846 |  1 |   0   | -21846 |
| 22+ | -21846 |  0 |   0   | -21846 |
| 23  | -21846 |  0 |   0   | -21846 |
| 23  | -21846 |  0 |   1   |  21845 |
| 23  | -21846 |  0 |   2   |  21845 |
| 23  | -21846 |  0 |   3   |  21845 |
| 23  | -21846 |  0 |   4   |  21845 |
| 23  | -21846 |  0 |   5   |  21845 |
| 23  | -21846 |  0 |   6   |  21845 |
| 23  | -21846 |  0 |   7   |  21845 |
| 23+ |  21845 |  1 |   0   | -21846 |
| 24  |  21845 |  1 |   0   |  21845 |
| 24+ | -21846 |  1 |   1   |  21845 |
| 25  | -21846 |  1 |   1   | -21846 |
| 25+ | -21846 |  0 |   0   |  21845 |
| 26  | -21846 |  0 |   0   |  21845 |
| 26  | -21846 |  0 |   1   | -21846 |
| 26  | -21846 |  0 |   2   |  21845 |
| 26  | -21846 |  0 |   3   |  21845 |
| 26  | -21846 |  0 |   4   |  21845 |
| 26  | -21846 |  0 |   5   |  21845 |
| 26  | -21846 |  0 |   6   |  21845 |
| 26  | -21846 |  0 |   7   |  21845 |
| 26+ |  21845 |  1 |   1   | -21846 |
| 27  |  21845 |  1 |   1   |  21845 |
| 27+ | -21846 |  1 |   2   |  21845 |
| 28  | -21846 |  1 |   2   | -21846 |
| 28+ | -21846 |  0 |   0   |  21845 |
| 29  | -21846 |  0 |   0   |  21845 |
| 29  | -21846 |  0 |   1   |  21845 |
| 29  | -21846 |  0 |   2   | -21846 |
| 29  | -21846 |  0 |   3   |  21845 |
| 29  | -21846 |  0 |   4   |  21845 |
| 29  | -21846 |  0 |   5   |  21845 |
| 29  | -21846 |  0 |   6   |  21845 |
| 29  | -21846 |  0 |   7   |  21845 |
| 29+ |  21845 |  1 |   2   | -21846 |
| 30  |  21845 |  1 |   2   |  21845 |
| 30+ | -21846 |  1 |   3   |  21845 |
| 31  | -21846 |  1 |   3   | -21846 |
| 31+ | -21846 |  0 |   0   |  21845 |
| 32  | -21846 |  0 |   0   |  21845 |
| 32  | -21846 |  0 |   1   |  21845 |
| 32  | -21846 |  0 |   2   |  21845 |
| 32  | -21846 |  0 |   3   | -21846 |
| 32  | -21846 |  0 |   4   |  21845 |
| 32  | -21846 |  0 |   5   |  21845 |
| 32  | -21846 |  0 |   6   |  21845 |
| 32  | -21846 |  0 |   7   |  21845 |
| 32+ |  21845 |  1 |   3   | -21846 |
| 33  |  21845 |  1 |   3   |  21845 |
| 33+ | -21846 |  1 |   4   |  21845 |
| 34  | -21846 |  1 |   4   | -21846 |
| 34+ | -21846 |  0 |   0   |  21845 |
| 35  | -21846 |  0 |   0   |  21845 |
| 35  | -21846 |  0 |   1   |  21845 |
| 35  | -21846 |  0 |   2   |  21845 |
| 35  | -21846 |  0 |   3   |  21845 |
| 35  | -21846 |  0 |   4   | -21846 |
| 35  | -21846 |  0 |   5   |  21845 |
| 35  | -21846 |  0 |   6   |  21845 |
| 35  | -21846 |  0 |   7   |  21845 |
| 35+ |  21845 |  1 |   4   | -21846 |
| 36  |  21845 |  1 |   4   |  21845 |
| 36+ | -21846 |  1 |   5   |  21845 |
| 37  | -21846 |  1 |   5   | -21846 |
| 37+ | -21846 |  0 |   0   |  21845 |
| 38  | -21846 |  0 |   0   |  21845 |
| 38  | -21846 |  0 |   1   |  21845 |
| 38  | -21846 |  0 |   2   |  21845 |
| 38  | -21846 |  0 |   3   |  21845 |
| 38  | -21846 |  0 |   4   |  21845 |
| 38  | -21846 |  0 |   5   | -21846 |
| 38  | -21846 |  0 |   6   |  21845 |
| 38  | -21846 |  0 |   7   |  21845 |
| 38+ |  21845 |  1 |   5   | -21846 |
| 39  |  21845 |  1 |   5   |  21845 |
| 39+ | -21846 |  1 |   6   |  21845 |
| 40  | -21846 |  1 |   6   | -21846 |
| 40+ | -21846 |  0 |   0   |  21845 |
| 41  | -21846 |  0 |   0   |  21845 |
| 41  | -21846 |  0 |   1   |  21845 |
| 41  | -21846 |  0 |   2   |  21845 |
| 41  | -21846 |  0 |   3   |  21845 |
| 41  | -21846 |  0 |   4   |  21845 |
| 41  | -21846 |  0 |   5   |  21845 |
| 41  | -21846 |  0 |   6   | -21846 |
| 41  | -21846 |  0 |   7   |  21845 |
| 41+ |  21845 |  1 |   6   | -21846 |
| 42  |  21845 |  1 |   6   |  21845 |
| 42+ | -21846 |  1 |   7   |  21845 |
| 43  | -21846 |  1 |   7   | -21846 |
| 43+ | -21846 |  0 |   0   |  21845 |
| 44  | -21846 |  0 |   0   |  21845 |
| 44  | -21846 |  0 |   1   |  21845 |
| 44  | -21846 |  0 |   2   |  21845 |
| 44  | -21846 |  0 |   3   |  21845 |
| 44  | -21846 |  0 |   4   |  21845 |
| 44  | -21846 |  0 |   5   |  21845 |
| 44  | -21846 |  0 |   6   |  21845 |
| 44  | -21846 |  0 |   7   | -21846 |
| 44+ |  21845 |  1 |   7   | -21846 |
| 45  |  21845 |  1 |   7   |  21845 |
| 45+ |  21845 |  0 |   0   |  21845 |
| 46  |  21845 |  0 |   0   |  21845 |
| 46  |  21845 |  0 |   1   |  21845 |
| 46  |  21845 |  0 |   2   |  21845 |
| 46  |  21845 |  0 |   3   |  21845 |
| 46  |  21845 |  0 |   4   |  21845 |
| 46  |  21845 |  0 |   5   |  21845 |
| 46  |  21845 |  0 |   6   |  21845 |
| 46  |  21845 |  0 |   7   |  21845 |`;

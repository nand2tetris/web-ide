export const hdl = `// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/3/b/RAM4K.hdl
/**
 * Memory of 4K 16-bit registers.
 * If load is asserted, the value of the register selected by
 * address is set to in; Otherwise, the value does not change.
 * The value of the selected register is emitted by out.
 */
CHIP RAM4K {
    IN in[16], load, address[12];
    OUT out[16];

    PARTS:
    //// Replace this comment with your code.
}`;
export const tst = `// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/3/b/RAM4K.tst

load RAM4K.hdl,
compare-to RAM4K.cmp,
output-list time%S1.3.1 in%D1.6.1 load%B2.1.1 address%D2.4.2 out%D1.6.1;

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

set in 1111,
set load 0,
tick,
output;
tock,
output;

set load 1,
set address 1111,
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

set in 3513,
set address 3513,
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

set address 1111,
eval,
output;

set in 4095,
tick,
output;
tock,
output;

set load 1,
set address 4095,
tick,
output;
tock,
output;

set load 0,
tick,
output;
tock,
output;

set address 3513,
eval,
output;

set address 4095,
eval,
output;


set load 0,
set address %B101010101000,
tick,
output;
tock,
output;
set address %B101010101001,
eval,
output;
set address %B101010101010,
eval,
output;
set address %B101010101011,
eval,
output;
set address %B101010101100,
eval,
output;
set address %B101010101101,
eval,
output;
set address %B101010101110,
eval,
output;
set address %B101010101111,
eval,
output;

set load 1,
set in %B0101010101010101,
set address %B101010101000,
tick,
output;
tock,
output;
set address %B101010101001,
tick,
output,
tock,
output;
set address %B101010101010,
tick,
output,
tock,
output;
set address %B101010101011,
tick,
output,
tock,
output;
set address %B101010101100,
tick,
output,
tock,
output;
set address %B101010101101,
tick,
output,
tock,
output;
set address %B101010101110,
tick,
output,
tock,
output;
set address %B101010101111,
tick,
output,
tock,
output;

set load 0,
set address %B101010101000,
tick,
output;
tock,
output;
set address %B101010101001,
eval,
output;
set address %B101010101010,
eval,
output;
set address %B101010101011,
eval,
output;
set address %B101010101100,
eval,
output;
set address %B101010101101,
eval,
output;
set address %B101010101110,
eval,
output;
set address %B101010101111,
eval,
output;

set load 1,
set address %B101010101000,
set in %B1010101010101010,
tick,
output;
tock,
output;

set load 0,
set address %B101010101000,
tick,
output;
tock,
output;
set address %B101010101001,
eval,
output;
set address %B101010101010,
eval,
output;
set address %B101010101011,
eval,
output;
set address %B101010101100,
eval,
output;
set address %B101010101101,
eval,
output;
set address %B101010101110,
eval,
output;
set address %B101010101111,
eval,
output;

set load 1,
set address %B101010101000,
set in %B0101010101010101,
tick,
output,
tock,
output;
set address %B101010101001,
set in %B1010101010101010,
tick,
output;
tock,
output;

set load 0,
set address %B101010101000,
tick,
output;
tock,
output;
set address %B101010101001,
eval,
output;
set address %B101010101010,
eval,
output;
set address %B101010101011,
eval,
output;
set address %B101010101100,
eval,
output;
set address %B101010101101,
eval,
output;
set address %B101010101110,
eval,
output;
set address %B101010101111,
eval,
output;

set load 1,
set address %B101010101001,
set in %B0101010101010101,
tick,
output,
tock,
output;
set address %B101010101010,
set in %B1010101010101010,
tick,
output;
tock,
output;

set load 0,
set address %B101010101000,
tick,
output;
tock,
output;
set address %B101010101001,
eval,
output;
set address %B101010101010,
eval,
output;
set address %B101010101011,
eval,
output;
set address %B101010101100,
eval,
output;
set address %B101010101101,
eval,
output;
set address %B101010101110,
eval,
output;
set address %B101010101111,
eval,
output;

set load 1,
set address %B101010101010,
set in %B0101010101010101,
tick,
output,
tock,
output;
set address %B101010101011,
set in %B1010101010101010,
tick,
output;
tock,
output;

set load 0,
set address %B101010101000,
tick,
output;
tock,
output;
set address %B101010101001,
eval,
output;
set address %B101010101010,
eval,
output;
set address %B101010101011,
eval,
output;
set address %B101010101100,
eval,
output;
set address %B101010101101,
eval,
output;
set address %B101010101110,
eval,
output;
set address %B101010101111,
eval,
output;

set load 1,
set address %B101010101011,
set in %B0101010101010101,
tick,
output,
tock,
output;
set address %B101010101100,
set in %B1010101010101010,
tick,
output;
tock,
output;

set load 0,
set address %B101010101000,
tick,
output;
tock,
output;
set address %B101010101001,
eval,
output;
set address %B101010101010,
eval,
output;
set address %B101010101011,
eval,
output;
set address %B101010101100,
eval,
output;
set address %B101010101101,
eval,
output;
set address %B101010101110,
eval,
output;
set address %B101010101111,
eval,
output;

set load 1,
set address %B101010101100,
set in %B0101010101010101,
tick,
output,
tock,
output;
set address %B101010101101,
set in %B1010101010101010,
tick,
output;
tock,
output;

set load 0,
set address %B101010101000,
tick,
output;
tock,
output;
set address %B101010101001,
eval,
output;
set address %B101010101010,
eval,
output;
set address %B101010101011,
eval,
output;
set address %B101010101100,
eval,
output;
set address %B101010101101,
eval,
output;
set address %B101010101110,
eval,
output;
set address %B101010101111,
eval,
output;

set load 1,
set address %B101010101101,
set in %B0101010101010101,
tick,
output,
tock,
output;
set address %B101010101110,
set in %B1010101010101010,
tick,
output;
tock,
output;

set load 0,
set address %B101010101000,
tick,
output;
tock,
output;
set address %B101010101001,
eval,
output;
set address %B101010101010,
eval,
output;
set address %B101010101011,
eval,
output;
set address %B101010101100,
eval,
output;
set address %B101010101101,
eval,
output;
set address %B101010101110,
eval,
output;
set address %B101010101111,
eval,
output;

set load 1,
set address %B101010101110,
set in %B0101010101010101,
tick,
output,
tock,
output;
set address %B101010101111,
set in %B1010101010101010,
tick,
output;
tock,
output;

set load 0,
set address %B101010101000,
tick,
output;
tock,
output;
set address %B101010101001,
eval,
output;
set address %B101010101010,
eval,
output;
set address %B101010101011,
eval,
output;
set address %B101010101100,
eval,
output;
set address %B101010101101,
eval,
output;
set address %B101010101110,
eval,
output;
set address %B101010101111,
eval,
output;

set load 1,
set address %B101010101111,
set in %B0101010101010101,
tick,
output,
tock,
output;

set load 0,
set address %B101010101000,
tick,
output;
tock,
output;
set address %B101010101001,
eval,
output;
set address %B101010101010,
eval,
output;
set address %B101010101011,
eval,
output;
set address %B101010101100,
eval,
output;
set address %B101010101101,
eval,
output;
set address %B101010101110,
eval,
output;
set address %B101010101111,
eval,
output;


set load 0,
set address %B000101010101,
tick,
output;
tock,
output;
set address %B001101010101,
eval,
output;
set address %B010101010101,
eval,
output;
set address %B011101010101,
eval,
output;
set address %B100101010101,
eval,
output;
set address %B101101010101,
eval,
output;
set address %B110101010101,
eval,
output;
set address %B111101010101,
eval,
output;

set load 1,
set in %B0101010101010101,
set address %B000101010101,
tick,
output;
tock,
output;
set address %B001101010101,
tick,
output,
tock,
output;
set address %B010101010101,
tick,
output,
tock,
output;
set address %B011101010101,
tick,
output,
tock,
output;
set address %B100101010101,
tick,
output,
tock,
output;
set address %B101101010101,
tick,
output,
tock,
output;
set address %B110101010101,
tick,
output,
tock,
output;
set address %B111101010101,
tick,
output,
tock,
output;

set load 0,
set address %B000101010101,
tick,
output;
tock,
output;
set address %B001101010101,
eval,
output;
set address %B010101010101,
eval,
output;
set address %B011101010101,
eval,
output;
set address %B100101010101,
eval,
output;
set address %B101101010101,
eval,
output;
set address %B110101010101,
eval,
output;
set address %B111101010101,
eval,
output;

set load 1,
set address %B000101010101,
set in %B1010101010101010,
tick,
output;
tock,
output;

set load 0,
set address %B000101010101,
tick,
output;
tock,
output;
set address %B001101010101,
eval,
output;
set address %B010101010101,
eval,
output;
set address %B011101010101,
eval,
output;
set address %B100101010101,
eval,
output;
set address %B101101010101,
eval,
output;
set address %B110101010101,
eval,
output;
set address %B111101010101,
eval,
output;

set load 1,
set address %B000101010101,
set in %B0101010101010101,
tick,
output,
tock,
output;
set address %B001101010101,
set in %B1010101010101010,
tick,
output;
tock,
output;

set load 0,
set address %B000101010101,
tick,
output;
tock,
output;
set address %B001101010101,
eval,
output;
set address %B010101010101,
eval,
output;
set address %B011101010101,
eval,
output;
set address %B100101010101,
eval,
output;
set address %B101101010101,
eval,
output;
set address %B110101010101,
eval,
output;
set address %B111101010101,
eval,
output;

set load 1,
set address %B001101010101,
set in %B0101010101010101,
tick,
output,
tock,
output;
set address %B010101010101,
set in %B1010101010101010,
tick,
output;
tock,
output;

set load 0,
set address %B000101010101,
tick,
output;
tock,
output;
set address %B001101010101,
eval,
output;
set address %B010101010101,
eval,
output;
set address %B011101010101,
eval,
output;
set address %B100101010101,
eval,
output;
set address %B101101010101,
eval,
output;
set address %B110101010101,
eval,
output;
set address %B111101010101,
eval,
output;

set load 1,
set address %B010101010101,
set in %B0101010101010101,
tick,
output,
tock,
output;
set address %B011101010101,
set in %B1010101010101010,
tick,
output;
tock,
output;

set load 0,
set address %B000101010101,
tick,
output;
tock,
output;
set address %B001101010101,
eval,
output;
set address %B010101010101,
eval,
output;
set address %B011101010101,
eval,
output;
set address %B100101010101,
eval,
output;
set address %B101101010101,
eval,
output;
set address %B110101010101,
eval,
output;
set address %B111101010101,
eval,
output;

set load 1,
set address %B011101010101,
set in %B0101010101010101,
tick,
output,
tock,
output;
set address %B100101010101,
set in %B1010101010101010,
tick,
output;
tock,
output;

set load 0,
set address %B000101010101,
tick,
output;
tock,
output;
set address %B001101010101,
eval,
output;
set address %B010101010101,
eval,
output;
set address %B011101010101,
eval,
output;
set address %B100101010101,
eval,
output;
set address %B101101010101,
eval,
output;
set address %B110101010101,
eval,
output;
set address %B111101010101,
eval,
output;

set load 1,
set address %B100101010101,
set in %B0101010101010101,
tick,
output,
tock,
output;
set address %B101101010101,
set in %B1010101010101010,
tick,
output;
tock,
output;

set load 0,
set address %B000101010101,
tick,
output;
tock,
output;
set address %B001101010101,
eval,
output;
set address %B010101010101,
eval,
output;
set address %B011101010101,
eval,
output;
set address %B100101010101,
eval,
output;
set address %B101101010101,
eval,
output;
set address %B110101010101,
eval,
output;
set address %B111101010101,
eval,
output;

set load 1,
set address %B101101010101,
set in %B0101010101010101,
tick,
output,
tock,
output;
set address %B110101010101,
set in %B1010101010101010,
tick,
output;
tock,
output;

set load 0,
set address %B000101010101,
tick,
output;
tock,
output;
set address %B001101010101,
eval,
output;
set address %B010101010101,
eval,
output;
set address %B011101010101,
eval,
output;
set address %B100101010101,
eval,
output;
set address %B101101010101,
eval,
output;
set address %B110101010101,
eval,
output;
set address %B111101010101,
eval,
output;

set load 1,
set address %B110101010101,
set in %B0101010101010101,
tick,
output,
tock,
output;
set address %B111101010101,
set in %B1010101010101010,
tick,
output;
tock,
output;

set load 0,
set address %B000101010101,
tick,
output;
tock,
output;
set address %B001101010101,
eval,
output;
set address %B010101010101,
eval,
output;
set address %B011101010101,
eval,
output;
set address %B100101010101,
eval,
output;
set address %B101101010101,
eval,
output;
set address %B110101010101,
eval,
output;
set address %B111101010101,
eval,
output;

set load 1,
set address %B111101010101,
set in %B0101010101010101,
tick,
output,
tock,
output;

set load 0,
set address %B000101010101,
tick,
output;
tock,
output;
set address %B001101010101,
eval,
output;
set address %B010101010101,
eval,
output;
set address %B011101010101,
eval,
output;
set address %B100101010101,
eval,
output;
set address %B101101010101,
eval,
output;
set address %B110101010101,
eval,
output;
set address %B111101010101,
eval,
output;`;
export const cmp = `|time |   in   |load|address |  out   |
| 0+  |      0 |  0 |     0  |      0 |
| 1   |      0 |  0 |     0  |      0 |
| 1+  |      0 |  1 |     0  |      0 |
| 2   |      0 |  1 |     0  |      0 |
| 2+  |   1111 |  0 |     0  |      0 |
| 3   |   1111 |  0 |     0  |      0 |
| 3+  |   1111 |  1 |  1111  |      0 |
| 4   |   1111 |  1 |  1111  |   1111 |
| 4+  |   1111 |  0 |     0  |      0 |
| 5   |   1111 |  0 |     0  |      0 |
| 5+  |   3513 |  0 |  3513  |      0 |
| 6   |   3513 |  0 |  3513  |      0 |
| 6+  |   3513 |  1 |  3513  |      0 |
| 7   |   3513 |  1 |  3513  |   3513 |
| 7+  |   3513 |  0 |  3513  |   3513 |
| 8   |   3513 |  0 |  3513  |   3513 |
| 8   |   3513 |  0 |  1111  |   1111 |
| 8+  |   4095 |  0 |  1111  |   1111 |
| 9   |   4095 |  0 |  1111  |   1111 |
| 9+  |   4095 |  1 |  4095  |      0 |
| 10  |   4095 |  1 |  4095  |   4095 |
| 10+ |   4095 |  0 |  4095  |   4095 |
| 11  |   4095 |  0 |  4095  |   4095 |
| 11  |   4095 |  0 |  3513  |   3513 |
| 11  |   4095 |  0 |  4095  |   4095 |
| 11+ |   4095 |  0 |  2728  |      0 |
| 12  |   4095 |  0 |  2728  |      0 |
| 12  |   4095 |  0 |  2729  |      0 |
| 12  |   4095 |  0 |  2730  |      0 |
| 12  |   4095 |  0 |  2731  |      0 |
| 12  |   4095 |  0 |  2732  |      0 |
| 12  |   4095 |  0 |  2733  |      0 |
| 12  |   4095 |  0 |  2734  |      0 |
| 12  |   4095 |  0 |  2735  |      0 |
| 12+ |  21845 |  1 |  2728  |      0 |
| 13  |  21845 |  1 |  2728  |  21845 |
| 13+ |  21845 |  1 |  2729  |      0 |
| 14  |  21845 |  1 |  2729  |  21845 |
| 14+ |  21845 |  1 |  2730  |      0 |
| 15  |  21845 |  1 |  2730  |  21845 |
| 15+ |  21845 |  1 |  2731  |      0 |
| 16  |  21845 |  1 |  2731  |  21845 |
| 16+ |  21845 |  1 |  2732  |      0 |
| 17  |  21845 |  1 |  2732  |  21845 |
| 17+ |  21845 |  1 |  2733  |      0 |
| 18  |  21845 |  1 |  2733  |  21845 |
| 18+ |  21845 |  1 |  2734  |      0 |
| 19  |  21845 |  1 |  2734  |  21845 |
| 19+ |  21845 |  1 |  2735  |      0 |
| 20  |  21845 |  1 |  2735  |  21845 |
| 20+ |  21845 |  0 |  2728  |  21845 |
| 21  |  21845 |  0 |  2728  |  21845 |
| 21  |  21845 |  0 |  2729  |  21845 |
| 21  |  21845 |  0 |  2730  |  21845 |
| 21  |  21845 |  0 |  2731  |  21845 |
| 21  |  21845 |  0 |  2732  |  21845 |
| 21  |  21845 |  0 |  2733  |  21845 |
| 21  |  21845 |  0 |  2734  |  21845 |
| 21  |  21845 |  0 |  2735  |  21845 |
| 21+ | -21846 |  1 |  2728  |  21845 |
| 22  | -21846 |  1 |  2728  | -21846 |
| 22+ | -21846 |  0 |  2728  | -21846 |
| 23  | -21846 |  0 |  2728  | -21846 |
| 23  | -21846 |  0 |  2729  |  21845 |
| 23  | -21846 |  0 |  2730  |  21845 |
| 23  | -21846 |  0 |  2731  |  21845 |
| 23  | -21846 |  0 |  2732  |  21845 |
| 23  | -21846 |  0 |  2733  |  21845 |
| 23  | -21846 |  0 |  2734  |  21845 |
| 23  | -21846 |  0 |  2735  |  21845 |
| 23+ |  21845 |  1 |  2728  | -21846 |
| 24  |  21845 |  1 |  2728  |  21845 |
| 24+ | -21846 |  1 |  2729  |  21845 |
| 25  | -21846 |  1 |  2729  | -21846 |
| 25+ | -21846 |  0 |  2728  |  21845 |
| 26  | -21846 |  0 |  2728  |  21845 |
| 26  | -21846 |  0 |  2729  | -21846 |
| 26  | -21846 |  0 |  2730  |  21845 |
| 26  | -21846 |  0 |  2731  |  21845 |
| 26  | -21846 |  0 |  2732  |  21845 |
| 26  | -21846 |  0 |  2733  |  21845 |
| 26  | -21846 |  0 |  2734  |  21845 |
| 26  | -21846 |  0 |  2735  |  21845 |
| 26+ |  21845 |  1 |  2729  | -21846 |
| 27  |  21845 |  1 |  2729  |  21845 |
| 27+ | -21846 |  1 |  2730  |  21845 |
| 28  | -21846 |  1 |  2730  | -21846 |
| 28+ | -21846 |  0 |  2728  |  21845 |
| 29  | -21846 |  0 |  2728  |  21845 |
| 29  | -21846 |  0 |  2729  |  21845 |
| 29  | -21846 |  0 |  2730  | -21846 |
| 29  | -21846 |  0 |  2731  |  21845 |
| 29  | -21846 |  0 |  2732  |  21845 |
| 29  | -21846 |  0 |  2733  |  21845 |
| 29  | -21846 |  0 |  2734  |  21845 |
| 29  | -21846 |  0 |  2735  |  21845 |
| 29+ |  21845 |  1 |  2730  | -21846 |
| 30  |  21845 |  1 |  2730  |  21845 |
| 30+ | -21846 |  1 |  2731  |  21845 |
| 31  | -21846 |  1 |  2731  | -21846 |
| 31+ | -21846 |  0 |  2728  |  21845 |
| 32  | -21846 |  0 |  2728  |  21845 |
| 32  | -21846 |  0 |  2729  |  21845 |
| 32  | -21846 |  0 |  2730  |  21845 |
| 32  | -21846 |  0 |  2731  | -21846 |
| 32  | -21846 |  0 |  2732  |  21845 |
| 32  | -21846 |  0 |  2733  |  21845 |
| 32  | -21846 |  0 |  2734  |  21845 |
| 32  | -21846 |  0 |  2735  |  21845 |
| 32+ |  21845 |  1 |  2731  | -21846 |
| 33  |  21845 |  1 |  2731  |  21845 |
| 33+ | -21846 |  1 |  2732  |  21845 |
| 34  | -21846 |  1 |  2732  | -21846 |
| 34+ | -21846 |  0 |  2728  |  21845 |
| 35  | -21846 |  0 |  2728  |  21845 |
| 35  | -21846 |  0 |  2729  |  21845 |
| 35  | -21846 |  0 |  2730  |  21845 |
| 35  | -21846 |  0 |  2731  |  21845 |
| 35  | -21846 |  0 |  2732  | -21846 |
| 35  | -21846 |  0 |  2733  |  21845 |
| 35  | -21846 |  0 |  2734  |  21845 |
| 35  | -21846 |  0 |  2735  |  21845 |
| 35+ |  21845 |  1 |  2732  | -21846 |
| 36  |  21845 |  1 |  2732  |  21845 |
| 36+ | -21846 |  1 |  2733  |  21845 |
| 37  | -21846 |  1 |  2733  | -21846 |
| 37+ | -21846 |  0 |  2728  |  21845 |
| 38  | -21846 |  0 |  2728  |  21845 |
| 38  | -21846 |  0 |  2729  |  21845 |
| 38  | -21846 |  0 |  2730  |  21845 |
| 38  | -21846 |  0 |  2731  |  21845 |
| 38  | -21846 |  0 |  2732  |  21845 |
| 38  | -21846 |  0 |  2733  | -21846 |
| 38  | -21846 |  0 |  2734  |  21845 |
| 38  | -21846 |  0 |  2735  |  21845 |
| 38+ |  21845 |  1 |  2733  | -21846 |
| 39  |  21845 |  1 |  2733  |  21845 |
| 39+ | -21846 |  1 |  2734  |  21845 |
| 40  | -21846 |  1 |  2734  | -21846 |
| 40+ | -21846 |  0 |  2728  |  21845 |
| 41  | -21846 |  0 |  2728  |  21845 |
| 41  | -21846 |  0 |  2729  |  21845 |
| 41  | -21846 |  0 |  2730  |  21845 |
| 41  | -21846 |  0 |  2731  |  21845 |
| 41  | -21846 |  0 |  2732  |  21845 |
| 41  | -21846 |  0 |  2733  |  21845 |
| 41  | -21846 |  0 |  2734  | -21846 |
| 41  | -21846 |  0 |  2735  |  21845 |
| 41+ |  21845 |  1 |  2734  | -21846 |
| 42  |  21845 |  1 |  2734  |  21845 |
| 42+ | -21846 |  1 |  2735  |  21845 |
| 43  | -21846 |  1 |  2735  | -21846 |
| 43+ | -21846 |  0 |  2728  |  21845 |
| 44  | -21846 |  0 |  2728  |  21845 |
| 44  | -21846 |  0 |  2729  |  21845 |
| 44  | -21846 |  0 |  2730  |  21845 |
| 44  | -21846 |  0 |  2731  |  21845 |
| 44  | -21846 |  0 |  2732  |  21845 |
| 44  | -21846 |  0 |  2733  |  21845 |
| 44  | -21846 |  0 |  2734  |  21845 |
| 44  | -21846 |  0 |  2735  | -21846 |
| 44+ |  21845 |  1 |  2735  | -21846 |
| 45  |  21845 |  1 |  2735  |  21845 |
| 45+ |  21845 |  0 |  2728  |  21845 |
| 46  |  21845 |  0 |  2728  |  21845 |
| 46  |  21845 |  0 |  2729  |  21845 |
| 46  |  21845 |  0 |  2730  |  21845 |
| 46  |  21845 |  0 |  2731  |  21845 |
| 46  |  21845 |  0 |  2732  |  21845 |
| 46  |  21845 |  0 |  2733  |  21845 |
| 46  |  21845 |  0 |  2734  |  21845 |
| 46  |  21845 |  0 |  2735  |  21845 |
| 46+ |  21845 |  0 |   341  |      0 |
| 47  |  21845 |  0 |   341  |      0 |
| 47  |  21845 |  0 |   853  |      0 |
| 47  |  21845 |  0 |  1365  |      0 |
| 47  |  21845 |  0 |  1877  |      0 |
| 47  |  21845 |  0 |  2389  |      0 |
| 47  |  21845 |  0 |  2901  |      0 |
| 47  |  21845 |  0 |  3413  |      0 |
| 47  |  21845 |  0 |  3925  |      0 |
| 47+ |  21845 |  1 |   341  |      0 |
| 48  |  21845 |  1 |   341  |  21845 |
| 48+ |  21845 |  1 |   853  |      0 |
| 49  |  21845 |  1 |   853  |  21845 |
| 49+ |  21845 |  1 |  1365  |      0 |
| 50  |  21845 |  1 |  1365  |  21845 |
| 50+ |  21845 |  1 |  1877  |      0 |
| 51  |  21845 |  1 |  1877  |  21845 |
| 51+ |  21845 |  1 |  2389  |      0 |
| 52  |  21845 |  1 |  2389  |  21845 |
| 52+ |  21845 |  1 |  2901  |      0 |
| 53  |  21845 |  1 |  2901  |  21845 |
| 53+ |  21845 |  1 |  3413  |      0 |
| 54  |  21845 |  1 |  3413  |  21845 |
| 54+ |  21845 |  1 |  3925  |      0 |
| 55  |  21845 |  1 |  3925  |  21845 |
| 55+ |  21845 |  0 |   341  |  21845 |
| 56  |  21845 |  0 |   341  |  21845 |
| 56  |  21845 |  0 |   853  |  21845 |
| 56  |  21845 |  0 |  1365  |  21845 |
| 56  |  21845 |  0 |  1877  |  21845 |
| 56  |  21845 |  0 |  2389  |  21845 |
| 56  |  21845 |  0 |  2901  |  21845 |
| 56  |  21845 |  0 |  3413  |  21845 |
| 56  |  21845 |  0 |  3925  |  21845 |
| 56+ | -21846 |  1 |   341  |  21845 |
| 57  | -21846 |  1 |   341  | -21846 |
| 57+ | -21846 |  0 |   341  | -21846 |
| 58  | -21846 |  0 |   341  | -21846 |
| 58  | -21846 |  0 |   853  |  21845 |
| 58  | -21846 |  0 |  1365  |  21845 |
| 58  | -21846 |  0 |  1877  |  21845 |
| 58  | -21846 |  0 |  2389  |  21845 |
| 58  | -21846 |  0 |  2901  |  21845 |
| 58  | -21846 |  0 |  3413  |  21845 |
| 58  | -21846 |  0 |  3925  |  21845 |
| 58+ |  21845 |  1 |   341  | -21846 |
| 59  |  21845 |  1 |   341  |  21845 |
| 59+ | -21846 |  1 |   853  |  21845 |
| 60  | -21846 |  1 |   853  | -21846 |
| 60+ | -21846 |  0 |   341  |  21845 |
| 61  | -21846 |  0 |   341  |  21845 |
| 61  | -21846 |  0 |   853  | -21846 |
| 61  | -21846 |  0 |  1365  |  21845 |
| 61  | -21846 |  0 |  1877  |  21845 |
| 61  | -21846 |  0 |  2389  |  21845 |
| 61  | -21846 |  0 |  2901  |  21845 |
| 61  | -21846 |  0 |  3413  |  21845 |
| 61  | -21846 |  0 |  3925  |  21845 |
| 61+ |  21845 |  1 |   853  | -21846 |
| 62  |  21845 |  1 |   853  |  21845 |
| 62+ | -21846 |  1 |  1365  |  21845 |
| 63  | -21846 |  1 |  1365  | -21846 |
| 63+ | -21846 |  0 |   341  |  21845 |
| 64  | -21846 |  0 |   341  |  21845 |
| 64  | -21846 |  0 |   853  |  21845 |
| 64  | -21846 |  0 |  1365  | -21846 |
| 64  | -21846 |  0 |  1877  |  21845 |
| 64  | -21846 |  0 |  2389  |  21845 |
| 64  | -21846 |  0 |  2901  |  21845 |
| 64  | -21846 |  0 |  3413  |  21845 |
| 64  | -21846 |  0 |  3925  |  21845 |
| 64+ |  21845 |  1 |  1365  | -21846 |
| 65  |  21845 |  1 |  1365  |  21845 |
| 65+ | -21846 |  1 |  1877  |  21845 |
| 66  | -21846 |  1 |  1877  | -21846 |
| 66+ | -21846 |  0 |   341  |  21845 |
| 67  | -21846 |  0 |   341  |  21845 |
| 67  | -21846 |  0 |   853  |  21845 |
| 67  | -21846 |  0 |  1365  |  21845 |
| 67  | -21846 |  0 |  1877  | -21846 |
| 67  | -21846 |  0 |  2389  |  21845 |
| 67  | -21846 |  0 |  2901  |  21845 |
| 67  | -21846 |  0 |  3413  |  21845 |
| 67  | -21846 |  0 |  3925  |  21845 |
| 67+ |  21845 |  1 |  1877  | -21846 |
| 68  |  21845 |  1 |  1877  |  21845 |
| 68+ | -21846 |  1 |  2389  |  21845 |
| 69  | -21846 |  1 |  2389  | -21846 |
| 69+ | -21846 |  0 |   341  |  21845 |
| 70  | -21846 |  0 |   341  |  21845 |
| 70  | -21846 |  0 |   853  |  21845 |
| 70  | -21846 |  0 |  1365  |  21845 |
| 70  | -21846 |  0 |  1877  |  21845 |
| 70  | -21846 |  0 |  2389  | -21846 |
| 70  | -21846 |  0 |  2901  |  21845 |
| 70  | -21846 |  0 |  3413  |  21845 |
| 70  | -21846 |  0 |  3925  |  21845 |
| 70+ |  21845 |  1 |  2389  | -21846 |
| 71  |  21845 |  1 |  2389  |  21845 |
| 71+ | -21846 |  1 |  2901  |  21845 |
| 72  | -21846 |  1 |  2901  | -21846 |
| 72+ | -21846 |  0 |   341  |  21845 |
| 73  | -21846 |  0 |   341  |  21845 |
| 73  | -21846 |  0 |   853  |  21845 |
| 73  | -21846 |  0 |  1365  |  21845 |
| 73  | -21846 |  0 |  1877  |  21845 |
| 73  | -21846 |  0 |  2389  |  21845 |
| 73  | -21846 |  0 |  2901  | -21846 |
| 73  | -21846 |  0 |  3413  |  21845 |
| 73  | -21846 |  0 |  3925  |  21845 |
| 73+ |  21845 |  1 |  2901  | -21846 |
| 74  |  21845 |  1 |  2901  |  21845 |
| 74+ | -21846 |  1 |  3413  |  21845 |
| 75  | -21846 |  1 |  3413  | -21846 |
| 75+ | -21846 |  0 |   341  |  21845 |
| 76  | -21846 |  0 |   341  |  21845 |
| 76  | -21846 |  0 |   853  |  21845 |
| 76  | -21846 |  0 |  1365  |  21845 |
| 76  | -21846 |  0 |  1877  |  21845 |
| 76  | -21846 |  0 |  2389  |  21845 |
| 76  | -21846 |  0 |  2901  |  21845 |
| 76  | -21846 |  0 |  3413  | -21846 |
| 76  | -21846 |  0 |  3925  |  21845 |
| 76+ |  21845 |  1 |  3413  | -21846 |
| 77  |  21845 |  1 |  3413  |  21845 |
| 77+ | -21846 |  1 |  3925  |  21845 |
| 78  | -21846 |  1 |  3925  | -21846 |
| 78+ | -21846 |  0 |   341  |  21845 |
| 79  | -21846 |  0 |   341  |  21845 |
| 79  | -21846 |  0 |   853  |  21845 |
| 79  | -21846 |  0 |  1365  |  21845 |
| 79  | -21846 |  0 |  1877  |  21845 |
| 79  | -21846 |  0 |  2389  |  21845 |
| 79  | -21846 |  0 |  2901  |  21845 |
| 79  | -21846 |  0 |  3413  |  21845 |
| 79  | -21846 |  0 |  3925  | -21846 |
| 79+ |  21845 |  1 |  3925  | -21846 |
| 80  |  21845 |  1 |  3925  |  21845 |
| 80+ |  21845 |  0 |   341  |  21845 |
| 81  |  21845 |  0 |   341  |  21845 |
| 81  |  21845 |  0 |   853  |  21845 |
| 81  |  21845 |  0 |  1365  |  21845 |
| 81  |  21845 |  0 |  1877  |  21845 |
| 81  |  21845 |  0 |  2389  |  21845 |
| 81  |  21845 |  0 |  2901  |  21845 |
| 81  |  21845 |  0 |  3413  |  21845 |
| 81  |  21845 |  0 |  3925  |  21845 |`;

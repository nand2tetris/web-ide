export const hdl = `// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/3/b/RAM512.hdl
/**
 * Memory of 512 16-bit registers.
 * If load is asserted, the value of the register selected by
 * address is set to in; Otherwise, the value does not change.
 * The value of the selected register is emitted by out.
 */
CHIP RAM512 {
    IN in[16], load, address[9];
    OUT out[16];

    PARTS:
    //// Replace this comment with your code.
}`;
export const tst = `// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/3/b/RAM512.tst

load RAM512.hdl,
compare-to RAM512.cmp,
output-list time%S1.3.1 in%D1.6.1 load%B2.1.1 address%D2.3.2 out%D1.6.1;

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

set in 13099,
set load 0,
tick,
output;
tock,
output;

set load 1,
set address 130,
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

set in 4729,
set address 472,
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

set address 130,
eval,
output;

set in 5119,
tick,
output;
tock,
output;

set load 1,
set address 511,
tick,
output;
tock,
output;

set load 0,
tick,
output;
tock,
output;

set address 472,
eval,
output;

set address 511,
eval,
output;


set load 0,
set address %B010101000,
tick,
output;
tock,
output;
set address %B010101001,
eval,
output;
set address %B010101010,
eval,
output;
set address %B010101011,
eval,
output;
set address %B010101100,
eval,
output;
set address %B010101101,
eval,
output;
set address %B010101110,
eval,
output;
set address %B010101111,
eval,
output;

set load 1,
set in %B0101010101010101,
set address %B010101000,
tick,
output;
tock,
output;
set address %B010101001,
tick,
output,
tock,
output;
set address %B010101010,
tick,
output,
tock,
output;
set address %B010101011,
tick,
output,
tock,
output;
set address %B010101100,
tick,
output,
tock,
output;
set address %B010101101,
tick,
output,
tock,
output;
set address %B010101110,
tick,
output,
tock,
output;
set address %B010101111,
tick,
output,
tock,
output;

set load 0,
set address %B010101000,
tick,
output;
tock,
output;
set address %B010101001,
eval,
output;
set address %B010101010,
eval,
output;
set address %B010101011,
eval,
output;
set address %B010101100,
eval,
output;
set address %B010101101,
eval,
output;
set address %B010101110,
eval,
output;
set address %B010101111,
eval,
output;

set load 1,
set address %B010101000,
set in %B1010101010101010,
tick,
output;
tock,
output;

set load 0,
set address %B010101000,
tick,
output;
tock,
output;
set address %B010101001,
eval,
output;
set address %B010101010,
eval,
output;
set address %B010101011,
eval,
output;
set address %B010101100,
eval,
output;
set address %B010101101,
eval,
output;
set address %B010101110,
eval,
output;
set address %B010101111,
eval,
output;

set load 1,
set address %B010101000,
set in %B0101010101010101,
tick,
output,
tock,
output;
set address %B010101001,
set in %B1010101010101010,
tick,
output;
tock,
output;

set load 0,
set address %B010101000,
tick,
output;
tock,
output;
set address %B010101001,
eval,
output;
set address %B010101010,
eval,
output;
set address %B010101011,
eval,
output;
set address %B010101100,
eval,
output;
set address %B010101101,
eval,
output;
set address %B010101110,
eval,
output;
set address %B010101111,
eval,
output;

set load 1,
set address %B010101001,
set in %B0101010101010101,
tick,
output,
tock,
output;
set address %B010101010,
set in %B1010101010101010,
tick,
output;
tock,
output;

set load 0,
set address %B010101000,
tick,
output;
tock,
output;
set address %B010101001,
eval,
output;
set address %B010101010,
eval,
output;
set address %B010101011,
eval,
output;
set address %B010101100,
eval,
output;
set address %B010101101,
eval,
output;
set address %B010101110,
eval,
output;
set address %B010101111,
eval,
output;

set load 1,
set address %B010101010,
set in %B0101010101010101,
tick,
output,
tock,
output;
set address %B010101011,
set in %B1010101010101010,
tick,
output;
tock,
output;

set load 0,
set address %B010101000,
tick,
output;
tock,
output;
set address %B010101001,
eval,
output;
set address %B010101010,
eval,
output;
set address %B010101011,
eval,
output;
set address %B010101100,
eval,
output;
set address %B010101101,
eval,
output;
set address %B010101110,
eval,
output;
set address %B010101111,
eval,
output;

set load 1,
set address %B010101011,
set in %B0101010101010101,
tick,
output,
tock,
output;
set address %B010101100,
set in %B1010101010101010,
tick,
output;
tock,
output;

set load 0,
set address %B010101000,
tick,
output;
tock,
output;
set address %B010101001,
eval,
output;
set address %B010101010,
eval,
output;
set address %B010101011,
eval,
output;
set address %B010101100,
eval,
output;
set address %B010101101,
eval,
output;
set address %B010101110,
eval,
output;
set address %B010101111,
eval,
output;

set load 1,
set address %B010101100,
set in %B0101010101010101,
tick,
output,
tock,
output;
set address %B010101101,
set in %B1010101010101010,
tick,
output;
tock,
output;

set load 0,
set address %B010101000,
tick,
output;
tock,
output;
set address %B010101001,
eval,
output;
set address %B010101010,
eval,
output;
set address %B010101011,
eval,
output;
set address %B010101100,
eval,
output;
set address %B010101101,
eval,
output;
set address %B010101110,
eval,
output;
set address %B010101111,
eval,
output;

set load 1,
set address %B010101101,
set in %B0101010101010101,
tick,
output,
tock,
output;
set address %B010101110,
set in %B1010101010101010,
tick,
output;
tock,
output;

set load 0,
set address %B010101000,
tick,
output;
tock,
output;
set address %B010101001,
eval,
output;
set address %B010101010,
eval,
output;
set address %B010101011,
eval,
output;
set address %B010101100,
eval,
output;
set address %B010101101,
eval,
output;
set address %B010101110,
eval,
output;
set address %B010101111,
eval,
output;

set load 1,
set address %B010101110,
set in %B0101010101010101,
tick,
output,
tock,
output;
set address %B010101111,
set in %B1010101010101010,
tick,
output;
tock,
output;

set load 0,
set address %B010101000,
tick,
output;
tock,
output;
set address %B010101001,
eval,
output;
set address %B010101010,
eval,
output;
set address %B010101011,
eval,
output;
set address %B010101100,
eval,
output;
set address %B010101101,
eval,
output;
set address %B010101110,
eval,
output;
set address %B010101111,
eval,
output;

set load 1,
set address %B010101111,
set in %B0101010101010101,
tick,
output,
tock,
output;

set load 0,
set address %B010101000,
tick,
output;
tock,
output;
set address %B010101001,
eval,
output;
set address %B010101010,
eval,
output;
set address %B010101011,
eval,
output;
set address %B010101100,
eval,
output;
set address %B010101101,
eval,
output;
set address %B010101110,
eval,
output;
set address %B010101111,
eval,
output;


set load 0,
set address %B000101010,
tick,
output;
tock,
output;
set address %B001101010,
eval,
output;
set address %B010101010,
eval,
output;
set address %B011101010,
eval,
output;
set address %B100101010,
eval,
output;
set address %B101101010,
eval,
output;
set address %B110101010,
eval,
output;
set address %B111101010,
eval,
output;

set load 1,
set in %B0101010101010101,
set address %B000101010,
tick,
output;
tock,
output;
set address %B001101010,
tick,
output,
tock,
output;
set address %B010101010,
tick,
output,
tock,
output;
set address %B011101010,
tick,
output,
tock,
output;
set address %B100101010,
tick,
output,
tock,
output;
set address %B101101010,
tick,
output,
tock,
output;
set address %B110101010,
tick,
output,
tock,
output;
set address %B111101010,
tick,
output,
tock,
output;

set load 0,
set address %B000101010,
tick,
output;
tock,
output;
set address %B001101010,
eval,
output;
set address %B010101010,
eval,
output;
set address %B011101010,
eval,
output;
set address %B100101010,
eval,
output;
set address %B101101010,
eval,
output;
set address %B110101010,
eval,
output;
set address %B111101010,
eval,
output;

set load 1,
set address %B000101010,
set in %B1010101010101010,
tick,
output;
tock,
output;

set load 0,
set address %B000101010,
tick,
output;
tock,
output;
set address %B001101010,
eval,
output;
set address %B010101010,
eval,
output;
set address %B011101010,
eval,
output;
set address %B100101010,
eval,
output;
set address %B101101010,
eval,
output;
set address %B110101010,
eval,
output;
set address %B111101010,
eval,
output;

set load 1,
set address %B000101010,
set in %B0101010101010101,
tick,
output,
tock,
output;
set address %B001101010,
set in %B1010101010101010,
tick,
output;
tock,
output;

set load 0,
set address %B000101010,
tick,
output;
tock,
output;
set address %B001101010,
eval,
output;
set address %B010101010,
eval,
output;
set address %B011101010,
eval,
output;
set address %B100101010,
eval,
output;
set address %B101101010,
eval,
output;
set address %B110101010,
eval,
output;
set address %B111101010,
eval,
output;

set load 1,
set address %B001101010,
set in %B0101010101010101,
tick,
output,
tock,
output;
set address %B010101010,
set in %B1010101010101010,
tick,
output;
tock,
output;

set load 0,
set address %B000101010,
tick,
output;
tock,
output;
set address %B001101010,
eval,
output;
set address %B010101010,
eval,
output;
set address %B011101010,
eval,
output;
set address %B100101010,
eval,
output;
set address %B101101010,
eval,
output;
set address %B110101010,
eval,
output;
set address %B111101010,
eval,
output;

set load 1,
set address %B010101010,
set in %B0101010101010101,
tick,
output,
tock,
output;
set address %B011101010,
set in %B1010101010101010,
tick,
output;
tock,
output;

set load 0,
set address %B000101010,
tick,
output;
tock,
output;
set address %B001101010,
eval,
output;
set address %B010101010,
eval,
output;
set address %B011101010,
eval,
output;
set address %B100101010,
eval,
output;
set address %B101101010,
eval,
output;
set address %B110101010,
eval,
output;
set address %B111101010,
eval,
output;

set load 1,
set address %B011101010,
set in %B0101010101010101,
tick,
output,
tock,
output;
set address %B100101010,
set in %B1010101010101010,
tick,
output;
tock,
output;

set load 0,
set address %B000101010,
tick,
output;
tock,
output;
set address %B001101010,
eval,
output;
set address %B010101010,
eval,
output;
set address %B011101010,
eval,
output;
set address %B100101010,
eval,
output;
set address %B101101010,
eval,
output;
set address %B110101010,
eval,
output;
set address %B111101010,
eval,
output;

set load 1,
set address %B100101010,
set in %B0101010101010101,
tick,
output,
tock,
output;
set address %B101101010,
set in %B1010101010101010,
tick,
output;
tock,
output;

set load 0,
set address %B000101010,
tick,
output;
tock,
output;
set address %B001101010,
eval,
output;
set address %B010101010,
eval,
output;
set address %B011101010,
eval,
output;
set address %B100101010,
eval,
output;
set address %B101101010,
eval,
output;
set address %B110101010,
eval,
output;
set address %B111101010,
eval,
output;

set load 1,
set address %B101101010,
set in %B0101010101010101,
tick,
output,
tock,
output;
set address %B110101010,
set in %B1010101010101010,
tick,
output;
tock,
output;

set load 0,
set address %B000101010,
tick,
output;
tock,
output;
set address %B001101010,
eval,
output;
set address %B010101010,
eval,
output;
set address %B011101010,
eval,
output;
set address %B100101010,
eval,
output;
set address %B101101010,
eval,
output;
set address %B110101010,
eval,
output;
set address %B111101010,
eval,
output;

set load 1,
set address %B110101010,
set in %B0101010101010101,
tick,
output,
tock,
output;
set address %B111101010,
set in %B1010101010101010,
tick,
output;
tock,
output;

set load 0,
set address %B000101010,
tick,
output;
tock,
output;
set address %B001101010,
eval,
output;
set address %B010101010,
eval,
output;
set address %B011101010,
eval,
output;
set address %B100101010,
eval,
output;
set address %B101101010,
eval,
output;
set address %B110101010,
eval,
output;
set address %B111101010,
eval,
output;

set load 1,
set address %B111101010,
set in %B0101010101010101,
tick,
output,
tock,
output;

set load 0,
set address %B000101010,
tick,
output;
tock,
output;
set address %B001101010,
eval,
output;
set address %B010101010,
eval,
output;
set address %B011101010,
eval,
output;
set address %B100101010,
eval,
output;
set address %B101101010,
eval,
output;
set address %B110101010,
eval,
output;
set address %B111101010,
eval,
output;
`;
export const cmp = `|time |   in   |load|address|  out   |
| 0+  |      0 |  0 |    0  |      0 |
| 1   |      0 |  0 |    0  |      0 |
| 1+  |      0 |  1 |    0  |      0 |
| 2   |      0 |  1 |    0  |      0 |
| 2+  |  13099 |  0 |    0  |      0 |
| 3   |  13099 |  0 |    0  |      0 |
| 3+  |  13099 |  1 |  130  |      0 |
| 4   |  13099 |  1 |  130  |  13099 |
| 4+  |  13099 |  0 |    0  |      0 |
| 5   |  13099 |  0 |    0  |      0 |
| 5+  |   4729 |  0 |  472  |      0 |
| 6   |   4729 |  0 |  472  |      0 |
| 6+  |   4729 |  1 |  472  |      0 |
| 7   |   4729 |  1 |  472  |   4729 |
| 7+  |   4729 |  0 |  472  |   4729 |
| 8   |   4729 |  0 |  472  |   4729 |
| 8   |   4729 |  0 |  130  |  13099 |
| 8+  |   5119 |  0 |  130  |  13099 |
| 9   |   5119 |  0 |  130  |  13099 |
| 9+  |   5119 |  1 |  511  |      0 |
| 10  |   5119 |  1 |  511  |   5119 |
| 10+ |   5119 |  0 |  511  |   5119 |
| 11  |   5119 |  0 |  511  |   5119 |
| 11  |   5119 |  0 |  472  |   4729 |
| 11  |   5119 |  0 |  511  |   5119 |
| 11+ |   5119 |  0 |  168  |      0 |
| 12  |   5119 |  0 |  168  |      0 |
| 12  |   5119 |  0 |  169  |      0 |
| 12  |   5119 |  0 |  170  |      0 |
| 12  |   5119 |  0 |  171  |      0 |
| 12  |   5119 |  0 |  172  |      0 |
| 12  |   5119 |  0 |  173  |      0 |
| 12  |   5119 |  0 |  174  |      0 |
| 12  |   5119 |  0 |  175  |      0 |
| 12+ |  21845 |  1 |  168  |      0 |
| 13  |  21845 |  1 |  168  |  21845 |
| 13+ |  21845 |  1 |  169  |      0 |
| 14  |  21845 |  1 |  169  |  21845 |
| 14+ |  21845 |  1 |  170  |      0 |
| 15  |  21845 |  1 |  170  |  21845 |
| 15+ |  21845 |  1 |  171  |      0 |
| 16  |  21845 |  1 |  171  |  21845 |
| 16+ |  21845 |  1 |  172  |      0 |
| 17  |  21845 |  1 |  172  |  21845 |
| 17+ |  21845 |  1 |  173  |      0 |
| 18  |  21845 |  1 |  173  |  21845 |
| 18+ |  21845 |  1 |  174  |      0 |
| 19  |  21845 |  1 |  174  |  21845 |
| 19+ |  21845 |  1 |  175  |      0 |
| 20  |  21845 |  1 |  175  |  21845 |
| 20+ |  21845 |  0 |  168  |  21845 |
| 21  |  21845 |  0 |  168  |  21845 |
| 21  |  21845 |  0 |  169  |  21845 |
| 21  |  21845 |  0 |  170  |  21845 |
| 21  |  21845 |  0 |  171  |  21845 |
| 21  |  21845 |  0 |  172  |  21845 |
| 21  |  21845 |  0 |  173  |  21845 |
| 21  |  21845 |  0 |  174  |  21845 |
| 21  |  21845 |  0 |  175  |  21845 |
| 21+ | -21846 |  1 |  168  |  21845 |
| 22  | -21846 |  1 |  168  | -21846 |
| 22+ | -21846 |  0 |  168  | -21846 |
| 23  | -21846 |  0 |  168  | -21846 |
| 23  | -21846 |  0 |  169  |  21845 |
| 23  | -21846 |  0 |  170  |  21845 |
| 23  | -21846 |  0 |  171  |  21845 |
| 23  | -21846 |  0 |  172  |  21845 |
| 23  | -21846 |  0 |  173  |  21845 |
| 23  | -21846 |  0 |  174  |  21845 |
| 23  | -21846 |  0 |  175  |  21845 |
| 23+ |  21845 |  1 |  168  | -21846 |
| 24  |  21845 |  1 |  168  |  21845 |
| 24+ | -21846 |  1 |  169  |  21845 |
| 25  | -21846 |  1 |  169  | -21846 |
| 25+ | -21846 |  0 |  168  |  21845 |
| 26  | -21846 |  0 |  168  |  21845 |
| 26  | -21846 |  0 |  169  | -21846 |
| 26  | -21846 |  0 |  170  |  21845 |
| 26  | -21846 |  0 |  171  |  21845 |
| 26  | -21846 |  0 |  172  |  21845 |
| 26  | -21846 |  0 |  173  |  21845 |
| 26  | -21846 |  0 |  174  |  21845 |
| 26  | -21846 |  0 |  175  |  21845 |
| 26+ |  21845 |  1 |  169  | -21846 |
| 27  |  21845 |  1 |  169  |  21845 |
| 27+ | -21846 |  1 |  170  |  21845 |
| 28  | -21846 |  1 |  170  | -21846 |
| 28+ | -21846 |  0 |  168  |  21845 |
| 29  | -21846 |  0 |  168  |  21845 |
| 29  | -21846 |  0 |  169  |  21845 |
| 29  | -21846 |  0 |  170  | -21846 |
| 29  | -21846 |  0 |  171  |  21845 |
| 29  | -21846 |  0 |  172  |  21845 |
| 29  | -21846 |  0 |  173  |  21845 |
| 29  | -21846 |  0 |  174  |  21845 |
| 29  | -21846 |  0 |  175  |  21845 |
| 29+ |  21845 |  1 |  170  | -21846 |
| 30  |  21845 |  1 |  170  |  21845 |
| 30+ | -21846 |  1 |  171  |  21845 |
| 31  | -21846 |  1 |  171  | -21846 |
| 31+ | -21846 |  0 |  168  |  21845 |
| 32  | -21846 |  0 |  168  |  21845 |
| 32  | -21846 |  0 |  169  |  21845 |
| 32  | -21846 |  0 |  170  |  21845 |
| 32  | -21846 |  0 |  171  | -21846 |
| 32  | -21846 |  0 |  172  |  21845 |
| 32  | -21846 |  0 |  173  |  21845 |
| 32  | -21846 |  0 |  174  |  21845 |
| 32  | -21846 |  0 |  175  |  21845 |
| 32+ |  21845 |  1 |  171  | -21846 |
| 33  |  21845 |  1 |  171  |  21845 |
| 33+ | -21846 |  1 |  172  |  21845 |
| 34  | -21846 |  1 |  172  | -21846 |
| 34+ | -21846 |  0 |  168  |  21845 |
| 35  | -21846 |  0 |  168  |  21845 |
| 35  | -21846 |  0 |  169  |  21845 |
| 35  | -21846 |  0 |  170  |  21845 |
| 35  | -21846 |  0 |  171  |  21845 |
| 35  | -21846 |  0 |  172  | -21846 |
| 35  | -21846 |  0 |  173  |  21845 |
| 35  | -21846 |  0 |  174  |  21845 |
| 35  | -21846 |  0 |  175  |  21845 |
| 35+ |  21845 |  1 |  172  | -21846 |
| 36  |  21845 |  1 |  172  |  21845 |
| 36+ | -21846 |  1 |  173  |  21845 |
| 37  | -21846 |  1 |  173  | -21846 |
| 37+ | -21846 |  0 |  168  |  21845 |
| 38  | -21846 |  0 |  168  |  21845 |
| 38  | -21846 |  0 |  169  |  21845 |
| 38  | -21846 |  0 |  170  |  21845 |
| 38  | -21846 |  0 |  171  |  21845 |
| 38  | -21846 |  0 |  172  |  21845 |
| 38  | -21846 |  0 |  173  | -21846 |
| 38  | -21846 |  0 |  174  |  21845 |
| 38  | -21846 |  0 |  175  |  21845 |
| 38+ |  21845 |  1 |  173  | -21846 |
| 39  |  21845 |  1 |  173  |  21845 |
| 39+ | -21846 |  1 |  174  |  21845 |
| 40  | -21846 |  1 |  174  | -21846 |
| 40+ | -21846 |  0 |  168  |  21845 |
| 41  | -21846 |  0 |  168  |  21845 |
| 41  | -21846 |  0 |  169  |  21845 |
| 41  | -21846 |  0 |  170  |  21845 |
| 41  | -21846 |  0 |  171  |  21845 |
| 41  | -21846 |  0 |  172  |  21845 |
| 41  | -21846 |  0 |  173  |  21845 |
| 41  | -21846 |  0 |  174  | -21846 |
| 41  | -21846 |  0 |  175  |  21845 |
| 41+ |  21845 |  1 |  174  | -21846 |
| 42  |  21845 |  1 |  174  |  21845 |
| 42+ | -21846 |  1 |  175  |  21845 |
| 43  | -21846 |  1 |  175  | -21846 |
| 43+ | -21846 |  0 |  168  |  21845 |
| 44  | -21846 |  0 |  168  |  21845 |
| 44  | -21846 |  0 |  169  |  21845 |
| 44  | -21846 |  0 |  170  |  21845 |
| 44  | -21846 |  0 |  171  |  21845 |
| 44  | -21846 |  0 |  172  |  21845 |
| 44  | -21846 |  0 |  173  |  21845 |
| 44  | -21846 |  0 |  174  |  21845 |
| 44  | -21846 |  0 |  175  | -21846 |
| 44+ |  21845 |  1 |  175  | -21846 |
| 45  |  21845 |  1 |  175  |  21845 |
| 45+ |  21845 |  0 |  168  |  21845 |
| 46  |  21845 |  0 |  168  |  21845 |
| 46  |  21845 |  0 |  169  |  21845 |
| 46  |  21845 |  0 |  170  |  21845 |
| 46  |  21845 |  0 |  171  |  21845 |
| 46  |  21845 |  0 |  172  |  21845 |
| 46  |  21845 |  0 |  173  |  21845 |
| 46  |  21845 |  0 |  174  |  21845 |
| 46  |  21845 |  0 |  175  |  21845 |
| 46+ |  21845 |  0 |   42  |      0 |
| 47  |  21845 |  0 |   42  |      0 |
| 47  |  21845 |  0 |  106  |      0 |
| 47  |  21845 |  0 |  170  |  21845 |
| 47  |  21845 |  0 |  234  |      0 |
| 47  |  21845 |  0 |  298  |      0 |
| 47  |  21845 |  0 |  362  |      0 |
| 47  |  21845 |  0 |  426  |      0 |
| 47  |  21845 |  0 |  490  |      0 |
| 47+ |  21845 |  1 |   42  |      0 |
| 48  |  21845 |  1 |   42  |  21845 |
| 48+ |  21845 |  1 |  106  |      0 |
| 49  |  21845 |  1 |  106  |  21845 |
| 49+ |  21845 |  1 |  170  |  21845 |
| 50  |  21845 |  1 |  170  |  21845 |
| 50+ |  21845 |  1 |  234  |      0 |
| 51  |  21845 |  1 |  234  |  21845 |
| 51+ |  21845 |  1 |  298  |      0 |
| 52  |  21845 |  1 |  298  |  21845 |
| 52+ |  21845 |  1 |  362  |      0 |
| 53  |  21845 |  1 |  362  |  21845 |
| 53+ |  21845 |  1 |  426  |      0 |
| 54  |  21845 |  1 |  426  |  21845 |
| 54+ |  21845 |  1 |  490  |      0 |
| 55  |  21845 |  1 |  490  |  21845 |
| 55+ |  21845 |  0 |   42  |  21845 |
| 56  |  21845 |  0 |   42  |  21845 |
| 56  |  21845 |  0 |  106  |  21845 |
| 56  |  21845 |  0 |  170  |  21845 |
| 56  |  21845 |  0 |  234  |  21845 |
| 56  |  21845 |  0 |  298  |  21845 |
| 56  |  21845 |  0 |  362  |  21845 |
| 56  |  21845 |  0 |  426  |  21845 |
| 56  |  21845 |  0 |  490  |  21845 |
| 56+ | -21846 |  1 |   42  |  21845 |
| 57  | -21846 |  1 |   42  | -21846 |
| 57+ | -21846 |  0 |   42  | -21846 |
| 58  | -21846 |  0 |   42  | -21846 |
| 58  | -21846 |  0 |  106  |  21845 |
| 58  | -21846 |  0 |  170  |  21845 |
| 58  | -21846 |  0 |  234  |  21845 |
| 58  | -21846 |  0 |  298  |  21845 |
| 58  | -21846 |  0 |  362  |  21845 |
| 58  | -21846 |  0 |  426  |  21845 |
| 58  | -21846 |  0 |  490  |  21845 |
| 58+ |  21845 |  1 |   42  | -21846 |
| 59  |  21845 |  1 |   42  |  21845 |
| 59+ | -21846 |  1 |  106  |  21845 |
| 60  | -21846 |  1 |  106  | -21846 |
| 60+ | -21846 |  0 |   42  |  21845 |
| 61  | -21846 |  0 |   42  |  21845 |
| 61  | -21846 |  0 |  106  | -21846 |
| 61  | -21846 |  0 |  170  |  21845 |
| 61  | -21846 |  0 |  234  |  21845 |
| 61  | -21846 |  0 |  298  |  21845 |
| 61  | -21846 |  0 |  362  |  21845 |
| 61  | -21846 |  0 |  426  |  21845 |
| 61  | -21846 |  0 |  490  |  21845 |
| 61+ |  21845 |  1 |  106  | -21846 |
| 62  |  21845 |  1 |  106  |  21845 |
| 62+ | -21846 |  1 |  170  |  21845 |
| 63  | -21846 |  1 |  170  | -21846 |
| 63+ | -21846 |  0 |   42  |  21845 |
| 64  | -21846 |  0 |   42  |  21845 |
| 64  | -21846 |  0 |  106  |  21845 |
| 64  | -21846 |  0 |  170  | -21846 |
| 64  | -21846 |  0 |  234  |  21845 |
| 64  | -21846 |  0 |  298  |  21845 |
| 64  | -21846 |  0 |  362  |  21845 |
| 64  | -21846 |  0 |  426  |  21845 |
| 64  | -21846 |  0 |  490  |  21845 |
| 64+ |  21845 |  1 |  170  | -21846 |
| 65  |  21845 |  1 |  170  |  21845 |
| 65+ | -21846 |  1 |  234  |  21845 |
| 66  | -21846 |  1 |  234  | -21846 |
| 66+ | -21846 |  0 |   42  |  21845 |
| 67  | -21846 |  0 |   42  |  21845 |
| 67  | -21846 |  0 |  106  |  21845 |
| 67  | -21846 |  0 |  170  |  21845 |
| 67  | -21846 |  0 |  234  | -21846 |
| 67  | -21846 |  0 |  298  |  21845 |
| 67  | -21846 |  0 |  362  |  21845 |
| 67  | -21846 |  0 |  426  |  21845 |
| 67  | -21846 |  0 |  490  |  21845 |
| 67+ |  21845 |  1 |  234  | -21846 |
| 68  |  21845 |  1 |  234  |  21845 |
| 68+ | -21846 |  1 |  298  |  21845 |
| 69  | -21846 |  1 |  298  | -21846 |
| 69+ | -21846 |  0 |   42  |  21845 |
| 70  | -21846 |  0 |   42  |  21845 |
| 70  | -21846 |  0 |  106  |  21845 |
| 70  | -21846 |  0 |  170  |  21845 |
| 70  | -21846 |  0 |  234  |  21845 |
| 70  | -21846 |  0 |  298  | -21846 |
| 70  | -21846 |  0 |  362  |  21845 |
| 70  | -21846 |  0 |  426  |  21845 |
| 70  | -21846 |  0 |  490  |  21845 |
| 70+ |  21845 |  1 |  298  | -21846 |
| 71  |  21845 |  1 |  298  |  21845 |
| 71+ | -21846 |  1 |  362  |  21845 |
| 72  | -21846 |  1 |  362  | -21846 |
| 72+ | -21846 |  0 |   42  |  21845 |
| 73  | -21846 |  0 |   42  |  21845 |
| 73  | -21846 |  0 |  106  |  21845 |
| 73  | -21846 |  0 |  170  |  21845 |
| 73  | -21846 |  0 |  234  |  21845 |
| 73  | -21846 |  0 |  298  |  21845 |
| 73  | -21846 |  0 |  362  | -21846 |
| 73  | -21846 |  0 |  426  |  21845 |
| 73  | -21846 |  0 |  490  |  21845 |
| 73+ |  21845 |  1 |  362  | -21846 |
| 74  |  21845 |  1 |  362  |  21845 |
| 74+ | -21846 |  1 |  426  |  21845 |
| 75  | -21846 |  1 |  426  | -21846 |
| 75+ | -21846 |  0 |   42  |  21845 |
| 76  | -21846 |  0 |   42  |  21845 |
| 76  | -21846 |  0 |  106  |  21845 |
| 76  | -21846 |  0 |  170  |  21845 |
| 76  | -21846 |  0 |  234  |  21845 |
| 76  | -21846 |  0 |  298  |  21845 |
| 76  | -21846 |  0 |  362  |  21845 |
| 76  | -21846 |  0 |  426  | -21846 |
| 76  | -21846 |  0 |  490  |  21845 |
| 76+ |  21845 |  1 |  426  | -21846 |
| 77  |  21845 |  1 |  426  |  21845 |
| 77+ | -21846 |  1 |  490  |  21845 |
| 78  | -21846 |  1 |  490  | -21846 |
| 78+ | -21846 |  0 |   42  |  21845 |
| 79  | -21846 |  0 |   42  |  21845 |
| 79  | -21846 |  0 |  106  |  21845 |
| 79  | -21846 |  0 |  170  |  21845 |
| 79  | -21846 |  0 |  234  |  21845 |
| 79  | -21846 |  0 |  298  |  21845 |
| 79  | -21846 |  0 |  362  |  21845 |
| 79  | -21846 |  0 |  426  |  21845 |
| 79  | -21846 |  0 |  490  | -21846 |
| 79+ |  21845 |  1 |  490  | -21846 |
| 80  |  21845 |  1 |  490  |  21845 |
| 80+ |  21845 |  0 |   42  |  21845 |
| 81  |  21845 |  0 |   42  |  21845 |
| 81  |  21845 |  0 |  106  |  21845 |
| 81  |  21845 |  0 |  170  |  21845 |
| 81  |  21845 |  0 |  234  |  21845 |
| 81  |  21845 |  0 |  298  |  21845 |
| 81  |  21845 |  0 |  362  |  21845 |
| 81  |  21845 |  0 |  426  |  21845 |
| 81  |  21845 |  0 |  490  |  21845 |`;

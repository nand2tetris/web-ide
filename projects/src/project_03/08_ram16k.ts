export const hdl = `// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/3/b/RAM16K.hdl
/**
 * Memory of 16K 16-bit registers.
 * If load is asserted, the value of the register selected by
 * address is set to in; Otherwise, the value does not change.
 * The value of the selected register is emitted by out.
 */
CHIP RAM16K {
    IN in[16], load, address[14];
    OUT out[16];

    PARTS:
    //// Replace this comment with your code.
}`;
export const tst = `// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/3/b/RAM16K.tst

load RAM16K.hdl,
compare-to RAM16K.cmp,
output-list time%S1.3.1 in%D1.6.1 load%B2.1.1 address%D2.5.2 out%D1.6.1;

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

set in 4321,
set load 0,
tick,
output;
tock,
output;

set load 1,
set address 4321,
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

set in 12345,
set address 12345,
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

set address 4321,
eval,
output;

set in 16383,
tick,
output;
tock,
output;

set load 1,
set address 16383,
tick,
output;
tock,
output;

set load 0,
tick,
output;
tock,
output;

set address 12345,
eval,
output;

set address 16383,
eval,
output;


set load 0,
set address %B10101010101000,
tick,
output;
tock,
output;
set address %B10101010101001,
eval,
output;
set address %B10101010101010,
eval,
output;
set address %B10101010101011,
eval,
output;
set address %B10101010101100,
eval,
output;
set address %B10101010101101,
eval,
output;
set address %B10101010101110,
eval,
output;
set address %B10101010101111,
eval,
output;

set load 1,
set in %B0101010101010101,
set address %B10101010101000,
tick,
output;
tock,
output;
set address %B10101010101001,
tick,
output,
tock,
output;
set address %B10101010101010,
tick,
output,
tock,
output;
set address %B10101010101011,
tick,
output,
tock,
output;
set address %B10101010101100,
tick,
output,
tock,
output;
set address %B10101010101101,
tick,
output,
tock,
output;
set address %B10101010101110,
tick,
output,
tock,
output;
set address %B10101010101111,
tick,
output,
tock,
output;

set load 0,
set address %B10101010101000,
tick,
output;
tock,
output;
set address %B10101010101001,
eval,
output;
set address %B10101010101010,
eval,
output;
set address %B10101010101011,
eval,
output;
set address %B10101010101100,
eval,
output;
set address %B10101010101101,
eval,
output;
set address %B10101010101110,
eval,
output;
set address %B10101010101111,
eval,
output;

set load 1,
set address %B10101010101000,
set in %B1010101010101010,
tick,
output;
tock,
output;

set load 0,
set address %B10101010101000,
tick,
output;
tock,
output;
set address %B10101010101001,
eval,
output;
set address %B10101010101010,
eval,
output;
set address %B10101010101011,
eval,
output;
set address %B10101010101100,
eval,
output;
set address %B10101010101101,
eval,
output;
set address %B10101010101110,
eval,
output;
set address %B10101010101111,
eval,
output;

set load 1,
set address %B10101010101000,
set in %B0101010101010101,
tick,
output,
tock,
output;
set address %B10101010101001,
set in %B1010101010101010,
tick,
output;
tock,
output;

set load 0,
set address %B10101010101000,
tick,
output;
tock,
output;
set address %B10101010101001,
eval,
output;
set address %B10101010101010,
eval,
output;
set address %B10101010101011,
eval,
output;
set address %B10101010101100,
eval,
output;
set address %B10101010101101,
eval,
output;
set address %B10101010101110,
eval,
output;
set address %B10101010101111,
eval,
output;

set load 1,
set address %B10101010101001,
set in %B0101010101010101,
tick,
output,
tock,
output;
set address %B10101010101010,
set in %B1010101010101010,
tick,
output;
tock,
output;

set load 0,
set address %B10101010101000,
tick,
output;
tock,
output;
set address %B10101010101001,
eval,
output;
set address %B10101010101010,
eval,
output;
set address %B10101010101011,
eval,
output;
set address %B10101010101100,
eval,
output;
set address %B10101010101101,
eval,
output;
set address %B10101010101110,
eval,
output;
set address %B10101010101111,
eval,
output;

set load 1,
set address %B10101010101010,
set in %B0101010101010101,
tick,
output,
tock,
output;
set address %B10101010101011,
set in %B1010101010101010,
tick,
output;
tock,
output;

set load 0,
set address %B10101010101000,
tick,
output;
tock,
output;
set address %B10101010101001,
eval,
output;
set address %B10101010101010,
eval,
output;
set address %B10101010101011,
eval,
output;
set address %B10101010101100,
eval,
output;
set address %B10101010101101,
eval,
output;
set address %B10101010101110,
eval,
output;
set address %B10101010101111,
eval,
output;

set load 1,
set address %B10101010101011,
set in %B0101010101010101,
tick,
output,
tock,
output;
set address %B10101010101100,
set in %B1010101010101010,
tick,
output;
tock,
output;

set load 0,
set address %B10101010101000,
tick,
output;
tock,
output;
set address %B10101010101001,
eval,
output;
set address %B10101010101010,
eval,
output;
set address %B10101010101011,
eval,
output;
set address %B10101010101100,
eval,
output;
set address %B10101010101101,
eval,
output;
set address %B10101010101110,
eval,
output;
set address %B10101010101111,
eval,
output;

set load 1,
set address %B10101010101100,
set in %B0101010101010101,
tick,
output,
tock,
output;
set address %B10101010101101,
set in %B1010101010101010,
tick,
output;
tock,
output;

set load 0,
set address %B10101010101000,
tick,
output;
tock,
output;
set address %B10101010101001,
eval,
output;
set address %B10101010101010,
eval,
output;
set address %B10101010101011,
eval,
output;
set address %B10101010101100,
eval,
output;
set address %B10101010101101,
eval,
output;
set address %B10101010101110,
eval,
output;
set address %B10101010101111,
eval,
output;

set load 1,
set address %B10101010101101,
set in %B0101010101010101,
tick,
output,
tock,
output;
set address %B10101010101110,
set in %B1010101010101010,
tick,
output;
tock,
output;

set load 0,
set address %B10101010101000,
tick,
output;
tock,
output;
set address %B10101010101001,
eval,
output;
set address %B10101010101010,
eval,
output;
set address %B10101010101011,
eval,
output;
set address %B10101010101100,
eval,
output;
set address %B10101010101101,
eval,
output;
set address %B10101010101110,
eval,
output;
set address %B10101010101111,
eval,
output;

set load 1,
set address %B10101010101110,
set in %B0101010101010101,
tick,
output,
tock,
output;
set address %B10101010101111,
set in %B1010101010101010,
tick,
output;
tock,
output;

set load 0,
set address %B10101010101000,
tick,
output;
tock,
output;
set address %B10101010101001,
eval,
output;
set address %B10101010101010,
eval,
output;
set address %B10101010101011,
eval,
output;
set address %B10101010101100,
eval,
output;
set address %B10101010101101,
eval,
output;
set address %B10101010101110,
eval,
output;
set address %B10101010101111,
eval,
output;

set load 1,
set address %B10101010101111,
set in %B0101010101010101,
tick,
output,
tock,
output;

set load 0,
set address %B10101010101000,
tick,
output;
tock,
output;
set address %B10101010101001,
eval,
output;
set address %B10101010101010,
eval,
output;
set address %B10101010101011,
eval,
output;
set address %B10101010101100,
eval,
output;
set address %B10101010101101,
eval,
output;
set address %B10101010101110,
eval,
output;
set address %B10101010101111,
eval,
output;


set load 0,
set address %B00010101010101,
tick,
output;
tock,
output;
set address %B00110101010101,
eval,
output;
set address %B01010101010101,
eval,
output;
set address %B01110101010101,
eval,
output;
set address %B10010101010101,
eval,
output;
set address %B10110101010101,
eval,
output;
set address %B11010101010101,
eval,
output;
set address %B11110101010101,
eval,
output;

set load 1,
set in %B0101010101010101,
set address %B00010101010101,
tick,
output;
tock,
output;
set address %B00110101010101,
tick,
output,
tock,
output;
set address %B01010101010101,
tick,
output,
tock,
output;
set address %B01110101010101,
tick,
output,
tock,
output;
set address %B10010101010101,
tick,
output,
tock,
output;
set address %B10110101010101,
tick,
output,
tock,
output;
set address %B11010101010101,
tick,
output,
tock,
output;
set address %B11110101010101,
tick,
output,
tock,
output;

set load 0,
set address %B00010101010101,
tick,
output;
tock,
output;
set address %B00110101010101,
eval,
output;
set address %B01010101010101,
eval,
output;
set address %B01110101010101,
eval,
output;
set address %B10010101010101,
eval,
output;
set address %B10110101010101,
eval,
output;
set address %B11010101010101,
eval,
output;
set address %B11110101010101,
eval,
output;

set load 1,
set address %B00010101010101,
set in %B1010101010101010,
tick,
output;
tock,
output;

set load 0,
set address %B00010101010101,
tick,
output;
tock,
output;
set address %B00110101010101,
eval,
output;
set address %B01010101010101,
eval,
output;
set address %B01110101010101,
eval,
output;
set address %B10010101010101,
eval,
output;
set address %B10110101010101,
eval,
output;
set address %B11010101010101,
eval,
output;
set address %B11110101010101,
eval,
output;

set load 1,
set address %B00010101010101,
set in %B0101010101010101,
tick,
output,
tock,
output;
set address %B00110101010101,
set in %B1010101010101010,
tick,
output;
tock,
output;

set load 0,
set address %B00010101010101,
tick,
output;
tock,
output;
set address %B00110101010101,
eval,
output;
set address %B01010101010101,
eval,
output;
set address %B01110101010101,
eval,
output;
set address %B10010101010101,
eval,
output;
set address %B10110101010101,
eval,
output;
set address %B11010101010101,
eval,
output;
set address %B11110101010101,
eval,
output;

set load 1,
set address %B00110101010101,
set in %B0101010101010101,
tick,
output,
tock,
output;
set address %B01010101010101,
set in %B1010101010101010,
tick,
output;
tock,
output;

set load 0,
set address %B00010101010101,
tick,
output;
tock,
output;
set address %B00110101010101,
eval,
output;
set address %B01010101010101,
eval,
output;
set address %B01110101010101,
eval,
output;
set address %B10010101010101,
eval,
output;
set address %B10110101010101,
eval,
output;
set address %B11010101010101,
eval,
output;
set address %B11110101010101,
eval,
output;

set load 1,
set address %B01010101010101,
set in %B0101010101010101,
tick,
output,
tock,
output;
set address %B01110101010101,
set in %B1010101010101010,
tick,
output;
tock,
output;

set load 0,
set address %B00010101010101,
tick,
output;
tock,
output;
set address %B00110101010101,
eval,
output;
set address %B01010101010101,
eval,
output;
set address %B01110101010101,
eval,
output;
set address %B10010101010101,
eval,
output;
set address %B10110101010101,
eval,
output;
set address %B11010101010101,
eval,
output;
set address %B11110101010101,
eval,
output;

set load 1,
set address %B01110101010101,
set in %B0101010101010101,
tick,
output,
tock,
output;
set address %B10010101010101,
set in %B1010101010101010,
tick,
output;
tock,
output;

set load 0,
set address %B00010101010101,
tick,
output;
tock,
output;
set address %B00110101010101,
eval,
output;
set address %B01010101010101,
eval,
output;
set address %B01110101010101,
eval,
output;
set address %B10010101010101,
eval,
output;
set address %B10110101010101,
eval,
output;
set address %B11010101010101,
eval,
output;
set address %B11110101010101,
eval,
output;

set load 1,
set address %B10010101010101,
set in %B0101010101010101,
tick,
output,
tock,
output;
set address %B10110101010101,
set in %B1010101010101010,
tick,
output;
tock,
output;

set load 0,
set address %B00010101010101,
tick,
output;
tock,
output;
set address %B00110101010101,
eval,
output;
set address %B01010101010101,
eval,
output;
set address %B01110101010101,
eval,
output;
set address %B10010101010101,
eval,
output;
set address %B10110101010101,
eval,
output;
set address %B11010101010101,
eval,
output;
set address %B11110101010101,
eval,
output;

set load 1,
set address %B10110101010101,
set in %B0101010101010101,
tick,
output,
tock,
output;
set address %B11010101010101,
set in %B1010101010101010,
tick,
output;
tock,
output;

set load 0,
set address %B00010101010101,
tick,
output;
tock,
output;
set address %B00110101010101,
eval,
output;
set address %B01010101010101,
eval,
output;
set address %B01110101010101,
eval,
output;
set address %B10010101010101,
eval,
output;
set address %B10110101010101,
eval,
output;
set address %B11010101010101,
eval,
output;
set address %B11110101010101,
eval,
output;

set load 1,
set address %B11010101010101,
set in %B0101010101010101,
tick,
output,
tock,
output;
set address %B11110101010101,
set in %B1010101010101010,
tick,
output;
tock,
output;

set load 0,
set address %B00010101010101,
tick,
output;
tock,
output;
set address %B00110101010101,
eval,
output;
set address %B01010101010101,
eval,
output;
set address %B01110101010101,
eval,
output;
set address %B10010101010101,
eval,
output;
set address %B10110101010101,
eval,
output;
set address %B11010101010101,
eval,
output;
set address %B11110101010101,
eval,
output;

set load 1,
set address %B11110101010101,
set in %B0101010101010101,
tick,
output,
tock,
output;

set load 0,
set address %B00010101010101,
tick,
output;
tock,
output;
set address %B00110101010101,
eval,
output;
set address %B01010101010101,
eval,
output;
set address %B01110101010101,
eval,
output;
set address %B10010101010101,
eval,
output;
set address %B10110101010101,
eval,
output;
set address %B11010101010101,
eval,
output;
set address %B11110101010101,
eval,
output;`;
export const cmp = `|time |   in   |load| address |  out   |
| 0+  |      0 |  0 |      0  |      0 |
| 1   |      0 |  0 |      0  |      0 |
| 1+  |      0 |  1 |      0  |      0 |
| 2   |      0 |  1 |      0  |      0 |
| 2+  |   4321 |  0 |      0  |      0 |
| 3   |   4321 |  0 |      0  |      0 |
| 3+  |   4321 |  1 |   4321  |      0 |
| 4   |   4321 |  1 |   4321  |   4321 |
| 4+  |   4321 |  0 |      0  |      0 |
| 5   |   4321 |  0 |      0  |      0 |
| 5+  |  12345 |  0 |  12345  |      0 |
| 6   |  12345 |  0 |  12345  |      0 |
| 6+  |  12345 |  1 |  12345  |      0 |
| 7   |  12345 |  1 |  12345  |  12345 |
| 7+  |  12345 |  0 |  12345  |  12345 |
| 8   |  12345 |  0 |  12345  |  12345 |
| 8   |  12345 |  0 |   4321  |   4321 |
| 8+  |  16383 |  0 |   4321  |   4321 |
| 9   |  16383 |  0 |   4321  |   4321 |
| 9+  |  16383 |  1 |  16383  |      0 |
| 10  |  16383 |  1 |  16383  |  16383 |
| 10+ |  16383 |  0 |  16383  |  16383 |
| 11  |  16383 |  0 |  16383  |  16383 |
| 11  |  16383 |  0 |  12345  |  12345 |
| 11  |  16383 |  0 |  16383  |  16383 |
| 11+ |  16383 |  0 |  10920  |      0 |
| 12  |  16383 |  0 |  10920  |      0 |
| 12  |  16383 |  0 |  10921  |      0 |
| 12  |  16383 |  0 |  10922  |      0 |
| 12  |  16383 |  0 |  10923  |      0 |
| 12  |  16383 |  0 |  10924  |      0 |
| 12  |  16383 |  0 |  10925  |      0 |
| 12  |  16383 |  0 |  10926  |      0 |
| 12  |  16383 |  0 |  10927  |      0 |
| 12+ |  21845 |  1 |  10920  |      0 |
| 13  |  21845 |  1 |  10920  |  21845 |
| 13+ |  21845 |  1 |  10921  |      0 |
| 14  |  21845 |  1 |  10921  |  21845 |
| 14+ |  21845 |  1 |  10922  |      0 |
| 15  |  21845 |  1 |  10922  |  21845 |
| 15+ |  21845 |  1 |  10923  |      0 |
| 16  |  21845 |  1 |  10923  |  21845 |
| 16+ |  21845 |  1 |  10924  |      0 |
| 17  |  21845 |  1 |  10924  |  21845 |
| 17+ |  21845 |  1 |  10925  |      0 |
| 18  |  21845 |  1 |  10925  |  21845 |
| 18+ |  21845 |  1 |  10926  |      0 |
| 19  |  21845 |  1 |  10926  |  21845 |
| 19+ |  21845 |  1 |  10927  |      0 |
| 20  |  21845 |  1 |  10927  |  21845 |
| 20+ |  21845 |  0 |  10920  |  21845 |
| 21  |  21845 |  0 |  10920  |  21845 |
| 21  |  21845 |  0 |  10921  |  21845 |
| 21  |  21845 |  0 |  10922  |  21845 |
| 21  |  21845 |  0 |  10923  |  21845 |
| 21  |  21845 |  0 |  10924  |  21845 |
| 21  |  21845 |  0 |  10925  |  21845 |
| 21  |  21845 |  0 |  10926  |  21845 |
| 21  |  21845 |  0 |  10927  |  21845 |
| 21+ | -21846 |  1 |  10920  |  21845 |
| 22  | -21846 |  1 |  10920  | -21846 |
| 22+ | -21846 |  0 |  10920  | -21846 |
| 23  | -21846 |  0 |  10920  | -21846 |
| 23  | -21846 |  0 |  10921  |  21845 |
| 23  | -21846 |  0 |  10922  |  21845 |
| 23  | -21846 |  0 |  10923  |  21845 |
| 23  | -21846 |  0 |  10924  |  21845 |
| 23  | -21846 |  0 |  10925  |  21845 |
| 23  | -21846 |  0 |  10926  |  21845 |
| 23  | -21846 |  0 |  10927  |  21845 |
| 23+ |  21845 |  1 |  10920  | -21846 |
| 24  |  21845 |  1 |  10920  |  21845 |
| 24+ | -21846 |  1 |  10921  |  21845 |
| 25  | -21846 |  1 |  10921  | -21846 |
| 25+ | -21846 |  0 |  10920  |  21845 |
| 26  | -21846 |  0 |  10920  |  21845 |
| 26  | -21846 |  0 |  10921  | -21846 |
| 26  | -21846 |  0 |  10922  |  21845 |
| 26  | -21846 |  0 |  10923  |  21845 |
| 26  | -21846 |  0 |  10924  |  21845 |
| 26  | -21846 |  0 |  10925  |  21845 |
| 26  | -21846 |  0 |  10926  |  21845 |
| 26  | -21846 |  0 |  10927  |  21845 |
| 26+ |  21845 |  1 |  10921  | -21846 |
| 27  |  21845 |  1 |  10921  |  21845 |
| 27+ | -21846 |  1 |  10922  |  21845 |
| 28  | -21846 |  1 |  10922  | -21846 |
| 28+ | -21846 |  0 |  10920  |  21845 |
| 29  | -21846 |  0 |  10920  |  21845 |
| 29  | -21846 |  0 |  10921  |  21845 |
| 29  | -21846 |  0 |  10922  | -21846 |
| 29  | -21846 |  0 |  10923  |  21845 |
| 29  | -21846 |  0 |  10924  |  21845 |
| 29  | -21846 |  0 |  10925  |  21845 |
| 29  | -21846 |  0 |  10926  |  21845 |
| 29  | -21846 |  0 |  10927  |  21845 |
| 29+ |  21845 |  1 |  10922  | -21846 |
| 30  |  21845 |  1 |  10922  |  21845 |
| 30+ | -21846 |  1 |  10923  |  21845 |
| 31  | -21846 |  1 |  10923  | -21846 |
| 31+ | -21846 |  0 |  10920  |  21845 |
| 32  | -21846 |  0 |  10920  |  21845 |
| 32  | -21846 |  0 |  10921  |  21845 |
| 32  | -21846 |  0 |  10922  |  21845 |
| 32  | -21846 |  0 |  10923  | -21846 |
| 32  | -21846 |  0 |  10924  |  21845 |
| 32  | -21846 |  0 |  10925  |  21845 |
| 32  | -21846 |  0 |  10926  |  21845 |
| 32  | -21846 |  0 |  10927  |  21845 |
| 32+ |  21845 |  1 |  10923  | -21846 |
| 33  |  21845 |  1 |  10923  |  21845 |
| 33+ | -21846 |  1 |  10924  |  21845 |
| 34  | -21846 |  1 |  10924  | -21846 |
| 34+ | -21846 |  0 |  10920  |  21845 |
| 35  | -21846 |  0 |  10920  |  21845 |
| 35  | -21846 |  0 |  10921  |  21845 |
| 35  | -21846 |  0 |  10922  |  21845 |
| 35  | -21846 |  0 |  10923  |  21845 |
| 35  | -21846 |  0 |  10924  | -21846 |
| 35  | -21846 |  0 |  10925  |  21845 |
| 35  | -21846 |  0 |  10926  |  21845 |
| 35  | -21846 |  0 |  10927  |  21845 |
| 35+ |  21845 |  1 |  10924  | -21846 |
| 36  |  21845 |  1 |  10924  |  21845 |
| 36+ | -21846 |  1 |  10925  |  21845 |
| 37  | -21846 |  1 |  10925  | -21846 |
| 37+ | -21846 |  0 |  10920  |  21845 |
| 38  | -21846 |  0 |  10920  |  21845 |
| 38  | -21846 |  0 |  10921  |  21845 |
| 38  | -21846 |  0 |  10922  |  21845 |
| 38  | -21846 |  0 |  10923  |  21845 |
| 38  | -21846 |  0 |  10924  |  21845 |
| 38  | -21846 |  0 |  10925  | -21846 |
| 38  | -21846 |  0 |  10926  |  21845 |
| 38  | -21846 |  0 |  10927  |  21845 |
| 38+ |  21845 |  1 |  10925  | -21846 |
| 39  |  21845 |  1 |  10925  |  21845 |
| 39+ | -21846 |  1 |  10926  |  21845 |
| 40  | -21846 |  1 |  10926  | -21846 |
| 40+ | -21846 |  0 |  10920  |  21845 |
| 41  | -21846 |  0 |  10920  |  21845 |
| 41  | -21846 |  0 |  10921  |  21845 |
| 41  | -21846 |  0 |  10922  |  21845 |
| 41  | -21846 |  0 |  10923  |  21845 |
| 41  | -21846 |  0 |  10924  |  21845 |
| 41  | -21846 |  0 |  10925  |  21845 |
| 41  | -21846 |  0 |  10926  | -21846 |
| 41  | -21846 |  0 |  10927  |  21845 |
| 41+ |  21845 |  1 |  10926  | -21846 |
| 42  |  21845 |  1 |  10926  |  21845 |
| 42+ | -21846 |  1 |  10927  |  21845 |
| 43  | -21846 |  1 |  10927  | -21846 |
| 43+ | -21846 |  0 |  10920  |  21845 |
| 44  | -21846 |  0 |  10920  |  21845 |
| 44  | -21846 |  0 |  10921  |  21845 |
| 44  | -21846 |  0 |  10922  |  21845 |
| 44  | -21846 |  0 |  10923  |  21845 |
| 44  | -21846 |  0 |  10924  |  21845 |
| 44  | -21846 |  0 |  10925  |  21845 |
| 44  | -21846 |  0 |  10926  |  21845 |
| 44  | -21846 |  0 |  10927  | -21846 |
| 44+ |  21845 |  1 |  10927  | -21846 |
| 45  |  21845 |  1 |  10927  |  21845 |
| 45+ |  21845 |  0 |  10920  |  21845 |
| 46  |  21845 |  0 |  10920  |  21845 |
| 46  |  21845 |  0 |  10921  |  21845 |
| 46  |  21845 |  0 |  10922  |  21845 |
| 46  |  21845 |  0 |  10923  |  21845 |
| 46  |  21845 |  0 |  10924  |  21845 |
| 46  |  21845 |  0 |  10925  |  21845 |
| 46  |  21845 |  0 |  10926  |  21845 |
| 46  |  21845 |  0 |  10927  |  21845 |
| 46+ |  21845 |  0 |   1365  |      0 |
| 47  |  21845 |  0 |   1365  |      0 |
| 47  |  21845 |  0 |   3413  |      0 |
| 47  |  21845 |  0 |   5461  |      0 |
| 47  |  21845 |  0 |   7509  |      0 |
| 47  |  21845 |  0 |   9557  |      0 |
| 47  |  21845 |  0 |  11605  |      0 |
| 47  |  21845 |  0 |  13653  |      0 |
| 47  |  21845 |  0 |  15701  |      0 |
| 47+ |  21845 |  1 |   1365  |      0 |
| 48  |  21845 |  1 |   1365  |  21845 |
| 48+ |  21845 |  1 |   3413  |      0 |
| 49  |  21845 |  1 |   3413  |  21845 |
| 49+ |  21845 |  1 |   5461  |      0 |
| 50  |  21845 |  1 |   5461  |  21845 |
| 50+ |  21845 |  1 |   7509  |      0 |
| 51  |  21845 |  1 |   7509  |  21845 |
| 51+ |  21845 |  1 |   9557  |      0 |
| 52  |  21845 |  1 |   9557  |  21845 |
| 52+ |  21845 |  1 |  11605  |      0 |
| 53  |  21845 |  1 |  11605  |  21845 |
| 53+ |  21845 |  1 |  13653  |      0 |
| 54  |  21845 |  1 |  13653  |  21845 |
| 54+ |  21845 |  1 |  15701  |      0 |
| 55  |  21845 |  1 |  15701  |  21845 |
| 55+ |  21845 |  0 |   1365  |  21845 |
| 56  |  21845 |  0 |   1365  |  21845 |
| 56  |  21845 |  0 |   3413  |  21845 |
| 56  |  21845 |  0 |   5461  |  21845 |
| 56  |  21845 |  0 |   7509  |  21845 |
| 56  |  21845 |  0 |   9557  |  21845 |
| 56  |  21845 |  0 |  11605  |  21845 |
| 56  |  21845 |  0 |  13653  |  21845 |
| 56  |  21845 |  0 |  15701  |  21845 |
| 56+ | -21846 |  1 |   1365  |  21845 |
| 57  | -21846 |  1 |   1365  | -21846 |
| 57+ | -21846 |  0 |   1365  | -21846 |
| 58  | -21846 |  0 |   1365  | -21846 |
| 58  | -21846 |  0 |   3413  |  21845 |
| 58  | -21846 |  0 |   5461  |  21845 |
| 58  | -21846 |  0 |   7509  |  21845 |
| 58  | -21846 |  0 |   9557  |  21845 |
| 58  | -21846 |  0 |  11605  |  21845 |
| 58  | -21846 |  0 |  13653  |  21845 |
| 58  | -21846 |  0 |  15701  |  21845 |
| 58+ |  21845 |  1 |   1365  | -21846 |
| 59  |  21845 |  1 |   1365  |  21845 |
| 59+ | -21846 |  1 |   3413  |  21845 |
| 60  | -21846 |  1 |   3413  | -21846 |
| 60+ | -21846 |  0 |   1365  |  21845 |
| 61  | -21846 |  0 |   1365  |  21845 |
| 61  | -21846 |  0 |   3413  | -21846 |
| 61  | -21846 |  0 |   5461  |  21845 |
| 61  | -21846 |  0 |   7509  |  21845 |
| 61  | -21846 |  0 |   9557  |  21845 |
| 61  | -21846 |  0 |  11605  |  21845 |
| 61  | -21846 |  0 |  13653  |  21845 |
| 61  | -21846 |  0 |  15701  |  21845 |
| 61+ |  21845 |  1 |   3413  | -21846 |
| 62  |  21845 |  1 |   3413  |  21845 |
| 62+ | -21846 |  1 |   5461  |  21845 |
| 63  | -21846 |  1 |   5461  | -21846 |
| 63+ | -21846 |  0 |   1365  |  21845 |
| 64  | -21846 |  0 |   1365  |  21845 |
| 64  | -21846 |  0 |   3413  |  21845 |
| 64  | -21846 |  0 |   5461  | -21846 |
| 64  | -21846 |  0 |   7509  |  21845 |
| 64  | -21846 |  0 |   9557  |  21845 |
| 64  | -21846 |  0 |  11605  |  21845 |
| 64  | -21846 |  0 |  13653  |  21845 |
| 64  | -21846 |  0 |  15701  |  21845 |
| 64+ |  21845 |  1 |   5461  | -21846 |
| 65  |  21845 |  1 |   5461  |  21845 |
| 65+ | -21846 |  1 |   7509  |  21845 |
| 66  | -21846 |  1 |   7509  | -21846 |
| 66+ | -21846 |  0 |   1365  |  21845 |
| 67  | -21846 |  0 |   1365  |  21845 |
| 67  | -21846 |  0 |   3413  |  21845 |
| 67  | -21846 |  0 |   5461  |  21845 |
| 67  | -21846 |  0 |   7509  | -21846 |
| 67  | -21846 |  0 |   9557  |  21845 |
| 67  | -21846 |  0 |  11605  |  21845 |
| 67  | -21846 |  0 |  13653  |  21845 |
| 67  | -21846 |  0 |  15701  |  21845 |
| 67+ |  21845 |  1 |   7509  | -21846 |
| 68  |  21845 |  1 |   7509  |  21845 |
| 68+ | -21846 |  1 |   9557  |  21845 |
| 69  | -21846 |  1 |   9557  | -21846 |
| 69+ | -21846 |  0 |   1365  |  21845 |
| 70  | -21846 |  0 |   1365  |  21845 |
| 70  | -21846 |  0 |   3413  |  21845 |
| 70  | -21846 |  0 |   5461  |  21845 |
| 70  | -21846 |  0 |   7509  |  21845 |
| 70  | -21846 |  0 |   9557  | -21846 |
| 70  | -21846 |  0 |  11605  |  21845 |
| 70  | -21846 |  0 |  13653  |  21845 |
| 70  | -21846 |  0 |  15701  |  21845 |
| 70+ |  21845 |  1 |   9557  | -21846 |
| 71  |  21845 |  1 |   9557  |  21845 |
| 71+ | -21846 |  1 |  11605  |  21845 |
| 72  | -21846 |  1 |  11605  | -21846 |
| 72+ | -21846 |  0 |   1365  |  21845 |
| 73  | -21846 |  0 |   1365  |  21845 |
| 73  | -21846 |  0 |   3413  |  21845 |
| 73  | -21846 |  0 |   5461  |  21845 |
| 73  | -21846 |  0 |   7509  |  21845 |
| 73  | -21846 |  0 |   9557  |  21845 |
| 73  | -21846 |  0 |  11605  | -21846 |
| 73  | -21846 |  0 |  13653  |  21845 |
| 73  | -21846 |  0 |  15701  |  21845 |
| 73+ |  21845 |  1 |  11605  | -21846 |
| 74  |  21845 |  1 |  11605  |  21845 |
| 74+ | -21846 |  1 |  13653  |  21845 |
| 75  | -21846 |  1 |  13653  | -21846 |
| 75+ | -21846 |  0 |   1365  |  21845 |
| 76  | -21846 |  0 |   1365  |  21845 |
| 76  | -21846 |  0 |   3413  |  21845 |
| 76  | -21846 |  0 |   5461  |  21845 |
| 76  | -21846 |  0 |   7509  |  21845 |
| 76  | -21846 |  0 |   9557  |  21845 |
| 76  | -21846 |  0 |  11605  |  21845 |
| 76  | -21846 |  0 |  13653  | -21846 |
| 76  | -21846 |  0 |  15701  |  21845 |
| 76+ |  21845 |  1 |  13653  | -21846 |
| 77  |  21845 |  1 |  13653  |  21845 |
| 77+ | -21846 |  1 |  15701  |  21845 |
| 78  | -21846 |  1 |  15701  | -21846 |
| 78+ | -21846 |  0 |   1365  |  21845 |
| 79  | -21846 |  0 |   1365  |  21845 |
| 79  | -21846 |  0 |   3413  |  21845 |
| 79  | -21846 |  0 |   5461  |  21845 |
| 79  | -21846 |  0 |   7509  |  21845 |
| 79  | -21846 |  0 |   9557  |  21845 |
| 79  | -21846 |  0 |  11605  |  21845 |
| 79  | -21846 |  0 |  13653  |  21845 |
| 79  | -21846 |  0 |  15701  | -21846 |
| 79+ |  21845 |  1 |  15701  | -21846 |
| 80  |  21845 |  1 |  15701  |  21845 |
| 80+ |  21845 |  0 |   1365  |  21845 |
| 81  |  21845 |  0 |   1365  |  21845 |
| 81  |  21845 |  0 |   3413  |  21845 |
| 81  |  21845 |  0 |   5461  |  21845 |
| 81  |  21845 |  0 |   7509  |  21845 |
| 81  |  21845 |  0 |   9557  |  21845 |
| 81  |  21845 |  0 |  11605  |  21845 |
| 81  |  21845 |  0 |  13653  |  21845 |
| 81  |  21845 |  0 |  15701  |  21845 |`;

export const hdl = `// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/3/a/PC.hdl
/**
 * A 16-bit counter.
 * if      reset(t): out(t+1) = 0
 * else if load(t):  out(t+1) = in(t)
 * else if inc(t):   out(t+1) = out(t) + 1
 * else              out(t+1) = out(t)
 */
CHIP PC {
    IN in[16], reset, load, inc;
    OUT out[16];
    
    PARTS:
    //// Replace this comment with your code.
}`;
export const tst = `// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/03/a/PC.tst

load PC.hdl,
compare-to PC.cmp,
output-list time%S1.3.1 in%D1.6.1 reset%B2.1.2 load%B2.1.2 inc%B2.1.2 out%D1.6.1;

set in 0,
set reset 0,
set load 0,
set inc 0,
tick,
output;

tock,
output;

set inc 1,
tick,
output;

tock,
output;

set in -32123,
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

tick,
output;

tock,
output;

set in 12345,
set load 1,
set inc 0,
tick,
output;

tock,
output;

set reset 1,
tick,
output;

tock,
output;

set reset 0,
set inc 1,
tick,
output;

tock,
output;

set reset 1,
tick,
output;

tock,
output;

set reset 0,
set load 0,
tick,
output;

tock,
output;

set reset 1,
tick,
output;

tock,
output;

set in 0,
set reset 0,
set load 1,
tick,
output;

tock,
output;

set load 0,
set inc 1,
tick,
output;

tock,
output;

set in 22222,
set reset 1,
set inc 0,
tick,
output;

tock,
output;`;
export const cmp = `|time |   in   |reset|load | inc |  out   |
| 0+  |      0 |  0  |  0  |  0  |      0 |
| 1   |      0 |  0  |  0  |  0  |      0 |
| 1+  |      0 |  0  |  0  |  1  |      0 |
| 2   |      0 |  0  |  0  |  1  |      1 |
| 2+  | -32123 |  0  |  0  |  1  |      1 |
| 3   | -32123 |  0  |  0  |  1  |      2 |
| 3+  | -32123 |  0  |  1  |  1  |      2 |
| 4   | -32123 |  0  |  1  |  1  | -32123 |
| 4+  | -32123 |  0  |  0  |  1  | -32123 |
| 5   | -32123 |  0  |  0  |  1  | -32122 |
| 5+  | -32123 |  0  |  0  |  1  | -32122 |
| 6   | -32123 |  0  |  0  |  1  | -32121 |
| 6+  |  12345 |  0  |  1  |  0  | -32121 |
| 7   |  12345 |  0  |  1  |  0  |  12345 |
| 7+  |  12345 |  1  |  1  |  0  |  12345 |
| 8   |  12345 |  1  |  1  |  0  |      0 |
| 8+  |  12345 |  0  |  1  |  1  |      0 |
| 9   |  12345 |  0  |  1  |  1  |  12345 |
| 9+  |  12345 |  1  |  1  |  1  |  12345 |
| 10  |  12345 |  1  |  1  |  1  |      0 |
| 10+ |  12345 |  0  |  0  |  1  |      0 |
| 11  |  12345 |  0  |  0  |  1  |      1 |
| 11+ |  12345 |  1  |  0  |  1  |      1 |
| 12  |  12345 |  1  |  0  |  1  |      0 |
| 12+ |      0 |  0  |  1  |  1  |      0 |
| 13  |      0 |  0  |  1  |  1  |      0 |
| 13+ |      0 |  0  |  0  |  1  |      0 |
| 14  |      0 |  0  |  0  |  1  |      1 |
| 14+ |  22222 |  1  |  0  |  0  |      1 |
| 15  |  22222 |  1  |  0  |  0  |      0 |`;

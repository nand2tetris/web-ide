export const hdl = `// Computes the sum of three bits.

CHIP FullAdder {
   IN a, b, c;  // 1-bit inputs
   OUT sum,     // Right bit of a + b + c
       carry;   // Left bit of a + b + c

   PARTS:
   // Put you code here:
}`;
export const sol = `CHIP FullAdder {
    IN a, b, c;  // 1-bit inputs
    OUT sum,     // Right bit of a + b + c
        carry;   // Left bit of a + b + c

    PARTS:
    HalfAdder (a=a, b=b, sum=sum1, carry=carry1);
    HalfAdder (a=c, b=sum1, sum=sum, carry=carry2);
    Or        (a=carry1, b=carry2, out=carry);

// Alternate implementation.
// The first implementation is the way FullAdder is described in the book.
// This implementation is elegant, but slightly less efficient. There is
// no reason to prefer either implementation over the other.
/*
    HalfAdder (a=a, b=b, sum=sum1, carry=carry1);
    HalfAdder (a=c, b=sum1, sum=sum, carry=carry2);
    HalfAdder (a=carry1, b=carry2, out=carry);
*/

// Alternate implementation using less abstraction.
// Direct implementation without using half-adders,
// as mentioned in the book.
/*
    Xor (a=a, b=b, out=abSum);
    And (a=a, b=b, out=abCarry);
    Xor (a=abSum, b=c, out=sum);
    And (a=abSum, b=c, out=abcCarry);
    Or  (a=abCarry, b=abcCarry, out=carry);
*/
}`;
export const cmp = `|   a   |   b   |   c   |  sum  | carry |
|   0   |   0   |   0   |   0   |   0   |
|   0   |   0   |   1   |   1   |   0   |
|   0   |   1   |   0   |   1   |   0   |
|   0   |   1   |   1   |   0   |   1   |
|   1   |   0   |   0   |   1   |   0   |
|   1   |   0   |   1   |   0   |   1   |
|   1   |   1   |   0   |   0   |   1   |
|   1   |   1   |   1   |   1   |   1   |`;
export const tst = `output-list a%B3.1.3 b%B3.1.3 c%B3.1.3 sum%B3.1.3 carry%B3.1.3;

set a 0,
set b 0,
set c 0,
eval,
output;

set c 1,
eval,
output;

set b 1,
set c 0,
eval,
output;

set c 1,
eval,
output;

set a 1,
set b 0,
set c 0,
eval,
output;

set c 1,
eval,
output;

set b 1,
set c 0,
eval,
output;

set c 1,
eval,
output;`;

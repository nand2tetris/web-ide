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

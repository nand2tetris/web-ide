export const sol = `CHIP DMux4Way {
    IN in, sel[2];
    OUT a, b, c, d;

    PARTS:
    DMux (in=in, sel=sel[1], a=ab, b=cd);
    DMux (in=ab, sel=sel[0], a=a, b=b);
    DMux (in=cd, sel=sel[0], a=c, b=d);

// Alternate implementation, using a canonical representation.
/*
    Not (in=sel[0], out=notSel0);
    Not (in=sel[1], out=notSel1);
    And (a=notSel1, b=notSel0, out=selA);
    And (a=notSel1, b=sel[0],  out=selB);
    And (a=sel[1],  b=notSel0, out=selC);
    And (a=sel[1],  b=sel[0],  out=selD);
    And (a=selA, b=in, out=a);
    And (a=selB, b=in, out=b);
    And (a=selC, b=in, out=c);
    And (a=selD, b=in, out=d);
*/
}`;

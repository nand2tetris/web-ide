// Multiplies R0 and R1 and stores the result in R2.
// (R0, R1, R2 refer to RAM[0], RAM[1], and RAM[2], respectively.)
// The algorithm is based on repetitive addition.

        @R2     // Zero the partial product
        M=0

(LOOP)
        @R1
        MD=M-1  // Decrement and test the multiplier
        @HALT
        D;JLT

        @R0     // Add the multiplicand to the partial product
        D=M
        @R2
        M=D+M
        @LOOP
        0;JMP

(HALT)
        @HALT
        0;JMP
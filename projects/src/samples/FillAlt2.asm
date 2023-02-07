// This version uses a single loop.  When a key is down, the loop
// writes black and increments the screen pointer.  When no key is
// down, it decrements the screen pointer and writes white.
//
// The advantages of this program over the original single loop program
// and the double loop program are that it is much more responsive to
// changes in key state and that it does not leave partially written
// black bands temporarily visible on the screen.  (And it looks cool!)

        @SCREEN
        D=A
        @pScreen
        M=D             // pScreen = pointer to SCREEN

(LOOP)
        @KBD            // if key down fill screen with black
        D=M
        @FILL_BLACK
        D;JNE
                        // Roll back the darkness
        @pScreen
        D=M
        @SCREEN         // if pScreen <= SCREEN there is nothing to do
        D=D-A
        @LOOP
        D;JLE

        @pScreen
        AM=M-1          // A = pScreen = pScreen - 1
        M=0             // Memory[pScreen] = white (0)

        @LOOP
        0;JMP

(FILL_BLACK)            // Let darkness descend
        @pScreen
        D=M
        @24576          // if pScreen >= SCREEN + size of screen,
        D=D-A           // there is nothing to do
        @LOOP
        D;JGE

        @pScreen        // Memory[pScreen] = black (-1)
        A=M
        M=-1

        @pScreen        // pScreen = pScreen + 1
        M=M+1

        @LOOP
        0;JMP
`;

export const Mult = `// Multiplies R0 and R1 and stores the result in R2.
// (R0, R1, R2 refer to RAM[0], RAM[1], and RAM[2], respectively.)
// The algorithm is based on repetitive addition.

// Initialize the variables
        @sum
        M=0
        @R0
        D=M
        @i
        M=D
(LOOP)
        @i
        MD=M-1  // decrement the counter
        @FINISH
        D;JLT
        @R1
        D=M
        @sum
        M=D+M   // tally the sum
        @LOOP
        0;JMP
(FINISH)
        @sum
        D=M
        @R2
        M=D
(END)
        @END
        0;JMP
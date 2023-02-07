export const Fill = `// Runs an infinite loop that listens to the keyboard input. 
// When a key is pressed (any key), the program blackens the screen,
// i.e. writes "black" in every pixel. When no key is pressed, 
// the screen should be cleared.

// initialize variables
(START)			// while (true)
	@SCREEN
	D=A
	@i
	M=D		// i = SCREEN

(LOOP)			// while (i < screen - 1)
	@i
	D=M
	@24575		// screen - 1
	D=A-D
	@START
	D;JLT		// i < screen - 1 (negative check)
	@KBD
	D=M
	@BLACKEN	// if (kbd != 0)
	D;JNE

// Clear the screen (write "white" in every pixel)
	@i
	D=M
	A=D
	M=0		// write "white"
	@CONTINUE
	0;JMP

(BLACKEN)
	@i
	D=M
	A=D
	M=-1		// write "black"

(CONTINUE)
	@i
	M=M+1		// i++
	@LOOP
	0;JMP
        `;

export const FillAlt1 = `// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/04/Fill.asm

// This version uses two similar loops to fill the screen either with
// black or white.  Each loop always starts filling the screen from
// the top.  The press or release of a key flips between the two loops.
//
// The advantage of this program over the single loop program is that
// it is much more responsive to changes in key state.  One can watch
// it working even when the CPU simulator is running with animation.

(FILL_WHITE)
        @SCREEN
        D=A
        @pScreen
        M=D             // pScreen = pointer to SCREEN

(WHITE_LOOP)
        @KBD            // if key down fill screen with black
        D=M
        @FILL_BLACK
        D;JNE
        @pScreen        // Memory[pScreen] = black (0)
        A=M
        M=0

        @pScreen        // pScreen = pScreen + 1
        MD=M+1

        @24576          // SCREEN + size of screen
        D=D-A
        @WHITE_LOOP
        D;JLT           // loop if pScreen still within screen

        @FILL_WHITE     // restart at beginning of screen
        0;JMP


(FILL_BLACK)
        @SCREEN
        D=A
        @pScreen
        M=D             // pScreen = pointer to SCREEN

(BLACK_LOOP)
        @KBD            // if key down fill screen with white
        D=M
        @FILL_WHITE
        D;JEQ
        @pScreen        // Memory[pScreen] = white (-1)
        A=M
        M=-1

        @pScreen        // pScreen = pScreen + 1
        MD=M+1

        @24576          // SCREEN + size of screen
        D=D-A
        @BLACK_LOOP
        D;JLT           // loop if pScreen still within screen

        @FILL_BLACK     // restart at beginning of screen
        0;JMP
`;

export const FillAlt2 = `// This version uses a single loop.  When a key is down, the loop
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
        0;JMP`;

export const MultAlt1 = `// Multiplies R0 and R1 and stores the result in R2.
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
        0;JMP`;

export const MultCmp = `|  RAM[2]  |
|       0  |
|       0  |
|       0  |
|       3  |
|       8  |
|      42  |`;

export const MultTst = `output-list RAM[2]%D2.6.2;

set RAM[0] 0,
set RAM[1] 0;
repeat 20 {
  ticktock;
}
output;

set PC 0,
set RAM[0] 1,
set RAM[1] 0;
repeat 50 {
  ticktock;
}
output;

set PC 0,
set RAM[0] 0,
set RAM[1] 2;
repeat 80 {
  ticktock;
}
output;

set PC 0,
set RAM[0] 3,
set RAM[1] 1;
repeat 120 {
  ticktock;
}
output;

set PC 0,
set RAM[0] 2,
set RAM[1] 4;
repeat 150 {
  ticktock;
}
output;

set PC 0,
set RAM[0] 6,
set RAM[1] 7;
repeat 210 {
  ticktock;
}
output;`;

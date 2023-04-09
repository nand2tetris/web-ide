// This file is part of www.nand2tetris.org
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
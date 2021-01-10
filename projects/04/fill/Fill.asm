// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/04/Fill.asm

// Runs an infinite loop that listens to the keyboard input.
// When a key is pressed (any key), the program blackens the screen,
// i.e. writes "black" in every pixel;
// the screen should remain fully black as long as the key is pressed. 
// When no key is pressed, the program clears the screen, i.e. writes
// "white" in every pixel;
// the screen should remain fully clear as long as no key is pressed.

@R0 // pattern // 0 for clearing, -1 for setting
M=0

@R2 // pixel // 256 rows
M=0

(LOOP)
    // Clearing or setting?
    @KBD
    D=M
    @SET
    D;JGT

    (CLEAR)
    @R0 // pattern 
    M=0
    @CLEARSETEND
    0;JMP

    (SET)
    @R0 // pattern 
    M=-1

    (CLEARSETEND)

    // screen[pixel]=pattern
    @R2
    D=M
    @SCREEN
    D=D+A
    @R1
    M=D
    // Memory to memory write
    @R0
    D=M // Load value to write into D
    @R1 // Load address to write into A
    A=M
    M=D // Write into A (as M)

    @R2
    M=M+1

    // if pixel >= 512 * 32 then pixel = 0
    @R2 // pixel 
    D=M
    @8193
    D=D-A
    @NOSET
    D;JLT
    @R2 // pixel 
    M=0
    (NOSET)

// Repeat this program forever
@LOOP
0;JMP
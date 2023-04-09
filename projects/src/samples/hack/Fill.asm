// Runs an infinite loop that listens to the keyboard input. 
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
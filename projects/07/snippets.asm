// D=PTR+OFF
(PTR+OFF)
  @PTR
  D=M
  IF OFF > 1
    @OFF
    D=D+A
  IF OFF == 1
    D=D+1
  IF OFF == 0
    0
  IF OFF == -1
    D=D-1
  IF OFF < -1
    @+OFF
    D=D-A
 
// D=M[PTR+OFF]
(READ_PTR_OFF)
  PTR+OFF
  A=D
  D=M

// M[PTR+OFF]=D, R13 and R14 are modified
(WRITE_PTR_OFF)
  @R13
  M=D
  PTR+OFF
  @R14
  M=D

  @R13
  D=M
  @R14
  A=M
  M=D

(ASSERT_STACK)
  @SP
  D=M
  @16
  D=D-A
  @ASSERT_STACK_GOOD
  D;JGE
  @0xDEAD
  D=A
  @R13
  M=D
  @END
  0;JMP
  (ASSERT_STACK_GOOD)

(DEC_SP)
  @SP
  D=M
  D=D-1
  M=D
  ASSERT_STACK

(INC_SP)
  @SP
  D=M
  D=D+1
  M=D

(-X)
  READ_SP
  D=-D
  WRITE_SP

(X+Y)
  READ_SP_-1
  @R13
  M=D // Store arg 2 in R13
  READ_SP_0
  @R13
  D=D+M // Load arg1 and op with R13
  WRITE_SP_-1 // Write to arg1
  DEC_SP // Decrememnt the pointer


(PUSH_PTR_OFF)
  INC_SP
  READ_PTR_OFF // D=segment[offset]
  WRITE_SP

(POP_PTR_OFF)
  READ_SP
  WRITE_PTR_OFF
  DEC_SP

(EQ)
  SUB
  // SP[-1] = x-y
  READ_SP_-1
  ()


(END)
  @END
  0;JMP
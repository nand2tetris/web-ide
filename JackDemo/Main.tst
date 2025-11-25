// Minimal VM test for the SimpleJack.addPair function
// Assumes SimpleJack.vm is present in the same folder.

set sp 256,
set local 300,
set argument 400,
set this 3000,
set that 4000,
set argument[0] 11,
set argument[1] 5,

repeat 5 {
  vmstep;
}

// Outputs the stack pointer and the first local slot (which stores the sum).
output-list RAM[0]%D1.6.1 RAM[300]%D1.6.1;
output;

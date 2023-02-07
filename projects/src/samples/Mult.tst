output-list RAM[2]%D2.6.2;

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
output;
load ShiftLeft.hdl,
output-file ShiftLeft.out,
compare-to ShiftLeft.cmp,
output-list a%B1.16.1 b%B1.16.1 out%B1.16.1;

set a %B1010101010101010,
set b 1,
eval,
output;

set b 5,
eval,
output;

set b 15,
eval,
output;

set b 24,
eval,
output;
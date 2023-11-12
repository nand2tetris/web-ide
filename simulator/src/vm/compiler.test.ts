import { unwrap } from "@davidsouther/jiffies/lib/esm/result.js";
import { VM } from "../languages/vm.js";
import { Vm } from "./vm.js";
import { ASM } from "../languages/asm.js";
import * as Memory from "../cpu/memory.js";
import { CPU } from "../cpu/cpu.js";

const STATIC_CLASS_1 = `function Class1.set 0
push argument 0
pop static 0
push argument 1
pop static 1
push constant 0
return

// Returns static[0] - static[1].
function Class1.get 0
push static 0
push static 1
sub
return
`;
const STATIC_CLASS_2 = `function Class2.set 0
push argument 0
pop static 0
push argument 1
pop static 1
push constant 0
return

// Returns static[0] - static[1].
function Class2.get 0
push static 0
push static 1
sub
return
`;

const STATIC_SYS = `function Sys.init 0
push constant 6
push constant 8
call Class1.set 2
pop temp 0 // Dumps the return value
push constant 23
push constant 15
call Class2.set 2
pop temp 0 // Dumps the return value
call Class1.get 0
call Class2.get 0
label WHILE
goto WHILE
`;

test("08 / Functions / Static", () => {
  const { instructions } = unwrap(
    VM.parse([STATIC_CLASS_1, STATIC_CLASS_2, STATIC_SYS].join("\n"))
  );
  const vm = Vm.build(instructions);
  const compiler = vm.compiler();
  const asmText = compiler.compile();

  const asm = unwrap(ASM.parse(asmText));
  ASM.passes.fillLabel(asm);
  const filled = ASM.passes.emit(asm);

  const RAM = new Memory.RAM();
  const ROM = new Memory.ROM(new Int16Array(filled));
  const cpu = new CPU({ RAM, ROM });

  for (let i = 0; i < 100; i++) {
    cpu.tick();
  }

  expect(RAM.get(0)).toBe(263);
  expect(RAM.get(261)).toBe(-2);
  expect(RAM.get(262)).toBe(8);
});

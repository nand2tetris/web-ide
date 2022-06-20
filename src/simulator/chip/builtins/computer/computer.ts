import { Chip } from "../../chip.js";
import { RAM } from "../sequential/ram.js";

export class ROM32K extends RAM {
  constructor() {
    super(16);
  }
}

export class Screen extends Chip {}
export class Keyboard extends Chip {}

export class Memory extends Chip {
  // RAM16K(in=in, load=writeram, address=address[1..14], out=ramout);
  // DMux(in=load, sel=address[0], a=writeram, b=writeio);
  // Screen(in=in, load=writeio, address=address[2..14], out=screenout);
  // Keyboard(out=kbdout);
  // Mux4Way16(a=ramout, b=ioout, c=screenout, d=kbdout, sel=address[0..1], out=out);
}

export class CPU extends Chip {}

export class Computer extends Chip {}

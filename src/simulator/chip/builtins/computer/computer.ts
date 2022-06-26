import { Chip } from "../../chip"
import { RAM } from "../sequential/ram"

export class ROM32K extends RAM {
  constructor() {
    super(16);
  }
}

export class Screen extends RAM {
  constructor() {
    super(13);
  }
}

export class Keyboard extends Chip {
  constructor() {
    super([], ["out[16]"]);
  }
}

export class Memory extends Chip {
  // RAM16K(in=in, load=writeram, address=address[1..14], out=ramout);
  // DMux(in=load, sel=address[0], a=writeram, b=writeio);
  // Screen(in=in, load=writeio, address=address[2..14], out=screenout);
  // Keyboard(out=kbdout);
  // Mux4Way16(a=ramout, b=ioout, c=screenout, d=kbdout, sel=address[0..1], out=out);
}

export class CPU extends Chip {
  constructor() {
    super(
      ["inM[16]", "instruction[16]", "reset"],
      ["outM[16]", "writeM", "addressM[15]", "pc[15]"]
    );
  }
}

export class Computer extends Chip {
  constructor() {
    super(["reset"], []);
  }
}

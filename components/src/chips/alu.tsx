import {
  COMMANDS,
  COMMANDS_OP,
  Flags,
} from "@computron5k/simulator/cpu/alu.js";
import { bin } from "@computron5k/simulator/util/twos.js";

export const ALUComponent = ({
  A,
  op,
  D,
  out,
  flag,
}: {
  A: number;
  op: COMMANDS_OP;
  D: number;
  out: number;
  flag: keyof typeof Flags;
}) => (
  <div>
    <span>ALU</span>
    <dl>
      <dt>A</dt> <dd>{bin(A)}</dd>
      <dt>op</dt> <dd>{COMMANDS.op[op] ?? "(??)"}</dd>
      <dt>D</dt> <dd>{bin(D)}</dd>
      <dt>=</dt> <dd>{bin(out)}</dd>
      <dd>{Flags[flag as keyof typeof Flags]}</dd>
    </dl>
  </div>
);

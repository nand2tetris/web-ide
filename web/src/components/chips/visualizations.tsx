import {
  Keyboard,
  Screen,
} from "@computron5k/simulator/chip/builtins/computer/computer.js";
import { ALU } from "@computron5k/simulator/chip/builtins/index.js";
import {
  PC,
  VRegister,
} from "@computron5k/simulator/chip/builtins/sequential/bit.js";
import {
  RAM,
  RAM8,
} from "@computron5k/simulator/chip/builtins/sequential/ram.js";
import { Chip, HIGH } from "@computron5k/simulator/chip/chip.js";
import { Flags } from "@computron5k/simulator/cpu/alu.js";
import { CPU, decode } from "@computron5k/simulator/cpu/cpu.js";
import { ReactElement } from "react";
import { ALUComponent } from "./alu";
import { Keyboard as KeyboardComponent } from "./keyboard";
import { RegisterComponent } from "./register";
import { Memory as MemoryComponent } from "./memory";
import { Screen as ScreenComponent } from "./screen";

export function makeVisualizations(chip: Chip): ReactElement {
  if (chip instanceof ALU) {
    return (
      <ALUComponent
        A={chip.in("x").busVoltage}
        op={chip.op()}
        D={chip.in("y").busVoltage}
        out={chip.out().busVoltage}
        flag={
          (chip.out("zr").voltage() === HIGH
            ? Flags.Zero
            : chip.out("ng").voltage() === HIGH
            ? Flags.Negative
            : Flags.Positive) as keyof typeof Flags
        }
      />
    );
  }
  if (chip instanceof VRegister) {
    return (
      <RegisterComponent
        name={chip.name ?? `Chip ${chip.id}`}
        bits={chip.bits}
      />
    );
  }
  if (chip instanceof PC) {
    return <RegisterComponent name="PC" bits={chip.bits} />;
  }
  if (chip instanceof RAM) {
    return (
      <MemoryComponent
        name={chip.name}
        memory={chip.memory}
        format="dec"
        highlight={chip.address}
      />
    );
  }
  if (chip instanceof RAM8) {
    return <span>RAM {chip.width}</span>;
  }
  if (chip instanceof Keyboard) {
    return <KeyboardComponent keyboard={chip} />;
  }
  if (chip instanceof Screen) {
    return <ScreenComponent memory={chip.memory} />;
  }
  if (chip instanceof CPU) {
    const bits = decode(chip.in("instruction").busVoltage);
    return (
      <>
        <RegisterComponent name={"A"} bits={chip.state.A} />
        <RegisterComponent name={"D"} bits={chip.state.D} />
        <RegisterComponent name={"PC"} bits={chip.state.PC} />
        <ALUComponent
          A={bits.am ? chip.in("inM").busVoltage : chip.state.A}
          D={chip.state.D}
          out={chip.state.ALU}
          op={bits.op}
          flag={chip.state.flag as keyof typeof Flags}
        />
      </>
    );
  }

  return <>{[...chip.parts].map(makeVisualizations)}</>;
}

export function makeVisualizationsWithId(chip: {
  parts: Chip[];
}): [string, ReactElement][] {
  return [...chip.parts].map((part, i): [string, ReactElement] => [
    `${part.id}_${i}`,
    makeVisualizations(part),
  ]);
}

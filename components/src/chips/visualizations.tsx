import {
  CPU,
  Computer,
  Keyboard,
  ROM32K,
  Screen,
} from "@nand2tetris/simulator/chip/builtins/computer/computer.js";
import { ALU } from "@nand2tetris/simulator/chip/builtins/index.js";
import {
  PC,
  Register,
} from "@nand2tetris/simulator/chip/builtins/sequential/bit.js";
import {
  RAM,
  RAM8,
} from "@nand2tetris/simulator/chip/builtins/sequential/ram.js";
import { Chip, HIGH } from "@nand2tetris/simulator/chip/chip.js";
import { Flags } from "@nand2tetris/simulator/cpu/alu.js";
import { decode } from "@nand2tetris/simulator/cpu/cpu.js";
import { ReactElement } from "react";
import { NO_SCREEN } from "../stores/chip.store.js";
import { ALUComponent } from "./alu.js";
import { Keyboard as KeyboardComponent } from "./keyboard.js";
import { Memory as MemoryComponent } from "./memory.js";
import { RegisterComponent } from "./register.js";
import { Screen as ScreenComponent } from "./screen.js";

export function getBuiltinVisualization(part: Chip): ReactElement | undefined {
  switch (part.name) {
    case "Register":
    case "ARegister":
    case "DRegister":
    case "PC":
    case "KEYBOARD":
    case "RAM8":
    case "RAM64":
    case "RAM512":
    case "RAM4K":
    case "RAM16K":
    case "ROM32K":
    case "Screen":
    case "Memory":
    default:
      return undefined;
  }
}

function makeMemoryVisualization(chip: RAM) {
  return (
    <MemoryComponent
      name={chip.name}
      memory={chip.memory}
      format={chip instanceof ROM32K ? "asm" : "dec"}
      highlight={chip.address}
      count={5}
    />
  );
}

export function makeVisualization(
  chip: Chip,
  updateAction?: () => void,
  parameters?: Set<string>,
): ReactElement | undefined {
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
  if (chip instanceof Register) {
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
  if (chip instanceof Keyboard) {
    return <KeyboardComponent keyboard={chip} update={updateAction} />;
  }
  if (chip instanceof Screen) {
    return <ScreenComponent memory={chip.memory} />;
  }
  if (chip instanceof RAM) {
    return makeMemoryVisualization(chip);
  }
  if (chip instanceof RAM8) {
    return <span>RAM {chip.width}</span>;
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
  if (chip instanceof Computer) {
    return (
      <>
        <RegisterComponent name={"A"} bits={chip.cpu.state.A} />
        <RegisterComponent name={"D"} bits={chip.cpu.state.D} />
        <RegisterComponent name={"PC"} bits={chip.cpu.state.PC} />
        {!parameters?.has(NO_SCREEN) && (
          <ScreenComponent memory={chip.ram.screen.memory} />
        )}
        {makeMemoryVisualization(chip.rom)}
        {makeMemoryVisualization(chip.ram.ram)}
      </>
    );
  }

  const vis = [...chip.parts]
    .map((chip) => makeVisualization(chip, updateAction))
    .filter((v) => v !== undefined);
  return vis.length > 0 ? <>{vis}</> : undefined;
}

export function makeVisualizationsWithId(
  chip: {
    parts: Chip[];
  },
  updateAction?: () => void,
  parameters?: Set<string>,
): [string, ReactElement][] {
  return [...chip.parts]
    .map((part, i): [string, ReactElement | undefined] => [
      `${part.id}_${i}`,
      makeVisualization(part, updateAction, parameters),
    ])
    .filter(([_, v]) => v !== undefined) as [string, ReactElement][];
}

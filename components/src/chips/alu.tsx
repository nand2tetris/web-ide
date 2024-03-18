import {
  COMMANDS_ALU,
  COMMANDS_OP,
  Flags,
} from "@nand2tetris/simulator/cpu/alu.js";

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
  <div style={{ fontSize: 20 }}>
    <span>ALU</span>
    <svg width="250" height="250" xmlns="http://www.w3.org/2000/svg">
      <g>
        <rect x="1" y="20" height="85" width="70" fill="white" stroke="black" />
        <rect
          x="1"
          y="145"
          height="85"
          width="70"
          fill="white"
          stroke="black"
        />
        <rect
          x="180"
          y="95"
          height="60"
          width="70"
          fill="white"
          stroke="black"
        />
        <polygon
          points="70,10 180,85 180,165 70,240 70,135 90,125 70,115"
          stroke="#000"
          fill="#6D97AB"
        />
        <text
          xmlSpace="preserve"
          textAnchor="middle"
          fontFamily="Noto Sans JP"
          id="svg_9"
          y="63"
          x="35"
          fill="black"
        >
          {A}
        </text>
        <text
          xmlSpace="preserve"
          textAnchor="middle"
          fontFamily="Noto Sans JP"
          id="svg_10"
          y="188"
          x="35"
          fill="black"
        >
          {D}
        </text>
        <text
          xmlSpace="preserve"
          textAnchor="middle"
          fontFamily="Noto Sans JP"
          id="svg_11"
          y="125"
          x="215"
          fill="black"
        >
          {out}
        </text>
        <text
          xmlSpace="preserve"
          textAnchor="middle"
          fontFamily="Noto Sans JP"
          id="svg_13"
          y="125"
          x="135"
          fill="white"
        >
          {COMMANDS_ALU.op[op] ?? "(??)"}
        </text>
      </g>
    </svg>
  </div>
);

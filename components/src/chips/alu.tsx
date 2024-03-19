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
  <div className="alu">
    <span>ALU</span>
    <svg width="250" height="250" version="1.1" id="svg3">
      <defs id="defs3">
        <rect
          x="34.442518"
          y="54.335354"
          width="0.91770717"
          height="20.780869"
        />
      </defs>
      <g id="g3">
        <polygon
          points="70,10 180,85 180,165 70,240 70,135 90,125 70,115"
          stroke="#000"
          fill="#6D97AB"
        />
        <text
          xmlSpace="preserve"
          textAnchor="middle"
          y="61"
          x="35"
          fill="#000000"
        >
          {A}
        </text>
        <text
          xmlSpace="preserve"
          textAnchor="middle"
          y="176"
          x="35"
          fill="#000000"
        >
          {D}
        </text>
        <text
          xmlSpace="preserve"
          textAnchor="middle"
          y="121"
          x="207"
          fill="#000000"
        >
          {out}
        </text>
        <text
          xmlSpace="preserve"
          y="130.50002"
          x="110.393929"
          fill="#ffffff"
          fontSize={24}
        >
          {COMMANDS_ALU.op[op] ?? "(??)"}
        </text>
        <g id="g8">
          <path stroke="black" d="M 6,67.52217 H 68.675994" />
          <path stroke="black" d="M 68.479388,67.746136 60.290279,61.90711" />
          <path stroke="black" d="m 68.479388,67.40711 -8.189109,5.839026" />
        </g>
        <g id="g13" transform="translate(0,115.5)">
          <path stroke="black" d="M 6,67.52217 H 68.675994" />
          <path d="M 68.479388,67.746136 60.290279,61.90711" stroke="black" />
          <path stroke="black" d="m 68.479388,67.40711 -8.189109,5.839026" />
        </g>
        <g id="g16" transform="translate(176,57.5)">
          <path stroke="black" d="M 6,67.52217 H 68.675994" />
          <path stroke="black" d="M 68.479388,67.746136 60.290279,61.90711" />
          <path stroke="black" d="m 68.479388,67.40711 -8.189109,5.839026" />
        </g>
      </g>
    </svg>
  </div>
);

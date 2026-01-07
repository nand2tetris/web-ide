const BINARY_BITS = 16;

export function createGrid(
  width: number,
  height: number,
  invertMode: boolean,
): boolean[][] {
  const newGrid: boolean[][] = [];
  for (let i = 0; i < height; i++) {
    newGrid[i] = new Array(width).fill(invertMode);
  }
  return newGrid;
}

export function getWordValue(
  grid: boolean[][],
  i: number,
  j: number,
  invertMode: boolean,
  width: number,
): number {
  let binary = "";
  for (let m = j; m < j + BINARY_BITS; m++) {
    if (m < 0 || m >= width) {
      binary = (invertMode ? "1" : "0") + binary;
    } else {
      binary = (grid[i][m] ? "1" : "0") + binary;
    }
  }

  let isNegative = false;
  if (binary[0] === "1") {
    isNegative = true;
    let oneComplement = "";
    for (let k = 0; k < BINARY_BITS; k++) {
      oneComplement += binary[k] === "1" ? "0" : "1";
    }
    binary = oneComplement;
  }

  let value = 0;
  for (let k = 0; k < BINARY_BITS; k++) {
    value = value * 2;
    if (binary[k] === "1") value = value + 1;
  }

  if (isNegative) value = -(value + 1);
  return value;
}

export function generateJackCodeLine(
  row: number,
  value: number,
  col: number,
): string {
  const memShift = row * 32 + col;
  let memShiftStr = "";
  if (memShift > 0) memShiftStr = " +" + memShift;
  else if (memShift === 0) memShiftStr = "";
  else memShiftStr = " " + memShift;

  if (value === -32768) {
    return "\tdo Memory.poke(memAddress" + memShiftStr + ", ~32767);\n";
  }
  return "\tdo Memory.poke(memAddress" + memShiftStr + ", " + value + ");\n";
}

export function generateHackAssemblyCode(
  addrIncrement: number,
  pixelsValue: number,
  dHoldsAddr: boolean,
  comments: boolean,
): { code: string; dHoldsAddr: boolean } {
  let str = "";
  const c = comments
    ? [
        "// D holds previous addr",
        "// D holds addr",
        "// D holds addr",
        "// A holds val",
        "// D = addr + val",
        "// A=addr + val - val = addr",
        "// RAM[addr] = val",
        "// RAM[addr]=-val",
      ]
    : ["", "", "", "", "", "", "", ""];

  if (!dHoldsAddr && addrIncrement > 2) str += "\tD=A " + c[0] + "\n";

  if (addrIncrement === 1) str += "\tAD=A+1 " + c[1] + "\n";
  else if (addrIncrement === 2) str += "\tAD=A+1\n\tAD=A+1 " + c[2] + "\n";
  else if (addrIncrement !== 0) str += "\t@" + addrIncrement + "\n\tAD=D+A\n";

  if (pixelsValue === 1 || pixelsValue === 0 || pixelsValue === -1) {
    str += "\tM=" + pixelsValue.toString() + "\n";
    return { code: str, dHoldsAddr: true };
  }

  if (pixelsValue === -32768) {
    str +=
      "\t@32767\n\tA=!A " +
      c[3] +
      "\n\tD=D+A " +
      c[4] +
      "\n\tA=D-A " +
      c[5] +
      "\n";
    str += "\tM=D-A " + c[6] + "\n";
    return { code: str, dHoldsAddr: false };
  }

  if (pixelsValue < 0) {
    str +=
      "\t@" +
      -pixelsValue +
      " " +
      c[3] +
      "\n\tD=D+A " +
      c[4] +
      "\n\tA=D-A " +
      c[5] +
      "\n";
    str += "\tM=A-D " + c[7] + "\n";
    return { code: str, dHoldsAddr: false };
  }

  str +=
    "\t@" +
    pixelsValue +
    " " +
    c[3] +
    "\n\tD=D+A " +
    c[4] +
    "\n\tA=D-A " +
    c[5] +
    "\n";
  str += "\tM=D-A " + c[6] + "\n";
  return { code: str, dHoldsAddr: false };
}

export function getColumns(
  leftJ: number,
  rightJ: number,
  baseJ: number,
): number[] {
  const leftmost = Math.min(0, -Math.ceil((baseJ - leftJ) / 16));
  const rightmost = Math.max(0, Math.floor((rightJ - baseJ) / 16));
  const columns: number[] = [];
  for (let i = leftmost; i < rightmost + 1; i++) {
    columns.push(i);
  }
  if (rightJ < baseJ || leftJ > baseJ + 16) {
    const idx = columns.indexOf(0);
    if (idx !== -1) columns.splice(idx, 1);
  }
  return columns;
}

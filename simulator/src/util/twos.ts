const Hex = [
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
];

export function chars(i: number): string {
  return Hex[i] ?? "X";
}

export function bits(i: number): string {
  switch (i) {
    case 0x0:
      return "0000";
    case 0x1:
      return "0001";
    case 0x2:
      return "0010";
    case 0x3:
      return "0011";
    case 0x4:
      return "0100";
    case 0x5:
      return "0101";
    case 0x6:
      return "0110";
    case 0x7:
      return "0111";
    case 0x8:
      return "1000";
    case 0x9:
      return "1001";
    case 0xa:
      return "1010";
    case 0xb:
      return "1011";
    case 0xc:
      return "1100";
    case 0xd:
      return "1101";
    case 0xe:
      return "1110";
    case 0xf:
      return "1111";
    default:
      return "erro";
  }
}

export function int(n: string, radix: number): number {
  const i = parseInt(n.replace(/[^\d+-.xa-fA-F]/g, ""), radix);
  return i & 0xffff;
}

export function int16(i: string): number {
  return int(i, 16);
}

export function int10(i: string): number {
  return int(i, 10);
}

export function int2(i: string): number {
  return int(i, 2);
}

export function parseTwosInt(i: string): number {
  if (i.toUpperCase().includes("X")) {
    return int16(i);
  }
  return int10(i);
}

export function hex(i: number): string {
  const hu = chars((i & 0xf000) >> 12);
  const hl = chars((i & 0x0f00) >> 8);
  const lu = chars((i & 0x00f0) >> 4);
  const ll = chars(i & 0x000f);

  return `0x${hu}${hl}${lu}${ll}`;
}

export function bin(i: number, precision = 16): string {
  const hu = bits((i & 0xf000) >> 12);
  const hl = bits((i & 0x0f00) >> 8);
  const lu = bits((i & 0x00f0) >> 4);
  const ll = bits(i & 0x000f);

  // return `${hu} ${hl} ${lu} ${ll}`;
  return `${hu}${hl}${lu}${ll}`.substring(16 - precision); // Match the book's formatting
}

export function dec(i: number): string {
  i = i & 0xffff;
  if (i === 0x8000) {
    return "-32768";
  }
  if (i & 0x8000) {
    i = (~i + 1) & 0x7fff;
    return `-${i}`;
  }
  return `${i}`;
}

export function uns(i: number): string {
  i = i & 0xffff;
  return `${i}`;
}

export function nand16(a: number, b: number): number {
  a = a & 0xffff;
  b = b & 0xffff;
  let c = ~(a & b);
  c = c & 0xffff;
  return c;
}

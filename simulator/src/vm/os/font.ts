import { bin } from "../../util/twos.js";

export const CHARACTER_NUM = 126;
export const FONT = createFont();

function createBitmap(rows: number[]): boolean[][] {
  return rows.map((row) =>
    Array.from(bin(row, 8))
      .reverse()
      .map((bit) => bit == "1")
  );
}

export function createFont(): boolean[][][] {
  const font: boolean[][][] = new Array(CHARACTER_NUM);

  font[32] = createBitmap([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]); //
  font[33] = createBitmap([12, 30, 30, 30, 12, 12, 0, 12, 12, 0, 0]); // !
  font[34] = createBitmap([54, 54, 20, 0, 0, 0, 0, 0, 0, 0, 0]); // "
  font[35] = createBitmap([0, 18, 18, 63, 18, 18, 63, 18, 18, 0, 0]); // #
  font[36] = createBitmap([12, 30, 51, 3, 30, 48, 51, 30, 12, 12, 0]); // $
  font[37] = createBitmap([0, 0, 35, 51, 24, 12, 6, 51, 49, 0, 0]); // %
  font[38] = createBitmap([12, 30, 30, 12, 54, 27, 27, 27, 54, 0, 0]); // &
  font[39] = createBitmap([12, 12, 6, 0, 0, 0, 0, 0, 0, 0, 0]); // '
  font[40] = createBitmap([24, 12, 6, 6, 6, 6, 6, 12, 24, 0, 0]); // (
  font[41] = createBitmap([6, 12, 24, 24, 24, 24, 24, 12, 6, 0, 0]); // )
  font[42] = createBitmap([0, 0, 0, 51, 30, 63, 30, 51, 0, 0, 0]); // *
  font[43] = createBitmap([0, 0, 0, 12, 12, 63, 12, 12, 0, 0, 0]); // +
  font[44] = createBitmap([0, 0, 0, 0, 0, 0, 0, 12, 12, 6, 0]); // ,
  font[45] = createBitmap([0, 0, 0, 0, 0, 63, 0, 0, 0, 0, 0]); // -
  font[46] = createBitmap([0, 0, 0, 0, 0, 0, 0, 12, 12, 0, 0]); // .
  font[47] = createBitmap([0, 0, 32, 48, 24, 12, 6, 3, 1, 0, 0]); // /

  font[48] = createBitmap([12, 30, 51, 51, 51, 51, 51, 30, 12, 0, 0]); // 0
  font[49] = createBitmap([12, 14, 15, 12, 12, 12, 12, 12, 63, 0, 0]); // 1
  font[50] = createBitmap([30, 51, 48, 24, 12, 6, 3, 51, 63, 0, 0]); // 2
  font[51] = createBitmap([30, 51, 48, 48, 28, 48, 48, 51, 30, 0, 0]); // 3
  font[52] = createBitmap([16, 24, 28, 26, 25, 63, 24, 24, 60, 0, 0]); // 4
  font[53] = createBitmap([63, 3, 3, 31, 48, 48, 48, 51, 30, 0, 0]); // 5
  font[54] = createBitmap([28, 6, 3, 3, 31, 51, 51, 51, 30, 0, 0]); // 6
  font[55] = createBitmap([63, 49, 48, 48, 24, 12, 12, 12, 12, 0, 0]); // 7
  font[56] = createBitmap([30, 51, 51, 51, 30, 51, 51, 51, 30, 0, 0]); // 8
  font[57] = createBitmap([30, 51, 51, 51, 62, 48, 48, 24, 14, 0, 0]); // 9

  font[58] = createBitmap([0, 0, 12, 12, 0, 0, 12, 12, 0, 0, 0]); // :
  font[59] = createBitmap([0, 0, 12, 12, 0, 0, 12, 12, 6, 0, 0]); // ;
  font[60] = createBitmap([0, 0, 24, 12, 6, 3, 6, 12, 24, 0, 0]); // <
  font[61] = createBitmap([0, 0, 0, 63, 0, 0, 63, 0, 0, 0, 0]); // =
  font[62] = createBitmap([0, 0, 3, 6, 12, 24, 12, 6, 3, 0, 0]); // >
  font[64] = createBitmap([30, 51, 51, 59, 59, 59, 27, 3, 30, 0, 0]); // @
  font[63] = createBitmap([30, 51, 51, 24, 12, 12, 0, 12, 12, 0, 0]); // ?

  font[65] = createBitmap([12, 30, 51, 51, 63, 51, 51, 51, 51, 0, 0]); // A
  font[66] = createBitmap([31, 51, 51, 51, 31, 51, 51, 51, 31, 0, 0]); // B
  font[67] = createBitmap([28, 54, 35, 3, 3, 3, 35, 54, 28, 0, 0]); // C
  font[68] = createBitmap([15, 27, 51, 51, 51, 51, 51, 27, 15, 0, 0]); // D
  font[69] = createBitmap([63, 51, 35, 11, 15, 11, 35, 51, 63, 0, 0]); // E
  font[70] = createBitmap([63, 51, 35, 11, 15, 11, 3, 3, 3, 0, 0]); // F
  font[71] = createBitmap([28, 54, 35, 3, 59, 51, 51, 54, 44, 0, 0]); // G
  font[72] = createBitmap([51, 51, 51, 51, 63, 51, 51, 51, 51, 0, 0]); // H
  font[73] = createBitmap([30, 12, 12, 12, 12, 12, 12, 12, 30, 0, 0]); // I
  font[74] = createBitmap([60, 24, 24, 24, 24, 24, 27, 27, 14, 0, 0]); // J
  font[75] = createBitmap([51, 51, 51, 27, 15, 27, 51, 51, 51, 0, 0]); // K
  font[76] = createBitmap([3, 3, 3, 3, 3, 3, 35, 51, 63, 0, 0]); // L
  font[77] = createBitmap([33, 51, 63, 63, 51, 51, 51, 51, 51, 0, 0]); // M
  font[78] = createBitmap([51, 51, 55, 55, 63, 59, 59, 51, 51, 0, 0]); // N
  font[79] = createBitmap([30, 51, 51, 51, 51, 51, 51, 51, 30, 0, 0]); // O
  font[80] = createBitmap([31, 51, 51, 51, 31, 3, 3, 3, 3, 0, 0]); // P
  font[81] = createBitmap([30, 51, 51, 51, 51, 51, 63, 59, 30, 48, 0]); // Q
  font[82] = createBitmap([31, 51, 51, 51, 31, 27, 51, 51, 51, 0, 0]); // R
  font[83] = createBitmap([30, 51, 51, 6, 28, 48, 51, 51, 30, 0, 0]); // S
  font[84] = createBitmap([63, 63, 45, 12, 12, 12, 12, 12, 30, 0, 0]); // T
  font[85] = createBitmap([51, 51, 51, 51, 51, 51, 51, 51, 30, 0, 0]); // U
  font[86] = createBitmap([51, 51, 51, 51, 51, 30, 30, 12, 12, 0, 0]); // V
  font[87] = createBitmap([51, 51, 51, 51, 51, 63, 63, 63, 18, 0, 0]); // W
  font[88] = createBitmap([51, 51, 30, 30, 12, 30, 30, 51, 51, 0, 0]); // X
  font[89] = createBitmap([51, 51, 51, 51, 30, 12, 12, 12, 30, 0, 0]); // Y
  font[90] = createBitmap([63, 51, 49, 24, 12, 6, 35, 51, 63, 0, 0]); // Z

  font[91] = createBitmap([30, 6, 6, 6, 6, 6, 6, 6, 30, 0, 0]); // [
  font[92] = createBitmap([0, 0, 1, 3, 6, 12, 24, 48, 32, 0, 0]); // \
  font[93] = createBitmap([30, 24, 24, 24, 24, 24, 24, 24, 30, 0, 0]); // ]
  font[94] = createBitmap([8, 28, 54, 0, 0, 0, 0, 0, 0, 0, 0]); // ^
  font[95] = createBitmap([0, 0, 0, 0, 0, 0, 0, 0, 0, 63, 0]); // _
  font[96] = createBitmap([6, 12, 24, 0, 0, 0, 0, 0, 0, 0, 0]); // `

  font[97] = createBitmap([0, 0, 0, 14, 24, 30, 27, 27, 54, 0, 0]); // a
  font[98] = createBitmap([3, 3, 3, 15, 27, 51, 51, 51, 30, 0, 0]); // b
  font[99] = createBitmap([0, 0, 0, 30, 51, 3, 3, 51, 30, 0, 0]); // c
  font[100] = createBitmap([48, 48, 48, 60, 54, 51, 51, 51, 30, 0, 0]); // d
  font[101] = createBitmap([0, 0, 0, 30, 51, 63, 3, 51, 30, 0, 0]); // e
  font[102] = createBitmap([28, 54, 38, 6, 15, 6, 6, 6, 15, 0, 0]); // f
  font[103] = createBitmap([0, 0, 30, 51, 51, 51, 62, 48, 51, 30, 0]); // g
  font[104] = createBitmap([3, 3, 3, 27, 55, 51, 51, 51, 51, 0, 0]); // h
  font[105] = createBitmap([12, 12, 0, 14, 12, 12, 12, 12, 30, 0, 0]); // i
  font[106] = createBitmap([48, 48, 0, 56, 48, 48, 48, 48, 51, 30, 0]); // j
  font[107] = createBitmap([3, 3, 3, 51, 27, 15, 15, 27, 51, 0, 0]); // k
  font[108] = createBitmap([14, 12, 12, 12, 12, 12, 12, 12, 30, 0, 0]); // l
  font[109] = createBitmap([0, 0, 0, 29, 63, 43, 43, 43, 43, 0, 0]); // m
  font[110] = createBitmap([0, 0, 0, 29, 51, 51, 51, 51, 51, 0, 0]); // n
  font[111] = createBitmap([0, 0, 0, 30, 51, 51, 51, 51, 30, 0, 0]); // o
  font[112] = createBitmap([0, 0, 0, 30, 51, 51, 51, 31, 3, 3, 0]); // p
  font[113] = createBitmap([0, 0, 0, 30, 51, 51, 51, 62, 48, 48, 0]); // q
  font[114] = createBitmap([0, 0, 0, 29, 55, 51, 3, 3, 7, 0, 0]); // r
  font[115] = createBitmap([0, 0, 0, 30, 51, 6, 24, 51, 30, 0, 0]); // s
  font[116] = createBitmap([4, 6, 6, 15, 6, 6, 6, 54, 28, 0, 0]); // t
  font[117] = createBitmap([0, 0, 0, 27, 27, 27, 27, 27, 54, 0, 0]); // u
  font[118] = createBitmap([0, 0, 0, 51, 51, 51, 51, 30, 12, 0, 0]); // v
  font[119] = createBitmap([0, 0, 0, 51, 51, 51, 63, 63, 18, 0, 0]); // w
  font[120] = createBitmap([0, 0, 0, 51, 30, 12, 12, 30, 51, 0, 0]); // x
  font[121] = createBitmap([0, 0, 0, 51, 51, 51, 62, 48, 24, 15, 0]); // y
  font[122] = createBitmap([0, 0, 0, 63, 27, 12, 6, 51, 63, 0, 0]); // z

  font[123] = createBitmap([56, 12, 12, 12, 7, 12, 12, 12, 56, 0, 0]); // {
  font[124] = createBitmap([12, 12, 12, 12, 12, 12, 12, 12, 12, 0, 0]); // |
  font[125] = createBitmap([7, 12, 12, 12, 56, 12, 12, 12, 7, 0, 0]); // }
  font[126] = createBitmap([38, 45, 25, 0, 0, 0, 0, 0, 0, 0, 0]); // ~
  return font;
}

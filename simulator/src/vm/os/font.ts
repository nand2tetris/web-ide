export const CHARACTER_NUM = 126;
export const FONT = createFont();

/* Character bitmaps are 8x11 boolean pixel values. See Fig 12.9. */
type Bitmap = boolean[][];

function createBitmap(rows: string[]): Bitmap {
  return rows.map((row) => row.split("").map((c) => c == "█"));
}

export function createFont(): Bitmap[] {
  const font: Bitmap[] = new Array(CHARACTER_NUM);

  font[32] = createBitmap([
    "        ",
    "        ",
    "        ",
    "        ",
    "        ",
    "        ",
    "        ",
    "        ",
    "        ",
    "        ",
    "        ",
  ]); //
  font[33] = createBitmap([
    "  ██    ",
    " ████   ",
    " ████   ",
    " ████   ",
    "  ██    ",
    "  ██    ",
    "        ",
    "  ██    ",
    "  ██    ",
    "        ",
    "        ",
  ]); // !
  font[34] = createBitmap([
    " ██ ██  ",
    " ██ ██  ",
    "  █ █   ",
    "        ",
    "        ",
    "        ",
    "        ",
    "        ",
    "        ",
    "        ",
    "        ",
  ]); // "
  font[35] = createBitmap([
    "        ",
    " █  █   ",
    " █  █   ",
    "██████  ",
    " █  █   ",
    " █  █   ",
    "██████  ",
    " █  █   ",
    " █  █   ",
    "        ",
    "        ",
  ]); // #
  font[36] = createBitmap([
    "  ██    ",
    " ████   ",
    "██  ██  ",
    "██      ",
    " ████   ",
    "    ██  ",
    "██  ██  ",
    " ████   ",
    "  ██    ",
    "  ██    ",
    "        ",
  ]); // $
  font[37] = createBitmap([
    "        ",
    "        ",
    "██   █  ",
    "██  ██  ",
    "   ██   ",
    "  ██    ",
    " ██     ",
    "██  ██  ",
    "█   ██  ",
    "        ",
    "        ",
  ]); // %
  font[38] = createBitmap([
    "  ██    ",
    " ████   ",
    " ████   ",
    "  ██    ",
    " ██ ██  ",
    "██ ██   ",
    "██ ██   ",
    "██ ██   ",
    " ██ ██  ",
    "        ",
    "        ",
  ]); // &
  font[39] = createBitmap([
    "  ██    ",
    "  ██    ",
    " ██     ",
    "        ",
    "        ",
    "        ",
    "        ",
    "        ",
    "        ",
    "        ",
    "        ",
  ]); // '
  font[40] = createBitmap([
    "   ██   ",
    "  ██    ",
    " ██     ",
    " ██     ",
    " ██     ",
    " ██     ",
    " ██     ",
    "  ██    ",
    "   ██   ",
    "        ",
    "        ",
  ]); // (
  font[41] = createBitmap([
    " ██     ",
    "  ██    ",
    "   ██   ",
    "   ██   ",
    "   ██   ",
    "   ██   ",
    "   ██   ",
    "  ██    ",
    " ██     ",
    "        ",
    "        ",
  ]); // )
  font[42] = createBitmap([
    "        ",
    "        ",
    "        ",
    "██  ██  ",
    " ████   ",
    "██████  ",
    " ████   ",
    "██  ██  ",
    "        ",
    "        ",
    "        ",
  ]); // *
  font[43] = createBitmap([
    "        ",
    "        ",
    "        ",
    "  ██    ",
    "  ██    ",
    "██████  ",
    "  ██    ",
    "  ██    ",
    "        ",
    "        ",
    "        ",
  ]); // +
  font[44] = createBitmap([
    "        ",
    "        ",
    "        ",
    "        ",
    "        ",
    "        ",
    "        ",
    "  ██    ",
    "  ██    ",
    " ██     ",
    "        ",
  ]); // ,
  font[45] = createBitmap([
    "        ",
    "        ",
    "        ",
    "        ",
    "        ",
    "██████  ",
    "        ",
    "        ",
    "        ",
    "        ",
    "        ",
  ]); // -
  font[46] = createBitmap([
    "        ",
    "        ",
    "        ",
    "        ",
    "        ",
    "        ",
    "        ",
    "  ██    ",
    "  ██    ",
    "        ",
    "        ",
  ]); // .
  font[47] = createBitmap([
    "        ",
    "        ",
    "     █  ",
    "    ██  ",
    "   ██   ",
    "  ██    ",
    " ██     ",
    "██      ",
    "█       ",
    "        ",
    "        ",
  ]); // /
  font[48] = createBitmap([
    "  ██    ",
    " ████   ",
    "██  ██  ",
    "██  ██  ",
    "██  ██  ",
    "██  ██  ",
    "██  ██  ",
    " ████   ",
    "  ██    ",
    "        ",
    "        ",
  ]); // 0
  font[49] = createBitmap([
    "  ██    ",
    " ███    ",
    "████    ",
    "  ██    ",
    "  ██    ",
    "  ██    ",
    "  ██    ",
    "  ██    ",
    "██████  ",
    "        ",
    "        ",
  ]); // 1
  font[50] = createBitmap([
    " ████   ",
    "██  ██  ",
    "    ██  ",
    "   ██   ",
    "  ██    ",
    " ██     ",
    "██      ",
    "██  ██  ",
    "██████  ",
    "        ",
    "        ",
  ]); // 2
  font[51] = createBitmap([
    " ████   ",
    "██  ██  ",
    "    ██  ",
    "    ██  ",
    "  ███   ",
    "    ██  ",
    "    ██  ",
    "██  ██  ",
    " ████   ",
    "        ",
    "        ",
  ]); // 3
  font[52] = createBitmap([
    "    █   ",
    "   ██   ",
    "  ███   ",
    " █ ██   ",
    "█  ██   ",
    "██████  ",
    "   ██   ",
    "   ██   ",
    "  ████  ",
    "        ",
    "        ",
  ]); // 4
  font[53] = createBitmap([
    "██████  ",
    "██      ",
    "██      ",
    "█████   ",
    "    ██  ",
    "    ██  ",
    "    ██  ",
    "██  ██  ",
    " ████   ",
    "        ",
    "        ",
  ]); // 5
  font[54] = createBitmap([
    "  ███   ",
    " ██     ",
    "██      ",
    "██      ",
    "█████   ",
    "██  ██  ",
    "██  ██  ",
    "██  ██  ",
    " ████   ",
    "        ",
    "        ",
  ]); // 6
  font[55] = createBitmap([
    "██████  ",
    "█   ██  ",
    "    ██  ",
    "    ██  ",
    "   ██   ",
    "  ██    ",
    "  ██    ",
    "  ██    ",
    "  ██    ",
    "        ",
    "        ",
  ]); // 7
  font[56] = createBitmap([
    " ████   ",
    "██  ██  ",
    "██  ██  ",
    "██  ██  ",
    " ████   ",
    "██  ██  ",
    "██  ██  ",
    "██  ██  ",
    " ████   ",
    "        ",
    "        ",
  ]); // 8
  font[57] = createBitmap([
    " ████   ",
    "██  ██  ",
    "██  ██  ",
    "██  ██  ",
    " █████  ",
    "    ██  ",
    "    ██  ",
    "   ██   ",
    " ███    ",
    "        ",
    "        ",
  ]); // 9
  font[58] = createBitmap([
    "        ",
    "        ",
    "  ██    ",
    "  ██    ",
    "        ",
    "        ",
    "  ██    ",
    "  ██    ",
    "        ",
    "        ",
    "        ",
  ]); // :
  font[59] = createBitmap([
    "        ",
    "        ",
    "  ██    ",
    "  ██    ",
    "        ",
    "        ",
    "  ██    ",
    "  ██    ",
    " ██     ",
    "        ",
    "        ",
  ]); // ;
  font[60] = createBitmap([
    "        ",
    "        ",
    "   ██   ",
    "  ██    ",
    " ██     ",
    "██      ",
    " ██     ",
    "  ██    ",
    "   ██   ",
    "        ",
    "        ",
  ]); // <
  font[61] = createBitmap([
    "        ",
    "        ",
    "        ",
    "██████  ",
    "        ",
    "        ",
    "██████  ",
    "        ",
    "        ",
    "        ",
    "        ",
  ]); // =
  font[62] = createBitmap([
    "        ",
    "        ",
    "██      ",
    " ██     ",
    "  ██    ",
    "   ██   ",
    "  ██    ",
    " ██     ",
    "██      ",
    "        ",
    "        ",
  ]); // >
  font[64] = createBitmap([
    " ████   ",
    "██  ██  ",
    "██  ██  ",
    "██ ███  ",
    "██ ███  ",
    "██ ███  ",
    "██ ██   ",
    "██      ",
    " ████   ",
    "        ",
    "        ",
  ]); // @
  font[63] = createBitmap([
    " ████   ",
    "██  ██  ",
    "██  ██  ",
    "   ██   ",
    "  ██    ",
    "  ██    ",
    "        ",
    "  ██    ",
    "  ██    ",
    "        ",
    "        ",
  ]); // ?
  font[65] = createBitmap([
    "  ██    ",
    " ████   ",
    "██  ██  ",
    "██  ██  ",
    "██████  ",
    "██  ██  ",
    "██  ██  ",
    "██  ██  ",
    "██  ██  ",
    "        ",
    "        ",
  ]); // A
  font[66] = createBitmap([
    "█████   ",
    "██  ██  ",
    "██  ██  ",
    "██  ██  ",
    "█████   ",
    "██  ██  ",
    "██  ██  ",
    "██  ██  ",
    "█████   ",
    "        ",
    "        ",
  ]); // B
  font[67] = createBitmap([
    "  ███   ",
    " ██ ██  ",
    "██   █  ",
    "██      ",
    "██      ",
    "██      ",
    "██   █  ",
    " ██ ██  ",
    "  ███   ",
    "        ",
    "        ",
  ]); // C
  font[68] = createBitmap([
    "████    ",
    "██ ██   ",
    "██  ██  ",
    "██  ██  ",
    "██  ██  ",
    "██  ██  ",
    "██  ██  ",
    "██ ██   ",
    "████    ",
    "        ",
    "        ",
  ]); // D
  font[69] = createBitmap([
    "██████  ",
    "██  ██  ",
    "██   █  ",
    "██ █    ",
    "████    ",
    "██ █    ",
    "██   █  ",
    "██  ██  ",
    "██████  ",
    "        ",
    "        ",
  ]); // E
  font[70] = createBitmap([
    "██████  ",
    "██  ██  ",
    "██   █  ",
    "██ █    ",
    "████    ",
    "██ █    ",
    "██      ",
    "██      ",
    "██      ",
    "        ",
    "        ",
  ]); // F
  font[71] = createBitmap([
    "  ███   ",
    " ██ ██  ",
    "██   █  ",
    "██      ",
    "██ ███  ",
    "██  ██  ",
    "██  ██  ",
    " ██ ██  ",
    "  ██ █  ",
    "        ",
    "        ",
  ]); // G
  font[72] = createBitmap([
    "██  ██  ",
    "██  ██  ",
    "██  ██  ",
    "██  ██  ",
    "██████  ",
    "██  ██  ",
    "██  ██  ",
    "██  ██  ",
    "██  ██  ",
    "        ",
    "        ",
  ]); // H
  font[73] = createBitmap([
    " ████   ",
    "  ██    ",
    "  ██    ",
    "  ██    ",
    "  ██    ",
    "  ██    ",
    "  ██    ",
    "  ██    ",
    " ████   ",
    "        ",
    "        ",
  ]); // I
  font[74] = createBitmap([
    "  ████  ",
    "   ██   ",
    "   ██   ",
    "   ██   ",
    "   ██   ",
    "   ██   ",
    "██ ██   ",
    "██ ██   ",
    " ███    ",
    "        ",
    "        ",
  ]); // J
  font[75] = createBitmap([
    "██  ██  ",
    "██  ██  ",
    "██  ██  ",
    "██ ██   ",
    "████    ",
    "██ ██   ",
    "██  ██  ",
    "██  ██  ",
    "██  ██  ",
    "        ",
    "        ",
  ]); // K
  font[76] = createBitmap([
    "██      ",
    "██      ",
    "██      ",
    "██      ",
    "██      ",
    "██      ",
    "██   █  ",
    "██  ██  ",
    "██████  ",
    "        ",
    "        ",
  ]); // L
  font[77] = createBitmap([
    "█    █  ",
    "██  ██  ",
    "██████  ",
    "██████  ",
    "██  ██  ",
    "██  ██  ",
    "██  ██  ",
    "██  ██  ",
    "██  ██  ",
    "        ",
    "        ",
  ]); // M
  font[78] = createBitmap([
    "██  ██  ",
    "██  ██  ",
    "███ ██  ",
    "███ ██  ",
    "██████  ",
    "██ ███  ",
    "██ ███  ",
    "██  ██  ",
    "██  ██  ",
    "        ",
    "        ",
  ]); // N
  font[79] = createBitmap([
    " ████   ",
    "██  ██  ",
    "██  ██  ",
    "██  ██  ",
    "██  ██  ",
    "██  ██  ",
    "██  ██  ",
    "██  ██  ",
    " ████   ",
    "        ",
    "        ",
  ]); // O
  font[80] = createBitmap([
    "█████   ",
    "██  ██  ",
    "██  ██  ",
    "██  ██  ",
    "█████   ",
    "██      ",
    "██      ",
    "██      ",
    "██      ",
    "        ",
    "        ",
  ]); // P
  font[81] = createBitmap([
    " ████   ",
    "██  ██  ",
    "██  ██  ",
    "██  ██  ",
    "██  ██  ",
    "██  ██  ",
    "██████  ",
    "██ ███  ",
    " ████   ",
    "    ██  ",
    "        ",
  ]); // Q
  font[82] = createBitmap([
    "█████   ",
    "██  ██  ",
    "██  ██  ",
    "██  ██  ",
    "█████   ",
    "██ ██   ",
    "██  ██  ",
    "██  ██  ",
    "██  ██  ",
    "        ",
    "        ",
  ]); // R
  font[83] = createBitmap([
    " ████   ",
    "██  ██  ",
    "██  ██  ",
    " ██     ",
    "  ███   ",
    "    ██  ",
    "██  ██  ",
    "██  ██  ",
    " ████   ",
    "        ",
    "        ",
  ]); // S
  font[84] = createBitmap([
    "██████  ",
    "██████  ",
    "█ ██ █  ",
    "  ██    ",
    "  ██    ",
    "  ██    ",
    "  ██    ",
    "  ██    ",
    " ████   ",
    "        ",
    "        ",
  ]); // T
  font[85] = createBitmap([
    "██  ██  ",
    "██  ██  ",
    "██  ██  ",
    "██  ██  ",
    "██  ██  ",
    "██  ██  ",
    "██  ██  ",
    "██  ██  ",
    " ████   ",
    "        ",
    "        ",
  ]); // U
  font[86] = createBitmap([
    "██  ██  ",
    "██  ██  ",
    "██  ██  ",
    "██  ██  ",
    "██  ██  ",
    " ████   ",
    " ████   ",
    "  ██    ",
    "  ██    ",
    "        ",
    "        ",
  ]); // V
  font[87] = createBitmap([
    "██  ██  ",
    "██  ██  ",
    "██  ██  ",
    "██  ██  ",
    "██  ██  ",
    "██████  ",
    "██████  ",
    "██████  ",
    " █  █   ",
    "        ",
    "        ",
  ]); // W
  font[88] = createBitmap([
    "██  ██  ",
    "██  ██  ",
    " ████   ",
    " ████   ",
    "  ██    ",
    " ████   ",
    " ████   ",
    "██  ██  ",
    "██  ██  ",
    "        ",
    "        ",
  ]); // X
  font[89] = createBitmap([
    "██  ██  ",
    "██  ██  ",
    "██  ██  ",
    "██  ██  ",
    " ████   ",
    "  ██    ",
    "  ██    ",
    "  ██    ",
    " ████   ",
    "        ",
    "        ",
  ]); // Y
  font[90] = createBitmap([
    "██████  ",
    "██  ██  ",
    "█   ██  ",
    "   ██   ",
    "  ██    ",
    " ██     ",
    "██   █  ",
    "██  ██  ",
    "██████  ",
    "        ",
    "        ",
  ]); // Z
  font[91] = createBitmap([
    " ████   ",
    " ██     ",
    " ██     ",
    " ██     ",
    " ██     ",
    " ██     ",
    " ██     ",
    " ██     ",
    " ████   ",
    "        ",
    "        ",
  ]); // [
  font[92] = createBitmap([
    "        ",
    "        ",
    "█       ",
    "██      ",
    " ██     ",
    "  ██    ",
    "   ██   ",
    "    ██  ",
    "     █  ",
    "        ",
    "        ",
  ]); //   font[93] = createBitmap([30, 24, 24, 24, 24, 24, 24, 24, 30, 0, 0]); // ]
  font[94] = createBitmap([
    "   █    ",
    "  ███   ",
    " ██ ██  ",
    "        ",
    "        ",
    "        ",
    "        ",
    "        ",
    "        ",
    "        ",
    "        ",
  ]); // ^
  font[95] = createBitmap([
    "        ",
    "        ",
    "        ",
    "        ",
    "        ",
    "        ",
    "        ",
    "        ",
    "        ",
    "██████  ",
    "        ",
  ]); // _
  font[96] = createBitmap([
    " ██     ",
    "  ██    ",
    "   ██   ",
    "        ",
    "        ",
    "        ",
    "        ",
    "        ",
    "        ",
    "        ",
    "        ",
  ]); // `
  font[97] = createBitmap([
    "        ",
    "        ",
    "        ",
    " ███    ",
    "   ██   ",
    " ████   ",
    "██ ██   ",
    "██ ██   ",
    " ██ ██  ",
    "        ",
    "        ",
  ]); // a
  font[98] = createBitmap([
    "██      ",
    "██      ",
    "██      ",
    "████    ",
    "██ ██   ",
    "██  ██  ",
    "██  ██  ",
    "██  ██  ",
    " ████   ",
    "        ",
    "        ",
  ]); // b
  font[99] = createBitmap([
    "        ",
    "        ",
    "        ",
    " ████   ",
    "██  ██  ",
    "██      ",
    "██      ",
    "██  ██  ",
    " ████   ",
    "        ",
    "        ",
  ]); // c
  font[100] = createBitmap([
    "    ██  ",
    "    ██  ",
    "    ██  ",
    "  ████  ",
    " ██ ██  ",
    "██  ██  ",
    "██  ██  ",
    "██  ██  ",
    " ████   ",
    "        ",
    "        ",
  ]); // d
  font[101] = createBitmap([
    "        ",
    "        ",
    "        ",
    " ████   ",
    "██  ██  ",
    "██████  ",
    "██      ",
    "██  ██  ",
    " ████   ",
    "        ",
    "        ",
  ]); // e
  font[102] = createBitmap([
    "  ███   ",
    " ██ ██  ",
    " ██  █  ",
    " ██     ",
    "████    ",
    " ██     ",
    " ██     ",
    " ██     ",
    "████    ",
    "        ",
    "        ",
  ]); // f
  font[103] = createBitmap([
    "        ",
    "        ",
    " ████   ",
    "██  ██  ",
    "██  ██  ",
    "██  ██  ",
    " █████  ",
    "    ██  ",
    "██  ██  ",
    " ████   ",
    "        ",
  ]); // g
  font[104] = createBitmap([
    "██      ",
    "██      ",
    "██      ",
    "██ ██   ",
    "███ ██  ",
    "██  ██  ",
    "██  ██  ",
    "██  ██  ",
    "██  ██  ",
    "        ",
    "        ",
  ]); // h
  font[105] = createBitmap([
    "  ██    ",
    "  ██    ",
    "        ",
    " ███    ",
    "  ██    ",
    "  ██    ",
    "  ██    ",
    "  ██    ",
    " ████   ",
    "        ",
    "        ",
  ]); // i
  font[106] = createBitmap([
    "    ██  ",
    "    ██  ",
    "        ",
    "   ███  ",
    "    ██  ",
    "    ██  ",
    "    ██  ",
    "    ██  ",
    "██  ██  ",
    " ████   ",
    "        ",
  ]); // j
  font[107] = createBitmap([
    "██      ",
    "██      ",
    "██      ",
    "██  ██  ",
    "██ ██   ",
    "████    ",
    "████    ",
    "██ ██   ",
    "██  ██  ",
    "        ",
    "        ",
  ]); // k
  font[108] = createBitmap([
    " ███    ",
    "  ██    ",
    "  ██    ",
    "  ██    ",
    "  ██    ",
    "  ██    ",
    "  ██    ",
    "  ██    ",
    " ████   ",
    "        ",
    "        ",
  ]); // l
  font[109] = createBitmap([
    "        ",
    "        ",
    "        ",
    "█ ███   ",
    "██████  ",
    "██ █ █  ",
    "██ █ █  ",
    "██ █ █  ",
    "██ █ █  ",
    "        ",
    "        ",
  ]); // m
  font[110] = createBitmap([
    "        ",
    "        ",
    "        ",
    "█ ███   ",
    "██  ██  ",
    "██  ██  ",
    "██  ██  ",
    "██  ██  ",
    "██  ██  ",
    "        ",
    "        ",
  ]); // n
  font[111] = createBitmap([
    "        ",
    "        ",
    "        ",
    " ████   ",
    "██  ██  ",
    "██  ██  ",
    "██  ██  ",
    "██  ██  ",
    " ████   ",
    "        ",
    "        ",
  ]); // o
  font[112] = createBitmap([
    "        ",
    "        ",
    "        ",
    " ████   ",
    "██  ██  ",
    "██  ██  ",
    "██  ██  ",
    "█████   ",
    "██      ",
    "██      ",
    "        ",
  ]); // p
  font[113] = createBitmap([
    "        ",
    "        ",
    "        ",
    " ████   ",
    "██  ██  ",
    "██  ██  ",
    "██  ██  ",
    " █████  ",
    "    ██  ",
    "    ██  ",
    "        ",
  ]); // q
  font[114] = createBitmap([
    "        ",
    "        ",
    "        ",
    "█ ███   ",
    "███ ██  ",
    "██  ██  ",
    "██      ",
    "██      ",
    "███     ",
    "        ",
    "        ",
  ]); // r
  font[115] = createBitmap([
    "        ",
    "        ",
    "        ",
    " ████   ",
    "██  ██  ",
    " ██     ",
    "   ██   ",
    "██  ██  ",
    " ████   ",
    "        ",
    "        ",
  ]); // s
  font[116] = createBitmap([
    "  █     ",
    " ██     ",
    " ██     ",
    "████    ",
    " ██     ",
    " ██     ",
    " ██     ",
    " ██ ██  ",
    "  ███   ",
    "        ",
    "        ",
  ]); // t
  font[117] = createBitmap([
    "        ",
    "        ",
    "        ",
    "██ ██   ",
    "██ ██   ",
    "██ ██   ",
    "██ ██   ",
    "██ ██   ",
    " ██ ██  ",
    "        ",
    "        ",
  ]); // u
  font[118] = createBitmap([
    "        ",
    "        ",
    "        ",
    "██  ██  ",
    "██  ██  ",
    "██  ██  ",
    "██  ██  ",
    " ████   ",
    "  ██    ",
    "        ",
    "        ",
  ]); // v
  font[119] = createBitmap([
    "        ",
    "        ",
    "        ",
    "██  ██  ",
    "██  ██  ",
    "██  ██  ",
    "██████  ",
    "██████  ",
    " █  █   ",
    "        ",
    "        ",
  ]); // w
  font[120] = createBitmap([
    "        ",
    "        ",
    "        ",
    "██  ██  ",
    " ████   ",
    "  ██    ",
    "  ██    ",
    " ████   ",
    "██  ██  ",
    "        ",
    "        ",
  ]); // x
  font[121] = createBitmap([
    "        ",
    "        ",
    "        ",
    "██  ██  ",
    "██  ██  ",
    "██  ██  ",
    " █████  ",
    "    ██  ",
    "   ██   ",
    "████    ",
    "        ",
  ]); // y
  font[122] = createBitmap([
    "        ",
    "        ",
    "        ",
    "██████  ",
    "██ ██   ",
    "  ██    ",
    " ██     ",
    "██  ██  ",
    "██████  ",
    "        ",
    "        ",
  ]); // z
  font[123] = createBitmap([
    "   ███  ",
    "  ██    ",
    "  ██    ",
    "  ██    ",
    "███     ",
    "  ██    ",
    "  ██    ",
    "  ██    ",
    "   ███  ",
    "        ",
    "        ",
  ]); // {
  font[124] = createBitmap([
    "  ██    ",
    "  ██    ",
    "  ██    ",
    "  ██    ",
    "  ██    ",
    "  ██    ",
    "  ██    ",
    "  ██    ",
    "  ██    ",
    "        ",
    "        ",
  ]); // |
  font[125] = createBitmap([
    "███     ",
    "  ██    ",
    "  ██    ",
    "  ██    ",
    "   ███  ",
    "  ██    ",
    "  ██    ",
    "  ██    ",
    "███     ",
    "        ",
    "        ",
  ]); // }
  font[126] = createBitmap([
    " ██  █  ",
    "█ ██ █  ",
    "█  ██   ",
    "        ",
    "        ",
    "        ",
    "        ",
    "        ",
    "        ",
    "        ",
    "        ",
  ]); // ~

  return font;
}

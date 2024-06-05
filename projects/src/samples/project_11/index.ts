import * as average from "./average.js";
import * as complex_arrays from "./complex_arrays.js";
import * as convert_to_bin from "./convert_to_bin.js";
import * as pong_ball from "./pong/ball.js";
import * as pong_bat from "./pong/bat.js";
import * as pong_main from "./pong/main.js";
import * as pong_game from "./pong/pong_game.js";
import * as seven from "./seven.js";
import * as square_main from "./square/main.js";
import * as square from "./square/square.js";
import * as square_game from "./square/square_game.js";

type Program = Record<
  string,
  { jack: string; parsed: unknown; compiled: string }
>;
export const Programs: Record<string, Program> = {
  average: { Main: average },
  complex_arrays: { Main: complex_arrays },
  convert_to_bin: { Main: convert_to_bin },
  pong: {
    Ball: pong_ball,
    Bat: pong_bat,
    PongGame: pong_game,
    Main: pong_main,
  },
  seven: { Main: seven },
  square: { Square: square, Main: square_main, SquareGame: square_game },
};

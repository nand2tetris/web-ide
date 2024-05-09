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

export const Programs: Record<string, any> = {
  average: average,
  complex_arrays: complex_arrays,
  convert_to_bin: convert_to_bin,
  pong_ball: pong_ball,
  pong_bat: pong_bat,
  pong_main: pong_main,
  pong_game: pong_game,
  seven: seven,
  square: square,
  square_main: square_main,
  square_game: square_game,
};

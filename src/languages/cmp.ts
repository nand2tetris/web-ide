/** Reads and parses a .cmp file, to compare lines of output between test runs. */

import { many0 } from "./parser/multi.js";
import { line } from "./parser/recipe.js";

export const CmpParser = () => many0<string>(line());

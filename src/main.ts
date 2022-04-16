import { info } from "@jefri/jiffies/log.js";
info("Starting server", { cwd: process.cwd() });

import { parse } from "@jefri/jiffies/flags.js";
const FLAGS = parse(process.argv);

import { makeServer } from "@jefri/jiffies/server/http/index.js";
import * as path from "node:path";

const server = await makeServer({
  root: path.join(process.cwd(), "src"),
  scopes: {
    "@jefri/jiffies": "../node_modules/@jefri/jiffies/src",
    "@pico": "../node_modules/@jefri/jiffies/src/pico",
  },
});
server.listen(FLAGS.asNumber("port", 8080), FLAGS.asString("host", "0.0.0.0"));

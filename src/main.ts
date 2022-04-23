import { info } from "@davidsouther/jiffies/log.js";
info("Starting server", { cwd: process.cwd() });

import { parse } from "@davidsouther/jiffies/flags.js";
const FLAGS = parse(process.argv);

import { makeServer } from "@davidsouther/jiffies/server/http/index.js";
import * as path from "node:path";

const server = await makeServer({
  root: path.join(process.cwd(), "src"),
  scopes: {
    "@davidsouther/jiffies": "../node_modules/@davidsouther/jiffies/src",
  },
});
server.listen(FLAGS.asNumber("port", 8080), FLAGS.asString("host", "0.0.0.0"));

#!/usr/bin/env node
import { dirname, resolve } from "path";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { main } from "./grading.js";
import { splitFile } from "./node_file_system_adapter.js";
import { testRunner } from "./testrunner.js";

yargs(hideBin(process.argv))
  .usage("$0 <cmd>")
  .command(
    "grade [directory]",
    "Grade all NAND2Tetris projects in a directory tree.",
    (yargs) =>
      yargs.positional("directory", {
        type: "string",
        default: process.cwd(),
        describe: "Path to a folder to grade for nand2tetris projects.",
      }),
    (argv) => {
      console.log("grade", argv.directory, "nand2tetris grader!");
      main(argv.directory);
    }
  )
  .command(
    "run <file>",
    "Run a NAND2Tetris file. If the file is .tst, executes the test. If the file is .hdl, starts a terminal session for the chip. If the file is .asm, .hack, .vm, or .jack, loads (possibly after compilation) the file into memory and starts the machine execution.",
    (yargs) =>
      yargs
        .positional("file", {
          type: "string",
          describe: "Path to nand2tetris tst file to execute.",
        })
        .option("debug", {
          type: "boolean",
          default: false,
          describe: "Port for the debugger protocol to listen on.",
        })
        .option("debug_port", {
          type: "number",
          default: 6163,
          describe: "Port for the debugger protocol to listen on.",
        }),
    (argv) => {
      console.log("nand2tetris command run", argv);
      const { name, ext } = splitFile(argv.file ?? "");
      switch (ext) {
        case "":
        case "tst":
          console.log("tst");
          testRunner(dirname(resolve(argv.file ?? process.cwd())), name);
          break;
        case "hdl":
          console.log("hdl");
          break;
        default:
          console.log("unknown", ext);
          break;
      }
    }
  )
  .help()
  .demandCommand(1)
  .parse();

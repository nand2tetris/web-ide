#!/usr/bin/env node
import path, { dirname, parse, resolve } from "path";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { main } from "./grading.js";
import { testRunner, testRunnerFromSource } from "./testrunner.js";
import { NodeFileSystemAdapter } from "@davidsouther/jiffies/lib/esm/fs_node.js";
import { FileSystem } from "@davidsouther/jiffies/lib/esm/fs.js";
import * as fsCore from "fs";
import { compile } from "@nand2tetris/simulator/jack/compiler.js";

yargs(hideBin(process.argv))
  .usage("$0 <cmd>")
  .command(
    "grade [directory]",
    "Grade all NAND2Tetris projects in a directory tree.",
    (yargs) =>
      yargs
        .positional("directory", {
          type: "string",
          default: process.cwd(),
          describe: "Path to a folder to grade for nand2tetris projects.",
        })
        .option("java_ide", {
          type: "string",
          default: process.env.NAND2TETRIS_PATH,
          describe:
            "When set, look for the java IDE jars in this path and compare both runs.",
        }),
    async (argv) => {
      console.log("grade", argv.directory, "nand2tetris grader!");
      const exitCodePromise = main(argv.directory, argv.java_ide);
      const exitCode = await exitCodePromise;
      if (exitCode) {
        process.exit(exitCode);
      }
    },
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
        })
        .option("java_ide", {
          type: "string",
          describe:
            "When set, look for the java IDE jars in this path and compare both runs.",
        }),
    (argv) => {
      const filePath = resolve(argv.file ?? process.cwd());
      const parsedPath = parse(filePath);
      const ext = parsedPath.ext || ".tst";
      switch (ext) {
        case ".tst":
          console.log("tst");
          testRunner(filePath);
          break;
        case ".hdl": {
          const tst = fsCore.readFileSync(0, "utf8");
          testRunnerFromSource(dirname(filePath), parsedPath.name, tst);
          break;
        }
        default:
          console.log("unknown", ext);
          break;
      }
    },
  )
  .command(
    "compile <src> [dst]",
    "Compile .jack files inside a folder",
    (yargs) =>
      yargs
        .positional("src", {
          type: "string",
          describe: "Path to input folder with jack files",
        })
        .option("dst", {
          type: "string",
          describe: "Path to destination folder",
          default: "",
        })
        .coerce(["src", "dst"], function (arg) {
          return path.resolve(arg) + "/";
        })
        .check((argv, options) => {
          const src = argv.src;
          const dst = argv.dst;
          if (src === undefined) {
            throw Error("Please provide input folder path");
          }

          if (dst && !fsCore.lstatSync(dst).isDirectory()) {
            throw Error(src + " is not a folder");
          }
          if (!fsCore.lstatSync(src).isDirectory()) {
            throw Error(src + " is not a folder");
          }

          return true;
        })
        .showHelpOnFail(false, "Specify --help for available options"),
    async (argv) => {
      enum Colors {
        Red = "\x1b[31m",
        Green = "\x1b[32m",
        Reset = "\u001b[0m",
      }
      const JACK_EXT = ".jack";
      const src = argv.src;
      const dst = argv.dst ?? src;
      if (src === undefined) {
        throw Error("Please provde input folder path");
      }

      if (dst === undefined) {
        throw Error("Please provde input folder path");
      }
      const fs = new FileSystem(new NodeFileSystemAdapter());

      const files = await fs.readdir(src);
      const jackFiles = files.filter((file) => file.endsWith(JACK_EXT));
      if (jackFiles.length === 0) {
        throw Error("No jack files inside a folder");
      }
      const nameToContent = {} as Record<string, string>;
      for (const file of jackFiles) {
        const filepath = path.join(src, file);
        const content = await fs.readFile(filepath);
        nameToContent[file.replace(JACK_EXT, "")] = content;
      }
      let error = false;
      for (const [name, compiled] of Object.entries(compile(nameToContent))) {
        if (typeof compiled === "string") {
          const outputFilename = name + ".vm";
          const outpath = path.join(dst, outputFilename);
          await fs.writeFile(outpath, compiled);
        } else {
          if (!error) {
            console.error("Compilation failed\n");
          }
          console.error(
            Colors.Red +
              compiled.message.replace(
                /Line\s([\d]+):/g,
                name + ".jack:$1" + Colors.Reset,
              ),
          );
          error = true;
        }
      }
      if (error) {
        process.exit(1);
      } else {
        console.log(Colors.Green + "Compiled files" + Colors.Reset);
      }
    },
  )
  .help()
  .demandCommand(1)
  .parse();

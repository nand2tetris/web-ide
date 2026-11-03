#!/usr/bin/env node
import { FileSystem } from "@davidsouther/jiffies/fs.ts";
import { NodeFileSystemAdapter } from "@davidsouther/jiffies/fs_node.ts";
import * as fsCore from "fs";
import path, { dirname, parse, resolve } from "path";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { gradeCommand, runCommand } from "./commands.js";
import { compileJack } from "./compile.js";
import { main } from "./grading.js";
import { attemptRecoveryOption, resolveAttemptRecovery } from "./recovery.js";
import { testRunner } from "./testrunner.js";

yargs(hideBin(process.argv))
  .usage("$0 <cmd>")
  .command(
    gradeCommand(async (directory, javaIde, options) => {
      console.log("grade", directory, "nand2tetris grader!");
      const exitCode = await main(directory, javaIde, options);
      if (exitCode) {
        process.exit(exitCode);
      }
    }, process.env),
  )
  .command(
    runCommand((file, options) => {
      console.log("nand2tetris command run", file);
      const { name, ext } = parse(file ?? "");
      switch (ext) {
        case "":
        case ".tst":
          console.log("tst");
          testRunner(dirname(resolve(file ?? process.cwd())), name, options);
          break;
        case ".hdl":
          console.log("hdl");
          break;
        default:
          console.log("unknown", ext);
          break;
      }
    }, process.env),
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
        .option("attempt-recovery", attemptRecoveryOption)
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
      const { vm, errors } = compileJack(nameToContent, {
        attemptRecovery: resolveAttemptRecovery(
          argv["attempt-recovery"],
          process.env,
        ),
      });
      for (const [name, compiled] of Object.entries(vm)) {
        await fs.writeFile(path.join(dst, name + ".vm"), compiled);
      }
      if (errors.length > 0) {
        console.error("Compilation failed\n");
        for (const line of errors) {
          console.error(Colors.Red + line + Colors.Reset);
        }
      }
      if (errors.length > 0) {
        process.exit(1);
      } else {
        console.log(Colors.Green + "Compiled files" + Colors.Reset);
      }
    },
  )
  .help()
  .demandCommand(1)
  .parse();

import * as fs from "fs";
import { Command } from "commander";
import * as packageJson from "../package.json";

import { idgrep } from './idgrep';

// Main execution logic here
// Command line argument parsing, file reading, etc.

const program = new Command();

program
  .version(packageJson.version)
  .description('Searches for IDs in a list of programs')
  .option("-p --pattern [regexp]", "regexp to use in the search", "hack")
  .usage("[options] <filename> ...");

program.parse(process.argv);
const options = program.opts();
const pattern = new RegExp(options.pattern);

if (program.args.length == 0) program.help();

for (const inputFilename of program.args) {
  try {
    fs.readFile(inputFilename, "utf8", (err: NodeJS.ErrnoException | null, input: string) => {
      debugger;
      if (err) throw `Error reading '${inputFilename}':${err}`;
      idgrep(pattern, input, inputFilename);
    });
  } catch (e) {
    console.log(`Errores! ${e}`);
  }
}
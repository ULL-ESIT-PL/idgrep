#!/usr/bin/env node

import * as fs from "fs";
import * as esprima from "espree";
import { Command } from "commander";
import * as packageJson from "../package.json";
import * as estraverse from "estraverse";

interface Location {
  line: number;
  column: number;
}

interface ASTNode {
  type: string;
  name?: string;
  loc?: {
    start: Location;
    end: Location;
  };
  range?: [number, number];
}

const idgrep = function (pattern: RegExp, code: string, filename: string): void {
  const lines: string[] = code.split("\n");
  if (/^#!/.test(lines[0])) code = code.replace(/^.*/, ""); // Avoid line "#!/usr/bin/env node"
  
  const ast = esprima.parse(code, {
    ecmaVersion: 6,
    loc: true,
    range: true,
  }) as any;
  
  estraverse.traverse(ast, {
    enter: function (node: any, parent?: any): void {
      if (node.type === "Identifier" && node.name && pattern.test(node.name)) {
        if (!node.loc) return;
        const loc = node.loc.start;
        const line = loc.line - 1;
        console.log(
          `file ${filename}: line ${loc.line}: col: ${loc.column} text: ${lines[line]}`
        );
      }
    },
  });
};

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
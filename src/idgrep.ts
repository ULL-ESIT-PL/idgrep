#!/usr/bin/env node

import * as fs from "fs";
import * as esprima from "espree";
import { Command } from "commander";
import * as packageJson from "../package.json";
import { traverse } from "estraverse";

// Define a minimal compatible Node interface that matches what we expect from the AST
interface ASTNode {
  type: string;
  name?: string;
  loc?: {
    start: {
      line: number;
      column: number;
    };
    end: {
      line: number;
      column: number;
    };
  } | null;
}

// Type guard to check if a node is an Identifier with proper typing
function isIdentifierWithName(node: ASTNode): node is ASTNode & { 
  type: "Identifier"; 
  name: string; 
  loc: NonNullable<ASTNode["loc"]> 
} {
  return node.type === "Identifier" && 
         typeof node.name === "string" && 
         node.loc !== null && 
         node.loc !== undefined;
}

const idgrep = function (pattern: RegExp, code: string, filename: string): void {
  const lines: string[] = code.split("\n");
  if (/^#!/.test(lines[0])) code = code.replace(/^.*/, ""); // Avoid line "#!/usr/bin/env node"
  
  // Parse AST with proper espree options
  const ast = esprima.parse(code, {
    ecmaVersion: 6,
    loc: true,
    range: true,
  });
  
  // Traverse with type-safe handling
  traverse(ast as any, {
    enter: function (node: ASTNode, parent: ASTNode | null): void {
      if (isIdentifierWithName(node) && pattern.test(node.name)) {
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
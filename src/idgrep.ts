#!/usr/bin/env node

import * as esprima from "espree";
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

export { idgrep };
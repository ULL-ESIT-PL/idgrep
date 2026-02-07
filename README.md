# IDGrep - TypeScript Version

A command-line tool that searches for identifier patterns in JavaScript/TypeScript files using AST parsing.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Build the project:
   ```bash
   npm run build
   ```

## Usage

```bash
# Search for the default pattern "hack" in files
npm run grep

# Or run directly on specific files
npm run build && node dist/idgrep.js src/hacky.ts

# Use custom pattern
node dist/idgrep.js -p "your_pattern" file1.js file2.js
```

## Development

- `npm run build` - Compile TypeScript to JavaScript
- `npm run dev` - Watch mode for development (auto-recompile on changes)
- `npm start` - Run the compiled version

## Project Structure

- `src/` - TypeScript source files
  - `idgrep.ts` - Main CLI application
  - `hacky.ts` - Test file
- `dist/` - Compiled JavaScript output
- `tsconfig.json` - TypeScript configuration

## Migration from JavaScript

This project has been migrated from JavaScript to TypeScript, adding:
- Type safety with strict TypeScript configuration
- Proper interfaces for AST nodes and locations
- Type annotations for function parameters and return types
- Development tooling with watch mode
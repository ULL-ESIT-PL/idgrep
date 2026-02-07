import { idgrep } from '../src/idgrep';

// Mock console.log to capture output
const originalConsoleLog = console.log;
let logOutput: string[] = [];

beforeEach(() => {
  logOutput = [];
  console.log = jest.fn((message: string) => {
    logOutput.push(message);
  });
});

afterEach(() => {
  console.log = originalConsoleLog;
});

describe('idgrep', () => {
  describe('Basic functionality', () => {
    test('should find identifier "hack" in simple code', () => {
      const code = `
        let hack = 42;
        console.log(hack);
      `;
      const pattern = /hack/;
      
      idgrep(pattern, code, 'test.js');
      
      expect(logOutput).toHaveLength(2);
      expect(logOutput[0]).toContain('file test.js');
      expect(logOutput[0]).toContain('hack');
      expect(logOutput[1]).toContain('file test.js');
      expect(logOutput[1]).toContain('hack');
    });

    test('should find multiple identifiers matching pattern', () => {
      const code = `
        let hacker = 'person';
        let hacksaw = 'tool';
        let other = 'variable';
      `;
      const pattern = /hack/;
      
      idgrep(pattern, code, 'test.js');
      
      expect(logOutput).toHaveLength(2);
      expect(logOutput.some(log => log.includes('hacker'))).toBe(true);
      expect(logOutput.some(log => log.includes('hacksaw'))).toBe(true);
    });

    test('should not find identifiers that do not match pattern', () => {
      const code = `
        let foo = 42;
        let bar = 'test';
        function baz() {}
      `;
      const pattern = /hack/;
      
      idgrep(pattern, code, 'test.js');
      
      expect(logOutput).toHaveLength(0);
    });
  });

  describe('Advanced patterns', () => {
    test('should work with complex regex patterns', () => {
      const code = `
        let hack = 1;
        let another = 2;
        let someOther = 3;
      `;
      const pattern = /hack|another/;
      
      idgrep(pattern, code, 'test.js');
      
      expect(logOutput).toHaveLength(2);
      expect(logOutput.some(log => log.includes('hack'))).toBe(true);
      expect(logOutput.some(log => log.includes('another'))).toBe(true);
    });

    test('should handle case-sensitive patterns', () => {
      const code = `
        let HACK = 1;
        let hack = 2;
        let Hack = 3;
      `;
      const pattern = /hack/; // lowercase only
      
      idgrep(pattern, code, 'test.js');
      
      expect(logOutput).toHaveLength(1);
      expect(logOutput[0]).toContain('hack');
      expect(logOutput[0]).not.toContain('HACK');
      expect(logOutput[0]).not.toContain('Hack');
    });
  });

  describe('Code structure handling', () => {
    test('should handle function declarations', () => {
      const code = `
        function hackFunction() {
          return 'test';
        }
      `;
      const pattern = /hack/;
      
      idgrep(pattern, code, 'test.js');
      
      expect(logOutput).toHaveLength(1);
      expect(logOutput[0]).toContain('hackFunction');
    });

    test('should handle object properties', () => {
      const code = `
        const obj = {
          hackProperty: 'value',
          normalProp: 'other'
        };
      `;
      const pattern = /hack/;
      
      idgrep(pattern, code, 'test.js');
      
      expect(logOutput).toHaveLength(1);
      expect(logOutput[0]).toContain('hackProperty');
    });

    test('should handle shebang lines correctly', () => {
      const code = `#!/usr/bin/env node
        let hack = 42;
      `;
      const pattern = /hack/;
      
      idgrep(pattern, code, 'test.js');
      
      expect(logOutput).toHaveLength(1);
      expect(logOutput[0]).toContain('hack');
    });
  });

  describe('Location reporting', () => {
    test('should report correct line and column numbers', () => {
      const code = `let foo = 1;
let hack = 2;
let bar = 3;`;
      const pattern = /hack/;
      
      idgrep(pattern, code, 'test.js');
      
      expect(logOutput).toHaveLength(1);
      expect(logOutput[0]).toContain('line 2:');
      expect(logOutput[0]).toContain('col: 4');
    });

    test('should show the actual line content', () => {
      const code = `let foo = 1;
let hackVariable = 42;
let bar = 3;`;
      const pattern = /hack/;
      
      idgrep(pattern, code, 'test.js');
      
      expect(logOutput).toHaveLength(1);
      expect(logOutput[0]).toContain('text: let hackVariable = 42;');
    });
  });

  describe('Edge cases', () => {
    test('should handle empty code', () => {
      const code = '';
      const pattern = /hack/;
      
      idgrep(pattern, code, 'test.js');
      
      expect(logOutput).toHaveLength(0);
    });

    test('should handle code with only comments', () => {
      const code = `
        // This is a comment with hack
        /* Another comment with hack */
      `;
      const pattern = /hack/;
      
      idgrep(pattern, code, 'test.js');
      
      expect(logOutput).toHaveLength(0);
    });

    test('should handle identifiers in different contexts', () => {
      const code = `
        class HackClass {
          hackMethod() {
            const hackVar = this.hackProperty;
            return hackVar;
          }
        }
      `;
      const pattern = /hack/i; // case insensitive
      
      idgrep(pattern, code, 'test.js');
      
      expect(logOutput.length).toBeGreaterThan(0);
      expect(logOutput.some(log => log.includes('HackClass'))).toBe(true);
      expect(logOutput.some(log => log.includes('hackMethod'))).toBe(true);
      expect(logOutput.some(log => log.includes('hackVar'))).toBe(true);
      expect(logOutput.some(log => log.includes('hackProperty'))).toBe(true);
    });
  });
});
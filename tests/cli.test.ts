import * as fs from 'fs';
import * as path from 'path';
import { spawn } from 'child_process';

describe('CLI Integration Tests', () => {
  const testFile = path.join(__dirname, 'test-sample.js');
  const cliScript = path.join(__dirname, '../dist/index.js');

  beforeAll(() => {
    // Create a test file
    const testCode = `#!/usr/bin/env node
// Test file for integration tests
const hackVariable = 'test';
let another = 42;
function normalFunction() {
  const hacky = 'inside function';
  return hacky;
}`;
    fs.writeFileSync(testFile, testCode);
  });

  afterAll(() => {
    // Clean up test file
    if (fs.existsSync(testFile)) {
      fs.unlinkSync(testFile);
    }
  });

  test('should run CLI with default pattern', (done) => {
    const child = spawn('node', [cliScript, testFile]);
    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (code) => {
      expect(code).toBe(0);
      expect(stdout).toContain('hackVariable');
      expect(stdout).toContain('hacky');
      expect(stderr).toBe('');
      done();
    });
  });

  test('should run CLI with custom pattern', (done) => {
    const child = spawn('node', [cliScript, '-p', 'another', testFile]);
    let stdout = '';

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.on('close', (code) => {
      expect(code).toBe(0);
      expect(stdout).toContain('another');
      expect(stdout).not.toContain('hackVariable');
      done();
    });
  });

  test('should show help when no arguments provided', (done) => {
    const child = spawn('node', [cliScript]);
    let stdout = '';

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.on('close', (code) => {
      expect(code).toBe(0);
      expect(stdout).toContain('Usage:');
      done();
    });
  });

  test('should handle non-existent files gracefully', (done) => {
    const child = spawn('node', [cliScript, 'non-existent-file.js']);
    let stderr = '';

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', () => {
      expect(stderr).toContain('Error reading');
      done();
    });
  });
});
'use strict';

// Node verze QUnit testů z test/tests.js (JSHint test zůstává jen v prohlížeči).
const { test, describe, beforeEach } = require('node:test');
const assert = require('node:assert');

const CPU8080 = require('../../8080.js');
// V Node je disassembler exportován ve stejném objektu jako CPU.
const CPUD8080 = CPU8080;

describe('Basic tests', () => {
  test('Namespace', () => {
    assert.notStrictEqual(CPU8080, null, 'CPU8080 is defined');
    assert.strictEqual(typeof CPU8080, 'object', 'CPU8080 is an object');
  });

  test('Init', () => {
    CPU8080.init();
    assert.strictEqual(typeof CPU8080.status().pc, 'number', 'CPU8080 INIT OK');
  });
});

describe('Simple data tests', () => {
  beforeEach(() => {
    CPU8080.init();
  });

  test('Reset', () => {
    CPU8080.set('PC', 0x55);
    CPU8080.reset();
    assert.strictEqual(CPU8080.status().pc, 0, 'Reset PC OK');
    assert.strictEqual(CPU8080.T(), 0, 'Reset T counter OK');
  });

  test('Register manipulations', () => {
    CPU8080.set('A', 0x55);
    CPU8080.set('B', 0xaa);
    CPU8080.set('SP', 0x1234);
    CPU8080.set('PC', 0xffff);
    assert.strictEqual(CPU8080.status().a, 0x55);
    assert.strictEqual(CPU8080.status().b, 0xaa);
    assert.strictEqual(CPU8080.status().sp, 0x1234);
    assert.strictEqual(CPU8080.status().pc, 0xffff);
  });
});

describe('Disassembler', () => {
  test('NOP, just NOPs', () => {
    const d = CPUD8080.disasm(0, 0, 0, 0, 0);
    assert.strictEqual(d[0], 'NOP', 'Instruction decoded OK');
    assert.strictEqual(d[1], 1, 'Instruction length OK');
  });

  test('XRA A', () => {
    const d = CPUD8080.disasm(0xaf, 0, 0, 0, 0);
    assert.strictEqual(d[0], 'XRA A', 'Instruction decoded OK');
    assert.strictEqual(d[1], 1, 'Instruction length OK');
  });
});

describe('Single step', () => {
  beforeEach(() => {
    CPU8080.init(null, () => 0);
    CPU8080.reset();
  });

  test('NOP, just NOPs', () => {
    CPU8080.steps(1);
    assert.strictEqual(CPU8080.status().pc, 0x0001, 'NOP OK');
    assert.strictEqual(CPU8080.T(), 4, 'Timing OK');
  });

  test('RST7', () => {
    CPU8080.init(() => {}, () => 0xff);
    CPU8080.steps(1);
    assert.strictEqual(CPU8080.status().pc, 0x0038, 'RST7 OK');
    assert.strictEqual(CPU8080.T(), 11, 'Timing OK');
  });
});

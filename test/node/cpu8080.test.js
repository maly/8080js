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

  // Issue #1: RESET must not clear general-purpose registers (Intel 8080).
  test('Reset preserves A,B,C,D,E,H,L and SP; clears PC, flags, IE', () => {
    CPU8080.init(() => {}, () => 0xfb); // EI at every address
    CPU8080.set('A', 0x11);
    CPU8080.set('B', 0x22);
    CPU8080.set('C', 0x33);
    CPU8080.set('D', 0x44);
    CPU8080.set('E', 0x55);
    CPU8080.set('H', 0x66);
    CPU8080.set('L', 0x77);
    CPU8080.set('SP', 0xabcd);
    CPU8080.set('F', 0xd5); // SZ... with bit1 clear — reset forces f=2
    CPU8080.set('PC', 0);
    CPU8080.steps(1); // EI -> inte=1
    // Prove interrupts were enabled before reset
    CPU8080.interrupt(0x38);
    assert.strictEqual(CPU8080.status().pc, 0x38, 'IE enabled before reset');
    CPU8080.set('PC', 0x1234);
    CPU8080.set('A', 0x11); // restore A in case interrupt path touched stack only
    CPU8080.set('B', 0x22);
    CPU8080.set('C', 0x33);
    CPU8080.set('D', 0x44);
    CPU8080.set('E', 0x55);
    CPU8080.set('H', 0x66);
    CPU8080.set('L', 0x77);
    CPU8080.set('SP', 0xabcd);
    CPU8080.set('F', 0xd5);

    CPU8080.reset();

    const s = CPU8080.status();
    assert.strictEqual(s.pc, 0, 'PC cleared');
    assert.strictEqual(s.f, 2, 'Flags reset to 0x02');
    assert.strictEqual(CPU8080.T(), 0, 'T counter cleared');
    assert.strictEqual(s.a, 0x11, 'A preserved');
    assert.strictEqual(s.b, 0x22, 'B preserved');
    assert.strictEqual(s.c, 0x33, 'C preserved');
    assert.strictEqual(s.d, 0x44, 'D preserved');
    assert.strictEqual(s.e, 0x55, 'E preserved');
    assert.strictEqual(s.h, 0x66, 'H preserved');
    assert.strictEqual(s.l, 0x77, 'L preserved');
    assert.strictEqual(s.sp, 0xabcd, 'SP preserved');

    // Interrupt enable cleared: pending IRQ must not redirect PC
    CPU8080.interrupt(0x38);
    assert.strictEqual(CPU8080.status().pc, 0, 'IE disabled after reset');
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

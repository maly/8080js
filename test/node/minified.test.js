'use strict';

// Issue #15: 8080.min.js must keep the same interrupt / EI / DI semantics as 8080.js.
const { test, describe, beforeEach } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

// Load only the minified file, in its own context (as a browser <script> would).
const src = fs.readFileSync(path.join(__dirname, '..', '..', '8080.min.js'), 'utf8');
const sandbox = {};
vm.runInNewContext(src, sandbox);
const CPU = sandbox.CPU8080;

describe('8080.min.js interrupts', () => {
  let mem;
  const load = (bytes, at = 0) => { bytes.forEach((b, i) => { mem[at + i] = b; }); };
  beforeEach(() => {
    mem = new Uint8Array(65536);
    CPU.init((a, v) => { mem[a] = v; }, (a) => mem[a]);
    CPU.set('SP', 0x8000);
  });

  test('minified source no longer has the pre-#13 interrupt code', () => {
    assert.ok(!src.includes('u||56'), 'old vector fallback is gone');
  });

  test('accepted after EI + one instruction, costs 11 T-states, clears INTE', () => {
    load([0xfb, 0x00, 0x00]); // EI; NOP; NOP
    CPU.steps(1);
    CPU.steps(1);
    const t0 = CPU.T();
    CPU.interrupt(0x38);
    assert.strictEqual(CPU.status().pc, 0x38, 'jumped to vector');
    assert.strictEqual(CPU.T() - t0, 11, '11 T-states charged');
    CPU.interrupt(0x30);
    assert.strictEqual(CPU.status().pc, 0x38, 'second request ignored (INTE cleared)');
  });

  test('second interrupt ignored until EI + one more instruction', () => {
    load([0xfb, 0x00]);
    load([0xfb, 0x00, 0xc9], 0x38); // handler: EI; NOP; RET
    CPU.steps(1);
    CPU.steps(1);
    CPU.interrupt(0x38);
    CPU.steps(1); // EI in handler
    CPU.interrupt(0x30);
    assert.strictEqual(CPU.status().pc, 0x39, 'still ignored directly after EI');
    CPU.steps(1); // NOP -> enabled
    CPU.interrupt(0x30);
    assert.strictEqual(CPU.status().pc, 0x30, 'accepted after EI + one instruction');
  });

  test('interrupt() right after EI is ignored (EI is delayed)', () => {
    load([0xfb, 0xc9]); // EI; RET
    CPU.steps(1);
    CPU.interrupt(0x38);
    assert.strictEqual(CPU.status().pc, 0x0001, 'not accepted before the next instruction');
    assert.strictEqual(CPU.status().sp, 0x8000, 'nothing pushed');
  });

  test('DI cancels a pending EI', () => {
    load([0xfb, 0xf3, 0x00, 0x00]); // EI; DI; NOP; NOP
    CPU.steps(1); // EI
    CPU.steps(1); // DI
    CPU.steps(1); // NOP
    CPU.interrupt(0x38);
    assert.strictEqual(CPU.status().pc, 0x0003, 'interrupt ignored');
  });

  test('interrupt(0) jumps to 0x0000 and default vector is 0x38', () => {
    mem[0x100] = 0xfb;
    CPU.set('PC', 0x100);
    CPU.steps(1);
    CPU.steps(1);
    CPU.interrupt(0);
    assert.strictEqual(CPU.status().pc, 0x0000, 'RST 0 vector');
    mem[0] = 0xfb;
    CPU.steps(1);
    CPU.steps(1);
    CPU.interrupt();
    assert.strictEqual(CPU.status().pc, 0x0038, 'default vector');
  });
});
